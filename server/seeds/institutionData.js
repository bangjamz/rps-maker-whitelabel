import { Institusi, Fakultas, Prodi } from '../models/index.js';

/**
 * Seed organizational structure for Institut Mahardika
 * - 1 Institusi: Institut Mahardika
 * - 2 Fakultas: Teknik, Kesehatan
 * - 5 Prodi: Informatika, Keperawatan+NERS, Kesmas, Kebidanan, RMIK
 */

export const seedInstitusi = async () => {
    const institusi = await Institusi.create({
        nama: 'Institut Mahardika',
        nama_lengkap: 'Institut Teknologi dan Kesehatan Mahardika',
        jenis: 'Institut',
        singkatan: 'ITKM',
        alamat: 'Jalan Mahardika, Indonesia',
        website: 'https://mahardika.ac.id',
        email: 'info@mahardika.ac.id',
        telepon: '021-12345678',
        is_active: true
    });

    console.log('✅ Created Institusi: Institut Mahardika');
    return institusi;
};

export const seedFakultas = async (institusiId) => {
    const fakultasList = await Fakultas.bulkCreate([
        {
            institusi_id: institusiId,
            kode: 'FT',
            nama: 'Fakultas Teknik',
            deskripsi: 'Fakultas yang menaungi program studi di bidang teknologi dan rekayasa',
            is_active: true
        },
        {
            institusi_id: institusiId,
            kode: 'FKes',
            nama: 'Fakultas Kesehatan',
            deskripsi: 'Fakultas yang menaungi program studi di bidang kesehatan',
            is_active: true
        }
    ]);

    console.log('✅ Created 2 Fakultas: Teknik, Kesehatan');
    return fakultasList;
};

export const seedProdi = async (fakultasList) => {
    const [fakultasTeknik, fakultasKesehatan] = fakultasList;

    const prodiList = await Prodi.bulkCreate([
        // Fakultas Teknik
        {
            fakultas_id: fakultasTeknik.id,
            kode: 'IF',
            nama: 'Informatika',
            jenjang: 'S1',
            deskripsi: 'Program Studi Sarjana Informatika',
            is_active: true
        },
        // Fakultas Kesehatan
        {
            fakultas_id: fakultasKesehatan.id,
            kode: 'KEP',
            nama: 'Keperawatan dan Profesi NERS',
            jenjang: 'S1',
            deskripsi: 'Program Studi Sarjana Keperawatan dan Profesi NERS',
            is_active: true
        },
        {
            fakultas_id: fakultasKesehatan.id,
            kode: 'KM',
            nama: 'Kesehatan Masyarakat',
            jenjang: 'S1',
            deskripsi: 'Program Studi Sarjana Kesehatan Masyarakat',
            is_active: true
        },
        {
            fakultas_id: fakultasKesehatan.id,
            kode: 'KEB',
            nama: 'Kebidanan',
            jenjang: 'D3',
            deskripsi: 'Program Studi Diploma III Kebidanan',
            is_active: true
        },
        {
            fakultas_id: fakultasKesehatan.id,
            kode: 'RMIK',
            nama: 'Rekam Medis dan Informasi Kesehatan',
            jenjang: 'D3',
            deskripsi: 'Program Studi Diploma III Rekam Medis dan Informasi Kesehatan',
            is_active: true
        }
    ]);

    console.log('✅ Created 5 Prodi:');
    console.log('   - Fakultas Teknik: Informatika (S1)');
    console.log('   - Fakultas Kesehatan: Keperawatan+NERS (S1), Kesmas (S1), Kebidanan (D3), RMIK (D3)');

    return prodiList;
};

/**
 * Main function to seed organizational structure
 */
export const seedOrganizationStructure = async () => {
    const institusi = await seedInstitusi();
    const fakultasList = await seedFakultas(institusi.id);
    const prodiList = await seedProdi(fakultasList);

    return {
        institusi,
        fakultasList,
        prodiList
    };
};
