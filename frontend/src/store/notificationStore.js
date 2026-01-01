import { create } from 'zustand';
import { notificationsAPI } from '../services/api';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async (unreadOnly = false) => {
    set({ isLoading: true });
    try {
      const response = await notificationsAPI.getAll({ unread_only: unreadOnly });
      set({
        notifications: response.data.notifications,
        unreadCount: response.data.unread_count,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  markAsRead: async (id) => {
    await notificationsAPI.markAsRead(id);
    const { notifications, unreadCount } = get();
    set({
      notifications: notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
      unreadCount: Math.max(0, unreadCount - 1),
    });
  },

  markAllAsRead: async () => {
    await notificationsAPI.markAllAsRead();
    const { notifications } = get();
    set({
      notifications: notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    });
  },

  deleteNotification: async (id) => {
    await notificationsAPI.delete(id);
    const { notifications, unreadCount } = get();
    const notification = notifications.find((n) => n.id === id);
    set({
      notifications: notifications.filter((n) => n.id !== id),
      unreadCount: notification?.is_read ? unreadCount : Math.max(0, unreadCount - 1),
    });
  },

  sendNotification: async (data) => {
    const response = await notificationsAPI.create(data);
    return response.data.notification;
  },

  broadcastNotification: async (data) => {
    const response = await notificationsAPI.broadcast(data);
    return response.data;
  },
}));

export default useNotificationStore;
