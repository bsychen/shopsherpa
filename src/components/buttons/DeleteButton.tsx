"use client";

import React from 'react';
import { Trash2 } from 'lucide-react';
import { colours } from '@/styles/colours';

interface DeleteButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function DeleteButton({ 
  onClick, 
  disabled = false, 
  className = '',
  style = {}
}: DeleteButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 text-sm solid font-medium rounded-lg shadow-xl transition-colors duration-200 disabled:opacity-50 flex items-center gap-2 ${className}`}
      style={{ 
        color: colours.status.error.text,
        backgroundColor: colours.status.error.background,
        border: `2px solid ${colours.status.error.border}`,
        ...style
      }}
    >
      <Trash2 size={16} />
      Delete
    </button>
  );
}
