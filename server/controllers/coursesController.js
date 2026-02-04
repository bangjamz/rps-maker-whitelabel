import { MataKuliah } from '../models/index.js';

import { Op } from 'sequelize';

// Get all mata kuliah
export const getAllCourses = async (req, res) => {
    try {
        const user = req.user;
        const prodiId = user.prodi_id;
        // Get fakultas_id directly from user (Dekan) or from prodi (Dosen/Mahasiswa/Kaprodi)
        const fakultasId = user.fakultas_id || user.prodi?.fakultas_id;

        const whereClause = {
            [Op.or]: [
                // 1. Institusi Level (Visible to everyone)
                { scope: 'institusi' },

                // 2. Fakultas Level (Visible if user belongs to that faculty)
                ...(fakultasId ? [{
                    scope: 'fakultas',
                    fakultas_id: fakultasId
                }] : []),

                // 3. Prodi Level (Visible if user belongs to that prodi)
                ...(prodiId ? [{
                    scope: 'prodi',
                    prodi_id: prodiId
                }] : [])
            ]
        };

        // If user is Admin Institusi, show all
        const finalWhere = user.role === 'admin_institusi' ? {} : whereClause;

        const courses = await MataKuliah.findAll({
            where: finalWhere,
            order: [['semester', 'ASC'], ['kode_mk', 'ASC']]
        });

        res.json(courses);
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get single course
export const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await MataKuliah.findByPk(id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json(course);
    } catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Create course
export const createCourse = async (req, res) => {
    try {
        const { kode_mk, nama_mk, sks, semester, prodi_id } = req.body;

        const course = await MataKuliah.create({
            kode_mk,
            nama_mk,
            sks,
            semester,
            prodi_id: prodi_id || req.user.prodi_id
        });

        res.status(201).json(course);
    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Update course
export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { kode_mk, nama_mk, sks, semester, scope, fakultas_id, prodi_id } = req.body;

        const course = await MataKuliah.findByPk(id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        await course.update({
            kode_mk,
            nama_mk,
            sks,
            semester,
            scope,
            fakultas_id,
            prodi_id
        });

        res.json(course);
    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Delete course
export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await MataKuliah.findByPk(id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        await course.destroy();

        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
