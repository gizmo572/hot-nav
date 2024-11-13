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

function generateUUID() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  } else {
    // Fallback for browsers that do not support crypto.randomUUID()
    // You can use uuid library or another method here
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}


const HotLink: React.FC<HotLinkProps> = ({ children, ...rest }): ReactElement => {
  const { registerLink, unregisterLink, hotkeysActivated, links, addCustomStyles } = useHotNavigation();
  const id = useRef<string>(generateUUID());
  const linkRef = useRef<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement | null>(null);
  const hrefRef = useRef<string | null>(null);
  const onClickRef = useRef<React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement> | null>(null);
  const [highlightNumber, setHighlightNumber] = useState<number | null>(null);
  const [darkText, setDarkText] = useState<boolean>(true);
  const [textColorRegistered, setTextColorRegistered] = useState<boolean>(false);
  const [clonedChildren, setClonedChildren] = useState<React.ReactNode | null>(null);
  const [containsImage, setContainsImage] = useState(false);
  const [containsButton, setContainsButton] = useState(true);

  const { className, href, style, onClick, customHotKeyPlacement=false, ...otherProps } = rest;

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
    if (!highlightNumber) return;
    let hrefFound = false;
    let onClickFound = false;
    let btnFound = false;
    let highlightNumberAdded = false;
    const seen: any[] = []
    
    if (onClick && typeof onClick === 'function') {
      onClickFound = true;
      onClickRef.current = onClick;
    }

    if (href) {
      hrefFound = true;
      hrefRef.current = href;
    }

    // accepts a React element (button) and returns a clone of this element with the hotkey number prepended to the children
    const addHighlightNumber = (element: React.ReactElement) => {
      const { href, onClick, ...otherProps } = element.props;
      if (!Object.hasOwn(otherProps, 'children')) {
        return (
          <>
            {highlightNumber}&nbsp;
            {React.cloneElement(
              element,
              {...otherProps, onClick: undefined},
            )}
          </>
        )
      }
      return React.cloneElement(
        element,
        {...otherProps, onClick: undefined},
        <>
          {highlightNumber}&nbsp;
          {cloneChildren(element.props.children)}
        </>
      );
    };
    const cloneChildren = (children: React.ReactNode): React.ReactNode => {


      // recursively clones the children of a HotLink component that is wrapping a button element and prepends the hotkey number to the children of the button
      return React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const childProps = child.props;

          if (typeof childProps != 'object') return;

          if (Object.hasOwn(childProps, 'src')) setContainsImage(true);

          if (!hrefFound && Object.hasOwn(childProps, 'href')) {
            hrefFound = true;
            hrefRef.current = childProps.href;
          }

          if (!onClickFound && (Object.hasOwn(childProps, 'onClick'))) {
            onClickFound = true;
            onClickRef.current = childProps.onClick;
          }

          if (child.type === 'button' || (typeof child.type === 'object' && 'displayName' in child.type && (child.type as any).displayName === 'Button')) {
            btnFound = true;
          }

          if (!highlightNumberAdded) {
            if (!customHotKeyPlacement) {
              if (child.type === 'button' || child.type === 'a' || (typeof child.type === 'object' && 'displayName' in child.type && (child.type as any).displayName === 'Button') || typeof child.props.children === 'string' || !Object.hasOwn(childProps, 'children')) {
                highlightNumberAdded = true
                return addHighlightNumber(child);
              } else if (React.isValidElement(child.props.children) || Array.isArray(child.props.children)) {
                const { href, onClick, ...otherProps } = child.props;
                return React.cloneElement(child, {...otherProps, onClick: undefined}, cloneChildren(child.props.children));
              }
            } else {
              const classList = childProps.className ? childProps.className.split(' ') : []
              if (classList.includes('hot-nav')) {
                highlightNumberAdded = true
                return addHighlightNumber(child);
              } else if (React.isValidElement(child.props.children) || Array.isArray(child.props.children)) {
                const { href, onClick, ...otherProps } = child.props;
                return React.cloneElement(child, {...otherProps, onClick: undefined}, cloneChildren(child.props.children));
              }
            }
          }
        } else if (!highlightNumberAdded) {
          return React.createElement('span', {...otherProps, onClick: undefined},
            <>{highlightNumber}&nbsp; {child}</>
          )
        }
        return child;
      });
    };

    const newClonedChildren = cloneChildren(children);
    if (!btnFound) setContainsButton(false);
    setClonedChildren(newClonedChildren);

    if (linkRef.current) {
      const textColor = window.getComputedStyle(linkRef.current).color;
      const makeTextDark = textColor.startsWith('rgb(') && chroma(textColor).luminance() > 0.6 ? true : false;
      setDarkText(makeTextDark);
      setTextColorRegistered(true);
    };

  }, [children, highlightNumber]);

  useEffect(() => {
    const simulateClick = () => {
      if (linkRef.current) {
        linkRef.current.click();
      }
    }
    registerLink(id.current, simulateClick);

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
    href || hrefRef.current ?
      <Link
        ref={linkRef as React.Ref<HTMLAnchorElement>}
        href={href || hrefRef.current}
        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
          if (highlightNumber) {
            onClickRef.current && onClickRef.current(e);
          } else if (onClick) {
            onClick(e);
          }
        }}
        style={{...style, ...(hotkeysActivated && addCustomStyles && textColorRegistered && !containsImage? textStyles : {}), ...(containsImage && {fontWeight: 'bolder'})}}
        className={className || ''}
        {...otherProps}
      >
        {[highlightNumber ? clonedChildren : children]}
      </Link> : containsButton ?
      <div
        ref={linkRef as React.Ref<HTMLDivElement>}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          if (highlightNumber) {
            onClickRef.current && onClickRef.current(e);
          } else if (onClick) {
            onClick(e);
          }
        }}
        style={style}
        className={className || ''}
        {...otherProps}
      >
        {[highlightNumber ? clonedChildren : children]}
      </div> :
      <button
        ref={linkRef as React.Ref<HTMLButtonElement>}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          if (highlightNumber) {
            onClickRef.current && onClickRef.current(e);
          } else if (onClick) {
            onClick(e);
          }
        }}
        style={style}
        className={className || ''}
        {...otherProps}
      >
        {[highlightNumber ? clonedChildren : children]}
      </button>
  );
};

export default HotLink;