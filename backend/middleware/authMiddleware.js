import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Generate JWT token
export const generateToken = (adminId) => {
  return jwt.sign({ adminId }, JWT_SECRET, {
    expiresIn: '24h'
  });
};

// Verify JWT token middleware
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find admin and attach to request
    const admin = await Admin.findById(decoded.adminId);
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or admin account deactivated.'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

// Check if admin has required role
export const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (roles.length && !roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions.'
      });
    }

    next();
  };
};