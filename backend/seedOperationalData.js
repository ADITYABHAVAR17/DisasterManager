import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Report from "./models/reportModel.js";

dotenv.config();

const seedOperationalData = async () => {
  try {
    await connectDB();
    
    console.log("Adding operational data for interactive map demo...");
    
    const operationalReports = [
      {
        name: "Traffic Control Unit",
        phone: "+1-555-TRAFFIC",
        incidentType: "blocked-road",
        urgency: "urgent",
        description: "Major highway blocked due to accident. Emergency vehicles en route.",
        location: {
          lat: 20.0484615,
          lng: 73.8298394,
          address: "Highway 12, Main Route"
        },
        witnessCount: 5,
        estimatedAffected: 50,
        verified: true,
        aiVerified: true,
        status: "in-progress",
        notes: [
          {
            content: "Emergency crews dispatched. ETA 15 minutes.",
            addedBy: "Traffic Control",
            timestamp: new Date()
          }
        ]
      },
      {
        name: "Rescue Team Alpha",
        phone: "+1-555-RESCUE",
        incidentType: "medical-emergency",
        urgency: "immediate",
        description: "Multi-vehicle accident with injuries reported. Medical assistance required.",
        location: {
          lat: 20.0284615,
          lng: 73.8398394,
          address: "Downtown Intersection"
        },
        witnessCount: 8,
        estimatedAffected: 12,
        verified: true,
        aiVerified: true,
        status: "in-progress",
        notes: [
          {
            content: "Medical team on site. 3 ambulances dispatched.",
            addedBy: "Emergency Coordinator",
            timestamp: new Date()
          }
        ]
      },
      {
        name: "Fire Department",
        phone: "+1-555-FIRE",
        incidentType: "fire-emergency",
        urgency: "immediate",
        description: "Building fire reported. Evacuation in progress.",
        location: {
          lat: 20.0184615,
          lng: 73.8498394,
          address: "Commercial District Block 5"
        },
        witnessCount: 15,
        estimatedAffected: 30,
        verified: true,
        aiVerified: true,
        status: "in-progress",
        notes: [
          {
            content: "Fire crews responding. Building evacuation 80% complete.",
            addedBy: "Fire Chief",
            timestamp: new Date()
          }
        ]
      },
      {
        name: "Flood Response Team",
        phone: "+1-555-FLOOD",
        incidentType: "flood",
        urgency: "urgent",
        description: "Street flooding blocking access to residential area.",
        location: {
          lat: 20.0384615,
          lng: 73.8098394,
          address: "Riverside Avenue"
        },
        witnessCount: 3,
        estimatedAffected: 25,
        verified: true,
        aiVerified: true,
        status: "investigating",
        notes: [
          {
            content: "Water levels rising. Monitoring situation.",
            addedBy: "Emergency Management",
            timestamp: new Date()
          }
        ]
      },
      {
        name: "Infrastructure Team",
        phone: "+1-555-INFRA",
        incidentType: "infrastructure-damage",
        urgency: "moderate",
        description: "Power lines down after storm. Area cordoned off.",
        location: {
          lat: 20.0584615,
          lng: 73.8198394,
          address: "Industrial Zone East"
        },
        witnessCount: 2,
        estimatedAffected: 40,
        verified: true,
        aiVerified: true,
        status: "resolved",
        notes: [
          {
            content: "Power restored. Area cleared for normal traffic.",
            addedBy: "Utilities Coordinator",
            timestamp: new Date()
          }
        ]
      },
      // Some pending reports for variety
      {
        name: "John Citizen",
        phone: "+1-555-0123",
        incidentType: "blocked-road",
        urgency: "low",
        description: "Tree fallen across side road after storm.",
        location: {
          lat: 20.0384615,
          lng: 73.8598394,
          address: "Oak Street"
        },
        witnessCount: 1,
        estimatedAffected: 5,
        verified: false,
        aiVerified: false,
        status: "pending"
      },
      {
        name: "Sarah Emergency",
        phone: "+1-555-0456", 
        incidentType: "medical-emergency",
        urgency: "moderate",
        description: "Elderly person needs assistance, unable to evacuate.",
        location: {
          lat: 20.0684615,
          lng: 73.8298394,
          address: "Retirement Home District"
        },
        witnessCount: 1,
        estimatedAffected: 1,
        verified: false,
        aiVerified: false,
        status: "pending"
      }
    ];

    // Add the operational reports
    for (const reportData of operationalReports) {
      await Report.create(reportData);
    }

    console.log(`✅ Added ${operationalReports.length} operational reports for interactive map demonstration`);
    console.log("\nOperational Data Summary:");
    console.log("- Active rescue operations: 3");
    console.log("- Blocked roads: 2");
    console.log("- Resolved incidents: 1");
    console.log("- Pending reports: 2");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding operational data:", error);
    process.exit(1);
  }
};

seedOperationalData();