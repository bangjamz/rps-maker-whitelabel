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

/**
 * Get curriculum tree (CPL -> CPMK -> Sub-CPMK) for a prodi
 */
export const getCurriculumTree = async (req, res) => {
    try {
        const { prodiId } = req.params;

        const cpls = await CPL.findAll({
            where: { prodi_id: prodiId },
            include: [
                {
                    model: CPMK,
                    as: 'cpmk',
                    required: false,  // LEFT JOIN - don't fail if no CPMK
                    include: [
                        {
                            model: SubCPMK,
                            as: 'sub_cpmk',
                            required: false  // LEFT JOIN - don't fail if no SubCPMK
                        }
                    ]
                }
            ],
            order: [['kode_cpl', 'ASC']]  // Fixed: use kode_cpl not kode
        });

        // Flatten to match frontend expected format
        const formattedCpls = cpls.map(cpl => ({
            id: cpl.id,
            kode: cpl.kode_cpl,  // Use actual column name
            deskripsi: cpl.deskripsi,
            cpmks: (cpl.cpmk || []).map(cpmk => ({
                id: cpmk.id,
                kode: cpmk.kode_cpmk,  // Use actual column name
                deskripsi: cpmk.deskripsi,
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
            cpl_ids,
            cpmk_ids
        } = req.body;

        // Verify course exists
        const mataKuliah = await MataKuliah.findByPk(mata_kuliah_id);
        if (!mataKuliah) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check for duplicate
        const existing = await RPS.findOne({
            where: {
                mata_kuliah_id,
                semester,
                tahun_ajaran
            }
        });

        if (existing) {
            return res.status(400).json({
                message: 'RPS already exists for this course/semester/year'
            });
        }

        // Create RPS
        const rps = await RPS.create({
            mata_kuliah_id,
            semester,
            tahun_ajaran,
            deskripsi_mk,
            dosen_id: req.user.dosen?.id || null,
            status: 'draft'
        });

        // TODO: Link CPLs and CPMKs (if using junction table)
        // For now, assume they're tracked via pertemuan's sub_cpmk_id

        res.status(201).json({
            message: 'RPS created successfully',
            rps
        });
    } catch (error) {
        console.error('Error creating RPS:', error);
        res.status(500).json({ message: 'Failed to create RPS' });
    }
};

/**
 * Update RPS (Dosen only, if status = Draft)
 */
export const updateRPS = async (req, res) => {
    try {
        const { rpsId } = req.params;
        const { deskripsi_mk, cpl_ids, cpmk_ids } = req.body;

        const rps = await RPS.findByPk(rpsId);
        if (!rps) {
            return res.status(404).json({ message: 'RPS not found' });
        }

        // Check if Dosen owns this RPS, OR if user is Kaprodi/Dekan
        // Allow if user is DOSEN and owns it, OR if user is KAPRODI (admin control)
        const isOwner = rps.dosen_id === req.user.dosen?.id;
        const canEdit = isOwner || ['kaprodi', 'dekan'].includes(req.user.role);

        if (!canEdit) {
            return res.status(403).json({ message: 'You do not have permission to edit this RPS' });
        }

        // Can only edit if Draft
        if (rps.status.toLowerCase() !== 'draft') {
            return res.status(400).json({
                message: 'Can only edit RPS in Draft status'
            });
        }

        await rps.update({ deskripsi_mk });

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

        const rps = await RPS.findByPk(rpsId);
        if (!rps) {
            return res.status(404).json({ message: 'RPS not found' });
        }

        // Check ownership or permission
        const isOwner = rps.dosen_id === req.user.id;
        const canEdit = isOwner || ['kaprodi', 'dekan', 'admin'].includes(req.user.role);

        if (!canEdit) {
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
                indikator,
                materi,
                metode_pembelajaran,
                bentuk_pembelajaran,
                link_daring,
                bentuk_evaluasi,
                bobot_penilaian
            } = item;

            const [pertemuanRecord, created] = await RPSPertemuan.findOrCreate({
                where: {
                    rps_id: rpsId,
                    minggu_ke: minggu_ke
                },
                defaults: {
                    sub_cpmk,
                    indikator,
                    materi,
                    metode_pembelajaran,
                    bentuk_pembelajaran: Array.isArray(bentuk_pembelajaran) ? bentuk_pembelajaran : [],
                    link_daring,
                    bentuk_evaluasi,
                    bobot_penilaian
                }
            });

            if (!created) {
                // Update existing
                await pertemuanRecord.update({
                    sub_cpmk,
                    indikator,
                    materi,
                    metode_pembelajaran,
                    bentuk_pembelajaran: Array.isArray(bentuk_pembelajaran) ? bentuk_pembelajaran : [],
                    link_daring,
                    bentuk_evaluasi,
                    bobot_penilaian
                });
            }

            results.push(pertemuanRecord);
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
