'use client';

import React, { ReactElement, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useHotNavigation } from '../context/HotNavProvider';
import { mapIndexToKey } from '../lib/hotKeyMap';
import chroma from 'chroma-js';

interface HotLinkProps extends React.AriaAttributes, React.DOMAttributes<HTMLElement> {
  href: string;
  children: React.ReactNode;
  [key: string]: any;
}


const HotLink: React.FC<HotLinkProps> = ({ href, children, ...rest }): ReactElement => {
  const { registerLink, unregisterLink, hotkeysActivated, links } = useHotNavigation();
  const id = useRef<string>(crypto.randomUUID());
  const linkRef = useRef(null);
  const [highlightNumber, setHighlightNumber] = useState<number | null>(null);
  const [darkText, setDarkText] =useState<boolean>(false);

  const textStyles = {
    color: darkText ? 'navy' : 'yellow',
    background: darkText ? 'yellow' : 'navy',
    WebkitTextFillColor: darkText ? 'navy' : 'yellow'
  }

  const { className, style, ...otherProps } = rest;

  useEffect(() => {
    if (linkRef.current) {
      const textColor = window.getComputedStyle(linkRef.current).color;
  
      const makeTextDark = chroma(textColor).luminance() > 0.7 ? true : false;
      setDarkText(makeTextDark);
    };

  }, []);

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
    <Link 
      ref={linkRef}
      href={href}
      style={{...style, ...(hotkeysActivated ? textStyles : {})}}
      className={className || ''}
    >
      {[highlightNumber && `${highlightNumber} `, children]}
    </Link>

  );
};

export default HotLink;