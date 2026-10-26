const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['Architecture', 'Systems', 'AI & ML', 'Backend', 'Frontend', 'Database', 'DevOps', 'General'],
      default: 'General',
      index: true
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [300, 'Excerpt cannot exceed 300 characters'],
      default: ''
    },
    content: {
      type: String,
      required: [true, 'Article content is required']
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true
      }
    ],
    coverImage: {
      type: String,
      default: ''
    },
    readTimeMinutes: {
      type: Number,
      default: 3
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Article author is required'],
      index: true
    },
    published: {
      type: Boolean,
      default: true,
      index: true
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
      index: true
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    likesCount: {
      type: Number,
      default: 0
    },
    viewsCount: {
      type: Number,
      default: 0
    },
    commentsCount: {
      type: Number,
      default: 0
    },
    aiAssisted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Compound text index for powerful keyword & natural search
articleSchema.index({ title: 'text', content: 'text', tags: 'text' });
articleSchema.index({ tags: 1 });
articleSchema.index({ createdAt: -1 });

// Helper to generate slug from title
articleSchema.statics.generateSlug = function (title) {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return `${baseSlug}-${Date.now().toString(36)}`;
};

module.exports = mongoose.model('Article', articleSchema);
