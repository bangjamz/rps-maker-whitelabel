
import {
    CPL, CPMK, SubCPMK, BahanKajian, MataKuliah, Prodi
} from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import csvParser from 'csv-parser';
import fs from 'fs';

// Helper to delete file after processing
const cleanupFile = (path) => {
    if (fs.existsSync(path)) fs.unlinkSync(path);
};

// ========== CPL ==========
export const getCPLs = async (req, res) => {
    try {
        const { prodi_id } = req.user; // Assuming user is Kaprodi
        const cpls = await CPL.findAll({
            where: { prodi_id },
            order: [['created_at', 'DESC']]
        });
        res.json(cpls);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const importCPL = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const results = [];
    const errors = [];

    fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            const t = await sequelize.transaction();
            try {
                let successCount = 0;
                for (const row of results) {
                    // Expected columns: KodeUnik, KodeProdi, Deskripsi, Kategori
                    const { KodeUnik, KodeProdi, Deskripsi, Kategori } = row;

                    if (!KodeUnik || !Deskripsi) {
                        errors.push(`Skipping row ${KodeUnik}: Missing required fields`);
                        continue;
                    }

                    await CPL.upsert({
                        prodi_id: req.user.prodi_id,
                        kode_cpl: KodeUnik,
                        keterangan: KodeProdi,
                        deskripsi: Deskripsi,
                        kategori: Kategori,
                        level: 'prodi'
                    }, { transaction: t });
                    successCount++;
                }

                await t.commit();
                cleanupFile(req.file.path);
                res.json({ message: `Import successful. ${successCount} CPLs processed.`, errors });
            } catch (error) {
                await t.rollback();
                cleanupFile(req.file.path);
                res.status(500).json({ message: 'Import failed: ' + error.message });
            }
        });
};

// ========== BAHAN KAJIAN ==========
export const getBahanKajian = async (req, res) => {
    try {
        const { prodi_id } = req.user;
        const bks = await BahanKajian.findAll({
            where: { prodi_id },
            order: [['kode_bk', 'ASC']]
        });
        res.json(bks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const importBahanKajian = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const results = [];

    fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            const t = await sequelize.transaction();
            try {
                let successCount = 0;
                for (const row of results) {
                    // Expected: KodeBK, KodeProdi, Jenis, Deskripsi, BobotMin, BobotMax
                    const { KodeBK, KodeProdi, Jenis, Deskripsi, BobotMin, BobotMax } = row;

                    if (!KodeBK || !Deskripsi) continue;

                    await BahanKajian.upsert({
                        prodi_id: req.user.prodi_id,
                        kode_bk: KodeBK,
                        jenis: Jenis,
                        deskripsi: Deskripsi,
                        bobot_min: parseFloat(BobotMin) || 0,
                        bobot_max: parseFloat(BobotMax) || 0
                    }, { transaction: t });
                    successCount++;
                }

                await t.commit();
                cleanupFile(req.file.path);
                res.json({ message: `Import successful. ${successCount} items processed.` });
            } catch (error) {
                await t.rollback();
                cleanupFile(req.file.path);
                res.status(500).json({ message: error.message });
            }
        });
};

// ========== CPMK (Requires MK Code) ==========
export const importCPMK = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const results = [];

    fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            const t = await sequelize.transaction();
            try {
                let successCount = 0;
                for (const row of results) {
                    // Cols: KodeMK, KodeCPMK, Deskripsi, KodeCPL
                    const { KodeMK, KodeCPMK, Deskripsi, KodeCPL } = row;

                    if (!KodeMK || !KodeCPMK) continue;

                    // Find MK
                    const mk = await MataKuliah.findOne({ where: { kode_mk: KodeMK, prodi_id: req.user.prodi_id } });
                    if (!mk) continue;

                    // Find CPL
                    let cplId = null;
                    if (KodeCPL) {
                        const cpl = await CPL.findOne({ where: { kode_cpl: KodeCPL, prodi_id: req.user.prodi_id } });
                        if (cpl) cplId = cpl.id;
                    }

                    await CPMK.upsert({
                        mata_kuliah_id: mk.id,
                        kode_cpmk: KodeCPMK,
                        deskripsi: Deskripsi,
                        cpl_id: cplId
                    }, { transaction: t });
                    successCount++;
                }
                await t.commit();
                cleanupFile(req.file.path);
                res.json({ message: `Import successful. ${successCount} CPMKs processed.` });
            } catch (error) {
                await t.rollback();
                cleanupFile(req.file.path);
                res.status(500).json({ message: error.message });
            }
        });
};

// ========== SUB-CPMK (Requires MK + CPMK Code) ==========
export const importSubCPMK = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const results = [];

    fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            const t = await sequelize.transaction();
            try {
                let successCount = 0;
                for (const row of results) {
                    // Cols: KodeMK, KodeCPMK, KodeSubCPMK, Deskripsi
                    const { KodeMK, KodeCPMK, KodeSubCPMK, Deskripsi } = row;

                    if (!KodeMK || !KodeCPMK || !KodeSubCPMK) continue;

                    // Resolve Hierarchy: MK -> CPMK -> SubCPMK
                    const mk = await MataKuliah.findOne({ where: { kode_mk: KodeMK, prodi_id: req.user.prodi_id } });
                    if (!mk) continue;

                    const cpmk = await CPMK.findOne({
                        where: { kode_cpmk: KodeCPMK, mata_kuliah_id: mk.id }
                    });
                    if (!cpmk) continue;

                    await SubCPMK.upsert({
                        cpmk_id: cpmk.id,
                        kode_sub_cpmk: KodeSubCPMK,
                        deskripsi: Deskripsi,
                        is_template: true
                    }, { transaction: t });
                    successCount++;
                }
                await t.commit();
                cleanupFile(req.file.path);
                res.json({ message: `Import successful. ${successCount} Sub-CPMKs processed.` });
            } catch (error) {
                await t.rollback();
                cleanupFile(req.file.path);
                res.status(500).json({ message: error.message });
            }
        });
};

// ========== MATA KULIAH ==========
export const importMataKuliah = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const results = [];

    fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            const t = await sequelize.transaction();
            try {
                let successCount = 0;
                for (const row of results) {
                    // Cols: KodeMK, NamaMK, SKS, Semester, Deskripsi
                    const { KodeMK, NamaMK, SKS, Semester, Deskripsi } = row;

                    if (!KodeMK || !NamaMK) continue;

                    await MataKuliah.upsert({
                        prodi_id: req.user.prodi_id,
                        kode_mk: KodeMK,
                        nama_mk: NamaMK,
                        sks: parseInt(SKS) || 3,
                        semester: parseInt(Semester) || 1,
                        deskripsi: Deskripsi,
                        scope: 'prodi',
                        is_active: true
                    }, { transaction: t });
                    successCount++;
                }
                await t.commit();
                cleanupFile(req.file.path);
                res.json({ message: `Import successful. ${successCount} Mata Kuliah processed.` });
            } catch (error) {
                await t.rollback();
                cleanupFile(req.file.path);
                res.status(500).json({ message: error.message });
            }
        });
};

// ========== BATCH DELETE ==========
export const deleteBatchCPMK = async (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: 'Invalid IDs' });

    try {
        await CPMK.destroy({
            where: {
                id: { [Op.in]: ids }
            }
        });
        res.json({ message: `${ids.length} CPMKs deleted successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteBatchSubCPMK = async (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: 'Invalid IDs' });

    try {
        await SubCPMK.destroy({
            where: {
                id: { [Op.in]: ids }
            }
        });
        res.json({ message: `${ids.length} Sub-CPMKs deleted successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
