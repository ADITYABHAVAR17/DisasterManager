import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart3, Users, AlertTriangle, CheckCircle, Clock, TrendingUp, MapPin } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import RealtimeMap from "../components/RealtimeMap";

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    resolved: 0
  });

  const { admin } = useAuth();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/reports");
        const data = response.data;
        
        // Ensure data is an array
        const reportsArray = Array.isArray(data) ? data : [];
        setReports(reportsArray);
        
        // Calculate stats
        const verified = reportsArray.filter(r => r.verified).length;
        const pending = reportsArray.filter(r => !r.verified).length;
        
        setStats({
          total: reportsArray.length,
          verified: verified,
          pending: pending,
          resolved: Math.floor(verified * 0.8) // Mock resolved count
        });
      } catch (error) {
        console.error("Error fetching reports:", error);
        setError(error.message || "Failed to fetch reports");
        // Set empty array on error to prevent crashes
        setReports([]);
        setStats({
          total: 0,
          verified: 0,
          pending: 0,
          resolved: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
    // Set up polling for real-time updates
    const interval = setInterval(fetchReports, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

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

  const statCards = [
    { title: "Total Reports", value: stats.total, icon: AlertTriangle, color: "red" },
    { title: "Verified", value: stats.verified, icon: CheckCircle, color: "green" },
    { title: "Pending", value: stats.pending, icon: Clock, color: "yellow" },
    { title: "Resolved", value: stats.resolved, icon: TrendingUp, color: "blue" }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'realtime', label: 'Real-time Map', icon: MapPin }
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
            <div className="text-sm text-gray-500">
              Authenticated as: {admin?.role || 'Admin'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

            {/* Reports Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reporter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Disaster Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
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
                    {Array.isArray(reports) && reports.map((report) => (
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
                                {report.reporterName || 'Anonymous'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {report.reporterPhone || 'No phone'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.disasterType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {report.verified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </span>
                          )}
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

        {activeTab === 'realtime' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
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
      </div>
    </div>
  );
}