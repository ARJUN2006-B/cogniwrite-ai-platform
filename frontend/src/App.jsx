import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { CreateArticlePage } from './pages/CreateArticlePage';
import { EditArticlePage } from './pages/EditArticlePage';
import { BookmarksPage } from './pages/BookmarksPage';
import { DashboardPage } from './pages/DashboardPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          {/* Public & Editorial Routes */}
          <Route index element={<HomePage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="articles" element={<Navigate to="/explore" replace />} />
          <Route path="articles/:idOrSlug" element={<ArticleDetailPage />} />

          {/* Authoring & Management */}
          <Route path="write" element={<CreateArticlePage />} />
          <Route path="articles/:id/edit" element={<EditArticlePage />} />

          {/* SaaS Workspace & User Profile */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="bookmarks" element={<BookmarksPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<UserProfilePage />} />
          <Route path="profile/:id" element={<UserProfilePage />} />
          <Route path="admin" element={<AdminPage />} />

          {/* Authentication */}
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          {/* Fallback 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
