type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'info' | 'success' | 'light';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  fullWidth?: boolean;
};

export default function Button({
  children,
  variant = 'primary',
  rounded = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base = `
    px-4 py-2.5 font-medium transition
    focus:outline-none focus:ring-2 focus:ring-offset-1
    disabled:opacity-70 disabled:cursor-not-allowed
  `;

  const variants: Record<string, string> = {
    primary: `
      text-white
      bg-[#0C8BDA] dark:bg-[#3B82F6]
      hover:bg-[#0A7AC2] dark:hover:bg-[#2563EB]
      focus:ring-[#0C8BDA] dark:focus:ring-[#3B82F6]
    `,
    secondary: `
      bg-[#E5E7EB] dark:bg-gray-700
      text-[#1F2937] dark:text-gray-200
      hover:bg-[#D1D5DB] dark:hover:bg-gray-600
      focus:ring-[#9CA3AF] dark:focus:ring-gray-500
    `,
    danger: `
      text-white
      bg-[#DC2626]
      hover:bg-[#B91C1C]
      focus:ring-[#EF4444]
    `,
    warning: `
      text-[#111827]
      bg-[#FACC15]
      hover:bg-[#EAB308]
      focus:ring-[#FACC15]
    `,
    info: `
      text-white
      bg-[#06B6D4]
      hover:bg-[#0891B2]
      focus:ring-[#06B6D4]
    `,
    success: `
      text-white
      bg-[#16A34A]
      hover:bg-[#15803D]
      focus:ring-[#22C55E]
    `,
    light: `
      text-[#111827] dark:text-gray-200
      hover:bg-[#F3F4F6] dark:hover:bg-gray-800
      focus:ring-[#D1D5DB] dark:focus:ring-gray-600
    `,
  };

  const roundedClasses: Record<string, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  return (
    <button
      className={`
        ${base}
        ${disabled ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-0' : variants[variant]}
        ${roundedClasses[rounded]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
