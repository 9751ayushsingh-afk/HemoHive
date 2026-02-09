
'use client';

import Link, { LinkProps } from 'next/link';
import { useLoading } from '../contexts/LoadingContext';
import { ReactNode } from 'react';

interface LoaderLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
}

const LoaderLink = ({ children, className, ...props }: LoaderLinkProps) => {
  const { showLoader } = useLoading();

  const handleClick = () => {
    showLoader();
  };

  return (
    <Link {...props} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
};

export default LoaderLink;
