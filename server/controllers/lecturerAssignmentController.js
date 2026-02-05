import { DosenAssignment, User, MataKuliah, Prodi, Fakultas, Notification } from '../models/index.js';
import { ROLES } from '../middleware/auth.js';

/**
 * Get all lecturer assignments (filtered by user role)
 * GET /api/lecturer-assignments
 */
export const getAllAssignments = async (req, res) => {
    try {
        const user = req.user;
        const { semester, tahunAjaran, prodiId } = req.query;

        let whereClause = { is_active: true };
        let mataKuliahWhere = {};

        // Filter by semester/tahun if provided
        if (semester) whereClause.semester = semester;
        if (tahunAjaran) whereClause.tahun_ajaran = tahunAjaran;

        // Role-based filtering
        if (user.role === ROLES.KAPRODI) {
            // Kaprodi sees assignments for their prodi courses
            mataKuliahWhere.prodi_id = user.prodi_id;
        } else if (user.role === ROLES.DEKAN) {
            // Dekan sees all assignments in their fakultas
            const prodiList = await Prodi.findAll({
                where: { fakultas_id: user.fakultas_id, is_active: true },
                attributes: ['id']
            });
            mataKuliahWhere.prodi_id = prodiList.map(p => p.id);
        } else if (user.role === ROLES.DOSEN) {
            // Dosen sees only their own assignments
            whereClause.dosen_id = user.id;
        }

        // Optional prodi filter (for admin/dekan)
        if (prodiId && [ROLES.ADMIN_INSTITUSI, ROLES.DEKAN].includes(user.role)) {
            mataKuliahWhere.prodi_id = parseInt(prodiId);
        }

        const assignments = await DosenAssignment.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'dosen',
                    attributes: ['id', 'nama_lengkap', 'email', 'nidn', 'prodi_id'],
                    include: [
                        {
                            model: Prodi,
                            as: 'prodi',
                            attributes: ['id', 'kode', 'nama'],
                            include: [{
                                model: Fakultas,
                                as: 'fakultas',
                                attributes: ['id', 'kode', 'nama']
                            }]
                        }
                    ]
                },
                {
                    model: MataKuliah,
                    as: 'mata_kuliah',
                    where: Object.keys(mataKuliahWhere).length > 0 ? mataKuliahWhere : undefined,
                    attributes: ['id', 'kode_mk', 'nama_mk', 'sks', 'semester', 'prodi_id'],
                    include: [{
                        model: Prodi,
                        as: 'prodi',
                        attributes: ['id', 'kode', 'nama']
                    }]
                },
                {
                    model: User,
                    as: 'assigner',
                    attributes: ['id', 'nama_lengkap']
                }
            ],
            order: [['tahun_ajaran', 'DESC'], ['semester', 'DESC'], ['created_at', 'DESC']]
        });

        res.json(assignments);
    } catch (error) {
        console.error('Get assignments error:', error);
        res.status(500).json({ message: 'Failed to retrieve lecturer assignments' });
    }
};

/**
 * Get available lecturers for assignment (supports cross-faculty)
 * GET /api/lecturer-assignments/available-lecturers?prodiId=X
 */
export const getAvailableLecturers = async (req, res) => {
    try {
        const { prodiId } = req.query;

        if (!prodiId) {
            return res.status(400).json({ message: 'Prodi ID is required' });
        }

        // Get all active lecturers with their homebase prodi/fakultas info
        const lecturers = await User.findAll({
            where: { role: ROLES.DOSEN, is_active: true },
            attributes: ['id', 'nama_lengkap', 'email', 'nidn', 'telepon', 'prodi_id'],
            include: [
                {
                    model: Prodi,
                    as: 'prodi',
                    attributes: ['id', 'kode', 'nama', 'fakultas_id'],
                    include: [{
                        model: Fakultas,
                        as: 'fakultas',
                        attributes: ['id', 'kode', 'nama']
                    }]
                }
            ],
            order: [['nama_lengkap', 'ASC']]
        });

        // Categorize lecturers
        const targetProdi = await Prodi.findByPk(prodiId, {
            include: [{ model: Fakultas, as: 'fakultas' }]
        });

        if (!targetProdi) {
            return res.status(404).json({ message: 'Target prodi not found' });
        }

        const categorized = lecturers.map(lecturer => {
            const lecData = lecturer.toJSON();
            let category = 'cross-faculty';
            let isSameProdi = false;
            let isSameFakultas = false;

            if (lecturer.prodi_id === parseInt(prodiId)) {
                category = 'same-prodi';
                isSameProdi = true;
                isSameFakultas = true;
            } else if (lecturer.prodi?.fakultas_id === targetProdi.fakultas_id) {
                category = 'same-fakultas';
                isSameFakultas = true;
            }

            return {
                ...lecData,
                assignmentCategory: category,
                isSameProdi,
                isSameFakultas
            };
        });

        // Sort by category priority: same-prodi > same-fakultas > cross-faculty
        const sorted = categorized.sort((a, b) => {
            const priority = { 'same-prodi': 0, 'same-fakultas': 1, 'cross-faculty': 2 };
            return priority[a.assignmentCategory] - priority[b.assignmentCategory];
        });

        res.json({
            targetProdi: {
                id: targetProdi.id,
                nama: targetProdi.nama,
                fakultas: targetProdi.fakultas.nama
            },
            lecturers: sorted
        });
    } catch (error) {
        console.error('Get available lecturers error:', error);
        res.status(500).json({ message: 'Failed to retrieve available lecturers' });
    }
};

/**
 * Create new lecturer assignment
 * POST /api/lecturer-assignments
 */
export const createAssignment = async (req, res) => {
    try {
        const { dosen_id, mata_kuliah_id, semester, tahun_ajaran, catatan, force } = req.body;
        const user = req.user;

        // Validation
        if (!dosen_id || !mata_kuliah_id || !semester || !tahun_ajaran) {
            return res.status(400).json({
                message: 'dosen_id, mata_kuliah_id, semester, and tahun_ajaran are required'
            });
        }

        // Verify mata kuliah exists and user has permission
        const mataKuliah = await MataKuliah.findByPk(mata_kuliah_id);
        if (!mataKuliah) {
            return res.status(404).json({ message: 'Mata kuliah not found' });
        }

        // Check authorization
        if (user.role === ROLES.KAPRODI && mataKuliah.prodi_id !== user.prodi_id) {
            return res.status(403).json({ message: 'You can only assign lecturers to your own prodi courses' });
        }

        // Verify dosen exists
        const dosen = await User.findByPk(dosen_id);
        if (!dosen || dosen.role !== ROLES.DOSEN || !dosen.is_active) {
            return res.status(404).json({ message: 'Dosen not found or invalid' });
        }

        // Check for existing assignment in same semester/tahun
        const existingAssignment = await DosenAssignment.findOne({
            where: {
                mata_kuliah_id,
                semester,
                tahun_ajaran,
                is_active: true
            },
            include: [{ model: User, as: 'dosen' }]
        });

        if (existingAssignment) {
            if (!force) {
                return res.status(409).json({
                    message: 'This course already has an active assignment for the specified semester',
                    existing: existingAssignment
                });
            } else {
                // Deactivate the old assignment
                existingAssignment.is_active = false;
                await existingAssignment.save();

                // Notify the replaced lecturer
                try {
                    await Notification.create({
                        user_id: existingAssignment.dosen_id,
                        title: 'Perubahan Penugasan Mengajar',
                        message: `Penugasan Anda untuk mata kuliah ${mataKuliah.kode_mk} - ${mataKuliah.nama_mk} (Sem ${semester} ${tahun_ajaran}) telah dialihkan ke dosen lain oleh Kaprodi.`,
                        type: 'warning'
                    });
                } catch (notifWarn) {
                    console.error('Failed to create notification for replaced lecturer:', notifWarn);
                }
            }
        }

        // Create assignment
        const assignment = await DosenAssignment.create({
            dosen_id,
            mata_kuliah_id,
            assigned_by: user.id,
            semester,
            tahun_ajaran,
            catatan,
            is_active: true
        });

        // Notify the new lecturer
        try {
            await Notification.create({
                user_id: dosen_id,
                title: 'Penugasan Mengajar Baru',
                message: `Anda telah ditugaskan untuk mengampu mata kuliah ${mataKuliah.kode_mk} - ${mataKuliah.nama_mk} pada Semester ${semester} ${tahun_ajaran}.`,
                type: 'success',
                link: '/dosen/courses'
            });
        } catch (notifErr) {
            console.error('Failed to create notification for new lecturer:', notifErr);
        }

        // Fetch full assignment with includes
        const fullAssignment = await DosenAssignment.findByPk(assignment.id, {
            include: [
                {
                    model: User,
                    as: 'dosen',
                    attributes: ['id', 'nama_lengkap', 'email', 'nidn'],
                    include: [{
                        model: Prodi,
                        as: 'prodi',
                        attributes: ['id', 'kode', 'nama'],
                        include: [{
                            model: Fakultas,
                            as: 'fakultas',
                            attributes: ['id', 'kode', 'nama']
                        }]
                    }]
                },
                {
                    model: MataKuliah,
                    as: 'mata_kuliah',
                    attributes: ['id', 'kode_mk', 'nama_mk', 'sks']
                },
                {
                    model: User,
                    as: 'assigner',
                    attributes: ['id', 'nama_lengkap']
                }
            ]
        });

        res.status(201).json(fullAssignment);
    } catch (error) {
        console.error('Create assignment error:', error);
        res.status(500).json({ message: 'Failed to create lecturer assignment' });
    }
};

/**
 * Update lecturer assignment
 * PUT /api/lecturer-assignments/:id
 */
export const updateAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const { dosen_id, catatan, is_active } = req.body;
        const user = req.user;

        const assignment = await DosenAssignment.findByPk(id, {
            include: [{ model: MataKuliah, as: 'mata_kuliah' }]
        });

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Check authorization
        if (user.role === ROLES.KAPRODI && assignment.mata_kuliah.prodi_id !== user.prodi_id) {
            return res.status(403).json({ message: 'You can only update assignments for your own prodi courses' });
        }

        // Update allowed fields
        if (dosen_id !== undefined) {
            const dosen = await User.findByPk(dosen_id);
            if (!dosen || dosen.role !== ROLES.DOSEN) {
                return res.status(404).json({ message: 'Invalid dosen' });
            }
            assignment.dosen_id = dosen_id;
        }
        if (catatan !== undefined) assignment.catatan = catatan;
        if (is_active !== undefined) assignment.is_active = is_active;

        await assignment.save();

        // Fetch updated assignment with includes
        const updated = await DosenAssignment.findByPk(id, {
            include: [
                { model: User, as: 'dosen', attributes: ['id', 'nama_lengkap', 'email'] },
                { model: MataKuliah, as: 'mata_kuliah', attributes: ['id', 'kode_mk', 'nama_mk'] },
                { model: User, as: 'assigner', attributes: ['id', 'nama_lengkap'] }
            ]
        });

        res.json(updated);
    } catch (error) {
        console.error('Update assignment error:', error);
        res.status(500).json({ message: 'Failed to update lecturer assignment' });
    }
};

/**
 * Delete (deactivate) lecturer assignment
 * DELETE /api/lecturer-assignments/:id
 */
export const deleteAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const assignment = await DosenAssignment.findByPk(id, {
            include: [{ model: MataKuliah, as: 'mata_kuliah' }]
        });

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Check authorization
        if (user.role === ROLES.KAPRODI && assignment.mata_kuliah.prodi_id !== user.prodi_id) {
            return res.status(403).json({ message: 'You can only delete assignments for your own prodi courses' });
        }

        // Soft delete by setting is_active = false
        assignment.is_active = false;
        await assignment.save();

        res.json({ message: 'Assignment deleted successfully', id: assignment.id });
    } catch (error) {
        console.error('Delete assignment error:', error);
        res.status(500).json({ message: 'Failed to delete lecturer assignment' });
    }
};
