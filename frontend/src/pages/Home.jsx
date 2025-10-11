import { Link } from 'react-router-dom';
import { AlertTriangle, MapPin, BarChart3, Shield, Clock, Users, Radio } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: AlertTriangle,
      title: 'Quick Reporting',
      description: 'Report emergencies instantly with location-based incident reporting.',
      action: 'Report Now',
      link: '/report',
      color: 'red'
    },
    {
      icon: MapPin,
      title: 'Live Tracking',
      description: 'View real-time incident locations and emergency responses on the map.',
      action: 'View Map',
      link: '/map',
      color: 'blue'
    },
    {
      icon: Radio,
      title: 'Real-time Updates',
      description: 'Get instant notifications and live updates of emergency situations.',
      action: 'Live Updates',
      link: '/realtime',
      color: 'purple'
    },
    {
      icon: BarChart3,
      title: 'Admin Dashboard',
      description: 'Comprehensive dashboard for emergency management and analytics.',
      action: 'Access Dashboard',
      link: '/dashboard',
      color: 'green'
    }
  ];

  const stats = [
    { icon: AlertTriangle, label: 'Active Incidents', value: '12', color: 'red' },
    { icon: Shield, label: 'Response Teams', value: '8', color: 'blue' },
    { icon: Clock, label: 'Avg Response Time', value: '4.2m', color: 'green' },
    { icon: Users, label: 'Citizens Helped', value: '1,247', color: 'purple' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-500 to-orange-500">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              DisasterConnect
            </h1>
            <p className="text-xl md:text-2xl text-red-100 mb-8 max-w-3xl mx-auto">
              Real-time emergency reporting and response system connecting communities 
              with first responders for faster, more effective disaster management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/report"
                className="bg-white text-red-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                <AlertTriangle className="h-5 w-5" />
                Report Emergency
              </Link>
              <Link
                to="/realtime"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <Radio className="h-5 w-5" />
                Real-time Updates
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-lg p-6 shadow-md text-center">
              <Icon className={`h-8 w-8 mx-auto mb-2 text-${color}-500`} />
              <div className={`text-2xl font-bold text-${color}-600 mb-1`}>{value}</div>
              <div className="text-gray-600 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Comprehensive Emergency Management
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform provides all the tools needed for effective disaster response, 
            from citizen reporting to administrative oversight.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map(({ icon: Icon, title, description, action, link, color }) => (
            <div key={title} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className={`bg-${color}-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6`}>
                <Icon className={`h-8 w-8 text-${color}-600`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
              <p className="text-gray-600 mb-6">{description}</p>
              <Link
                to={link}
                className={`inline-flex items-center gap-2 bg-${color}-500 text-white px-6 py-3 rounded-lg hover:bg-${color}-600 transition-colors`}
              >
                {action}
                <Icon className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contact Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Emergency Contacts</h2>
          <p className="text-lg text-gray-300 mb-8">
            In case of immediate danger, contact emergency services directly
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Police</h3>
              <p className="text-2xl font-bold text-blue-400">911</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Fire Department</h3>
              <p className="text-2xl font-bold text-red-400">911</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Medical Emergency</h3>
              <p className="text-2xl font-bold text-green-400">911</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;