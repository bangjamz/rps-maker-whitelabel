import express from 'express';
import { authenticate, authorize, ROLES } from '../middleware/auth.js';
import {
    getInstitusi,
    getAllFakultas,
    getFakultasById,
    getAllProdi,
    getProdiById
} from '../controllers/organizationController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Institution endpoint - accessible to all authenticated users
router.get('/institusi', getInstitusi);

// Fakultas endpoints
router.get('/fakultas', getAllFakultas);
router.get('/fakultas/:id', getFakultasById);

// Prodi endpoints
router.get('/prodi', getAllProdi);
router.get('/prodi/:id', getProdiById);

export default router;
