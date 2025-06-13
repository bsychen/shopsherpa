"use client";

import React, { useState } from 'react';
import { UserProfile } from '@/types/user';
import { 
  getAllergenInfo, 
  formatAllergenDisplay,
  AVAILABLE_ALLERGENS 
} from '@/utils/allergens';

interface AllergenManagerProps {
  userProfile: UserProfile;
  onAllergensUpdate: (allergens: string[]) => Promise<void>;
  isUpdating?: boolean;
}

export default function AllergenManager({ userProfile, onAllergensUpdate, isUpdating = false }: AllergenManagerProps) {
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
    <div className="bg-white rounded-xl shadow p-6 transition-all duration-500 ease-in-out">
      {/* Header with title and edit button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Allergens</h2>
        <button
          onClick={toggleEditMode}
          disabled={isUpdating}
          className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
        >
          {isEditMode ? 'Done' : 'Edit'}
        </button>
      </div>

      {/* Current Allergens */}
      <div className="flex flex-wrap gap-2 min-h-[2.5rem] items-start">
        {localAllergens.map((allergen) => {
          const allergenInfo = getAllergenInfo(allergen);
          return (
            <div
              key={allergen}
              className={`inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm border border-red-200 transition-all duration-200 hover:bg-red-200 ${
                isEditMode ? 'pr-1' : ''
              }`}
            >
              <span>
                {allergenInfo ? formatAllergenDisplay(allergenInfo) : allergen}
              </span>
              {isEditMode && (
                <button
                  onClick={() => handleRemoveAllergen(allergen)}
                  disabled={isUpdating}
                  className="ml-1 text-red-600 hover:text-red-800 font-bold text-sm leading-none disabled:opacity-50 w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-300 transition-colors duration-150"
                  aria-label={`Remove ${allergen} allergen`}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
        
        {localAllergens.length === 0 && (
          <p className="text-sm text-gray-500 italic">No allergens selected</p>
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
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-md font-medium text-gray-600 mb-3">Available Allergens</h3>
            <div className="flex flex-wrap gap-2">
              {availableAllergens.map((allergenOption, index) => {
                const allergenInfo = getAllergenInfo(allergenOption.dbKey);
                return (
                  <button
                    key={allergenOption.dbKey}
                    onClick={() => handleAddAllergen(allergenOption.dbKey)}
                    disabled={isUpdating}
                    className={`inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm border border-gray-300 hover:bg-gray-200 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 opacity-0 animate-fade-in`}
                    style={{ 
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
        <div className="flex items-center gap-2 text-sm text-blue-600 mt-4">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Updating allergens...
        </div>
      )}
    </div>
  );
}
