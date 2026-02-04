import { User, MataKuliah, RPS, Mahasiswa, Prodi, Fakultas } from '../models/index.js';
import { ROLES } from '../middleware/auth.js';

/**
 * Get role-specific dashboard statistics
 * GET /api/dashboard/stats
 */
export const getDashboardStats = async (req, res) => {
    try {
        const user = req.user;
        const role = user.role;

        let stats = {};

        switch (role) {
            case ROLES.ADMIN_INSTITUSI:
                stats = await getAdminInstitusiStats(user);
                break;

            case ROLES.DEKAN:
                stats = await getDekanStats(user);
                break;

            case ROLES.KAPRODI:
                stats = await getKaprodiStats(user);
                break;

            case ROLES.DOSEN:
                stats = await getDosenStats(user);
                break;

            case ROLES.MAHASISWA:
                stats = await getMahasiswaStats(user);
                break;

            default:
                return res.status(400).json({ message: 'Invalid role' });
        }

        res.json({
            role,
            stats,
            user: {
                id: user.id,
                nama: user.nama_lengkap,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ message: 'Failed to retrieve dashboard statistics' });
    }
};

// ========== ROLE-SPECIFIC STATS FUNCTIONS ==========

/**
 * Statistics for Admin Institusi
 */
async function getAdminInstitusiStats(user) {
    const fakultasCount = await Fakultas.count({ where: { is_active: true } });
    const prodiCount = await Prodi.count({ where: { is_active: true } });
    const userCount = await User.count({ where: { is_active: true } });
    const dosenCount = await User.count({ where: { role: ROLES.DOSEN, is_active: true } });
    const mahasiswaCount = await Mahasiswa.count({ where: { is_active: true } });
    const rpsCount = await RPS.count();

    return {
        fakultasCount,
        prodiCount,
        userCount,
        dosenCount,
        mahasiswaCount,
        totalRPS: rpsCount
    };
}

/**
 * Statistics for Dekan
 */
async function getDekanStats(user) {
    // Get all prodi IDs in this fakultas
    const prodiList = await Prodi.findAll({
        where: { fakultas_id: user.fakultas_id, is_active: true },
        attributes: ['id']
    });
    const prodiIds = prodiList.map(p => p.id);

    const prodiCount = prodiList.length;
    const kaprodiCount = await User.count({
        where: { role: ROLES.KAPRODI, prodi_id: prodiIds, is_active: true }
    });
    const dosenCount = await User.count({
        where: { role: ROLES.DOSEN, prodi_id: prodiIds, is_active: true }
    });
    const mahasiswaCount = await Mahasiswa.count({
        where: { prodi_id: prodiIds, is_active: true }
    });

    return {
        prodiCount,
        kaprodiCount,
        dosenCount,
        mahasiswaCount
    };
}

/**
 * Statistics for Kaprodi
 */
async function getKaprodiStats(user) {
    const mataKuliahCount = await MataKuliah.count({
        where: { prodi_id: user.prodi_id, is_active: true }
    });

    const dosenCount = await User.count({
        where: { role: ROLES.DOSEN, prodi_id: user.prodi_id, is_active: true }
    });

    const mahasiswaCount = await Mahasiswa.count({
        where: { prodi_id: user.prodi_id, is_active: true }
    });

    // RPS statistics
    const totalRPS = await RPS.count({
        include: [{
            model: MataKuliah,
            as: 'mata_kuliah',
            where: { prodi_id: user.prodi_id }
        }]
    });

    const pendingRPS = await RPS.count({
        where: { status: 'pending' },
        include: [{
            model: MataKuliah,
            as: 'mata_kuliah',
            where: { prodi_id: user.prodi_id }
        }]
    });

    const approvedRPS = await RPS.count({
        where: { status: 'approved' },
        include: [{
            model: MataKuliah,
            as: 'mata_kuliah',
            where: { prodi_id: user.prodi_id }
        }]
    });

    return {
        mataKuliahCount,
        dosenCount,
        mahasiswaCount,
        rpsStats: {
            total: totalRPS,
            pending: pendingRPS,
            approved: approvedRPS,
            completionRate: totalRPS > 0 ? Math.round((approvedRPS / totalRPS) * 100) : 0
        }
    };
}

/**
 * Statistics for Dosen
 */
async function getDosenStats(user) {
    // Count assigned courses (through DosenAssignment)
    const { DosenAssignment } = await import('../models/index.js');

    const assignedCoursesCount = await DosenAssignment.count({
        where: { dosen_id: user.id, is_active: true }
    });

    // RPS statistics for dosen's own RPS
    const totalRPS = await RPS.count({
        where: { dosen_id: user.id }
    });

    const draftRPS = await RPS.count({
        where: { dosen_id: user.id, status: 'draft' }
    });

    const pendingRPS = await RPS.count({
        where: { dosen_id: user.id, status: 'pending' }
    });

    const approvedRPS = await RPS.count({
        where: { dosen_id: user.id, status: 'approved' }
    });

    // Total students across all courses
    const totalStudents = await Mahasiswa.count({
        where: { prodi_id: user.prodi_id, is_active: true }
    });

    return {
        assignedCoursesCount,
        totalStudents,
        rpsStats: {
            total: totalRPS,
            draft: draftRPS,
            pending: pendingRPS,
            approved: approvedRPS
        }
    };
}

/**
 * Statistics for Mahasiswa
 */
async function getMahasiswaStats(user) {
    // This can be expanded based on student needs
    return {
        message: 'Student dashboard stats not yet implemented'
    };
}
