import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { seedIfNeeded } from './db/seed';

async function init() {
  await seedIfNeeded();

  if (navigator.storage?.persist) {
    await navigator.storage.persist();
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

init();