
import { MataKuliah, User } from './models/index.js';
import sequelize from './config/database.js';
import { Op } from 'sequelize';

async function debugVisibility() {
    try {
        await sequelize.authenticate();

        // 1. Get Kaprodi User
        const user = await User.findOne({ where: { username: 'kaprodi_informatika' } });
        console.log('User:', {
            username: user.username,
            role: user.role,
            prodi_id: user.prodi_id,
            fakultas_id: user.fakultas_id
        });

        const prodiId = user.prodi_id;
        const fakultasId = user.fakultas_id;

        // 2. Simulate the Where Clause
        const whereClause = {
            [Op.or]: [
                { scope: 'institusi' },
                ...(fakultasId ? [{ scope: 'fakultas', fakultas_id: fakultasId }] : []),
                ...(prodiId ? [{ scope: 'prodi', prodi_id: prodiId }] : [])
            ]
        };

        console.log('Where Clause:', JSON.stringify(whereClause, null, 2));

        // 3. Count matching courses
        const count = await MataKuliah.count({ where: whereClause });
        console.log('Matching courses count:', count);

        // 4. Check courses with null scope
        const nullScopeCount = await MataKuliah.count({ where: { scope: null } });
        console.log('Courses with scope=null:', nullScopeCount);

        // 5. Check 'Etika dan Profesi' details
        const etika = await MataKuliah.findOne({ where: { nama_mk: 'Etika dan Profesi' } });
        if (etika) {
            console.log('Etika Details:', {
                id: etika.id,
                nama_mk: etika.nama_mk,
                scope: etika.scope,
                prodi_id: etika.prodi_id,
                fakultas_id: etika.fakultas_id
            });
        }

    } catch (error) {
        console.error('Debug error:', error);
    } finally {
        await sequelize.close();
    }
}

debugVisibility();
