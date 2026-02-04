import {
    StudentGrade,
    FinalGrade,
    AssessmentComponent,
    GradingSystem,
    GradeScale,
    GradeScaleDetail,
    Mahasiswa,
    MataKuliah,
    User
} from '../models/index.js';
import { convertGrade } from './gradingConfigController.js';

/**
 * Get student grades for a course (all students or specific student)
 */
export const getStudentGrades = async (req, res) => {
    try {
        const { mataKuliahId, mahasiswaId, componentId } = req.query;

        if (!mataKuliahId) {
            return res.status(400).json({ message: 'mataKuliahId is required' });
        }

        const where = { mata_kuliah_id: mataKuliahId };
        if (mahasiswaId) where.mahasiswa_id = mahasiswaId;
        if (componentId) where.assessment_component_id = componentId;

        const grades = await StudentGrade.findAll({
            where,
            include: [
                { model: Mahasiswa, as: 'mahasiswa', attributes: ['id', 'npm', 'nama'] },
                { model: AssessmentComponent, as: 'assessmentComponent' },
                { model: User, as: 'gradedBy', attributes: ['id', 'nama_lengkap'] }
            ],
            order: [
                [{ model: Mahasiswa, as: 'mahasiswa' }, 'npm', 'ASC']
            ]
        });

        res.json(grades);
    } catch (error) {
        console.error('Error fetching student grades:', error);
        res.status(500).json({ message: 'Failed to fetch student grades' });
    }
};

/**
 * Input/update a single student grade with auto-conversion
 */
export const inputStudentGrade = async (req, res) => {
    try {
        const {
            mahasiswa_id,
            mata_kuliah_id,
            assessment_component_id,
            nilai_angka,
            notes
        } = req.body;

        // Validation
        if (!mahasiswa_id || !mata_kuliah_id || !assessment_component_id || nilai_angka === undefined) {
            return res.status(400).json({
                message: 'Required: mahasiswa_id, mata_kuliah_id, assessment_component_id, nilai_angka'
            });
        }

        if (nilai_angka < 0 || nilai_angka > 100) {
            return res.status(400).json({ message: 'nilai_angka must be between 0 and 100' });
        }

        // Get grading system to determine grade scale
        const mataKuliah = await MataKuliah.findByPk(mata_kuliah_id);
        if (!mataKuliah) {
            return res.status(404).json({ message: 'Mata kuliah not found' });
        }

        const component = await AssessmentComponent.findByPk(assessment_component_id);
        if (!component) {
            return res.status(404).json({ message: 'Assessment component not found' });
        }

        const gradingSystem = await GradingSystem.findOne({
            where: {
                prodi_id: mataKuliah.prodi_id,
                semester: component.semester,
                tahun_ajaran: component.tahun_ajaran,
                is_active: true
            },
            include: [
                {
                    model: GradeScale,
                    as: 'gradeScale',
                    include: [{ model: GradeScaleDetail, as: 'details' }]
                }
            ]
        });

        if (!gradingSystem) {
            return res.status(404).json({
                message: 'No grading system configured for this prodi/semester/year'
            });
        }

        // Convert grade
        const { huruf, ip } = convertGrade(nilai_angka, gradingSystem.gradeScale.details);

        // Check if grade exists
        const existing = await StudentGrade.findOne({
            where: {
                mahasiswa_id,
                assessment_component_id
            }
        });

        let grade;
        if (existing) {
            // Update
            await existing.update({
                nilai_angka,
                nilai_huruf: huruf,
                nilai_ip: ip,
                graded_by: req.user.id,
                graded_at: new Date(),
                notes
            });
            grade = existing;
        } else {
            // Create
            grade = await StudentGrade.create({
                mahasiswa_id,
                mata_kuliah_id,
                assessment_component_id,
                nilai_angka,
                nilai_huruf: huruf,
                nilai_ip: ip,
                graded_by: req.user.id,
                graded_at: new Date(),
                notes
            });
        }

        // Fetch with associations
        const result = await StudentGrade.findByPk(grade.id, {
            include: [
                { model: Mahasiswa, as: 'mahasiswa' },
                { model: AssessmentComponent, as: 'assessmentComponent' }
            ]
        });

        res.json(result);
    } catch (error) {
        console.error('Error inputting student grade:', error);
        res.status(500).json({ message: 'Failed to input student grade' });
    }
};

/**
 * Batch input grades for multiple students (efficiency)
 */
export const batchInputGrades = async (req, res) => {
    try {
        const { mata_kuliah_id, assessment_component_id, grades } = req.body;

        if (!mata_kuliah_id || !assessment_component_id || !Array.isArray(grades)) {
            return res.status(400).json({
                message: 'Required: mata_kuliah_id, assessment_component_id, grades (array)'
            });
        }

        // Get grading configuration
        const mataKuliah = await MataKuliah.findByPk(mata_kuliah_id);
        const component = await AssessmentComponent.findByPk(assessment_component_id);

        const gradingSystem = await GradingSystem.findOne({
            where: {
                prodi_id: mataKuliah.prodi_id,
                semester: component.semester,
                tahun_ajaran: component.tahun_ajaran,
                is_active: true
            },
            include: [
                {
                    model: GradeScale,
                    as: 'gradeScale',
                    include: [{ model: GradeScaleDetail, as: 'details' }]
                }
            ]
        });

        const results = [];
        const errors = [];

        // Process each grade
        for (const gradeData of grades) {
            try {
                const { mahasiswa_id, nilai_angka, notes } = gradeData;

                if (!mahasiswa_id || nilai_angka === undefined) {
                    errors.push({ mahasiswa_id, error: 'Missing mahasiswa_id or nilai_angka' });
                    continue;
                }

                const { huruf, ip } = convertGrade(nilai_angka, gradingSystem.gradeScale.details);

                const [grade, created] = await StudentGrade.upsert({
                    mahasiswa_id,
                    mata_kuliah_id,
                    assessment_component_id,
                    nilai_angka,
                    nilai_huruf: huruf,
                    nilai_ip: ip,
                    graded_by: req.user.id,
                    graded_at: new Date(),
                    notes
                }, {
                    returning: true
                });

                results.push({ mahasiswa_id, status: created ? 'created' : 'updated' });
            } catch (err) {
                errors.push({ mahasiswa_id: gradeData.mahasiswa_id, error: err.message });
            }
        }

        res.json({
            success: results.length,
            failed: errors.length,
            results,
            errors
        });
    } catch (error) {
        console.error('Error batch inputting grades:', error);
        res.status(500).json({ message: 'Failed to batch input grades' });
    }
};

/**
 * Calculate final grade for a student in a course
 */
export const calculateFinalGrade = async (req, res) => {
    try {
        const { mahasiswaId, mataKuliahId, semester, tahunAjaran } = req.body;

        if (!mahasiswaId || !mataKuliahId || !semester || !tahunAjaran) {
            return res.status(400).json({
                message: 'Required: mahasiswaId, mataKuliahId, semester, tahunAjaran'
            });
        }

        // Get all assessment components for this course
        const components = await AssessmentComponent.findAll({
            where: {
                mata_kuliah_id: mataKuliahId,
                semester,
                tahun_ajaran: tahunAjaran,
                is_active: true
            }
        });

        if (components.length === 0) {
            return res.status(404).json({ message: 'No assessment components found' });
        }

        // Get all student grades for these components
        const componentIds = components.map(c => c.id);
        const grades = await StudentGrade.findAll({
            where: {
                mahasiswa_id: mahasiswaId,
                assessment_component_id: componentIds
            }
        });

        // Check if all components have grades
        if (grades.length !== components.length) {
            return res.status(400).json({
                message: 'Not all assessment components have been graded yet',
                graded: grades.length,
                total: components.length
            });
        }

        // Calculate weighted average
        let totalWeightedScore = 0;
        let totalWeight = 0;

        for (const component of components) {
            const grade = grades.find(g => g.assessment_component_id === component.id);
            const weight = component.component_type === 'legacy' ? component.legacy_weight : component.obe_weight;

            totalWeightedScore += (grade.nilai_angka * weight);
            totalWeight += weight;
        }

        const totalAngka = totalWeightedScore / totalWeight;

        // Get grading system
        const mataKuliah = await MataKuliah.findByPk(mataKuliahId);
        const gradingSystem = await GradingSystem.findOne({
            where: {
                prodi_id: mataKuliah.prodi_id,
                semester,
                tahun_ajaran: tahunAjaran,
                is_active: true
            },
            include: [
                {
                    model: GradeScale,
                    as: 'gradeScale',
                    include: [{ model: GradeScaleDetail, as: 'details' }]
                }
            ]
        });

        // Convert to huruf and IP
        const { huruf, ip } = convertGrade(totalAngka, gradingSystem.gradeScale.details);

        // Create or update final grade
        const [finalGrade, created] = await FinalGrade.upsert({
            mahasiswa_id: mahasiswaId,
            mata_kuliah_id: mataKuliahId,
            semester,
            tahun_ajaran: tahunAjaran,
            total_angka: totalAngka,
            nilai_huruf: huruf,
            nilai_ip: ip,
            grading_system_id: gradingSystem.id,
            status: 'draft'
        }, {
            returning: true
        });

        res.json({
            message: created ? 'Final grade calculated' : 'Final grade updated',
            finalGrade
        });
    } catch (error) {
        console.error('Error calculating final grade:', error);
        res.status(500).json({ message: 'Failed to calculate final grade' });
    }
};

/**
 * Get final grades (for reports)
 */
export const getFinalGrades = async (req, res) => {
    try {
        const { mataKuliahId, mahasiswaId, semester, tahunAjaran } = req.query;

        const where = {};
        if (mataKuliahId) where.mata_kuliah_id = mataKuliahId;
        if (mahasiswaId) where.mahasiswa_id = mahasiswaId;
        if (semester) where.semester = semester;
        if (tahunAjaran) where.tahun_ajaran = tahunAjaran;

        const finalGrades = await FinalGrade.findAll({
            where,
            include: [
                { model: Mahasiswa, as: 'mahasiswa', attributes: ['id', 'npm', 'nama'] },
                { model: MataKuliah, as: 'mataKuliah', attributes: ['id', 'kode_mk', 'nama_mk', 'sks'] },
                { model: GradingSystem, as: 'gradingSystem' },
                { model: User, as: 'approvedBy', attributes: ['id', 'nama_lengkap'] }
            ],
            order: [
                [{ model: Mahasiswa, as: 'mahasiswa' }, 'npm', 'ASC']
            ]
        });

        res.json(finalGrades);
    } catch (error) {
        console.error('Error fetching final grades:', error);
        res.status(500).json({ message: 'Failed to fetch final grades' });
    }
};

/**
 * Approve final grades (submit for official record)
 */
export const approveFinalGrades = async (req, res) => {
    try {
        const { finalGradeIds } = req.body;

        if (!Array.isArray(finalGradeIds)) {
            return res.status(400).json({ message: 'finalGradeIds must be an array' });
        }

        await FinalGrade.update({
            status: 'approved',
            approved_by: req.user.id,
            approved_at: new Date()
        }, {
            where: {
                id: finalGradeIds,
                status: 'draft' // Only approve drafts
            }
        });

        res.json({ message: `${finalGradeIds.length} final grades approved` });
    } catch (error) {
        console.error('Error approving final grades:', error);
        res.status(500).json({ message: 'Failed to approve final grades' });
    }
};
