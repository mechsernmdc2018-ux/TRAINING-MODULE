import React from 'react';

interface NMDCLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  alt?: string;
}

/**
 * Official NMDC Limited Brand Emblem
 * Strictly preserves the authentic uploaded NMDC Logo image as-is without any regeneration or modification.
 */
export const NMDCLogo: React.FC<NMDCLogoProps> = ({
  className = 'h-12 w-auto',
  size,
  alt = 'National Mineral Development Corporation (NMDC Limited)',
}) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <div
      className={`inline-flex items-center justify-center select-none ${className}`}
      style={style}
      title="National Mineral Development Corporation (NMDC Limited)"
    >
      <img
        src="/nmdc_logo.jpg"
        alt={alt}
        className="h-full w-auto max-h-full max-w-full object-contain pointer-events-none drop-shadow-xs"
        loading="eager"
      />
    </div>
  );
};

export default NMDCLogo;
