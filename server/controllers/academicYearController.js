
import { AcademicYear } from '../models/index.js';
import sequelize from '../config/database.js';

export const getAcademicYears = async (req, res) => {
    try {
        const years = await AcademicYear.findAll({
            order: [['name', 'DESC']]
        });
        res.json(years);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createAcademicYear = async (req, res) => {
    try {
        const { name } = req.body;
        const year = await AcademicYear.create({ name });
        res.status(201).json(year);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAcademicYear = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const year = await AcademicYear.findByPk(id);
        if (!year) return res.status(404).json({ message: 'Tahun Akademik not found' });

        await year.update({ name });
        res.json(year);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const setActiveAcademicYear = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { active_semester } = req.body;

        if (!['Ganjil', 'Genap'].includes(active_semester)) {
            return res.status(400).json({ message: 'Semester must be Ganjil or Genap' });
        }

        // Deactivate all
        await AcademicYear.update({ is_active: false, active_semester: null }, { where: {}, transaction: t });

        // Activate selected
        const year = await AcademicYear.findByPk(id, { transaction: t });
        if (!year) {
            await t.rollback();
            return res.status(404).json({ message: 'Tahun Akademik not found' });
        }

        await year.update({ is_active: true, active_semester }, { transaction: t });

        await t.commit();
        res.json(year);
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};
