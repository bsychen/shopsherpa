"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Send, Link as LinkIcon, Search, X } from "lucide-react";
import { Post, Comment } from "@/types/post";
import PostCard from "@/components/PostCard";
import CommentItem from "@/components/CommentItem";

export default function PostPage() {
  const params = useParams();
  const postId = params.id as string;
  
  const [user, setUser] = useState(null);
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentProductSearch, setCommentProductSearch] = useState('');
  const [commentProducts, setCommentProducts] = useState<any[]>([]);
  const [selectedCommentProduct, setSelectedCommentProduct] = useState<any>(null);
  const [showCommentProductSearch, setShowCommentProductSearch] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments();
    }
  }, [postId]);

  useEffect(() => {
    if (commentProductSearch.length > 2) {
      searchProducts(commentProductSearch);
    } else {
      setCommentProducts([]);
    }
  }, [commentProductSearch]);

  const searchProducts = async (term: string) => {
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(term)}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        setCommentProducts(data);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim(),
          authorId: user.uid,
          authorName: user.displayName || user.email,
          linkedProductId: selectedCommentProduct?.id,
        }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments([...comments, newCommentData]);
        setNewComment("");
        setSelectedCommentProduct(null);
        setCommentProductSearch('');
        setShowCommentProductSearch(false);
        // Update post comment count
        if (post) {
          setPost({
            ...post,
            commentCount: post.commentCount + 1,
          });
        }
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCommentAction = async (commentId: string, action: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          userId: user.uid,
        }),
      });

      if (response.ok) {
        // Refresh comments to get updated like/dislike counts
        fetchComments();
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleCommentLike = (commentId: string, action: 'like' | 'unlike') => {
    handleCommentAction(commentId, action);
  };

  const handleCommentDislike = (commentId: string, action: 'dislike' | 'undislike') => {
    handleCommentAction(commentId, action);
  };

  const handlePostAction = async (postId: string, action: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          userId: user.uid,
        }),
      });

      if (response.ok) {
        // Refresh post to get updated like/dislike counts
        fetchPost();
      }
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleLike = (postId: string, action: 'like' | 'unlike') => {
    handlePostAction(postId, action);
  };

  const handleDislike = (postId: string, action: 'dislike' | 'undislike') => {
    handlePostAction(postId, action);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h1>
          <p className="text-gray-600 mb-4">The post you're looking for doesn't exist.</p>
          <Link
            href="/chats"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Community
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/chats" 
            className="flex items-center text-blue-600 hover:underline mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span className="font-semibold">Back to Community</span>
          </Link>
        </div>

        {/* Post */}
        <div className="mb-8">
          <PostCard
            post={post}
            currentUserId={user?.uid}
            onLike={handleLike}
            onDislike={handleDislike}
            showFullContent={true}
          />
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle size={20} className="text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Comments ({comments.length})
            </h2>
          </div>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {(user.displayName || user.email || '').charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    placeholder="Share your thoughts..."
                    maxLength={500}
                  />
                  
                  {/* Product Linking for Comments */}
                  <div className="mt-2">
                    {selectedCommentProduct && (
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200 mb-2">
                        <img
                          src={selectedCommentProduct.imageUrl}
                          alt={selectedCommentProduct.productName}
                          className="w-6 h-6 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-blue-800">{selectedCommentProduct.productName}</p>
                          <p className="text-xs text-blue-600">{selectedCommentProduct.brandName}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedCommentProduct(null)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    {showCommentProductSearch && !selectedCommentProduct && (
                      <div className="relative mb-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                          <input
                            type="text"
                            value={commentProductSearch}
                            onChange={(e) => setCommentProductSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Search for a product..."
                          />
                        </div>
                        {commentProducts.length > 0 && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded mt-1 max-h-32 overflow-y-auto z-10 shadow-lg">
                            {commentProducts.map((product) => (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() => {
                                  setSelectedCommentProduct(product);
                                  setCommentProductSearch('');
                                  setCommentProducts([]);
                                }}
                                className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 text-left"
                              >
                                <img
                                  src={product.imageUrl}
                                  alt={product.productName}
                                  className="w-6 h-6 object-cover rounded"
                                />
                                <div>
                                  <p className="text-xs font-medium">{product.productName}</p>
                                  <p className="text-xs text-gray-600">{product.brandName}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {newComment.length}/500 characters
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowCommentProductSearch(!showCommentProductSearch)}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-xs"
                      >
                        <LinkIcon size={12} />
                        {showCommentProductSearch ? 'Hide' : 'Link Product'}
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={!newComment.trim() || submittingComment}
                      className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send size={16} />
                      {submittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600 mb-2">Sign in to join the conversation</p>
              <Link
                href="/auth"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Comments List */}
          {loadingComments ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-600">No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={user?.uid}
                  onLike={handleCommentLike}
                  onDislike={handleCommentDislike}
                  depth={0}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
