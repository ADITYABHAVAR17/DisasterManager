import Report from "../models/reportModel.js";

export const createReport = async (req, res) => {
  try {
    const { name, disasterType, description, location, mediaUrl } = req.body;

    const report = await Report.create({
      name,
      disasterType,
      description,
      location,
      mediaUrl,
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getReports = async (req, res) => {
  const reports = await Report.find();
  res.json(reports);
};
