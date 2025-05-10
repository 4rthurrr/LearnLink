import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toggleLike, deletePost } from '../../api/postApi';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

const PostCard = ({ post, onPostDelete }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post?.isLikedByCurrentUser || false);
  const [likesCount, setLikesCount] = useState(post?.likesCount || 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  if (!post) {
    return null;
  }

  const isOwnPost = currentUser?.id === post.author.id;

  const handleLike = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const response = await toggleLike(post.id);
      setLiked(response.liked);
      setLikesCount(response.likesCount);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = () => {
    try {
      // Ensure we're using a valid ID format
      const numericPostId = Number(post.id);
      
      if (isNaN(numericPostId)) {
        throw new Error(`Invalid post ID format: ${post.id}`);
      }
      
      console.log(`Navigating to edit post with ID: ${numericPostId}`);
      navigate(`/edit-post/${numericPostId}`);
    } catch (error) {
      console.error('Error handling edit navigation:', error);
      alert(`Failed to navigate to edit page: ${error.message}`);
    }
    setMenuOpen(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        setIsProcessing(true);
        
        // Ensure we're using a valid ID format
        const numericPostId = Number(post.id);
        
        if (isNaN(numericPostId)) {
          throw new Error(`Invalid post ID format: ${post.id}`);
        }
        
        console.log(`Attempting to delete post with ID: ${numericPostId}`);
        console.log('Post object:', post);
        
        // Call the API to delete the post
        await deletePost(numericPostId);
        
        console.log(`Post ${numericPostId} successfully deleted`);
        
        // Notify parent component about the deletion
        if (onPostDelete) {
          onPostDelete(numericPostId);
        } else {
          console.warn('No onPostDelete callback provided');
        }
        
        // Show success message
        alert('Post deleted successfully!');
      } catch (error) {
        console.error('Error deleting post:', error);
        console.error('Error message:', error.message);
        
        if (error.response) {
          console.error('Server response:', error.response.data);
          console.error('Status code:', error.response.status);
        }
        
        alert(`Failed to delete post: ${error.message || 'Unknown error occurred'}`);
      } finally {
        setIsProcessing(false);
        setMenuOpen(false);
      }
    } else {
      // User cancelled the deletion
      setMenuOpen(false);
    }
  };

  const renderMedia = () => {
    if (!post.media || post.media.length === 0) return null;

    return (
      <div className="mt-4">
        <div className={`grid ${post.media.length === 1 ? 'grid-cols-1' : 
                             post.media.length === 2 ? 'grid-cols-2' :
                             post.media.length === 3 ? 'grid-cols-3' :
                             post.media.length === 4 ? 'grid-cols-2 grid-rows-2' :
                             'grid-cols-3 grid-rows-2'} gap-2`}>
          {post.media.slice(0, 6).map((media, index) => {
            if (media.type === 'IMAGE') {
              return (
                <div key={index} className={`${(post.media.length === 3 && index === 0) || (post.media.length >= 5 && index === 0) ? 'col-span-2 row-span-2' : ''} relative rounded-lg overflow-hidden`}>
                  <img 
                    src={media.fileUrl} 
                    alt={`Post media ${index + 1}`} 
                    className="h-full w-full object-cover aspect-square"
                  />
                </div>
              );
            } else if (media.type === 'VIDEO') {
              return (
                <div key={index} className={`${(post.media.length === 3 && index === 0) || (post.media.length >= 5 && index === 0) ? 'col-span-2 row-span-2' : ''} relative rounded-lg overflow-hidden`}>
                  <video 
                    src={media.fileUrl} 
                    className="h-full w-full object-cover aspect-square" 
                    controls
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs p-1 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 inline-block mr-1">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Video
                  </div>
                </div>
              );
            }
            return null;
          })}
          
          {post.media.length > 6 && (
            <div className="relative rounded-lg overflow-hidden bg-gray-200">
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white font-medium">
                +{post.media.length - 6} more
              </div>
              <img 
                src={post.media[6].fileUrl} 
                alt="Additional media" 
                className="h-full w-full object-cover opacity-60 aspect-square"
              />
            </div>
          )}
        </div>
      </div>
    );
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

          <div className="flex items-center space-x-2">
            <Link 
              to={`/post/${post.id}`} 
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              View details
            </Link>

            {isOwnPost && (
              <div className="flex items-center">
                <button 
                  onClick={handleEdit}
                  className="ml-2 px-2 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md flex items-center"
                  disabled={isProcessing}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-4 w-4 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button 
                  onClick={handleDelete}
                  className="ml-2 px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center"
                  disabled={isProcessing}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-4 w-4 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
