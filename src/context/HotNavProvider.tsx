'use client';

import React, { ReactElement, createContext, useContext } from 'react';


const HotNavigationContext = createContext({
  testVar: '',
});

export const useHotNavigation = () => useContext(HotNavigationContext);


export const HotNavigationProvider: React.FC<{children: React.ReactNode}> = ({ children }): ReactElement => {
  console.log('HELLO WORLD FROM HOT-NAV!!!');
  const testVar = 'GREETINGS FROM HOT-NAV!!!!';

  return (
    <HotNavigationContext.Provider value={{ testVar }} >
      {children}
    </HotNavigationContext.Provider>
  );
};