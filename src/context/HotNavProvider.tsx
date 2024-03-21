'use client';

import React, { ReactElement, createContext, useCallback, useContext, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { mapKeyToIndex } from '../lib/hotKeyMap';

interface _Link {
  id: string;
  href: string;
};

interface HotNavContextType {
  registerLink: (href: string, id: string) => void;
  unregisterLink: (id: string) => void;
  hotkeysActivated: boolean;
  links: _Link[];
}


const HotNavigationContext = createContext<HotNavContextType>({
  registerLink: () => {},
  unregisterLink: () => {},
  hotkeysActivated: false,
  links: [],
});

export const useHotNavigation = () => useContext(HotNavigationContext);


export const HotNavigationProvider: React.FC<{children: any}> = ({ children }): ReactElement => {
  const [links, setLinks] = useState<_Link[]>([]);
  const [hotkeysActivated, setHotKeysActivated] = useState<boolean>(false);
  const [routerDebounce, setRouterDebounce] = useState<boolean>(false);
  const currentlyPressedKeysRef = useRef<Set<string>>(new Set());

  const router = useRouter();

  const registerLink = useCallback((id: string, href: string) => {
    setLinks((prev) => [...prev, { id, href }]);
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
      if (index && index >= 0 && index < links.length) router.push(links[index].href);
      setRouterDebounce(true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (routerDebounce && currentlyPressedKeysRef.current.size == 1) setRouterDebounce(false);
      const key = e.key.toLowerCase();
      currentlyPressedKeysRef.current.delete(key);
      if (hotkeysActivated && !routerDebounce && /^[1-9]$/i.test(e.key) && parseInt(e.key) <= links.length) {
        router.push(links[parseInt(key) - 1].href);
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
    <HotNavigationContext.Provider value={{ registerLink, unregisterLink, hotkeysActivated, links }} >
      {children}
    </HotNavigationContext.Provider>
  );
};