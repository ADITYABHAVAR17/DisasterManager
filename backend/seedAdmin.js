import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Admin from './models/adminModel.js';

dotenv.config();

const createInitialAdmin = async () => {
  try {
    await connectDB();
    
    // Check if any admin exists
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      console.log('Admin already exists. Skipping creation.');
      process.exit(0);
    }

    // Create initial admin
    const admin = new Admin({
      username: 'admin',
      email: 'admin@disastermanager.com',
      password: 'admin123', // This will be hashed automatically
      role: 'super_admin'
    });

    await admin.save();
    console.log('Initial admin created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Please change the password after first login.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating initial admin:', error);
    process.exit(1);
  }
};

createInitialAdmin();