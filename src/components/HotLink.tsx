'use client';

import React, { ReactElement, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useHotNavigation } from '../context/HotNavProvider';

interface HotLinkProps {
  href: string;
  children: React.ReactNode;
}


const HotLink: React.FC<HotLinkProps> = ({ href, children }): ReactElement => {
  const { registerLink, unregisterLink, hotkeysActivated, links } = useHotNavigation();
  const id = useRef<string>(crypto.randomUUID());

  useEffect(() => {
    registerLink(id.current, href);
    console.log(`${href} ${id.current} registered!`)

    return () => {
      unregisterLink(id.current);
      console.log(`${href} ${id.current} unregistered!`)
    }

  }, [registerLink, unregisterLink])


  console.log('hotkeysActivated', hotkeysActivated, 'links',links)

  return (
    <Link href={href}>
      {children}
    </Link>

  )
};

export default HotLink;