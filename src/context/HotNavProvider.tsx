'use client';

import React, { ReactElement, createContext, useContext, useEffect, useState } from 'react';


const HotNavigationContext = createContext({
  testVar: '',
});

export const useHotNavigation = () => useContext(HotNavigationContext);


export const HotNavigationProvider: React.FC<{children: React.ReactNode}> = ({ children }): ReactElement => {
  console.log('HELLO WORLD FROM HOT-NAV!!!');
  const testVar = 'GREETINGS FROM HOT-NAV!!!!';

  const [hotkeysActivated, setHotKeysActivated] = useState(false);

  useEffect(() => {
    console.log('hotkeysActivated', hotkeysActivated)
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log(`${e.key} PRESSED!!!`);
      if (e.key == 'Control') {
        setHotKeysActivated((prev) => !prev);
      }
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

  }, [hotkeysActivated]);

  return (
    <HotNavigationContext.Provider value={{ testVar }} >
      {children}
    </HotNavigationContext.Provider>
  );
};