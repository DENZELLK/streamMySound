import React from 'react';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="w-12 h-12 border-4 border-purple-200/30 border-t-purple-500 rounded-full animate-spin"></div>
    <span className="ml-3 text-purple-200 font-medium">Loading...</span>
  </div>
);

export default LoadingSpinner;