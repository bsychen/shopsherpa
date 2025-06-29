"use client";

import React, { useState } from 'react';
import { UserProfile } from '@/types/user';
import EditButton from '../buttons/EditButton';
import { 
  getAllergenInfo, 
  formatAllergenDisplay,
  AVAILABLE_ALLERGENS,
  getRemovableAllergenTagClasses,
  getRemovableAllergenTagStyles
} from '@/utils/allergens';
import { colours } from '@/styles/colours';

interface AllergenManagerProps {
  userProfile: UserProfile;
  onAllergensUpdate: (allergens: string[]) => Promise<void>;
  isUpdating?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function AllergenManager({ 
  userProfile, 
  onAllergensUpdate, 
  isUpdating = false, 
  className = '', 
  style = {} 
}: AllergenManagerProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [localAllergens, setLocalAllergens] = useState<string[]>(userProfile.allergens || []);

  // Get available allergens (not already selected)
  const availableAllergens = AVAILABLE_ALLERGENS.filter(allergen => !localAllergens.includes(allergen.dbKey));

  const handleAddAllergen = async (allergenDbKey: string) => {
    const newAllergens = [...localAllergens, allergenDbKey];
    setLocalAllergens(newAllergens);
    
    // Auto-save when adding allergen
    try {
      await onAllergensUpdate(newAllergens);
    } catch (error) {
      console.error('Failed to add allergen:', error);
      setLocalAllergens(userProfile.allergens || []);
    }
  };

  const handleRemoveAllergen = async (allergenDbKey: string) => {
    const newAllergens = localAllergens.filter(a => a !== allergenDbKey);
    setLocalAllergens(newAllergens);
    
    // Auto-save when removing allergen
    try {
      await onAllergensUpdate(newAllergens);
    } catch (error) {
      console.error('Failed to remove allergen:', error);
      setLocalAllergens(userProfile.allergens || []);
    }
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  return (
    <div 
      className={`transition-all duration-500 ease-in-out ${className}`}
      style={style}>
      {/* Header with title and edit button */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-semibold" style={{ color: colours.text.primary }}>Allergens</h1>
        <EditButton
          isEditMode={isEditMode}
          onToggle={toggleEditMode}
          disabled={isUpdating}
        />
      </div>

      {/* Current Allergens */}
      <div className="flex flex-wrap gap-2 min-h-[2.5rem] items-start">
        {localAllergens.map((allergen) => {
          const allergenInfo = getAllergenInfo(allergen);
          return (
            <div
              key={allergen}
              className={`${getRemovableAllergenTagClasses()} ${
                isEditMode ? 'pr-1' : ''
              }`}
              style={getRemovableAllergenTagStyles()}
            >
              <span>
                {allergenInfo ? formatAllergenDisplay(allergenInfo) : allergen}
              </span>
              {isEditMode && (
                <button
                  onClick={() => handleRemoveAllergen(allergen)}
                  disabled={isUpdating}
                  className="ml-1 font-bold text-sm leading-none disabled:opacity-50 w-5 h-5 flex items-center justify-center rounded-full transition-colors duration-150"
                  style={{ color: colours.status.error.border }}
                  aria-label={`Remove ${allergen} allergen`}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
        
        {localAllergens.length === 0 && (
          <p className="text-sm italic" style={{ color: colours.text.muted }}>No allergens selected</p>
        )}
      </div>

      {/* Available Allergens Section - Only visible in edit mode */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isEditMode && availableAllergens.length > 0
            ? 'max-h-96 opacity-100 mt-6' 
            : 'max-h-0 opacity-0 mt-0'
        }`}
      >
        <div className={`transition-all duration-300 delay-150 ${
          isEditMode ? 'transform translate-y-0 opacity-100' : 'transform -translate-y-2 opacity-0'
        }`}>
          <div className="pt-4" style={{ borderTop: `1px solid ${colours.card.border}` }}>
            <h3 className="text-md font-medium mb-3" style={{ color: colours.text.secondary }}>Available Allergens</h3>
            <div className="flex flex-wrap gap-2">
              {availableAllergens.map((allergenOption, index) => {
                const allergenInfo = getAllergenInfo(allergenOption.dbKey);
                return (
                  <button
                    key={allergenOption.dbKey}
                    onClick={() => handleAddAllergen(allergenOption.dbKey)}
                    disabled={isUpdating}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all duration-200 disabled:opacity-50 opacity-0 animate-fade-in`}
                    style={{ 
                      backgroundColor: colours.tag.default.background,
                      color: colours.tag.default.text,
                      border: `2px solid ${colours.tag.default.border}`,
                      animationDelay: isEditMode ? `${index * 50}ms` : '0ms',
                      animationFillMode: 'forwards'
                    }}
                  >
                    {allergenInfo ? formatAllergenDisplay(allergenInfo) : allergenOption.displayName}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {isUpdating && (
        <div className="flex items-center gap-2 text-sm mt-4" style={{ color: colours.spinner.text }}>
          <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: colours.spinner.border, borderTopColor: colours.spinner.borderTop }}></div>
          Updating allergens...
        </div>
      )}
    </div>
  );
}
