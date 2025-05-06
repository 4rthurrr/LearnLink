import React, { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationItem from '../components/notification/NotificationItem';

const NotificationsPage = () => {
  const { 
    notifications, 
    loading, 
    error, 
    fetchNotifications, 
    markAllAsRead 
  } = useNotifications();
  
  const [filterUnread, setFilterUnread] = useState(false);
  
  // Fetch notifications when the page loads or filter changes
  useEffect(() => {
    fetchNotifications(filterUnread);
  }, [fetchNotifications, filterUnread]);
  
  // Handle marking all notifications as read
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };
  
  // Toggle between all notifications and unread only
  const toggleFilter = () => {
    setFilterUnread(!filterUnread);
  };
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          <div className="flex space-x-2">
            <button
              onClick={toggleFilter}
              className={`px-3 py-1 text-sm rounded-md ${
                filterUnread 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterUnread ? 'Showing Unread' : 'Show All'}
            </button>
            <button
              onClick={handleMarkAllAsRead}
              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Mark All as Read
            </button>
          </div>
        </div>
        
        {/* Notifications list */}
        <div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {notifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                />
              </svg>
              <p className="mt-2 text-gray-500">
                {filterUnread 
                  ? "You don't have any unread notifications" 
                  : "You don't have any notifications yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;