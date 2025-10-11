import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Report API endpoints
export const reportAPI = {
  // Get all reports with filtering and pagination
  getReports: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const { data } = await axios.get(`${API_BASE_URL}/reports?${params}`);
    return data;
  },

  // Create new report
  createReport: async (reportData, file = null) => {
    const formData = new FormData();
    
    // Add all report fields to FormData
    Object.keys(reportData).forEach(key => {
      if (reportData[key] !== undefined && reportData[key] !== null) {
        formData.append(key, reportData[key]);
      }
    });
    
    // Add file if present
    if (file) {
      formData.append('media', file);
    }

    const { data } = await axios.post(`${API_BASE_URL}/reports`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // Get report statistics
  getReportStats: async () => {
    const { data } = await axios.get(`${API_BASE_URL}/reports/stats`);
    return data;
  },

  // Update report status (admin only)
  updateReportStatus: async (reportId, statusData, token) => {
    const { data } = await axios.patch(
      `${API_BASE_URL}/reports/admin/status/${reportId}`,
      statusData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return data;
  },

  // Verify report (admin only)
  verifyReport: async (reportId, verified = true) => {
    const { data } = await axios.patch(
      `${API_BASE_URL}/reports/admin/verify/${reportId}`,
      { verified }
    );
    return data;
  },

  // Update report (admin only)
  updateReport: async (reportId, updateData) => {
    const { data } = await axios.patch(
      `${API_BASE_URL}/reports/admin/update/${reportId}`,
      updateData
    );
    return data;
  }
};

// Resource API endpoints
export const resourceAPI = {
  // Get all resources with filtering
  getResources: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const { data } = await axios.get(`${API_BASE_URL}/resources?${params}`);
    return data;
  },

  // Create new resource (admin only)
  createResource: async (resourceData) => {
    const { data } = await axios.post(`${API_BASE_URL}/resources`, resourceData);
    return data;
  },

  // Update resource (admin only)
  updateResource: async (resourceId, updateData) => {
    const { data } = await axios.put(
      `${API_BASE_URL}/resources/${resourceId}`,
      updateData
    );
    return data;
  },

  // Update resource occupancy (admin only)
  updateResourceOccupancy: async (resourceId, occupancyData) => {
    const { data } = await axios.patch(
      `${API_BASE_URL}/resources/${resourceId}/occupancy`,
      occupancyData
    );
    return data;
  },

  // Get resource statistics
  getResourceStats: async () => {
    const { data } = await axios.get(`${API_BASE_URL}/resources/stats`);
    return data;
  },

  // Delete resource (admin only)
  deleteResource: async (resourceId) => {
    const { data } = await axios.delete(`${API_BASE_URL}/resources/${resourceId}`);
    return data;
  }
};

// Dashboard API endpoints
export const dashboardAPI = {
  // Get dashboard overview
  getOverview: async () => {
    const { data } = await axios.get(`${API_BASE_URL}/dashboard/overview`);
    return data;
  },

  // Get live metrics
  getLiveMetrics: async () => {
    const { data } = await axios.get(`${API_BASE_URL}/dashboard/live-metrics`);
    return data;
  }
};

// Predictive Analytics API endpoints
export const predictiveAPI = {
  // Get comprehensive predictive analytics dashboard
  getAnalytics: async (region = 'pittsburgh') => {
    const { data } = await axios.get(`${API_BASE_URL}/predictive/analytics?region=${region}`);
    return data;
  },

  // Get risk analysis for specific location
  getRiskAnalysis: async (lat, lng, analysisType = 'comprehensive') => {
    const { data } = await axios.get(
      `${API_BASE_URL}/predictive/risk-analysis?lat=${lat}&lng=${lng}&analysisType=${analysisType}`
    );
    return data;
  },

  // Get risk map for region
  getRiskMap: async (centerLat, centerLng, radiusKm = 10, gridSize = 5) => {
    const { data } = await axios.get(
      `${API_BASE_URL}/predictive/risk-map?centerLat=${centerLat}&centerLng=${centerLng}&radiusKm=${radiusKm}&gridSize=${gridSize}`
    );
    return data;
  },

  // Get weather analysis
  getWeatherAnalysis: async (lat, lng) => {
    const { data } = await axios.get(`${API_BASE_URL}/predictive/weather?lat=${lat}&lng=${lng}`);
    return data;
  },

  // Get terrain analysis
  getTerrainAnalysis: async (lat, lng) => {
    const { data } = await axios.get(`${API_BASE_URL}/predictive/terrain?lat=${lat}&lng=${lng}`);
    return data;
  },

  // Get historical incident analysis
  getHistoricalAnalysis: async (lat, lng, radiusKm = 5, months = 12) => {
    const { data } = await axios.get(
      `${API_BASE_URL}/predictive/historical?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}&months=${months}`
    );
    return data;
  }
};

// Legacy export for backward compatibility
export const fetchReports = async () => {
  const result = await reportAPI.getReports();
  return result.reports || [];
};
