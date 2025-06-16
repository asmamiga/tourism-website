import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:8000', // Full backend URL
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor to ensure consistent API paths
api.interceptors.request.use(config => {
  // Only modify the URL if it's a relative path
  if (config.url && config.url.startsWith('/')) {
    // Ensure the URL starts with /api
    if (!config.url.startsWith('/api/')) {
      config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
    }
  }
  return config;
});

// Add CORS headers to all responses
api.interceptors.response.use(
  (response) => {
    // Add CORS headers to successful responses
    if (response.headers) {
      response.headers['Access-Control-Allow-Origin'] = window.location.origin;
      response.headers['Access-Control-Allow-Credentials'] = 'true';
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
  getCategories: () => api.get('/business-categories'),
  create: async (data) => {
    // If data is FormData, don't set Content-Type header to let the browser set it with the correct boundary
    const isFormData = data instanceof FormData;
    const config = {
      headers: {},
      withCredentials: true
    };

    // Only set Content-Type for non-FormData requests
    if (!isFormData) {
      config.headers['Content-Type'] = 'application/json';
    }

    // Get CSRF token from cookies
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];

    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken);
    }

    return api.post('/businesses', data, config);
  },
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
  // Get all attractions with optional filtering and pagination
  getAll: (params = {}) => {
    // Default parameters
    const defaultParams = {
      per_page: 12,
      page: 1,
      include: 'city,region,photos',
    };
    
    // Merge default params with provided params
    const mergedParams = { ...defaultParams, ...params };
    
    return api.get('/attractions', { params: mergedParams });
  },
  
  // Get a single attraction by ID
  getById: (id) => {
    return api.get(`/attractions/${id}`, {
      params: {
        include: 'city,region,photos,reviews.user',
      },
    });
  },
  
  // Get attraction categories
  getCategories: () => api.get('/attraction-categories'),
  
  // Create a new attraction (admin only)
  create: (data) => {
    const formData = new FormData();
    
    // Append all fields to form data
    Object.keys(data).forEach(key => {
      if (key === 'photos' && Array.isArray(data[key])) {
        // Handle multiple photos
        data[key].forEach(photo => {
          if (photo instanceof File) {
            formData.append('photos[]', photo);
          }
        });
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    return api.post('/attractions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Update an attraction (admin only)
  update: (id, data) => {
    const formData = new FormData();
    
    // Append all fields to form data
    Object.keys(data).forEach(key => {
      if (key === 'photos' && Array.isArray(data[key])) {
        // Handle multiple photos
        data[key].forEach(photo => {
          if (photo instanceof File) {
            formData.append('photos[]', photo);
          } else if (photo && typeof photo === 'object') {
            formData.append('photos_attributes[]', JSON.stringify(photo));
          }
        });
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    return api.post(`/attractions/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        _method: 'PUT', // For Laravel to handle as PUT request
      },
    });
  },
  
  // Delete an attraction (admin only)
  delete: (id) => api.delete(`/attractions/${id}`),
  
  // Add a photo to an attraction
  addPhoto: (id, photoData) => {
    const formData = new FormData();
    formData.append('photo', photoData);
    
    return api.post(`/attractions/${id}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Delete a photo from an attraction
  deletePhoto: (attractionId, photoId) => {
    return api.delete(`/attractions/${attractionId}/photos/${photoId}`);
  },
  
  // Get reviews for an attraction
  getReviews: (attractionId, params = {}) => {
    return api.get(`/attractions/${attractionId}/reviews`, { params });
  },
  
  // Add a review to an attraction
  addReview: (attractionId, reviewData) => {
    return api.post(`/attractions/${attractionId}/reviews`, reviewData);
  },
  
  // Get nearby attractions
  getNearby: (attractionId, params = {}) => {
    return api.get(`/attractions/${attractionId}/nearby`, { params });
  },
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
