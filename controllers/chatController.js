const Groq = require('groq-sdk');
const config = require('../config/config');
// Calendar functions removed - calendar data now comes from frontend via /calendar/query endpoint

// Initialize Groq client
const client = new Groq({ apiKey: config.groq.apiKey });

// Calendar-related functions removed - frontend handles calendar queries via /calendar/query endpoint

/**
 * Process chat messages and get AI response
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.processChat = async (req, res) => {
  try {
    const { messages } = req.body;
    
    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }
    
    // Calendar integration removed - frontend now handles calendar data via /calendar/query
    // and includes it as context in the chat request
    
    // Call Groq API
    const response = await client.chat.completions.create({
      messages,
      model: config.groq.modelName,
      temperature: config.groq.temperature,
      max_tokens: config.groq.maxTokens,
    });
    
    // Return the AI response
    return res.json({ 
      response: response.choices[0].message.content 
    });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    return res.status(500).json({ 
      error: "An error occurred while processing your request",
      details: error.message
    });
  }
};

/**
 * Save conversation history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.saveConversation = async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;
    
    // Implementation for saving conversation will go here
    // This is a placeholder for now
    
    return res.json({ success: true, message: "Conversation saved" });
  } catch (error) {
    console.error("Error saving conversation:", error);
    return res.status(500).json({ error: "Failed to save conversation" });
  }
};