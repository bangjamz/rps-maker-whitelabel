import {
    RPS,
    RPSPertemuan,
    MataKuliah,
    CPL,
    CPMK,
    SubCPMK,
    Prodi,
    User
} from '../models/index.js';

import { Op } from 'sequelize';

/**
 * Get curriculum tree (CPL -> CPMK -> Sub-CPMK) for a prodi
 * Optional query: ?courseId=123 to filter CPMKs by course
 */
export const getCurriculumTree = async (req, res) => {
    try {
        const { prodiId } = req.params;
        const { courseId } = req.query;

        // Build include conditions
        const cpmkInclude = {
            model: CPMK,
            as: 'cpmk',
            required: false,
            include: [
                {
                    model: SubCPMK,
                    as: 'sub_cpmk',
                    required: false
                }
            ]
        };

        // If courseId provided, filter CPMKs by this course OR templates
        if (courseId) {
            cpmkInclude.where = {
                [Op.or]: [
                    { mata_kuliah_id: courseId },
                    { is_template: true }
                ]
            };
        }

        const cpls = await CPL.findAll({
            where: { prodi_id: prodiId },
            include: [cpmkInclude],
            order: [['kode_cpl', 'ASC']]
        });

        // Flatten to match frontend expected format
        const formattedCpls = cpls.map(cpl => ({
            id: cpl.id,
            kode: cpl.kode_cpl,
            deskripsi: cpl.deskripsi,
            cpmks: (cpl.cpmk || []).map(cpmk => ({
                id: cpmk.id,
                kode: cpmk.kode_cpmk,
                deskripsi: cpmk.deskripsi,
                mata_kuliah_id: cpmk.mata_kuliah_id,
                subCpmks: cpmk.sub_cpmk || []
            }))
        }));

        res.json({ cpls: formattedCpls });
    } catch (error) {
        console.error('Error fetching curriculum tree:', error);
        res.status(500).json({ message: 'Failed to fetch curriculum tree', error: error.message });
    }
};

/**
 * Create new RPS (Dosen only)
 */
export const createRPS = async (req, res) => {
    try {
        const {
            mata_kuliah_id,
            semester,
            tahun_ajaran,
            deskripsi_mk,
            rumpun_mk,
            pengembang_rps,
            koordinator_rumpun_mk,
            ketua_prodi,
            cpl_ids,
            cpmk_ids,
            sub_cpmk_list // Add this
        } = req.body;

        console.log('Creating RPS with data:', { mata_kuliah_id, semester, tahun_ajaran, user_id: req.user?.id });

        // Verify course exists
        const mataKuliah = await MataKuliah.findByPk(mata_kuliah_id);
        if (!mataKuliah) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check for duplicate - only if not allowing revisions
        const existing = await RPS.findOne({
            where: {
                mata_kuliah_id,
                semester,
                tahun_ajaran
            },
            order: [['revision', 'DESC']]
        });

        if (existing) {
            // Instead of returning it, we should suggest creating a revision if it's not draft
            if (existing.status !== 'draft') {
                // For now, let's just return it as before to avoid breaking old flow,
                // but normally UI should handle this by calling createRevision
                return res.status(200).json({
                    message: 'RPS already exists',
                    rps: existing,
                    isExisting: true
                });
            }
            return res.status(200).json({
                message: 'Draft RPS already exists',
                rps: existing,
                isExisting: true
            });
        }

        // Create RPS - use req.user.id directly
        const rps = await RPS.create({
            mata_kuliah_id,
            semester,
            tahun_ajaran,
            deskripsi_mk: deskripsi_mk || '',
            rumpun_mk: rumpun_mk || '',
            pengembang_rps: pengembang_rps || req.user?.nama_lengkap || '',
            koordinator_rumpun_mk: koordinator_rumpun_mk || '',
            ketua_prodi: ketua_prodi || '',
            dosen_id: req.user.id,  // Use User ID directly
            status: 'draft',
            sub_cpmk_list: sub_cpmk_list || [],
            revision: 1
        });

        console.log('RPS created successfully:', rps.id);

        res.status(201).json({
            message: 'RPS created successfully',
            rps
        });
    } catch (error) {
        console.error('Error creating RPS:', error);
        res.status(500).json({
            message: 'Failed to create RPS',
            error: error.message,
            details: error.errors?.map(e => e.message) || []
        });
    }
};

/**
 * Create a new revision from an existing RPS
 * POST /api/rps/dosen/:rpsId/revise
 */
export const createRevision = async (req, res) => {
    try {
        const { rpsId } = req.params;
        const user = req.user;

        const oldRps = await RPS.findByPk(rpsId, {
            include: [{ model: RPSPertemuan, as: 'pertemuan' }]
        });

        if (!oldRps) {
            return res.status(404).json({ message: 'Original RPS not found' });
        }

        // Check permission: Owner or Kaprodi
        const isOwner = oldRps.dosen_id === user.id;
        const canRevise = isOwner || ['kaprodi', 'dekan'].includes(user.role);

        if (!canRevise) {
            return res.status(403).json({ message: 'You do not have permission to create a revision for this RPS' });
        }

        // Check if there is already a draft revision (to prevent multiple parallel drafts)
        const existingDraft = await RPS.findOne({
            where: {
                mata_kuliah_id: oldRps.mata_kuliah_id,
                semester: oldRps.semester,
                tahun_ajaran: oldRps.tahun_ajaran,
                status: 'draft',
                revision: { [Op.gt]: oldRps.revision }
            }
        });

        if (existingDraft) {
            return res.status(400).json({
                message: 'A draft revision already exists. Please finish or delete it first.',
                rps: existingDraft
            });
        }

        // Create new revision
        const newRevision = oldRps.revision + 1;
        const newRps = await RPS.create({
            mata_kuliah_id: oldRps.mata_kuliah_id,
            assignment_id: oldRps.assignment_id,
            dosen_id: user.id, // The creator of revision becomes owner (usually same person)
            is_template: oldRps.is_template,
            template_id: oldRps.template_id,
            semester: oldRps.semester,
            tahun_ajaran: oldRps.tahun_ajaran,
            semester_akademik: oldRps.semester_akademik,
            jumlah_pertemuan: oldRps.jumlah_pertemuan,
            capaian_pembelajaran: oldRps.capaian_pembelajaran,
            deskripsi_mk: oldRps.deskripsi_mk,
            referensi: oldRps.referensi,
            rumpun_mk: oldRps.rumpun_mk,
            pengembang_rps: oldRps.pengembang_rps,
            koordinator_rumpun_mk: oldRps.koordinator_rumpun_mk,
            ketua_prodi: oldRps.ketua_prodi,
            status: 'draft',
            sub_cpmk_list: oldRps.sub_cpmk_list || [],
            revision: newRevision
        });

        // Clone pertemuan
        if (oldRps.pertemuan && oldRps.pertemuan.length > 0) {
            const pertemuanData = oldRps.pertemuan.map(p => ({
                rps_id: newRps.id,
                minggu_ke: p.minggu_ke,
                sub_cpmk: p.sub_cpmk,
                sub_cpmk_id: p.sub_cpmk_id, // Clone ID
                indikator: p.indikator,
                materi: p.materi,
                metode_pembelajaran: p.metode_pembelajaran,
                bentuk_pembelajaran: p.bentuk_pembelajaran,
                link_daring: p.link_daring,
                bentuk_evaluasi: p.bentuk_evaluasi,
                bobot_penilaian: p.bobot_penilaian
            }));
            await RPSPertemuan.bulkCreate(pertemuanData);
        }

        res.status(201).json({
            message: `Revision ${newRevision} created successfully`,
            rps: newRps
        });

    } catch (error) {
        console.error('Error creating revision:', error);
        res.status(500).json({ message: 'Failed to create revision', error: error.message });
    }
};

/**
 * Update RPS (Dosen only, if status = Draft)
 */
export const updateRPS = async (req, res) => {
    try {
        const { rpsId } = req.params;
        const {
            deskripsi_mk,
            rumpun_mk,
            pengembang_rps,
            koordinator_rumpun_mk,
            ketua_prodi,
            referensi,
            cpl_ids,
            sub_cpmk_list // Add this
        } = req.body;

        const rps = await RPS.findByPk(rpsId);
        if (!rps) {
            return res.status(404).json({ message: 'RPS not found' });
        }

        // Check ownership
        if (rps.dosen_id !== req.user.id && !['kaprodi', 'dekan'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (rps.status !== 'draft' && rps.status !== 'rejected') {
            return res.status(400).json({ message: 'Cannot update RPS that is not in draft status' });
        }

        await rps.update({
            deskripsi_mk,
            rumpun_mk,
            pengembang_rps,
            koordinator_rumpun_mk,
            ketua_prodi,
            ketua_prodi,
            referensi,
            sub_cpmk_list, // Update this
            updated_at: new Date()
        });

        res.json({
            message: 'RPS updated successfully',
            rps
        });
    } catch (error) {
        console.error('Error updating RPS:', error);
        res.status(500).json({ message: 'Failed to update RPS' });
    }
};

/**
 * Bulk create/update pertemuan for an RPS
 */
export const bulkUpsertPertemuan = async (req, res) => {
    try {
        const { rpsId } = req.params;
        const { pertemuan } = req.body; // Array of pertemuan objects

        if (!Array.isArray(pertemuan)) {
            return res.status(400).json({ message: 'pertemuan must be an array' });
        }

        console.log(`[bulkUpsertPertemuan] Saving ${pertemuan.length} items for RPS ${rpsId}`);

        const rps = await RPS.findByPk(rpsId);
        if (!rps) {
            return res.status(404).json({ message: 'RPS not found' });
        }

        // Check ownership or permission
        const isOwner = rps.dosen_id === req.user.id;
        const canEdit = isOwner || ['kaprodi', 'dekan', 'admin'].includes(req.user.role);

        if (!canEdit) {
            console.log(`[bulkUpsertPertemuan] Permission denied for user ${req.user.id} (${req.user.role}) on RPS ${rpsId}`);
            return res.status(403).json({ message: 'You do not have permission to edit this RPS' });
        }

        // Can only edit if Draft
        if (rps.status && rps.status.toLowerCase() !== 'draft') {
            return res.status(400).json({
                message: 'Can only edit RPS in Draft status'
            });
        }

        const results = [];

        for (const item of pertemuan) {
            const {
                minggu_ke,
                sub_cpmk,
                sub_cpmk_id, // Add this
                indikator,
                materi,
                metode_pembelajaran,
                bentuk_pembelajaran,
                link_daring,
                bentuk_evaluasi,
                bobot_penilaian
            } = item;

            // Handle mapping: if sub_cpmk (text) is empty but sub_cpmk_id is provided, use ID
            // Ideally we should lookup the Code, but for now let's store ID if that's what frontend sends
            const subCpmkValue = sub_cpmk || sub_cpmk_id;

            try {
                const [pertemuanRecord, created] = await RPSPertemuan.findOrCreate({
                    where: {
                        rps_id: rpsId,
                        minggu_ke: minggu_ke
                    },
                    defaults: {
                        sub_cpmk: subCpmkValue, // Use mapped value
                        sub_cpmk_id, // Save ID
                        indikator,
                        materi,
                        metode_pembelajaran: Array.isArray(metode_pembelajaran) ? JSON.stringify(metode_pembelajaran) : metode_pembelajaran,
                        bentuk_pembelajaran: Array.isArray(bentuk_pembelajaran) ? bentuk_pembelajaran : [],
                        link_daring,
                        bentuk_evaluasi,
                        bobot_penilaian
                    }
                });

                if (!created) {
                    // Update existing
                    await pertemuanRecord.update({
                        sub_cpmk: subCpmkValue,
                        sub_cpmk_id, // Update ID
                        indikator,
                        materi,
                        metode_pembelajaran: Array.isArray(metode_pembelajaran) ? JSON.stringify(metode_pembelajaran) : metode_pembelajaran,
                        bentuk_pembelajaran: Array.isArray(bentuk_pembelajaran) ? bentuk_pembelajaran : [],
                        link_daring,
                        bentuk_evaluasi,
                        bobot_penilaian
                    });
                }
                results.push(pertemuanRecord);
            } catch (innerError) {
                console.error(`[bulkUpsertPertemuan] Error saving week ${minggu_ke}:`, innerError);
                throw innerError; // Re-throw to catch block
            }
        }

        res.json({
            message: `${results.length} pertemuan records saved`,
            pertemuan: results
        });
    } catch (error) {
        console.error('Error bulk upserting pertemuan:', error);
        res.status(500).json({ message: 'Failed to save pertemuan', error: error.message });
    }
};

/**
 * Get courses for RPS creation dropdown
 * - Dosen: Get courses in their prodi
 * - Kaprodi: Get all courses in their prodi
 */
export const getDosenCourses = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [{ model: Prodi, as: 'prodi' }]
        });

        if (!user.prodi_id) {
            return res.status(404).json({ message: 'User has no prodi assigned' });
        }

        // Get all courses in user's prodi
        const courses = await MataKuliah.findAll({
            where: { prodi_id: user.prodi_id },
            order: [['kode_mk', 'ASC']]
        });

        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Failed to fetch courses' });
    }
};

/**
 * Create new CPMK (Dosen/Kaprodi)
 * POST /api/rps/curriculum/cpmk
 */
export const createCPMK = async (req, res) => {
    try {
        const { mata_kuliah_id, cpl_id, kode_cpmk, deskripsi, is_template } = req.body;

        const cpmk = await CPMK.create({
            mata_kuliah_id,
            cpl_id,
            kode_cpmk,
            deskripsi,
            is_template: is_template || false,
            created_by: req.user.id
        });

        res.status(201).json(cpmk);
    } catch (error) {
        console.error('Error creating CPMK:', error);
        res.status(500).json({ message: 'Failed to create CPMK', error: error.message });
    }
};

/**
 * Create new Sub-CPMK
 * POST /api/rps/curriculum/sub-cpmk
 */
export const createSubCPMK = async (req, res) => {
    try {
        const { cpmk_id, kode, deskripsi } = req.body;

        const subCpmk = await SubCPMK.create({
            cpmk_id,
            kode,
            deskripsi
        });

        res.status(201).json(subCpmk);
    } catch (error) {
        console.error('Error creating Sub-CPMK:', error);
        res.status(500).json({ message: 'Failed to create Sub-CPMK', error: error.message });
    }
};
