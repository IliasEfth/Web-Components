import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { defineElements } from './elements';
import { InsightsProvider } from './insights/config/InsightsProvider';
import { insightsConfig } from './insights/config/insights-config';
import { router } from './router';
import './styles.css';

await defineElements();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InsightsProvider config={insightsConfig}>
      <RouterProvider router={router} />
    </InsightsProvider>
  </StrictMode>,
);
