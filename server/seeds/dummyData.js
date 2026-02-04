
import { User, MataKuliah, DosenAssignment, Enrollment, Prodi } from '../models/index.js';
import { ROLES } from '../middleware/auth.js';

export const seedDummyData = async () => {
    console.log('\n🌱 Seeding Dummy Data for Demo...');

    try {
        // 1. Find Dosen Andi
        const dosenAndi = await User.findOne({ where: { username: 'dosen_andi' } });
        if (!dosenAndi) {
            console.error('❌ Dosen Andi not found! Run master seed first.');
            return;
        }

        // 2. Find Mahasiswa Andi
        // Based on npm (seeded in userData.js), let's assume one exists or we find by role
        // The master seed creates 30 students. Let's pick the first one from Informatik
        const mahasiswaAndi = await User.findOne({
            where: { role: 'mahasiswa' },
            include: [{
                model: Prodi,
                as: 'prodi',
                where: { kode: 'IF' } // Assuming 'IF' is Kode for Informatika
            }]
        });

        if (!mahasiswaAndi) {
            console.error('❌ No Mahasiswa Informatika found!');
            return;
        }

        console.log(`👤 Using Mahasiswa: ${mahasiswaAndi.nama_lengkap} (${mahasiswaAndi.username})`);


        // 3. Find 3 Courses for Informatika (Prodi ID matches Dosen/Mahasiswa)
        const courses = await MataKuliah.findAll({
            where: { prodi_id: dosenAndi.prodi_id },
            limit: 3
        });

        if (courses.length < 3) {
            console.error('❌ Not enough courses found for assignments.');
            return;
        }

        // 4. Create Assignments for Dosen Andi
        console.log(`📚 Assigning 3 courses to ${dosenAndi.nama_lengkap}: ${courses.map(c => c.nama_mk).join(', ')}`);

        for (const course of courses) {
            // Check if already assigned
            const exists = await DosenAssignment.findOne({
                where: {
                    dosen_id: dosenAndi.id,
                    mata_kuliah_id: course.id,
                    semester: 'Ganjil', // Defaulting to Ganjil 2025/2026 as per app default
                    tahun_ajaran: '2025/2026'
                }
            });

            if (!exists) {
                await DosenAssignment.create({
                    dosen_id: dosenAndi.id,
                    mata_kuliah_id: course.id,
                    assigned_by: 1, // Admin ID assumption, or skip validation
                    semester: 'Ganjil',
                    tahun_ajaran: '2025/2026',
                    catatan: 'Dummy assignment',
                    is_active: true
                });
            }
        }

        // 5. Enroll Mahasiswa Andi to these courses
        console.log(`🎓 Enrolling ${mahasiswaAndi.nama_lengkap} to assigned courses...`);

        for (const course of courses) {
            const exists = await Enrollment.findOne({
                where: {
                    mahasiswa_id: mahasiswaAndi.id,
                    mata_kuliah_id: course.id,
                    semester: 'Ganjil',
                    tahun_ajaran: '2025/2026'
                }
            });

            if (!exists) {
                await Enrollment.create({
                    mahasiswa_id: mahasiswaAndi.id,
                    mata_kuliah_id: course.id,
                    semester: 'Ganjil',
                    tahun_ajaran: '2025/2026',
                    status: 'Active',
                    is_active: true
                });
            }
        }

        console.log('✅ Dummy Data Seeded Successfully!');

    } catch (error) {
        console.error('❌ Error seeding dummy data:', error);
    }
};
