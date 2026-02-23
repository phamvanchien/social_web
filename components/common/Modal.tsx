"use client";
import React, { useCallback, useEffect, useId, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function useBodyScrollLock(locked: boolean) {
  useIsomorphicLayoutEffect(() => {
    if (!locked) return;
    const originalOverflow = document.body.style.overflow;
    const originalPadRight = document.body.style.paddingRight;

    // chống "nhảy layout" khi ẩn scrollbar
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPadRight;
    };
  }, [locked]);
}

function getFocusable(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];
  return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(","))).filter(
    (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
  );
}

// --------------------
// Types
// --------------------
export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  /** Optional description for a11y; hidden visually but read by SRs */
  description?: string;
  /** If provided, focus this element when modal opens */
  initialFocusRef?: React.RefObject<HTMLElement>;
  closeOnOverlay?: boolean; // default true
  closeOnEsc?: boolean; // default true
  showCloseButton?: boolean; // default true
  size?: ModalSize; // default "md"
  align?: "center" | "top"; // default "center"
  /** Panel className for extra styling overrides */
  className?: string;
  /** Render footer actions */
  footer?: React.ReactNode;
  /** Enable frosted glass overlay */
  overlayBlur?: boolean; // default true
  children: React.ReactNode;
};

// --------------------
// Component (instant open/close, no transitions)
// --------------------
export function Modal({
  open,
  onClose,
  title,
  description,
  initialFocusRef,
  closeOnOverlay = true,
  closeOnEsc = true,
  showCloseButton = true,
  size = "md",
  align = "center",
  className = "",
  footer,
  overlayBlur = true,
  children,
}: ModalProps) {
  const isBrowser =
    typeof window !== "undefined" && typeof document !== "undefined" && !!document.body;

  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  // Khóa cuộn khi mở
  useBodyScrollLock(open);

  // Lưu focus lúc mở & khôi phục khi đóng
  useEffect(() => {
    if (open) {
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
    } else {
      // khôi phục khi đóng
      lastFocusedRef.current?.focus?.();
    }
  }, [open]);

  // Focus element đầu tiên/được chỉ định khi mở
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const target = initialFocusRef?.current || getFocusable(panel)[0] || panel;
    target?.focus?.();
  }, [open, initialFocusRef]);

  // ESC để đóng (giống modal tham chiếu)
  useEffect(() => {
    if (!closeOnEsc) return;
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeOnEsc, onClose]);

  // Focus trap đơn giản
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = getFocusable(panel);
    if (focusables.length === 0) {
      e.preventDefault();
      (panel as HTMLElement).focus();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (e.shiftKey) {
      if (active === first || !panel.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  // Overlay click để đóng (chỉ khi click đúng overlay)
  const onOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!closeOnOverlay) return;
    if (e.target === e.currentTarget) onClose();
  };

  // Map size to Tailwind widths
  const sizeClass = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[min(100vw,90rem)]",
  }[size];

  // Align positioning
  const alignClass = align === "top" ? "items-start pt-14" : "items-center";

  if (!isBrowser || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex justify-center p-0 sm:p-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      onMouseDown={onOverlayMouseDown}
    >
      {/* Overlay (không transition để phản hồi ngay) */}
      <div
        className={`absolute inset-0 bg-black/50 ${
          overlayBlur ? "backdrop-blur-[2px]" : ""
        }`}
      />

      {/* Container */}
      <div className={`absolute inset-0 flex ${alignClass} justify-center overflow-y-auto`}>
        {/* Panel (không transition) */}
        <div
          ref={panelRef}
          tabIndex={-1}
          onKeyDown={onKeyDown}
          className={`relative w-full ${sizeClass} mx-4 sm:mx-6`}
        >
          <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 ${className}`}>
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="relative flex items-center justify-center px-5 pt-5">
                {title && (
                  <h2
                    id={titleId}
                    className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 text-center"
                  >
                    {title}
                  </h2>
                )}
                {description && <p id={descId} className="sr-only">{description}</p>}
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="cursor-pointer absolute right-5 top-5 inline-flex shrink-0 items-center justify-center rounded-xl p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-gray-800 hover:text-neutral-900 dark:hover:text-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
                    aria-label="Close modal"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 11-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd"/></svg>
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="px-5 py-4">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex flex-col-reverse gap-2 px-5 pb-5 sm:flex-row sm:justify-end">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function ModalPrimaryButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button
      {...props}
      className={`cursor-pointer inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-black/5 dark:ring-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:opacity-50 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 ${props.className ?? ""}`}
    />
  );
}

export function ModalSecondaryButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button
      {...props}
      className={`cursor-pointer inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-black/10 dark:ring-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:opacity-50 bg-white dark:bg-gray-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-gray-700 ${props.className ?? ""}`}
    />
  );
}
