"use client";

import { colours } from "@/styles/colours";
import { Warn } from "../../Icons";

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
      className="flex items-center justify-center transition-all duration-200 transform hover:scale-110"
      style={{ 
        width: '32px',
        height: '32px',
        color: colours.status.error.icon,
        backgroundColor: 'transparent',
        marginRight: '8px', // Pull the icon to align with the content box padding
      }}
      aria-label="Allergen warning - click to view details"
    >
      <div className="w-6 h-6">
        <Warn/>
      </div>
    </button>
  );
}
