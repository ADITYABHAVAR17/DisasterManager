import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import reportRoutes from "./routes/reportRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import predictiveRoutes from "./predictive/predictiveRoutes.js";
import cors from "cors";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// attach api routes
app.use("/api/reports", reportRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/predictive", predictiveRoutes);

// create server + socket.io
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*" }, // restrict in production
});

// Simple in-memory subscription store: socketId -> { lat, lng, radiusKm }
const subscriptions = new Map();

// Haversine distance (km)
const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// When socket connects
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Client subscribes to an area: { lat, lng, radiusKm }
  socket.on("subscribeToArea", (payload) => {
    const { lat, lng, radiusKm = 5 } = payload || {};
    subscriptions.set(socket.id, { lat: Number(lat), lng: Number(lng), radiusKm: Number(radiusKm) });
    console.log(`Socket ${socket.id} subscribed to area`, subscriptions.get(socket.id));
  });

  // Client can unsubscribe
  socket.on("unsubscribe", () => {
    subscriptions.delete(socket.id);
  });

  // On disconnect, remove subscription
  socket.on("disconnect", () => {
    subscriptions.delete(socket.id);
    console.log("Socket disconnected:", socket.id);
  });

  // optionally allow admin rooms etc.
});

// Helper: broadcast report to subscribers near report location
const broadcastReport = (eventName, report) => {
  if (!report?.location) {
    io.emit(eventName, report); // fallback to broadcast
    return;
  }
  const { lat, lng } = report.location;
  for (const [socketId, sub] of subscriptions.entries()) {
    try {
      const dist = haversineDistanceKm(lat, lng, sub.lat, sub.lng);
      if (dist <= sub.radiusKm) {
        io.to(socketId).emit(eventName, report);
      }
    } catch (err) {
      console.error("Error broadcasting to", socketId, err);
    }
  }
};

// Helper: broadcast resource to subscribers near resource location
const broadcastResource = (eventName, resource) => {
  if (!resource?.location) {
    io.emit(eventName, resource); // fallback to broadcast
    return;
  }
  const { lat, lng } = resource.location;
  for (const [socketId, sub] of subscriptions.entries()) {
    try {
      const dist = haversineDistanceKm(lat, lng, sub.lat, sub.lng);
      if (dist <= sub.radiusKm) {
        io.to(socketId).emit(eventName, resource);
      }
    } catch (err) {
      console.error("Error broadcasting to", socketId, err);
    }
  }
};

// Expose io and broadcast helpers to controllers via app.locals
app.locals.io = io;
app.locals.broadcastReport = broadcastReport;
app.locals.broadcastResource = broadcastResource;

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
