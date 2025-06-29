"use client";

import { Reply, Clock } from 'lucide-react';
import { Comment } from '@/types/post';
import { formatDate } from '@/utils/dateUtils';
import { colours } from '@/styles/colours';
import LikeButton from '../buttons/LikeButton';
import DislikeButton from '../buttons/DislikeButton';
import LinkedProductCard from '../cards/LinkedProductCard';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onLike: (commentId: string, action: 'like' | 'unlike') => void;
  onDislike: (commentId: string, action: 'dislike' | 'undislike') => void;
  onReply?: (commentId: string) => void;
  depth?: number;
}

export default function CommentItem({ 
  comment, 
  currentUserId, 
  onLike, 
  onDislike, 
  onReply,
  depth = 0 
}: CommentItemProps) {
  const hasLiked = currentUserId ? comment.likes.includes(currentUserId) : false;
  const hasDisliked = currentUserId ? comment.dislikes.includes(currentUserId) : false;
  
  const likeCount = comment.likes.length;
  const dislikeCount = comment.dislikes.length;

  const handleLike = () => {
    if (!currentUserId) return;
    onLike(comment.id, hasLiked ? 'unlike' : 'like');
  };

  const handleDislike = () => {
    if (!currentUserId) return;
    onDislike(comment.id, hasDisliked ? 'undislike' : 'dislike');
  };

  const handleReply = () => {
    if (!currentUserId || !onReply) return;
    onReply(comment.id);
  };

  // Limit nesting depth to avoid infinite nesting
  const maxDepth = 3;
  const marginLeft = Math.min(depth, maxDepth) * 24;

  return (
    <div 
      className={`pb-4 ${depth > 0 ? 'pl-4' : ''}`}
      style={{ 
        marginLeft: `${marginLeft}px`
      }}
    >
      <div 
        className="rounded-xl shadow-lg p-4" 
        style={{ 
          backgroundColor: colours.tags.countries.background,
          border: `2px solid ${colours.card.border}`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div>
              <span className="font-medium text-sm" style={{ color: colours.text.primary }}>
                {comment.authorName}
              </span>
              <div className="flex items-center gap-1 text-xs" style={{ color: colours.text.muted }}>
                <Clock size={10} />
                <span>{formatDate(comment.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-3">
          <p className="text-sm whitespace-pre-wrap" style={{ color: colours.text.primary }}>
            {comment.content}
          </p>
        </div>

        {/* Linked Product */}
        {comment.linkedProduct && (
          <LinkedProductCard product={comment.linkedProduct} />
        )}

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <LikeButton
            isLiked={hasLiked}
            likeCount={likeCount}
            onLike={handleLike}
            disabled={!currentUserId}
            size="sm"
          />

          {/* Dislike Button */}
          <DislikeButton
            isDisliked={hasDisliked}
            dislikeCount={dislikeCount}
            onDislike={handleDislike}
            disabled={!currentUserId}
            size="sm"
          />

          {/* Reply Button */}
          {onReply && depth < maxDepth && (
            <button
              onClick={handleReply}
              disabled={!currentUserId}
              className={`flex items-center gap-1 px-2 py-1 rounded-full border-2 border-black text-xs transition-colors ${!currentUserId ? 'cursor-not-allowed opacity-50' : ''}`}
              style={{
                backgroundColor: '#f1f5fb',
                color: colours.text.primary
              }}
            >
              <Reply size={12} />
              <span>Reply</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
