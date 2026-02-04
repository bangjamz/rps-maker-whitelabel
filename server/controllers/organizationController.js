import { Institusi, Fakultas, Prodi, User } from '../models/index.js';

/**
 * Get institution information
 * GET /api/organization/institusi
 */
export const getInstitusi = async (req, res) => {
    try {
        const institusi = await Institusi.findOne({
            where: { is_active: true },
            attributes: ['id', 'nama', 'nama_lengkap', 'jenis', 'singkatan', 'alamat', 'website', 'email', 'telepon', 'logo_url']
        });

        if (!institusi) {
            return res.status(404).json({ message: 'Institution not found' });
        }

        // Get counts
        const fakultasCount = await Fakultas.count({ where: { institusi_id: institusi.id, is_active: true } });
        const prodiCount = await Prodi.count({ where: { is_active: true } });
        const userCount = await User.count({ where: { is_active: true } });

        res.json({
            ...institusi.toJSON(),
            statistics: {
                fakultasCount,
                prodiCount,
                userCount
            }
        });
    } catch (error) {
        console.error('Get institusi error:', error);
        res.status(500).json({ message: 'Failed to retrieve institution data' });
    }
};

/**
 * Get all fakultas
 * GET /api/organization/fakultas
 */
export const getAllFakultas = async (req, res) => {
    try {
        const fakultasList = await Fakultas.findAll({
            where: { is_active: true },
            attributes: ['id', 'institusi_id', 'kode', 'nama', 'deskripsi', 'dekan_user_id'],
            include: [
                {
                    model: User,
                    as: 'dekan',
                    attributes: ['id', 'nama_lengkap', 'email']
                },
                {
                    model: Prodi,
                    as: 'prodi_list',
                    attributes: ['id', 'kode', 'nama', 'jenjang'],
                    where: { is_active: true },
                    required: false
                }
            ],
            order: [['kode', 'ASC']]
        });

        // Add prodi count to each fakultas
        const fakultasWithCounts = fakultasList.map(fak => {
            const fakData = fak.toJSON();
            return {
                ...fakData,
                prodiCount: fakData.prodi_list ? fakData.prodi_list.length : 0
            };
        });

        res.json(fakultasWithCounts);
    } catch (error) {
        console.error('Get all fakultas error:', error);
        res.status(500).json({ message: 'Failed to retrieve fakultas data' });
    }
};

/**
 * Get fakultas by ID with full prodi list
 * GET /api/organization/fakultas/:id
 */
export const getFakultasById = async (req, res) => {
    try {
        const { id } = req.params;

        const fakultas = await Fakultas.findByPk(id, {
            include: [
                {
                    model: Institusi,
                    as: 'institusi',
                    attributes: ['id', 'nama', 'singkatan']
                },
                {
                    model: User,
                    as: 'dekan',
                    attributes: ['id', 'nama_lengkap', 'email', 'telepon']
                },
                {
                    model: Prodi,
                    as: 'prodi_list',
                    where: { is_active: true },
                    required: false,
                    include: [
                        {
                            model: User,
                            as: 'kaprodi',
                            attributes: ['id', 'nama_lengkap', 'email']
                        }
                    ]
                }
            ]
        });

        if (!fakultas || !fakultas.is_active) {
            return res.status(404).json({ message: 'Fakultas not found' });
        }

        // Get statistics
        const dosenCount = await User.count({
            where: { role: 'dosen', prodi_id: fakultas.prodi_list.map(p => p.id), is_active: true }
        });

        const mahasiswaCount = await User.count({
            where: { role: 'mahasiswa', prodi_id: fakultas.prodi_list.map(p => p.id), is_active: true }
        });

        res.json({
            ...fakultas.toJSON(),
            statistics: {
                prodiCount: fakultas.prodi_list.length,
                dosenCount,
                mahasiswaCount
            }
        });
    } catch (error) {
        console.error('Get fakultas by ID error:', error);
        res.status(500).json({ message: 'Failed to retrieve fakultas data' });
    }
};

/**
 * Get all prodi (optionally filtered by fakultas)
 * GET /api/organization/prodi?fakultasId=X
 */
export const getAllProdi = async (req, res) => {
    try {
        const { fakultasId } = req.query;
        const whereClause = { is_active: true };

        if (fakultasId) {
            whereClause.fakultas_id = parseInt(fakultasId);
        }

        const prodiList = await Prodi.findAll({
            where: whereClause,
            attributes: ['id', 'fakultas_id', 'kode', 'nama', 'jenjang', 'deskripsi', 'kaprodi_user_id'],
            include: [
                {
                    model: Fakultas,
                    as: 'fakultas',
                    attributes: ['id', 'kode', 'nama']
                },
                {
                    model: User,
                    as: 'kaprodi',
                    attributes: ['id', 'nama_lengkap', 'email']
                }
            ],
            order: [['fakultas_id', 'ASC'], ['kode', 'ASC']]
        });

        res.json(prodiList);
    } catch (error) {
        console.error('Get all prodi error:', error);
        res.status(500).json({ message: 'Failed to retrieve prodi data' });
    }
};

/**
 * Get prodi by ID with details
 * GET /api/organization/prodi/:id
 */
export const getProdiById = async (req, res) => {
    try {
        const { id } = req.params;

        const prodi = await Prodi.findByPk(id, {
            include: [
                {
                    model: Fakultas,
                    as: 'fakultas',
                    attributes: ['id', 'kode', 'nama'],
                    include: [
                        {
                            model: Institusi,
                            as: 'institusi',
                            attributes: ['id', 'nama', 'singkatan']
                        }
                    ]
                },
                {
                    model: User,
                    as: 'kaprodi',
                    attributes: ['id', 'nama_lengkap', 'email', 'telepon', 'nidn']
                }
            ]
        });

        if (!prodi || !prodi.is_active) {
            return res.status(404).json({ message: 'Prodi not found' });
        }

        // Get statistics
        const dosenCount = await User.count({
            where: { role: 'dosen', prodi_id: prodi.id, is_active: true }
        });

        const mahasiswaCount = await User.count({
            where: { role: 'mahasiswa', prodi_id: prodi.id, is_active: true }
        });

        res.json({
            ...prodi.toJSON(),
            statistics: {
                dosenCount,
                mahasiswaCount
            }
        });
    } catch (error) {
        console.error('Get prodi by ID error:', error);
        res.status(500).json({ message: 'Failed to retrieve prodi data' });
    }
};
