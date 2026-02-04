import express from 'express';
import { authenticate, authorize, ROLES } from '../middleware/auth.js';
import {
    getAllRPS,
    getRPSById,
    createRPS,
    updateRPS,
    submitRPS,
    approveRPS,
    rejectRPS,
    deleteRPS
} from '../controllers/rpsController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all RPS (role-filtered)
router.get('/', getAllRPS);

// Get RPS by ID
router.get('/:id', getRPSById);

// Create RPS (dosen for instances, kaprodi for templates)
router.post('/', authorize(ROLES.DOSEN, ROLES.KAPRODI), createRPS);

// Update RPS (draft only, owner only)
router.put('/:id', authorize(ROLES.DOSEN, ROLES.KAPRODI), updateRPS);

// Submit RPS for approval (dosen only)
router.put('/:id/submit', authorize(ROLES.DOSEN), submitRPS);

// Approve/reject RPS (kaprodi only)
router.put('/:id/approve', authorize(ROLES.KAPRODI, ROLES.DEKAN), approveRPS);
router.put('/:id/reject', authorize(ROLES.KAPRODI, ROLES.DEKAN), rejectRPS);

// Delete RPS (draft only, owner only)
router.delete('/:id', authorize(ROLES.DOSEN, ROLES.KAPRODI), deleteRPS);

export default router;
