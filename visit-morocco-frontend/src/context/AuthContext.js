import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in (token exists in localStorage)
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      setLoading(true);
      // Set the authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch user profile from backend
      console.log('Fetching user profile...');
      const response = await axios.get('http://localhost:8000/api/profile');
      console.log('Profile API response:', response.data);
      
      if (response.data) {
        // Extract user data from the response
        const responseData = response.data;
        const userFromResponse = responseData.user || responseData;
        
        // Determine the role - check both root level and nested user object
        let role = 'tourist';
        if (responseData.role) {
          role = responseData.role;
        } else if (userFromResponse.role) {
          role = userFromResponse.role;
        } else if (userFromResponse.user_type) {
          role = userFromResponse.user_type;
        }
        
        // Normalize the role
        role = String(role).toLowerCase().trim();
        
        // If the email contains 'owner' or 'business', set role to business_owner
        if (userFromResponse.email && (userFromResponse.email.includes('owner') || userFromResponse.email.includes('business'))) {
          role = 'business_owner';
        }
        
        // Create normalized user data
        const userData = {
          ...userFromResponse,
          role: role
        };
        
        console.log('Normalized user data:', userData);
        setUser(userData);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // If token is invalid or expired, remove it
      localStorage.removeItem('token');
      axios.defaults.headers.common['Authorization'] = '';
      setError('Session expired. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('http://localhost:8000/api/login', {
        email,
        password
      });
      
      if (response.data && response.data.token) {
        // Save token to localStorage
        localStorage.setItem('token', response.data.token);
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Fetch user profile
        await fetchUserProfile(response.data.token);
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to login. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Sending registration request with data:', JSON.stringify(userData, null, 2));
      
      const response = await axios.post('http://localhost:8000/api/register', userData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Registration response:', response.data);
      
      if (response.data && response.data.token) {
        // Save token to localStorage
        localStorage.setItem('token', response.data.token);
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Fetch user profile
        await fetchUserProfile(response.data.token);
        
        return true;
      }
      
      console.error('No token in response:', response.data);
      return false;
    } catch (err) {
      console.error('Registration error:', err);
      console.log('Full error response:', err.response?.data);
      
      let errorMessage = 'Failed to register. Please try again.';
      
      // Handle validation errors
      if (err.response?.data?.errors) {
        console.log('Validation errors:', err.response.data.errors);
        const errors = err.response.data.errors;
        errorMessage = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove authorization header
    axios.defaults.headers.common['Authorization'] = '';
    
    // Clear user state
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.put('http://localhost:8000/api/profile', profileData);
      
      if (response.data) {
        setUser(response.data);
        return true;
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
