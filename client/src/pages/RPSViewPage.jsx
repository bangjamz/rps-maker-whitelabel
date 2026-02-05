import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import { exportRPSToPDF } from '../utils/rpsExport';

export default function RPSViewPage() {
    const { courseId, rpsId } = useParams(); // Get rpsId if available
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [rpsData, setRpsData] = useState(null);
    const [existingRPS, setExistingRPS] = useState(null);
    const [course, setCourse] = useState(null);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        loadRPSData();
    }, [courseId, rpsId]);

    const loadRPSData = async () => {
        setLoading(true);
        try {
            let rps = null;

            // Strategy 1: Load by RPS ID (Specific Version)
            if (rpsId) {
                const rpsResponse = await axios.get(`/rps/${rpsId}`);
                rps = rpsResponse.data;
                setExistingRPS(rps);
                setRpsData(rps);

                // If we loaded by RPS ID, we might need to fetch course info from the RPS data or separate call
                if (rps.mata_kuliah) {
                    setCourse(rps.mata_kuliah);
                } else if (courseId) {
                    const courseResponse = await axios.get(`/courses/${courseId}`);
                    setCourse(courseResponse.data);
                }
            }
            // Strategy 2: Load by Course ID (Latest Version - Legacy/Fallback)
            else if (courseId) {
                // Fetch course info
                const courseResponse = await axios.get(`/courses/${courseId}`);
                setCourse(courseResponse.data);

                // Try to fetch existing RPS for this course
                try {
                    const rpsResponse = await axios.get(`/rps/by-course/${courseId}`);
                    if (rpsResponse.data && rpsResponse.data.id) {
                        setExistingRPS(rpsResponse.data);
                        setRpsData(rpsResponse.data);
                    }
                } catch (rpsError) {
                    console.log('No existing RPS for this course');
                }
            }

            // Also fetch CPL/CPMK for display (only if we need them for empty state or enhancement?)
            // If we have RPS Data, we might not need this if the RPS object (from /rps/:id) has inclusions.
            // But existing code uses `rpsData.cpl` which might come from standard curriculum if new?
            // Existing `RPSViewPage` logic for "Create New" view seemed to rely on this.
            // But here we are mostly Viewing Existing.

            // If we didn't find RPS, load "Template/Empty" data (Only relevant for CourseId path)
            if (!rps && !rpsId && !existingRPS) { // Added !existingRPS to ensure it only runs if no RPS was found by courseId either
                const cplResponse = await axios.get('/curriculum/cpl');
                const cpmkResponse = await axios.get('/curriculum/cpmk');
                setRpsData({
                    cpl: cplResponse.data.slice(0, 3),
                    cpmk: cpmkResponse.data.slice(0, 5),
                });
            }
        } catch (error) {
            console.error('Failed to load RPS:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        try {
            await exportRPSToPDF(course, rpsData);
        } catch (error) {
            console.error('PDF export failed:', error);
            alert('Gagal export PDF. Silakan coba lagi.');
        }
    };

    const handleEditRPS = () => {
        const basePath = window.location.pathname.includes('/kaprodi/') ? '/kaprodi' : '/dosen';

        // If RPS exists, navigate to edit; otherwise navigate to create
        if (existingRPS && existingRPS.id) {
            navigate(`${basePath}/rps/${existingRPS.id}/edit`);
        } else {
            navigate(`${basePath}/rps/create`, {
                state: {
                    courseId: course?.id,
                    kode_mk: course?.kode_mk,
                    nama_mk: course?.nama_mk,
                    sks: course?.sks,
                    prodi_id: course?.prodi_id,
                    semester: course?.semester
                }
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Memuat RPS...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-6 print:p-0 print:bg-white">
            <div className="max-w-[210mm] mx-auto print:max-w-none"> {/* A4 Width approx */}
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 print:hidden">
                    <button onClick={() => navigate(-1)} className="btn btn-ghost">
                        ← Kembali
                    </button>
                    <div className="flex gap-3">
                        <button onClick={handleExportPDF} className="btn btn-secondary">
                            📄 Export PDF
                        </button>
                        <button onClick={handleEditRPS} className="btn btn-primary">
                            ✏️ Edit RPS
                        </button>
                    </div>
                </div>

                {/* RPS Document */}
                <div className="bg-white text-black shadow-lg print:shadow-none p-8 md:p-10 print:p-0 text-[12px] leading-tight font-serif">

                    {/* Header Table */}
                    <table className="w-full border border-black mb-4">
                        <tbody>
                            <tr>
                                <td className="border border-black p-2 w-24 text-center align-middle">
                                    <img
                                        src="/logo-mahardika.jpg"
                                        alt="Logo"
                                        className="w-20 h-20 object-contain mx-auto"
                                    />
                                </td>
                                <td className="border border-black p-2 text-center align-middle">
                                    <h1 className="font-bold text-lg">RENCANA PEMBELAJARAN SEMESTER</h1>
                                    <h2 className="font-bold text-base">PROGRAM STUDI S1 INFORMATIKA</h2>
                                    <h3 className="font-bold">FAKULTAS TEKNIK</h3>
                                    <h3 className="font-bold">INSTITUT TEKNOLOGI DAN KESEHATAN MAHARDIKA</h3>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Identitas Table */}
                    <table className="w-full border border-black mb-px">
                        <tbody>
                            <tr className="bg-gray-200 print:bg-gray-200">
                                <td className="border border-black p-1 font-bold w-[15%]">MATA KULIAH</td>
                                <td className="border border-black p-1 font-bold w-[10%]">KODE MK</td>
                                <td className="border border-black p-1 font-bold w-[15%]">RUMPUN MK</td>
                                <td className="border border-black p-1 font-bold w-[10%]">BOBOT (SKS)</td>
                                <td className="border border-black p-1 font-bold w-[10%]">SEMESTER</td>
                                <td className="border border-black p-1 font-bold w-[15%]">TGL PENYUSUNAN</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1">{course?.nama_mk}</td>
                                <td className="border border-black p-1">{course?.kode_mk}</td>
                                <td className="border border-black p-1">{rpsData?.rumpun_mk || '-'}</td>
                                <td className="border border-black p-1">
                                    T: {JSON.parse(JSON.stringify(rpsData?.bobot_sks || {}))?.t || course?.sks || 0} P: {JSON.parse(JSON.stringify(rpsData?.bobot_sks || {}))?.p || 0}
                                </td>
                                <td className="border border-black p-1">{rpsData?.semester || course?.semester}</td>
                                <td className="border border-black p-1">{rpsData?.updated_at ? new Date(rpsData.updated_at).toLocaleDateString('id-ID') : '-'}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Otoritas Table */}
                    <table className="w-full border border-black mb-4">
                        <tbody>
                            <tr className="bg-gray-200 print:bg-gray-200">
                                <td className="border border-black p-1 font-bold w-[20%] align-middle" rowSpan="2">
                                    OTORISASI / PENGESAHAN
                                </td>
                                <td className="border border-black p-1 font-bold w-[26%] text-center">Pengembang RPS</td>
                                <td className="border border-black p-1 font-bold w-[26%] text-center">Koordinator Rumpun MK</td>
                                <td className="border border-black p-1 font-bold w-[28%] text-center">Ketua Program Studi</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-4 text-center align-bottom h-24">
                                    <div className="font-bold underline mb-1">{rpsData?.pengembang_rps || rpsData?.dosen?.nama_lengkap || '(...................)'}</div>
                                </td>
                                <td className="border border-black p-4 text-center align-bottom h-24">
                                    <div className="font-bold underline mb-1">{rpsData?.koordinator_rumpun_mk || '(...................)'}</div>
                                </td>
                                <td className="border border-black p-4 text-center align-bottom h-24">
                                    <div className="font-bold underline mb-1">{rpsData?.ketua_prodi || '(...................)'}</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* CPMK / CPL Section */}
                    <table className="w-full border border-black mb-4">
                        <tbody>
                            {/* CPL */}
                            <tr>
                                <td className="border border-black p-1 font-bold align-top bg-gray-100" colSpan="2">
                                    Capaian Pembelajaran Lulusan (CPL)
                                </td>
                            </tr>
                            {rpsData?.cpl?.map((cpl) => (
                                <tr key={cpl.id}>
                                    <td className="border border-black p-1 w-[15%] align-top">{cpl.kode_cpl}</td>
                                    <td className="border border-black p-1 align-top">{cpl.deskripsi}</td>
                                </tr>
                            )) || <tr><td colSpan="2" className="border border-black p-1 text-center">-</td></tr>}

                            {/* CPMK */}
                            <tr>
                                <td className="border border-black p-1 font-bold align-top bg-gray-100" colSpan="2">
                                    Capaian Pembelajaran Mata Kuliah (CPMK)
                                </td>
                            </tr>
                            {rpsData?.cpmk?.map((cpmk) => (
                                <tr key={cpmk.id}>
                                    <td className="border border-black p-1 w-[15%] align-top">{cpmk.kode_cpmk}</td>
                                    <td className="border border-black p-1 align-top">{cpmk.deskripsi}</td>
                                </tr>
                            )) || <tr><td colSpan="2" className="border border-black p-1 text-center">-</td></tr>}
                        </tbody>
                    </table>

                    {/* Deskripsi MK */}
                    <table className="w-full border border-black mb-4">
                        <tbody>
                            <tr>
                                <td className="border border-black p-1 font-bold w-[15%] bg-gray-100 align-top">Deskripsi Singkat MK</td>
                                <td className="border border-black p-1 align-top whitespace-pre-line">{rpsData?.deskripsi_mk || '-'}</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1 font-bold w-[15%] bg-gray-100 align-top">Bahan Kajian / Materi</td>
                                <td className="border border-black p-1 align-top">
                                    {/* Aggregate Materi from Pertemuan if not explicitly stored elsewhere, or add field later */}
                                    {rpsData?.pertemuan?.map(p => p.materi).filter(Boolean).join(', ') || '-'}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1 font-bold w-[15%] bg-gray-100 align-top">Daftar Referensi</td>
                                <td className="border border-black p-1 align-top whitespace-pre-line">{rpsData?.referensi || '-'}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Weekly Plan */}
                    <div className="mb-4">
                        <h3 className="font-bold mb-2">Rencana Pembelajaran Mingguan</h3>
                        <table className="w-full border border-black text-[11px]">
                            <thead className="bg-gray-200 text-center">
                                <tr>
                                    <th className="border border-black p-1 w-8">Mg Ke-</th>
                                    <th className="border border-black p-1 w-[20%]">Kemampuan Akhir Tiap Tahapan Belajar (Sub-CPMK)</th>
                                    <th className="border border-black p-1 w-[15%]">Indikator Penilaian</th>
                                    <th className="border border-black p-1 w-[25%]">Bentuk Pembelajaran, Metode, Penugasan, & Estimasi Waktu</th>
                                    <th className="border border-black p-1">Materi Pembelajaran</th>
                                    <th className="border border-black p-1 w-10">Bobot (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((week) => {
                                    // Find encounter data
                                    const pertemuan = rpsData?.pertemuan?.find(p => p.minggu_ke === week);

                                    if (week === 8) {
                                        return (
                                            <tr key={week} className="bg-gray-100 font-bold text-center">
                                                <td className="border border-black p-1">8</td>
                                                <td className="border border-black p-1" colSpan="5">EVALUASI TENGAH SEMESTER (ETS) / UTS</td>
                                            </tr>
                                        )
                                    }
                                    if (week === 16) {
                                        return (
                                            <tr key={week} className="bg-gray-100 font-bold text-center">
                                                <td className="border border-black p-1">16</td>
                                                <td className="border border-black p-1" colSpan="5">EVALUASI AKHIR SEMESTER (EAS) / UAS</td>
                                            </tr>
                                        )
                                    }

                                    return (
                                        <tr key={week}>
                                            <td className="border border-black p-1 text-center font-bold align-top">{week}</td>
                                            <td className="border border-black p-1 align-top whitespace-pre-line">{pertemuan?.sub_cpmk || '-'}</td>
                                            <td className="border border-black p-1 align-top whitespace-pre-line">{pertemuan?.indikator || '-'}</td>
                                            <td className="border border-black p-1 align-top">
                                                <div className="mb-1">
                                                    <span className="font-semibold">Bentuk:</span> {pertemuan?.bentuk_pembelajaran ? (Array.isArray(pertemuan.bentuk_pembelajaran) ? pertemuan.bentuk_pembelajaran.join(', ') : pertemuan.bentuk_pembelajaran) : '-'}
                                                </div>
                                                <div className="mb-1">
                                                    <span className="font-semibold">Metode:</span> {pertemuan?.metode_pembelajaran ? (Array.isArray(JSON.parse(JSON.stringify(pertemuan.metode_pembelajaran))) ? JSON.parse(JSON.stringify(pertemuan.metode_pembelajaran)).join(', ') : pertemuan.metode_pembelajaran) : '-'}
                                                </div>
                                                <div>
                                                    <span className="font-semibold">Luring/Daring:</span> {pertemuan?.link_daring ? 'Daring' : 'Luring'}
                                                </div>
                                            </td>
                                            <td className="border border-black p-1 align-top whitespace-pre-line">{pertemuan?.materi || '-'}</td>
                                            <td className="border border-black p-1 text-center align-top">{pertemuan?.bobot_penilaian || 0}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    );
}
