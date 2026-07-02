import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { seedIfNeeded } from './db/seed';

async function init() {
  try {
    await seedIfNeeded();
    if (navigator.storage?.persist) {
      await navigator.storage.persist();
    }
  } catch (err) {
    console.error('Init failed:', err);
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

init();