import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosApi from '../../../../api/axios';
import '../../styles/EditCommonStyle.css';
    
const EditPromoCode = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'percentage',
        discount: 0,
        valid_until: '',
        is_used: false,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper function to format date without timezone shift
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Fetch promo code data
    const fetchPromoCode = useCallback(async () => {
        try {
            const response = await axiosApi.get(`/promo-codes/${id}`);
            const promoData = response.data.data || response.data;

            console.log('Original valid_until:', promoData.valid_until);
            const formattedDate = formatDateForInput(promoData.valid_until);
            console.log('Formatted date:', formattedDate);

            setFormData({
                code: promoData.code || '',
                discount_type: promoData.discount_type || 'percentage',
                discount: promoData.discount || 0,
                valid_until: formattedDate,
                is_used: Boolean(promoData.is_used),
            });

            setLoading(false);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to fetch promo code: ' + (err.response?.data?.message || err.message));
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchPromoCode();
    }, [fetchPromoCode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Create a copy of formData for submission
            const submissionData = {
                ...formData,
                valid_until: formData.valid_until // The date is already in YYYY-MM-DD format
            };

            await axiosApi.put(`/promo-codes/${id}`, submissionData);
            navigate('/admin/promo-codes');
        } catch (err) {
            console.error('Update error:', err);
            setError(err.response?.data?.message || 'Failed to update promo code');
            setLoading(false);
        }
    };

    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="edit-component-container">
            <div className="edit-component-header">
                <h3>Edit Promo Code</h3>
                <button 
                    onClick={() => navigate('/admin/promo-codes')} 
                    className="close-button"
                >
                    ✕
                </button>
            </div>
            <form onSubmit={handleSubmit} className="edit-component-form">
                {error && <div className="error-message">{error}</div>}
                
                <div className="form-group">
                    <label>Code</label>
                    <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Discount Type</label>
                    <select
                        name="discount_type"
                        value={formData.discount_type}
                        onChange={handleChange}
                        required
                    >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Discount</label>
                    <input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Valid Until</label>
                    <input
                        type="date"
                        name="valid_until"
                        value={formData.valid_until}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="switch">
                        <input
                            type="checkbox"
                            name="is_used"
                            checked={formData.is_used}
                            onChange={handleChange}
                        />
                        <span className="slider round"></span>
                    </label>
                    <span className="switch-label">Is Used</span>
                </div>

                <div className="form-actions">
                    <button 
                        type="button" 
                        onClick={() => navigate('/admin/promo-codes')} 
                        className="cancel-button"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="submit-button"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditPromoCode;