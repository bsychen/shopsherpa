"use client";

import React from 'react';
import { colours } from '@/styles/colours';

interface SearchButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function SearchButton({ 
  onClick, 
  isLoading = false, 
  disabled = false,
  className = '',
  style = {}
}: SearchButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`flex-shrink-0 px-4 py-2 sm:px-6 sm:py-3 rounded-lg shadow-xl border-2 border-black shadow-sm transition-all duration-200 font-bold text-base sm:text-lg shadow-md focus:outline-none flex items-center justify-center hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${className}`}
      style={{
        backgroundColor: `${colours.button.primary.background}80`,
        color: colours.button.primary.text,
        ...style
      }}
      onFocus={(e) => e.currentTarget.style.boxShadow = colours.input.focus.ring}
      onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
      aria-label="Search"
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke='#0C4038'
          strokeWidth="2.4"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      )}
    </button>
  );
}
