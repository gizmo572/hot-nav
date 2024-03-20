'use client';

import React, { ReactElement, createContext, useContext, useEffect, useState, useRef } from 'react';


const HotNavigationContext = createContext({
  testVar: '',
});

export const useHotNavigation = () => useContext(HotNavigationContext);


export const HotNavigationProvider: React.FC<{children: React.ReactNode}> = ({ children }): ReactElement => {
  console.log('HELLO WORLD FROM HOT-NAV!!!');
  const testVar = 'GREETINGS FROM HOT-NAV!!!!';

  const [hotkeysActivated, setHotKeysActivated] = useState<boolean>(false);
  const currentlyPressedKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    console.log('hotkeysActivated', hotkeysActivated)
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (currentlyPressedKeysRef.current.has(key)) return;
      console.log(`${key} PRESSED!!!`);
      currentlyPressedKeysRef.current.add(key);
      if (key == 'Control') {
        setHotKeysActivated((prev) => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      console.log(`${key} LIFTED!!!`)
      currentlyPressedKeysRef.current.delete(key);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    }

  }, [hotkeysActivated, currentlyPressedKeysRef]);

  return (
    <HotNavigationContext.Provider value={{ testVar }} >
      {children}
    </HotNavigationContext.Provider>
  );
};