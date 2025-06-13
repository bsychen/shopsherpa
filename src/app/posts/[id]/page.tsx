"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MessageCircle, Send, Link as LinkIcon, Search, X } from "lucide-react";
import { Post, Comment } from "@/types/post";
import { Product } from "@/types/product";
import PostCard from "@/components/PostCard";
import CommentItem from "@/components/CommentItem";
import { colours } from "@/styles/colours";

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
  const [commentProducts, setCommentProducts] = useState<Product[]>([]);
  const [selectedCommentProduct, setSelectedCommentProduct] = useState<Product | null>(null);
  const [showCommentProductSearch, setShowCommentProductSearch] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

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

  const fetchPost = useCallback(async () => {
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
  }, [postId]);

  const fetchComments = useCallback(async () => {
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
  }, [postId]);

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments();
    }
  }, [postId, fetchPost, fetchComments]);

  useEffect(() => {
    if (commentProductSearch.length > 2) {
      searchProducts(commentProductSearch);
    } else {
      setCommentProducts([]);
    }
  }, [commentProductSearch]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colours.background.secondary }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: colours.spinner.border }}></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colours.background.secondary }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2" style={{ color: colours.text.primary }}>Post not found</h1>
          <p className="mb-4" style={{ color: colours.text.secondary }}>The post you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/chats"
            className="font-medium hover:underline"
            style={{ color: colours.text.link }}
          >
            Back to Community
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colours.background.secondary }}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/chats" 
            className="flex items-center hover:underline mb-4"
            style={{ color: colours.text.link }}
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
        <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: colours.card.background, border: `1px solid ${colours.card.border}` }}>
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle size={20} style={{ color: colours.text.secondary }} />
            <h2 className="text-xl font-bold" style={{ color: colours.text.primary }}>
              Comments ({comments.length})
            </h2>
          </div>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: colours.tag.default.background }}>
                    <span className="font-medium text-sm" style={{ color: colours.tag.default.text }}>
                      {(user.displayName || user.email || '').charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg resize-none"
                    style={{
                      border: `1px solid ${colours.card.border}`,
                      backgroundColor: colours.input.background,
                      color: colours.input.text
                    }}
                    rows={3}
                    placeholder="Share your thoughts..."
                    maxLength={500}
                  />
                  
                  {/* Product Linking for Comments */}
                  <div className="mt-2">
                    {selectedCommentProduct && (
                      <div className="flex items-center gap-2 p-2 rounded mb-2" style={{ backgroundColor: colours.tag.default.background, border: `1px solid ${colours.tag.default.border}` }}>
                        <Image
                          src={selectedCommentProduct.imageUrl}
                          alt={selectedCommentProduct.productName}
                          width={24}
                          height={24}
                          className="object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-medium" style={{ color: colours.tag.default.text }}>{selectedCommentProduct.productName}</p>
                          <p className="text-xs" style={{ color: colours.text.secondary }}>{selectedCommentProduct.brandName}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedCommentProduct(null)}
                          className="hover:opacity-70"
                          style={{ color: colours.text.secondary }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    {showCommentProductSearch && !selectedCommentProduct && (
                      <div className="relative mb-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2" size={14} style={{ color: colours.text.muted }} />
                          <input
                            type="text"
                            value={commentProductSearch}
                            onChange={(e) => setCommentProductSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-sm rounded"
                            style={{
                              border: `1px solid ${colours.card.border}`,
                              backgroundColor: colours.input.background,
                              color: colours.input.text
                            }}
                            placeholder="Search for a product..."
                          />
                        </div>
                        {commentProducts.length > 0 && (
                          <div className="absolute top-full left-0 right-0 rounded mt-1 max-h-32 overflow-y-auto z-10 shadow-lg" style={{ backgroundColor: colours.card.background, border: `1px solid ${colours.card.border}` }}>
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
                                <Image
                                  src={product.imageUrl}
                                  alt={product.productName}
                                  width={24}
                                  height={24}
                                  className="object-cover rounded"
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
                      <span className="text-xs" style={{ color: colours.text.muted }}>
                        {newComment.length}/500 characters
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowCommentProductSearch(!showCommentProductSearch)}
                        className="flex items-center gap-1 text-xs hover:underline"
                        style={{ color: colours.text.link }}
                      >
                        <LinkIcon size={12} />
                        {showCommentProductSearch ? 'Hide' : 'Link Product'}
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={!newComment.trim() || submittingComment}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      style={{
                        backgroundColor: colours.button.primary.background,
                        color: colours.button.primary.text
                      }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = colours.button.primary.hover.background;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = colours.button.primary.background;
                        }
                      }}
                    >
                      <Send size={16} />
                      {submittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-6 p-4 rounded-lg text-center" style={{ backgroundColor: colours.background.secondary }}>
              <p className="mb-2" style={{ color: colours.text.secondary }}>Sign in to join the conversation</p>
              <Link
                href="/auth"
                className="font-medium hover:underline"
                style={{ color: colours.text.link }}
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Comments List */}
          {loadingComments ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: colours.spinner.border }}></div>
              <p className="mt-2" style={{ color: colours.text.secondary }}>Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle size={48} className="mx-auto mb-3" style={{ color: colours.text.muted }} />
              <p style={{ color: colours.text.secondary }}>No comments yet. Be the first to share your thoughts!</p>
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
