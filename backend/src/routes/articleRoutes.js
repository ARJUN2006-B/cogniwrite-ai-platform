const express = require('express');
const {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  toggleLike,
  getRelatedArticles,
  getComments,
  addComment,
  updateComment,
  deleteComment,
  getDashboardMetrics,
  getAdminMetrics
} = require('../controllers/articleController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateRequest');
const { validateArticle } = require('../validators/articleValidator');

const router = express.Router();

// Specific routes before :id / :idOrSlug parameter
router.get('/dashboard/metrics', authenticate, getDashboardMetrics);
router.get('/admin/metrics', authenticate, getAdminMetrics);

// Article list and creation
router.get('/', optionalAuth, getArticles);
router.post('/', authenticate, validate(validateArticle), createArticle);

// Article detail, related, and update/delete
router.get('/:idOrSlug', optionalAuth, getArticle);
router.get('/:idOrSlug/related', getRelatedArticles);
router.put('/:id', authenticate, validate(validateArticle), updateArticle);
router.delete('/:id', authenticate, deleteArticle);

// Like / Unlike toggle
router.post('/:id/like', authenticate, toggleLike);

// Comments subroutes
router.get('/:id/comments', getComments);
router.post('/:id/comments', authenticate, addComment);
router.put('/comments/:commentId', authenticate, updateComment);
router.delete('/comments/:commentId', authenticate, deleteComment);

module.exports = router;
