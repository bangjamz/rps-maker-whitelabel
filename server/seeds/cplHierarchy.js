import { CPL, ProfilLulusan } from '../models/index.js';

/**
 * Seed CPL dengan support untuk 3-level hierarchy:
 * - Institut level (mandatory untuk semua prodi)
 * - Fakultas level (mandatory untuk prodi di fakultas tersebut)
 * - Prodi level (spesifik untuk prodi)
 */

/**
 * Institut-level CPLs (mandatory for all programs at Institut Mahardika)
 */
export const seedInstitutCPL = async (institusiId) => {
    const cplInstitut = await CPL.bulkCreate([
        {
            level: 'institusi',
            institusi_id: institusiId,
            kode_cpl: 'IM-CPL01',
            deskripsi: 'Bertakwa kepada Tuhan Yang Maha Esa dan mampu menunjukkan sikap religius',
            kategori: 'Sikap',
            keterangan: 'WAJIB NASIONAL',
            is_mandatory: true,
            is_active: true
        },
        {
            level: 'institusi',
            institusi_id: institusiId,
            kode_cpl: 'IM-CPL02',
            deskripsi: 'Menjunjung tinggi nilai kemanusiaan dalam menjalankan tugas berdasarkan agama, moral, dan etika',
            kategori: 'Sikap',
            keterangan: 'WAJIB NASIONAL',
            is_mandatory: true,
            is_active: true
        },
        {
            level: 'institusi',
            institusi_id: institusiId,
            kode_cpl: 'IM-CPL03',
            deskripsi: 'Berkontribusi dalam peningkatan mutu kehidupan bermasyarakat, berbangsa, bernegara, dan kemajuan peradaban berdasarkan Pancasila',
            kategori: 'Sikap',
            keterangan: 'WAJIB NASIONAL',
            is_mandatory: true,
            is_active: true
        }
    ]);

    console.log(`✅ Created ${cplInstitut.length} Institut-level CPLs (mandatory for all programs)`);
    return cplInstitut;
};

/**
 * Fakultas-level CPLs (mandatory per faculty)
 */
export const seedFakultasCPL = async (fakultasList) => {
    const [fakultasTeknik, fakultasKesehatan] = fakultasList;

    // Fakultas Teknik CPLs
    const cplTeknik = await CPL.bulkCreate([
        {
            level: 'fakultas',
            fakultas_id: fakultasTeknik.id,
            kode_cpl: 'FT-CPL01',
            deskripsi: 'Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam konteks pengembangan atau implementasi ilmu pengetahuan dan teknologi',
            kategori: 'Keterampilan Umum',
            keterangan: 'WAJIB FAKULTAS',
            is_mandatory: true,
            is_active: true
        },
        {
            level: 'fakultas',
            fakultas_id: fakultasTeknik.id,
            kode_cpl: 'FT-CPL02',
            deskripsi: 'Mampu menguasai konsep teoritis secara mendalam dalam bidang teknologi dan rekayasa',
            kategori: 'Pengetahuan',
            keterangan: 'WAJIB FAKULTAS',
            is_mandatory: true,
            is_active: true
        }
    ]);

    // Fakultas Kesehatan CPLs
    const cplKesehatan = await CPL.bulkCreate([
        {
            level: 'fakultas',
            fakultas_id: fakultasKesehatan.id,
            kode_cpl: 'FKES-CPL01',
            deskripsi: 'Mampu memberikan asuhan/pelayanan kesehatan yang aman dan bermutu dengan mempertimbangkan aspek legal dan etis',
            kategori: 'Keterampilan Khusus',
            keterangan: 'WAJIB FAKULTAS',
            is_mandatory: true,
            is_active: true
        },
        {
            level: 'fakultas',
            fakultas_id: fakultasKesehatan.id,
            kode_cpl: 'FKES-CPL02',
            deskripsi: 'Mampu menerapkan prinsip-prinsip kesehatan dalam rangka meningkatkan derajat kesehatan masyarakat',
            kategori: 'Keterampilan Khusus',
            keterangan: 'WAJIB FAKULTAS',
            is_mandatory: true,
            is_active: true
        }
    ]);

    console.log(`✅ Created ${cplTeknik.length} Fakultas Teknik CPLs`);
    console.log(`✅ Created ${cplKesehatan.length} Fakultas Kesehatan CPLs`);

    return [...cplTeknik, ...cplKesehatan];
};

/**
 * Prodi-level CPLs (specific to each study program)
 * Only seeding for Informatika as example, others can be added similarly
 */
export const seedProdiCPL = async (prodiList, plList = []) => {
    const prodiInformatika = prodiList.find(p => p.kode === 'IF');

    if (!prodiInformatika) {
        console.log('⚠️  Prodi Informatika not found, skipping prodi CPL seeding');
        return [];
    }

    // Prodi Informatika - CPL (dari kurikulum existing)
    const cplInformatika = await CPL.bulkCreate([
        {
            level: 'prodi',
            prodi_id: prodiInformatika.id,
            pl_id: null,
            kode_cpl: 'IF-CPL01',
            deskripsi: 'Menginternalisasi semangat kemandirian, kejuangan, dan kewirausahaan.',
            keterangan: 'S10',
            kategori: 'Sikap',
            is_mandatory: false,
            is_active: true
        },
        {
            level: 'prodi',
            prodi_id: prodiInformatika.id,
            pl_id: null,
            kode_cpl: 'IF-CPL02',
            deskripsi: 'Memiliki pengetahuan yang memadai terkait cara kerja sistem komputer dan mampu menerapkan/menggunakan berbagai algoritma/metode untuk memecahkan masalah pada suatu organisasi.',
            keterangan: 'WAJIB',
            kategori: 'Pengetahuan',
            is_mandatory: false,
            is_active: true
        },
        {
            level: 'prodi',
            prodi_id: prodiInformatika.id,
            pl_id: null,
            kode_cpl: 'IF-CPL03',
            deskripsi: 'Memiliki kompetensi untuk menganalisis persoalan computing yang kompleks untuk mengidentifikasi solusi pengelolaan proyek teknologi bidang informatika/ilmu komputer dengan mempertimbangkan wawasan perkembangan ilmu transdisiplin',
            keterangan: 'WAJIB',
            kategori: 'Pengetahuan',
            is_mandatory: false,
            is_active: true
        },
        {
            level: 'prodi',
            prodi_id: prodiInformatika.id,
            pl_id: null,
            kode_cpl: 'IF-CPL04',
            deskripsi: 'Menguasai konsep teoritis bidang pengetahuan Ilmu Komputer/Informatika dalam mendesain dan mensimulasikan aplikasi teknologi multi-platform yang relevan dengan kebutuhan industri dan masyarakat.',
            keterangan: 'WAJIB',
            kategori: 'Pengetahuan',
            is_mandatory: false,
            is_active: true
        },
        {
            level: 'prodi',
            prodi_id: prodiInformatika.id,
            pl_id: null,
            kode_cpl: 'IF-CPL05',
            deskripsi: 'Mampu menunjukkan kinerja mandiri, bermutu, dan terukur.',
            keterangan: 'KU02',
            kategori: 'Keterampilan Umum',
            is_mandatory: false,
            is_active: true
        },
        {
            level: 'prodi',
            prodi_id: prodiInformatika.id,
            pl_id: null,
            kode_cpl: 'IF-CPL06',
            deskripsi: 'Kemampuan mengimplementasi kebutuhan computing dengan mempertimbangkan berbagai metode/algoritma yang sesuai.',
            keterangan: 'WAJIB',
            kategori: 'Keterampilan Khusus',
            is_mandatory: false,
            is_active: true
        },
        {
            level: 'prodi',
            prodi_id: prodiInformatika.id,
            pl_id: null,
            kode_cpl: 'IF-CPL07',
            deskripsi: 'Kemampuan menganalisis, merancang, membuat dan mengevaluasi user interface dan aplikasi interaktif dengan mempertimbangkan kebutuhan pengguna dan perkembangan ilmu transdisiplin.',
            keterangan: 'WAJIB',
            kategori: 'Keterampilan Khusus',
            is_mandatory: false,
            is_active: true
        },
        {
            level: 'prodi',
            prodi_id: prodiInformatika.id,
            pl_id: null,
            kode_cpl: 'IF-CPL08',
            deskripsi: 'Kemampuan mendesain, mengimplementasi dan mengevaluasi solusi berbasis computing multi-platform yang memenuhi kebutuhan-kebutuhan computing pada sebuah organisasi.',
            keterangan: 'WAJIB',
            kategori: 'Keterampilan Khusus',
            is_mandatory: false,
            is_active: true
        },
        {
            level: 'prodi',
            prodi_id: prodiInformatika.id,
            pl_id: null,
            kode_cpl: 'IF-CPL09',
            deskripsi: 'Mampu mengambil keputusan secara tepat dalam konteks penyelesaian masalah di bidang keahliannya, berdasarkan hasil analisis informasi dan data.',
            keterangan: 'KU05',
            kategori: 'Keterampilan Umum',
            is_mandatory: false,
            is_active: true
        },
        {
            level: 'prodi',
            prodi_id: prodiInformatika.id,
            pl_id: null,
            kode_cpl: 'IF-CPL10',
            deskripsi: 'Mampu mendokumentasikan, menyimpan, mengamankan, dan menemukan kembali data untuk menjamin kesahihan dan mencegah plagiasi.',
            keterangan: 'KU09',
            kategori: 'Keterampilan Umum',
            is_mandatory: false,
            is_active: true
        }
    ]);

    console.log(`✅ Created ${cplInformatika.length} Prodi Informatika CPLs`);
    return cplInformatika;
};

/**
 * Seed Profil Lulusan for Informatika
 */
export const seedProfilLulusan = async (prodiInformatikaId) => {
    const plData = [
        {
            prodi_id: prodiInformatikaId,
            kode_pl: 'PL1',
            deskripsi: '(IABEE) Lulusan memiliki kemampuan menganalisis persoalan computing serta menerapkan prinsip-prinsip computing dan disiplin ilmu relevan lainnya untuk mengidentifikasi solusi bagi organisasi.',
            unsur: 'Pengetahuan',
            sifat: 'Wajib'
        },
        {
            prodi_id: prodiInformatikaId,
            kode_pl: 'PL2',
            deskripsi: '(IABEE) Lulusan memiliki kemampuan mendesain, mengimplementasi dan mengevaluasi solusi berbasis computing yang memenuhi kebutuhan pengguna dengan pendekatan yang sesuai.',
            unsur: 'Keterampilan Khusus',
            sifat: 'Wajib'
        },
        {
            prodi_id: prodiInformatikaId,
            kode_pl: 'PL3',
            deskripsi: '(KKNI 01) Lulusan mampu menunjukkan kinerja mandiri, bermutu, dan terukur.',
            unsur: 'Sikap',
            sifat: 'Pilihan'
        },
        {
            prodi_id: prodiInformatikaId,
            kode_pl: 'PL4',
            deskripsi: '(KKNI) Lulusan memiliki kepatuhan terhadap aspek legal, aspek sosial budaya dan etika profesi.',
            unsur: 'Sikap',
            sifat: 'Pilihan'
        },
        {
            prodi_id: prodiInformatikaId,
            kode_pl: 'PL5',
            deskripsi: '(KKNI 02, CS 2013, SN Dikti 01) Lulusan mampu berpikir logis, kritis serta sistematis dalam memanfaatkan ilmu pengetahuan informatika/ ilmu komputer untuk menyelesaikan masalah nyata.',
            unsur: 'Keterampilan Umum',
            sifat: 'Pilihan'
        }
    ];

    const profilLulusan = await ProfilLulusan.bulkCreate(plData);
    console.log(`✅ Created ${profilLulusan.length} Profil Lulusan for Informatika`);
    return profilLulusan;
};
