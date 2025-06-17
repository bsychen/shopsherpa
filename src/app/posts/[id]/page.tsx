"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, doc, addDoc, serverTimestamp, updateDoc, increment, arrayUnion, arrayRemove } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseClient";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Send, Package, Search, X } from "lucide-react";
import { Post, Comment } from "@/types/post";
import { Product } from "@/types/product";
import PostCard from "@/components/PostCard";
import CommentItem from "@/components/CommentItem";
import ContentBox from "@/components/ContentBox";
import { colours } from "@/styles/colours";
import LoadingAnimation from "@/components/LoadingSpinner";
import { useTopBar } from "@/contexts/TopBarContext";

export default function PostPage() {
  const params = useParams();
  const { setTopBarState, resetTopBar } = useTopBar();
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
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [newlyAddedComments, setNewlyAddedComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Set up back button in top bar
  useEffect(() => {
    setTopBarState({
      showBackButton: true,
    });

    // Cleanup when component unmounts
    return () => {
      resetTopBar();
    };
  }, [setTopBarState, resetTopBar]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
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

  // Set up real-time listener for comments
  useEffect(() => {
    if (!postId) return;

    const commentsRef = collection(db, 'comments');
    // Note: We'll sort in JavaScript to avoid composite index requirements
    const commentsQuery = query(
      commentsRef,
      where('postId', '==', postId)
    );

    const unsubscribe = onSnapshot(commentsQuery, async (snapshot) => {
      setIsRealTimeActive(true);
      const commentsData = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          let linkedProduct = null;

          // Fetch linked product details if exists
          if (data.linkedProductId) {
            try {
              const response = await fetch(`/api/products/${data.linkedProductId}`);
              if (response.ok) {
                const productData = await response.json();
                linkedProduct = {
                  id: data.linkedProductId,
                  name: productData?.productName,
                  imageUrl: productData?.imageUrl,
                };
              }
            } catch (error) {
              console.error('Error fetching linked product:', error);
            }
          }

          return {
            id: docSnapshot.id,
            postId: data.postId,
            content: data.content,
            authorId: data.authorId,
            authorName: data.authorName,
            linkedProductId: data.linkedProductId,
            linkedProduct,
            likes: data.likes || [],
            dislikes: data.dislikes || [],
            parentCommentId: data.parentCommentId,
            createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
          } as Comment;
        })
      );

      // Sort comments by createdAt in JavaScript (newest first)
      commentsData.sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return bTime - aTime; // Changed from aTime - bTime to bTime - aTime for newest first
      });

      // Filter out optimistic updates and merge with real data
      setComments(prevComments => {
        const realComments = commentsData;
        
        // Get all real comment contents to match against optimistic ones
        const realCommentContents = new Set(realComments.map(c => c.content.trim()));
        
        // Keep only temp comments that don't have a matching real comment yet
        const tempComments = prevComments.filter(c => 
          c.id.startsWith('temp-') && !realCommentContents.has(c.content.trim())
        );
        
        // Detect new comments for animation (only real comments that weren't in previous state)
        const prevRealCommentIds = new Set(prevComments.filter(c => !c.id.startsWith('temp-')).map(c => c.id));
        const newCommentIds = realComments
          .filter(c => !prevRealCommentIds.has(c.id))
          .map(c => c.id);
        
        if (newCommentIds.length > 0) {
          setNewlyAddedComments(prev => new Set([...prev, ...newCommentIds]));
          // Remove animation class after animation duration
          setTimeout(() => {
            setNewlyAddedComments(prev => {
              const updated = new Set(prev);
              newCommentIds.forEach(id => updated.delete(id));
              return updated;
            });
          }, 1000); // Remove animation after 1 second
        }
        
        return [...realComments, ...tempComments];
      });
      setLoadingComments(false);
    }, (error) => {
      console.error('Error in comments listener:', error);
      setIsRealTimeActive(false);
      setLoadingComments(false);
      // Fallback to API call if real-time fails
      fetchComments();
    });

    return () => {
      setIsRealTimeActive(false);
      unsubscribe();
    };
  }, [postId, fetchComments]);

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId, fetchPost]);

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
    
    // Optimistic update - add comment immediately to UI
    const optimisticComment: Comment = {
      id: `temp-${Date.now()}`, // Temporary ID
      postId: postId,
      content: newComment.trim(),
      authorId: user.uid,
      authorName: user.displayName || user.email || 'Anonymous',
      linkedProductId: selectedCommentProduct?.id,
      linkedProduct: selectedCommentProduct ? {
        id: selectedCommentProduct.id,
        name: selectedCommentProduct.productName,
        imageUrl: selectedCommentProduct.imageUrl,
      } : undefined,
      likes: [],
      dislikes: [],
      parentCommentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add optimistic comment to UI
    setComments(prev => [...prev, optimisticComment]);

    // Clear form immediately
    const commentText = newComment.trim();
    const linkedProduct = selectedCommentProduct;
    setNewComment("");
    setSelectedCommentProduct(null);
    setCommentProductSearch('');
    setShowCommentProductSearch(false);

    try {
      // Add comment to Firestore
      const commentData = {
        postId: postId,
        content: commentText,
        authorId: user.uid,
        authorName: user.displayName || user.email,
        linkedProductId: linkedProduct?.id || null,
        parentCommentId: null,
        likes: [],
        dislikes: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'comments'), commentData);

      // Update post comment count
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        commentCount: increment(1),
      });

      // Update post state locally
      if (post) {
        setPost({
          ...post,
          commentCount: post.commentCount + 1,
        });
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      // Remove optimistic comment on error
      setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
      // Restore form values on error
      setNewComment(commentText);
      setSelectedCommentProduct(linkedProduct);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCommentAction = async (commentId: string, action: string) => {
    if (!user) return;

    try {
      const commentRef = doc(db, 'comments', commentId);
      
      switch (action) {
        case 'like':
          await updateDoc(commentRef, {
            likes: arrayUnion(user.uid),
            dislikes: arrayRemove(user.uid),
          });
          break;
        case 'dislike':
          await updateDoc(commentRef, {
            dislikes: arrayUnion(user.uid),
            likes: arrayRemove(user.uid),
          });
          break;
        case 'unlike':
          await updateDoc(commentRef, {
            likes: arrayRemove(user.uid),
          });
          break;
        case 'undislike':
          await updateDoc(commentRef, {
            dislikes: arrayRemove(user.uid),
          });
          break;
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
    return <LoadingAnimation />;
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colours.background.secondary }}>
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: colours.text.primary }}>Post not found</h1>
          <p className="mb-4 text-sm sm:text-base" style={{ color: colours.text.secondary }}>The post you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colours.background.secondary }}>
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Post */}
        <ContentBox className="mb-6 sm:mb-8">
          <PostCard
            post={post}
            currentUserId={user?.uid}
            onLike={handleLike}
            onDislike={handleDislike}
            showFullContent={true}
          />
        </ContentBox>

        {/* Comments Section */}
        <ContentBox>
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <MessageCircle size={20} style={{ color: colours.text.secondary }} />
            <h2 className="text-lg sm:text-xl font-bold" style={{ color: colours.text.primary }}>
              Comments ({comments.length})
            </h2>
            {isRealTimeActive && isOnline && (
              <div className="flex items-center gap-1 text-xs" style={{ color: colours.status.success.text }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colours.status.success.text }}></div>
                <span>Live</span>
              </div>
            )}
            {!isOnline && (
              <div className="flex items-center gap-1 text-xs" style={{ color: colours.status.warning.text }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colours.status.warning.text }}></div>
                <span>Offline</span>
              </div>
            )}
          </div>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-4 sm:mb-6">
              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full px-3 py-2 pr-20 shadow-lg rounded-lg resize-none border-2 border-black"
                      style={{
                        backgroundColor: colours.input.background,
                        color: colours.input.text
                      }}
                      rows={3}
                      placeholder="Share your thoughts..."
                      maxLength={500}
                    />
                    {/* Character count inside textarea */}
                    <span 
                      className="absolute bottom-3 right-2 text-xs pointer-events-none px-2 py-1 rounded"
                      style={{ 
                        color: colours.text.muted,
                        backgroundColor: colours.input.background,
                      }}
                    >
                      {newComment.length}/500
                    </span>
                  </div>
                  
                  {/* Product Linking for Comments */}
                  <div className="mt-2">
                    {selectedCommentProduct && (
                      <div className="flex items-center gap-3 p-3 rounded-lg shadow-sm border-2 mb-3" style={{ 
                        backgroundColor: colours.tag.primary.background, 
                        borderColor: colours.button.primary.background
                      }}>
                        <div className="flex-shrink-0">
                          <Image
                            src={selectedCommentProduct.imageUrl}
                            alt={selectedCommentProduct.productName}
                            width={32}
                            height={32}
                            className="object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: colours.tag.primary.text }}>
                            {selectedCommentProduct.productName}
                          </p>
                          <p className="text-xs opacity-80" style={{ color: colours.tag.primary.text }}>
                            {selectedCommentProduct.brandName}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCommentProduct(null);
                            setShowCommentProductSearch(false);
                            setCommentProductSearch('');
                            setCommentProducts([]);
                          }}
                          className="flex-shrink-0 p-1 rounded-full transition-opacity"
                          style={{ color: colours.tag.primary.text }}
                          title="Remove linked product"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}

                    {showCommentProductSearch && !selectedCommentProduct && (
                      <div className="relative mb-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={16} style={{ color: colours.text.muted }} />
                          <input
                            type="text"
                            value={commentProductSearch}
                            onChange={(e) => setCommentProductSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 text-sm rounded-lg border-2 focus:outline-none focus:ring-2 transition-all"
                            style={{
                              borderColor: colours.button.primary.background,
                              backgroundColor: colours.input.background,
                              color: colours.input.text,
                              boxShadow: `0 0 0 2px ${colours.button.primary.background}20`
                            }}
                            placeholder="Search for a product to link..."
                            autoFocus
                          />
                        </div>
                        {commentProducts.length > 0 && (
                          <div className="absolute top-full left-0 right-0 rounded-lg mt-2 max-h-40 overflow-y-auto z-10 shadow-xl border-2" style={{ 
                            backgroundColor: colours.card.background, 
                            borderColor: colours.button.primary.background
                          }}>
                            {commentProducts.map((product) => (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() => {
                                  setSelectedCommentProduct(product);
                                  setCommentProductSearch('');
                                  setCommentProducts([]);
                                  setShowCommentProductSearch(false);
                                }}
                                className="w-full flex items-center gap-3 p-3 text-left transition-all border-b last:border-b-0"
                                style={{ 
                                  backgroundColor: colours.card.background,
                                  borderBottomColor: colours.card.border
                                }}
                              >
                                <Image
                                  src={product.imageUrl}
                                  alt={product.productName}
                                  width={28}
                                  height={28}
                                  className="object-cover rounded-md"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate" style={{ color: colours.text.primary }}>
                                    {product.productName}
                                  </p>
                                  <p className="text-xs truncate" style={{ color: colours.text.secondary }}>
                                    {product.brandName}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center">
                      {!selectedCommentProduct && (
                        <button
                          type="button"
                          onClick={() => setShowCommentProductSearch(!showCommentProductSearch)}
                          className="flex items-center gap-2 px-3 py-2 shadow-xl rounded-xl border-2 border-black text-xs font-medium transition-all"
                          style={{
                            backgroundColor: '#f1f5fb',
                            color: colours.text.primary
                          }}
                        >
                          <Package size={14} />
                          {showCommentProductSearch ? 'Hide Product Search' : 'Link Product'}
                        </button>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={!newComment.trim() || submittingComment}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 shadow-xl border-black text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:border-dotted transition-all"
                      style={{
                        backgroundColor: '#f1f5fb',
                        color: colours.text.primary
                      }}
                    >
                      <Send size={14} />
                      <span>{submittingComment ? 'Posting...' : 'Post Comment'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb- p-4 rounded-lg text-center" style={{ backgroundColor: colours.background.secondary }}>
              <p className="mb-2" style={{ color: colours.text.secondary }}>Sign in to join the conversation</p>
              <Link
                href="/auth"
                className="font-medium"
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
              <MessageCircle size={48} className="mx-auto mb-2" style={{ color: colours.text.muted }} />
              <p style={{ color: colours.text.secondary }}>No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`transition-all duration-1000 ease-out ${
                    newlyAddedComments.has(comment.id)
                      ? 'animate-slide-in-top opacity-100 transform translate-y-0'
                      : 'opacity-100 transform translate-y-0'
                  }`}
                  style={{
                    animation: newlyAddedComments.has(comment.id) 
                      ? 'slideInTop 0.8s ease-out, highlightNew 2s ease-out' 
                      : undefined,
                    borderRadius: '0.75rem'
                  }}
                >
                  <CommentItem
                    comment={comment}
                    currentUserId={user?.uid}
                    onLike={handleCommentLike}
                    onDislike={handleCommentDislike}
                    depth={0}
                  />
                </div>
              ))}
            </div>
          )}
        </ContentBox>
      </div>
    </div>
  );
}
