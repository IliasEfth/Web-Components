import { Navigate, createBrowserRouter } from 'react-router';
import { App } from './App';
import { ComponentsPage } from './pages/ComponentsPage';
import { WebComponentsPage } from './pages/WebComponentsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/components" replace /> },
      { path: 'components', element: <ComponentsPage /> },
      { path: 'web-components', element: <WebComponentsPage /> },
      { path: '*', element: <Navigate to="/components" replace /> },
    ],
  },
], { basename: import.meta.env.BASE_URL });
