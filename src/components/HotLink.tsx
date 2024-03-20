'use client';

import React, { ReactElement } from 'react';
import Link from 'next/link';
import { useHotNavigation } from '../context/HotNavProvider';

interface HotLinkProps {
  href: string;
  children: React.ReactNode;
}


const HotLink: React.FC<HotLinkProps> = ({ href, children }): ReactElement => {
  const { testVar } = useHotNavigation();


  console.log('testVar', testVar)

  return (
    <Link href={href}>
      {children}
    </Link>

  )
};

export default HotLink;