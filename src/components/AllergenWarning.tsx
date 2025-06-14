"use client";

import { useState } from "react";
import { colours } from "@/styles/colours";

interface AllergenWarningProps {
  allergenWarnings: string[];
  isEmbedded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
}

export default function AllergenWarning({ allergenWarnings, isEmbedded = false, onExpandedChange }: AllergenWarningProps) {
  const [isMinimized, setIsMinimized] = useState(isEmbedded);

  const handleToggle = (minimized: boolean) => {
    setIsMinimized(minimized);
    onExpandedChange?.(!minimized);
  };

  if (!allergenWarnings || allergenWarnings.length === 0) {
    return null;
  }

  const containerClasses = isEmbedded 
    ? "absolute z-20" 
    : "w-full max-w-xl mb-4";

  return (
    <div className={containerClasses}>
      {isMinimized ? (
        // Minimized state - small warning icon
        <button
          onClick={() => handleToggle(false)}
          className="border rounded-full p-2 flex items-center justify-center hover:scale-110 transition-all duration-300 transform"
          style={{ 
            backgroundColor: `${colours.status.error.background}99`,
            borderColor: colours.status.error.border,
            width: '36px',
            height: '36px',
            padding: '6px'
          }}
          aria-label="Expand allergen warning"
        >
          <span 
            className="text-base"
            style={{ color: colours.status.error.icon }}
          >
            ⚠️
          </span>
        </button>
      ) : (
        // Expanded state - full warning message with animation
        <div 
          className={`border rounded-lg p-3 flex items-start gap-3 relative transition-all duration-500 transform ${
            isEmbedded ? 'animate-slide-up-expand' : ''
          }`}
          style={{ 
            backgroundColor: `${colours.status.error.background}99`,
            borderColor: colours.status.error.border,
            ...(isEmbedded && {
              minWidth: '280px',
              maxWidth: '320px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            })
          }}
        >
          <div className="flex-shrink-0 mt-0.5">
            <span 
              className="text-xl"
              style={{ color: colours.status.error.icon }}
            >
              ⚠️
            </span>
          </div>
          <div className="flex-1">
            <h3 
              className="font-semibold text-sm mb-1"
              style={{ color: colours.status.error.text }}
            >
              Allergen Warning
            </h3>
            <p 
              className="text-sm"
              style={{ color: colours.status.error.text }}
            >
              This product contains allergens that match your profile: {allergenWarnings.map(allergen => allergen.replace(/-/g, ' ')).join(', ')}
            </p>
          </div>
          <button
            onClick={() => handleToggle(true)}
            className="flex-shrink-0 p-1 rounded hover:bg-red-100 transition-colors"
            aria-label="Minimize allergen warning"
            style={{ color: colours.status.error.text }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="2" 
              stroke="currentColor" 
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
