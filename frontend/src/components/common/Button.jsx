import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  className,
  ...props
}) => {
  const variants = {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    outline: 'btn btn-outline',
    ghost: 'btn btn-ghost',
    danger: 'btn bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 shadow-sm hover:shadow-md',
    success: 'btn bg-green-500 hover:bg-green-600 text-white focus:ring-green-500 shadow-sm hover:shadow-md'
  };

  const sizes = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
    xl: 'btn-xl'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={clsx(
        variants[variant],
        sizes[size],
        isDisabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};

export default Button;