import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  disasterType: { type: String }, // Legacy field, kept for backward compatibility
  incidentType: { 
    type: String, 
    required: true,
    enum: [
      'fire-emergency', 'medical-emergency', 'blocked-road', 'missing-person',
      'infrastructure-damage', 'flood', 'earthquake', 'severe-weather', 'other'
    ]
  },
  urgency: {
    type: String,
    required: true,
    enum: ['immediate', 'urgent', 'moderate', 'low'],
    default: 'moderate'
  },
  description: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String } // Optional readable address
  },
  phone: { type: String, required: true },
  witnessCount: { type: Number, min: 0, default: 1 },
  estimatedAffected: { type: Number, min: 0, default: 1 },
  additionalContact: { type: String }, // Optional
  mediaUrl: { type: String },
  verified: { type: Boolean, default: false },
  aiVerified: { type: Boolean, default: false },
  aiCategory: { type: String, default: "unverified" },
  priority: { type: String, default: "low" },
  status: { 
    type: String, 
    enum: ['pending', 'investigating', 'in-progress', 'resolved'], 
    default: 'pending' 
  },
  assignedTo: { type: String }, // Admin or team assigned
  notes: [{ // Admin notes/updates
    content: String,
    addedBy: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Index for geospatial queries
reportSchema.index({ "location.lat": 1, "location.lng": 1 });

export default mongoose.model("Report", reportSchema);
