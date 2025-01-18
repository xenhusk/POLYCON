// Import the Google Generative AI library
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Generative AI client with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generateSummary = async (text) => {
  try {
    const prompt = `Summarize the following text in a concise paragraph:\n${text}`;

    // Call the Gemini API using the provided library
    const result = await model.generateContent(prompt);

    // Extract the summary from the response
    return result.response.text();
  } catch (error) {
    console.error('Error generating summary:', error.message);
    throw new Error('Failed to generate summary');
  }
};

module.exports = { generateSummary };
