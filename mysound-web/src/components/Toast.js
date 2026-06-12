import React from 'react';

const Toast = ({ toast }) => {
  if (!toast.show) return null;
  
  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl border ${
      toast.type === 'success' 
        ? 'bg-green-500/10 border-green-500/30 text-green-400' 
        : 'bg-red-500/10 border-red-500/30 text-red-400'
    } transition-all duration-300`}>
      {toast.message}
    </div>
  );
};

export default Toast;