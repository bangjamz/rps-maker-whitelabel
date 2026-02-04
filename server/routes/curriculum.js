import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
    getAllCPL,
    getAllCPMK,
    getAllSubCPMK,
    createCPL,
    bulkImportCPL,
    updateCPL,
    deleteCPL
} from '../controllers/curriculumController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// CPL routes
router.get('/cpl', getAllCPL);
router.post('/cpl', authorize(['kaprodi']), createCPL);
router.post('/cpl/bulk', authorize(['kaprodi']), bulkImportCPL);
router.put('/cpl/:id', authorize(['kaprodi']), updateCPL);
router.delete('/cpl/:id', authorize(['kaprodi']), deleteCPL);

// CPMK routes
router.get('/cpmk', getAllCPMK);
// TODO: Add CPMK CRUD endpoints

// Sub-CPMK routes
router.get('/sub-cpmk', getAllSubCPMK);
// TODO: Add Sub-CPMK CRUD endpoints

export default router;
