import { useState } from "react";
import axios from "axios";

const ReportForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    disasterType: "",
    description: "",
    lat: "",
    lng: "",
    mediaUrl: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, disasterType, description, lat, lng, mediaUrl } = formData;

    await axios.post("http://localhost:5000/api/reports", {
      name,
      disasterType,
      description,
      location: { lat, lng },
      mediaUrl,
    });

    alert("Report Submitted Successfully ✅");
  };

  return (
    <div className="p-5 bg-gray-100 rounded-xl shadow-md w-[400px] mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Report an Incident</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Your Name"
          className="p-2 border rounded"
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Disaster Type (Flood, Fire, etc)"
          className="p-2 border rounded"
          onChange={(e) => setFormData({ ...formData, disasterType: e.target.value })}
        />
        <textarea
          placeholder="Description"
          className="p-2 border rounded"
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        <input
          type="text"
          placeholder="Latitude"
          className="p-2 border rounded"
          onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
        />
        <input
          type="text"
          placeholder="Longitude"
          className="p-2 border rounded"
          onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
        />
        <input
          type="text"
          placeholder="Media URL (optional)"
          className="p-2 border rounded"
          onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
        />
        <button className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Submit Report
        </button>
      </form>
    </div>
  );
};

export default ReportForm;
