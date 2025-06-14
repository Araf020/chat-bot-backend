const {google} = require('googleapis');

/**
 * Create OAuth2 client from frontend-provided access token
 * @param {string} accessToken - Access token from frontend
 * @returns {OAuth2Client} - Configured OAuth2 client
 */
function createAuthFromToken(accessToken) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });
  return oauth2Client;
}

/**
 * Get today's events from the user's calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function getTodayEvents(auth) {
  const calendar = google.calendar({version: 'v3', auth});
  
  // Set up time bounds for today
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  
  try {
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    const events = res.data.items;
    if (!events || events.length === 0) {
      return { message: 'No events found for today.' };
    }
    
    // Format events
    return {
      date: startOfDay.toDateString(),
      events: events.map((event) => {
        const start = event.start.dateTime || event.start.date;
        const end = event.end.dateTime || event.end.date;
        return {
          title: event.summary,
          start,
          end,
          description: event.description || '',
          location: event.location || '',
          link: event.htmlLink
        };
      })
    };
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
}

/**
 * Get upcoming events from the user's calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function getUpcomingEvents(auth, maxResults = 10) {
  const calendar = google.calendar({version: 'v3', auth});
  
  try {
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    const events = res.data.items;
    if (!events || events.length === 0) {
      return { message: 'No upcoming events found.' };
    }
    
    // Format events
    return {
      events: events.map((event) => {
        const start = event.start.dateTime || event.start.date;
        const end = event.end.dateTime || event.end.date;
        return {
          title: event.summary,
          start,
          end,
          description: event.description || '',
          location: event.location || '',
          link: event.htmlLink
        };
      })
    };
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    throw error;
  }
}

/**
 * Get this week's events from the user's calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function getWeekEvents(auth) {
  const calendar = google.calendar({version: 'v3', auth});
  
  // Calculate week boundaries (Sunday to Saturday)
  const now = new Date();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 6, 23, 59, 59);
  
  try {
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfWeek.toISOString(),
      timeMax: endOfWeek.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    const events = res.data.items;
    if (!events || events.length === 0) {
      return { 
        message: 'No events found for this week.',
        weekStart: startOfWeek.toDateString(),
        weekEnd: endOfWeek.toDateString()
      };
    }
    
    // Format events
    return {
      weekStart: startOfWeek.toDateString(),
      weekEnd: endOfWeek.toDateString(),
      events: events.map((event) => {
        const start = event.start.dateTime || event.start.date;
        const end = event.end.dateTime || event.end.date;
        return {
          title: event.summary,
          start,
          end,
          description: event.description || '',
          location: event.location || '',
          link: event.htmlLink
        };
      })
    };
  } catch (error) {
    console.error('Error fetching week events:', error);
    throw error;
  }
}

/**
 * Get past events from the user's calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {number} maxResults Maximum number of past events to retrieve
 * @param {number} daysBack Number of days to look back (default: 7)
 */
async function getPastEvents(auth, maxResults = 10, daysBack = 7) {
  const calendar = google.calendar({version: 'v3', auth});
  
  // Calculate time boundaries for past events
  const now = new Date();
  const pastDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
  
  try {
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: pastDate.toISOString(),
      timeMax: now.toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    const events = res.data.items;
    if (!events || events.length === 0) {
      return { 
        message: `No events found in the past ${daysBack} days.`,
        periodStart: pastDate.toDateString(),
        periodEnd: now.toDateString()
      };
    }
    
    // Format events
    return {
      periodStart: pastDate.toDateString(),
      periodEnd: now.toDateString(),
      daysBack,
      events: events.map((event) => {
        const start = event.start.dateTime || event.start.date;
        const end = event.end.dateTime || event.end.date;
        return {
          title: event.summary,
          start,
          end,
          description: event.description || '',
          location: event.location || '',
          link: event.htmlLink
        };
      })
    };
  } catch (error) {
    console.error('Error fetching past events:', error);
    throw error;
  }
}

module.exports = {
  createAuthFromToken,
  getTodayEvents,
  getUpcomingEvents,
  getWeekEvents,
  getPastEvents
};