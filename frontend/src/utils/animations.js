// Framer Motion animation variants and configurations

// Page transition animations
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeInOut' }
};

// Fade animations
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.4, ease: 'easeOut' }
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: 'easeOut' }
};

// Scale animations
export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const scaleUp = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  exit: { scale: 0 },
  transition: { type: 'spring', stiffness: 200, damping: 15 }
};

// Slide animations
export const slideInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
  transition: { duration: 0.4, ease: 'easeOut' }
};

export const slideInRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 },
  transition: { duration: 0.4, ease: 'easeOut' }
};

// Stagger children animations
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

// Hover animations
export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { type: 'spring', stiffness: 400, damping: 17 }
};

export const hoverLift = {
  whileHover: { y: -4, boxShadow: '0 12px 24px -10px rgba(0, 0, 0, 0.15)' },
  transition: { duration: 0.3 }
};

export const hoverGlow = {
  whileHover: { 
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
    scale: 1.02
  },
  transition: { duration: 0.3 }
};

// Button animations
export const buttonTap = {
  whileTap: { scale: 0.95 },
  transition: { duration: 0.1 }
};

export const buttonHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { type: 'spring', stiffness: 400, damping: 17 }
};

// Card animations
export const cardHover = {
  rest: { scale: 1, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
  hover: { 
    scale: 1.02, 
    y: -4,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    transition: { duration: 0.3 }
  }
};

// Loading animations
export const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1]
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut'
  }
};

export const spin = {
  animate: { rotate: 360 },
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: 'linear'
  }
};

export const bounce = {
  animate: {
    y: [0, -10, 0]
  },
  transition: {
    duration: 0.6,
    repeat: Infinity,
    ease: 'easeInOut'
  }
};

// Modal/Overlay animations
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
};

export const modalContent = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
  transition: { type: 'spring', duration: 0.3 }
};

// Toast/Notification animations
export const toastSlideIn = {
  initial: { opacity: 0, x: 100, scale: 0.95 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 100, scale: 0.95 },
  transition: { type: 'spring', duration: 0.3 }
};

// Progress animations
export const progressBar = (progress) => ({
  initial: { width: 0 },
  animate: { width: `${progress}%` },
  transition: { duration: 0.5, ease: 'easeOut' }
});

// Skeleton loading animation
export const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0']
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'linear'
  }
};

// Number counter animation
export const counterAnimation = (from, to, duration = 1) => ({
  initial: { value: from },
  animate: { value: to },
  transition: { duration, ease: 'easeOut' }
});

// Scroll reveal animations
export const scrollReveal = {
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

// Floating animation
export const floating = {
  animate: {
    y: [0, -10, 0]
  },
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut'
  }
};

// Rotate animation
export const rotate = {
  animate: { rotate: [0, 360] },
  transition: {
    duration: 20,
    repeat: Infinity,
    ease: 'linear'
  }
};

// Wiggle animation
export const wiggle = {
  animate: {
    rotate: [0, -5, 5, -5, 5, 0]
  },
  transition: {
    duration: 0.5,
    ease: 'easeInOut'
  }
};

// Shake animation
export const shake = {
  animate: {
    x: [0, -10, 10, -10, 10, 0]
  },
  transition: {
    duration: 0.5,
    ease: 'easeInOut'
  }
};

// Success checkmark animation
export const checkmark = {
  initial: { pathLength: 0, opacity: 0 },
  animate: { pathLength: 1, opacity: 1 },
  transition: { duration: 0.5, ease: 'easeOut' }
};

// List item stagger
export const listContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const listItem = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

// Grid item stagger
export const gridContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

export const gridItem = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1 }
};

// Utility function to create custom spring animation
export const createSpring = (stiffness = 300, damping = 20) => ({
  type: 'spring',
  stiffness,
  damping
});

// Utility function to create custom ease animation
export const createEase = (duration = 0.3, ease = 'easeInOut') => ({
  duration,
  ease
});
