import React, { forwardRef } from 'react';

/* ----------------------------- IconLocation ----------------------------- */
export type IconLocationProps = {
  size?: number | string;
  color?: string;
  variant?: 'outline' | 'solid';
  badge?: number;
  animate?: boolean;
  className?: string;
  title?: string;
  ariaLabel?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export const IconLocation = forwardRef<HTMLButtonElement, IconLocationProps>(
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

    const svgProps: React.SVGProps<SVGSVGElement> = {
      width: numericSize,
      height: numericSize,
      viewBox: '0 0 24 24',
      xmlns: 'http://www.w3.org/2000/svg',
      role: label ? 'img' : undefined,
      'aria-hidden': label ? undefined : true,
      fill: isSolid ? color : 'none',
      stroke: !isSolid ? color : 'none',
      strokeWidth: !isSolid ? 1.6 : 0,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    };

    const Pin = (
      <>
        <path d="M12 2C8.134 2 5 5.134 5 9c0 4.418 7 12 7 12s7-7.582 7-12c0-3.866-3.134-7-7-7z" />
        <circle cx="12" cy="9" r="2.6" />
      </>
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
        <svg {...svgProps}>{title ? <title>{title}</title> : null}{Pin}</svg>

        {typeof badge === 'number' && badge > 0 ? (
          <span
            className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full text-xs font-medium leading-none"
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
          @keyframes pulse-slow { 0% { transform: scale(1); opacity: 1 } 50% { transform: scale(1.06); opacity: .88 } 100% { transform: scale(1); opacity: 1 } }
          .animate-pulse-slow { animation: pulse-slow 1.6s ease-in-out infinite }
        `}</style>
      </button>
    );
  }
);
IconLocation.displayName = 'IconLocation';

/* ------------------------------- IconBell ------------------------------- */
export type IconBellProps = {
  size?: number | string;
  color?: string;
  variant?: 'outline' | 'solid';
  badge?: number | boolean;
  /** when true, bell performs a short ring animation once on mount */
  animate?: boolean;
  className?: string;
  title?: string;
  ariaLabel?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

/**
 * IconBell — redesigned to closely match a typical notification bell
 * - Proportions and paths taken from common UI iconography (Heroicons-like)
 * - Clear dome, shoulders, and clapper
 * - Outline uses stroke, solid uses fill (with clapper color adjusted for contrast)
 * - Short ring animation when `animate` is true
 */
export const IconBell = forwardRef<HTMLButtonElement, IconBellProps>(
  (
    {
      size = 20,
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

    const svgProps: React.SVGProps<SVGSVGElement> = {
      width: numericSize,
      height: numericSize,
      viewBox: '0 0 24 24',
      xmlns: 'http://www.w3.org/2000/svg',
      role: label ? 'img' : undefined,
      'aria-hidden': label ? undefined : true,
      fill: isSolid ? color : 'none',
      stroke: !isSolid ? color : 'none',
      strokeWidth: !isSolid ? 1.5 : 0,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    };

    // Outline path (inspired by Heroicons bell)
    const OutlineBell = (
      <>
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h11z" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </>
    );

    // Solid path (filled bell with clapper)
    const SolidBell = (
      <>
        <path d="M10 21a2 2 0 104 0h-4z" />
        <path d="M18 8a6 6 0 10-12 0v5c0 1.657-.895 3-2 3h16c-1.105 0-2-1.343-2-3V8z" />
      </>
    );

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-label={label || undefined}
        title={title}
        className={`relative inline-flex items-center justify-center p-0 bg-transparent border-0 ${
          animate ? 'bell-ring' : ''
        } ${className ?? ''}`}
        style={{ width: numericSize, height: numericSize }}
      >
        <svg {...svgProps}>{title ? <title>{title}</title> : null}{isSolid ? SolidBell : OutlineBell}</svg>

        {/* badge: number => pill, true => red dot */}
        {badge ? (
          typeof badge === 'number' ? (
            <span
              className="absolute -top-2 -right-2 inline-flex items-center justify-center rounded-full text-xs font-semibold leading-none"
              style={{
                minWidth: 18,
                height: 18,
                background: '#ef4444',
                color: '#fff',
                padding: '0 5px',
                boxShadow: '0 0 0 2px rgba(255,255,255,0.95)',
              }}
            >
              {badge > 99 ? '99+' : badge}
            </span>
          ) : (
            <span
              className="absolute -top-1 -right-1 inline-block rounded-full"
              style={{
                width: 10,
                height: 10,
                background: '#ef4444',
                boxShadow: '0 0 0 2px rgba(255,255,255,0.95)'
              }}
            />
          )
        ) : null}

        <style jsx>{`
          /* subtle bell ring animation */
          @keyframes bell-ring-keyframes {
            0% { transform: rotate(0deg); }
            15% { transform: rotate(14deg); }
            30% { transform: rotate(-10deg); }
            45% { transform: rotate(8deg); }
            60% { transform: rotate(-6deg); }
            75% { transform: rotate(4deg); }
            100% { transform: rotate(0deg); }
          }
          .bell-ring { transform-origin: center top; animation: bell-ring-keyframes 700ms cubic-bezier(.36,.07,.19,.97) both }

          /* shared pulse used by location */
          @keyframes pulse-slow { 0% { transform: scale(1); opacity: 1 } 50% { transform: scale(1.06); opacity: .88 } 100% { transform: scale(1); opacity: 1 } }
          .animate-pulse-slow { animation: pulse-slow 1.6s ease-in-out infinite }
        `}</style>
      </button>
    );
  }
);
IconBell.displayName = 'IconBell';

export default IconBell;