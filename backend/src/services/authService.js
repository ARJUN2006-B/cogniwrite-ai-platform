const User = require('../models/User');
const Article = require('../models/Article');
const ApiError = require('../utils/apiError');

class AuthService {
  async register({ name, email, password, bio, avatar }) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw ApiError.conflict('An account with this email address already exists');
    }

    // Role explicitly set to 'user' so users cannot self-elevate to admin
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'user',
      bio: bio || '',
      avatar: avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`
    });

    const token = user.generateAuthToken();

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password credentials');
    }

    const token = user.generateAuthToken();

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    };
  }

  async getCurrentUser(userId) {
    const user = await User.findById(userId)
      .populate('bookmarks', 'title slug excerpt readTimeMinutes tags author published createdAt')
      .lean();
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return {
      ...user,
      id: user._id,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
      bookmarksCount: user.bookmarks?.length || 0
    };
  }

  async updateProfile(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (updateData.name && updateData.name.trim().length >= 2) {
      user.name = updateData.name.trim();
    }
    if (updateData.bio !== undefined) {
      user.bio = updateData.bio.trim().slice(0, 300);
    }
    if (updateData.avatar) {
      user.avatar = updateData.avatar.trim();
    }

    await user.save();
    return user;
  }

  async getPublicProfile(targetUserId, viewerId = null) {
    const user = await User.findById(targetUserId).select('-password');
    if (!user) {
      throw ApiError.notFound('Author profile not found');
    }

    const articlesCount = await Article.countDocuments({ author: targetUserId, status: 'published' });

    const isFollowing = viewerId
      ? user.followers.some((f) => f.toString() === viewerId.toString())
      : false;

    return {
      id: user._id,
      _id: user._id,
      name: user.name,
      bio: user.bio,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
      articlesCount,
      isFollowing
    };
  }

  async toggleFollow(targetUserId, currentUserId) {
    if (targetUserId.toString() === currentUserId.toString()) {
      throw ApiError.badRequest('You cannot follow yourself');
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      throw ApiError.notFound('User record not found');
    }

    const alreadyFollowing = targetUser.followers.some(
      (f) => f.toString() === currentUserId.toString()
    );

    if (alreadyFollowing) {
      // Unfollow
      targetUser.followers = targetUser.followers.filter(
        (f) => f.toString() !== currentUserId.toString()
      );
      currentUser.following = currentUser.following.filter(
        (f) => f.toString() !== targetUserId.toString()
      );
      await Promise.all([targetUser.save(), currentUser.save()]);
      return {
        following: false,
        followersCount: targetUser.followers.length,
        message: `Unfollowed ${targetUser.name}`
      };
    } else {
      // Follow
      targetUser.followers.push(currentUserId);
      currentUser.following.push(targetUserId);
      await Promise.all([targetUser.save(), currentUser.save()]);
      return {
        following: true,
        followersCount: targetUser.followers.length,
        message: `Now following ${targetUser.name}`
      };
    }
  }

  async toggleBookmark(articleId, userId) {
    const article = await Article.findById(articleId);
    if (!article) {
      throw ApiError.notFound('Article not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isBookmarked = user.bookmarks.some((b) => b.toString() === articleId.toString());

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter((b) => b.toString() !== articleId.toString());
      await user.save();
      return { bookmarked: false, count: user.bookmarks.length, message: 'Bookmark removed' };
    } else {
      user.bookmarks.unshift(articleId);
      await user.save();
      return { bookmarked: true, count: user.bookmarks.length, message: 'Article bookmarked' };
    }
  }

  async getUserBookmarks(userId) {
    const user = await User.findById(userId).populate({
      path: 'bookmarks',
      populate: { path: 'author', select: 'name email avatar bio' }
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user.bookmarks || [];
  }
}

module.exports = new AuthService();
