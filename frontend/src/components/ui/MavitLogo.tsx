'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface MavitLogoProps {
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
};

const textSizeMap = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
};

export const MavitLogo: React.FC<MavitLogoProps> = ({ 
  size = 'md', 
  className = '', 
  showText = false,
  textSize = 'md'
}) => {
  const logoSize = typeof size === 'number' ? size : sizeMap[size];
  const textClass = textSizeMap[textSize];

  return (
    <div className={cn('flex items-center', className)}>
      {/* Real Mavit Logo */}
      <Image
        src="/images/mavit-logo.png"
        alt="Mavit Logo"
        width={logoSize}
        height={logoSize}
        className="flex-shrink-0 object-contain"
        priority
      />
      
      {/* Optional text */}
      {showText && (
        <span className={cn('font-bold text-white ml-3', textClass)}>
          Mavit
        </span>
      )}
    </div>
  );
};

export default MavitLogo;