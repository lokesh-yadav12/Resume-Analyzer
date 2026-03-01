import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const Card = ({
  children,
  variant = 'default',
  hover = false,
  padding = 'md',
  className,
  onClick,
  ...props
}) => {
  const variants = {
    default: 'bg-white border border-gray-200 shadow-sm',
    elevated: 'bg-white shadow-lg border border-gray-100',
    outlined: 'bg-white border-2 border-gray-300',
    gradient: 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100',
    glass: 'bg-white/70 backdrop-blur-md border border-white/20 shadow-xl',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const hoverClasses = hover
    ? 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer'
    : '';

  const Component = hover ? motion.div : 'div';

  return (
    <Component
      className={clsx(
        'rounded-xl',
        variants[variant],
        paddings[padding],
        hoverClasses,
        className
      )}
      onClick={onClick}
      whileHover={hover ? { scale: 1.02 } : {}}
      {...props}
    >
      {children}
    </Component>
  );
};

// Card Header Component
Card.Header = ({ children, className }) => (
  <div className={clsx('mb-4 pb-4 border-b border-gray-200', className)}>
    {children}
  </div>
);

// Card Title Component
Card.Title = ({ children, className }) => (
  <h3 className={clsx('text-xl font-bold text-gray-900', className)}>
    {children}
  </h3>
);

// Card Description Component
Card.Description = ({ children, className }) => (
  <p className={clsx('text-sm text-gray-600 mt-1', className)}>
    {children}
  </p>
);

// Card Body Component
Card.Body = ({ children, className }) => (
  <div className={clsx('', className)}>
    {children}
  </div>
);

// Card Footer Component
Card.Footer = ({ children, className }) => (
  <div className={clsx('mt-4 pt-4 border-t border-gray-200', className)}>
    {children}
  </div>
);

export default Card;
