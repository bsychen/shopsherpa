"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { colours } from "@/styles/colours";
import { Warn } from "../../Icons";
import { getAllergenInfo, getAllergenTagClasses, getAllergenTagStyles, formatAllergenDisplay } from "@/utils/allergens";

interface AllergenWarningProps {
  allergenWarnings: string[];
  isVisible: boolean;
  onClose: () => void;
  onProceed: () => void;
}

export default function AllergenWarning({ allergenWarnings, isVisible, onClose, onProceed }: AllergenWarningProps) {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [contentAnimating, setContentAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      /* Prevent body scroll when modal is open */
      document.body.style.overflow = 'hidden';
      setShouldRender(true);
      setTimeout(() => {
        setIsAnimating(true);
        setTimeout(() => setContentAnimating(true), 100);
      }, 10);
    } else {
      setContentAnimating(false);
      setIsAnimating(false);
      setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = 'unset';
      }, 400);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  const handleClose = useCallback(() => {
    setContentAnimating(false);
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 400);
  }, [onClose]);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isVisible, handleClose]);

  const handleBackToSearch = () => {
    setContentAnimating(false);
    setIsAnimating(false);
    setTimeout(() => {
      router.push('/search');
      onClose();
    }, 400);
  };

  const handleProceed = () => {
    setContentAnimating(false);
    setIsAnimating(false);
    setTimeout(() => {
      onProceed();
      onClose();
    }, 400);
  };

  if (!allergenWarnings || allergenWarnings.length === 0 || !shouldRender) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black z-50 flex items-center justify-center p-4 overflow-y-auto transition-all duration-300 ${
          isAnimating ? 'bg-opacity-50 opacity-100' : 'bg-opacity-0 opacity-0'
        }`}
        onClick={(e) => {
          /* Close modal if clicking on backdrop (but not the modal itself) */
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        <div className="flex items-center justify-center min-h-full w-full">
          {/* Modal */}
          <div 
            className={`bg-white rounded-xl shadow-2xl border-2 max-w-md w-full mx-4 my-8 transform transition-all duration-300 ease-out ${
              isAnimating 
                ? 'scale-100 opacity-100 translate-y-0' 
                : 'scale-95 opacity-0 translate-y-4'
            }`}
            style={{ 
              borderColor: colours.status.error.border,
              animation: isAnimating 
                ? 'modalBounce 0.4s ease-out' 
                : shouldRender && !isAnimating 
                  ? 'modalExit 0.3s ease-in forwards'
                  : undefined,
            }}
          >
            {/* Header */}
            <div 
              className={`px-6 py-4 border-b flex items-center gap-3 transform transition-all duration-300 ${
                contentAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`
              }
              style={{ 
                backgroundColor: `${colours.status.error.background}99`,
                borderBottomColor: colours.status.error.border,
                transitionDelay: contentAnimating ? '0ms' : '50ms',
                borderTopLeftRadius: '0.75rem',
                borderTopRightRadius: '0.75rem', 
                marginTop: '-1px',
                marginLeft: '-1px',
                marginRight: '-1px',
                paddingLeft: '1.75rem', 
                paddingRight: '1.75rem'
              }}
            >
              <span 
                className={`text-2xl transform transition-all duration-300 ${
                  contentAnimating ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
                }`}
                style={{ 
                  color: colours.status.error.icon,
                  transitionDelay: contentAnimating ? '50ms' : '0ms',
                  animation: contentAnimating ? 'pulse 2s infinite' : undefined,
                }}
              >
                <Warn/>
              </span>
              <h2 
                className={`text-lg font-bold transform transition-all duration-300 ${
                  contentAnimating ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`
                }
                style={{ 
                  color: colours.status.error.text,
                  transitionDelay: contentAnimating ? '100ms' : '0ms',
                }}
              >
                Allergen Warning
              </h2>
            </div>

            {/* Content */}
            <div 
              className={`px-6 py-4 transform transition-all duration-300 ${
                contentAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`
              }
              style={{ 
                transitionDelay: contentAnimating ? '150ms' : '100ms' 
              }}
            >
              <p 
                className={`text-sm mb-4 transform transition-all duration-300 ${
                  contentAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`
                }
                style={{ 
                  color: colours.status.error.background,
                  transitionDelay: contentAnimating ? '200ms' : '80ms',
                }}
              >
                This product contains allergens that match your profile:
              </p>
              <div 
                className={`bg-red-50 border border-red-200 rounded-lg p-3 mb-6 transform transition-all duration-300 ${
                  contentAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`
                }
                style={{ 
                  transitionDelay: contentAnimating ? '250ms' : '60ms' 
                }}
              >
                <div className="flex flex-wrap gap-2">
                  {allergenWarnings.map((allergen, index) => {
                    const allergenInfo = getAllergenInfo(allergen);
                    return allergenInfo ? (
                      <span
                        key={index}
                        className={`${getAllergenTagClasses()} transform transition-all duration-300 ${
                          contentAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`
                        }
                        style={{
                          ...getAllergenTagStyles(),
                          transitionDelay: contentAnimating ? `${300 + index * 50}ms` : `${40 - index * 5}ms`,
                        }}
                      >
                        {formatAllergenDisplay(allergenInfo)}
                      </span>
                    ) : (
                      <span
                        key={index}
                        className={`${getAllergenTagClasses()} transform transition-all duration-300 ${
                          contentAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`
                        }
                        style={{
                          ...getAllergenTagStyles(),
                          transitionDelay: contentAnimating ? `${300 + index * 50}ms` : `${40 - index * 5}ms`,
                        }}
                      >
                        {allergen.replace(/-/g, ' ')}
                      </span>
                    );
                  })}
                </div>
              </div>
              <p 
                className={`text-sm text-gray-600 mb-6 transform transition-all duration-300 ${
                  contentAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`
                }
                style={{ 
                  transitionDelay: contentAnimating ? '400ms' : '20ms' 
                }}
              >
                Would you like to go back to search for alternatives, or proceed with viewing this product?
              </p>
            </div>

            {/* Footer with buttons */}
            <div 
              className={`px-6 py-4 border-t bg-gray-50 flex gap-3 justify-end rounded-b-xl transform transition-all duration-300 ${
                contentAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`
              }
              style={{ 
                transitionDelay: contentAnimating ? '450ms' : '0ms' 
              }}
            >
              <button
                onClick={handleBackToSearch}
                className={`px-4 py-2 text-sm font-medium shadow-xl text-gray-700 bg-white rounded-xl border-2 border-black p-3 rounded-lg transition-all duration-200 transform ${
                  contentAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}  active:scale-95`
                }
                style={{ 
                  transitionDelay: contentAnimating ? '500ms' : '0ms' 
                }}
              >
                Back to Search
              </button>

              <button
                onClick={handleProceed}
                className={`px-4 py-2 text-sm font-medium shadow-xl text-white rounded-xl border-2 border-black p-3 transition-all duration-200 transform ${
                  contentAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} active:scale-95 `
                }
                style={{ 
                  backgroundColor: colours.status.error.background,
                  borderColor: colours.status.error.border,
                  transitionDelay: contentAnimating ? '550ms' : '0ms',
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
