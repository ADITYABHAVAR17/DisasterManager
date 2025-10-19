import { useEffect } from 'react';
import io from 'socket.io-client';

const RealtimeListener = ({ lat, lng, radiusKm = 5, onNewReport, onReportUpdated }) => {
  useEffect(() => {
    // Create socket connection
    const socket = io('https://disastermanager.onrender.com');

    socket.on('connect', () => {
      console.log('Connected to real-time server');
      
      // Subscribe to area around user location
      socket.emit('subscribeToArea', {
        lat,
        lng,
        radiusKm
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from real-time server');
    });

    // Listen for new reports
    socket.on('newReport', (report) => {
      console.log('New report received via RealtimeListener:', report);
      if (onNewReport) {
        onNewReport(report);
      }
    });

    // Listen for report updates
    socket.on('reportUpdated', (report) => {
      console.log('Report updated via RealtimeListener:', report);
      if (onReportUpdated) {
        onReportUpdated(report);
      }
    });

    // Cleanup on unmount
    return () => {
      socket.emit('unsubscribe');
      socket.close();
    };
  }, [lat, lng, radiusKm, onNewReport, onReportUpdated]);

  // This component doesn't render anything visible
  return null;
};

export default RealtimeListener;