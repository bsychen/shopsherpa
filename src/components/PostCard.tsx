"use client";

import { useState } from 'react';
import { MessageCircle, ThumbsDown, ThumbsUp, Tag, ExternalLink, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types/post';
import { formatDate } from '@/utils/dateUtils';
import { colours } from '@/styles/colours';

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

  const handleLike = () => {
    if (!currentUserId) return;
    onLike(post.id, hasLiked ? 'unlike' : 'like');
  };

  const handleDislike = () => {
    if (!currentUserId) return;
    onDislike(post.id, hasDisliked ? 'undislike' : 'dislike');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1">
          <Link 
            href={`/posts/${post.id}`}
            className="text-lg sm:text-xl font-bold hover:underline transition-colors"
            style={{ color: colours.text.primary }}
          >
            {post.title}
          </Link>
          <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm" style={{ color: colours.text.secondary }}>
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
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
              style={{ 
                backgroundColor: colours.tag.default.background,
                color: colours.tag.default.text
              }}
            >
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Linked Product */}
      {post.linkedProduct && (
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: colours.tag.default.background, border: `1px solid ${colours.tag.default.border}` }}>
            <Image
              src={post.linkedProduct.imageUrl}
              alt={post.linkedProduct.name}
              width={48}
              height={48}
              className="object-cover rounded"
            />
            <div className="flex-1">
              <p className="font-medium text-sm" style={{ color: colours.tag.default.text }}>{post.linkedProduct.name}</p>
              <p className="text-xs" style={{ color: colours.text.secondary }}>Referenced Product</p>
            </div>
            <Link
              href={`/product/${post.linkedProduct.id}`}
              className="hover:opacity-70"
              style={{ color: colours.text.link }}
            >
              <ExternalLink size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="mb-3 sm:mb-4">
        <p className="whitespace-pre-wrap text-sm sm:text-base" style={{ color: colours.text.primary }}>{displayContent}</p>
        {shouldTruncate && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-xs sm:text-sm mt-2 font-medium hover:underline"
            style={{ color: colours.text.link }}
          >
            Read more
          </button>
        )}
        {shouldTruncate && isExpanded && !showFullContent && (
          <button
            onClick={() => setIsExpanded(false)}
            className="text-xs sm:text-sm mt-2 font-medium hover:underline"
            style={{ color: colours.text.link }}
          >
            Show less
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 sm:pt-4" style={{ borderTop: `1px solid ${colours.card.border}` }}>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={!currentUserId}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full transition-colors text-xs sm:text-sm ${!currentUserId ? 'cursor-not-allowed opacity-50' : ''}`}
            style={{
              backgroundColor: hasLiked ? colours.status.success.background : colours.interactive.hover.background,
              color: hasLiked ? colours.status.success.text : colours.text.secondary
            }}
          >
            <ThumbsUp size={14} />
            <span className="font-medium">{likeCount}</span>
          </button>

          {/* Dislike Button */}
          <button
            onClick={handleDislike}
            disabled={!currentUserId}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full transition-colors text-xs sm:text-sm ${!currentUserId ? 'cursor-not-allowed opacity-50' : ''}`}
            style={{
              backgroundColor: hasDisliked ? colours.status.error.background : colours.interactive.hover.background,
              color: hasDisliked ? colours.status.error.text : colours.text.secondary
            }}
          >
            <ThumbsDown size={14} />
            <span className="font-medium">{dislikeCount}</span>
          </button>

          {/* Comments */}
          <Link
            href={`/posts/${post.id}`}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full transition-colors hover:opacity-70 text-xs sm:text-sm"
            style={{ 
              backgroundColor: colours.interactive.hover.background,
              color: colours.text.secondary 
            }}
          >
            <MessageCircle size={14} />
            <span className="font-medium">{post.commentCount}</span>
          </Link>
        </div>

        {/* Share/View Post */}
        {!showFullContent && (
          <Link
            href={`/posts/${post.id}`}
            className="text-xs sm:text-sm font-medium hover:underline"
            style={{ color: colours.text.link }}
          >
            View Post
          </Link>
        )}
      </div>
    </div>
  );
}
