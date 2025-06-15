"use client";

import { ThumbsUp, ThumbsDown, Reply, Clock, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { Comment } from '@/types/post';
import { formatDate } from '@/utils/dateUtils';
import { colours } from '@/styles/colours';

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
      className="pl-4 pb-4"
      style={{ 
        marginLeft: `${marginLeft}px`,
        borderLeft: `2px solid ${colours.card.border}`
      }}
    >
      <div className="rounded-lg p-4" style={{ backgroundColor: colours.background.secondary }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: colours.tag.default.background }}>
              <span className="font-medium text-sm" style={{ color: colours.tag.default.text }}>
                {comment.authorName.charAt(0).toUpperCase()}
              </span>
            </div>
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
          <div className="mb-3">
            <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: colours.tag.default.background, border: `1px solid ${colours.tag.default.border}` }}>
              <Image
                src={comment.linkedProduct.imageUrl}
                alt={comment.linkedProduct.name}
                width={32}
                height={32}
                className="object-cover rounded"
              />
              <div className="flex-1">
                <p className="text-xs font-medium" style={{ color: colours.tag.default.text }}>
                  {comment.linkedProduct.name}
                </p>
              </div>
              <a
                href={`/product/${comment.linkedProduct.id}`}
                className="hover:opacity-70"
                style={{ color: colours.text.link }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={!currentUserId}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${!currentUserId ? 'cursor-not-allowed opacity-50' : ''}`}
            style={{
              backgroundColor: hasLiked ? colours.status.success.background : colours.interactive.hover.background,
              color: hasLiked ? colours.status.success.text : colours.text.secondary
            }}
          >
            <ThumbsUp size={12} />
            <span>{likeCount}</span>
          </button>

          {/* Dislike Button */}
          <button
            onClick={handleDislike}
            disabled={!currentUserId}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${!currentUserId ? 'cursor-not-allowed opacity-50' : ''}`}
            style={{
              backgroundColor: hasDisliked ? colours.status.error.background : colours.interactive.hover.background,
              color: hasDisliked ? colours.status.error.text : colours.text.secondary
            }}
          >
            <ThumbsDown size={12} />
            <span>{dislikeCount}</span>
          </button>

          {/* Reply Button */}
          {onReply && depth < maxDepth && (
            <button
              onClick={handleReply}
              disabled={!currentUserId}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${!currentUserId ? 'cursor-not-allowed opacity-50' : ''}`}
              style={{
                backgroundColor: colours.interactive.hover.background,
                color: colours.text.secondary
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
