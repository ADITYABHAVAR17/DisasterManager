import express from 'express';
import { 
  loginAdmin, 
  registerAdmin, 
  getProfile, 
  logoutAdmin, 
  verifyToken 
} from '../controllers/authController.js';
import { verifyToken as verifyTokenMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', loginAdmin);
router.post('/register', registerAdmin); // You might want to protect this in production

// Protected routes
router.get('/profile', verifyTokenMiddleware, getProfile);
router.post('/logout', verifyTokenMiddleware, logoutAdmin);
router.get('/verify', verifyTokenMiddleware, verifyToken);

export default router;