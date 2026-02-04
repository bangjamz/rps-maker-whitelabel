import { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { downloadCSVTemplate, parseCSV, validateAndAutoIncrement, exportToCSV } from '../utils/csvHelper';
import { hasPermission, PERMISSIONS } from '../utils/permissions';

export default function CurriculumPage() {
    const [activeTab, setActiveTab] = useState('cpl');
    const [cplData, setCplData] = useState([]);
    const [cpmkData, setCpmkData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importType, setImportType] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (activeTab === 'cpl') loadCPL();
        if (activeTab === 'cpmk') loadCPMK();
    }, [activeTab]);

    const loadCPL = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/curriculum/cpl');
            setCplData(response.data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal memuat data CPL' });
        } finally {
            setLoading(false);
        }
    };

    const loadCPMK = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/curriculum/cpmk');
            setCpmkData(response.data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal memuat data CPMK' });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadTemplate = (type) => {
        downloadCSVTemplate(type);
        setMessage({ type: 'success', text: `Template ${type.toUpperCase()} berhasil diunduh` });
    };

    const handleFileSelect = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleImport = async () => {
        if (!selectedFile) {
            setMessage({ type: 'error', text: 'Pilih file CSV terlebih dahulu' });
            return;
        }

        try {
            const parsedData = await parseCSV(selectedFile);
            const existingData = importType === 'cpl' ? cplData : cpmkData;
            const { valid, errors } = validateAndAutoIncrement(parsedData, importType, existingData);

            if (errors.length > 0) {
                setMessage({ type: 'error', text: `Validasi gagal: ${errors.join(', ')}` });
                return;
            }

            // TODO: Send validated data to backend
            // await axios.post(`/curriculum/${importType}/bulk`, valid);

            setMessage({ type: 'success', text: `${valid.length} data berhasil divalidasi. Fitur import backend belum tersedia.` });
            setShowImportModal(false);
            setSelectedFile(null);
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        }
    };

    const handleExport = () => {
        const data = activeTab === 'cpl' ? cplData : cpmkData;
        const headers = activeTab === 'cpl'
            ? ['kode_cpl', 'deskripsi', 'keterangan', 'kategori']
            : ['kode_cpmk', 'deskripsi', 'kode_cpl', 'kode_mk'];

        exportToCSV(data, `export_${activeTab}_${Date.now()}.csv`, headers);
        setMessage({ type: 'success', text: 'Data berhasil diexport' });
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Kurikulum</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Kelola CPL, CPMK, dan Sub-CPMK</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="btn btn-secondary"
                        disabled={activeTab === 'cpl' ? cplData.length === 0 : cpmkData.length === 0}
                    >
                        Export CSV
                    </button>
                    {hasPermission(PERMISSIONS.CPL_BULK_IMPORT) && (
                        <button
                            onClick={() => {
                                setImportType(activeTab);
                                setShowImportModal(true);
                            }}
                            className="btn btn-primary"
                        >
                            Import CSV
                        </button>
                    )}
                </div>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-800 mb-6">
                <nav className="flex gap-6">
                    <button
                        onClick={() => setActiveTab('cpl')}
                        className={`pb-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'cpl'
                            ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        CPL (Capaian Pembelajaran Lulusan)
                    </button>
                    <button
                        onClick={() => setActiveTab('cpmk')}
                        className={`pb-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'cpmk'
                            ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        CPMK (Capaian Pembelajaran Mata Kuliah)
                    </button>
                    <button
                        onClick={() => setActiveTab('sub-cpmk')}
                        className={`pb-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'sub-cpmk'
                            ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Sub-CPMK
                    </button>
                </nav>
            </div>

            {/* CPL Tab */}
            {activeTab === 'cpl' && (
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Daftar CPL ({cplData.length})
                        </h2>
                        <button
                            onClick={() => handleDownloadTemplate('cpl')}
                            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                        >
                            Download Template CSV
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : cplData.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400 mb-4">Belum ada data CPL</p>
                            <button className="btn btn-primary">Tambah CPL Pertama</button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kode</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Deskripsi</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kategori</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {cplData.map((cpl) => (
                                        <tr key={cpl.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">{cpl.kode_cpl}</td>
                                            <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{cpl.deskripsi}</td>
                                            <td className="px-4 py-4 text-sm">
                                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                                    {cpl.kategori}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm">
                                                <button className="text-primary-600 dark:text-primary-400 hover:underline mr-3">Edit</button>
                                                <button className="text-red-600 dark:text-red-400 hover:underline">Hapus</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* CPMK Tab */}
            {activeTab === 'cpmk' && (
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Daftar CPMK ({cpmkData.length})
                        </h2>
                        <button
                            onClick={() => handleDownloadTemplate('cpmk')}
                            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                        >
                            Download Template CSV
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : cpmkData.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400 mb-4">Belum ada data CPMK</p>
                            <button className="btn btn-primary">Tambah CPMK Pertama</button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kode</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Deskripsi</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {cpmkData.map((cpmk) => (
                                        <tr key={cpmk.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">{cpmk.kode_cpmk}</td>
                                            <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                {cpmk.deskripsi.length > 100 ? cpmk.deskripsi.substring(0, 100) + '...' : cpmk.deskripsi}
                                            </td>
                                            <td className="px-4 py-4 text-sm">
                                                <button className="text-primary-600 dark:text-primary-400 hover:underline mr-3">Detail</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Sub-CPMK Tab */}
            {activeTab === 'sub-cpmk' && (
                <div className="card p-6">
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">Data Sub-CPMK akan ditampilkan di sini</p>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Import {importType.toUpperCase()} dari CSV
                        </h3>

                        <div className="mb-4">
                            <label className="label">Pilih File CSV</label>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileSelect}
                                className="input"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Belum punya template? <button onClick={() => handleDownloadTemplate(importType)} className="text-primary-600 hover:underline">Download di sini</button>
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleImport}
                                className="btn btn-primary flex-1"
                                disabled={!selectedFile}
                            >
                                Upload & Validasi
                            </button>
                            <button
                                onClick={() => {
                                    setShowImportModal(false);
                                    setSelectedFile(null);
                                }}
                                className="btn btn-secondary"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
