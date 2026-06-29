import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Gracefully handle and suppress benign Vite WebSocket HMR disconnection/unavailability rejections
if (typeof window !== 'undefined') {
  const isViteHmrError = (str: string) => {
    const s = str.toLowerCase();
    return s.includes('websocket') || 
           s.includes('vite') || 
           s.includes('hmr') || 
           s.includes('ws://') || 
           s.includes('closed without opened');
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const reasonStr = reason?.message || reason?.toString() || '';
    if (isViteHmrError(reasonStr) || isViteHmrError(String(reason))) {
      event.preventDefault();
      console.debug('[Vite HMR Sandbox] Suppressed expected WebSocket connection error:', reasonStr);
    }
  });

  window.addEventListener('error', (event) => {
    const errorStr = event.message || event.error?.message || '';
    if (isViteHmrError(errorStr) || isViteHmrError(String(event.error))) {
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

