'use client';

import React, { ReactElement, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import chroma from 'chroma-js';
import { useHotNavigation } from '../context/HotNavProvider';
import { mapIndexToKey } from '../lib/hotKeyMap';

interface HotLinkProps extends React.AriaAttributes, React.DOMAttributes<HTMLElement> {
  children: any;
  [key: string]: any;
}


const HotLink: React.FC<HotLinkProps> = ({ children, ...rest }): ReactElement => {
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
  const { className, href, style, ...otherProps } = rest;

  useEffect(() => {
    if (linkRef.current) {
      const textColor = window.getComputedStyle(linkRef.current).color;
  
      const makeTextDark = chroma(textColor).luminance() > 0.7 ? true : false;
      setDarkText(makeTextDark);
    };

  }, []);

  useEffect(() => {
    registerLink(id.current, href);

    return () => {
      unregisterLink(id.current);
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
    <>
      {href ?
        <Link 
          ref={linkRef}
          href={href}
          style={{...style, ...(hotkeysActivated ? textStyles : {})}}
          className={className || ''}
          {...otherProps}
        >
          {[highlightNumber && `${highlightNumber} `, children]}
        </Link> :
        <button
          ref={linkRef}
          style={{...style, ...(hotkeysActivated ? textStyles : {})}}
          className={className || ''}
          {...otherProps}
        >
          {[highlightNumber && `${highlightNumber} `, children]}
        </button>
      }
    </>

  );
};

export default HotLink;