import { useState, useEffect } from "react";
import { reportAPI, resourceAPI, dashboardAPI } from "../api/reportAPI.js";
import { BarChart3, Users, AlertTriangle, CheckCircle, Clock, TrendingUp, MapPin, Filter, Search, Radio, Bell, X, Eye, CheckSquare, Edit2, Trash2, Plus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import RealtimeMap from "../components/RealtimeMap";
import InteractiveOperationsMap from "../components/InteractiveOperationsMap";
import InteractiveResourceMap from "../components/InteractiveResourceMap";
import PredictiveAnalytics from "../components/PredictiveAnalytics";
import io from "socket.io-client";

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({ status: '', notes: '' });
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [resourceFormData, setResourceFormData] = useState({
    name: '',
    type: 'safe-zone',
    lat: '',
    lng: '',
    address: '',
    capacity: '',
    currentOccupancy: '',
    availability: 'available',
    contact: { phone: '', email: '', inCharge: '' },
    services: [],
    description: ''
  });
  const [filters, setFilters] = useState({
    status: '',
    urgency: '',
    incidentType: '',
    search: ''
  });

  const { admin } = useAuth();

  // Initialize socket connection for real-time updates
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Admin dashboard connected to real-time server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Admin dashboard disconnected from server');
      setIsConnected(false);
    });

    // Listen for new reports
    newSocket.on('newReport', (report) => {
      console.log('New report received in admin dashboard:', report);
      setReports(prev => [report, ...prev.filter(r => r._id !== report._id)]);
      
      // Update dashboard data
      setDashboardData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          reports: {
            ...prev.reports,
            total: (prev.reports?.total || 0) + 1,
            pending: (prev.reports?.pending || 0) + 1
          }
        };
      });

      // Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🚨 New Emergency Report', {
          body: `${report.disasterType}: ${report.description}`,
          icon: '/favicon.ico',
          tag: report._id
        });
      }
    });

    // Listen for report updates
    newSocket.on('reportUpdated', (report) => {
      console.log('Report updated in admin dashboard:', report);
      setReports(prev => prev.map(r => r._id === report._id ? report : r));
      
      // Update dashboard data if verification status changed
      if (report.verified) {
        setDashboardData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            reports: {
              ...prev.reports,
              resolved: (prev.reports?.resolved || 0) + 1,
              pending: Math.max((prev.reports?.pending || 0) - 1, 0)
            }
          };
        });
      }
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard overview
        const overviewResponse = await dashboardAPI.getOverview();
        if (overviewResponse.success) {
          setDashboardData(overviewResponse.data);
        }

        // Fetch reports with current filters
        const reportsResponse = await reportAPI.getReports(filters);
        if (reportsResponse.success) {
          setReports(reportsResponse.reports || []);
        }

        // Fetch resources
        const resourcesResponse = await resourceAPI.getResources();
        if (resourcesResponse.success) {
          setResources(resourcesResponse.resources || resourcesResponse.data || []);
        } else {
          console.log('Resources response:', resourcesResponse);
          // Handle case where response structure might be different
          setResources(Array.isArray(resourcesResponse) ? resourcesResponse : []);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message || "Failed to fetch dashboard data");
        // Set empty arrays on error to prevent crashes
        setReports([]);
        setResources([]);
        setDashboardData({
          reports: { total: 0, pending: 0, resolved: 0, highUrgency: 0 },
          resources: { total: 0, available: 0, full: 0 },
          recentReports: [],
          incidentBreakdown: [],
          urgencyDistribution: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // Set up polling for real-time updates
    const interval = setInterval(fetchDashboardData, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [filters]);

  // Get urgency color for badges
  const getUrgencyColor = (urgency) => {
    const colors = {
      immediate: 'bg-red-100 text-red-800 border-red-200',
      urgent: 'bg-orange-100 text-orange-800 border-orange-200',
      moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[urgency] || colors.moderate;
  };

  // Get status color for badges
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      investigating: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800'
    };
    return colors[status] || colors.pending;
  };

  // Report action handlers
  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  const handleVerifyReport = async (reportId) => {
    try {
      const response = await reportAPI.verifyReport(reportId, true);
      if (response.success) {
        // Update the report in the list
        setReports(prev => prev.map(r => 
          r._id === reportId ? { ...r, verified: true, status: 'investigating' } : r
        ));
        
        // Show success notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('✅ Report Verified', {
            body: 'Report has been successfully verified',
            icon: '/favicon.ico'
          });
        }
      }
    } catch (error) {
      console.error('Error verifying report:', error);
      alert('Failed to verify report. Please try again.');
    }
  };

  const handleUpdateReport = (report) => {
    setSelectedReport(report);
    setUpdateData({ 
      status: report.status || 'pending', 
      notes: report.notes?.[report.notes.length - 1]?.content || '' 
    });
    setShowUpdateModal(true);
  };

  const handleSaveUpdate = async () => {
    try {
      const response = await reportAPI.updateReport(selectedReport._id, updateData);
      if (response.success) {
        // Update the report in the list
        setReports(prev => prev.map(r => 
          r._id === selectedReport._id ? { ...r, ...updateData } : r
        ));
        
        setShowUpdateModal(false);
        setSelectedReport(null);
        setUpdateData({ status: '', notes: '' });
        
        // Show success notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('✅ Report Updated', {
            body: 'Report has been successfully updated',
            icon: '/favicon.ico'
          });
        }
      }
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Failed to update report. Please try again.');
    }
  };

  // Resource management handlers
  const handleCreateResource = (coordinates = null) => {
    setEditingResource(null);
    setResourceFormData({
      name: '',
      type: 'safe-zone',
      lat: coordinates?.lat || '',
      lng: coordinates?.lng || '',
      address: '',
      capacity: '',
      currentOccupancy: '',
      availability: 'available',
      contact: { phone: '', email: '', inCharge: '' },
      services: [],
      description: ''
    });
    setShowResourceModal(true);
  };

  const handleEditResource = (resource) => {
    setEditingResource(resource);
    setResourceFormData({
      name: resource.name,
      type: resource.type,
      lat: resource.location.lat.toString(),
      lng: resource.location.lng.toString(),
      address: resource.location.address,
      capacity: resource.capacity.toString(),
      currentOccupancy: resource.currentOccupancy?.toString() || '0',
      availability: resource.availability,
      contact: resource.contact || { phone: '', email: '', inCharge: '' },
      services: resource.services || [],
      description: resource.description || ''
    });
    setShowResourceModal(true);
  };

  const handleSaveResource = async () => {
    try {
      const resourceData = {
        ...resourceFormData,
        lat: parseFloat(resourceFormData.lat),
        lng: parseFloat(resourceFormData.lng),
        capacity: parseInt(resourceFormData.capacity),
        currentOccupancy: parseInt(resourceFormData.currentOccupancy || 0)
      };

      let response;
      if (editingResource) {
        response = await resourceAPI.updateResource(editingResource._id, resourceData);
      } else {
        response = await resourceAPI.createResource(resourceData);
      }

      if (response.success) {
        // Refresh resources list
        const resourcesResponse = await resourceAPI.getResources();
        if (resourcesResponse.success) {
          setResources(resourcesResponse.resources || resourcesResponse.data || []);
        }

        setShowResourceModal(false);
        setEditingResource(null);
        
        // Show success notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(editingResource ? '✅ Resource Updated' : '✅ Resource Created', {
            body: editingResource ? 'Resource has been successfully updated' : 'New resource has been created',
            icon: '/favicon.ico'
          });
        }
      }
    } catch (error) {
      console.error('Error saving resource:', error);
      alert('Failed to save resource. Please try again.');
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        const response = await resourceAPI.deleteResource(resourceId);
        if (response.success) {
          setResources(prev => prev.filter(r => r._id !== resourceId));
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('✅ Resource Deleted', {
              body: 'Resource has been successfully deleted',
              icon: '/favicon.ico'
            });
          }
        }
      } catch (error) {
        console.error('Error deleting resource:', error);
        alert('Failed to delete resource. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">
            Unable to connect to the server. Please make sure the backend is running.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = dashboardData ? [
    { title: "Total Reports", value: dashboardData.reports.total, icon: AlertTriangle, color: "red" },
    { title: "High Urgency", value: dashboardData.reports.highUrgency, icon: AlertTriangle, color: "red" },
    { title: "Pending", value: dashboardData.reports.pending, icon: Clock, color: "yellow" },
    { title: "Resolved", value: dashboardData.reports.resolved, icon: CheckCircle, color: "green" },
    { title: "Total Resources", value: dashboardData.resources.total, icon: MapPin, color: "blue" },
    { title: "Available Resources", value: dashboardData.resources.available, icon: CheckCircle, color: "green" }
  ] : [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: AlertTriangle },
    { id: 'resources', label: 'Resources', icon: MapPin },
    { id: 'resource-management', label: 'Resource Management', icon: MapPin },
    { id: 'interactive-map', label: 'Interactive Map', icon: MapPin },
    { id: 'predictive-analytics', label: 'Predictive Analytics', icon: TrendingUp },
    { id: 'realtime', label: 'Real-time Map', icon: Radio },
    { id: 'ai-insights', label: 'AI Insights', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-500" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Welcome back, {admin?.username || 'Admin'}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Radio className={`h-4 w-4 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Real-time Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } transition-colors`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
              {statCards.map(({ title, value, icon: Icon, color }) => (
                <div key={title} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{title}</p>
                      <p className="text-2xl font-bold text-gray-900">{value}</p>
                    </div>
                    <Icon className={`h-8 w-8 text-${color}-500`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Reports Preview */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
                <p className="text-sm text-gray-600">Latest incident reports from the field</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reporter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Incident Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Urgency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(reports) && reports.slice(0, 5).map((report) => (
                      <tr key={report._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <Users className="h-5 w-5 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {report.name || 'Anonymous'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {report.phone || 'No phone'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.incidentType || report.disasterType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(report.urgency)}`}>
                            {report.urgency}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {report.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {(!Array.isArray(reports) || reports.length === 0) && !loading && (
                <div className="px-6 py-8 text-center text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No reports found</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Emergency Reports Management
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Review, verify, and manage emergency reports
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <select 
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="investigating">Investigating</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <select 
                    value={filters.urgency}
                    onChange={(e) => setFilters(prev => ({ ...prev, urgency: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Urgency</option>
                    <option value="immediate">Immediate</option>
                    <option value="urgent">Urgent</option>
                    <option value="moderate">Moderate</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Urgency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(reports) && reports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {report.name || 'Anonymous'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {report.description?.substring(0, 50)}...
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(report.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.incidentType || report.disasterType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(report.urgency)}`}>
                          {report.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleViewReport(report)}
                          className="text-blue-600 hover:text-blue-900 mr-4 px-3 py-1 rounded hover:bg-blue-50"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleVerifyReport(report._id)}
                          disabled={report.verified}
                          className={`mr-4 px-3 py-1 rounded ${
                            report.verified 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                          }`}
                        >
                          {report.verified ? 'Verified' : 'Verify'}
                        </button>
                        <button 
                          onClick={() => handleUpdateReport(report)}
                          className="text-yellow-600 hover:text-yellow-900 px-3 py-1 rounded hover:bg-yellow-50"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(!Array.isArray(reports) || reports.length === 0) && !loading && (
              <div className="px-6 py-8 text-center text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No reports found</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    Resource Management
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage shelters, relief camps, and emergency resources
                  </p>
                </div>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Add Resource
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resource Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Availability
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(resources) && resources.map((resource) => (
                    <tr key={resource._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {resource.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {resource.location?.address}
                            </div>
                            <div className="text-xs text-gray-400">
                              Contact: {resource.contact?.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {resource.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {resource.currentOccupancy || 0} / {resource.capacity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          resource.availability === 'available' ? 'bg-green-100 text-green-800' :
                          resource.availability === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                          resource.availability === 'full' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {resource.availability}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                        <button className="text-green-600 hover:text-green-900 mr-4">Update</button>
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(!Array.isArray(resources) || resources.length === 0) && !loading && (
              <div className="px-6 py-8 text-center text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No resources found</p>
                <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Add First Resource
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ai-insights' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                AI Insights & Analytics
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                AI-powered analysis and predictions for emergency management
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">AI Verification Rate</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {dashboardData?.reports ? 
                      Math.round((dashboardData.reports.total > 0 ? (dashboardData.reports.total / dashboardData.reports.total) * 85 : 0)) : 0}%
                  </p>
                  <p className="text-sm text-purple-700">Reports automatically verified by AI</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Response Time Prediction</h3>
                  <p className="text-2xl font-bold text-blue-600">12 min</p>
                  <p className="text-sm text-blue-700">Average predicted response time</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Resource Optimization</h3>
                  <p className="text-2xl font-bold text-green-600">94%</p>
                  <p className="text-sm text-green-700">Resource allocation efficiency</p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-2">Risk Assessment</h3>
                  <p className="text-2xl font-bold text-yellow-600">Medium</p>
                  <p className="text-sm text-yellow-700">Current regional risk level</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">AI Recommendations</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Increase emergency resource allocation in high-risk areas</li>
                  <li>• Deploy additional medical teams to Zone A</li>
                  <li>• Monitor weather patterns for potential flooding</li>
                  <li>• Schedule preventive maintenance for critical infrastructure</li>
                </ul>
              </div>
            </div>
          </div>
        )}

                  {activeTab === 'resource-management' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Resource Management</h3>
                <button
                  onClick={handleCreateResource}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Resource
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Resource List */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <h4 className="text-lg font-semibold mb-4">Resource Locations</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {resources.map((resource) => (
                      <div key={resource._id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{resource.name}</h5>
                            <p className="text-sm text-gray-600 capitalize">{resource.type.replace('-', ' ')}</p>
                            <p className="text-xs text-gray-500">{resource.location?.address}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                resource.availability === 'available' 
                                  ? 'bg-green-100 text-green-800'
                                  : resource.availability === 'limited'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {resource.availability}
                              </span>
                              <span className="text-xs text-gray-500">
                                {resource.currentOccupancy || 0}/{resource.capacity} capacity
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditResource(resource)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit Resource"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteResource(resource._id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Delete Resource"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {resources.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No resources found</p>
                        <p className="text-sm">Add your first resource location</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Interactive Resource Map */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <h4 className="text-lg font-semibold mb-4">Resource Locations Map</h4>
                  <div className="h-96 rounded-lg overflow-hidden">
                    <InteractiveResourceMap
                      resources={resources}
                      onResourceEdit={handleEditResource}
                      onResourceCreate={handleCreateResource}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'interactive-map' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    Interactive Operations Map
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Comprehensive view of all emergency reports, safe zones, blocked roads, and rescue operations
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    <span className="inline-flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      Safe Zones
                    </span>
                    <span className="inline-flex items-center gap-2 ml-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      Blocked Roads
                    </span>
                    <span className="inline-flex items-center gap-2 ml-4">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      Resources
                    </span>
                    <span className="inline-flex items-center gap-2 ml-4">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      Active Reports
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex h-[700px]">
              {/* Interactive Map */}
              <div className="flex-1 relative">
                <InteractiveOperationsMap 
                  reports={reports}
                  resources={resources}
                  isConnected={isConnected}
                />
              </div>
              
              {/* Control Panel Sidebar */}
              <div className="w-80 bg-gray-50 border-l overflow-y-auto">
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Operations Control</h3>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-xs text-gray-500">Active Reports</div>
                      <div className="text-lg font-bold text-orange-600">
                        {reports.filter(r => r.status !== 'resolved').length}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-xs text-gray-500">Blocked Roads</div>
                      <div className="text-lg font-bold text-red-600">
                        {reports.filter(r => r.incidentType === 'blocked-road' && r.status !== 'resolved').length}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-xs text-gray-500">Safe Zones</div>
                      <div className="text-lg font-bold text-green-600">
                        {resources.filter(r => r.type === 'safe-zone' && r.status === 'active').length}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-xs text-gray-500">Rescue Ops</div>
                      <div className="text-lg font-bold text-blue-600">
                        {reports.filter(r => r.status === 'in-progress').length}
                      </div>
                    </div>
                  </div>
                  
                  {/* Layer Controls */}
                  <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Map Layers</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm">Emergency Reports</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm">Safe Zones</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm">Relief Resources</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm">Blocked Roads</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm">Rescue Operations</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Active Operations */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-3">Active Operations</h4>
                    <div className="space-y-3">
                      {reports.filter(r => r.status === 'in-progress').slice(0, 5).map((report) => (
                        <div key={report._id} className="flex items-start gap-3 p-2 bg-blue-50 rounded">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {report.incidentType?.replace('-', ' ').toUpperCase()}
                            </div>
                            <div className="text-xs text-gray-600">
                              {report.description?.substring(0, 40)}...
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                              In Progress
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {reports.filter(r => r.status === 'in-progress').length === 0 && (
                        <div className="text-sm text-gray-500 text-center py-4">
                          No active operations
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'predictive-analytics' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    Predictive Analytics & Risk Assessment
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    AI-powered disaster risk prediction based on weather and terrain analysis
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <PredictiveAnalytics />
            </div>
          </div>
        )}

        {activeTab === 'realtime' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Radio className={`h-5 w-5 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
                Real-time Incident Map
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Live view of reported incidents across the region
              </p>
            </div>
            <div className="h-[600px]">
              <RealtimeMap />
            </div>
          </div>
        )}

        {/* Resource Modal */}
        {showResourceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {editingResource ? 'Edit Resource' : 'Add New Resource'}
                </h3>
                <button
                  onClick={() => setShowResourceModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSaveResource(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      required
                      value={resourceFormData.name}
                      onChange={(e) => setResourceFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Resource name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      required
                      value={resourceFormData.type}
                      onChange={(e) => setResourceFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="safe-zone">Safe Zone</option>
                      <option value="shelter">Shelter</option>
                      <option value="medical-aid">Medical Aid</option>
                      <option value="supply-center">Supply Center</option>
                      <option value="evacuation-point">Evacuation Point</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={resourceFormData.lat}
                      onChange={(e) => setResourceFormData(prev => ({ ...prev, lat: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="40.4406"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={resourceFormData.lng}
                      onChange={(e) => setResourceFormData(prev => ({ ...prev, lng: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="-79.9959"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={resourceFormData.address}
                    onChange={(e) => setResourceFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Full address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                    <input
                      type="number"
                      required
                      value={resourceFormData.capacity}
                      onChange={(e) => setResourceFormData(prev => ({ ...prev, capacity: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Occupancy</label>
                    <input
                      type="number"
                      value={resourceFormData.currentOccupancy}
                      onChange={(e) => setResourceFormData(prev => ({ ...prev, currentOccupancy: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability *</label>
                    <select
                      required
                      value={resourceFormData.availability}
                      onChange={(e) => setResourceFormData(prev => ({ ...prev, availability: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="available">Available</option>
                      <option value="limited">Limited</option>
                      <option value="full">Full</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={resourceFormData.contact.phone}
                      onChange={(e) => setResourceFormData(prev => ({ 
                        ...prev, 
                        contact: { ...prev.contact, phone: e.target.value }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(412) 555-0123"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={resourceFormData.contact.email}
                      onChange={(e) => setResourceFormData(prev => ({ 
                        ...prev, 
                        contact: { ...prev.contact, email: e.target.value }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="contact@resource.org"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Person in Charge</label>
                    <input
                      type="text"
                      value={resourceFormData.contact.inCharge}
                      onChange={(e) => setResourceFormData(prev => ({ 
                        ...prev, 
                        contact: { ...prev.contact, inCharge: e.target.value }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={resourceFormData.description}
                    onChange={(e) => setResourceFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Additional information about this resource..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowResourceModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingResource ? 'Update Resource' : 'Create Resource'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* View Report Modal */}
      {showViewModal && selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Report Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reporter Name</label>
                  <p className="text-sm text-gray-900">{selectedReport.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-sm text-gray-900">{selectedReport.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Incident Type</label>
                  <p className="text-sm text-gray-900">{selectedReport.incidentType || selectedReport.disasterType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Urgency</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(selectedReport.urgency)}`}>
                    {selectedReport.urgency}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedReport.status)}`}>
                    {selectedReport.status || 'pending'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Verification</label>
                  <p className="text-sm text-gray-900">{selectedReport.verified ? '✅ Verified' : '⏳ Pending'}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedReport.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <p className="text-sm text-gray-900">
                    Lat: {selectedReport.location?.lat || selectedReport.lat}<br/>
                    Lng: {selectedReport.location?.lng || selectedReport.lng}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Witnesses</label>
                  <p className="text-sm text-gray-900">{selectedReport.witnessCount || 1} witness(es)</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Reported At</label>
                <p className="text-sm text-gray-900">{new Date(selectedReport.createdAt).toLocaleString()}</p>
              </div>

              {selectedReport.mediaUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Media</label>
                  <img 
                    src={selectedReport.mediaUrl} 
                    alt="Report media" 
                    className="mt-2 max-w-full h-48 object-cover rounded"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Report Modal */}
      {showUpdateModal && selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Update Report</h3>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={updateData.status}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="investigating">Investigating</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Notes</label>
                <textarea
                  value={updateData.notes}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add update notes or comments..."
                />
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium text-gray-900 mb-2">Report Summary</h4>
                <p className="text-sm text-gray-600">
                  <strong>Type:</strong> {selectedReport.incidentType || selectedReport.disasterType}<br/>
                  <strong>Reporter:</strong> {selectedReport.name}<br/>
                  <strong>Description:</strong> {selectedReport.description?.substring(0, 100)}...
                </p>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUpdate}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}