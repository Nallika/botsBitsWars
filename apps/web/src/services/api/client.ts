import axios, { AxiosError, AxiosResponse } from 'axios';

import { ApiErrorResponse } from '@repo/shared-types/src';

const baseURL = `${process.env.NEXT_PUBLIC_API_HOST!}/api`;

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true, // This ensures cookies are sent with requests for authentication
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling and logging
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`
      );
    }

    // Transform axios errors to our ApiError format
    const message = getErrorMessage(error);

    throw new Error(message);
  }
);

// Helper function to extract user-friendly error messages
function getErrorMessage(error: AxiosError<ApiErrorResponse>): string {
  // Network or timeout errors
  if (!error.response) {
    if (error.code === 'ECONNREFUSED') {
      return 'Unable to connect to server. Please try again later.';
    }
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }
    return 'Network error. Please check your connection.';
  }

  // Server errors with custom message
  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  // Fallback based on status code
  switch (error.response.status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Authentication required. Please log in.';
    case 403:
      return 'Access denied.';
    case 404:
      return 'Requested resource not found.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}
