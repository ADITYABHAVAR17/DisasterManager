import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BarChart3, MapPin, AlertTriangle, Radio, LogOut, User, Shield, Brain, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, admin, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Home, public: true },
    { path: '/report', label: 'Report Emergency', icon: Camera, public: true, highlight: true },
    { path: '/realtime', label: 'Live Resources', icon: Radio, public: true },
    { path: '/dashboard', label: 'Admin Control', icon: Shield, public: false },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
    setShowDropdown(false);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  // Filter nav items based on authentication
  const visibleNavItems = navItems.filter(item => 
    item.public || (item.public === false && isAuthenticated)
  );

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-red-500 p-2 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-800">DisasterConnect</span>
                <div className="text-xs text-gray-500">AI-Powered Emergency Response</div>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="flex space-x-6">
              {visibleNavItems.map(({ path, label, icon: Icon, highlight }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === path
                      ? highlight 
                        ? 'text-white bg-red-600 shadow-lg'
                        : 'text-red-600 bg-red-50'
                      : highlight
                        ? 'text-red-600 bg-red-50 hover:bg-red-600 hover:text-white hover:shadow-lg'
                        : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                  {highlight && (
                    <span className="ml-1 px-2 py-1 text-xs bg-red-200 text-red-800 rounded-full">
                      AI
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* Auth Section */}
            <div className="flex items-center">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-gray-50 transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    <span>{admin?.username || 'Admin'}</span>
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b">
                        <div className="font-medium text-gray-900">{admin?.username}</div>
                        <div className="text-xs">{admin?.email}</div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Admin Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop for dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </nav>
  );
};

export default Navigation;