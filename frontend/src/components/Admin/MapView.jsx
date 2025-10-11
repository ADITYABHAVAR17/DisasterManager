import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

const icons = {
  high: new Icon({ iconUrl: "/icons/red.png", iconSize: [32, 32] }),
  low: new Icon({ iconUrl: "/icons/yellow.png", iconSize: [32, 32] }),
  unverified: new Icon({ iconUrl: "/icons/gray.png", iconSize: [32, 32] }),
};

export default function MapView({ reports }) {
  return (
    <MapContainer center={[18.5204, 73.8567]} zoom={10} className="h-[80vh] w-full rounded-2xl">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {reports.map((report) => (
        <Marker
          key={report._id}
          position={[report.location.lat, report.location.lng]}
          icon={
            report.priority === "high"
              ? icons.high
              : report.verified
              ? icons.low
              : icons.unverified
          }
        >
          <Popup>
            <strong>{report.aiCategory}</strong>
            <br />
            {report.description}
            <br />
            <img src={report.mediaUrl} alt="Report" className="rounded mt-2" width="150" />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
