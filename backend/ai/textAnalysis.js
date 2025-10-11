import axios from "axios";
import dotenv from "dotenv"

dotenv.config();
export const analyzeText = async (text) => {
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
      {
        inputs: text,
        parameters: {
          candidate_labels: [
            "flood",
            "fire",
            "earthquake",
            "blocked road",
            "injury",
            "missing person",
            "other",
          ],
        },
      },
      { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
    );

    // 🧩 Defensive check
    if (!response.data || !response.data.labels) {
      throw new Error("Invalid NLP model response format");
    }

    return response.data.labels[0]?.toLowerCase() || "unverified";
  } catch (err) {
    console.error("NLP Error →", err.response?.data || err.message);
    throw new Error(`NLP Verification Failed: ${err.response?.data?.error || err.message}`);
  }
};