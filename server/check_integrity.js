
import { MataKuliah, DosenAssignment, User } from './models/index.js';
import sequelize from './config/database.js';

async function checkIntegrity() {
    try {
        await sequelize.authenticate();

        // 1. Get Dosen Andi
        const dosen = await User.findOne({ where: { username: 'dosen_andi' } });
        if (dosen) {
            console.log('Dosen Andi:', {
                id: dosen.id,
                username: dosen.username
            });

            // 2. Check Assignments for Dosen Andi
            const assignments = await DosenAssignment.findAll({
                where: { dosen_id: dosen.id },
                include: [{ model: MataKuliah, as: 'mata_kuliah', attributes: ['nama_mk'] }]
            });
            console.log(`Assignments for Dosen Andi (ID ${dosen.id}): ${assignments.length}`);
            assignments.forEach(a => {
                console.log(` - Assignment ID: ${a.id}, Course: ${a.mata_kuliah?.nama_mk}`);
            });
        } else {
            console.log('Dosen Andi not found!');
        }

        // 3. Check All Assignments values
        const allAssignments = await DosenAssignment.findAll();
        console.log('All Assignments Dosen IDs:', allAssignments.map(a => a.dosen_id));

    } catch (error) {
        console.error('Integrity check error:', error);
    } finally {
        await sequelize.close();
    }
}

checkIntegrity();
