import { analyzeText } from "./textAnalysis.js";
import { analyzeImage } from "./imageAnalysis.js";

export const verifyReport = async (report) => {
  const textCategory = await analyzeText(report.description);
  const imageVerified = report.mediaUrl ? await analyzeImage(report.mediaUrl) : false;

  const verified = imageVerified || ["fire", "flood", "earthquake"].includes(textCategory);

  return {
    verified,
    category: textCategory,
    priority: verified ? "high" : "low",
  };
};
