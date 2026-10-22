import { Navigate, createBrowserRouter } from 'react-router';
import { App } from './App';
import { remoteConfig } from './app-config';
import { OrdersClient } from './clients/orders-client';
import { DashboardPage } from './pages/DashboardPage';
import { ErrorPage } from './pages/ErrorPage';
import { OrdersPage } from './pages/OrdersPage';
import { SettingsPage } from './pages/SettingsPage';

const ordersClient = new OrdersClient(remoteConfig.apiBase);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: 'dashboard',
        element: <DashboardPage />,
        loader: () => ordersClient.listOrders(),
        errorElement: <ErrorPage />,
      },
      { path: 'orders/:orderId?', element: <OrdersPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);
