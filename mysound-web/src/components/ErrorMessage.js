import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ error, onDismiss, onRetry }) => {
  const errorConfig = {
    service_unavailable: {
      message: 'Service is experiencing high demand. Showing sample data.',
      type: 'warning',
      retry: true,
    },
    auth_error: {
      message: 'Authentication issue. Please sign in again.',
      type: 'error',
      retry: false,
    },
    general_error: {
      message: 'Temporary connection issue. Please try again.',
      type: 'error',
      retry: true,
    },
    search_error: {
      message: 'Search temporarily unavailable. Please try again later.',
      type: 'warning',
      retry: true,
    }
  };

  const config = errorConfig[error] || errorConfig.general_error;

  useEffect(() => {
    if (config.retry) {
      const timer = setTimeout(() => onDismiss(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, config.retry, onDismiss]);

  if (!error) return null;

  return (
    <div className={`mb-6 p-4 rounded-2xl backdrop-blur-lg border ${
      config.type === 'error' ? 'bg-red-500/10 border-red-500/30' :
      'bg-yellow-500/10 border-yellow-500/30'
    }`}>
      <div className="flex items-center gap-3">
        <AlertCircle size={18} className={
          config.type === 'error' ? 'text-red-400' : 'text-yellow-400'
        } />
        <p className="text-sm flex-1 text-white/90">{config.message}</p>
        {config.retry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white/10 rounded-full hover:bg-white/20 transition-all duration-200 text-white/80"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;