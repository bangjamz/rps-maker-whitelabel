import express from 'express';
import { authenticate, authorize, ROLES } from '../middleware/auth.js';
import {
    calculateCPLAttainment,
    calculateCPMKAttainment,
    getSubCPMKBreakdown,
    getCPLHeatmap,
    exportCPLReport
} from '../controllers/cplAnalyticsController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// CPL attainment calculation (Kaprodi/Admin only)
router.get('/cpl/attainment', authorize(ROLES.KAPRODI, ROLES.ADMIN), calculateCPLAttainment);

// CPMK attainment for a course (Dosen/Kaprodi)
router.get('/cpmk/attainment', authorize(ROLES.KAPRODI, ROLES.DOSEN), calculateCPMKAttainment);

// Sub-CPMK breakdown
router.get('/sub-cpmk/breakdown', authorize(ROLES.KAPRODI, ROLES.DOSEN), getSubCPMKBreakdown);

// CPL heatmap (CPL x Course)
router.get('/cpl/heatmap', authorize(ROLES.KAPRODI, ROLES.ADMIN), getCPLHeatmap);

// Export CPL report
router.get('/cpl/export', authorize(ROLES.KAPRODI, ROLES.ADMIN), exportCPLReport);

export default router;
