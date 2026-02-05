
import express from 'express';
import multer from 'multer';
import {
    getCPLs, importCPL,
    getBahanKajian, importBahanKajian,
    importCPMK, importSubCPMK, importMataKuliah,
    deleteBatchCPMK, deleteBatchSubCPMK
} from '../controllers/curriculumController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure Multer
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'), false);
        }
    }
});

// Routes
router.use(authenticate);

// CPL
router.get('/cpl', getCPLs);
router.post('/cpl/import', authorize(['kaprodi', 'admin_institusi']), upload.single('file'), importCPL);

// Bahan Kajian
router.get('/bahan-kajian', getBahanKajian);
router.post('/bahan-kajian/import', authorize(['kaprodi', 'admin_institusi']), upload.single('file'), importBahanKajian);

// CPMK
router.post('/cpmk/import', authorize(['kaprodi', 'admin_institusi']), upload.single('file'), importCPMK);

// Sub-CPMK
router.post('/sub-cpmk/import', authorize(['kaprodi', 'admin_institusi']), upload.single('file'), importSubCPMK);

// Mata Kuliah
router.post('/mata-kuliah/import', authorize(['kaprodi', 'admin_institusi']), upload.single('file'), importMataKuliah);

// Batch Delete
router.post('/cpmk/batch-delete', authorize(['kaprodi', 'admin_institusi']), deleteBatchCPMK);
router.post('/sub-cpmk/batch-delete', authorize(['kaprodi', 'admin_institusi']), deleteBatchSubCPMK);

export default router;
