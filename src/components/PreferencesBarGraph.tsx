"use client";

import React, { useState, useRef, useCallback } from 'react';
import { UserProfile } from '@/types/user';
import Image from 'next/image';

interface PreferencesBarGraphProps {
  userProfile: UserProfile;
  onPreferencesUpdate: (preferences: Partial<UserProfile>) => Promise<void>;
  isUpdating?: boolean;
}

interface PreferenceItem {
  key: keyof Pick<UserProfile, 'pricePreference' | 'qualityPreference' | 'nutritionPreference' | 'sustainabilityPreference' | 'brandPreference'>;
  label: string;
  color: string;
  circleColor: string;
  svg: string;
}

const preferences: PreferenceItem[] = [
  { key: 'pricePreference', label: 'Price', color: 'bg-yellow-500', circleColor: 'border-yellow-500', svg: '/dollar-svgrepo-com.svg' },
  { key: 'qualityPreference', label: 'Quality', color: 'bg-red-500', circleColor: 'border-red-500', svg: '/quality-supervision-svgrepo-com.svg' },
  { key: 'nutritionPreference', label: 'Nutrition', color: 'bg-blue-500', circleColor: 'border-blue-500', svg: '/meal-svgrepo-com.svg' },
  { key: 'sustainabilityPreference', label: 'Sustainability', color: 'bg-green-500', circleColor: 'border-green-500', svg: '/leaf-svgrepo-com.svg' },
  { key: 'brandPreference', label: 'Brand', color: 'bg-purple-500', circleColor: 'border-purple-500', svg: '/prices-svgrepo-com.svg' },
];

export default function PreferencesBarGraph({ userProfile, onPreferencesUpdate, isUpdating = false }: PreferencesBarGraphProps) {
  const [localPreferences, setLocalPreferences] = useState(() => {
    const prefs: Record<string, number> = {};
    preferences.forEach(pref => {
      prefs[pref.key] = userProfile[pref.key] || 1;
    });
    return prefs;
  });
  
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showTip, setShowTip] = useState(true);
  const [isAnimated, setIsAnimated] = useState(false);
  const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Trigger animation on mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 100); // Small delay to ensure component is mounted
    return () => clearTimeout(timer);
  }, []);

  const handleMouseDown = useCallback((prefKey: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(prefKey);
    
    // Handle immediate position update for click
    const container = containerRefs.current[prefKey];
    if (container) {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const value = Math.round((percentage * 4 + 1) * 10) / 10;
      
      setLocalPreferences(prev => {
        const newPrefs = { ...prev, [prefKey]: value };
        const hasChanges = preferences.some(pref => 
          newPrefs[pref.key] !== (userProfile[pref.key] || 1)
        );
        setHasChanges(hasChanges);
        return newPrefs;
      });
    }
  }, [userProfile]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const container = containerRefs.current[isDragging];
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const value = Math.round((percentage * 4 + 1) * 10) / 10; // 1.0 to 5.0 with 0.1 precision
    
    setLocalPreferences(prev => {
      const newPrefs = { ...prev, [isDragging]: value };
      
      // Check if there are changes from original values
      const hasChanges = preferences.some(pref => 
        newPrefs[pref.key] !== (userProfile[pref.key] || 1)
      );
      setHasChanges(hasChanges);
      
      return newPrefs;
    });
  }, [isDragging, userProfile]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleSaveChanges = async () => {
    try {
      const updates: Partial<UserProfile> = {};
      preferences.forEach(pref => {
        if (localPreferences[pref.key] !== (userProfile[pref.key] || 1)) {
          (updates as any)[pref.key] = localPreferences[pref.key];
        }
      });
      
      await onPreferencesUpdate(updates);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      // Reset to original values on error
      setLocalPreferences(() => {
        const prefs: Record<string, number> = {};
        preferences.forEach(pref => {
          prefs[pref.key] = userProfile[pref.key] || 1;
        });
        return prefs;
      });
      setHasChanges(false);
    }
  };

  const handleResetChanges = () => {
    setLocalPreferences(() => {
      const prefs: Record<string, number> = {};
      preferences.forEach(pref => {
        prefs[pref.key] = userProfile[pref.key] || 1;
      });
      return prefs;
    });
    setHasChanges(false);
  };

  return (
      <div className="space-y-4">
        {preferences.map((pref, index) => {
          const value = localPreferences[pref.key];
          const percentage = ((value - 1) / 4) * 100; // Convert 1-5 to 0-100%
          
          return (
            <div key={pref.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image 
                    src={pref.svg} 
                    alt={pref.label} 
                    width={20} 
                    height={20} 
                    className="text-gray-600"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    {pref.label}
                  </label>
                </div>
              </div>
              
              <div 
                ref={el => { containerRefs.current[pref.key] = el; }}
                className={`relative h-8 bg-gray-200 rounded-lg cursor-pointer transition-all ${
                  isDragging === pref.key ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
                }`}
                onMouseDown={handleMouseDown(pref.key)}
              >
                <div 
                  className={`h-full ${pref.color} rounded-lg flex items-center justify-end pr-2 transition-all duration-1000 ease-out ${
                    isAnimated ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ 
                    width: isAnimated ? `${percentage}%` : '0%',
                    transitionDelay: `${index * 150}ms` // Stagger the animations
                  }}
                >
                  <div className={`w-3 h-3 bg-white rounded-full shadow-sm border-2 ${pref.circleColor} transition-all duration-300 ${
                    isAnimated ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                  }`} 
                  style={{ 
                    transitionDelay: `${index * 150 + 800}ms` // Circle appears after bar fills
                  }} />
                </div>
              </div>
              
              <div className="text-xs text-gray-500 flex justify-between">
                <span>Less Important</span>
                <span>More Important</span>
              </div>
            </div>
          );
        })}

      {showTip && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg relative">
          <button
            onClick={() => setShowTip(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close tip"
          >
            ✕
          </button>
          <p className="text-xs text-gray-600 leading-relaxed pr-6">
            <span className="font-medium">💡 Tip:</span> Click and drag the sliders to adjust how important each factor is to you.
          </p>
        </div>
      )}

      {hasChanges && (
        <div className="mt-4 flex gap-2 justify-end">
          <button
            onClick={handleResetChanges}
            disabled={isUpdating}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Reset
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={isUpdating}
            className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}
