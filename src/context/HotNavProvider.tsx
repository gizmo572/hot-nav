'use client';

import React, { ReactElement, createContext, useCallback, useContext, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { mapKeyToIndex } from '../lib/hotKeyMap';

interface _Link {
  id: string;
  simulateClick: Function;
};

interface HotNavContextType {
  registerLink: (id: string, simulateClick: Function) => void;
  unregisterLink: (id: string) => void;
  hotkeysActivated: boolean;
  links: _Link[];
  addCustomStyles: boolean;
}

interface HotNavProviderProps extends React.AriaAttributes, React.DOMAttributes<HTMLElement> {
  children: any;
  [key: string]: any;
}


const HotNavigationContext = createContext<HotNavContextType>({
  registerLink: () => {},
  unregisterLink: () => {},
  hotkeysActivated: false,
  links: [],
  addCustomStyles: true,
});

export const useHotNavigation = () => useContext(HotNavigationContext);


export const HotNavigationProvider: React.FC<HotNavProviderProps> = ({ children, ...otherProps }): ReactElement => {
  const {addCustomStyles=true, defaultHotKeysOn=true } = otherProps;
  const [links, setLinks] = useState<_Link[]>([]);
  const [hotkeysActivated, setHotKeysActivated] = useState<boolean>(defaultHotKeysOn);
  const [routerDebounce, setRouterDebounce] = useState<boolean>(false);
  const currentlyPressedKeysRef = useRef<Set<string>>(new Set());

  const router = useRouter();

  const registerLink = useCallback((id: string, simulateClick: Function) => {
    setLinks((prev) => [...prev, { id, simulateClick }]);
  }, []);

  const unregisterLink = useCallback((id: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
  }, []);

  useEffect(() => {
    // console.log('hotkeysActivated', hotkeysActivated, currentlyPressedKeysRef.current)
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key == 'control') {
        setHotKeysActivated((prev) => !prev);
      } else if (!currentlyPressedKeysRef.current.size) {
        currentlyPressedKeysRef.current.add(key);
        return;
      }
      if (!hotkeysActivated || currentlyPressedKeysRef.current.has(key) || !/^[1-9]$/i.test(key) || parseInt(key) > links.length) return;
      currentlyPressedKeysRef.current.add(key);
      let currentlyPressedKey;
      for (const el of currentlyPressedKeysRef.current) {
        if (/^[1-9]$/i.test(el)) {
          currentlyPressedKey = el;
          break;
        };
      };
      const index = mapKeyToIndex(parseInt(currentlyPressedKey + key));
      if (index && index >= 0 && index < links.length) {
        links[index].simulateClick();
      }
      setRouterDebounce(true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (routerDebounce && currentlyPressedKeysRef.current.size == 1) setRouterDebounce(false);
      const key = e.key.toLowerCase();
      currentlyPressedKeysRef.current.delete(key);
      if (hotkeysActivated && !routerDebounce && /^[1-9]$/i.test(e.key) && parseInt(e.key) <= links.length) {
        const link = links[parseInt(key) - 1];
        link.simulateClick();
      };
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    }

  }, [hotkeysActivated, routerDebounce, router, links]);

  return (
    <HotNavigationContext.Provider value={{ registerLink, unregisterLink, hotkeysActivated, links, addCustomStyles }} >
      {children}
    </HotNavigationContext.Provider>
  );
};