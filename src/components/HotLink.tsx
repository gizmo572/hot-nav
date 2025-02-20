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
  const linkRef = useRef<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement | null>(null);
  const hrefRef = useRef<string | null>(null);
  const onClickRef = useRef<React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement> | null>(null);
  const [highlightNumber, setHighlightNumber] = useState<number | null>(null);
  const [darkText, setDarkText] = useState<boolean>(true);
  const [textColorRegistered, setTextColorRegistered] = useState<boolean>(false);
  const [childIsButton, setChildIsButton] = useState<boolean | null>(null);
  const [childrenForBtn, setChildrenForBtn] = useState<React.ReactNode | null>(null);
  const [containsImage, setContainsImage] = useState(false);
  const [triggerCloneButton, setTriggerCloneButton] = useState(false);

  const { className, href, style, onClick, ...otherProps } = rest;

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
    // only clone the children of a HotLink component wrapping a button element, and only clone the element after the children have been analyzed (triggerCloneButton set to true)
    if (!childIsButton || !triggerCloneButton) return;
    const getNewChildren = (children: React.ReactNode): React.ReactNode => {

      // accepts a React element (button) and returns a clone of this element with the hotkey number prepended to the children
      const addHighlightNumber = (element: React.ReactElement) => {
        const { href, onClick, ...otherProps } = element.props;
        return React.cloneElement(
          element,
          {...otherProps, onClick: undefined},
          <>
            <span className="highlight-number whitespace-pre">
              {highlightNumber}&nbsp;
            </span>
            {getNewChildren(element.props.children)}
          </>
        );
      };

      // recursively clones the children of a HotLink component that is wrapping a button element and prepends the hotkey number to the children of the button
      return React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === 'button' || child.type === 'a' || (typeof child.type === 'object' && 'displayName' in child.type && (child.type as any).displayName === 'Button')) {
            return addHighlightNumber(child);
          } else if (React.isValidElement(child.props.children) || Array.isArray(child.props.children)) {
            const { href, onClick, ...otherProps } = child.props;
            return React.cloneElement(child, {...otherProps, onClick: undefined}, getNewChildren(child.props.children));
          }
        }
        return child;
      });
    };
    const newChildren = getNewChildren(children);
    setChildrenForBtn(newChildren);
    setTriggerCloneButton(false);
  }, [highlightNumber, childIsButton, triggerCloneButton])


  useEffect(() => {
    if (triggerCloneButton || !highlightNumber) return;
    let btnFound = false;
    let hrefFound = false;
    let onClickFound = false;
    const seen: any[] = []
    
    if (onClick && typeof onClick === 'function') {
      onClickFound = true;
      onClickRef.current = onClick;
    }

    if (href) {
      hrefFound = true;
      hrefRef.current = href;
    }

    const analyzeChildrenComponents = async (children: any) => {
      React.Children.forEach(children, child => {
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
        if (child.type === 'button' || (typeof child.type === 'object' && child.type.displayName === 'Button')) {
          btnFound = true;
        }
        if (typeof child.type === 'function') {
          const x = child.type.prototype ? new child.type({children}).render() : child.type({children})
          if (!seen.includes(child.type.name)) {
            seen.push(child.type.name);
            analyzeChildrenComponents(x);
          }
        }

        if (Object.hasOwn(childProps, 'children') && childProps.children && typeof childProps.children != 'string') {
          analyzeChildrenComponents(childProps.children);
        }
      });
    }
    analyzeChildrenComponents(children);
    setChildIsButton(btnFound);
    if (btnFound) setTriggerCloneButton(true);

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
    <>
      {hrefRef.current ?
        <Link
          ref={linkRef as React.Ref<HTMLAnchorElement>}
          href={hrefRef.current}
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
          <div style={highlightNumber ? {pointerEvents: 'none'} : {}}>
            {[highlightNumber && `${highlightNumber} `, children]}
          </div>
        </Link> :
      childIsButton === false ?
        <button
          ref={linkRef as React.Ref<HTMLButtonElement>}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            if (highlightNumber) {
              onClickRef.current && onClickRef.current(e);
            } else if (onClick) {
              onClick(e);
            }
          }}
          style={{...style, ...(hotkeysActivated && addCustomStyles && textColorRegistered ? btnStyles : {})}}
          className={className || ''}
          {...otherProps}
        >
          <div style={highlightNumber ? {pointerEvents: 'none'} : {}}>
            {[highlightNumber && highlightNumber, children]}
          </div>
        </button> :
        <div
          ref={linkRef as React.Ref<HTMLDivElement>}
          onClick={highlightNumber || onClick ? (e: React.MouseEvent<HTMLDivElement>) => { e.stopPropagation(); onClickRef.current ? onClickRef.current(e) : (() => {}) } : undefined}
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