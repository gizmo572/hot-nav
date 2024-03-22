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
  const { registerLink, unregisterLink, hotkeysActivated, links, addCustomStyles } = useHotNavigation();
  const id = useRef<string>(crypto.randomUUID());
  const linkRef = useRef(null);
  const [highlightNumber, setHighlightNumber] = useState<number | null>(null);
  const [darkText, setDarkText] = useState<boolean>(true);
  const [textColorRegistered, setTextColorRegistered] = useState<boolean>(false);
  const [childIsButton, setChildIsButton] = useState<boolean | null>(null);
  const [childrenForBtn, setChildrenForBtn] = useState()
  const [containsImage, setContainsImage] = useState(false);

  const { className, href, style, ...otherProps } = rest;

  const textStyles = {
    color: darkText ? 'navy' : 'yellow',
    background: darkText ? 'yellow' : 'navy',
    WebkitTextFillColor: darkText ? 'navy' : 'yellow',
    borderRadius: '5px',
    padding: '5px',
  }

  const btnStyles = {
    textAlign: 'center',
  }

  
  useEffect(() => {
    if (!childIsButton) return;
    const newChildren = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        console.log('child', href, child)
        const childProps = child.props as { children?: React.ReactNode };
        if (typeof childProps.children === 'string') {
          return React.cloneElement(child, {
            ...childProps,
            children: `${highlightNumber} ${childProps.children}`,
          } as any)
        }
      }
      return child;
    })
    setChildrenForBtn(newChildren);
  }, [highlightNumber, childIsButton])
  
  useEffect(() => {
    let btnFound = false;
    React.Children.forEach(children, child => {
      const childProps = child.props as { children?: React.ReactNode };
      if (childProps && 'src' in childProps) setContainsImage(true);
      if (React.isValidElement(child) && child.type === 'button') {
        btnFound = true;
        return;
      };
    });
    setChildIsButton(btnFound);

    if (linkRef.current) {
      const textColor = window.getComputedStyle(linkRef.current).color;
      const makeTextDark = textColor.startsWith('rgb(') && chroma(textColor).luminance() > 0.6 ? true : false;
      setDarkText(makeTextDark);
      setTextColorRegistered(true);
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
          style={{...style, ...(hotkeysActivated && addCustomStyles && textColorRegistered && !containsImage? textStyles : {}), ...(containsImage && {fontWeight: 'bolder'})}}
          className={className || ''}
          {...otherProps}
        >
          {[highlightNumber && `${highlightNumber} `, children]}
        </Link> :
      childIsButton === false ?
        <button
          ref={linkRef}
          style={{...style, ...(hotkeysActivated && addCustomStyles && textColorRegistered ? btnStyles : {})}}
          className={className || ''}
          {...otherProps}
        >
          {[highlightNumber && `${highlightNumber} `, children]}
        </button> :
        <div
          ref={linkRef}
          style={style}
          className={className || ''}
          {...otherProps}
        >
          {[highlightNumber ? childrenForBtn : children]}
        </div>
      }
    </>

  );
};

export default HotLink;