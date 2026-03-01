import React, { useState, forwardRef } from 'react';
import { clsx } from 'clsx';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const Input = forwardRef(({
  label,
  type = 'text',
  error,
  success,
  helperText,
  placeholder,
  icon,
  iconPosition = 'left',
  showPasswordToggle = false,
  className,
  containerClassName,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const baseInputClasses = 'w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 placeholder-gray-400';

  const inputClasses = clsx(
    baseInputClasses,
    {
      'border-gray-300 focus:border-primary-500 focus:ring-primary-500': !error && !success,
      'border-red-300 focus:border-red-500 focus:ring-red-500': error,
      'border-green-300 focus:border-green-500 focus:ring-green-500': success,
      'pl-11': icon && iconPosition === 'left',
      'pr-11': (icon && iconPosition === 'right') || showPasswordToggle || error || success,
    },
    className
  );

  const labelClasses = clsx(
    'absolute left-4 transition-all duration-200 pointer-events-none',
    {
      'text-sm text-primary-600 -translate-y-6 bg-white px-1': isFocused || props.value,
      'text-gray-500 translate-y-3': !isFocused && !props.value,
      'text-red-600': error,
      'text-green-600': success,
    }
  );

  return (
    <div className={clsx('relative', containerClassName)}>
      {/* Floating Label */}
      {label && (
        <label className={labelClasses}>
          {label}
        </label>
      )}

      {/* Left Icon */}
      {icon && iconPosition === 'left' && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}

      {/* Input Field */}
      <input
        ref={ref}
        type={inputType}
        placeholder={isFocused ? placeholder : ''}
        className={inputClasses}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />

      {/* Right Side Icons */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
        {/* Success Icon */}
        {success && (
          <CheckCircle className="w-5 h-5 text-green-500" />
        )}

        {/* Error Icon */}
        {error && (
          <AlertCircle className="w-5 h-5 text-red-500" />
        )}

        {/* Password Toggle */}
        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Right Icon */}
        {icon && iconPosition === 'right' && !error && !success && (
          <div className="text-gray-400">
            {icon}
          </div>
        )}
      </div>

      {/* Helper Text or Error Message */}
      {(error || success || helperText) && (
        <div className={clsx(
          'mt-2 text-sm',
          {
            'text-red-600': error,
            'text-green-600': success,
            'text-gray-500': helperText && !error && !success,
          }
        )}>
          {error || success || helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;