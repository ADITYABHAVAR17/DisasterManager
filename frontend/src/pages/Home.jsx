import { Link } from 'react-router-dom';
import { 
  AlertTriangle, MapPin, BarChart3, Shield, Clock, Users, Radio, 
  Brain, Camera, Upload, Zap, CheckCircle, Activity, Smartphone, Globe
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Camera,
      title: 'AI-Powered Reporting',
      description: 'Report emergencies with photos, videos & GPS. Our AI instantly verifies and prioritizes incidents.',
      action: 'Report Emergency',
      link: '/report',
      color: 'red',
      highlight: true
    },
    {
      icon: Brain,
      title: 'Smart Verification',
      description: 'Advanced AI analyzes images and text to verify incident authenticity and severity in real-time.',
      action: 'Learn More',
      link: '/ai-insights',
      color: 'purple'
    },
    {
      icon: MapPin,
      title: 'Live Resource Tracking',
      description: 'View real-time locations of safe zones, relief camps, shelters, and medical aid centers.',
      action: 'View Live Map',
      link: '/realtime',
      color: 'blue'
    },
    {
      icon: CheckCircle,
      title: 'Verified Reports Map',
      description: 'Browse confirmed and resolved incidents in your area with detailed verification status.',
      action: 'View Verified Reports',
      link: '/verified-reports',
      color: 'green'
    },
    {
      icon: Shield,
      title: 'Admin Control Center',
      description: 'Comprehensive dashboard for emergency responders to manage resources and coordinate response.',
      action: 'Access Dashboard',
      link: '/dashboard',
      color: 'green'
    }
  ];

  const stats = [
    { icon: AlertTriangle, label: 'Incidents Reported', value: '2,847', color: 'red', subtext: 'This month' },
    { icon: Brain, label: 'AI Verified', value: '94.2%', color: 'purple', subtext: 'Accuracy rate' },
    { icon: Shield, label: 'Active Resources', value: '156', color: 'blue', subtext: 'Relief centers' },
    { icon: CheckCircle, label: 'Lives Helped', value: '12,450', color: 'green', subtext: 'Total impact' }
  ];

  const capabilities = [
    {
      icon: Smartphone,
      title: 'Multi-Media Reporting',
      description: 'Upload photos, videos, and GPS locations for comprehensive incident documentation.'
    },
    {
      icon: Brain,
      title: 'AI Classification',
      description: 'Automatic categorization of incidents (blocked roads, missing persons, infrastructure damage).'
    },
    {
      icon: Zap,
      title: 'Priority Assessment',
      description: 'Smart urgency classification from low priority to critical emergency alerts.'
    },
    {
      icon: Globe,
      title: 'Real-Time Updates',
      description: 'Live synchronization of all reports, resources, and emergency response activities.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-500 to-orange-500">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <AlertTriangle className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              DisasterConnect
            </h1>
            <p className="text-xl md:text-2xl text-red-100 mb-8 max-w-4xl mx-auto">
              AI-Powered Emergency Response Platform connecting citizens, authorities, and resources 
              for faster, smarter disaster management and community coordination.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                to="/report"
                className="bg-white text-red-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <Camera className="h-5 w-5" />
                Report Emergency
              </Link>
              <Link
                to="/realtime"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <Radio className="h-5 w-5" />
                Live Resources
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 text-red-200 text-sm">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span>AI Verification</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span>Real-time Updates</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Emergency Response</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ icon: Icon, label, value, color, subtext }) => (
            <div key={label} className="bg-white rounded-lg p-6 shadow-md text-center">
              <Icon className={`h-8 w-8 mx-auto mb-2 text-${color}-500`} />
              <div className={`text-2xl font-bold text-${color}-600 mb-1`}>{value}</div>
              <div className="text-gray-600 text-sm font-medium">{label}</div>
              <div className="text-gray-400 text-xs">{subtext}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Capabilities Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Advanced Emergency Management
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Leveraging AI and real-time data to transform how communities respond to emergencies and disasters.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {capabilities.map(({ icon: Icon, title, description }) => (
              <div key={title} className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Complete Emergency Response Solution
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            From citizen reporting to AI verification and real-time coordination - 
            everything you need for effective disaster management in one platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map(({ icon: Icon, title, description, action, link, color, highlight }) => (
            <div 
              key={title} 
              className={`bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 ${
                highlight ? 'ring-2 ring-red-500 ring-opacity-50 transform hover:scale-105' : ''
              }`}
            >
              <div className="flex items-center mb-6">
                <div className={`bg-${color}-100 w-16 h-16 rounded-lg flex items-center justify-center mr-4`}>
                  <Icon className={`h-8 w-8 text-${color}-600`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                  {highlight && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                      AI-Powered
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-600 mb-6">{description}</p>
              <Link
                to={link}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  highlight
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : `bg-${color}-600 text-white hover:bg-${color}-700`
                }`}
              >
                {action}
                <Icon className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Make Your Community Safer?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of communities already using DisasterConnect for smarter emergency response.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/report"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="h-5 w-5" />
              Start Reporting
            </Link>
            <Link
              to="/dashboard"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Shield className="h-5 w-5" />
              Admin Access
            </Link>
          </div>
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