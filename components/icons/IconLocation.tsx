import React, { forwardRef } from 'react';

export type IconLocationProps = {
  /** size in px or any CSS unit (number treated as px) */
  size?: number | string;
  /** icon color (stroke for outline, fill for solid) */
  color?: string;
  /** outline or solid style */
  variant?: 'outline' | 'solid';
  /** optional numeric badge (e.g. number of places) */
  badge?: number;
  /** add a subtle pulse animation (for active location) */
  animate?: boolean;
  className?: string;
  title?: string;
  ariaLabel?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

/**
 * IconLocation — Redesigned
 * - More standard location-pin silhouette (like map markers)
 * - Cleaner SVG paths for crisp rendering at any size
 * - Proper handling of outline vs solid (stroke vs fill)
 * - Improved accessibility: aria-hidden when no label/title
 * - Tailwind-friendly wrapper
 *
 * Usage:
 * <IconLocation size={28} variant="outline" color="#06b6d4" />
 * <IconLocation size={40} variant="solid" color="#ef4444" badge={3} animate />
 */
const IconLocation = forwardRef<HTMLButtonElement, IconLocationProps>(
  (
    {
      size = 24,
      color = 'currentColor',
      variant = 'outline',
      badge,
      animate = false,
      className,
      title,
      ariaLabel,
      onClick,
    },
    ref
  ) => {
    const numericSize = typeof size === 'number' ? `${size}px` : size;
    const label = ariaLabel ?? title ?? '';

    const isSolid = variant === 'solid';
    const svgCommon: React.SVGProps<SVGSVGElement> = {
      width: numericSize,
      height: numericSize,
      viewBox: '0 0 24 24',
      xmlns: 'http://www.w3.org/2000/svg',
      role: label ? 'img' : undefined,
      'aria-hidden': label ? undefined : true,
    };

    // Standard pin path (common map marker) + inner circle
    const PinPath = (
      <path
        d="M12 2C8.134 2 5 5.134 5 9c0 4.418 5.5 10.742 6.164 11.46a1 1 0 0 0 1.672 0C13.5 19.742 19 13.418 19 9c0-3.866-3.134-7-7-7z"
        fill={isSolid ? color : 'none'}
        stroke={!isSolid ? color : 'none'}
        strokeWidth={!isSolid ? 1.5 : 0}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );

    const InnerCircle = (
      <circle
        cx="12"
        cy="9"
        r="2.6"
        fill={isSolid ? (color === 'currentColor' ? undefined : '#fff') : color}
        stroke={!isSolid ? color : 'none'}
        strokeWidth={!isSolid ? 1.2 : 0}
      />
    );

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-label={label || undefined}
        title={title}
        className={`relative inline-flex items-center justify-center p-0 bg-transparent border-0 ${
          animate ? 'animate-pulse-slow' : ''
        } ${className ?? ''}`}
        style={{ width: numericSize, height: numericSize }}
      >
        <svg {...svgCommon}>
          {title ? <title>{title}</title> : null}
          {PinPath}
          {InnerCircle}
        </svg>

        {typeof badge === 'number' && badge > 0 ? (
          <span
            className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full text-xs font-semibold leading-none"
            style={{
              minWidth: 18,
              height: 18,
              background: '#ef4444',
              color: '#fff',
              padding: '0 4px',
              boxShadow: '0 0 0 2px rgba(255,255,255,0.9)',
            }}
          >
            {badge > 99 ? '99+' : badge}
          </span>
        ) : null}

        <style jsx>{`
          @keyframes pulse-slow {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.06); opacity: 0.85; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-pulse-slow {
            animation: pulse-slow 1.6s ease-in-out infinite;
          }
        `}</style>
      </button>
    );
  }
);

IconLocation.displayName = 'IconLocation';

export default IconLocation;