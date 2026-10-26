const authService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return ApiResponse.created(res, result, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return ApiResponse.success(res, result, 'User logged in successfully');
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user._id);
    return ApiResponse.success(res, { user }, 'Current user profile');
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const updated = await authService.updateProfile(req.user._id, req.body);
    return ApiResponse.success(res, { user: updated }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

const getPublicProfile = async (req, res, next) => {
  try {
    const viewerId = req.user ? req.user._id : null;
    const profile = await authService.getPublicProfile(req.params.id, viewerId);
    return ApiResponse.success(res, profile, 'Author profile');
  } catch (error) {
    next(error);
  }
};

const toggleFollow = async (req, res, next) => {
  try {
    const result = await authService.toggleFollow(req.params.id, req.user._id);
    return ApiResponse.success(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

const getBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await authService.getUserBookmarks(req.user._id);
    return ApiResponse.success(res, bookmarks, 'User bookmarks');
  } catch (error) {
    next(error);
  }
};

const toggleBookmark = async (req, res, next) => {
  try {
    const result = await authService.toggleBookmark(req.params.id, req.user._id);
    return ApiResponse.success(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  getPublicProfile,
  toggleFollow,
  getBookmarks,
  toggleBookmark
};
