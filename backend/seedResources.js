import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Resource from "./models/resourceModel.js";

dotenv.config();

const seedResources = async () => {
  try {
    await connectDB();
    
    // Clear existing resources
    await Resource.deleteMany({});
    
    const sampleResources = [
      {
        name: "Central Community Shelter",
        type: "shelter",
        location: {
          lat: 40.7589,
          lng: -73.9851,
          address: "123 Emergency Ave, New York, NY 10001"
        },
        capacity: 200,
        currentOccupancy: 45,
        availability: "available",
        contact: {
          phone: "+1-555-0101",
          email: "central.shelter@emergency.gov",
          inCharge: "Sarah Johnson"
        },
        services: ["shelter", "food", "water", "medical-aid", "clothing"],
        operatingHours: {
          is24Hours: true
        },
        description: "Large community shelter with full amenities and medical support",
        status: "active"
      },
      {
        name: "East Side Relief Camp",
        type: "relief-camp",
        location: {
          lat: 40.7505,
          lng: -73.9756,
          address: "456 Relief Rd, New York, NY 10002"
        },
        capacity: 150,
        currentOccupancy: 120,
        availability: "limited",
        contact: {
          phone: "+1-555-0102",
          email: "eastside.camp@emergency.gov",
          inCharge: "Michael Chen"
        },
        services: ["food", "water", "medical-aid", "communication"],
        operatingHours: {
          is24Hours: true
        },
        description: "Temporary relief camp providing essential services",
        status: "active"
      },
      {
        name: "City Hospital Emergency Center",
        type: "medical-center",
        location: {
          lat: 40.7614,
          lng: -73.9776,
          address: "789 Hospital St, New York, NY 10003"
        },
        capacity: 50,
        currentOccupancy: 15,
        availability: "available",
        contact: {
          phone: "+1-555-0103",
          email: "emergency@cityhospital.org",
          inCharge: "Dr. Emily Rodriguez"
        },
        services: ["medical-aid", "communication"],
        operatingHours: {
          is24Hours: true
        },
        description: "Emergency medical center with trauma care capabilities",
        status: "active"
      },
      {
        name: "Safe Zone Alpha",
        type: "safe-zone",
        location: {
          lat: 40.7831,
          lng: -73.9712,
          address: "Central Park North, New York, NY 10025"
        },
        capacity: 500,
        currentOccupancy: 0,
        availability: "available",
        contact: {
          phone: "+1-555-0104",
          email: "safezone.alpha@emergency.gov",
          inCharge: "Captain James Wilson"
        },
        services: ["shelter", "communication"],
        operatingHours: {
          is24Hours: true
        },
        description: "Large open safe zone for emergency evacuation",
        status: "active"
      },
      {
        name: "Downtown Food Distribution",
        type: "food-distribution",
        location: {
          lat: 40.7484,
          lng: -73.9857,
          address: "321 Distribution Ave, New York, NY 10004"
        },
        capacity: 300,
        currentOccupancy: 180,
        availability: "available",
        contact: {
          phone: "+1-555-0105",
          email: "food.dist@emergency.gov",
          inCharge: "Maria Santos"
        },
        services: ["food", "water"],
        operatingHours: {
          start: "06:00",
          end: "22:00",
          is24Hours: false
        },
        description: "Emergency food and water distribution center",
        status: "active"
      },
      {
        name: "Westside Evacuation Center",
        type: "evacuation-center",
        location: {
          lat: 40.7549,
          lng: -74.0060,
          address: "555 Evacuation Blvd, New York, NY 10014"
        },
        capacity: 400,
        currentOccupancy: 0,
        availability: "available",
        contact: {
          phone: "+1-555-0106",
          email: "westside.evac@emergency.gov",
          inCharge: "Robert Lee"
        },
        services: ["shelter", "transportation", "communication"],
        operatingHours: {
          is24Hours: true
        },
        description: "Primary evacuation center with transportation coordination",
        status: "active"
      }
    ];

    await Resource.insertMany(sampleResources);
    console.log("Resource seed data inserted successfully!");
    
    // Display summary
    const resourceCounts = await Resource.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log("Resources by type:");
    resourceCounts.forEach(({ _id, count }) => {
      console.log(`  ${_id}: ${count}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding resources:", error);
    process.exit(1);
  }
};

seedResources();