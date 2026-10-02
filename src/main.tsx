import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent multi-touch pinch to zoom and double tap zoom across all Android & mobile devices
if (typeof window !== 'undefined') {
  // Prevent multi-touch pinch zoom
  document.addEventListener('touchstart', (event) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  }, { passive: false });

  document.addEventListener('touchmove', (event) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  }, { passive: false });

  // Prevent double-tap to zoom
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      // Don't block clicking on buttons or inputs
      const target = event.target as HTMLElement;
      if (!target.closest('button, input, select, textarea, a, [role="button"]')) {
        event.preventDefault();
      }
    }
    lastTouchEnd = now;
  }, { passive: false });

  // Prevent gesture zoom (Safari & mobile webviews)
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('gesturechange', (e) => e.preventDefault());
  document.addEventListener('gestureend', (e) => e.preventDefault());

  // Prevent Ctrl + Mousewheel zoom on trackpads/desktops
  document.addEventListener('wheel', (event) => {
    if (event.ctrlKey) {
      event.preventDefault();
    }
  }, { passive: false });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
