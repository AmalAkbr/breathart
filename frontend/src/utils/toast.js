/**
 * Toast notification utility
 * Creates temporary notifications without requiring a library
 */

const createToast = (message, type = 'info') => {
  const toast = document.createElement('div');
  
  // Define styles based on type
  const styles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-gray-900',
    info: 'bg-blue-500 text-white'
  };

  const baseClasses = 'fixed top-12 right-[50%] translate-x-[50%] px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down font-medium text-sm max-w-md';
  const typeClasses = styles[type] || styles.info;

  toast.className = `${baseClasses} ${typeClasses}`;
  toast.textContent = message;
  
  // Add minimal animation with CSS
  const style = document.createElement('style');
  if (!document.querySelector('style[data-toast-animation]')) {
    style.setAttribute('data-toast-animation', 'true');
    style.textContent = `
      @keyframes fadeInDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fade-in-down {
        animation: fadeInDown 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  // Auto-remove after 5 seconds
  const timeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease-out';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 5000);

  // Return remove function for manual cleanup
  return () => {
    clearTimeout(timeout);
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  };
};

export const toast = {
  success: (message) => createToast(message, 'success'),
  error: (message) => createToast(message, 'error'),
  warning: (message) => createToast(message, 'warning'),
  info: (message) => createToast(message, 'info'),
};
