import { createBrowserRouter } from 'react-router';
import { Root } from './Root';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: 'profile', Component: Profile },
    ],
  },
]);
