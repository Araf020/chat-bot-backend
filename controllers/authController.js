const { google } = require('googleapis');
const config = require('../config/config');

/**
 * Exchange authorization code for tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.exchangeCodeForTokens = async (req, res) => {
  try {
    const { code, redirect_uri } = req.body;
    
    if (!code) {
      return res.status(400).json({
        error: 'Authorization code required',
        message: 'Please provide the authorization code from Google'
      });
    }
    
    // Get credentials from environment variables
    const { clientId: client_id, clientSecret: client_secret } = config.google;
    
    if (!client_id || !client_secret) {
      return res.status(500).json({
        error: 'Google OAuth not configured',
        message: 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables'
      });
    }
    
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uri
    );
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    return res.json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expiry_date,
      token_type: 'Bearer',
      scope: tokens.scope
    });
    
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    
    if (error.code === 400 || error.message?.includes('invalid_grant')) {
      return res.status(400).json({
        error: 'Invalid authorization code',
        message: 'The authorization code is invalid or has expired'
      });
    }
    
    return res.status(500).json({
      error: 'Token exchange failed',
      details: error.message
    });
  }
};

/**
 * Refresh access token using refresh token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({
        error: 'Refresh token required',
        message: 'Please provide a valid refresh token'
      });
    }
    
    // Get credentials from environment variables
    const { clientId: client_id, clientSecret: client_secret } = config.google;
    
    if (!client_id || !client_secret) {
      return res.status(500).json({
        error: 'Google OAuth not configured',
        message: 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables'
      });
    }
    
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret
    );
    
    // Set refresh token
    oauth2Client.setCredentials({
      refresh_token: refresh_token
    });
    
    // Refresh the access token
    const { credentials: newCredentials } = await oauth2Client.refreshAccessToken();
    
    return res.json({
      access_token: newCredentials.access_token,
      expires_in: newCredentials.expiry_date,
      token_type: 'Bearer',
      scope: newCredentials.scope
    });
    
  } catch (error) {
    console.error('Error refreshing token:', error);
    
    if (error.code === 400 || error.message?.includes('invalid_grant')) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'The refresh token is invalid or has expired. Please re-authenticate.'
      });
    }
    
    return res.status(500).json({
      error: 'Token refresh failed',
      details: error.message
    });
  }
};

/**
 * Get Google OAuth URL for frontend to redirect users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAuthUrl = async (req, res) => {
  try {
    const { redirect_uri } = req.query;
    
    // Load credentials
    const credentialsContent = await fs.readFile(CREDENTIALS_PATH);
    const credentials = JSON.parse(credentialsContent);
    const { client_id, client_secret } = credentials.web || credentials.installed;
    
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uri
    );
    
    // Scopes for calendar access
    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ];
    
    // Generate auth URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent' // Force consent screen to get refresh token
    });
    
    return res.json({
      auth_url: authUrl,
      client_id: client_id
    });
    
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return res.status(500).json({
      error: 'Failed to generate auth URL',
      details: error.message
    });
  }
};