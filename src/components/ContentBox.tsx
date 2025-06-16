import React from 'react';
import { colours } from '@/styles/colours';

interface ContentBoxProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary';
  style?: React.CSSProperties;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  noPadding?: boolean;
  noMargin?: boolean;
}

/**
 * A reusable content box component that provides consistent styling
 * for white boxes throughout the application
 */
const ContentBox: React.FC<ContentBoxProps> = ({
  children,
  className = '',
  variant = 'primary',
  style = {},
  size = 'xl',
  noPadding = false,
  noMargin = false
}) => {
  const backgroundColor = variant === 'primary' 
    ? colours.content.surface 
    : colours.content.surfaceSecondary;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  const paddingClass = noPadding ? '' : 'p-6';
  const marginClass = noMargin ? '' : 'mb-4';

  return (
    <div 
      className={`w-full ${sizeClasses[size]} rounded-2xl shadow-xl border-2 border-black ${paddingClass} ${marginClass} ${className}`}
      style={{ 
        backgroundColor,
        borderColor: colours.content.border,
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default ContentBox;
