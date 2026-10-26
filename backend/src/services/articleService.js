const Article = require('../models/Article');
const Comment = require('../models/Comment');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

class ArticleService {
  async getArticles({
    page = 1,
    limit = 10,
    category,
    tag,
    search,
    authorId,
    status = 'published',
    sortBy = 'newest',
    viewerId = null
  } = {}) {
    const query = {};

    if (status !== 'all') {
      query.status = status;
      query.published = status === 'published';
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (tag) {
      query.tags = tag.toLowerCase();
    }

    if (authorId) {
      query.author = authorId;
    }

    if (search && search.trim().length > 0) {
      const trimmed = search.trim();
      // Search matching title, excerpt, tags, or content
      query.$or = [
        { title: { $regex: trimmed, $options: 'i' } },
        { excerpt: { $regex: trimmed, $options: 'i' } },
        { tags: { $regex: trimmed, $options: 'i' } },
        { content: { $regex: trimmed, $options: 'i' } }
      ];
    }

    let sort = { createdAt: -1 };
    if (sortBy === 'popular') {
      sort = { likesCount: -1, createdAt: -1 };
    } else if (sortBy === 'views') {
      sort = { viewsCount: -1, createdAt: -1 };
    } else if (sortBy === 'reads') {
      sort = { readTimeMinutes: 1, createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      Article.find(query)
        .populate('author', 'name email avatar bio role')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(query)
    ]);

    // Enhance with viewer interaction state (isLiked, isBookmarked)
    let viewerBookmarks = [];
    if (viewerId) {
      const viewer = await User.findById(viewerId).select('bookmarks').lean();
      if (viewer && viewer.bookmarks) {
        viewerBookmarks = viewer.bookmarks.map((b) => b.toString());
      }
    }

    const mapped = articles.map((art) => {
      const isLiked = viewerId && Array.isArray(art.likes)
        ? art.likes.some((uId) => uId.toString() === viewerId.toString())
        : false;
      const isBookmarked = viewerId
        ? viewerBookmarks.includes(art._id.toString())
        : false;

      return {
        ...art,
        id: art._id,
        isLiked,
        isBookmarked,
        likesCount: art.likesCount ?? (art.likes?.length || 0)
      };
    });

    return {
      articles: mapped,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalItems: total,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  }

  async getArticleByIdOrSlug(idOrSlug, viewerId = null) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

    // Atomically increment real view count
    const article = await Article.findOneAndUpdate(
      query,
      { $inc: { viewsCount: 1 } },
      { new: true }
    ).populate('author', 'name email avatar bio role');

    if (!article) {
      throw ApiError.notFound('Article not found');
    }

    let isLiked = false;
    let isBookmarked = false;

    if (viewerId) {
      isLiked = Array.isArray(article.likes)
        ? article.likes.some((uId) => uId.toString() === viewerId.toString())
        : false;

      const user = await User.findById(viewerId).select('bookmarks').lean();
      if (user && user.bookmarks) {
        isBookmarked = user.bookmarks.some((bId) => bId.toString() === article._id.toString());
      }
    }

    const obj = article.toObject();
    return {
      ...obj,
      id: obj._id,
      isLiked,
      isBookmarked,
      likesCount: obj.likesCount ?? (obj.likes?.length || 0)
    };
  }

  async createArticle(data, authorId) {
    const slug = Article.generateSlug(data.title);

    // Calculate reading time based on ~200 wpm
    const wordCount = (data.content || '').split(/\s+/).filter(Boolean).length;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    const status = data.status === 'draft' ? 'draft' : 'published';
    const published = status === 'published';

    const article = await Article.create({
      title: data.title,
      slug,
      category: data.category || 'General',
      excerpt: data.excerpt || '',
      content: data.content,
      tags: Array.isArray(data.tags) ? data.tags : [],
      coverImage: data.coverImage || '',
      readTimeMinutes,
      author: authorId,
      status,
      published,
      aiAssisted: Boolean(data.aiAssisted),
      viewsCount: 0,
      likesCount: 0,
      commentsCount: 0
    });

    return article.populate('author', 'name email avatar bio role');
  }

  async updateArticle(id, updateData, userId) {
    const article = await Article.findById(id);
    if (!article) {
      throw ApiError.notFound('Article not found');
    }

    // Strict ownership verification
    if (article.author.toString() !== userId.toString()) {
      throw ApiError.forbidden('You are not authorized to update this article');
    }

    if (updateData.title && updateData.title !== article.title) {
      article.title = updateData.title;
      article.slug = Article.generateSlug(updateData.title);
    }

    if (updateData.content) {
      article.content = updateData.content;
      const wordCount = updateData.content.split(/\s+/).filter(Boolean).length;
      article.readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
    }

    if (updateData.excerpt !== undefined) article.excerpt = updateData.excerpt;
    if (updateData.category) article.category = updateData.category;
    if (updateData.tags && Array.isArray(updateData.tags)) article.tags = updateData.tags;
    if (updateData.coverImage !== undefined) article.coverImage = updateData.coverImage;

    if (updateData.status) {
      article.status = updateData.status;
      article.published = updateData.status === 'published';
    }

    if (updateData.aiAssisted !== undefined) {
      article.aiAssisted = Boolean(updateData.aiAssisted);
    }

    await article.save();
    return article.populate('author', 'name email avatar bio role');
  }

  async deleteArticle(id, userId) {
    const article = await Article.findById(id);
    if (!article) {
      throw ApiError.notFound('Article not found');
    }

    // Strict ownership verification
    if (article.author.toString() !== userId.toString()) {
      throw ApiError.forbidden('You are not authorized to delete this article');
    }

    // Cascade delete comments
    await Promise.all([
      Article.findByIdAndDelete(id),
      Comment.deleteMany({ article: id })
    ]);

    return { id, message: 'Article and associated comments deleted successfully' };
  }

  async toggleLike(id, userId) {
    const article = await Article.findById(id);
    if (!article) {
      throw ApiError.notFound('Article not found');
    }

    const alreadyLiked = Array.isArray(article.likes) && article.likes.some(
      (uId) => uId.toString() === userId.toString()
    );

    let updatedArticle;
    if (alreadyLiked) {
      // Unlike
      updatedArticle = await Article.findByIdAndUpdate(
        id,
        {
          $pull: { likes: userId },
          $inc: { likesCount: -1 }
        },
        { new: true }
      );
    } else {
      // Like (ensures no duplicates using $addToSet)
      updatedArticle = await Article.findByIdAndUpdate(
        id,
        {
          $addToSet: { likes: userId },
          $inc: { likesCount: 1 }
        },
        { new: true }
      );
    }

    // Normalize likesCount if negative
    const finalCount = Math.max(0, updatedArticle.likesCount || updatedArticle.likes.length);
    if (updatedArticle.likesCount !== finalCount) {
      updatedArticle.likesCount = finalCount;
      await updatedArticle.save();
    }

    return {
      liked: !alreadyLiked,
      likesCount: finalCount
    };
  }

  async getRelatedArticles(idOrSlug, limit = 3) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

    const current = await Article.findOne(query).select('_id category tags');
    if (!current) return [];

    const related = await Article.find({
      _id: { $ne: current._id },
      status: 'published',
      $or: [
        { category: current.category },
        { tags: { $in: current.tags || [] } }
      ]
    })
      .populate('author', 'name email avatar')
      .sort({ likesCount: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return related;
  }

  // --- Comments ---
  async getComments(articleId) {
    const comments = await Comment.find({ article: articleId })
      .populate('author', 'name email avatar bio role')
      .sort({ createdAt: -1 })
      .lean();

    return comments.map((c) => ({
      ...c,
      id: c._id
    }));
  }

  async addComment(articleId, authorId, content) {
    const article = await Article.findById(articleId);
    if (!article) {
      throw ApiError.notFound('Article not found');
    }

    const comment = await Comment.create({
      article: articleId,
      author: authorId,
      content: content.trim()
    });

    // Increment comment count on article
    await Article.findByIdAndUpdate(articleId, { $inc: { commentsCount: 1 } });

    return comment.populate('author', 'name email avatar bio role');
  }

  async updateComment(commentId, authorId, content) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw ApiError.notFound('Comment not found');
    }

    if (comment.author.toString() !== authorId.toString()) {
      throw ApiError.forbidden('You are not authorized to edit this comment');
    }

    comment.content = content.trim();
    await comment.save();

    return comment.populate('author', 'name email avatar bio role');
  }

  async deleteComment(commentId, userId) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw ApiError.notFound('Comment not found');
    }

    const article = await Article.findById(comment.article);

    // Either the author of comment or author of article can delete
    const isCommentAuthor = comment.author.toString() === userId.toString();
    const isArticleAuthor = article && article.author.toString() === userId.toString();

    if (!isCommentAuthor && !isArticleAuthor) {
      throw ApiError.forbidden('You are not authorized to delete this comment');
    }

    await Comment.findByIdAndDelete(commentId);

    // Decrement commentsCount on article
    if (article) {
      await Article.findByIdAndUpdate(article._id, { $inc: { commentsCount: -1 } });
    }

    return { id: commentId, message: 'Comment deleted successfully' };
  }

  // --- Author Dashboard Metrics ---
  async getAuthorDashboardMetrics(authorId) {
    const articles = await Article.find({ author: authorId })
      .sort({ createdAt: -1 })
      .lean();

    const totalArticles = articles.length;
    const totalPublished = articles.filter((a) => a.status === 'published').length;
    const totalDrafts = articles.filter((a) => a.status === 'draft').length;

    // Sum actual metrics across real database articles
    const totalViews = articles.reduce((acc, curr) => acc + (curr.viewsCount || 0), 0);
    const totalLikes = articles.reduce((acc, curr) => acc + (curr.likesCount || (curr.likes?.length || 0)), 0);
    const totalComments = articles.reduce((acc, curr) => acc + (curr.commentsCount || 0), 0);

    return {
      totalArticles,
      totalPublished,
      totalDrafts,
      totalViews,
      totalLikes,
      totalComments,
      articles: articles.map((a) => ({
        ...a,
        id: a._id
      }))
    };
  }

  async getAdminPlatformMetrics() {
    const [usersCount, articlesCount, publishedCount, commentsCount] = await Promise.all([
      User.countDocuments(),
      Article.countDocuments(),
      Article.countDocuments({ status: 'published' }),
      Comment.countDocuments()
    ]);

    const recentUsers = await User.find().select('name email role createdAt').sort({ createdAt: -1 }).limit(10).lean();

    return {
      usersCount,
      articlesCount,
      publishedCount,
      commentsCount,
      recentUsers
    };
  }
}

module.exports = new ArticleService();
