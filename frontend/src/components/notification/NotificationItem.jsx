import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationItem = ({ notification }) => {
  const { markAsRead } = useNotifications();
  
  // Handle marking notification as read when clicked
  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };
  
  // Format relative time (e.g., "2 hours ago")
  const formatTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'some time ago';
    }
  };
  
  // Determine URL based on notification type and entity
  const getNotificationUrl = () => {
    switch(notification.entityType) {
      case 'post':
        return `/post/${notification.entityId}`;
      case 'comment':
        return `/post/${notification.entityId}`;
      case 'user':
        return `/profile/${notification.entityId}`;
      case 'learning-plan':
        return `/learning-plan/${notification.entityId}`;
      default:
        return '#';
    }
  };
  
  // Choose icon based on notification type
  const renderIcon = () => {
    switch(notification.type) {
      case 'LIKE':
        return (
          <div className="flex-shrink-0 rounded-full p-2 bg-red-100 text-red-600">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'COMMENT':
        return (
          <div className="flex-shrink-0 rounded-full p-2 bg-blue-100 text-blue-600">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'FOLLOW':
        return (
          <div className="flex-shrink-0 rounded-full p-2 bg-green-100 text-green-600">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
          </div>
        );
      case 'MENTION':
        return (
          <div className="flex-shrink-0 rounded-full p-2 bg-purple-100 text-purple-600">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'LEARNING_PLAN_SHARE':
        return (
          <div className="flex-shrink-0 rounded-full p-2 bg-indigo-100 text-indigo-600">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 rounded-full p-2 bg-gray-100 text-gray-600">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };
  
  return (
    <Link 
      to={getNotificationUrl()} 
      className={`block px-4 py-3 border-b border-gray-200 hover:bg-gray-50 ${notification.isRead ? '' : 'bg-indigo-50'}`}
      onClick={handleClick}
    >
      <div className="flex items-start">
        {/* Icon */}
        {renderIcon()}
        
        <div className="ml-3 flex-1">
          {/* Actor info if present */}
          {notification.actor && (
            <div className="flex items-center mb-1">
              <img 
                src={notification.actor.profilePicture || 'https://via.placeholder.com/150'} 
                alt={notification.actor.name}
                className="h-5 w-5 rounded-full mr-1" 
              />
              <span className="text-sm font-medium text-gray-900">{notification.actor.name}</span>
            </div>
          )}
          
          {/* Message */}
          <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
            {notification.message}
          </p>
          
          {/* Time */}
          <p className="text-xs text-gray-500 mt-1">
            {formatTime(notification.createdAt)}
          </p>
        </div>
        
        {/* Unread indicator */}
        {!notification.isRead && (
          <span className="ml-2 bg-indigo-600 h-2 w-2 rounded-full"></span>
        )}
      </div>
    </Link>
  );
};

export default NotificationItem;