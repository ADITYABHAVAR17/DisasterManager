import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  disasterType: { type: String },
  description: { type: String, required: true },
  location: { lat: Number, lng: Number },
  mediaUrl: { type: String },
  verified: { type: Boolean, default: false },
  aiCategory: { type: String, default: "unverified" },
  priority: { type: String, default: "low" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Report", reportSchema);
