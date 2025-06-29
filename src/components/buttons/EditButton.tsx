"use client";

import React from 'react';
import { Pencil, Check } from 'lucide-react';
import { colours } from '@/styles/colours';

interface EditButtonProps {
  isEditMode: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function EditButton({ 
  isEditMode, 
  onToggle, 
  disabled = false, 
  className = '',
  style = {}
}: EditButtonProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`px-3 py-2 text-sm solid font-medium rounded-lg shadow-xl transition-colors duration-200 disabled:opacity-50 flex items-center gap-2 ${className}`}
      style={{ 
        color: colours.button.edit.text,
        backgroundColor: colours.button.edit.background,
        border: `2px solid ${colours.card.border}`,
        ...style
      }}
    >
      {isEditMode ? (
        <>
          <Check size={16} />
          Done
        </>
      ) : (
        <>
          <Pencil size={16} />
          Edit
        </>
      )}
    </button>
  );
}
