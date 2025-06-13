"use client";

import React, { useState, useRef, useCallback } from 'react';
import { UserProfile } from '@/types/user';
import Image from 'next/image';
import { colours } from '@/styles/colours';

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
  { key: 'pricePreference', label: 'Price', color: colours.status.warning.icon, circleColor: colours.status.warning.border, svg: '/dollar-svgrepo-com.svg' },
  { key: 'qualityPreference', label: 'Quality', color: colours.status.error.icon, circleColor: colours.status.error.border, svg: '/quality-supervision-svgrepo-com.svg' },
  { key: 'nutritionPreference', label: 'Nutrition', color: colours.chart.primary, circleColor: colours.chart.primary, svg: '/meal-svgrepo-com.svg' },
  { key: 'sustainabilityPreference', label: 'Sustainability', color: colours.status.success.icon, circleColor: colours.status.success.border, svg: '/leaf-svgrepo-com.svg' },
  { key: 'brandPreference', label: 'Brand', color: colours.tag.primary.background, circleColor: colours.tag.primary.border, svg: '/prices-svgrepo-com.svg' },
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
          (updates as Record<string, number>)[pref.key] = localPreferences[pref.key];
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
                    style={{ color: colours.text.secondary }}
                  />
                  <label className="text-sm font-medium" style={{ color: colours.text.primary }}>
                    {pref.label}
                  </label>
                </div>
              </div>
              
              <div 
                ref={el => { containerRefs.current[pref.key] = el; }}
                className={`relative h-8 rounded-lg cursor-pointer transition-all hover:shadow-md`}
                style={{
                  backgroundColor: colours.background.secondary,
                  ...(isDragging === pref.key && {
                    boxShadow: `0 0 0 2px ${colours.interactive.selected.background}`,
                  })
                }}
                onMouseDown={handleMouseDown(pref.key)}
              >
                <div 
                  className={`h-full rounded-lg flex items-center justify-end pr-2 transition-all duration-1000 ease-out ${
                    isAnimated ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ 
                    width: isAnimated ? `${percentage}%` : '0%',
                    backgroundColor: pref.color,
                    transitionDelay: `${index * 150}ms` // Stagger the animations
                  }}
                >
                  <div className={`w-3 h-3 rounded-full shadow-sm border-2 transition-all duration-300 ${
                    isAnimated ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                  }`} 
                  style={{ 
                    backgroundColor: colours.card.background,
                    borderColor: pref.circleColor,
                    transitionDelay: `${index * 150 + 800}ms` // Circle appears after bar fills
                  }} />
                </div>
              </div>
              
              <div className="text-xs flex justify-between" style={{ color: colours.text.muted }}>
                <span>Less Important</span>
                <span>More Important</span>
              </div>
            </div>
          );
        })}

      {showTip && (
        <div className="mt-4 p-3 rounded-lg relative" style={{ backgroundColor: colours.background.secondary }}>
          <button
            onClick={() => setShowTip(false)}
            className="absolute top-2 right-2 transition-colors hover:opacity-70"
            style={{ color: colours.text.muted }}
            aria-label="Close tip"
          >
            ✕
          </button>
          <p className="text-xs leading-relaxed pr-6" style={{ color: colours.text.secondary }}>
            <span className="font-medium">💡 Tip:</span> Click and drag the sliders to adjust how important each factor is to you.
          </p>
        </div>
      )}

      {hasChanges && (
        <div className="mt-4 flex gap-2 justify-end">
          <button
            onClick={handleResetChanges}
            disabled={isUpdating}
            className="px-3 py-1 text-sm disabled:opacity-50 hover:underline"
            style={{ color: colours.text.secondary }}
          >
            Reset
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={isUpdating}
            className="px-4 py-1 text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            style={{
              backgroundColor: colours.button.primary.background,
              color: colours.button.primary.text
            }}
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}
