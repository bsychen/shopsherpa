"use client";

import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, onSnapshot, orderBy, limit, doc, addDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseClient";
import Link from "next/link";
import { Post } from "@/types/post";
import PostCard from "@/components/PostCard";
import PostFilters from "@/components/PostFilters";
import CreatePostModal from "@/components/CreatePostModal";
import CreateButton from "@/components/CreateButton";
import ContentBox from "@/components/ContentBox";
import { colours } from "@/styles/colours";
import { useTopBar } from "@/contexts/TopBarContext";

export default function PostsPage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);
  const { setNavigating } = useTopBar();
  
  // Filter states
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [searchTerm, setSearchTerm] = useState('');

  // Real-time states
  const [_isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [newlyAddedPosts, setNewlyAddedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

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

  const fetchPosts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedTags.length > 0) {
        params.append('tags', selectedTags.join(','));
      }
      params.append('sortBy', sortBy);
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      params.append('limit', '20');

      const response = await fetch(`/api/posts?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setNavigating(false); // Clear navigation loading state
    }
  }, [selectedTags, sortBy, searchTerm, setNavigating]);

  // Set up real-time listener for posts
  useEffect(() => {
    if (!isOnline) {
      // If offline, fallback to API call
      fetchPosts();
      return;
    }

    let unsubscribe: (() => void) | null = null;

    const setupRealTimeListener = async () => {
      try {
        const postsRef = collection(db, 'posts');
        let postsQuery;

        // Build query based on filters
        if (selectedTags.length > 0) {
          // If we have tag filters, we need to handle them specially
          // For now, fallback to API for complex filters
          fetchPosts();
          return;
        }

        if (searchTerm) {
          // If we have search term, fallback to API
          fetchPosts();
          return;
        }

        // Simple query for real-time updates (no complex filters)
        if (sortBy === 'recent') {
          postsQuery = query(
            postsRef,
            orderBy('createdAt', 'desc'),
            limit(20)
          );
        } else {
          // For 'popular' sort, fallback to API as it requires complex logic
          fetchPosts();
          return;
        }

        unsubscribe = onSnapshot(postsQuery, async (snapshot) => {
          setIsRealTimeActive(true);
          const postsData = await Promise.all(
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
                title: data.title,
                content: data.content,
                authorId: data.authorId,
                authorName: data.authorName,
                tags: data.tags || [],
                linkedProductId: data.linkedProductId,
                linkedProduct,
                likes: data.likes || [],
                dislikes: data.dislikes || [],
                commentCount: data.commentCount || 0,
                createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
                updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
              } as Post;
            })
          );

          // Filter out optimistic updates and merge with real data
          setPosts(prevPosts => {
            const tempPosts = prevPosts.filter(p => p.id.startsWith('temp-'));
            const realPosts = postsData;
            
            // Detect new posts for animation
            const prevPostIds = new Set(prevPosts.map(p => p.id));
            const newPostIds = realPosts
              .filter(p => !prevPostIds.has(p.id) && !p.id.startsWith('temp-'))
              .map(p => p.id);
            
            if (newPostIds.length > 0) {
              setNewlyAddedPosts(prev => new Set([...prev, ...newPostIds]));
              // Remove animation class after animation duration
              setTimeout(() => {
                setNewlyAddedPosts(prev => {
                  const updated = new Set(prev);
                  newPostIds.forEach(id => updated.delete(id));
                  return updated;
                });
              }, 1000); // Remove animation after 1 second
            }
            
            return [...realPosts, ...tempPosts];
          });
          setLoading(false);
          setNavigating(false);
        }, (error) => {
          console.error('Error in posts listener:', error);
          setIsRealTimeActive(false);
          // Fallback to API call if real-time fails
          fetchPosts();
        });

      } catch (error) {
        console.error('Error setting up real-time listener:', error);
        fetchPosts();
      }
    };

    setupRealTimeListener();

    return () => {
      setIsRealTimeActive(false);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedTags, sortBy, searchTerm, isOnline, fetchPosts, setNavigating]);

  const handleCreatePost = async (postData: {
    title: string;
    content: string;
    tags: string[];
    linkedProductId?: string;
  }) => {
    if (!user) return;

    setCreatingPost(true);
    
    // Create optimistic post
    const optimisticPost: Post = {
      id: `temp-${Date.now()}`,
      title: postData.title,
      content: postData.content,
      authorId: user.uid,
      authorName: user.displayName || user.email || 'Anonymous',
      tags: postData.tags,
      linkedProductId: postData.linkedProductId,
      linkedProduct: undefined, // Will be fetched if needed
      likes: [],
      dislikes: [],
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add optimistic post to UI
    setPosts(prev => [optimisticPost, ...prev]);
    setShowCreateModal(false);

    try {
      // Add post to Firestore
      const postDoc = {
        title: postData.title,
        content: postData.content,
        authorId: user.uid,
        authorName: user.displayName || user.email,
        tags: postData.tags,
        linkedProductId: postData.linkedProductId || null,
        likes: [],
        dislikes: [],
        commentCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'posts'), postDoc);

    } catch (error) {
      console.error('Error creating post:', error);
      // Remove optimistic post on error
      setPosts(prev => prev.filter(p => p.id !== optimisticPost.id));
      setShowCreateModal(true); // Reopen modal on error
    } finally {
      setCreatingPost(false);
    }
  };

  const handlePostAction = async (postId: string, action: string) => {
    if (!user || postId.startsWith('temp-')) return;

    try {
      const postRef = doc(db, 'posts', postId);
      
      switch (action) {
        case 'like':
          await updateDoc(postRef, {
            likes: arrayUnion(user.uid),
            dislikes: arrayRemove(user.uid),
          });
          break;
        case 'dislike':
          await updateDoc(postRef, {
            dislikes: arrayUnion(user.uid),
            likes: arrayRemove(user.uid),
          });
          break;
        case 'unlike':
          await updateDoc(postRef, {
            likes: arrayRemove(user.uid),
          });
          break;
        case 'undislike':
          await updateDoc(postRef, {
            dislikes: arrayRemove(user.uid),
          });
          break;
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

  return (
    <div 
      className="min-h-screen opacity-0 animate-fade-in"
      style={{ backgroundColor: colours.background.secondary }}
    >
      <div className="max-w-2xl mx-auto p-6">
        
        {/* Filters */}
        <ContentBox className="opacity-0 animate-slide-in-bottom" style={{ animationDelay: '100ms' }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h1 
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: colours.text.primary }}
            >
              Community
            </h1>
            
            {user && (
              <CreateButton
                user={user}
                onClick={() => setShowCreateModal(true)}
                label="Create"
                showLabelOnMobile={true}
                className="hover:shadow-lg"
                ariaLabel="Create New Post"
              />
            )}
          </div>
          {/* Filters */}
          <PostFilters
            selectedTags={selectedTags}
            sortBy={sortBy}
            searchTerm={searchTerm}
            onTagsChange={setSelectedTags}
            onSortChange={setSortBy}
            onSearchChange={setSearchTerm}
          />
        </ContentBox>

        {/* Posts */}
        <div className="space-y-2 opacity-0 animate-slide-in-bottom" style={{ animationDelay: '200ms' }}>
          {loading ? (
            <ContentBox className="text-center py-12 animate-scale-in">
              <div 
                className="animate-spin rounded-full h-12 w-12 mx-auto"
                style={{ 
                  borderTopColor: 'transparent',
                  border: `2px solid ${colours.chart.primary}`,
                  borderTopWidth: '2px'
                }}
              ></div>
              <p 
                className="mt-4 animate-fade-in"
                style={{ color: colours.text.secondary, animationDelay: '300ms' }}
              >
                Loading posts...
              </p>
            </ContentBox>
          ) : posts.length === 0 ? (
            <ContentBox className="text-center py-12">
              <div 
                className="mb-4"
                style={{ color: colours.text.muted }}
              >
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v10a2 2 0 002 2h6a2 2 0 002-2V8m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
                </svg>
              </div>
              <h3 
                className="text-lg font-medium mb-2"
                style={{ color: colours.text.primary }}
              >
                No posts yet
              </h3>
              <p 
                className="mb-4"
                style={{ color: colours.text.secondary }}
              >
                {selectedTags.length > 0 || searchTerm 
                  ? "No posts match your current filters. Try adjusting your search."
                  : "Be the first to share something with the community!"
                }
              </p>
              {user && (selectedTags.length === 0 && !searchTerm) && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2 rounded-lg transition-colors font-medium"
                  style={{
                    backgroundColor: colours.button.primary.background,
                    color: colours.button.primary.text
                  }}
                  >
                  Create First Post
                </button>
              )}
            </ContentBox>
          ) : (
            posts.map((post, index) => (
              <div
                key={post.id}
                className={`transition-all duration-1000 ease-out ${
                  newlyAddedPosts.has(post.id)
                    ? 'animate-slide-in-top opacity-100 transform translate-y-0'
                    : 'opacity-100 transform translate-y-0'
                }`}
                style={{
                  animation: newlyAddedPosts.has(post.id) 
                    ? 'slideInTop 0.8s ease-out, highlightNew 2s ease-out' 
                    : undefined,
                }}
              >
                <ContentBox className="opacity-0 animate-slide-in-bottom" style={{ animationDelay: `${300 + index * 50}ms` }}>
                  <PostCard
                    post={post}
                    currentUserId={user?.uid}
                    onLike={handleLike}
                    onDislike={handleDislike}
                  />
                </ContentBox>
              </div>
            ))
          )}
        </div>

        {/* Auth prompt for non-logged in users */}
        {!user && (
          <ContentBox className="text-center py-6 sm:py-8 mt-4 opacity-0 animate-slide-in-bottom" style={{ animationDelay: '300ms' }}>
            <p className="text-sm sm:text-base mb-4" style={{ color: colours.text.secondary }}>
              Join the ShopSmart community to create posts and interact with others!
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-2 rounded-lg transition-colors font-medium text-sm sm:text-base"
              style={{
                backgroundColor: colours.button.primary.background,
                color: colours.button.primary.text
              }}
            >
              Sign In to Get Started
            </Link>
          </ContentBox>
        )}

        {/* Create Post Modal */}
        <CreatePostModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePost}
          isLoading={creatingPost}
        />
      </div>
    </div>
  );
}
