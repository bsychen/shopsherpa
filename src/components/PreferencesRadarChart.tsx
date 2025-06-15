"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Pencil } from 'lucide-react';
import { UserProfile } from '@/types/user';
import Image from 'next/image';
import { colours } from '@/styles/colours';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface PreferencesRadarChartProps {
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
  { key: 'pricePreference', label: 'Price', color: colours.bargraph.price.background, circleColor: colours.bargraph.price.border, svg: '/dollar-svgrepo-com.svg' },
  { key: 'qualityPreference', label: 'Quality', color: colours.bargraph.quality.background, circleColor: colours.bargraph.quality.border, svg: '/quality-supervision-svgrepo-com.svg' },
  { key: 'nutritionPreference', label: 'Nutrition', color: colours.bargraph.nutrition.background, circleColor: colours.bargraph.nutrition.border, svg: '/meal-svgrepo-com.svg' },
  { key: 'sustainabilityPreference', label: 'Sustainability', color: colours.bargraph.sustainability.background, circleColor: colours.bargraph.sustainability.border, svg: '/leaf-svgrepo-com.svg' },
  { key: 'brandPreference', label: 'Brand', color: colours.bargraph.brand.background, circleColor: colours.bargraph.brand.border, svg: '/prices-svgrepo-com.svg' },
];

const BUTTON_CONFIG: Record<string, { color: string; border: string; svg: string }> = {
  Price: {
    color: "bg-yellow-100",
    border: "border-yellow-200",
    svg: "/pound-svgrepo-com.svg",
  },
  Quality: {
    color: "bg-red-100",
    border: "border-red-200",
    svg: "/quality-supervision-svgrepo-com.svg",
  },
  Nutrition: {
    color: "bg-blue-100",
    border: "border-blue-200",
    svg: "/meal-svgrepo-com.svg",
  },
  Sustainability: {
    color: "bg-lime-100",
    border: "border-green-200",
    svg: "/leaf-svgrepo-com.svg",
  },
  Brand: {
    color: "bg-purple-100",
    border: "border-purple-200",
    svg: "/prices-svgrepo-com.svg",
  },
};

const DEFAULT_BTN_COLOR = "bg-zinc-100";
const DEFAULT_BTN_BORDER = "border-zinc-200";

export default function PreferencesRadarChart({ userProfile, onPreferencesUpdate, isUpdating = false }: PreferencesRadarChartProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [localPreferences, setLocalPreferences] = useState(() => {
    const prefs: Record<string, number> = {};
    preferences.forEach(pref => {
      prefs[pref.key] = userProfile[pref.key] || 1;
    });
    return prefs;
  });
  
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    setShowButtons(true);
  }, []);

  // Update local preferences when userProfile changes
  useEffect(() => {
    setLocalPreferences(() => {
      const prefs: Record<string, number> = {};
      preferences.forEach(pref => {
        prefs[pref.key] = userProfile[pref.key] || 1;
      });
      return prefs;
    });
    setHasChanges(false);
  }, [userProfile]);

  const handlePointerDown = useCallback((prefKey: string) => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(prefKey);
    
    const container = containerRefs.current[prefKey];
    if (container) {
      const rect = container.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const x = clientX - rect.left;
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

  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;

    const container = containerRefs.current[isDragging];
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const value = Math.round((percentage * 4 + 1) * 10) / 10;
    
    setLocalPreferences(prev => {
      const newPrefs = { ...prev, [isDragging]: value };
      
      const hasChanges = preferences.some(pref => 
        newPrefs[pref.key] !== (userProfile[pref.key] || 1)
      );
      setHasChanges(hasChanges);
      
      return newPrefs;
    });
  }, [isDragging, userProfile]);

  const handlePointerEnd = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      const handleMove = (e: MouseEvent | TouchEvent) => {
        // Prevent default to avoid scrolling on mobile
        e.preventDefault();
        handlePointerMove(e);
      };
      
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handlePointerEnd);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handlePointerEnd);
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handlePointerEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handlePointerEnd);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerEnd]);

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
      setIsEditMode(false);
    } catch (error) {
      console.error('Failed to save preferences:', error);
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

  const handleCancelEdit = () => {
    handleResetChanges();
    setIsEditMode(false);
  };

  // Prepare radar chart data
  const radarData = [
    localPreferences.pricePreference || 1,
    localPreferences.qualityPreference || 1,
    localPreferences.nutritionPreference || 1,
    localPreferences.sustainabilityPreference || 1,
    localPreferences.brandPreference || 1,
  ];

  const chartData = {
    labels: ["Price", "Quality", "Nutrition", "Sustainability", "Brand"].map(() => ""),
    datasets: [
      {
        label: "Preferences",
        data: radarData,
        backgroundColor: `${colours.chart.primary}80`,
        borderColor: `${colours.chart.grid}80`,
        borderWidth: 2,
        pointBackgroundColor: colours.chart.primary,
      },
    ],
  };

  const options: ChartOptions<"radar"> = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: { stepSize: 1, display: false },
        grid: { color: "#9CA3AF" },
        pointLabels: { color: colours.chart.text, font: { size: 16 } },
      },
    },
  };

  // Layout constants for radar chart
  const containerSize = 260;
  const btnBase = 40;
  const margin = 8;
  const radarPadding = 38;
  const maxRadius = (containerSize / 2) - (btnBase / 2) - margin;
  const minRadius = (containerSize / 2) - radarPadding;
  const buttonRadius = Math.max(minRadius, Math.min(maxRadius, 160));
  const center = containerSize / 2;
  const LABELS = ["Price", "Quality", "Nutrition", "Sustainability", "Brand"];
  const angleStep = (2 * Math.PI) / LABELS.length;
  const offset = 1.2;
  const verticalShift = 14;

  return (
    <div className="space-y-6">
      {/* Radar Chart */}
      <div className="flex flex-col items-center">
        <div className="relative flex items-center justify-center mb-4" style={{ width: containerSize, height: containerSize }}>
          {/* Edit Button - positioned in top right */}
          {!isEditMode && (
            <button
              onClick={() => setIsEditMode(true)}
              className="absolute top-2 right-2 z-10 px-3 py-1 text-sm rounded-lg transition-colors flex items-center gap-1"
              style={{
                backgroundColor: colours.button.secondary.background,
                color: colours.button.secondary.text
              }}
            >
              <Pencil size={16} />
              Edit
            </button>
          )}
          
          {/* Radar Chart */}
          <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center pointer-events-none">
            <Radar data={chartData} options={options} style={{ maxHeight: 240, maxWidth: 240 }} />
          </div>
          
          {/* Radar Buttons */}
          {LABELS.map((label, i) => {
            const angle = -Math.PI / 2 + i * angleStep;
            const x = center + buttonRadius * Math.cos(angle) * offset - btnBase / 2;
            const y = center + buttonRadius * Math.sin(angle) * offset - btnBase / 2 + verticalShift;
            const config = BUTTON_CONFIG[label] || { color: DEFAULT_BTN_COLOR, border: DEFAULT_BTN_BORDER, svg: preferences[i].svg };
            const delay = `${i * 80}ms`;
            
            return (
              <div
                key={label}
                className={`absolute flex items-center justify-center rounded-xl shadow-lg border-2 border-black ${config.color}`}
                style={{
                  left: x,
                  top: y,
                  width: btnBase,
                  height: btnBase,
                  zIndex: 2,
                  padding: 0,
                  opacity: showButtons ? 1 : 0,
                  transform: showButtons ? "scale(1)" : "scale(0.5)",
                  transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.45s cubic-bezier(0.4,0,0.2,1)",
                  transitionDelay: delay,
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
              >
                <Image
                  src={config.svg}
                  alt={label}
                  width={20}
                  height={20}
                  className="w-5 h-5 filter grayscale brightness-0 invert-0"
                  style={{ filter: "grayscale(1) brightness(0.6)" }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Mode - Bar Graphs */}
      {isEditMode && (
        <div className="space-y-4 transition-all duration-300">
          <div className="text-center">
            <h3 className="text-sm font-medium mb-4" style={{ color: colours.text.primary }}>
              Adjust Your Preferences
            </h3>
          </div>
          
          {preferences.map((pref, _index) => {
            const value = localPreferences[pref.key];
            const percentage = ((value - 1) / 4) * 100;
            
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
                  <span className="text-sm font-medium" style={{ color: colours.text.secondary }}>
                    {value.toFixed(1)}
                  </span>
                </div>
                
                <div 
                  ref={el => { containerRefs.current[pref.key] = el; }}
                  className={`relative h-8 rounded-lg cursor-pointer transition-all touch-manipulation`}
                  style={{
                    backgroundColor: colours.background.secondary,
                    minHeight: '44px', // iOS minimum touch target
                    ...(isDragging === pref.key && {
                      boxShadow: `0 0 0 2px ${colours.interactive.selected.background}`,
                    })
                  }}
                  onMouseDown={handlePointerDown(pref.key)}
                  onTouchStart={handlePointerDown(pref.key)}
                >
                  <div 
                    className={`h-full rounded-lg flex items-center justify-end pr-2 transition-all duration-300 ease-out`}
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: pref.color,
                    }}
                  >                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-sm border-2" 
                    style={{
                      backgroundColor: colours.card.background,
                      borderColor: pref.circleColor,
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

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <button
              onClick={handleCancelEdit}
              disabled={isUpdating}
              className="px-4 py-2 text-sm rounded-lg disabled:opacity-50  transition-opacity"
              style={{ 
                backgroundColor: colours.button.secondary.background,
                color: colours.button.secondary.text 
              }}
            >
              Cancel
            </button>
            {hasChanges && (
              <button
                onClick={handleResetChanges}
                disabled={isUpdating}
                className="px-3 py-2 text-sm disabled:opacity-50"
                style={{ color: colours.text.secondary }}
              >
                Reset
              </button>
            )}
            <button
              onClick={handleSaveChanges}
              disabled={isUpdating || !hasChanges}
              className="px-4 py-2 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              style={{
                backgroundColor: hasChanges ? colours.button.primary.background : colours.button.secondary.background,
                color: hasChanges ? colours.button.primary.text : colours.button.secondary.text
              }}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
