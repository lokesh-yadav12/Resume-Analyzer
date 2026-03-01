// Performance optimization utilities

/**
 * Debounce function to limit execution rate
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to limit execution frequency
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Lazy load images with Intersection Observer
 */
export const lazyLoadImage = (imageElement, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.01,
  };

  const observerOptions = { ...defaultOptions, ...options };

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;

        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
        }

        if (srcset) {
          img.srcset = srcset;
          img.removeAttribute('data-srcset');
        }

        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  }, observerOptions);

  imageObserver.observe(imageElement);

  return () => imageObserver.unobserve(imageElement);
};

/**
 * Preload critical resources
 */
export const preloadResource = (href, as, type = null) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  document.head.appendChild(link);
};

/**
 * Prefetch resources for next navigation
 */
export const prefetchResource = (href) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
};

/**
 * Measure component render time
 */
export const measureRenderTime = (componentName, callback) => {
  const startTime = performance.now();
  callback();
  const endTime = performance.now();
  const renderTime = endTime - startTime;
  
  console.log(`${componentName} rendered in ${renderTime.toFixed(2)}ms`);
  
  return renderTime;
};

/**
 * Request Idle Callback wrapper with fallback
 */
export const requestIdleCallback = (callback, options = {}) => {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  // Fallback for browsers that don't support requestIdleCallback
  return setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => 50,
    });
  }, 1);
};

/**
 * Cancel Idle Callback wrapper
 */
export const cancelIdleCallback = (id) => {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
};

/**
 * Memoize expensive function calls
 */
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Virtual scrolling helper for large lists
 */
export class VirtualScroller {
  constructor(options) {
    this.itemHeight = options.itemHeight;
    this.containerHeight = options.containerHeight;
    this.items = options.items;
    this.buffer = options.buffer || 3;
  }

  getVisibleRange(scrollTop) {
    const startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer);
    const endIndex = Math.min(
      this.items.length,
      Math.ceil((scrollTop + this.containerHeight) / this.itemHeight) + this.buffer
    );
    return { startIndex, endIndex };
  }

  getVisibleItems(scrollTop) {
    const { startIndex, endIndex } = this.getVisibleRange(scrollTop);
    return this.items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index,
      top: (startIndex + index) * this.itemHeight,
    }));
  }

  getTotalHeight() {
    return this.items.length * this.itemHeight;
  }
}

/**
 * Batch DOM updates
 */
export const batchDOMUpdates = (updates) => {
  requestAnimationFrame(() => {
    updates.forEach((update) => update());
  });
};

/**
 * Check if element is in viewport
 */
export const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Optimize images for web
 */
export const getOptimizedImageUrl = (url, width, quality = 80) => {
  // This is a placeholder - implement based on your image CDN
  // Example for Cloudinary: `${url}?w=${width}&q=${quality}&f=auto`
  return url;
};

/**
 * Web Vitals monitoring
 */
export const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

/**
 * Service Worker registration
 */
export const registerServiceWorker = async (swUrl) => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(swUrl);
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

/**
 * Cache API helper
 */
export const cacheManager = {
  async set(key, data, ttl = 3600000) {
    const item = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  async get(key) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const { data, timestamp, ttl } = JSON.parse(item);
      const isExpired = Date.now() - timestamp > ttl;

      if (isExpired) {
        localStorage.removeItem(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  async remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  },

  async clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  },
};

/**
 * Network status monitoring
 */
export const networkMonitor = {
  isOnline: () => navigator.onLine,
  
  getConnectionType: () => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return connection ? connection.effectiveType : 'unknown';
  },
  
  onOnline: (callback) => {
    window.addEventListener('online', callback);
    return () => window.removeEventListener('online', callback);
  },
  
  onOffline: (callback) => {
    window.addEventListener('offline', callback);
    return () => window.removeEventListener('offline', callback);
  },
};

/**
 * Memory usage monitoring (Chrome only)
 */
export const getMemoryUsage = () => {
  if (performance.memory) {
    return {
      usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
    };
  }
  return null;
};

/**
 * Long task detection
 */
export const detectLongTasks = (callback, threshold = 50) => {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > threshold) {
          callback(entry);
        }
      }
    });
    
    observer.observe({ entryTypes: ['longtask'] });
    return () => observer.disconnect();
  }
  return () => {};
};

export default {
  debounce,
  throttle,
  lazyLoadImage,
  preloadResource,
  prefetchResource,
  measureRenderTime,
  requestIdleCallback,
  cancelIdleCallback,
  memoize,
  VirtualScroller,
  batchDOMUpdates,
  isInViewport,
  getOptimizedImageUrl,
  reportWebVitals,
  registerServiceWorker,
  cacheManager,
  networkMonitor,
  getMemoryUsage,
  detectLongTasks,
};
