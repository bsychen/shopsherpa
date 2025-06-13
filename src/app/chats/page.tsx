"use client";

import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Post } from "@/types/post";
import PostCard from "@/components/PostCard";
import PostFilters from "@/components/PostFilters";
import CreatePostModal from "@/components/CreatePostModal";

export default function PostsPage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);
  
  // Filter states
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
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
    }
  }, [selectedTags, sortBy, searchTerm]);

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center text-blue-600 hover:underline">
              <span className="mr-2 text-2xl">&#8592;</span>
              <span className="font-semibold">Go back home</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">ShopSmart Community</h1>
          </div>
          
          {user && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={20} />
              Create Post
            </button>
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

        {/* Posts */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v10a2 2 0 002 2h6a2 2 0 002-2V8m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-4">
                {selectedTags.length > 0 || searchTerm 
                  ? "No posts match your current filters. Try adjusting your search."
                  : "Be the first to share something with the community!"
                }
              </p>
              {user && (selectedTags.length === 0 && !searchTerm) && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Create First Post
                </button>
              )}
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.uid}
                onLike={handleLike}
                onDislike={handleDislike}
              />
            ))
          )}
        </div>

        {/* Auth prompt for non-logged in users */}
        {!user && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Join the ShopSmart community to create posts and interact with others!
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Sign In to Get Started
            </Link>
          </div>
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
