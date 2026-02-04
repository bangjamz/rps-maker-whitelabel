import express from 'express';
import { authenticate, authorize, ROLES } from '../middleware/auth.js';
import {
    getGradingConfig,
    setGradingConfig,
    getGradeScales
} from '../controllers/gradingConfigController.js';
import {
    getAssessmentComponents,
    createAssessmentComponent,
    updateAssessmentComponent,
    deleteAssessmentComponent,
    validateComponentWeights
} from '../controllers/assessmentComponentController.js';
import {
    getStudentGrades,
    inputStudentGrade,
    batchInputGrades,
    calculateFinalGrade,
    getFinalGrades,
    approveFinalGrades
} from '../controllers/studentGradeController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ========== GRADING CONFIGURATION ==========
// GET grading config for prodi/semester/tahun
router.get('/config', getGradingConfig);

// SET grading config (Kaprodi/Admin only)
router.post('/config', authorize(ROLES.KAPRODI, ROLES.ADMIN_INSTITUSI), setGradingConfig);

// GET all available grade scales
router.get('/grade-scales', getGradeScales);

// ========== ASSESSMENT COMPONENTS ==========
// GET assessment components for a course
router.get('/components', getAssessmentComponents);

// CREATE assessment component (Dosen/Kaprodi)
router.post('/components', authorize(ROLES.DOSEN, ROLES.KAPRODI), createAssessmentComponent);

// UPDATE assessment component (Dosen/Kaprodi)
router.put('/components/:id', authorize(ROLES.DOSEN, ROLES.KAPRODI), updateAssessmentComponent);

// DELETE assessment component (Dosen/Kaprodi)
router.delete('/components/:id', authorize(ROLES.DOSEN, ROLES.KAPRODI), deleteAssessmentComponent);

// VALIDATE component weights = 100%
router.get('/components/validate-weights', validateComponentWeights);

// ========== STUDENT GRADES ==========
// GET student grades
router.get('/student-grades', getStudentGrades);

// INPUT single student grade (Dosen only)
router.post('/student-grades', authorize(ROLES.DOSEN, ROLES.KAPRODI), inputStudentGrade);

// BATCH input grades (Dosen only)
router.post('/student-grades/batch', authorize(ROLES.DOSEN, ROLES.KAPRODI), batchInputGrades);

// ========== FINAL GRADES ==========
// CALCULATE final grade for a student
router.post('/final-grades/calculate', authorize(ROLES.DOSEN, ROLES.KAPRODI), calculateFinalGrade);

// GET final grades
router.get('/final-grades', getFinalGrades);

// APPROVE final grades (Kaprodi/Dekan only)
router.post('/final-grades/approve', authorize(ROLES.KAPRODI, ROLES.DEKAN), approveFinalGrades);

export default router;
