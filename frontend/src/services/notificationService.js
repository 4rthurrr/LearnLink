import api from './api';

class NotificationService {
    constructor() {
        this.listeners = [];
    }

    getNotifications(page = 0, size = 10) {
        return api.get(`/notifications?page=${page}&size=${size}`);
    }

    markAsRead(id) {
        return api.put(`/notifications/${id}/read`);
    }

    markAllAsRead() {
        return api.put('/notifications/read-all');
    }

    // Simplified mock WebSocket functionality
    connect(userId) {
        console.log('WebSocket connection simulated for user:', userId);
        this.connected = true;
    }

    disconnect() {
        console.log('WebSocket disconnection simulated');
        this.connected = false;
    }

    addNotificationListener(listener) {
        this.listeners.push(listener);
    }

    removeNotificationListener(listener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    notifyListeners(notification) {
        this.listeners.forEach(listener => listener(notification));
    }
}

export default new NotificationService();
