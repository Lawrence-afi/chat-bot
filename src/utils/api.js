import axios from 'axios';
import useAuthStore from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://whisperbox.koyeb.app",
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().access_token;
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 (Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Attempt to refresh the token
      const success = await useAuthStore.getState().refreshAccessToken();
      
      if (success) {
        // Token refreshed successfully, update authorization header
        const newToken = useAuthStore.getState().access_token;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        // Retry the original request
        return api(originalRequest);
      }
      // If refresh fails, it automatically logs out via the store method
    }
    
    return Promise.reject(error);
  }
);

export default api;
