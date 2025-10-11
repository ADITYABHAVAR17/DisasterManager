import Report from "../models/reportModel.js";

export const createReport = async (req, res) => {
  try {
    const { name, disasterType, description, lat, lng } = req.body;

    const mediaUrl = req.file ? req.file.path : null; // Cloudinary URL

    const report = await Report.create({
      name,
      disasterType,
      description,
      location: { lat, lng },
      mediaUrl,
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getReports = async (req, res) => {
  const reports = await Report.find();
  res.json(reports);
};
