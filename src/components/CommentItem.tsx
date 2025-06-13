"use client";

import { ThumbsUp, ThumbsDown, Reply, Clock, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { Comment } from '@/types/post';
import { formatDate } from '@/utils/dateUtils';

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
      className="border-l-2 border-gray-100 pl-4 pb-4"
      style={{ marginLeft: `${marginLeft}px` }}
    >
      <div className="bg-gray-50 rounded-lg p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium text-sm">
                {comment.authorName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <span className="font-medium text-sm text-gray-900">
                {comment.authorName}
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={10} />
                <span>{formatDate(comment.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-3">
          <p className="text-gray-800 text-sm whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>

        {/* Linked Product */}
        {comment.linkedProduct && (
          <div className="mb-3">
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
              <Image
                src={comment.linkedProduct.imageUrl}
                alt={comment.linkedProduct.name}
                width={32}
                height={32}
                className="object-cover rounded"
              />
              <div className="flex-1">
                <p className="text-xs font-medium text-blue-900">
                  {comment.linkedProduct.name}
                </p>
              </div>
              <a
                href={`/product/${comment.linkedProduct.id}`}
                className="text-blue-600 hover:text-blue-800"
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
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
              hasLiked
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:bg-gray-100'
            } ${!currentUserId ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <ThumbsUp size={12} />
            <span>{likeCount}</span>
          </button>

          {/* Dislike Button */}
          <button
            onClick={handleDislike}
            disabled={!currentUserId}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
              hasDisliked
                ? 'bg-red-100 text-red-700'
                : 'text-gray-600 hover:bg-gray-100'
            } ${!currentUserId ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <ThumbsDown size={12} />
            <span>{dislikeCount}</span>
          </button>

          {/* Reply Button */}
          {onReply && depth < maxDepth && (
            <button
              onClick={handleReply}
              disabled={!currentUserId}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors text-gray-600 hover:bg-gray-100 ${
                !currentUserId ? 'cursor-not-allowed opacity-50' : ''
              }`}
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
