import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationIcon = () => {
  const { unreadCount, fetchUnreadCount } = useNotifications();
  
  // Fetch unread count on component mount
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);
  
  return (
    <Link to="/notifications" className="relative p-1 rounded-full text-gray-500 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
      <span className="sr-only">View notifications</span>
      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
        />
      </svg>
      
      {/* Badge showing unread count - only show if unreadCount is a valid number > 0 */}
      {typeof unreadCount === 'number' && unreadCount > 0 && (
        <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationIcon;