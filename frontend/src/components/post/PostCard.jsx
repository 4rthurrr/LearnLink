import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toggleLike } from '../../api/postApi';
import { formatDistanceToNow } from 'date-fns';

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(post.isLikedByCurrentUser);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLike = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const response = await toggleLike(post.id);
      // Use the values from the response instead of assuming the toggle happened
      setLiked(response.liked);
      setLikesCount(response.likesCount);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderMedia = () => {
    if (!post.media || post.media.length === 0) return null;

    // Show the first media item
    const media = post.media[0];
    if (media.type === 'IMAGE') {
      return (
        <div className="mt-4">
          <img 
            src={media.fileUrl} 
            alt="Post media" 
            className="rounded-lg object-cover w-full max-h-96" 
          />
          {post.media.length > 1 && (
            <div className="mt-1 text-sm text-gray-500">
              +{post.media.length - 1} more {post.media.length === 2 ? 'file' : 'files'}
            </div>
          )}
        </div>
      );
    } else if (media.type === 'VIDEO') {
      return (
        <div className="mt-4">
          <video 
            src={media.fileUrl} 
            className="rounded-lg w-full max-h-96" 
            controls
          />
          {post.media.length > 1 && (
            <div className="mt-1 text-sm text-gray-500">
              +{post.media.length - 1} more {post.media.length === 2 ? 'file' : 'files'}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const renderProgress = () => {
    if (post.learningProgressPercent === null || post.learningProgressPercent === undefined) return null;
    
    return (
      <div className="mt-4">
        <div className="flex items-center">
          <div className="text-sm font-medium text-gray-700 mr-2">Learning Progress:</div>
          <div className="text-sm font-bold text-indigo-600">{post.learningProgressPercent}%</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
          <div 
            className="bg-indigo-600 h-2.5 rounded-full" 
            style={{ width: `${post.learningProgressPercent}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'some time ago';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
      {/* Post header */}
      <div className="p-5 pb-3 border-b border-gray-100">
        <div className="flex items-center">
          <Link to={`/profile/${post.author.id}`} className="flex-shrink-0">
            <img 
              className="h-10 w-10 rounded-full" 
              src={post.author.profilePicture || "https://via.placeholder.com/150"} 
              alt={post.author.name} 
            />
          </Link>
          <div className="ml-3">
            <Link to={`/profile/${post.author.id}`} className="text-sm font-medium text-gray-900 hover:underline">
              {post.author.name}
            </Link>
            <p className="text-xs text-gray-500">
              {formatDate(post.createdAt)}
              {post.category && ` · ${post.category.toLowerCase()}`}
            </p>
          </div>
        </div>
      </div>

      {/* Post content */}
      <div className="p-5">
        <Link to={`/post/${post.id}`} className="block">
          <h3 className="text-lg font-medium text-gray-900 hover:text-indigo-600">
            {post.title}
          </h3>
          <p className="mt-2 text-gray-600 line-clamp-3">{post.content}</p>
        </Link>
        
        {renderMedia()}
        {renderProgress()}

        {/* Post actions */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex space-x-4">
            <button 
              onClick={handleLike}
              disabled={isProcessing}
              className={`flex items-center space-x-1 text-sm ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:text-indigo-600'} ${liked ? 'text-red-500' : 'text-gray-500'}`}
            >
              <svg 
                className={`h-5 w-5 ${liked ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20"
                fill={liked ? "currentColor" : "none"}
                stroke="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
            </button>

            <Link 
              to={`/post/${post.id}`} 
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-indigo-600"
            >
              <svg 
                className="h-5 w-5 text-gray-400" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="none" 
                stroke="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span>{post.commentsCount || 0} {post.commentsCount === 1 ? 'comment' : 'comments'}</span>
            </Link>
          </div>

          <Link 
            to={`/post/${post.id}`} 
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            View details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
