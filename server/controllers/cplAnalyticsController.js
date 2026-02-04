import {
    StudentGrade,
    FinalGrade,
    AssessmentComponent,
    SubCPMK,
    CPMK,
    CPL,
    Mahasiswa,
    MataKuliah,
    Prodi,
    Enrollment
} from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Calculate CPL attainment for a prodi
 * Roll-up logic: Assessment → Sub-CPMK → CPMK → CPL
 */
export const calculateCPLAttainment = async (req, res) => {
    try {
        const { prodi_id, semester, tahun_ajaran } = req.query;

        if (!prodi_id) {
            return res.status(400).json({ message: 'prodi_id is required' });
        }

        // Get all CPLs for this prodi
        const cpls = await CPL.findAll({
            where: { prodi_id },
            include: [
                {
                    model: CPMK,
                    as: 'cpmk',
                    include: [
                        {
                            model: SubCPMK,
                            as: 'sub_cpmk'
                        }
                    ]
                }
            ]
        });

        const cplResults = [];

        for (const cpl of cpls) {
            let totalCPMKAttainment = 0;
            let cpmkCount = 0;

            for (const cpmk of cpl.cpmk || []) {
                let totalSubCPMKAttainment = 0;
                let subCpmkCount = 0;

                for (const subCpmk of cpmk.sub_cpmk || []) {
                    // Get all assessments for this Sub-CPMK
                    const assessments = await AssessmentComponent.findAll({
                        where: {
                            sub_cpmk_id: subCpmk.id,
                            ...(semester && { semester }),
                            ...(tahun_ajaran && { tahun_ajaran })
                        }
                    });

                    if (assessments.length === 0) continue;

                    // Get average grade for each assessment
                    let totalAssessmentAttainment = 0;
                    let assessmentCount = 0;

                    for (const assessment of assessments) {
                        const avgGrade = await StudentGrade.findOne({
                            where: { assessment_component_id: assessment.id },
                            attributes: [
                                [sequelize.fn('AVG', sequelize.col('nilai_angka')), 'avg_nilai']
                            ],
                            raw: true
                        });

                        if (avgGrade && avgGrade.avg_nilai) {
                            totalAssessmentAttainment += parseFloat(avgGrade.avg_nilai);
                            assessmentCount++;
                        }
                    }

                    if (assessmentCount > 0) {
                        const subCpmkAttainment = totalAssessmentAttainment / assessmentCount;
                        totalSubCPMKAttainment += subCpmkAttainment;
                        subCpmkCount++;
                    }
                }

                if (subCpmkCount > 0) {
                    const cpmkAttainment = totalSubCPMKAttainment / subCpmkCount;
                    totalCPMKAttainment += cpmkAttainment;
                    cpmkCount++;
                }
            }

            const cplAttainment = cpmkCount > 0 ? totalCPMKAttainment / cpmkCount : 0;

            cplResults.push({
                cpl_id: cpl.id,
                cpl_kode: cpl.kode,
                cpl_deskripsi: cpl.deskripsi,
                attainment: Math.round(cplAttainment * 100) / 100,
                status: cplAttainment >= 75 ? 'Good' : cplAttainment >= 60 ? 'Fair' : 'Poor'
            });
        }

        res.json(cplResults);
    } catch (error) {
        console.error('Error calculating CPL attainment:', error);
        res.status(500).json({ message: 'Failed to calculate CPL attainment' });
    }
};

/**
 * Calculate CPMK attainment for a course
 */
export const calculateCPMKAttainment = async (req, res) => {
    try {
        const { mata_kuliah_id, semester, tahun_ajaran } = req.query;

        if (!mata_kuliah_id || !semester || !tahun_ajaran) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }

        // Get course with CPMKs
        const course = await MataKuliah.findByPk(mata_kuliah_id, {
            include: [
                {
                    model: CPMK,
                    as: 'cpmk',
                    include: [
                        {
                            model: SubCPMK,
                            as: 'sub_cpmk'
                        }
                    ]
                }
            ]
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const cpmkResults = [];

        for (const cpmk of course.cpmk || []) {
            let totalSubCPMKAttainment = 0;
            let subCpmkCount = 0;

            for (const subCpmk of cpmk.sub_cpmk || []) {
                // Get assessments for this Sub-CPMK in this semester
                const assessments = await AssessmentComponent.findAll({
                    where: {
                        mata_kuliah_id,
                        sub_cpmk_id: subCpmk.id,
                        semester,
                        tahun_ajaran
                    }
                });

                if (assessments.length === 0) continue;

                let totalAssessmentAttainment = 0;
                let assessmentCount = 0;

                for (const assessment of assessments) {
                    const avgGrade = await StudentGrade.findOne({
                        where: { assessment_component_id: assessment.id },
                        attributes: [
                            [sequelize.fn('AVG', sequelize.col('nilai_angka')), 'avg_nilai']
                        ],
                        raw: true
                    });

                    if (avgGrade && avgGrade.avg_nilai) {
                        totalAssessmentAttainment += parseFloat(avgGrade.avg_nilai);
                        assessmentCount++;
                    }
                }

                if (assessmentCount > 0) {
                    const subCpmkAttainment = totalAssessmentAttainment / assessmentCount;
                    totalSubCPMKAttainment += subCpmkAttainment;
                    subCpmkCount++;
                }
            }

            const cpmkAttainment = subCpmkCount > 0 ? totalSubCPMKAttainment / subCpmkCount : 0;

            cpmkResults.push({
                cpmk_id: cpmk.id,
                cpmk_kode: cpmk.kode,
                cpmk_deskripsi: cpmk.deskripsi,
                attainment: Math.round(cpmkAttainment * 100) / 100,
                status: cpmkAttainment >= 75 ? 'Good' : cpmkAttainment >= 60 ? 'Fair' : 'Poor'
            });
        }

        res.json(cpmkResults);
    } catch (error) {
        console.error('Error calculating CPMK attainment:', error);
        res.status(500).json({ message: 'Failed to calculate CPMK attainment' });
    }
};

/**
 * Get detailed Sub-CPMK attainment breakdown
 */
export const getSubCPMKBreakdown = async (req, res) => {
    try {
        const { cpmk_id, semester, tahun_ajaran } = req.query;

        if (!cpmk_id) {
            return res.status(400).json({ message: 'cpmk_id is required' });
        }

        const cpmk = await CPMK.findByPk(cpmk_id, {
            include: [
                {
                    model: SubCPMK,
                    as: 'sub_cpmk'
                }
            ]
        });

        if (!cpmk) {
            return res.status(404).json({ message: 'CPMK not found' });
        }

        const subCpmkResults = [];

        for (const subCpmk of cpmk.sub_cpmk || []) {
            const assessments = await AssessmentComponent.findAll({
                where: {
                    sub_cpmk_id: subCpmk.id,
                    ...(semester && { semester }),
                    ...(tahun_ajaran && { tahun_ajaran })
                }
            });

            let totalAttainment = 0;
            let count = 0;
            const assessmentDetails = [];

            for (const assessment of assessments) {
                const avgGrade = await StudentGrade.findOne({
                    where: { assessment_component_id: assessment.id },
                    attributes: [
                        [sequelize.fn('AVG', sequelize.col('nilai_angka')), 'avg_nilai'],
                        [sequelize.fn('COUNT', sequelize.col('id')), 'student_count']
                    ],
                    raw: true
                });

                if (avgGrade && avgGrade.avg_nilai) {
                    const avg = parseFloat(avgGrade.avg_nilai);
                    totalAttainment += avg;
                    count++;

                    assessmentDetails.push({
                        component_type: assessment.component_type,
                        avg_nilai: Math.round(avg * 100) / 100,
                        student_count: parseInt(avgGrade.student_count)
                    });
                }
            }

            const attainment = count > 0 ? totalAttainment / count : 0;

            subCpmkResults.push({
                sub_cpmk_id: subCpmk.id,
                sub_cpmk_kode: subCpmk.kode,
                sub_cpmk_deskripsi: subCpmk.deskripsi,
                attainment: Math.round(attainment * 100) / 100,
                assessment_count: count,
                assessments: assessmentDetails
            });
        }

        res.json({
            cpmk_kode: cpmk.kode,
            cpmk_deskripsi: cpmk.deskripsi,
            sub_cpmk_breakdown: subCpmkResults
        });
    } catch (error) {
        console.error('Error getting Sub-CPMK breakdown:', error);
        res.status(500).json({ message: 'Failed to get Sub-CPMK breakdown' });
    }
};

/**
 * Get CPL attainment heatmap data (CPL x Course)
 */
export const getCPLHeatmap = async (req, res) => {
    try {
        const { prodi_id, tahun_ajaran } = req.query;

        if (!prodi_id || !tahun_ajaran) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }

        // Get all CPLs
        const cpls = await CPL.findAll({
            where: { prodi_id },
            order: [['kode', 'ASC']]
        });

        // Get all courses for this prodi
        const courses = await MataKuliah.findAll({
            where: { prodi_id },
            order: [['kode_mk', 'ASC']]
        });

        const heatmapData = [];

        for (const cpl of cpls) {
            const row = {
                cpl_kode: cpl.kode,
                courses: []
            };

            for (const course of courses) {
                // Get CPMKs that map to this CPL for this course
                const cpmks = await CPMK.findAll({
                    where: {
                        mata_kuliah_id: course.id,
                        cpl_id: cpl.id
                    },
                    include: [
                        {
                            model: SubCPMK,
                            as: 'sub_cpmk'
                        }
                    ]
                });

                if (cpmks.length === 0) {
                    row.courses.push({
                        kode_mk: course.kode_mk,
                        attainment: null
                    });
                    continue;
                }

                // Calculate average attainment for this CPL in this course
                let totalAttainment = 0;
                let count = 0;

                for (const cpmk of cpmks) {
                    for (const subCpmk of cpmk.sub_cpmk || []) {
                        const assessments = await AssessmentComponent.findAll({
                            where: {
                                sub_cpmk_id: subCpmk.id,
                                mata_kuliah_id: course.id,
                                tahun_ajaran
                            }
                        });

                        for (const assessment of assessments) {
                            const avgGrade = await StudentGrade.findOne({
                                where: { assessment_component_id: assessment.id },
                                attributes: [
                                    [sequelize.fn('AVG', sequelize.col('nilai_angka')), 'avg_nilai']
                                ],
                                raw: true
                            });

                            if (avgGrade && avgGrade.avg_nilai) {
                                totalAttainment += parseFloat(avgGrade.avg_nilai);
                                count++;
                            }
                        }
                    }
                }

                const attainment = count > 0 ? Math.round((totalAttainment / count) * 100) / 100 : null;

                row.courses.push({
                    kode_mk: course.kode_mk,
                    attainment
                });
            }

            heatmapData.push(row);
        }

        res.json({
            cpls: cpls.map(c => ({ kode: c.kode, deskripsi: c.deskripsi })),
            courses: courses.map(c => ({ kode: c.kode_mk, nama: c.nama_mk })),
            heatmap: heatmapData
        });
    } catch (error) {
        console.error('Error generating CPL heatmap:', error);
        res.status(500).json({ message: 'Failed to generate CPL heatmap' });
    }
};

/**
 * Export CPL report as JSON
 */
export const exportCPLReport = async (req, res) => {
    try {
        const { prodi_id, tahun_ajaran } = req.query;

        if (!prodi_id) {
            return res.status(400).json({ message: 'prodi_id is required' });
        }

        // Get prodi info
        const prodi = await Prodi.findByPk(prodi_id);

        // Calculate CPL attainment
        const cplAttainment = await calculateCPLAttainmentInternal(prodi_id, null, tahun_ajaran);

        const report = {
            generated_at: new Date().toISOString(),
            prodi: {
                kode: prodi.kode_prodi,
                nama: prodi.nama_prodi
            },
            tahun_ajaran,
            cpl_attainment: cplAttainment,
            summary: {
                total_cpl: cplAttainment.length,
                avg_attainment: cplAttainment.reduce((sum, cpl) => sum + cpl.attainment, 0) / cplAttainment.length || 0,
                good_count: cplAttainment.filter(c => c.status === 'Good').length,
                fair_count: cplAttainment.filter(c => c.status === 'Fair').length,
                poor_count: cplAttainment.filter(c => c.status === 'Poor').length
            }
        };

        res.json(report);
    } catch (error) {
        console.error('Error exporting CPL report:', error);
        res.status(500).json({ message: 'Failed to export CPL report' });
    }
};

// Internal helper function (reusable)
async function calculateCPLAttainmentInternal(prodi_id, semester, tahun_ajaran) {
    const cpls = await CPL.findAll({
        where: { prodi_id },
        include: [
            {
                model: CPMK,
                as: 'cpmk',
                include: [
                    {
                        model: SubCPMK,
                        as: 'sub_cpmk'
                    }
                ]
            }
        ]
    });

    const results = [];

    for (const cpl of cpls) {
        let totalCPMKAttainment = 0;
        let cpmkCount = 0;

        for (const cpmk of cpl.cpmk || []) {
            let totalSubCPMKAttainment = 0;
            let subCpmkCount = 0;

            for (const subCpmk of cpmk.sub_cpmk || []) {
                const assessments = await AssessmentComponent.findAll({
                    where: {
                        sub_cpmk_id: subCpmk.id,
                        ...(semester && { semester }),
                        ...(tahun_ajaran && { tahun_ajaran })
                    }
                });

                if (assessments.length === 0) continue;

                let totalAssessmentAttainment = 0;
                let assessmentCount = 0;

                for (const assessment of assessments) {
                    const avgGrade = await StudentGrade.findOne({
                        where: { assessment_component_id: assessment.id },
                        attributes: [
                            [sequelize.fn('AVG', sequelize.col('nilai_angka')), 'avg_nilai']
                        ],
                        raw: true
                    });

                    if (avgGrade && avgGrade.avg_nilai) {
                        totalAssessmentAttainment += parseFloat(avgGrade.avg_nilai);
                        assessmentCount++;
                    }
                }

                if (assessmentCount > 0) {
                    const subCpmkAttainment = totalAssessmentAttainment / assessmentCount;
                    totalSubCPMKAttainment += subCpmkAttainment;
                    subCpmkCount++;
                }
            }

            if (subCpmkCount > 0) {
                const cpmkAttainment = totalSubCPMKAttainment / subCpmkCount;
                totalCPMKAttainment += cpmkAttainment;
                cpmkCount++;
            }
        }

        const cplAttainment = cpmkCount > 0 ? totalCPMKAttainment / cpmkCount : 0;

        results.push({
            cpl_id: cpl.id,
            cpl_kode: cpl.kode,
            cpl_deskripsi: cpl.deskripsi,
            attainment: Math.round(cplAttainment * 100) / 100,
            status: cplAttainment >= 75 ? 'Good' : cplAttainment >= 60 ? 'Fair' : 'Poor'
        });
    }

    return results;
}
