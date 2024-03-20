'use client';

import React, { ReactElement, createContext, useContext, useEffect } from 'react';


const HotNavigationContext = createContext({
  testVar: '',
});

export const useHotNavigation = () => useContext(HotNavigationContext);


export const HotNavigationProvider: React.FC<{children: React.ReactNode}> = ({ children }): ReactElement => {
  console.log('HELLO WORLD FROM HOT-NAV!!!');
  const testVar = 'GREETINGS FROM HOT-NAV!!!!';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log(`${e.key} PRESSED!!!`);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      console.log(`${e.key} LIFTED!!!`)
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    }

  }, []);

  return (
    <HotNavigationContext.Provider value={{ testVar }} >
      {children}
    </HotNavigationContext.Provider>
  );
};