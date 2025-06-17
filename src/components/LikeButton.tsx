"use client";

import { ThumbsUp } from 'lucide-react';
import { colours } from '@/styles/colours';

interface LikeButtonProps {
  isLiked: boolean;
  likeCount: number;
  onLike: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export default function LikeButton({ 
  isLiked, 
  likeCount, 
  onLike, 
  disabled = false,
  size = 'md'
}: LikeButtonProps) {
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-1 text-xs gap-1' 
    : 'px-2 sm:px-3 py-1 text-xs sm:text-sm gap-1 sm:gap-2';
  
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <button
      onClick={onLike}
      disabled={disabled}
      className={`flex items-center rounded-full border-2 border-black transition-colors font-medium ${sizeClasses} ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      }`}
      style={{
        backgroundColor: '#f1f5fb',
        color: isLiked ? colours.status.success.text : colours.text.primary
      }}
    >
      <ThumbsUp size={iconSize} className={isLiked ? 'fill-current' : ''} />
      <span>{likeCount}</span>
    </button>
  );
}
