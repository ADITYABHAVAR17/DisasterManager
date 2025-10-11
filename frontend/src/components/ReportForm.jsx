import { useState } from "react";
import axios from "axios";

const ReportForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    disasterType: "",
    description: "",
    lat: "",
    lng: "",
    media: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setFormData({ ...formData, [name]: files[0] });
    else setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("disasterType", formData.disasterType);
    data.append("description", formData.description);
    data.append("lat", formData.lat);
    data.append("lng", formData.lng);
    if (formData.media) data.append("media", formData.media);

    await axios.post("http://localhost:5000/api/reports", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert("Report submitted successfully ✅");
  };

  return (
    <div className="p-5 bg-gray-100 rounded-xl shadow-md w-[400px] mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Report an Incident</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input name="name" placeholder="Your Name" className="p-2 border rounded" onChange={handleChange} />
        <input name="disasterType" placeholder="Disaster Type" className="p-2 border rounded" onChange={handleChange} />
        <textarea name="description" placeholder="Description" className="p-2 border rounded" onChange={handleChange} />
        <input name="lat" placeholder="Latitude" className="p-2 border rounded" onChange={handleChange} />
        <input name="lng" placeholder="Longitude" className="p-2 border rounded" onChange={handleChange} />
        <input name="media" type="file" className="p-2 border rounded" onChange={handleChange} />
        <button className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Submit Report</button>
      </form>
    </div>
  );
};

export default ReportForm;
