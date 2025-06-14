require('dotenv').config();
const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chatRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const authRoutes = require('./routes/authRoutes');
const config = require('./config/config');

// Check if API key is present
if (!config.groq.apiKey) {
  console.error("GROQ_API_KEY not found in environment variables");
  process.exit(1);
}

// Initialize Express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', chatRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
  console.log(`Using Groq API with model: ${config.groq.modelName}`);
});