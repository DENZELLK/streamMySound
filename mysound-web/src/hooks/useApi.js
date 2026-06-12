import { useState, useCallback } from 'react';
import { auth } from '../firebase';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const callApi = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    
    // Clear old errors (keep only from last 30 seconds)
    setErrors(prev => prev.filter(error => error.timestamp > Date.now() - 30000));

    try {
      const token = await auth.currentUser?.getIdToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      };

      if (process.env.NODE_ENV === 'development') {
        console.log(`API Call: ${endpoint}`);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        // Try to get error message from response body
        let errorMessage = `API Error: ${res.status}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = res.statusText || errorMessage;
        }
        
        const error = new Error(errorMessage);
        error.status = res.status;
        throw error;
      }

      const data = await res.json();
      
      // Clear errors for this endpoint on success
      setErrors(prev => prev.filter(error => error.endpoint !== endpoint));

      return data;

    } catch (error) {
      // Enhanced error handling
      const enhancedError = enhanceError(error, endpoint);
      
      console.error('API call failed:', {
        endpoint,
        error: enhancedError.message,
        status: enhancedError.status,
        type: enhancedError.type
      });

      // Add to errors state - NO RETRY, just show the error
      const newError = {
        ...enhancedError,
        endpoint,
        timestamp: Date.now()
      };
      
      setErrors(prev => [...prev, newError]);

      throw enhancedError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear specific errors
  const clearError = useCallback((endpoint) => {
    setErrors(prev => prev.filter(error => error.endpoint !== endpoint));
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Get errors for specific endpoint
  const getErrorsForEndpoint = useCallback((endpoint) => {
    return errors.filter(error => error.endpoint === endpoint);
  }, [errors]);

  return { 
    callApi, 
    loading, 
    errors,
    clearError,
    clearAllErrors,
    getErrorsForEndpoint
  };
};

// Enhanced error classification
const enhanceError = (error, endpoint) => {
  let enhancedError = {
    ...error,
    endpoint,
    type: 'unknown',
    isTransient: false,
    message: error.message || 'An unexpected error occurred'
  };

  // Network errors
  if (error.name === 'AbortError') {
    enhancedError.type = 'timeout';
    enhancedError.message = 'Request timed out. Please check your connection.';
  } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('ERR_INSUFFICIENT_RESOURCES')) {
    enhancedError.type = 'network';
    enhancedError.message = 'Network connection failed. Please check your internet connection.';
  }
  // HTTP status based errors
  else if (error.status) {
    if (error.status >= 500) {
      enhancedError.type = 'server_error';
      enhancedError.message = 'Server is temporarily unavailable. Please try again later.';
    } else if (error.status === 429) {
      enhancedError.type = 'rate_limit';
      enhancedError.message = 'Too many requests. Please wait a moment.';
    } else if (error.status === 401 || error.status === 403) {
      enhancedError.type = 'auth_error';
      enhancedError.message = 'Authentication failed. Please sign in again.';
    } else if (error.status === 404) {
      enhancedError.type = 'not_found';
      enhancedError.message = 'Requested resource not found.';
    } else if (error.status === 408) {
      enhancedError.type = 'timeout';
      enhancedError.message = 'Request timed out. Please try again.';
    } else if (error.status === 409) {
      enhancedError.type = 'conflict';
      enhancedError.message = 'Resource already exists.';
    } else if (error.status >= 400 && error.status < 500) {
      enhancedError.type = 'client_error';
      enhancedError.message = error.message || 'Invalid request. Please check your input.';
    }
  }

  return enhancedError;
};

// Utility function for common API patterns
export const createApiHelpers = (callApi) => {
  return {
    get: (endpoint, options = {}) => callApi(endpoint, { method: 'GET', ...options }),
    post: (endpoint, data, options = {}) => 
      callApi(endpoint, { 
        method: 'POST', 
        body: JSON.stringify(data),
        ...options 
      }),
    delete: (endpoint, options = {}) => 
      callApi(endpoint, { 
        method: 'DELETE', 
        ...options 
      }),
  };
};

// Simple music API hook - NO RETRIES
export const useMusicApi = () => {
  const { callApi, loading, errors, clearError } = useApi();
  const helpers = createApiHelpers(callApi);

  const makeApiCall = async (apiCall, endpoint) => {
    try {
      clearError(endpoint);
      return await apiCall();
    } catch (error) {
      // Auto-clear error after 10 seconds
      setTimeout(() => clearError(endpoint), 10000);
      throw error;
    }
  };

  return {
    searchMusic: (query) => 
      makeApiCall(() => helpers.get(`/api/searchMusic?q=${encodeURIComponent(query)}`), '/api/searchMusic'),
    getUserLibrary: () => 
      makeApiCall(() => helpers.get('/api/getUserLibrary'), '/api/getUserLibrary'),
    saveSongToLibrary: (song) => 
      makeApiCall(() => helpers.post('/api/saveSongToLibrary', { song }), '/api/saveSongToLibrary'),
    removeSongFromLibrary: (songId) => 
      makeApiCall(() => helpers.delete('/api/removeSongFromLibrary', { 
        body: JSON.stringify({ songId }) 
      }), '/api/removeSongFromLibrary'),
    loading,
    errors: errors.filter(error => 
      error.endpoint && error.endpoint.startsWith('/api/')
    ),
    clearError
  };
};