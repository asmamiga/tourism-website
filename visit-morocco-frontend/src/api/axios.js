import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    // Don't add auth header for auth endpoints
    const isAuthEndpoint = ['/login', '/register', '/forgot-password'].some(endpoint => 
      config.url?.endsWith(endpoint)
    );
    
    if (!isAuthEndpoint) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Handle successful responses
    if (response.data && response.data.token) {
      // If the response contains a token, save it
      localStorage.setItem('token', response.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Handle validation errors specifically (422)
      if (error.response.status === 422) {
        const errors = error.response.data.errors || {};
        let message = 'Validation failed';
        
        // Get all validation error messages
        const errorMessages = Object.values(errors).flat();
        if (errorMessages.length > 0) {
          message = errorMessages[0]; // Return the first error message
        }
        
        const errorMessage = error.response.data?.message || 
                             error.response.statusText || 
                             'An error occurred';
      
        return Promise.reject({
          status: error.response.status,
          message: errorMessage,
          data: error.response.data
        });
      }
      
      // Handle unauthorized (401) errors
      if (error.response.status === 401) {
        // Clear any existing auth data
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject({
          status: 401,
          message: 'Your session has expired. Please log in again.',
          redirect: true
        });
      }

      const message = error.response.data && error.response.data.message 
        ? error.response.data.message 
        : error.response.statusText;
      
      // Handle common error cases
      if (error.response.status === 401) {
        // Handle unauthorized access (token expired or invalid)
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      console.error(`Error: ${error.response.status} - ${message}`);
      return Promise.reject({
        status: error.response.status,
        message: message,
        data: error.response.data
      });
    } else if (error.request) {
      console.error("No response received from server");
      return Promise.reject({
        status: 0,
        message: "No response received from server"
      });
    } else {
      console.error("Request setup error:", error.message);
      return Promise.reject({
        status: 0,
        message: error.message
      });
    }
  }
);

export default api;
