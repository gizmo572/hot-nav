'use client';

import React, { ReactElement } from 'react';
import Link from 'next/link';
import { useHotNavigation } from '../context/HotNavProvider';


const HotLink: React.FC<{children: React.ReactNode}> = ({ children }): ReactElement => {
  const { testVar } = useHotNavigation();
  console.log('testVar', testVar)

  return (
    <Link href={'/'}>
      {children}
    </Link>

  )
};

export default HotLink;