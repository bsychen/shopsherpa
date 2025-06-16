"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

interface TopBarState {
  showBackButton: boolean;
  onBackClick?: () => void;
  isNavigating: boolean;
}

interface TopBarContextType {
  topBarState: TopBarState;
  setTopBarState: (state: Partial<TopBarState>) => void;
  resetTopBar: () => void;
  setNavigating: (isNavigating: boolean) => void;
}

const defaultState: TopBarState = {
  showBackButton: false,
  onBackClick: undefined,
  isNavigating: false,
};

const TopBarContext = createContext<TopBarContextType | undefined>(undefined);

export function TopBarProvider({ children }: { children: ReactNode }) {
  const [topBarState, setTopBarStateInternal] = useState<TopBarState>(defaultState);

  const setTopBarState = useCallback((newState: Partial<TopBarState>) => {
    setTopBarStateInternal(prev => ({ ...prev, ...newState }));
  }, []);

  const resetTopBar = useCallback(() => {
    setTopBarStateInternal(defaultState);
  }, []);

  const setNavigating = useCallback((isNavigating: boolean) => {
    setTopBarStateInternal(prev => ({ ...prev, isNavigating }));
  }, []);

  const contextValue = useMemo(() => ({
    topBarState,
    setTopBarState,
    resetTopBar,
    setNavigating
  }), [topBarState, setTopBarState, resetTopBar, setNavigating]);

  return (
    <TopBarContext.Provider value={contextValue}>
      {children}
    </TopBarContext.Provider>
  );
}

export function useTopBar() {
  const context = useContext(TopBarContext);
  if (context === undefined) {
    throw new Error('useTopBar must be used within a TopBarProvider');
  }
  return context;
}
