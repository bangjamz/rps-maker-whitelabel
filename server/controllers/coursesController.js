import { MataKuliah } from '../models/index.js';

// Get all mata kuliah
export const getAllCourses = async (req, res) => {
    try {
        const courses = await MataKuliah.findAll({
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
        const { kode_mk, nama_mk, sks, semester } = req.body;

        const course = await MataKuliah.findByPk(id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        await course.update({
            kode_mk,
            nama_mk,
            sks,
            semester
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
