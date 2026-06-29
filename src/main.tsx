import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Gracefully handle and suppress benign Vite WebSocket HMR disconnection/unavailability rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = event.reason?.message || event.reason?.toString() || '';
    if (
      reasonStr.toLowerCase().includes('websocket') || 
      reasonStr.toLowerCase().includes('vite') ||
      reasonStr.toLowerCase().includes('hmr') ||
      reasonStr.toLowerCase().includes('ws://')
    ) {
      event.preventDefault();
      console.debug('[Vite HMR Sandbox] Suppressed expected WebSocket connection error:', reasonStr);
    }
  });

  window.addEventListener('error', (event) => {
    const errorStr = event.message || '';
    if (
      errorStr.toLowerCase().includes('websocket') || 
      errorStr.toLowerCase().includes('vite') ||
      errorStr.toLowerCase().includes('hmr')
    ) {
      event.preventDefault();
      console.debug('[Vite HMR Sandbox] Suppressed expected WebSocket runtime error:', errorStr);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

