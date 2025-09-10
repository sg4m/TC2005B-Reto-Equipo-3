import { useState } from 'react';

export const useNotification = () => {
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success', // 'success', 'error', 'warning', 'info'
    duration: 3000
  });

  const showNotification = (message, type = 'success', duration = 3000) => {
    setNotification({
      show: true,
      message,
      type,
      duration
    });

    // Auto-hide notification
    setTimeout(() => {
      hideNotification();
    }, duration);
  };

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      show: false
    }));
  };

  const showSuccess = (message, duration = 3000) => {
    showNotification(message, 'success', duration);
  };

  const showError = (message, duration = 5000) => {
    showNotification(message, 'error', duration);
  };

  const showWarning = (message, duration = 4000) => {
    showNotification(message, 'warning', duration);
  };

  const showInfo = (message, duration = 3000) => {
    showNotification(message, 'info', duration);
  };

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
