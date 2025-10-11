import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <AlertTriangle className="h-24 w-24 text-red-500 mx-auto mb-4" />
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8 max-w-md">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            <Home className="h-5 w-5" />
            Return Home
          </Link>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
            <Link
              to="/report"
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Report an Incident
            </Link>
            <Link
              to="/map"
              className="text-red-600 hover:text-red-700 font-medium"
            >
              View Live Map
            </Link>
            <Link
              to="/dashboard"
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;