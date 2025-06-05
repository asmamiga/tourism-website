import axios from "axios";

const axiosApi = axios.create({
    baseURL: "http://127.0.0.1:8000/api/cloud-tickets", // Base URL for all requests
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

// Add request interceptor for protected routes
axiosApi.interceptors.request.use(
    (config) => {
        const isProtectedRoute = config.url.includes('/admin');
        if (isProtectedRoute) {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        console.error("Request error:", error.message);
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
axiosApi.interceptors.response.use(
    (response) => response.data, // Unwrap the axios response to get the data
    (error) => {
      if (error.response) {
        const message = error.response.data && error.response.data.message 
          ? error.response.data.message 
          : "Unknown error";
        console.error(`Error: ${error.response.status} - ${message}`);
      } else if (error.request) {
        console.error("No response received from server");
      } else {
        console.error("Request setup error:", error.message);
      }
      return Promise.reject(error);
    }
  );

export default axiosApi;