
import { User } from './models/index.js';
import { generateToken } from './utils/jwt.js';

async function generateTokens() {
    try {
        console.log('--- GENERATING TOKENS ---');

        // 1. Kaprodi
        const kaprodi = await User.findOne({ where: { username: 'kaprodi_informatika' } });
        if (kaprodi) {
            // Correct usage: pass id and role
            const kaprodiToken = generateToken(kaprodi.id, kaprodi.role);
            console.log(`Kaprodi Token: ${kaprodiToken}`);
        } else {
            console.error('Kaprodi not found');
        }

        // 2. Dosen
        const dosen = await User.findOne({ where: { username: 'dosen_andi' } });
        if (dosen) {
            // Correct usage: pass id and role
            const dosenToken = generateToken(dosen.id, dosen.role);
            console.log(`Dosen Token: ${dosenToken}`);
        } else {
            console.error('Dosen not found');
        }

    } catch (error) {
        console.error('Error:', error);
    }
    process.exit(0);
}

generateTokens();
