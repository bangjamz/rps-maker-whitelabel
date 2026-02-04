import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Save, Send, ArrowLeft, Plus, Calendar, Trash2 } from 'lucide-react';
import { DataGrid } from 'react-data-grid';
import { debounce } from 'lodash';
import axios from '../lib/axios';
import 'react-data-grid/lib/styles.css';

export default function RPSEditorPage() {
    const { rpsId } = useParams(); // If editing existing RPS
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({
        mata_kuliah_id: '',
        semester: 'Ganjil',
        tahun_ajaran: '2025/2026',
        deskripsi_mk: ''
    });

    // Curriculum tree
    const [curriculumTree, setCurriculumTree] = useState([]);
    const [selectedCPLs, setSelectedCPLs] = useState([]);
    const [selectedCPMKs, setSelectedCPMKs] = useState([]);

    // Pertemuan grid
    const [rows, setRows] = useState([]);
    const [currentRPSId, setCurrentRPSId] = useState(rpsId || null);

    useEffect(() => {
        fetchCourses();
        if (rpsId) {
            fetchExistingRPS();
        } else if (location.state?.courseId) {
            // Pre-select course from navigation state
            setFormData(prev => ({
                ...prev,
                mata_kuliah_id: location.state.courseId,
                semester: location.state.semester || 'Ganjil',
                tahun_ajaran: location.state.tahunAjaran || '2025/2026'
            }));
            // Trigger curriculum fetch for pre-selected course
            // We need to wait for courses to be loaded or just fetch specifically
            // For now, we'll let handleCourseChange logic run if we can, or just set it
        }
    }, [rpsId, location.state]);

    const fetchCourses = async () => {
        try {
            const res = await axios.get('/rps/dosen/my-courses');
            setCourses(res.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchExistingRPS = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/rps/${rpsId}`);
            const rps = res.data;

            setFormData({
                mata_kuliah_id: rps.mata_kuliah_id,
                semester: rps.semester,
                tahun_ajaran: rps.tahun_ajaran,
                deskripsi_mk: rps.deskripsi_mk || ''
            });

            // Load pertemuan
            if (rps.pertemuan && rps.pertemuan.length > 0) {
                setRows(rps.pertemuan.map(p => ({
                    pertemuan_ke: p.pertemuan_ke,
                    tanggal: p.tanggal || '',
                    topik: p.topik || '',
                    sub_cpmk_id: p.sub_cpmk_id || null,
                    metode_pembelajaran: p.metode_pembelajaran || '',
                    materi: p.materi || '',
                    bentuk_evaluasi: p.bentuk_evaluasi || ''
                })));
            }
        } catch (error) {
            console.error('Error fetching RPS:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCourseChange = async (e) => {
        const mata_kuliah_id = parseInt(e.target.value);
        setFormData({ ...formData, mata_kuliah_id });

        if (mata_kuliah_id) {
            // Fetch curriculum tree for this course's prodi
            const course = courses.find(c => c.id === mata_kuliah_id);
            if (course) {
                try {
                    const res = await axios.get(`/rps/curriculum/tree/${course.prodi_id}`);
                    setCurriculumTree(res.data.cpls || []);
                } catch (error) {
                    console.error('Error fetching curriculum tree:', error);
                }
            }
        }
    };

    const toggleCPL = (cplId) => {
        setSelectedCPLs(prev =>
            prev.includes(cplId)
                ? prev.filter(id => id !== cplId)
                : [...prev, cplId]
        );
    };

    const toggleCPMK = (cpmkId) => {
        setSelectedCPMKs(prev =>
            prev.includes(cpmkId)
                ? prev.filter(id => id !== cpmkId)
                : [...prev, cpmkId]
        );
    };

    // Get filtered Sub-CPMKs based on selected CPMKs
    const getAvailableSubCPMKs = () => {
        const subCPMKs = [];
        curriculumTree.forEach(cpl => {
            if (selectedCPLs.includes(cpl.id)) {
                cpl.cpmks?.forEach(cpmk => {
                    if (selectedCPMKs.includes(cpmk.id)) {
                        cpmk.subCPMKs?.forEach(sub => {
                            subCPMKs.push(sub);
                        });
                    }
                });
            }
        });
        return subCPMKs;
    };

    const getSubCPMKById = (id) => {
        return getAvailableSubCPMKs().find(s => s.id === id);
    };

    // Custom editors
    const DateEditor = ({ row, onRowChange }) => (
        <input
            type="date"
            value={row.tanggal || ''}
            onChange={(e) => onRowChange({ ...row, tanggal: e.target.value })}
            className="w-full h-full px-2 border-0 outline-none"
            autoFocus
        />
    );

    const SubCPMKEditor = ({ row, onRowChange }) => {
        const options = getAvailableSubCPMKs();
        return (
            <select
                value={row.sub_cpmk_id || ''}
                onChange={(e) => onRowChange({ ...row, sub_cpmk_id: parseInt(e.target.value) || null })}
                className="w-full h-full px-2 border-0 outline-none"
                autoFocus
            >
                <option value="">Pilih Sub-CPMK...</option>
                {options.map(sub => (
                    <option key={sub.id} value={sub.id}>
                        {sub.kode}: {sub.deskripsi.substring(0, 50)}...
                    </option>
                ))}
            </select>
        );
    };

    // Grid columns
    const columns = [
        {
            key: 'pertemuan_ke',
            name: 'Minggu Ke',
            width: 80,
            frozen: true,
            renderCell: ({ row }) => (
                <div className="font-semibold text-center">{row.pertemuan_ke}</div>
            )
        },
        {
            key: 'tanggal',
            name: 'Tanggal',
            width: 120,
            renderEditCell: DateEditor,
            editable: true
        },
        {
            key: 'topik',
            name: 'Topik / Bahan Kajian',
            width: 200,
            editable: true
        },
        {
            key: 'sub_cpmk_id',
            name: 'Sub-CPMK',
            width: 300,
            renderCell: ({ row }) => {
                const sub = getSubCPMKById(row.sub_cpmk_id);
                return sub ? (
                    <div className="text-sm">
                        <span className="font-semibold">{sub.kode}:</span> {sub.deskripsi.substring(0, 40)}...
                    </div>
                ) : '-';
            },
            renderEditCell: SubCPMKEditor,
            editable: true
        },
        {
            key: 'metode_pembelajaran',
            name: 'Metode Pembelajaran',
            width: 150,
            editable: true
        },
        {
            key: 'materi',
            name: 'Materi Pembelajaran',
            width: 200,
            editable: true
        },
        {
            key: 'bentuk_evaluasi',
            name: 'Bentuk Evaluasi',
            width: 150,
            editable: true
        }
    ];

    const handleRowsChange = (newRows) => {
        setRows(newRows);
        debouncedSave(newRows);
    };

    const debouncedSave = useCallback(
        debounce(async (rowsToSave) => {
            if (!currentRPSId || rowsToSave.length === 0) return;

            try {
                setSaving(true);
                await axios.post(`/rps/dosen/${currentRPSId}/pertemuan/bulk`, {
                    pertemuan: rowsToSave
                });
                console.log('Auto-saved pertemuan');
            } catch (error) {
                console.error('Auto-save failed:', error);
            } finally {
                setSaving(false);
            }
        }, 2000),
        [currentRPSId]
    );

    const handleBulkAdd14Rows = () => {
        const newRows = [];
        for (let i = 1; i <= 14; i++) {
            newRows.push({
                pertemuan_ke: i,
                tanggal: '',
                topik: '',
                sub_cpmk_id: null,
                metode_pembelajaran: '',
                materi: '',
                bentuk_evaluasi: ''
            });
        }
        setRows(newRows);
    };

    const handleAutoFillDates = () => {
        if (rows.length === 0) {
            alert('Mohon tambahkan baris terlebih dahulu');
            return;
        }

        const startDate = prompt('Masukkan tanggal mulai (YYYY-MM-DD):');
        if (!startDate) return;

        const updatedRows = rows.map((row, index) => {
            const date = new Date(startDate);
            date.setDate(date.getDate() + (index * 7));
            return {
                ...row,
                tanggal: date.toISOString().split('T')[0]
            };
        });

        setRows(updatedRows);
    };

    const handleClearAll = () => {
        if (confirm('Hapus semua data pertemuan?')) {
            setRows([]);
        }
    };

    const handleSaveDraft = async () => {
        try {
            setLoading(true);

            if (!currentRPSId) {
                // Create new RPS
                const res = await axios.post('/rps/dosen/create', {
                    ...formData,
                    cpl_ids: selectedCPLs,
                    cpmk_ids: selectedCPMKs
                });
                setCurrentRPSId(res.data.rps.id);
                alert('RPS created as Draft');
            } else {
                // Update existing
                await axios.put(`/rps/dosen/${currentRPSId}/update`, {
                    deskripsi_mk: formData.deskripsi_mk,
                    cpl_ids: selectedCPLs,
                    cpmk_ids: selectedCPMKs
                });
                alert('RPS updated');
            }

            // Save pertemuan
            if (rows.length > 0) {
                await axios.post(`/rps/dosen/${currentRPSId}/pertemuan/bulk`, {
                    pertemuan: rows
                });
            }

            navigate('/dosen/rps');
        } catch (error) {
            console.error('Error saving RPS:', error);
            alert('Failed to save RPS');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitForApproval = async () => {
        try {
            setLoading(true);
            await handleSaveDraft();
            await axios.put(`/rps/${currentRPSId}/submit`);
            alert('RPS berhasil disubmit untuk approval!');
            navigate('/dosen/rps');
        } catch (error) {
            console.error('Error submitting RPS:', error);
            alert('Gagal mensubmit RPS');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !currentRPSId) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <button
                    onClick={() => navigate('/dosen/rps')}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to RPS List
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                    {rpsId ? 'Edit RPS' : 'Buat RPS Baru'}
                </h1>
                {saving && <p className="text-sm text-gray-500 mt-1">Menyimpan otomatis...</p>}
            </div>

            {/* Section 1: Basic Information */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4">1. Informasi Dasar</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Mata Kuliah *</label>
                        <select
                            value={formData.mata_kuliah_id}
                            onChange={handleCourseChange}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        >
                            <option value="">Pilih Mata Kuliah...</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.kode_mk} - {course.nama_mk}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Semester *</label>
                            <select
                                value={formData.semester}
                                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                <option value="Ganjil">Ganjil</option>
                                <option value="Genap">Genap</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Tahun Akademik *</label>
                            <input
                                type="text"
                                value={formData.tahun_ajaran}
                                onChange={(e) => setFormData({ ...formData, tahun_ajaran: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="2025/2026"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Deskripsi Mata Kuliah</label>
                        <textarea
                            value={formData.deskripsi_mk}
                            onChange={(e) => setFormData({ ...formData, deskripsi_mk: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                            rows="4"
                            placeholder="Masukkan deskripsi mata kuliah..."
                        ></textarea>
                    </div>
                </div>
            </div>

            {/* Section 2: CPL & CPMK Selection */}
            {formData.mata_kuliah_id && curriculumTree.length > 0 && (
                <div className="card p-6">
                    <h2 className="text-lg font-semibold mb-4">2. Pemetaan CPL & CPMK</h2>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {curriculumTree.map(cpl => (
                            <div key={cpl.id} className="border rounded-lg p-3">
                                <label className="flex items-start gap-2 font-semibold cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedCPLs.includes(cpl.id)}
                                        onChange={() => toggleCPL(cpl.id)}
                                        className="mt-1"
                                    />
                                    <span>{cpl.kode}: {cpl.deskripsi}</span>
                                </label>

                                {selectedCPLs.includes(cpl.id) && cpl.cpmks && (
                                    <div className="ml-6 mt-2 space-y-2">
                                        {cpl.cpmks.map(cpmk => (
                                            <label key={cpmk.id} className="flex items-start gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCPMKs.includes(cpmk.id)}
                                                    onChange={() => toggleCPMK(cpmk.id)}
                                                    className="mt-1"
                                                />
                                                <span className="text-sm">{cpmk.kode}: {cpmk.deskripsi}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Section 3: Pertemuan Grid */}
            {selectedCPMKs.length > 0 && (
                <div className="card p-6">
                    <h2 className="text-lg font-semibold mb-4">3. Rencana Pembelajaran Mingguan</h2>

                    <div className="flex gap-3 mb-4">
                        <button onClick={handleBulkAdd14Rows} className="btn btn-secondary flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Tambah 14 Baris
                        </button>

                        <button onClick={handleAutoFillDates} className="btn btn-secondary flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Isi Tanggal Otomatis
                        </button>

                        <button onClick={handleClearAll} className="btn btn-secondary text-red-600 flex items-center gap-2">
                            <Trash2 className="w-5 h-5" />
                            Hapus Semua
                        </button>
                    </div>

                    {rows.length > 0 ? (
                        <DataGrid
                            columns={columns}
                            rows={rows}
                            onRowsChange={handleRowsChange}
                            rowKeyGetter={(row) => row.pertemuan_ke}
                            className="rdg-light border rounded"
                            style={{ height: 500 }}
                        />
                    ) : (
                        <div className="border-2 border-dashed rounded-lg p-12 text-center text-gray-500">
                            Belum ada data pertemuan. Klik "Tambah 14 Baris" untuk memulai.
                        </div>
                    )}
                </div>
            )}

            {/* Section 4: Save & Submit */}
            <div className="card p-6 flex justify-between items-center">
                <button onClick={handleSaveDraft} disabled={loading} className="btn btn-secondary flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    Simpan Draft
                </button>

                <button
                    onClick={handleSubmitForApproval}
                    disabled={loading || !formData.mata_kuliah_id || rows.length === 0}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Send className="w-5 h-5" />
                    Submit untuk Approval
                </button>
            </div>
        </div>
    );
}
