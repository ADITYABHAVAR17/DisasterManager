import axios from "axios";

const API_URL = "http://localhost:8000/api/chat";

export const sendMessage = async (message) => {
  try {
    // Format message to request structured response focused on India
    const structuredPrompt = `Please provide a short response about "${message}" specifically for India context.

Requirements:
• Focus on Indian emergency services, laws, and procedures
• Keep response under 100 words
• Use bullet points for key information
• Include relevant Indian emergency numbers if applicable
• Provide actionable steps for Indian citizens

Query: ${message}`;

    const res = await axios.post(API_URL, { message: structuredPrompt });
    return res.data.response;
  } catch (error) {
    // Surface backend-provided error details when available
    const detail = error?.response?.data?.detail;
    const status = error?.response?.status;
    if (detail) {
      return `Error (${status ?? "unknown"}): ${detail}`;
    }
    console.error(error);
    return "Error connecting to backend.";
  }
};
