/**
 * Standardized API response formatters
 */
class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static created(res, data = null, message = 'Resource created successfully') {
    return ApiResponse.success(res, data, message, 201);
  }

  static paginated(res, items = [], pagination = {}, message = 'Data fetched successfully') {
    return res.status(200).json({
      success: true,
      message,
      data: items,
      pagination: {
        page: Number(pagination.page) || 1,
        limit: Number(pagination.limit) || 10,
        totalItems: Number(pagination.totalItems) || items.length,
        totalPages: Math.ceil((Number(pagination.totalItems) || items.length) / (Number(pagination.limit) || 10))
      },
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = ApiResponse;
