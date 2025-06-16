import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Set auth token if it exists
  const token = localStorage.getItem('token');
  if (token) {
    // The api instance already handles the Authorization header in its interceptor
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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

  const login = async (credentials) => {
    try {
      console.log('Attempting login with credentials:', credentials);
      
      // Use direct fetch to ensure correct endpoint
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        })
      });

      console.log('Login response status:', response.status);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Invalid server response');
      }
      
      const data = await response.json();
      console.log('Login response data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      if (data && data.user) {
        // Extract token from the response
        const token = data.token || data.access_token;
        const user = data.user;
        
        if (!token) {
          throw new Error('No authentication token received');
        }
        
        // Set the token in localStorage
        localStorage.setItem('token', token);
        
        // The api instance already handles the Authorization header in its interceptor
        
        // Set the user in state
        setUser(user);
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        
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

  const logout = async () => {
    try {
      // Call the logout endpoint if needed
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Remove token and user data
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const register = async (userData) => {
    try {
      console.log('Sending registration data to /api/register:', userData);
      
      // Make a direct fetch request to ensure the correct URL is used
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      console.log('Registration response status:', response.status);
      console.log('Registration response data:', data);

      if (!response.ok) {
        // Handle validation errors
        if (response.status === 422 && data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          throw new Error(errorMessages.join(', '));
        }
        throw new Error(data.message || 'Registration failed');
      }

      // Handle successful registration
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // If there's a token, store it
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        
        return true;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        // Handle validation errors from Laravel
        if (error.response.status === 422 && error.response.data.errors) {
          const validationErrors = error.response.data.errors;
          const errorMessages = Object.values(validationErrors).flat();
          throw new Error(errorMessages.join(', '));
        }
        throw new Error(error.response.data.message || 'Registration failed');
      } else if (error.request) {
        throw new Error('No response from server. Please try again later.');
      } else {
        throw new Error(error.message || 'Registration failed');
      }
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated: !!user,
  };

  console.log('AuthContext value:', value); // Debug log

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
