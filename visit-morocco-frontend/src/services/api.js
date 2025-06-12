import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
  logout: () => api.post('/logout'),
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
};

// Business services
export const businessService = {
  getAll: (params) => api.get('/businesses', { params }),
  getById: (id) => api.get(`/businesses/${id}`),
  create: (data) => api.post('/businesses', data),
  update: (id, data) => api.put(`/businesses/${id}`, data),
  delete: (id) => api.delete(`/businesses/${id}`),
  addPhoto: (id, photoData) => {
    const formData = new FormData();
    formData.append('photo', photoData);
    return api.post(`/businesses/${id}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deletePhoto: (businessId, photoId) => api.delete(`/businesses/${businessId}/photos/${photoId}`),
};

// Guide services
export const guideService = {
  /**
   * Get all guides with optional filtering and pagination
   * @param {Object} params - Query parameters
   * @param {string} params.letter - First letter of guide's name to filter by
   * @param {string} params.search - Search term for guide name or bio
   * @param {string} params.city_id - Filter by city ID
   * @param {string} params.language_id - Filter by language ID
   * @param {number} params.min_rating - Minimum rating to filter by
   * @param {string} params.order_by - Field to order by (default: first_name)
   * @param {string} params.order_dir - Order direction (asc/desc, default: asc)
   * @param {number} params.per_page - Number of items per page
   * @param {number} params.page - Page number
   * @returns {Promise} Axios response
   */
  getAll: (params = {}) => {
    // Handle first letter filter
    if (params.letter) {
      return api.get('/guides', {
        params: {
          ...params,
          filter: {
            name: params.letter
          },
          order_by: 'first_name',
          order_dir: 'asc'
        }
      });
    }
    return api.get('/guides', { params });
  },
  
  getById: (id) => api.get(`/guides/${id}`),
  
  // Guide services management
  createService: (data) => api.post('/guide-services', data),
  updateService: (id, data) => api.put(`/guide-services/${id}`, data),
  deleteService: (id) => api.delete(`/guide-services/${id}`),
  
  // Availability management
  addAvailability: (data) => api.post('/guide-availability', data),
  updateAvailability: (id, data) => api.put(`/guide-availability/${id}`, data),
  deleteAvailability: (id) => api.delete(`/guide-availability/${id}`),
  
  // Get available time slots for a guide
  getAvailableSlots: (guideId, date) => 
    api.get(`/guides/${guideId}/availability`, { params: { date } }),
  
  // Get guide reviews
  getReviews: (guideId) => api.get(`/guides/${guideId}/reviews`),
  
  // Get guide services
  getServices: (guideId) => api.get(`/guides/${guideId}/services`)
};

// Attraction services
export const attractionService = {
  getAll: (params) => api.get('/attractions', { params }),
  getById: (id) => api.get(`/attractions/${id}`),
};

// Region and city services
export const regionService = {
  getAll: () => api.get('/regions'),
  getById: (id) => api.get(`/regions/${id}`),
};

export const cityService = {
  getAll: (params = {}) => {
    // Ensure we always get the region relationship
    return api.get('/cities', { 
      params: { 
        ...params,
        with: 'region' 
      } 
    });
  },
  getById: (id) => api.get(`/cities/${id}`),
  getByRegion: (regionId) => api.get(`/regions/${regionId}/cities`),
};

// Booking services
export const businessBookingService = {
  getAll: (params) => api.get('/business-bookings', { params }),
  getById: (id) => api.get(`/business-bookings/${id}`),
  create: (data) => api.post('/business-bookings', data),
  update: (id, data) => api.put(`/business-bookings/${id}`, data),
  delete: (id) => api.delete(`/business-bookings/${id}`),
};

export const guideBookingService = {
  getAll: (params) => api.get('/guide-bookings', { params }),
  getById: (id) => api.get(`/guide-bookings/${id}`),
  create: (data) => api.post('/guide-bookings', data),
  update: (id, data) => api.put(`/guide-bookings/${id}`, data),
  delete: (id) => api.delete(`/guide-bookings/${id}`),
};

// Review services
export const businessReviewService = {
  create: (data) => api.post('/business-reviews', data),
  update: (id, data) => api.put(`/business-reviews/${id}`, data),
  delete: (id) => api.delete(`/business-reviews/${id}`),
};

export const guideReviewService = {
  create: (data) => api.post('/guide-reviews', data),
  update: (id, data) => api.put(`/guide-reviews/${id}`, data),
  delete: (id) => api.delete(`/guide-reviews/${id}`),
};

// Itinerary services
export const itineraryService = {
  getAll: (params) => api.get('/itineraries', { params }),
  getById: (id) => api.get(`/itineraries/${id}`),
  create: (data) => api.post('/itineraries', data),
  update: (id, data) => api.put(`/itineraries/${id}`, data),
  delete: (id) => api.delete(`/itineraries/${id}`),
};

// Blog services
export const blogService = {
  getAll: (params) => api.get('/blog-posts', { params }),
  getById: (id) => api.get(`/blog-posts/${id}`),
};

export default api;
