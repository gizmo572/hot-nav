'use client';

import React, { ReactElement, useRef } from 'react';
import Link from 'next/link';
import { useHotNavigation } from '../context/HotNavProvider';

interface HotLinkProps {
  href: string;
  children: React.ReactNode;
}


const HotLink: React.FC<HotLinkProps> = ({ href, children }): ReactElement => {
  const { registerLink } = useHotNavigation();
  const id = useRef<string>(crypto.randomUUID());


  console.log('registerLink', registerLink)

  return (
    <Link href={href}>
      {children}
    </Link>

  )
};

export default HotLink;