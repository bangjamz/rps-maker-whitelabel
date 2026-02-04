import { User } from './models/index.js';
import bcrypt from 'bcryptjs';

const resetPasswords = async () => {
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);

        await User.update({ password_hash: hashedPassword }, {
            where: {
                username: ['kaprodi_informatika', 'dosen_andi']
            }
        });

        console.log('Passwords reset to "password123" for kaprodi_informatika and dosen_andi');
    } catch (error) {
        console.error('Failed to reset passwords:', error);
    }
};

resetPasswords();
