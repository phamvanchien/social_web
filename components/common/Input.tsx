"use client";

import React, {
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  useState,
} from "react";
import clsx from "clsx";
import { AlertCircle } from "lucide-react";

type BaseProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  hint?: string;
  error?: string;
  errorMessages?: string[];
  size?: "sm" | "md" | "lg";
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  containerClassName?: string;
};

const sizeMap = {
  sm: "h-9 text-sm px-3",
  md: "h-11 text-sm px-4",
  lg: "h-12 text-base px-4",
} as const;

const baseInputClass =
  "w-full rounded-xl border border-blue-300/80 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 " +
  "focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-colors";

/** ----- khai báo type cho component + static subcomponent Password ----- */
type InputComponent = React.ForwardRefExoticComponent<
  BaseProps & React.RefAttributes<HTMLInputElement>
> & {
  Password: React.ForwardRefExoticComponent<
    Omit<BaseProps, "type"> & React.RefAttributes<HTMLInputElement>
  >;
};
/** --------------------------------------------------------------------- */

const InputImpl = forwardRef<HTMLInputElement, BaseProps>(function Input(
  {
    id,
    label,
    hint,
    error,
    errorMessages,
    size = "md",
    leftIcon,
    rightIcon,
    className,
    containerClassName,
    fullWidth = true,
    required,
    ...props
  },
  ref
) {
  const hasError = !!error || (errorMessages && errorMessages.length > 0);
  const describedBy = hasError
    ? (id ? `${id}-error` : undefined)
    : hint
    ? (id ? `${id}-hint` : undefined)
    : undefined;

  return (
    <div className={clsx(fullWidth && "w-full", containerClassName)}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={id}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={clsx(
            baseInputClass,
            sizeMap[size],
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            hasError && "border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900",
            className
          )}
          required={required}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 mt-1">
            {rightIcon}
          </span>
        )}
      </div>

      {hint && !hasError && (
        <p id={id ? `${id}-hint` : undefined} className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}

      {error && (
        <p id={id ? `${id}-error` : undefined} className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {errorMessages?.map((msg, idx) => (
        <p
          key={idx}
          id={id ? `${id}-error-${idx}` : undefined}
          className="mt-1 flex items-center text-xs text-red-600 dark:text-red-400"
        >
          <AlertCircle className="mr-1 h-4 w-4" />
          {msg}
        </p>
      ))}
    </div>
  );
});

/** Password subcomponent (forwardRef để giữ đúng type) */
const Password = forwardRef<HTMLInputElement, Omit<BaseProps, "type">>(
  function Password({ rightIcon, ...props }, ref) {
    const [show, setShow] = useState(false);

    return (
      <Input
        ref={ref}
        type={show ? "text" : "password"}
        autoComplete="current-password"
        {...props}
        rightIcon={
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
            aria-label={show ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {rightIcon ??
              (show ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 5.1A10.5 10.5 0 0122 12s-3.5 6-10 6a11 11 0 01-5.1-1.2M6.12 6.12A11 11 0 002 12s3.5 6 10 6"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              ))}
          </button>
        }
      />
    );
  }
);

/** Gán static property với type an toàn, không cần any */
const Input = InputImpl as InputComponent;
Input.Password = Password;

export default Input;
