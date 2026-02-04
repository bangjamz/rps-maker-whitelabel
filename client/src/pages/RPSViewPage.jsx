import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import { exportRPSToPDF } from '../utils/rpsExport';

export default function RPSViewPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [rpsData, setRpsData] = useState(null);
    const [course, setCourse] = useState(null);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        loadRPSData();
    }, [courseId]);

    const loadRPSData = async () => {
        setLoading(true);
        try {
            const courseResponse = await axios.get(`/courses/${courseId}`);
            setCourse(courseResponse.data);

            const cplResponse = await axios.get('/curriculum/cpl');
            const cpmkResponse = await axios.get('/curriculum/cpmk');

            setRpsData({
                cpl: cplResponse.data.slice(0, 3),
                cpmk: cpmkResponse.data.slice(0, 5),
            });
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
        setEditMode(true);
        alert('Mode edit RPS akan segera tersedia. Fitur dalam pengembangan.');
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
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

                {/* RPS Document - Responsive Container */}
                <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg overflow-hidden">
                    {/* Header with Logo */}
                    <div className="border-b-2 border-gray-900 dark:border-gray-700 p-4 md:p-8">
                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                            <img
                                src="/logo-mahardika.jpg"
                                alt="Logo Institut Mahardika"
                                className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1 text-center">
                                <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1">
                                    RENCANA PEMBELAJARAN SEMESTER
                                </h1>
                                <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                    PROGRAM STUDI S1 INFORMATIKA
                                </h2>
                                <h3 className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-300 mb-1">
                                    FAKULTAS TEKNIK
                                </h3>
                                <h3 className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-300">
                                    INSTITUT TEKNOLOGI DAN KESEHATAN MAHARDIKA
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Tables Container with Horizontal Scroll */}
                    <div className="p-4 md:p-6 space-y-4">

                        {/* Identitas MK */}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] border border-gray-900 dark:border-gray-700 text-sm">
                                <tbody>
                                    <tr>
                                        <td className="border border-gray-900 dark:border-gray-700 p-2 font-semibold bg-gray-100 dark:bg-gray-800 w-40">
                                            Identitas MK
                                        </td>
                                        <td className="border border-gray-900 dark:border-gray-700 p-2 font-semibold w-28">Nama MK</td>
                                        <td className="border border-gray-900 dark:border-gray-700 p-2">{course?.nama_mk || '-'}</td>
                                        <td className="border border-gray-900 dark:border-gray-700 p-2 font-semibold w-28">Kode MK</td>
                                        <td className="border border-gray-900 dark:border-gray-700 p-2 w-28">{course?.kode_mk || '-'}</td>
                                        <td className="border border-gray-900 dark:border-gray-700 p-2 font-semibold w-28">SKS</td>
                                        <td className="border border-gray-900 dark:border-gray-700 p-2 w-20">{course?.sks || 0}</td>
                                        <td className="border border-gray-900 dark:border-gray-700 p-2 font-semibold w-28">Semester</td>
                                        <td className="border border-gray-900 dark:border-gray-700 p-2 w-20">{course?.semester || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-900 dark:border-gray-700 p-2 font-semibold bg-gray-100 dark:bg-gray-800">
                                            Deskripsi MK
                                        </td>
                                        <td colSpan="8" className="border border-gray-900 dark:border-gray-700 p-2">
                                            Mata kuliah ini memberikan pemahaman tentang...
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* CPL */}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px] border border-gray-900 dark:border-gray-700 text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-850">
                                        <th colSpan="2" className="border border-gray-900 dark:border-gray-700 p-2 font-semibold text-left">
                                            Capaian Pembelajaran Lulusan (CPL)
                                        </th>
                                    </tr>
                                    <tr className="bg-gray-50 dark:bg-gray-850">
                                        <th className="border border-gray-900 dark:border-gray-700 p-2 w-32">Kode CPL</th>
                                        <th className="border border-gray-900 dark:border-gray-700 p-2">Deskripsi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rpsData?.cpl?.map((cpl) => (
                                        <tr key={cpl.id}>
                                            <td className="border border-gray-900 dark:border-gray-700 p-2">{cpl.kode_cpl}</td>
                                            <td className="border border-gray-900 dark:border-gray-700 p-2">{cpl.deskripsi}</td>
                                        </tr>
                                    )) || (
                                            <tr>
                                                <td colSpan="2" className="border border-gray-900 dark:border-gray-700 p-4 text-center text-gray-500">
                                                    Tidak ada data CPL
                                                </td>
                                            </tr>
                                        )}
                                </tbody>
                            </table>
                        </div>

                        {/* CPMK */}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px] border border-gray-900 dark:border-gray-700 text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-850">
                                        <th colSpan="3" className="border border-gray-900 dark:border-gray-700 p-2 font-semibold text-left">
                                            Capaian Pembelajaran Mata Kuliah (CPMK)
                                        </th>
                                    </tr>
                                    <tr className="bg-gray-50 dark:bg-gray-850">
                                        <th className="border border-gray-900 dark:border-gray-700 p-2 w-32">Kode CPMK</th>
                                        <th className="border border-gray-900 dark:border-gray-700 p-2">Deskripsi</th>
                                        <th className="border border-gray-900 dark:border-gray-700 p-2 w-40">CPL Terkait</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rpsData?.cpmk?.map((cpmk) => (
                                        <tr key={cpmk.id}>
                                            <td className="border border-gray-900 dark:border-gray-700 p-2">{cpmk.kode_cpmk}</td>
                                            <td className="border border-gray-900 dark:border-gray-700 p-2">{cpmk.deskripsi}</td>
                                            <td className="border border-gray-900 dark:border-gray-700 p-2">-</td>
                                        </tr>
                                    )) || (
                                            <tr>
                                                <td colSpan="3" className="border border-gray-900 dark:border-gray-700 p-4 text-center text-gray-500">
                                                    Tidak ada data CPMK
                                                </td>
                                            </tr>
                                        )}
                                </tbody>
                            </table>
                        </div>

                        {/* Rencana Pembelajaran per Minggu */}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] border border-gray-900 dark:border-gray-700 text-sm">
                                <thead className="bg-gray-100 dark:bg-gray-800">
                                    <tr>
                                        <th className="border border-gray-900 dark:border-gray-700 p-2 w-16">Minggu</th>
                                        <th className="border border-gray-900 dark:border-gray-700 p-2 w-32">CPMK</th>
                                        <th className="border border-gray-900 dark:border-gray-700 p-2">Materi</th>
                                        <th className="border border-gray-900 dark:border-gray-700 p-2 w-32">Metode</th>
                                        <th className="border border-gray-900 dark:border-gray-700 p-2 w-32">Daring/Luring</th>
                                        <th className="border border-gray-900 dark:border-gray-700 p-2 w-20">Bobot</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((week) => (
                                        <tr key={week} className={week === 8 || week === 15 ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}>
                                            <td className="border border-gray-900 dark:border-gray-700 p-2 text-center font-medium">{week}</td>
                                            <td className="border border-gray-900 dark:border-gray-700 p-2">
                                                {week === 8 ? 'UTS' : week === 15 ? 'UAS' : '-'}
                                            </td>
                                            <td className="border border-gray-900 dark:border-gray-700 p-2">
                                                {week === 8 ? 'Ujian Tengah Semester' : week === 15 ? 'Ujian Akhir Semester' : '-'}
                                            </td>
                                            <td className="border border-gray-900 dark:border-gray-700 p-2">-</td>
                                            <td className="border border-gray-900 dark:border-gray-700 p-2">-</td>
                                            <td className="border border-gray-900 dark:border-gray-700 p-2 text-center font-medium">
                                                {week === 8 ? '22%' : week === 15 ? '26%' : week <= 7 ? '4%' : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
