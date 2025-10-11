import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['safe-zone', 'shelter', 'medical-aid', 'supply-center', 'evacuation-point', 'relief-camp', 'medical-center', 'food-distribution', 'evacuation-center']
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String }
  },
  capacity: { type: Number, required: true, min: 1 },
  currentOccupancy: { type: Number, default: 0, min: 0 },
  availability: {
    type: String,
    enum: ['available', 'full', 'limited', 'closed'],
    default: 'available'
  },
  contact: {
    phone: { type: String },
    email: { type: String },
    inCharge: { type: String }
  },
  services: [{
    type: String,
    enum: [
      'food', 'water', 'medical-aid', 'shelter', 'communication', 
      'transportation', 'clothing', 'child-care', 'elderly-care'
    ]
  }],
  operatingHours: {
    start: { type: String, default: '24/7' },
    end: { type: String, default: '24/7' },
    is24Hours: { type: Boolean, default: true }
  },
  description: { type: String },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  lastUpdated: { type: Date, default: Date.now },
  createdBy: { type: String }, // Admin who created the resource
  notes: [{ // Admin notes/updates
    content: String,
    addedBy: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Index for geospatial queries
resourceSchema.index({ "location.lat": 1, "location.lng": 1 });
resourceSchema.index({ type: 1 });
resourceSchema.index({ availability: 1 });

export default mongoose.model("Resource", resourceSchema);