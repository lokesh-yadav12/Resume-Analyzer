import React from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = 'md',
  icon,
  onRemove,
  className,
  ...props
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 border border-gray-200',
    primary: 'bg-blue-100 text-blue-800 border border-blue-200',
    secondary: 'bg-purple-100 text-purple-800 border border-purple-200',
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    danger: 'bg-red-100 text-red-800 border border-red-200',
    info: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
    gradient: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const roundedStyles = {
    none: 'rounded-none',
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium transition-all duration-200',
        variants[variant],
        sizes[size],
        roundedStyles[rounded],
        className
      )}
      {...props}
    >
      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1.5 hover:bg-black/10 rounded-full p-0.5 transition-colors"
          aria-label="Remove"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};

export default Badge;
