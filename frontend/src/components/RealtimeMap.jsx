import { useState, useEffect } from "react";
import RealtimeListener from "./RealtimeListener";

function App() {
  const [userLocation, setUserLocation] = useState({ lat: 18.5204, lng: 73.8567 });
  const [reports, setReports] = useState([]);

  useEffect(() => {
    // load initial reports from server
    fetch("http://localhost:5000/api/reports")
      .then((r) => r.json())
      .then(setReports)
      .catch(console.error);
  }, []);

  const handleNewReport = (report) => {
    // add to reports state if not present (or update)
    setReports((prev) => [report, ...prev]);
    // show browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("New disaster report nearby", {
        body: `${report.aiCategory || report.disasterType} — ${report.description}`,
      });
    } else if ("Notification" in window) {
      Notification.requestPermission();
    }
    // plus update map markers/state as needed
  };

  const handleReportUpdated = (report) => {
    setReports((prev) => prev.map((r) => (r._id === report._id ? report : r)));
  };

  return (
    <div>
      <RealtimeListener
        lat={userLocation.lat}
        lng={userLocation.lng}
        radiusKm={5}
        onNewReport={handleNewReport}
        onReportUpdated={handleReportUpdated}
      />

      <div style={{ padding: 20 }}>
        <h2>Reports (live)</h2>
        <ul>
          {reports.map((r) => (
            <li key={r._id}>
              <strong>{r.aiCategory || r.disasterType}</strong> — {r.description} —
              {r.priority} — {r.verified ? "VERIFIED" : "PENDING"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
