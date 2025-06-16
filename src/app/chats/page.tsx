"use client";

import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
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

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCreatePost = async (postData: {
    title: string;
    content: string;
    tags: string[];
    linkedProductId?: string;
  }) => {
    if (!user) return;

    setCreatingPost(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...postData,
          authorId: user.uid,
          authorName: user.displayName || user.email,
        }),
      });

      if (response.ok) {
        const newPost = await response.json();
        setPosts([newPost, ...posts]);
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setCreatingPost(false);
    }
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
        // Refresh posts to get updated like/dislike counts
        fetchPosts();
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
            <div>
              <h1 
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: colours.text.primary }}
              >
                Community
              </h1>
            </div>
            
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
              <ContentBox key={post.id} className="opacity-0 animate-slide-in-bottom" style={{ animationDelay: `${300 + index * 50}ms` }}>
                <PostCard
                  post={post}
                  currentUserId={user?.uid}
                  onLike={handleLike}
                  onDislike={handleDislike}
                />
              </ContentBox>
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
