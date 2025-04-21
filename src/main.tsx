import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Basic error handler for initialization errors
try {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const root = createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  console.error('Application initialization failed:', error);
  
  // Display error in the DOM if rendering fails
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; max-width: 500px; margin: 0 auto; margin-top: 50px;">
      <h2 style="color: #e53e3e;">Application Failed to Start</h2>
      <p>There was a critical error initializing the application:</p>
      <div style="background-color: #f7fafc; padding: 12px; border-radius: 4px; margin-top: 16px; overflow-wrap: break-word;">
        ${error instanceof Error ? error.message : String(error)}
      </div>
      <button style="margin-top: 16px; padding: 8px 16px; background-color: #4f46e5; color: white; border: none; border-radius: 4px; cursor: pointer;"
        onclick="window.location.reload()">
        Reload Page
      </button>
    </div>
  `;
}