import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPostById, toggleLike, getComments, addComment, updateComment, deleteComment } from '../api/postApi';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import Comment from '../components/post/Comment';

const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPostDetails = useCallback(async () => {
    setLoading(true);
    try {
      const postData = await getPostById(postId);
      setPost(postData);
      setLiked(postData.isLikedByCurrentUser);
      setLikesCount(postData.likesCount);

      const commentsData = await getComments(postId);
      setComments(commentsData.content || []);
    } catch (error) {
      console.error('Error fetching post details:', error);
      setError('Failed to load post. It may have been deleted or you may not have permission to view it.');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPostDetails();
  }, [fetchPostDetails]);

  const handleLike = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const response = await toggleLike(postId);
      // Use the values from the response
      setLiked(response.liked);
      setLikesCount(response.likesCount);
    } catch (error) {
      console.error('Error toggling like:', error);
      setError('Failed to process like action. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const commentData = await addComment(postId, { content: newComment });
      setComments([commentData, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentUpdate = (updatedComment) => {
    setComments(comments.map(comment => 
      comment.id === updatedComment.id ? updatedComment : comment
    ));
  };

  const handleCommentDelete = (commentId) => {
    setComments(comments.filter(comment => comment.id !== commentId));
  };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'some time ago';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || "Post not found"}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-indigo-600 hover:text-indigo-800"
        >
          ← Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Post Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        {/* Post header */}
        <div className="p-6 pb-4 border-b border-gray-100">
          <div className="flex justify-between items-start">
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
            
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Post content */}
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          <div className="prose max-w-none text-gray-700 whitespace-pre-line">
            {post.content}
          </div>

          {/* Media display */}
          {post.media && post.media.length > 0 && (
            <div className="mt-6 space-y-4">
              {post.media.map((media, index) => (
                <div key={index}>
                  {media.type === 'IMAGE' ? (
                    <img 
                      src={media.fileUrl} 
                      alt={`Post media ${index + 1}`} 
                      className="rounded-lg max-h-96 max-w-full mx-auto" 
                    />
                  ) : media.type === 'VIDEO' ? (
                    <video 
                      src={media.fileUrl} 
                      controls
                      className="rounded-lg max-h-96 max-w-full mx-auto"
                    />
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {/* Learning Progress */}
          {post.learningProgressPercent !== null && post.learningProgressPercent !== undefined && (
            <div className="mt-6">
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
          )}

          {/* Post actions */}
          <div className="mt-6 flex items-center space-x-4 border-t border-b border-gray-100 py-3">
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

            <div 
              className="flex items-center space-x-1 text-sm text-gray-500"
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
              <span>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comment Form */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Add a Comment</h2>
          <form onSubmit={handleCommentSubmit}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows="3"
              required
            />
            <div className="mt-3 text-right">
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Comments List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Comments</h2>
          
          {comments.length === 0 ? (
            <p className="text-gray-500">Be the first to comment on this post!</p>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <Comment 
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUser?.id}
                  postAuthorId={post.author.id}
                  onCommentUpdate={handleCommentUpdate}
                  onCommentDelete={handleCommentDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
