import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Camera, Upload, MapPin, AlertTriangle, User, FileText, CheckCircle, X, Loader } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const LocationPicker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const ReportForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    disasterType: "",
    description: "",
    lat: "",
    lng: "",
    media: null,
  });

  const [position, setPosition] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [cameraMode, setCameraMode] = useState(false);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const disasterTypes = [
    "Earthquake", "Flood", "Fire", "Hurricane", "Tornado", 
    "Landslide", "Tsunami", "Drought", "Volcanic Eruption", "Other"
  ];

  // Get current location
  const getCurrentLocation = () => {
    setUseCurrentLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          setFormData(prev => ({
            ...prev,
            lat: latitude.toString(),
            lng: longitude.toString()
          }));
          setUseCurrentLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setUseCurrentLocation(false);
          alert("Unable to get your location. Please select on the map or enter manually.");
        }
      );
    }
  };

  // Update form data when position changes
  useEffect(() => {
    if (position) {
      setFormData(prev => ({
        ...prev,
        lat: position[0].toString(),
        lng: position[1].toString()
      }));
    }
  }, [position]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files && files[0]) {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target.result);
        setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
      };
      reader.readAsDataURL(file);
    } else {
      setFormData({ ...formData, [name]: value });
      
      // Update position if lat/lng changed manually
      if (name === 'lat' || name === 'lng') {
        const lat = name === 'lat' ? parseFloat(value) : parseFloat(formData.lat);
        const lng = name === 'lng' ? parseFloat(value) : parseFloat(formData.lng);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          setPosition([lat, lng]);
        }
      }
    }
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Camera functionality
  const startCamera = async () => {
    setCameraMode(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraMode(false);
      alert("Unable to access camera. Please use file upload instead.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], `captured-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setFormData(prev => ({ ...prev, media: file }));
        setMediaPreview(canvas.toDataURL());
        setMediaType('image');
        stopCamera();
      }, 'image/jpeg', 0.8);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setCameraMode(false);
  };

  const removeMedia = () => {
    setFormData(prev => ({ ...prev, media: null }));
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.disasterType) newErrors.disasterType = 'Disaster type is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.lat || !formData.lng) newErrors.location = 'Location is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
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

      setShowSuccess(true);
      // Reset form
      setFormData({
        name: "",
        disasterType: "",
        description: "",
        lat: "",
        lng: "",
        media: null,
      });
      setPosition(null);
      setMediaPreview(null);
      setMediaType(null);
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {showSuccess && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
            <CheckCircle className="h-5 w-5" />
            Report submitted successfully!
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Emergency Report</h1>
                <p className="text-red-100">Help us respond faster by providing accurate information</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 p-6">
            {/* Form Section */}
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      placeholder="Enter your full name"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                      onChange={handleChange}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                </div>

                {/* Incident Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Incident Details
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Disaster Type *
                    </label>
                    <select
                      name="disasterType"
                      value={formData.disasterType}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${errors.disasterType ? 'border-red-500' : 'border-gray-300'}`}
                      onChange={handleChange}
                    >
                      <option value="">Select disaster type</option>
                      {disasterTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {errors.disasterType && <p className="text-red-500 text-sm mt-1">{errors.disasterType}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      placeholder="Describe the incident in detail..."
                      rows={4}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                      onChange={handleChange}
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </h3>
                  
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={useCurrentLocation}
                      className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                    >
                      {useCurrentLocation ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                      Use Current Location
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Latitude *
                      </label>
                      <input
                        name="lat"
                        value={formData.lat}
                        placeholder="0.0000"
                        type="number"
                        step="any"
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Longitude *
                      </label>
                      <input
                        name="lng"
                        value={formData.lng}
                        placeholder="0.0000"
                        type="number"
                        step="any"
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                </div>

                {/* Media Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Media (Optional)
                  </h3>

                  {!mediaPreview && !cameraMode && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Camera className="h-4 w-4" />
                        Take Photo
                      </button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    name="media"
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleChange}
                  />

                  {cameraMode && (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full rounded-lg"
                      />
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Camera className="h-6 w-6" />
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="bg-gray-500 text-white p-3 rounded-full hover:bg-gray-600 transition-colors"
                        >
                          <X className="h-6 w-6" />
                        </button>
                      </div>
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  )}

                  {mediaPreview && (
                    <div className="relative">
                      {mediaType === 'video' ? (
                        <video
                          src={mediaPreview}
                          controls
                          className="w-full rounded-lg max-h-64"
                        />
                      ) : (
                        <img
                          src={mediaPreview}
                          alt="Preview"
                          className="w-full rounded-lg max-h-64 object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={removeMedia}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5" />
                      Submit Emergency Report
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Map Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Select Location on Map
              </h3>
              
              <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ height: '500px' }}>
                <MapContainer
                  center={position || [40.7128, -74.0060]} // Default to NYC
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationPicker position={position} setPosition={setPosition} />
                </MapContainer>
              </div>
              
              <p className="text-sm text-gray-600">
                Click on the map to select the incident location, or use the "Use Current Location" button above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportForm;
