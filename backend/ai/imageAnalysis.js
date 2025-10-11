import axios from "axios";

export const analyzeImage = async (imageUrl) => {
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
      { inputs: imageUrl },
      { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
    );

    const labels = response.data[0].map((obj) => obj.label.toLowerCase());
    const isRelevant =
      labels.some((label) =>
        ["fire", "flood", "smoke", "disaster", "damage", "rescue"].some((kw) =>
          label.includes(kw)
        )
      );

    return isRelevant;
  } catch (err) {
    console.error("Image AI Error:", err.message);
    return false;
  }
};
