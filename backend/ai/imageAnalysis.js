import axios from "axios";

export const analyzeImage = async (imageUrl) => {
  try {
    // Enhanced URL validation
    if (!imageUrl || typeof imageUrl !== "string") {
      throw new Error("Invalid image URL: URL must be a string");
    }

    if (!imageUrl.startsWith("http")) {
      throw new Error("Invalid image URL: Must start with http/https");
    }

    console.log("🔍 Analyzing image:", imageUrl);

    // Validate API key
    if (!process.env.HF_API_KEY) {
      throw new Error("HuggingFace API key is missing");
    }

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
      { inputs: imageUrl },
      {
        headers: { 
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000,
      }
    );

    console.log("✅ HF API Response received");

    // Handle different response formats from HuggingFace
    let predictions = [];
    
    if (Array.isArray(response.data)) {
      predictions = response.data;
    } else if (response.data && Array.isArray(response.data.predictions)) {
      predictions = response.data.predictions;
    } else if (response.data && response.data.label) {
      // Single prediction object
      predictions = [response.data];
    } else {
      console.error("Unexpected HF response format:", response.data);
      throw new Error("Unexpected image model output format");
    }

    if (predictions.length === 0) {
      console.warn("No predictions returned from image analysis");
      return false;
    }

    // Extract and process labels
    const labels = predictions.map((obj) => {
      if (obj.label && typeof obj.label === 'string') {
        return obj.label.toLowerCase();
      }
      if (obj.score && obj.label === undefined) {
        // Handle case where label might be in a different property
        return Object.keys(obj).find(key => key !== 'score')?.toLowerCase() || '';
      }
      return '';
    }).filter(label => label.length > 0);

    console.log("📊 Detected labels:", labels);

    if (labels.length === 0) {
      return false;
    }

    // Define relevant disaster-related terms
    const relevantTerms = [
      "fire", "flame", "burning", "blaze",
      "flood", "water", "flooded", "flooding",
      "rescue", "emergency", "accident", "crash",
      "damage", "destroyed", "debris", "wreckage",
      "disaster", "catastrophe", "emergency",
      "smoke", "smoking", "fog", "haze",
      "storm", "hurricane", "tornado", "earthquake",
      "ambulance", "fire truck", "police", "siren"
    ];

    // Check if any label contains relevant terms
    const isRelevant = labels.some(label => 
      relevantTerms.some(term => label.includes(term))
    );

    // Additional check: if confidence scores are available, use them
    const confidentPredictions = predictions.filter(pred => 
      pred.score && pred.score > 0.1
    );
    
    const confidentLabels = confidentPredictions.map(pred => 
      pred.label?.toLowerCase() || ''
    ).filter(label => label.length > 0);

    const isConfidentlyRelevant = confidentLabels.some(label => 
      relevantTerms.some(term => label.includes(term))
    );

    console.log(`🎯 Relevance result: ${isRelevant} (Confident: ${isConfidentlyRelevant})`);

    // Return true if either regular or confident check passes
    return isRelevant || isConfidentlyRelevant;

  } catch (err) {
    console.error("❌ Image AI Error:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      url: err.config?.url
    });

    // More specific error messages
    if (err.code === 'ECONNABORTED') {
      throw new Error("Image analysis timeout - service unavailable");
    }
    
    if (err.response?.status === 401) {
      throw new Error("Invalid HuggingFace API key");
    }
    
    if (err.response?.status === 503) {
      throw new Error("Image analysis model is loading, please try again in a few moments");
    }
    
    if (err.response?.status === 429) {
      throw new Error("Too many image analysis requests - rate limit exceeded");
    }

    throw new Error(
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      "Image analysis service unavailable"
    );
  }
};

// Optional: Add a retry mechanism for better reliability
export const analyzeImageWithRetry = async (imageUrl, maxRetries = 2) => {
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      console.log(`Attempt ${attempt} to analyze image...`);
      const result = await analyzeImage(imageUrl);
      return result;
    } catch (error) {
      console.warn(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt > maxRetries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};