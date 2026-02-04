
import { MataKuliah, DosenAssignment, User, Prodi } from './models/index.js';
import sequelize from './config/database.js';

async function checkData() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const mkCount = await MataKuliah.count();
        console.log(`Mata Kuliah count: ${mkCount}`);

        const assignmentCount = await DosenAssignment.count();
        console.log(`Dosen Assignment count: ${assignmentCount}`);

        const prodiCount = await Prodi.count();
        console.log(`Prodi count: ${prodiCount}`);

        const userCount = await User.count();
        console.log(`User count: ${userCount}`);

        // Check specifically for 'Etika dan Profesi'
        const etika = await MataKuliah.findOne({ where: { nama_mk: 'Etika dan Profesi' } });
        console.log('Etika dan Profesi found:', !!etika);

        if (etika) {
            const assignment = await DosenAssignment.findOne({ where: { mata_kuliah_id: etika.id } });
            console.log('Assignment for Etika found:', !!assignment);
        }

    } catch (error) {
        console.error('Error checking data:', error);
    } finally {
        await sequelize.close();
    }
}

checkData();
