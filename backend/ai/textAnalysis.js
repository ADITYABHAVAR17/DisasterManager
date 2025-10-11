import axios from "axios";

export const analyzeText = async (text) => {
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
      { inputs: text },
      { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
    );

    const labels = ["flood", "fire", "earthquake", "blocked road", "injury", "missing person"];
    const labelScores = labels.map((label, index) => ({
      label,
      score: response.data[0].scores[index],
    }));

    const top = labelScores.sort((a, b) => b.score - a.score)[0];
    return top.label;
  } catch (err) {
    console.error("NLP Error:", err.message);
    return "unverified";
  }
};
