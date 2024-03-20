'use client';

import React, { ReactElement, createContext, useContext, useEffect, useState, useRef } from 'react';


const HotNavigationContext = createContext({
  testVar: '',
});

export const useHotNavigation = () => useContext(HotNavigationContext);


export const HotNavigationProvider: React.FC<{children: React.ReactNode}> = ({ children }): ReactElement => {
  const testVar = 'GREETINGS FROM HOT-NAV!!!!';

  const [hotkeysActivated, setHotKeysActivated] = useState<boolean>(false);
  const currentlyPressedKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    console.log('hotkeysActivated', hotkeysActivated)
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key == 'control') {
        setHotKeysActivated((prev) => !prev);
      }
      if (!hotkeysActivated || currentlyPressedKeysRef.current.has(key) || !/^[1-9]$/i.test(key)) return;
      console.log(`${key} PRESSED!!!`);
      currentlyPressedKeysRef.current.add(key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (!hotkeysActivated || !currentlyPressedKeysRef.current.has(key) || !/^[1-9]$/i.test(key)) return;
      console.log(`${key} LIFTED!!!`)
      currentlyPressedKeysRef.current.delete(key);
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