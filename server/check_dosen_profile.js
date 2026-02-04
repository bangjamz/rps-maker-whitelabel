import { User, Dosen } from './models/index.js';

const check = async () => {
    try {
        const user = await User.findOne({
            where: { username: 'dosen_andi' },
            include: [{ model: Dosen, as: 'dosen' }]
        });

        if (!user) {
            console.log('User dosen_andi not found');
            return;
        }

        console.log('User found:', user.username);
        if (user.dosen) {
            console.log('Dosen profile found:', user.dosen.nama_lengkap);
        } else {
            console.log('Dosen profile NOT found for this user.');
            // Create dummy dosen profile
            const newDosen = await Dosen.create({
                user_id: user.id,
                nama_lengkap: 'Andi Wijaya, M.Kom',
                nidn: '1234567890',
                prodi_id: 1, // Assumes Prodi 1 exists
                status: 'Aktif'
            });
            console.log('Created dummy Dosen profile:', newDosen.id);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

check();
