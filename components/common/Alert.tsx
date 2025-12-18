import { X } from 'lucide-react';
import React, { useState, ReactNode } from 'react';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  children: ReactNode;
  variant?: AlertVariant;
  onClose?: () => void;
  dismissible?: boolean;
  className?: string;
}

const variantClasses: Record<AlertVariant, string> = {
  success: 'bg-green-100 text-green-800 border-green-400',
  error: 'bg-red-100 text-red-800 border-red-400',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-400',
  info: 'bg-blue-100 text-blue-800 border-blue-400',
};

const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  onClose,
  dismissible = true,
  className = '',
}) => {
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    onClose?.(); // ✅ sửa lỗi lint
  };

  if (!visible) return null;

  return (
    <div
      className={`
        relative
        flex items-center justify-between
        border-l-4
        px-4 py-3
        rounded
        ${variantClasses[variant]}
        ${className}
      `}
      role="alert"
    >
      <div className="flex-1">{children}</div>

      {dismissible && (
        <button
          onClick={handleClose}
          className="ml-4 text-current hover:text-gray-700 focus:outline-none"
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
