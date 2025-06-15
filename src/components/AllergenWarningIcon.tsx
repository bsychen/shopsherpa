"use client";

import { colours } from "@/styles/colours";
import { Warn } from "./Icons";

interface AllergenWarningIconProps {
  hasAllergens: boolean;
  onClick: () => void;
}

export default function AllergenWarningIcon({ hasAllergens, onClick }: AllergenWarningIconProps) {
  if (!hasAllergens) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className="absolute bottom-0 right-0 flex items-center justify-center transition-all duration-200 transform z-10"
      style={{ 
        width: '24px',
        height: '24px',
        transform: 'translate(3px, -3px)', // Position it slightly outside the corner
        color: colours.status.error.icon,
        backgroundColor: 'transparent',
      }}
      aria-label="Allergen warning - click to view details"
    >
      <div className="w-4 h-4">
        <Warn/>
      </div>
    </button>
  );
}
