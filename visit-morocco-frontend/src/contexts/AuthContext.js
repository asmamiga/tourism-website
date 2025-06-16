import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Get base URL from environment or use default
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Clean up the base URL
  const cleanBaseUrl = (url) => {
    // Remove trailing slashes
    let cleanUrl = url.replace(/\/+$/, '');
    // Ensure it starts with http
    if (!cleanUrl.startsWith('http')) {
      cleanUrl = `http://${cleanUrl}`;
    }
    return cleanUrl;
  };
  
  // Set up axios defaults
  const apiBaseUrl = cleanBaseUrl(BASE_URL);
  axios.defaults.withCredentials = true; // Important for sessions/cookies
  axios.defaults.baseURL = apiBaseUrl;
  
  // Set default headers
  axios.defaults.headers.common['Accept'] = 'application/json';
  axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  
  // Set auth token if it exists
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  useEffect(() => {
    // Check for user in localStorage on initial load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user data', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Use direct URL construction to ensure proper path
      const response = await axios.post('/api/login', { email, password });
      
      if (response.data && response.data.token) {
        // The backend returns the authenticated user data and token
        const { token, user: userData } = response.data;
        
        // Store token in localStorage and set default auth header
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Store user data
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(error.response.data.message || 'Login failed');
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server. Please try again later.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(error.message || 'Login failed');
      }
    }
  };

  const logout = () => {
    // Remove token and user data
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/register', userData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true
      });
      
      if (response.data) {
        // Automatically log in the user after successful registration
        // The backend returns the user data and token in the response
        const { user: userData, token } = response.data;
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(error.response.data.message || 'Registration failed');
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server. Please try again later.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(error.message || 'Registration failed');
      }
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
