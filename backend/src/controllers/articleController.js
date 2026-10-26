const articleService = require('../services/articleService');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

const getArticles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { category, tag, search, authorId, status, sortBy } = req.query;
    const viewerId = req.user ? req.user._id : null;

    const result = await articleService.getArticles({
      page,
      limit,
      category,
      tag,
      search,
      authorId,
      status,
      sortBy,
      viewerId
    });

    return ApiResponse.paginated(res, result.articles, result.pagination, 'Articles retrieved');
  } catch (error) {
    next(error);
  }
};

const getArticle = async (req, res, next) => {
  try {
    const viewerId = req.user ? req.user._id : null;
    const article = await articleService.getArticleByIdOrSlug(req.params.idOrSlug, viewerId);
    return ApiResponse.success(res, article, 'Article details');
  } catch (error) {
    next(error);
  }
};

const createArticle = async (req, res, next) => {
  try {
    const article = await articleService.createArticle(req.body, req.user._id);
    return ApiResponse.created(res, article, 'Article published successfully');
  } catch (error) {
    next(error);
  }
};

const updateArticle = async (req, res, next) => {
  try {
    const article = await articleService.updateArticle(req.params.id, req.body, req.user._id);
    return ApiResponse.success(res, article, 'Article updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteArticle = async (req, res, next) => {
  try {
    const result = await articleService.deleteArticle(req.params.id, req.user._id);
    return ApiResponse.success(res, result, 'Article deleted successfully');
  } catch (error) {
    next(error);
  }
};

const toggleLike = async (req, res, next) => {
  try {
    const result = await articleService.toggleLike(req.params.id, req.user._id);
    return ApiResponse.success(res, result, result.liked ? 'Article liked' : 'Article unliked');
  } catch (error) {
    next(error);
  }
};

const getRelatedArticles = async (req, res, next) => {
  try {
    const related = await articleService.getRelatedArticles(req.params.idOrSlug);
    return ApiResponse.success(res, related, 'Related articles');
  } catch (error) {
    next(error);
  }
};

// --- Comments ---
const getComments = async (req, res, next) => {
  try {
    const comments = await articleService.getComments(req.params.id);
    return ApiResponse.success(res, comments, 'Article comments');
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      throw ApiError.badRequest('Comment content cannot be empty');
    }
    const comment = await articleService.addComment(req.params.id, req.user._id, content);
    return ApiResponse.created(res, comment, 'Comment posted successfully');
  } catch (error) {
    next(error);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      throw ApiError.badRequest('Comment content cannot be empty');
    }
    const comment = await articleService.updateComment(req.params.commentId, req.user._id, content);
    return ApiResponse.success(res, comment, 'Comment updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const result = await articleService.deleteComment(req.params.commentId, req.user._id);
    return ApiResponse.success(res, result, 'Comment deleted successfully');
  } catch (error) {
    next(error);
  }
};

// --- Dashboard ---
const getDashboardMetrics = async (req, res, next) => {
  try {
    const metrics = await articleService.getAuthorDashboardMetrics(req.user._id);
    return ApiResponse.success(res, metrics, 'Author dashboard metrics');
  } catch (error) {
    next(error);
  }
};

const getAdminMetrics = async (req, res, next) => {
  try {
    const metrics = await articleService.getAdminPlatformMetrics();
    return ApiResponse.success(res, metrics, 'Platform metrics');
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
