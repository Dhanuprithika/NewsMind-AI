import { createBrowserRouter } from 'react-router';
import { Root } from './Root';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { ArticleDetail } from './pages/ArticleDetail';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: 'profile', Component: Profile },
      { path: 'article/:articleId', Component: ArticleDetail },
    ],
  },
]);
