import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ReportForm from './components/ReportForm';
import AdminDashboard from './pages/AdminDashboard';
import LiveMap from './pages/LiveMap';
import RealtimeMap from './pages/RealtimeMap';
import LoginPage from './pages/LoginPage';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/report" element={<ReportForm />} />
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <AdminDashboard />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/map" 
                element={
                  <ErrorBoundary>
                    <LiveMap />
                  </ErrorBoundary>
                } 
              />
              <Route 
                path="/realtime" 
                element={
                  <ErrorBoundary>
                    <RealtimeMap />
                  </ErrorBoundary>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
