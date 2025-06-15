"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { colours } from "@/styles/colours";
import { Warn } from "./Icons";
import { getAllergenInfo, getAllergenTagClasses, formatAllergenDisplay } from "@/utils/allergens";

interface AllergenWarningProps {
  allergenWarnings: string[];
  isVisible: boolean;
  onClose: () => void;
  onProceed: () => void;
}

export default function AllergenWarning({ allergenWarnings, isVisible, onClose, onProceed }: AllergenWarningProps) {
  const router = useRouter();

  // Handle body scroll locking for mobile
  useEffect(() => {
    if (isVisible) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  const handleBackToSearch = () => {
    router.push('/search');
  };

  const handleProceed = () => {
    onProceed();
    onClose();
  };

  if (!allergenWarnings || allergenWarnings.length === 0 || !isVisible) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="flex items-center justify-center min-h-full w-full">
          {/* Modal */}
          <div 
            className="bg-white rounded-xl shadow-2xl border-2 max-w-md w-full mx-4 transform transition-all duration-300 scale-100 my-8"
            style={{ 
              borderColor: colours.status.error.border,
            }}
          >
          {/* Header */}
          <div 
            className="px-6 py-4 border-b flex items-center gap-3 rounded-t-xl"
            style={{ 
              backgroundColor: `${colours.status.error.background}99`,
              borderBottomColor: colours.status.error.border,
            }}
          >
            <span 
              className="text-2xl"
              style={{ color: colours.status.error.icon }}
            >
              <Warn/>
            </span>
            <h2 
              className="text-lg font-bold"
              style={{ color: colours.status.error.text }}
            >
              Allergen Warning
            </h2>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p 
              className="text-sm mb-4"
              style={{ color: colours.status.error.background }}
            >
              This product contains allergens that match your profile:
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <div className="flex flex-wrap gap-2">
                {allergenWarnings.map((allergen, index) => {
                  const allergenInfo = getAllergenInfo(allergen);
                  return allergenInfo ? (
                    <span
                      key={index}
                      className={getAllergenTagClasses()}
                    >
                      {formatAllergenDisplay(allergenInfo)}
                    </span>
                  ) : (
                    <span
                      key={index}
                      className={getAllergenTagClasses()}
                    >
                      {allergen.replace(/-/g, ' ')}
                    </span>
                  );
                })}
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Would you like to go back to search for alternatives, or proceed with viewing this product?
            </p>
          </div>

          {/* Footer with buttons */}
          <div className="px-6 py-4 border-t bg-gray-50 flex gap-3 justify-end rounded-b-xl">
            <button
              onClick={handleBackToSearch}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Search
            </button>
            <button
              onClick={handleProceed}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
              style={{ 
                backgroundColor: colours.status.error.background,
                borderColor: colours.status.error.border,
              }}
            >
              Proceed Anyway
            </button>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
