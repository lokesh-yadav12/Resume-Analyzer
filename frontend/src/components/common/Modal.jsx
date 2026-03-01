import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnOverlayClick ? onClose : undefined}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className={clsx(
                'bg-white rounded-2xl shadow-2xl w-full pointer-events-auto overflow-hidden',
                sizes[size],
                className
              )}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-start justify-between p-6 border-b border-gray-200">
                  <div className="flex-1">
                    {title && (
                      <h2 className="text-2xl font-bold text-gray-900">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="mt-1 text-sm text-gray-600">
                        {description}
                      </p>
                    )}
                  </div>
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="ml-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                      aria-label="Close modal"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  )}
                </div>
              )}

              {/* Body */}
              <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// Modal Footer Component
Modal.Footer = ({ children, className }) => (
  <div className={clsx('flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200', className)}>
    {children}
  </div>
);

export default Modal;
