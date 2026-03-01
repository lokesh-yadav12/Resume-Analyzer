import React from 'react';
import { clsx } from 'clsx';

const Skeleton = ({ 
  variant = 'text', 
  width, 
  height, 
  className,
  count = 1,
  ...props 
}) => {
  const variants = {
    text: 'h-4 rounded',
    title: 'h-8 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'h-48 rounded-xl',
  };

  const skeletonElement = (
    <div
      className={clsx(
        'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
        variants[variant],
        className
      )}
      style={{
        width: width || '100%',
        height: height || (variant === 'circular' ? width : undefined),
        animation: 'shimmer 1.5s infinite',
      }}
      {...props}
    />
  );

  if (count === 1) {
    return skeletonElement;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{skeletonElement}</div>
      ))}
    </div>
  );
};

// Skeleton Card Component
Skeleton.Card = ({ className }) => (
  <div className={clsx('bg-white rounded-xl border border-gray-200 p-6 space-y-4', className)}>
    <div className="flex items-center space-x-4">
      <Skeleton variant="circular" width="48px" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="title" width="60%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
    <Skeleton variant="text" count={3} />
    <div className="flex space-x-2">
      <Skeleton width="80px" height="32px" className="rounded-lg" />
      <Skeleton width="80px" height="32px" className="rounded-lg" />
    </div>
  </div>
);

// Skeleton List Component
Skeleton.List = ({ count = 3, className }) => (
  <div className={clsx('space-y-4', className)}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4">
        <Skeleton variant="circular" width="40px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="50%" />
        </div>
      </div>
    ))}
  </div>
);

// Add shimmer animation to global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
  `;
  document.head.appendChild(style);
}

export default Skeleton;
