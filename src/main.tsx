
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MockAuthProvider } from '@/hooks/useMockAuth';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <MockAuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </MockAuthProvider>
  </StrictMode>,
);
