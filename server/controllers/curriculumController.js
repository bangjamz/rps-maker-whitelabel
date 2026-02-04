import { CPL, CPMK, SubCPMK } from '../models/index.js';

// Get all CPL
export const getAllCPL = async (req, res) => {
    try {
        const cpl = await CPL.findAll({
            order: [['kode_cpl', 'ASC']],
            attributes: ['id', 'kode_cpl', 'deskripsi', 'keterangan', 'kategori']
        });

        res.json(cpl);
    } catch (error) {
        console.error('Get CPL error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get all CPMK
export const getAllCPMK = async (req, res) => {
    try {
        const cpmk = await CPMK.findAll({
            order: [['kode_cpmk', 'ASC']]
        });

        res.json(cpmk);
    } catch (error) {
        console.error('Get CPMK error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get all Sub-CPMK
export const getAllSubCPMK = async (req, res) => {
    try {
        const subCpmk = await SubCPMK.findAll({
            order: [['kode_sub_cpmk', 'ASC']]
        });

        res.json(subCpmk);
    } catch (error) {
        console.error('Get Sub-CPMK error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Create CPL
export const createCPL = async (req, res) => {
    try {
        const { kode_cpl, deskripsi, keterangan, kategori, prodi_id, pl_id } = req.body;

        const cpl = await CPL.create({
            kode_cpl,
            deskripsi,
            keterangan,
            kategori,
            prodi_id: prodi_id || req.user.prodi_id,
            pl_id
        });

        res.status(201).json(cpl);
    } catch (error) {
        console.error('Create CPL error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Bulk import CPL (with CSV data)
export const bulkImportCPL = async (req, res) => {
    try {
        const { data } = req.body;

        if (!Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ message: 'Invalid data format' });
        }

        const created = await CPL.bulkCreate(data, {
            updateOnDuplicate: ['deskripsi', 'keterangan', 'kategori']
        });

        res.status(201).json({
            message: `${created.length} CPL imported successfully`,
            count: created.length
        });
    } catch (error) {
        console.error('Bulk import CPL error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Update CPL
export const updateCPL = async (req, res) => {
    try {
        const { id } = req.params;
        const { kode_cpl, deskripsi, keterangan, kategori } = req.body;

        const cpl = await CPL.findByPk(id);

        if (!cpl) {
            return res.status(404).json({ message: 'CPL not found' });
        }

        await cpl.update({
            kode_cpl,
            deskripsi,
            keterangan,
            kategori
        });

        res.json(cpl);
    } catch (error) {
        console.error('Update CPL error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Delete CPL
export const deleteCPL = async (req, res) => {
    try {
        const { id } = req.params;

        const cpl = await CPL.findByPk(id);

        if (!cpl) {
            return res.status(404).json({ message: 'CPL not found' });
        }

        await cpl.destroy();

        res.json({ message: 'CPL deleted successfully' });
    } catch (error) {
        console.error('Delete CPL error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
