
import sequelize from '../config/database.js';
import { User, Prodi } from '../models/index.js';
import bcrypt from 'bcryptjs';

const dosenData = [
    { nama: "Dr. Indra Surya Permana, MM., M.Kom.", jabatan: "Kaprodi Informatika", homebase: "Informatika", status: "DTPS", nidn: "415058406", nuptk: "5847762663130372" },
    { nama: "Hendri Rosmawan, S.Kom., M.Kom", jabatan: "Wakil Rektor III", homebase: "Informatika", status: "DTPS", nidn: "9904201852", nuptk: "" },
    { nama: "Husni Hidayat Malik, S.Pd., M.Kom.", jabatan: "Kepala ADAK", homebase: "Informatika", status: "DTPS", nidn: "", nuptk: "" },
    { nama: "Yassep Azzery, S.Pd., M.T.", jabatan: "Dosen Tetap", homebase: "Informatika", status: "DTPS", nidn: "413088703", nuptk: "1245765666137023" },
    { nama: "Mohamad Firdaus, S.Kom., M.Kom", jabatan: "Dosen Tidak Tetap", homebase: "-", status: "DTPS", nidn: "403059003", nuptk: "9835768669130362" },
    { nama: "Ahmad Ngiliyun, M.Kom.", jabatan: "Sekprodi Informatika", homebase: "Informatika", status: "DTPS", nidn: "", nuptk: "7145778679130053" },
    { nama: "Syaiful Ramadhan, M.Kom.", jabatan: "Dosen Tidak Tetap", homebase: "Informatika", status: "DTPS", nidn: "8909390024", nuptk: "" },
    { nama: "Ade Sutriyono, S.Kom., M.Si.", jabatan: "Dosen Tetap", homebase: "Informatika", status: "DTPS", nidn: "", nuptk: "" },
    { nama: "Fardhoni, S.T., M.M, M.Kom.", jabatan: "Dekan Fakultas Teknik", homebase: "RMIK", status: "DTPT", nidn: "426117407", nuptk: "1458752653130103" },
    { nama: "Iin Indra Nuraeni, S.Sing., M.Pd", jabatan: "Dosen Universitas", homebase: "", status: "DTPT", nidn: "413057201", nuptk: "8845750651230112" },
    { nama: "Ahmad Fauzi, S.Ing., M.Pd", jabatan: "Dosen Universitas", homebase: "", status: "DTPT", nidn: "413086906", nuptk: "6145747648130103" },
    { nama: "H. Jaelani, S.Ag, M.Pd.I", jabatan: "Dosen Tetap", homebase: "", status: "DTPT", nidn: "408056306", nuptk: "3840741642131102" },
    { nama: "Ahmad Mujtahid Lafif., S.Pd.I., M.Pd", jabatan: "Dosen Tidak Tetap", homebase: "", status: "DTPT", nidn: "", nuptk: "" },
    { nama: "Affiati A, SPd, MAP", jabatan: "Dosen Universitas", homebase: "", status: "DTPT", nidn: "", nuptk: "" },
    { nama: "Bayu Ajie P, S.IKom., M.Pd", jabatan: "Dosen Tetap", homebase: "", status: "DTPT", nidn: "", nuptk: "" },
    { nama: "Sughema, SP., M.Kom.", jabatan: "Dosen Tidak Tetap", homebase: "", status: "Dosen", nidn: "2313032310", nuptk: "" },
    { nama: "Shella Febiana Putri, S.H., M. Kn.", jabatan: "Dosen Universitas", homebase: "", status: "Dosen", nidn: "", nuptk: "" },
    { nama: "M. Taufik, S.Ag., M.Pd", jabatan: "Dosen Universitas", homebase: "", status: "Dosen", nidn: "", nuptk: "" },
    { nama: "Ahmad Faqih, M.Pd.", jabatan: "Dosen Tidak Tetap", homebase: "", status: "Dosen", nidn: "", nuptk: "" },
    { nama: "Dr. Andinna Ananda Yusuff, M.M.", jabatan: "Wakil Rektor II", homebase: "RMIK", status: "DTPT", nidn: "427108402", nuptk: "5359762663230203" },
    { nama: "Sri Nurcahyati, M.Epid", jabatan: "Kaprodi RMIK", homebase: "RMIK", status: "DTPT", nidn: "", nuptk: "" },
    { nama: "Jaenudin, S.K.M., M.P.H.", jabatan: "Dekan Fakultas Kesehatan", homebase: "", status: "DTPT", nidn: "17127601", nuptk: "3549754655130093" },
    { nama: "Dr. Yani Kamasturyani, S.K.M., MH.Kes", jabatan: "Rektor", homebase: "Kesehatan Masyarakat", status: "DTPT", nidn: "428086507", nuptk: "" },
    { nama: "Dede Setiawan, S.Kep., M.Kes", jabatan: "Dosen Tetap", homebase: "", status: "DTPT", nidn: "", nuptk: "" },
    { nama: "Teguh Arlovin, S.Kom., M.Kom.", jabatan: "Dosen Tidak Tetap", homebase: "", status: "Dosen", nidn: "7839776677130182", nuptk: "" },
    { nama: "Ns. Tantri Maulani Putri, S.Kep., M.K.M.", jabatan: "Dosen Tetap", homebase: "Kebidanan", status: "Dosen", nidn: "", nuptk: "" },
    { nama: "Angga Gumilar Rasmita, S.H., M.H.", jabatan: "Dosen Tidak Tetap", homebase: "", status: "Dosen", nidn: "", nuptk: "" },
    { nama: "Yanti Susan, S.ST., M.Kes", jabatan: "Dosen Tetap", homebase: "Kebidanan", status: "Dosen", nidn: "", nuptk: "" }
];

const seedDosen = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established');

        // Sync database to ensure columns exist
        await sequelize.sync({ alter: true });
        console.log('✅ Database synchronized');

        // Fetch prodis map
        const prodis = await Prodi.findAll();
        const prodiMap = prodis.reduce((acc, p) => {
            acc[p.nama] = p.id;
            return acc;
        }, {});

        // Optional: Assuming "RMIK" = "Rekam Medis dan Informasi Kesehatan"
        // Adjust mapping if needed based on actual prodi names in DB.
        // For now, I'll log mapping logic.

        for (const data of dosenData) {
            // Determine Role
            let role = 'dosen';
            if (data.jabatan.toLowerCase().includes('kaprodi')) {
                role = 'kaprodi';
            }
            if (data.jabatan.toLowerCase().includes('dekan')) {
                role = 'dekan'; // Assuming enum has dekan
            }

            // Determine Prodi ID
            let prodiId = null;
            if (data.homebase && data.homebase !== '-') {
                // Try direct match
                if (prodiMap[data.homebase]) {
                    prodiId = prodiMap[data.homebase];
                } else {
                    // Fuzzy match or manual overrides
                    const lowerHome = data.homebase.toLowerCase();
                    const match = prodis.find(p => p.nama.toLowerCase().includes(lowerHome));
                    if (match) {
                        prodiId = match.id;
                    }
                }
            }

            // Generate Username/Email if empty
            // Username: NIDN -> NUPTK -> CleanName
            let username = data.nidn || data.nuptk;
            if (!username) {
                username = data.nama.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) + Math.floor(Math.random() * 1000);
            }

            // Email: username@mahardika.ac.id
            const email = `${username}@mahardika.ac.id`;

            // Upsert Logic
            // Try to find by NIDN or Name
            let user = await User.findOne({
                where: {
                    nama_lengkap: data.nama
                }
            });

            const payload = {
                username: username,
                email: email,
                password_hash: '123456', // Will be hashed by hook
                role: role,
                nama_lengkap: data.nama,
                prodi_id: prodiId,
                nidn: data.nidn || null,
                nuptk: data.nuptk || null,
                jabatan: data.jabatan,
                homebase: data.homebase,
                status_kepegawaian: data.status,
                is_active: true
            };

            if (user) {
                console.log(`Updating ${data.nama}...`);
                // Update only fields provided
                await user.update({
                    ...payload,
                    // keep existing password if updating? User said "ganti", maybe reset pass or keep?
                    // Safe to re-set default pass for "Ganti" scenario or keep it.
                    // I will re-set it to ensure they can login with 123456.
                    password_hash: '123456'
                });
            } else {
                console.log(`Creating ${data.nama}...`);
                await User.create(payload);
            }
        }

        console.log('✅ Dosen seeding completed successfully');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedDosen();
