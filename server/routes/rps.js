import express from 'express';
import { authenticate, authorize, ROLES } from '../middleware/auth.js';
import {
    getAllRPS,
    getRPSById,
    createRPS,
    updateRPS as updateRPSController,
    submitRPS,
    approveRPS,
    rejectRPS,
    deleteRPS
} from '../controllers/rpsController.js';
import {
    getCurriculumTree,
    createRPS as createRPSDosen,
    updateRPS as updateRPSDosen,
    bulkUpsertPertemuan,
    getDosenCourses
} from '../controllers/rpsDosenController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ========== DOSEN RPS CREATION & EDITING ==========
router.get('/curriculum/tree/:prodiId', getCurriculumTree);
router.get('/dosen/my-courses', authorize(ROLES.DOSEN), getDosenCourses);
router.post('/dosen/create', authorize(ROLES.DOSEN), createRPSDosen);
router.put('/dosen/:rpsId/update', authorize(ROLES.DOSEN), updateRPSDosen);
router.post('/dosen/:rpsId/pertemuan/bulk', authorize(ROLES.DOSEN), bulkUpsertPertemuan);

// ========== GENERAL RPS ROUTES ==========
// Get all RPS (role-filtered)
router.get('/', getAllRPS);

// Get RPS by ID
router.get('/:id', getRPSById);

// Create RPS (dosen for instances, kaprodi for templates)
router.post('/', authorize(ROLES.DOSEN, ROLES.KAPRODI), createRPS);

// Update RPS (draft only, owner only)
router.put('/:id', authorize(ROLES.DOSEN, ROLES.KAPRODI), updateRPSController);

// Submit RPS for approval (dosen only)
router.put('/:id/submit', authorize(ROLES.DOSEN), submitRPS);

// Approve/reject RPS (kaprodi only)
router.put('/:id/approve', authorize(ROLES.KAPRODI, ROLES.DEKAN), approveRPS);
router.put('/:id/reject', authorize(ROLES.KAPRODI, ROLES.DEKAN), rejectRPS);

// Delete RPS (draft only, owner only)
router.delete('/:id', authorize(ROLES.DOSEN, ROLES.KAPRODI), deleteRPS);

export default router;
