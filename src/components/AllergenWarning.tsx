"use client";

import { useState } from "react";
import { colours } from "@/styles/colours";

interface AllergenWarningProps {
  allergenWarnings: string[];
}

export default function AllergenWarning({ allergenWarnings }: AllergenWarningProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || !allergenWarnings || allergenWarnings.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-xl mb-4">
      <div 
        className="border rounded-lg p-3 flex items-start gap-3 relative"
        style={{ 
          backgroundColor: 'rgba(185, 92, 92, 0.6)', // More transparent red
          borderColor: 'rgba(248, 113, 113, 0.4)'
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
          onClick={() => setIsDismissed(true)}
          className="flex-shrink-0 p-1 rounded hover:bg-red-100 transition-colors"
          aria-label="Dismiss allergen warning"
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
