import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the notifications context
const NotificationsContext = createContext();

// Initial notifications data that will be shared across all pages
const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: 'success',
    title: 'Sistema Activo',
    message: 'El sistema de reglas de negocio está funcionando correctamente',
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    read: false
  },
  {
    id: 2,
    type: 'info',
    title: 'IA Conectada',
    message: 'Gemini AI está listo para generar reglas',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    read: false
  },
  {
    id: 3,
    type: 'success',
    title: 'Base de Datos',
    message: 'Conexión establecida exitosamente',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    read: false
  }
];

// Provider component
export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    // Load notifications from localStorage on initialization
    const stored = localStorage.getItem('globalNotifications');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        return parsed.map(notification => ({
          ...notification,
          timestamp: new Date(notification.timestamp)
        }));
      } catch (error) {
        console.error('Error parsing stored notifications:', error);
        return INITIAL_NOTIFICATIONS;
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Save to localStorage whenever notifications change
  useEffect(() => {
    localStorage.setItem('globalNotifications', JSON.stringify(notifications));
  }, [notifications]);

  // Mark a notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Add a new notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(), // Simple ID generation
      timestamp: new Date(),
      read: false,
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Remove a notification
  const removeNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    setNotifications
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

// Hook to use notifications context
export const useGlobalNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useGlobalNotifications must be used within a NotificationsProvider');
  }
  return context;
};