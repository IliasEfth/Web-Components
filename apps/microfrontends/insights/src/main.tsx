import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { insightsConfig } from './app-config';
import { defineElements } from './elements';
import { InsightsProvider } from './insights/config/InsightsProvider';
import { router } from './router';
import './styles.css';

await defineElements(insightsConfig);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InsightsProvider config={insightsConfig}>
      <RouterProvider router={router} />
    </InsightsProvider>
  </StrictMode>,
);
