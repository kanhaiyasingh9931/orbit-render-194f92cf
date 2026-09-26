import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Locate the root DOM node defined in index.html
const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found. Ensure index.html contains a div with id="root".');
}

// Initialize React 18's concurrent root
const root = createRoot(container);

// Render the application within React StrictMode for development warnings
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Enable Vite's Hot Module Replacement (HMR) in development
if (import.meta.hot) {
  import.meta.hot.accept();
}