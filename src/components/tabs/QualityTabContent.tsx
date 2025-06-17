import React from "react";
import { ReviewSummary } from "@/types/reviewSummary";
import { colours } from "@/styles/colours";
import StarIcon from "../Icons";

interface QualityTabContentProps {
  reviewSummary: ReviewSummary;
  animatedQuality: number;
}

const QualityTabContent: React.FC<QualityTabContentProps> = ({
  reviewSummary,
  animatedQuality,
}) => {
  return (
    <div className="w-full flex flex-col items-center opacity-0 animate-fade-in px-1" style={{ animationDelay: '0.05s' }}>
      <h2 
        className="text-lg font-bold mb-2 self-start"
        style={{ color: colours.text.primary }}
      >
        Reviews
      </h2>
      {/* Quality Score Card */}
      <div 
        className="w-full p-3 sm:p-4 rounded-xl border-2 mb-4"
        style={{ 
          backgroundColor: '#f1f5fb', // baby blue
          borderColor: colours.content.border
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col flex-1 min-w-0">
            <span 
              className="text-lg font-medium"
              style={{ color: colours.text.primary }}
            >
                Average Score
            </span>
            <span 
              className="text-[10px]"
              style={{ color: colours.text.muted }}
            >
              Based on user review ratings
            </span>
          </div>
          <div className="flex-shrink-0">
            <div 
              className="relative w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center"
              style={{
                borderColor: colours.score.medium,
                backgroundColor: colours.score.medium + '20', // 20% opacity
              }}
            >
              <span className="relative inline-block w-12 h-12 align-middle">
                <svg width="48" height="48" viewBox="0 0 48 48" className="absolute top-0 left-0" style={{ zIndex: 1 }}>
                  <circle
                    cx="24" cy="24" r="18"
                    fill="none"
                    stroke={colours.score.medium}
                    strokeWidth="3"
                    strokeDasharray={Math.PI * 2 * 18}
                    strokeDashoffset={Math.PI * 2 * 18 * (1 - (animatedQuality / 5))}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1), stroke 0.7s cubic-bezier(0.4,0,0.2,1)',
                      transform: 'rotate(-90deg)',
                      transformOrigin: 'center center',
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span 
                    className="text-xs font-bold"
                    style={{ color: colours.score.medium }}
                  >
                    {reviewSummary.averageRating?.toFixed(1)}
                  </span>
                </div>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Details Card */}
      <div 
        className="w-full p-3 sm:p-4 rounded-xl border-2"
        style={{ 
          backgroundColor: '#f1f5fb', // baby blue
          borderColor: colours.content.border
        }}
      >
        <div className="w-full min-w-0">
          <div className="flex items-baseline gap-2 mb-3">
            <span 
              className="text-lg font-medium"
              style={{ color: colours.text.primary }}
            >
              Review Summary
            </span>
          </div>
          <div className="w-full">
            <div 
              className="font-semibold mb-3 text-xs md:text-base"
              style={{ color: colours.text.primary }}
            >
              Rating Distribution
            </div>
            <div className="flex items-end justify-center gap-2 h-32 w-full px-4">
              {[1,2,3,4,5].map(star => {
                const count = Number(reviewSummary.ratingDistribution?.[star] || 0);
                const maxCount = Math.max(...[1,2,3,4,5].map(s => Number(reviewSummary.ratingDistribution?.[s] || 0)));
                const height = maxCount > 0 ? Math.max(8, (count / maxCount) * 100) : 8;
                
                return (
                  <div
                    key={star}
                    className="flex flex-col items-center group focus:outline-none"
                  >
                    <span 
                      className="text-[10px] mb-1"
                      style={{ color: colours.text.secondary }}
                    >
                      {count}
                    </span>
                    <div
                      className="rounded w-6 transition-all duration-700 animate-bar-grow"
                      style={{ 
                        height: `${height}px`, 
                        transition: 'height 0.7s cubic-bezier(0.4,0,0.2,1), background-color 0.3s ease',
                        backgroundColor: colours.score.medium
                      }}
                    />
                    <span 
                      className="text-[10px] mt-1 flex items-center"
                      style={{ color: colours.text.primary }}
                    >
                      {star}<StarIcon size={8} className="ml-0.5" />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityTabContent;
