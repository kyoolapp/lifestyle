import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface InAppNotification {
  id: string;
  type: 'water' | 'goal' | 'friend' | 'general';
  title: string;
  message: string;
  timestamp: Date;
  icon?: React.ReactNode;
  color?: string;
  read?: boolean;
}

interface NotificationContextType {
  notifications: InAppNotification[];
  addNotification: (notification: Omit<InAppNotification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  getUnreadCount: () => number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);

  const addNotification = (notificationData: Omit<InAppNotification, 'id' | 'timestamp'>) => {
    const newNotification: InAppNotification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep only last 50 notifications
    console.log('🔔 Notification added:', newNotification);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      markAsRead,
      clearAllNotifications,
      getUnreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}