/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * KmplLogo Component.
 * Displays the official KMPL Season 01 tournament emblem
 * with rich animations (floating motion, golden trophy aura glow, and metallic shimmer sweep).
 */

import React from 'react';

interface KmplLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  withGlow?: boolean;
  withFloat?: boolean;
}

export const KmplLogo: React.FC<KmplLogoProps> = ({
  size = 'md',
  className = '',
  withGlow = true,
  withFloat = true,
}) => {
  const sizeClasses = {
    xs: 'w-8 h-8 rounded-lg',
    sm: 'w-10 h-10 rounded-xl',
    md: 'w-14 h-14 rounded-2xl',
    lg: 'w-24 h-24 rounded-3xl',
    hero: 'w-32 h-32 sm:w-36 sm:h-36 rounded-3xl',
  };

  const imagePath = '/assets/aistudio/image_5750192e.png';

  return (
    <div
      className={`
        relative inline-flex items-center justify-center shrink-0
        ${sizeClasses[size]}
        ${withFloat ? 'animate-kmpl-float' : ''}
        ${withGlow ? 'animate-kmpl-glow' : ''}
        group transition-transform duration-300 hover:scale-105 active:scale-95
        bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500
        p-[2px] shadow-lg
        ${className}
      `}
    >
      <div className="w-full h-full rounded-[inherit] overflow-hidden bg-slate-900 kmpl-shine-effect flex items-center justify-center">
        <img
          src={imagePath}
          alt="KMPL Cricket — Kagalagere Megala Hatti Premier League Official Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain transform transition-transform duration-500 group-hover:scale-110 drop-shadow-md"
          onError={(e) => {
            // Elegant CSS fallback if image asset is unavailable
            const target = e.currentTarget;
            target.style.display = 'none';
            if (target.parentElement) {
              target.parentElement.innerHTML = '<span class="text-2xl font-black text-amber-300">🏏</span>';
            }
          }}
        />
      </div>
    </div>
  );
};
