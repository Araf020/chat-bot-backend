const { createAuthFromToken, getTodayEvents, getUpcomingEvents, getWeekEvents, getPastEvents } = require('../services/calendar/googleCalendar');
const Groq = require('groq-sdk');
const config = require('../config/config');

// Initialize Groq client
const client = new Groq({ apiKey: config.groq.apiKey });

/**
 * Get today's calendar events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTodaySchedule = async (req, res) => {
  try {
    // Access token is now available via middleware
    const accessToken = req.accessToken;
    
    // Create auth client from frontend token
    const auth = createAuthFromToken(accessToken);
    
    // Get today's events
    const events = await getTodayEvents(auth);
    console.log('Today\'s events:', events);
    return res.json(events);
  } catch (error) {
    console.error('Error getting today\'s schedule:', error);
    
    // Handle token expiration
    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      return res.status(401).json({ 
        error: 'Token expired or invalid',
        message: 'Please refresh your access token'
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to retrieve calendar events',
      details: error.message
    });
  }
};

/**
 * Get upcoming calendar events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUpcomingSchedule = async (req, res) => {
  try {
    const maxResults = req.query.maxResults ? parseInt(req.query.maxResults) : 10;
    
    // Extract access token from Authorization header or request body
    const accessToken = req.headers.authorization?.replace('Bearer ', '') || req.body.access_token;
    
    if (!accessToken) {
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'Please provide access token in Authorization header or request body'
      });
    }
    
    // Create auth client from frontend token
    const auth = createAuthFromToken(accessToken);
    
    // Get upcoming events
    const events = await getUpcomingEvents(auth, maxResults);
    return res.json(events);
  } catch (error) {
    console.error('Error getting upcoming schedule:', error);
    
    // Handle token expiration
    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      return res.status(401).json({ 
        error: 'Token expired or invalid',
        message: 'Please refresh your access token'
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to retrieve calendar events',
      details: error.message
    });
  }
};

/**
 * Use LLM to determine which calendar API to call
 * @param {string} userQuery - The user's query
 * @returns {Promise<string>} - The calendar API to call
 */
async function determineCalendarAPI(userQuery) {
  try {
    const prompt = `
You are a calendar assistant. Based on the user's message, determine which calendar API should be called.

Available APIs:
1. "getTodayEvents" - Get events for today only
2. "getWeekEvents" - Get events for the entire current week (Sunday to Saturday)
3. "getUpcomingEvents" - Get upcoming events (future events, good for next few days or general future queries)
4. "getPastEvents" - Get past events (for questions about what happened, previous meetings, etc.)

User message: "${userQuery}"

Respond with ONLY the API name (getTodayEvents, getWeekEvents, getUpcomingEvents, or getPastEvents). No explanation needed.

Examples:
- "What's my schedule today?" → getTodayEvents
- "What are my plans for this week?" → getWeekEvents
- "Do I have anything coming up?" → getUpcomingEvents
- "What's on my calendar tomorrow?" → getUpcomingEvents
- "Weekly schedule" → getWeekEvents
- "What meetings did I have yesterday?" → getPastEvents
- "Show me last week's events" → getPastEvents
- "What did I do on Monday?" → getPastEvents
- "Any events this afternoon?" → getTodayEvents
- "Free time next week?" → getUpcomingEvents
`;

    const response = await client.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: config.groq.modelName,
      temperature: 0.1, // Low temperature for consistent API selection
      max_tokens: 50,
    });

    const apiChoice = response.choices[0].message.content.trim();
    
    // Validate the response
    const validAPIs = ['getTodayEvents', 'getWeekEvents', 'getUpcomingEvents', 'getPastEvents'];
    if (validAPIs.includes(apiChoice)) {
      console.log(`LLM selected calendar API: ${apiChoice} for query: "${userQuery}"`);
      return apiChoice;
    }
    
    // Default fallback
    console.log(`LLM returned invalid API choice: ${apiChoice}, defaulting to getTodayEvents`);
    return 'getTodayEvents';
  } catch (error) {
    console.error('Error determining calendar API:', error);
    return 'getTodayEvents'; // Safe default
  }
}


/**
 * Handle calendar queries from frontend
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.handleCalendarQuery = async (req, res) => {
  try {
    // Access token is available via middleware
    const accessToken = req.accessToken;
    const { query, context = {} } = req.body;
    
    // Create auth client from frontend token
    const auth = createAuthFromToken(accessToken);
    
    // Use LLM to determine which calendar API to call
    const apiToCall = await determineCalendarAPI(query);
    console.log(`Calendar API selected: ${apiToCall} for query: "${query}"`);
    
    // Call the appropriate calendar API
    let calendarData = {};
    switch (apiToCall) {
      case 'getWeekEvents':
        calendarData = await getWeekEvents(auth);
        break;
      case 'getUpcomingEvents':
        const maxResults = context.maxResults || 10;
        calendarData = await getUpcomingEvents(auth, maxResults);
        break;
      case 'getPastEvents':
        const pastMaxResults = context.maxResults || 10;
        const daysBack = context.daysBack || 7;
        calendarData = await getPastEvents(auth, pastMaxResults, daysBack);
        break;
      case 'getTodayEvents':
      default:
        calendarData = await getTodayEvents(auth);
        break;
    }
    console.log('Calendar data retrieved:', calendarData);
    
    // Create system message with raw calendar data
    const systemMessage = {
      role: 'system',
      content: `The user is asking about their calendar. Here is their raw calendar data in JSON format:

${JSON.stringify(calendarData, null, 2)}

Please analyze this calendar data and provide a helpful, natural response to the user's query. Format your response clearly with proper structure (bullet points, headings, etc.) and include relevant details like event names, times, locations, and descriptions. If there are no events, let the user know in a friendly way.`
    };
    
    // Create messages for LLM
    const messages = [
      systemMessage,
      { role: 'user', content: query }
    ];
    
    // Call Groq API to generate response
    const response = await client.chat.completions.create({
      messages,
      model: config.groq.modelName,
      temperature: config.groq.temperature,
      max_tokens: config.groq.maxTokens,
    });
    
    // Return the AI response (same format as /api/chat)
    return res.json({ 
      response: response.choices[0].message.content 
    });
    
  } catch (error) {
    console.error('Error handling calendar query:', error);
    
    // Handle token expiration
    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      return res.status(401).json({ 
        error: 'Token expired or invalid',
        message: 'Please refresh your access token'
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to process calendar query',
      details: error.message
    });
  }
};