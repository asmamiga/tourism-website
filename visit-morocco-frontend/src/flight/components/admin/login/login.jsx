import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import axiosApi from '../../../api/axios';
import { Plane } from 'lucide-react';
import './login.css'; // Renamed CSS file

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
   
    if (!credentials.email || !credentials.password) {
      setError('Please enter both email and password');
      return;
    }
    try {
      const data = await axiosApi.post('/auth/login', credentials);
     
      if (data && data.token) {
        localStorage.setItem('token', data.token);
        // Clear lastAdminPath to ensure we go to dashboard
        localStorage.removeItem('lastAdminPath'); 
        onLogin();
        navigate('/admin/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      console.error('Login error details:', err);
      
      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else if (err.response?.status === 404) {
        setError('Login service not found. Please check the API URL.');
      } else if (!err.response) {
        setError('Network error. Please check your connection.');
      } else {
        setError(err.response?.data?.message || 'An error occurred during login');
      }
    }
  };

  return (
    <div className="auth-login-page">
      <div className="auth-login-container">
        <div className="auth-login-box">
          <div className="auth-login-header">
            <div className="auth-icon-container">
              <Plane className="auth-plane-icon" />
            </div>
            <h1>Welcome Back Admin</h1>
            <p>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label>Email</label>
              <div className="auth-input-wrapper">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={credentials.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label>Password</label>
              <div className="auth-input-wrapper">
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {error && <div className="auth-error-message">{error}</div>}
            
            <button type="submit" className="auth-sign-in-button">
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

Login.propTypes = {
  onLogin: PropTypes.func.isRequired
};

export default Login;