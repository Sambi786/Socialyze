import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AppProvider } from './AppContext';
import './index.css';

// Initialize theme before rendering to avoid flash
const savedTheme = localStorage.getItem('zocialyse-theme');
if (savedTheme === 'light') {
  document.documentElement.classList.add('theme-light');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
);
