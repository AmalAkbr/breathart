import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Suppress browser extension errors that don't affect functionality
// These are typically from password managers and form autofill extensions
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('message channel closed before a response was received')) {
    event.preventDefault();
  }
}, true);

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && typeof event.reason === 'object' && 
      event.reason.message && 
      event.reason.message.includes('message channel closed')) {
    event.preventDefault();
  }
}, true);

// Suppress specific Chrome extension warnings in console
const originalError = console.error;
console.error = function(...args) {
  if (args[0] && typeof args[0] === 'string' && 
      args[0].includes('message channel closed')) {
    return; // Suppress this error
  }
  originalError.apply(console, args);
};

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <App />
)
