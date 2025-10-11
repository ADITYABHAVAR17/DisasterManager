import Resource from "../models/resourceModel.js";

// Create new resource
export const createResource = async (req, res) => {
  try {
    const {
      name,
      type,
      lat,
      lng,
      address,
      capacity,
      currentOccupancy,
      availability,
      contact,
      services,
      operatingHours,
      description
    } = req.body;

    // Validate required fields
    if (!name || !type || !lat || !lng || !capacity) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, type, lat, lng, capacity"
      });
    }

    const resource = await Resource.create({
      name,
      type,
      location: {
        lat: Number(lat),
        lng: Number(lng),
        address
      },
      capacity: Number(capacity),
      currentOccupancy: currentOccupancy ? Number(currentOccupancy) : 0,
      availability: availability || 'available',
      contact,
      services: services || [],
      operatingHours: operatingHours || { is24Hours: true },
      description,
      createdBy: req.user?.name || 'Admin'
    });

    // Broadcast new resource to subscribers
    const broadcastResource = req.app.locals.broadcastResource;
    if (broadcastResource) {
      broadcastResource("newResource", resource);
    }

    res.status(201).json({ success: true, resource });
  } catch (error) {
    console.error("Error creating resource:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all resources with filtering
export const getResources = async (req, res) => {
  try {
    const {
      type,
      availability,
      lat,
      lng,
      radius, // in kilometers
      page = 1,
      limit = 50
    } = req.query;

    let filter = {};
    if (type) filter.type = type;
    if (availability) filter.availability = availability;
    filter.status = 'active'; // Only show active resources

    let query = Resource.find(filter);

    // Location-based filtering if coordinates and radius provided
    if (lat && lng && radius) {
      const centerLat = Number(lat);
      const centerLng = Number(lng);
      const radiusKm = Number(radius);

      // Simple bounding box approximation (for more accuracy, use MongoDB geospatial queries)
      const latDelta = radiusKm / 111.32; // Rough conversion: 1 degree lat ≈ 111.32 km
      const lngDelta = radiusKm / (111.32 * Math.cos(centerLat * Math.PI / 180));

      filter["location.lat"] = { $gte: centerLat - latDelta, $lte: centerLat + latDelta };
      filter["location.lng"] = { $gte: centerLng - lngDelta, $lte: centerLng + lngDelta };
      
      query = Resource.find(filter);
    }

    // Pagination
    const skip = (page - 1) * limit;
    const resources = await query
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Resource.countDocuments(filter);

    res.json({
      success: true,
      resources,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: resources.length,
        totalResources: total
      }
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update resource
export const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && updateData[key] !== undefined) {
        resource[key] = updateData[key];
      }
    });

    resource.lastUpdated = new Date();
    await resource.save();

    // Broadcast update to subscribers
    const broadcastResource = req.app.locals.broadcastResource;
    if (broadcastResource) {
      broadcastResource("resourceUpdated", resource);
    }

    res.json({ success: true, resource });
  } catch (error) {
    console.error("Error updating resource:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update resource occupancy
export const updateResourceOccupancy = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentOccupancy, note } = req.body;

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    if (currentOccupancy !== undefined) {
      resource.currentOccupancy = Math.max(0, Math.min(Number(currentOccupancy), resource.capacity));
      
      // Auto-update availability based on occupancy
      const occupancyPercentage = (resource.currentOccupancy / resource.capacity) * 100;
      if (occupancyPercentage >= 100) {
        resource.availability = 'full';
      } else if (occupancyPercentage >= 80) {
        resource.availability = 'limited';
      } else {
        resource.availability = 'available';
      }
    }

    // Add note if provided
    if (note) {
      resource.notes.push({
        content: note,
        addedBy: req.user?.name || 'Admin',
        timestamp: new Date()
      });
    }

    resource.lastUpdated = new Date();
    await resource.save();

    // Broadcast update to subscribers
    const broadcastResource = req.app.locals.broadcastResource;
    if (broadcastResource) {
      broadcastResource("resourceUpdated", resource);
    }

    res.json({ success: true, resource });
  } catch (error) {
    console.error("Error updating resource occupancy:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get resource statistics
export const getResourceStats = async (req, res) => {
  try {
    const totalResources = await Resource.countDocuments({ status: 'active' });
    const availableResources = await Resource.countDocuments({ 
      status: 'active', 
      availability: 'available' 
    });
    const fullResources = await Resource.countDocuments({ 
      status: 'active', 
      availability: 'full' 
    });

    // Get resources by type
    const resourcesByType = await Resource.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalCapacity: { $sum: '$capacity' },
          currentOccupancy: { $sum: '$currentOccupancy' }
        }
      }
    ]);

    // Get availability distribution
    const availabilityStats = await Resource.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$availability',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        total: totalResources,
        available: availableResources,
        full: fullResources,
        byType: resourcesByType,
        byAvailability: availabilityStats
      }
    });
  } catch (error) {
    console.error("Error fetching resource stats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete resource
export const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    // Soft delete by setting status to inactive
    resource.status = 'inactive';
    await resource.save();

    // Broadcast update to subscribers
    const broadcastResource = req.app.locals.broadcastResource;
    if (broadcastResource) {
      broadcastResource("resourceDeleted", { id, name: resource.name });
    }

    res.json({ success: true, message: "Resource deactivated successfully" });
  } catch (error) {
    console.error("Error deleting resource:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};