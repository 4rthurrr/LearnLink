import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { updateComment, deleteComment } from '../../api/postApi';

const Comment = ({ comment, currentUserId, postAuthorId, onCommentUpdate, onCommentDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  const isOwnComment = currentUserId === comment.user.id;
  const isPostAuthor = currentUserId === postAuthorId;
  const canModifyComment = isOwnComment || isPostAuthor;
  
  // Close menu when clicking outside
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
  
  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'some time ago';
    }
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const updatedComment = await updateComment(comment.id, { content: editContent });
      onCommentUpdate(updatedComment);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating comment:', error);
      setError('Failed to update comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteClick = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setIsSubmitting(true);
      try {
        await deleteComment(comment.id);
        onCommentDelete(comment.id);
      } catch (error) {
        console.error('Error deleting comment:', error);
        setError('Failed to delete comment. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  if (isEditing) {
    return (
      <div className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
        <div className="flex">
          <Link to={`/profile/${comment.user.id}`} className="flex-shrink-0">
            <img 
              className="h-10 w-10 rounded-full" 
              src={comment.user.profilePicture || "https://via.placeholder.com/150"} 
              alt={comment.user.name} 
            />
          </Link>
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <Link to={`/profile/${comment.user.id}`} className="text-sm font-medium text-gray-900 hover:underline">
                {comment.user.name}
              </Link>
              <span className="text-xs text-gray-500">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <form onSubmit={handleEditSubmit} className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows="3"
                required
              />
              {error && <p className="mt-1 text-red-600 text-xs">{error}</p>}
              <div className="mt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !editContent.trim()}
                  className="px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
      <div className="flex">
        <Link to={`/profile/${comment.user.id}`} className="flex-shrink-0">
          <img 
            className="h-10 w-10 rounded-full" 
            src={comment.user.profilePicture || "https://via.placeholder.com/150"} 
            alt={comment.user.name} 
          />
        </Link>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <Link to={`/profile/${comment.user.id}`} className="text-sm font-medium text-gray-900 hover:underline">
              {comment.user.name}
            </Link>
            <div className="flex items-center">
              <span className="text-xs text-gray-500 mr-2">
                {formatDate(comment.createdAt)}
              </span>
              {canModifyComment && (
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    disabled={isSubmitting}
                    title="Comment options"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                  
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setMenuOpen(false);
                        }}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        disabled={isSubmitting}
                      >
                        <span className="flex items-center">
                          <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Edit
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteClick();
                          setMenuOpen(false);
                        }}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        disabled={isSubmitting}
                      >
                        <span className="flex items-center">
                          <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Delete
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {error && <p className="mt-1 text-red-600 text-xs">{error}</p>}
          <p className="mt-1 text-gray-700">{comment.content}</p>
        </div>
      </div>
    </div>
  );
};

export default Comment;