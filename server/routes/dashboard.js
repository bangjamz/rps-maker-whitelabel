import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getDashboardStats } from '../controllers/dashboardController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Dashboard statistics - role-specific
router.get('/stats', getDashboardStats);

export default router;
