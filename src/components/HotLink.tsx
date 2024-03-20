'use client';

import React, { ReactElement, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useHotNavigation } from '../context/HotNavProvider';

interface HotLinkProps {
  href: string;
  children: React.ReactNode;
}


const HotLink: React.FC<HotLinkProps> = ({ href, children }): ReactElement => {
  const { registerLink, unregisterLink, hotkeysActivated, links } = useHotNavigation();
  const id = useRef<string>(crypto.randomUUID());
  const [highlightNumber, setHighlightNumber] = useState<number | null>(null);

  useEffect(() => {
    registerLink(id.current, href);
    console.log(`${href} ${id.current} registered!`)

    return () => {
      unregisterLink(id.current);
      console.log(`${href} ${id.current} unregistered!`)
    }

  }, [registerLink, unregisterLink]);

  useEffect(() => {
    if (!hotkeysActivated) return;
    const index = links.findIndex(link => link.id == id.current);
    setHighlightNumber(index + 1);

    return () => {
      setHighlightNumber(null);
    };
  }, [hotkeysActivated, links]);


  console.log('hotkeysActivated', hotkeysActivated, 'links',links)

  return (
    <Link href={href}>
      {[highlightNumber && `${highlightNumber} `, children]}
    </Link>

  )
};

export default HotLink;