import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

const BookmarkContext = createContext(null);
const STORAGE_KEY = 'cogniwrite_bookmarks_v1';

export const BookmarkProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync with backend when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const syncWithBackend = async () => {
        try {
          const backendBookmarks = await authService.getBookmarks();
          if (Array.isArray(backendBookmarks)) {
            setBookmarks(backendBookmarks);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(backendBookmarks));
          }
        } catch (e) {
          console.warn('Backend bookmark sync skipped', e.message);
        }
      };
      syncWithBackend();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Failed to save bookmarks to localStorage', e);
    }
  }, [bookmarks]);

  const isBookmarked = useCallback(
    (articleId) => {
      return bookmarks.some((b) => (b._id || b.id) === articleId);
    },
    [bookmarks]
  );

  const toggleBookmark = useCallback(async (article) => {
    const id = article._id || article.id;
    const exists = bookmarks.some((b) => (b._id || b.id) === id);

    // Optimistically update local state
    if (exists) {
      setBookmarks((prev) => prev.filter((b) => (b._id || b.id) !== id));
    } else {
      setBookmarks((prev) => [
        {
          _id: id,
          id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          author: article.author,
          readTimeMinutes: article.readTimeMinutes,
          tags: article.tags,
          category: article.category,
          createdAt: article.createdAt,
          aiAssisted: article.aiAssisted,
          bookmarkedAt: new Date().toISOString()
        },
        ...prev
      ]);
    }

    // Persist to backend if authenticated
    if (isAuthenticated) {
      try {
        await authService.toggleBookmark(id);
      } catch (err) {
        console.error('Failed to sync bookmark toggle with backend', err);
      }
    }
  }, [bookmarks, isAuthenticated]);

  const removeBookmark = useCallback(async (articleId) => {
    setBookmarks((prev) => prev.filter((b) => (b._id || b.id) !== articleId));
    if (isAuthenticated) {
      try {
        await authService.toggleBookmark(articleId);
      } catch (err) {
        console.error('Failed to sync bookmark removal with backend', err);
      }
    }
  }, [isAuthenticated]);

  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        isBookmarked,
        toggleBookmark,
        removeBookmark,
        clearBookmarks,
        count: bookmarks.length
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};
