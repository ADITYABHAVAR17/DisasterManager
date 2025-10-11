import Admin from '../models/adminModel.js';
import { generateToken } from '../middleware/authMiddleware.js';

// Login admin
export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.'
      });
    }

    // Find admin by username or email
    const admin = await Admin.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: username.toLowerCase() }
      ]
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin._id);

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        admin: admin.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login.'
    });
  }
};

// Register admin (for initial setup or super admin use)
export const registerAdmin = async (req, res) => {
  try {
    const { username, email, password, role = 'admin' } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() }
      ]
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists.'
      });
    }

    // Create new admin
    const admin = new Admin({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      role
    });

    await admin.save();

    // Generate token
    const token = generateToken(admin._id);

    res.status(201).json({
      success: true,
      message: 'Admin created successfully.',
      data: {
        admin: admin.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration.'
    });
  }
};

// Get current admin profile
export const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        admin: req.admin.toJSON()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile.'
    });
  }
};

// Logout admin (client-side token removal, but we can track it)
export const logoutAdmin = async (req, res) => {
  try {
    // In a more advanced setup, you might want to blacklist the token
    // For now, we'll just return success as the client will remove the token
    
    res.json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout.'
    });
  }
};

// Verify token endpoint
export const verifyToken = async (req, res) => {
  try {
    // If we reach here, the token is valid (middleware checked it)
    res.json({
      success: true,
      data: {
        admin: req.admin.toJSON()
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token verification.'
    });
  }
};