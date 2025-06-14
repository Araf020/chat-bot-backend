const express = require('express');
const calendarController = require('../controllers/calendarController');
const { requireGoogleAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Get today's calendar events
router.get('/today', requireGoogleAuth, calendarController.getTodaySchedule);

// Get upcoming calendar events
router.get('/upcoming', requireGoogleAuth, calendarController.getUpcomingSchedule);

// Handle calendar queries from frontend
router.post('/query', requireGoogleAuth, calendarController.handleCalendarQuery);

module.exports = router;