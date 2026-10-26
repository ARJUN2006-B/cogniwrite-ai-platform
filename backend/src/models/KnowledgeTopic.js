const mongoose = require('mongoose');

const knowledgeTopicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Topic title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
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
      required: [true, 'Category is required'],
      trim: true,
      enum: ['Architecture', 'Frontend', 'Backend', 'Database', 'DevOps', 'AI & ML', 'General']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true
      }
    ],
    resources: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, enum: ['documentation', 'article', 'video', 'repo'], default: 'article' }
      }
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

knowledgeTopicSchema.statics.generateSlug = function (title) {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return `${baseSlug}-${Date.now().toString(36)}`;
};

module.exports = mongoose.model('KnowledgeTopic', knowledgeTopicSchema);
