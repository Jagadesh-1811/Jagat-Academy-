import axios from 'axios';
import { auth } from '../../utils/Firebase';
import { store } from '../redux/store';
import { setToken } from '../redux/userSlice';

const serverUrl = 'http://localhost:8000';

// Flag to prevent multiple token refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  isRefreshing = false;
  failedQueue = [];
};

// Initialize axios interceptors globally
const initializeAxiosInterceptors = () => {
  // Request interceptor to add token to headers
  axios.interceptors.request.use(
    (config) => {
      const state = store.getState();
      const token = state.user.token;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token expiration
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If error is 401 and we haven't already retried this request
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Queue this request to retry after refresh
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axios(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const currentUser = auth.currentUser;
          
          if (currentUser) {
            // Force refresh the Firebase token
            const newToken = await currentUser.getIdToken(true);
            
            // Update Redux store
            store.dispatch(setToken(newToken));
            localStorage.setItem('token', newToken);
            
            console.log('✅ Token refreshed after 401 error');
            
            // Process queued requests
            processQueue(null, newToken);
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          } else {
            // No user logged in
            processQueue(new Error('User not authenticated'), null);
            return Promise.reject(error);
          }
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError.message);
          
          // Token refresh failed - user needs to re-login
          processQueue(refreshError, null);
          
          // Clear local storage and Redux
          localStorage.removeItem('token');
          store.dispatch(setToken(null));
          
          // Optionally redirect to login
          // window.location.href = '/login';
          
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

// Initialize on import
initializeAxiosInterceptors();

export default axios;

