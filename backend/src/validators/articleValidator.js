/**
 * Validation rules for article endpoints
 */
const ALLOWED_CATEGORIES = [
  'Architecture',
  'Systems',
  'AI & ML',
  'Backend',
  'Frontend',
  'Database',
  'DevOps',
  'General'
];

const ALLOWED_STATUSES = ['draft', 'published'];

const validateArticle = (data) => {
  const errors = [];

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 3) {
    errors.push({ field: 'title', message: 'Title must be at least 3 characters long' });
  }

  if (data.title && data.title.length > 150) {
    errors.push({ field: 'title', message: 'Title cannot exceed 150 characters' });
  }

  if (!data.content || typeof data.content !== 'string' || data.content.trim().length < 10) {
    errors.push({ field: 'content', message: 'Content must be at least 10 characters long' });
  }

  if (data.excerpt && data.excerpt.length > 300) {
    errors.push({ field: 'excerpt', message: 'Excerpt cannot exceed 300 characters' });
  }

  if (data.category && !ALLOWED_CATEGORIES.includes(data.category)) {
    errors.push({
      field: 'category',
      message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`
    });
  }

  if (data.status && !ALLOWED_STATUSES.includes(data.status)) {
    errors.push({
      field: 'status',
      message: 'Status must be either "draft" or "published"'
    });
  }

  if (data.tags && !Array.isArray(data.tags)) {
    errors.push({ field: 'tags', message: 'Tags must be an array of strings' });
  }

  return errors;
};

module.exports = {
  validateArticle,
  ALLOWED_CATEGORIES
};
