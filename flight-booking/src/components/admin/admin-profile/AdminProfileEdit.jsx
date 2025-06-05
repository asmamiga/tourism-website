import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Edit, UserPlus, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import axiosApi from '../../../api/axios';
import './AdminProfileEdit.css';
import Loading from '../loading/Loading';

const AdminProfileEdit = () => {
    const navigate = useNavigate();
    const [showEditForm, setShowEditForm] = useState(false);
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
        register: false,
        registerConfirm: false
    });
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [newAdmin, setNewAdmin] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });

    const [passwordStrength, setPasswordStrength] = useState('');

    const fetchAdminProfile = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/admin/login');
                return;
            }
            
            const response = await axiosApi.get('/admin/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response && response && response.admin) {
                setProfileData(prev => ({
                    ...prev,
                    name: response.admin.name || '',
                    email: response.admin.email || ''
                }));
            }
            setLoading(false);
        } catch (err) {
            setError('Failed to load profile data');
            setLoading(false);
            console.error('Error fetching profile:', err);
            if (err.response?.status === 401) {
                navigate('/admin/login');
            }
        }
    }, [navigate]);

    useEffect(() => {
        fetchAdminProfile();
    }, [fetchAdminProfile]);

    const checkPasswordStrength = (password) => {
        if (!password) return '';
        if (password.length < 6) {
            return 'weak';
        } else if (password.length < 10) {
            return 'normal';
        } else if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/)) {
            return 'strong';
        }
        return 'normal';
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'newPassword') {
            setPasswordStrength(checkPasswordStrength(value));
        }
    };

    const handleNewAdminChange = (e) => {
        const { name, value } = e.target;
        setNewAdmin(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'password') {
            setPasswordStrength(checkPasswordStrength(value));
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Always require current password for any profile updates for security
        if (!profileData.currentPassword) {
            setError('Current password is required');
            return;
        }

        // Additional validation for password change
        if (profileData.newPassword) {
            if (profileData.newPassword !== profileData.confirmPassword) {
                setError('New passwords do not match');
                return;
            }
        }

        try {
            const token = localStorage.getItem('token');
            
            // Prepare update data
            const updateData = {
                name: profileData.name,
                email: profileData.email,
                current_password: profileData.currentPassword
            };
            
            // Only include password fields if admin is changing password
            if (profileData.newPassword) {
                updateData.password = profileData.newPassword;
                updateData.password_confirmation = profileData.confirmPassword;
            }
            
            const response = await axiosApi.put('/admin/update', updateData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            setShowEditForm(false);
            setStatus('success');
            setTimeout(() => setStatus(''), 3000);
            fetchAdminProfile();
            setProfileData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update profile';
            setError(errorMessage);
            console.error('Error updating profile:', err);
        }
    };

    const handleRegisterAdmin = async (e) => {
        e.preventDefault();
        setError('');

        if (newAdmin.password !== newAdmin.password_confirmation) {
            setError('Passwords do not match');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axiosApi.post('/admins', {
                name: newAdmin.name,
                email: newAdmin.email,
                password: newAdmin.password,
                password_confirmation: newAdmin.password_confirmation
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setShowRegisterForm(false);
            setStatus('success');
            setTimeout(() => setStatus(''), 3000);
            setNewAdmin({
                name: '',
                email: '',
                password: '',
                password_confirmation: ''
            });
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register new admin');
            console.error('Error registering admin:', err);
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="adm-profile-edit__container">
            {status === 'success' && (
                <div className="adm-profile-edit__success-message">
                    <CheckCircle className="adm-profile-edit__success-icon" />
                    <h3 className="adm-profile-edit__success-title">Operation Successful</h3>
                    <p className="adm-profile-edit__success-description">Your changes have been saved successfully.</p>
                </div>
            )}

            <div className="adm-profile-edit__header">
                <h2>Admin Profile</h2>
            </div>
            
            {error && (
                <div className="adm-profile-edit__error-message">
                    <AlertTriangle size={20} />
                    {error}
                </div>
            )}

            <div className="adm-profile-edit__info">
                <div className="adm-profile-edit__info-group">
                    <label>Name:</label>
                    <span>{profileData.name}</span>
                </div>
                <div className="adm-profile-edit__info-group">
                    <label>Email:</label>
                    <span>{profileData.email}</span>
                </div>
                <div className="adm-profile-edit__button-group">
                    <button 
                        className="adm-profile-edit__edit-btn"
                        onClick={() => {
                            setShowEditForm(!showEditForm);
                            if (showRegisterForm) setShowRegisterForm(false);
                        }}
                    >
                        <Edit className="adm-profile-edit__button-icon" size={18} />
                        {showEditForm ? 'Cancel Edit' : 'Edit Profile'}
                    </button>
                    <button 
                        className="adm-profile-edit__register-btn"
                        onClick={() => {
                            setShowRegisterForm(!showRegisterForm);
                            if (showEditForm) setShowEditForm(false);
                        }}
                    >
                        <UserPlus className="adm-profile-edit__button-icon" size={18} />
                        {showRegisterForm ? 'Cancel Registration' : 'Register New Admin'}
                    </button>
                </div>
            </div>

            {showEditForm && (
                <form onSubmit={handleProfileSubmit} className="adm-profile-edit__form">
                    <h3>Edit Profile</h3>
                    <div className="adm-profile-edit__form-group">
                        <label>Name:</label>
                        <div className="adm-profile-edit__input-wrapper">
                            <input
                                type="text"
                                name="name"
                                value={profileData.name}
                                onChange={handleProfileChange}
                                required
                                className="adm-profile-edit__input"
                            />
                        </div>
                    </div>

                    <div className="adm-profile-edit__form-group">
                        <label>Email:</label>
                        <div className="adm-profile-edit__input-wrapper">
                            <input
                                type="email"
                                name="email"
                                value={profileData.email}
                                onChange={handleProfileChange}
                                required
                                className="adm-profile-edit__input"
                            />
                        </div>
                    </div>

                    <div className="adm-profile-edit__form-group">
                        <label>Current Password: <span className="adm-profile-edit__required">*</span></label>
                        <div className="adm-profile-edit__input-wrapper">
                            <input
                                type={showPassword.current ? "text" : "password"}
                                name="currentPassword"
                                value={profileData.currentPassword}
                                onChange={handleProfileChange}
                                required
                                className="adm-profile-edit__input"
                                placeholder="Enter your current password to make changes"
                            />
                            <button 
                                type="button" 
                                className="adm-profile-edit__password-toggle"
                                onClick={() => togglePasswordVisibility('current')}
                            >
                                {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <small className="adm-profile-edit__help-text">Required for any profile changes</small>
                    </div>

                    <div className="adm-profile-edit__password-section">
                        <h4>Change Password (Optional)</h4>
                        
                        <div className="adm-profile-edit__form-group">
                            <label>New Password:</label>
                            <div className="adm-profile-edit__input-wrapper">
                                <input
                                    type={showPassword.new ? "text" : "password"}
                                    name="newPassword"
                                    value={profileData.newPassword}
                                    onChange={handleProfileChange}
                                    className="adm-profile-edit__input"
                                    placeholder="Leave blank to keep current password"
                                />
                                <button 
                                    type="button" 
                                    className="adm-profile-edit__password-toggle"
                                    onClick={() => togglePasswordVisibility('new')}
                                >
                                    {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {profileData.newPassword && (
                                <>
                                    <div className="adm-profile-edit__password-meter">
                                        <div className={`adm-profile-edit__password-meter-fill adm-profile-edit__password-meter-fill--${passwordStrength}`}></div>
                                    </div>
                                    <div className={`adm-profile-edit__password-strength adm-profile-edit__password-strength--${passwordStrength}`}>
                                        Password Strength: {passwordStrength}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="adm-profile-edit__form-group">
                            <label>Confirm New Password:</label>
                            <div className="adm-profile-edit__input-wrapper">
                                <input
                                    type={showPassword.confirm ? "text" : "password"}
                                    name="confirmPassword"
                                    value={profileData.confirmPassword}
                                    onChange={handleProfileChange}
                                    className="adm-profile-edit__input"
                                    placeholder="Leave blank to keep current password"
                                />
                                <button 
                                    type="button" 
                                    className="adm-profile-edit__password-toggle"
                                    onClick={() => togglePasswordVisibility('confirm')}
                                >
                                    {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="adm-profile-edit__submit-btn">
                        Update Profile
                    </button>
                </form>
            )}

            {showRegisterForm && (
                <form onSubmit={handleRegisterAdmin} className="adm-profile-edit__form">
                    <h3>Register New Admin</h3>
                    <div className="adm-profile-edit__form-group">
                        <label>Name:</label>
                        <div className="adm-profile-edit__input-wrapper">
                            <input
                                type="text"
                                name="name"
                                value={newAdmin.name}
                                onChange={handleNewAdminChange}
                                required
                                className="adm-profile-edit__input"
                            />
                        </div>
                    </div>

                    <div className="adm-profile-edit__form-group">
                        <label>Email:</label>
                        <div className="adm-profile-edit__input-wrapper">
                            <input
                                type="email"
                                name="email"
                                value={newAdmin.email}
                                onChange={handleNewAdminChange}
                                required
                                className="adm-profile-edit__input"
                            />
                        </div>
                    </div>

                    <div className="adm-profile-edit__form-group">
                        <label>Password:</label>
                        <div className="adm-profile-edit__input-wrapper">
                            <input
                                type={showPassword.register ? "text" : "password"}
                                name="password"
                                value={newAdmin.password}
                                onChange={handleNewAdminChange}
                                required
                                className="adm-profile-edit__input"
                            />
                            <button 
                                type="button" 
                                className="adm-profile-edit__password-toggle"
                                onClick={() => togglePasswordVisibility('register')}
                            >
                                {showPassword.register ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {newAdmin.password && (
                            <>
                                <div className="adm-profile-edit__password-meter">
                                    <div className={`adm-profile-edit__password-meter-fill adm-profile-edit__password-meter-fill--${passwordStrength}`}></div>
                                </div>
                                <div className={`adm-profile-edit__password-strength adm-profile-edit__password-strength--${passwordStrength}`}>
                                    Password Strength: {passwordStrength}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="adm-profile-edit__form-group">
                        <label>Confirm Password:</label>
                        <div className="adm-profile-edit__input-wrapper">
                            <input
                                type={showPassword.registerConfirm ? "text" : "password"}
                                name="password_confirmation"
                                value={newAdmin.password_confirmation}
                                onChange={handleNewAdminChange}
                                required
                                className="adm-profile-edit__input"
                            />
                            <button 
                                type="button" 
                                className="adm-profile-edit__password-toggle"
                                onClick={() => togglePasswordVisibility('registerConfirm')}
                            >
                                {showPassword.registerConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="adm-profile-edit__submit-btn">
                        Register Admin
                    </button>
                </form>
            )}
        </div>
    );
};

export default AdminProfileEdit;