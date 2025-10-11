import { analyzeText } from "./textAnalysis.js";
import { analyzeImage } from "./imageAnalysis.js";

export const verifyReport = async (report) => {
  const textCategory = await analyzeText(report.description);
  const imageVerified = report.mediaUrl ? await analyzeImage(report.mediaUrl) : false;

  // Enhanced verification logic based on incident type and urgency
  const highPriorityIncidents = [
    "fire-emergency", 
    "medical-emergency", 
    "flood", 
    "earthquake", 
    "severe-weather"
  ];
  
  const infrastructureIncidents = [
    "blocked-road", 
    "infrastructure-damage"
  ];

  let verified = false;
  let priority = "low";

  // AI verification based on text analysis and image
  if (imageVerified || ["fire", "flood", "earthquake", "medical", "emergency"].some(keyword => 
    report.description.toLowerCase().includes(keyword))) {
    verified = true;
  }

  // Priority determination based on incident type and urgency
  if (report.urgency === 'immediate' || highPriorityIncidents.includes(report.incidentType)) {
    priority = "high";
  } else if (report.urgency === 'urgent' || infrastructureIncidents.includes(report.incidentType)) {
    priority = "medium";
  } else {
    priority = "low";
  }

  // Additional verification for missing persons - always treat as high priority
  if (report.incidentType === 'missing-person') {
    verified = true;
    priority = "high";
  }

  // Increase verification confidence with witness count and affected people
  if (report.witnessCount > 1 || report.estimatedAffected > 5) {
    verified = true;
    if (priority === "low") priority = "medium";
  }

  return {
    verified,
    category: textCategory || report.incidentType,
    priority,
    confidence: verified ? (imageVerified ? 0.9 : 0.7) : 0.3,
    aiDetails: {
      textAnalysis: textCategory,
      imageVerified,
      witnessCount: report.witnessCount,
      estimatedAffected: report.estimatedAffected
    }
  };
};
