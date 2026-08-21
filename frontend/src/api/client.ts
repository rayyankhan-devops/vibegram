import axios, { AxiosError } from 'axios';
import { ApiErrorResponse } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Access Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vibegram_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Extract meaningful error message
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.data?.error) {
      const err = error.response.data.error;
      return Promise.reject(new Error(err.message || 'An error occurred'));
    }
    if (error.response?.status === 401) {
      // Clear token on 401 unauthorized
      localStorage.removeItem('vibegram_token');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
