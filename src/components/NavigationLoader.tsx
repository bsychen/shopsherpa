"use client";

import { useTopBar } from "@/contexts/TopBarContext";
import LoadingAnimation from "@/components/LoadingSpinner";
import { colours } from "@/styles/colours";

export default function NavigationLoader() {
  const { topBarState } = useTopBar();

  if (!topBarState.isNavigating) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-40 flex flex-col items-center justify-start pt-20"
      style={{ 
        backgroundColor: colours.background.secondary
      }}
    >
      <LoadingAnimation />
    </div>
  );
}
