/**
 * Middleware to validate Google access tokens from frontend
 */

/**
 * Extract access token from Authorization header or request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
function extractAccessToken(req, res, next) {
  // Try Authorization header first (Bearer token)
  let accessToken = req.headers.authorization?.replace('Bearer ', '');
  
  // Fallback to request body
  if (!accessToken && req.body?.access_token) {
    accessToken = req.body.access_token;
  }
  
  if (!accessToken) {
    return res.status(401).json({
      error: 'Access token required',
      message: 'Please provide access token in Authorization header or request body'
    });
  }
  
  // Attach token to request for use in controllers
  req.accessToken = accessToken;
  next();
}

/**
 * Validate access token format (basic validation)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
function validateTokenFormat(req, res, next) {
  const token = req.accessToken;
  
  // Basic token format validation
  if (!token || typeof token !== 'string' || token.length < 10) {
    return res.status(401).json({
      error: 'Invalid token format',
      message: 'Access token appears to be malformed'
    });
  }
  
  next();
}

/**
 * Combined middleware for token extraction and validation
 */
function requireGoogleAuth(req, res, next) {
  extractAccessToken(req, res, (err) => {
    if (err) return next(err);
    validateTokenFormat(req, res, next);
  });
}

module.exports = {
  extractAccessToken,
  validateTokenFormat,
  requireGoogleAuth
};