import React from 'react';
import ReactDOM from 'react-dom/client';
import { HeroUIProvider } from '@heroui/react';
import { Toaster } from 'sonner';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HeroUIProvider>
      <App />
      <Toaster position="top-center" richColors />
    </HeroUIProvider>
  </React.StrictMode>
);
