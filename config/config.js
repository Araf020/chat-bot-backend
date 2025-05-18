/**
 * Configuration settings for the application
 */
module.exports = {
  // Server configuration
  port: process.env.PORT || 3001,
  
  // Groq API configuration
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    modelName: process.env.MODEL_NAME || "llama-3.3-70b-versatile",
    temperature: 0.7,
    maxTokens: 2000
  }
};