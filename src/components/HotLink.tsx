'use client';

import React, { ReactElement, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useHotNavigation } from '../context/HotNavProvider';
import { mapIndexToKey } from '../lib/hotKeyMap';

interface HotLinkProps {
  href: string;
  children: React.ReactNode;
  [key: string]: any;
}


const HotLink: React.FC<HotLinkProps> = ({ href, children, ...rest }): ReactElement => {
  const { registerLink, unregisterLink, hotkeysActivated, links } = useHotNavigation();
  const id = useRef<string>(crypto.randomUUID());
  const [highlightNumber, setHighlightNumber] = useState<number | null>(null);

  const { className, style, ...otherProps } = rest;

  useEffect(() => {
    registerLink(id.current, href);
    // console.log(`${href} ${id.current} registered!`)

    return () => {
      unregisterLink(id.current);
      // console.log(`${href} ${id.current} unregistered!`)
    }

  }, [registerLink, unregisterLink]);

  useEffect(() => {
    if (!hotkeysActivated) return;
    const index = links.findIndex(link => link.id == id.current);
    setHighlightNumber(mapIndexToKey(index));

    return () => {
      setHighlightNumber(null);
    };
  }, [hotkeysActivated, links]);

  return (
    <Link href={href} style={style} className={className}>
      {[highlightNumber && `${highlightNumber} `, children]}
    </Link>

  );
};

export default HotLink;