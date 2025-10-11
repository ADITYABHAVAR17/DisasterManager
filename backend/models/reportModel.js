import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  disasterType: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    lat: Number,
    lng: Number,
  },
  mediaUrl: { type: String },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Report", reportSchema);
