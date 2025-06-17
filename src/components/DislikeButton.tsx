"use client";

import { ThumbsDown } from 'lucide-react';
import { colours } from '@/styles/colours';

interface DislikeButtonProps {
  isDisliked: boolean;
  dislikeCount: number;
  onDislike: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export default function DislikeButton({ 
  isDisliked, 
  dislikeCount, 
  onDislike, 
  disabled = false,
  size = 'md'
}: DislikeButtonProps) {
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-1 text-xs gap-1' 
    : 'px-2 sm:px-3 py-1 text-xs sm:text-sm gap-1 sm:gap-2';
  
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <button
      onClick={onDislike}
      disabled={disabled}
      className={`flex items-center rounded-full border-2 border-black transition-colors font-medium ${sizeClasses} ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      }`}
      style={{
        backgroundColor: '#f1f5fb',
        color: isDisliked ? colours.status.error.text : colours.text.primary
      }}
    >
      <ThumbsDown size={iconSize} className={isDisliked ? 'fill-current' : ''} />
      <span>{dislikeCount}</span>
    </button>
  );
}
