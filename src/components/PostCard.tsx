"use client";

import { useState } from 'react';
import { Heart, MessageCircle, ThumbsDown, ThumbsUp, Tag, ExternalLink, Clock } from 'lucide-react';
import Link from 'next/link';
import { Post } from '@/types/post';

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onLike: (postId: string, action: 'like' | 'unlike') => void;
  onDislike: (postId: string, action: 'dislike' | 'undislike') => void;
  showFullContent?: boolean;
}

export default function PostCard({ 
  post, 
  currentUserId, 
  onLike, 
  onDislike, 
  showFullContent = false 
}: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(showFullContent);
  
  const hasLiked = currentUserId ? post.likes.includes(currentUserId) : false;
  const hasDisliked = currentUserId ? post.dislikes.includes(currentUserId) : false;
  
  const likeCount = post.likes.length;
  const dislikeCount = post.dislikes.length;
  
  const shouldTruncate = post.content.length > 300 && !showFullContent;
  const displayContent = shouldTruncate && !isExpanded 
    ? post.content.substring(0, 300) + '...' 
    : post.content;

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const handleLike = () => {
    if (!currentUserId) return;
    onLike(post.id, hasLiked ? 'unlike' : 'like');
  };

  const handleDislike = () => {
    if (!currentUserId) return;
    onDislike(post.id, hasDisliked ? 'undislike' : 'dislike');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link 
            href={`/posts/${post.id}`}
            className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
          >
            {post.title}
          </Link>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <span className="font-medium">{post.authorName}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
            >
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Linked Product */}
      {post.linkedProduct && (
        <div className="mb-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <img
              src={post.linkedProduct.imageUrl}
              alt={post.linkedProduct.name}
              className="w-12 h-12 object-cover rounded"
            />
            <div className="flex-1">
              <p className="font-medium text-sm text-blue-900">{post.linkedProduct.name}</p>
              <p className="text-blue-700 text-xs">Referenced Product</p>
            </div>
            <Link
              href={`/product/${post.linkedProduct.id}`}
              className="text-blue-600 hover:text-blue-800"
            >
              <ExternalLink size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-800 whitespace-pre-wrap">{displayContent}</p>
        {shouldTruncate && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-blue-600 hover:text-blue-700 text-sm mt-2 font-medium"
          >
            Read more
          </button>
        )}
        {shouldTruncate && isExpanded && !showFullContent && (
          <button
            onClick={() => setIsExpanded(false)}
            className="text-blue-600 hover:text-blue-700 text-sm mt-2 font-medium"
          >
            Show less
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={!currentUserId}
            className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${
              hasLiked
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:bg-gray-100'
            } ${!currentUserId ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <ThumbsUp size={16} />
            <span className="text-sm font-medium">{likeCount}</span>
          </button>

          {/* Dislike Button */}
          <button
            onClick={handleDislike}
            disabled={!currentUserId}
            className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${
              hasDisliked
                ? 'bg-red-100 text-red-700'
                : 'text-gray-600 hover:bg-gray-100'
            } ${!currentUserId ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <ThumbsDown size={16} />
            <span className="text-sm font-medium">{dislikeCount}</span>
          </button>

          {/* Comments */}
          <Link
            href={`/posts/${post.id}`}
            className="flex items-center gap-2 px-3 py-1 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <MessageCircle size={16} />
            <span className="text-sm font-medium">{post.commentCount}</span>
          </Link>
        </div>

        {/* Share/View Post */}
        {!showFullContent && (
          <Link
            href={`/posts/${post.id}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View Post
          </Link>
        )}
      </div>
    </div>
  );
}
