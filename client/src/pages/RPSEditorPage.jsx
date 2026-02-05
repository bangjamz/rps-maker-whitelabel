import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2, ChevronDown, ChevronRight, BookOpen, Users, Monitor, X, Cloud, CloudOff } from 'lucide-react';
import { debounce } from 'lodash';
import axios from '../lib/axios';
import useAuthStore from '../store/useAuthStore';
import useAcademicStore from '../store/useAcademicStore';

export default function RPSEditorPage() {
    const { rpsId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();
    const { activeSemester, activeYear } = useAcademicStore();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('identitas');
    const [lastSaved, setLastSaved] = useState(null);

    // --- State: Identitas MK ---
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({
        mata_kuliah_id: '',
        semester: activeSemester || 'Ganjil',
        tahun_ajaran: activeYear || '2025/2026',
        revisi: 0,
        deskripsi_mk: '',
        kode_mk: '',
        nama_mk: '',
        rumpun_mk: '',
        sks: '',
        pengembang_rps: user?.nama_lengkap || '',
        ketua_prodi: ''
    });

    // Rumpun MK options with add-new capability
    const [rumpunOptions, setRumpunOptions] = useState([
        'Pemrograman', 'Basis Data', 'Jaringan Komputer', 'Kecerdasan Buatan',
        'Sistem Informasi', 'Multimedia', 'Keamanan Siber', 'Matematika', 'Umum'
    ]);
    const [showNewRumpun, setShowNewRumpun] = useState(false);
    const [newRumpunValue, setNewRumpunValue] = useState('');

    // --- State: Capaian Pembelajaran ---
    const [availableCPLs, setAvailableCPLs] = useState([]);
    const [selectedCPLs, setSelectedCPLs] = useState([]);
    const [selectedCPMKs, setSelectedCPMKs] = useState([]); // Array of IDs linked to this RPS
    const [activeCpl, setActiveCpl] = useState(null); // ID for expanding UI to add new CPMK
    const [newCpmk, setNewCpmk] = useState({ kode: '', deskripsi: '' });
    const [newSubCpmk, setNewSubCpmk] = useState({ kode: '', deskripsi: '' });

    // --- State: Weekly Schedule ---
    const [rows, setRows] = useState([]);
    const [currentRPSId, setCurrentRPSId] = useState(rpsId || null);

    // --- Local Storage Draft Logic ---
    const DRAFT_KEY = `rps_draft_${user?.id}_${rpsId || 'new'}`;

    // Load draft on mount (only if creating new or if user explicitly wants to check drafts)
    useEffect(() => {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft && !rpsId) {
            // Only auto-load for new RPS if a draft exists
            // For existing RPS, we prioritize server data, but maybe show a banner?
            try {
                const parsed = JSON.parse(savedDraft);
                const confirmLoad = window.confirm('Ditemukan draft RPS yang belum disimpan. Apakah Anda ingin melanjutkannya?');
                if (confirmLoad) {
                    setFormData(parsed.formData);
                    // rows need recreation of logic/ids if needed, but simple set works
                    setRows(parsed.rows || []);
                    setSelectedCPLs(parsed.selectedCPLs || []);
                    setSelectedCPMKs(parsed.selectedCPMKs || []);
                    setDefinedSubCPMKs(parsed.definedSubCPMKs || []);
                    console.log('Draft loaded');
                }
            } catch (e) {
                console.error('Failed to parse draft', e);
            }
        }
    }, [rpsId, user?.id]);

    // Save draft periodically
    useEffect(() => {
        const saveToLocal = debounce(() => {
            if (formData.mata_kuliah_id) { // Only save if at least MK is selected
                const draftData = {
                    formData,
                    rows,
                    selectedCPLs,
                    selectedCPMKs,
                    definedSubCPMKs,
                    updatedAt: new Date().toISOString()
                };
                localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
                setLastSaved(new Date());
            }
        }, 2000);

        saveToLocal();
        return () => saveToLocal.cancel();
    }, [formData, rows, selectedCPLs, selectedCPMKs, definedSubCPMKs, DRAFT_KEY]);

    // --- Data Fetching & Effects ---
    useEffect(() => {
        fetchCourses();
    }, []);

    // Update semester when header changes
    useEffect(() => {
        // Only update if not loaded from params/draft override
        if (!rpsId && activeSemester && !formData.mata_kuliah_id) {
            setFormData(prev => ({ ...prev, semester: activeSemester }));
        }
        if (!rpsId && activeYear && !formData.mata_kuliah_id) {
            setFormData(prev => ({ ...prev, tahun_ajaran: activeYear }));
        }
    }, [activeSemester, activeYear, rpsId]);

    useEffect(() => {
        if (rpsId) {
            fetchExistingRPS();
        } else if (location.state?.courseId) {
            handleCoursePreselect(location.state);
        } else if (rows.length === 0) {
            initializeRows(14);
        }
    }, [rpsId, location.state]);

    // Fetch CPLs when course is selected
    useEffect(() => {
        if (formData.mata_kuliah_id) {
            const course = courses.find(c => c.id === parseInt(formData.mata_kuliah_id));
            if (course?.prodi_id) {
                fetchCPLs(course.prodi_id);
            }
        }
    }, [formData.mata_kuliah_id, courses]);

    // --- Data Fetching ---
    const fetchCourses = async () => {
        try {
            const res = await axios.get('/rps/dosen/my-courses');
            setCourses(res.data || []);
        } catch (error) {
            try {
                const fallback = await axios.get('/courses');
                setCourses(fallback.data || []);
            } catch (e) {
                console.error('Failed to fetch courses:', e);
            }
        }
    };

    const fetchCPLs = async (prodiId, courseId = null) => {
        try {
            const query = courseId ? `?courseId=${courseId}` : '';
            const res = await axios.get(`/rps/curriculum/tree/${prodiId}${query}`);
            setAvailableCPLs(res.data.cpls || []);
        } catch (error) {
            console.error('Error fetching CPLs:', error);
        }
    };

    const handleCoursePreselect = (state) => {
        setFormData(prev => ({
            ...prev,
            mata_kuliah_id: state.courseId,
            kode_mk: state.kode_mk || '',
            nama_mk: state.nama_mk || '',
            sks: state.sks || ''
        }));
        if (state.prodi_id) {
            fetchCPLs(state.prodi_id, state.courseId);
        }
        if (rows.length === 0) initializeRows(14);
    };

    const handleCourseChange = (e) => {
        const courseId = parseInt(e.target.value);
        const course = courses.find(c => c.id === courseId);
        if (course) {
            setFormData(prev => ({
                ...prev,
                mata_kuliah_id: courseId,
                kode_mk: course.kode_mk,
                nama_mk: course.nama_mk,
                sks: course.sks
            }));
            if (course.prodi_id) {
                fetchCPLs(course.prodi_id, courseId);
            }
            if (rows.length === 0) initializeRows(14);
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
                revisi: rps.revisi || 0,
                deskripsi_mk: rps.deskripsi_mk || '',
                kode_mk: rps.MataKuliah?.kode_mk || '',
                nama_mk: rps.MataKuliah?.nama_mk || '',
                rumpun_mk: rps.rumpun_mk || '',
                sks: rps.MataKuliah?.sks || '',
                pengembang_rps: rps.pengembang_rps || user?.nama_lengkap || '',
                ketua_prodi: rps.ketua_prodi || ''
            });
            if (rps.sub_cpmk_list) {
                setDefinedSubCPMKs(rps.sub_cpmk_list);
            }
            setCurrentRPSId(rps.id);
            if (rps.pertemuan && rps.pertemuan.length > 0) {
                setRows(rps.pertemuan.map(p => ({
                    id: p.id || Date.now() + Math.random(),
                    minggu_ke: p.minggu_ke,
                    cpmk_id: p.cpmk_id || '',
                    sub_cpmk_id: p.sub_cpmk_id || '', // Ensure ID is loaded
                    indikator: p.indikator || '',
                    teknik_penilaian: Array.isArray(p.teknik_penilaian) ? p.teknik_penilaian : (p.teknik_penilaian ? [p.teknik_penilaian] : []),
                    kriteria_penilaian: p.kriteria_penilaian || '',
                    materi: p.materi || '',
                    metode_pembelajaran: Array.isArray(p.metode_pembelajaran) ? p.metode_pembelajaran : (p.metode_pembelajaran ? [p.metode_pembelajaran] : []),
                    bentuk_pembelajaran: Array.isArray(p.bentuk_pembelajaran) ? p.bentuk_pembelajaran : [],
                    link_daring: p.link_daring || '',
                    bobot_penilaian: p.bobot_penilaian || '',
                    is_uts: p.minggu_ke === 8,
                    is_uas: p.minggu_ke === 15
                })));
            } else {
                initializeRows(14);
            }
        } catch (error) {
            console.error('Error fetching RPS:', error);
            alert('Gagal memuat data RPS');
        } finally {
            setLoading(false);
        }
    };

    const initializeRows = (count = 14) => {
        const utsWeek = Math.ceil(count / 2);
        const uasWeek = count;
        const newRows = Array.from({ length: count }, (_, i) => ({
            id: Date.now() + i,
            minggu_ke: i + 1,
            cpmk_id: '',
            sub_cpmk_id: '',
            indikator: '',
            teknik_penilaian: [],
            kriteria_penilaian: '',
            materi: i + 1 === utsWeek ? 'Ujian Tengah Semester' : i + 1 === uasWeek ? 'Ujian Akhir Semester' : '',
            metode_pembelajaran: [],
            bentuk_pembelajaran: [],
            link_daring: '',
            bobot_penilaian: i + 1 === utsWeek ? 22 : i + 1 === uasWeek ? 26 : '',
            is_uts: i + 1 === utsWeek,
            is_uas: i + 1 === uasWeek
        }));
        setRows(newRows);
    };

    // --- Rumpun Management ---
    const addNewRumpun = () => {
        if (newRumpunValue.trim() && !rumpunOptions.includes(newRumpunValue.trim())) {
            setRumpunOptions([...rumpunOptions, newRumpunValue.trim()]);
            setFormData({ ...formData, rumpun_mk: newRumpunValue.trim() });
        }
        setNewRumpunValue('');
        setShowNewRumpun(false);
    };

    // --- CPL/CPMK Management ---
    const toggleCPL = (cplId) => {
        setSelectedCPLs(prev =>
            prev.includes(cplId) ? prev.filter(id => id !== cplId) : [...prev, cplId]
        );
    };

    const toggleCPMK = (id) => {
        if (selectedCPMKs.includes(id)) {
            setSelectedCPMKs(prev => prev.filter(c => c !== id));
        } else {
            setSelectedCPMKs(prev => [...prev, id]);
        }
    };

    const handleAddCPMK = async (cplId, cplKode) => {
        try {
            if (!formData.mata_kuliah_id) return alert('Pilih mata kuliah terlebih dahulu');

            await axios.post('/rps/curriculum/cpmk', {
                mata_kuliah_id: formData.mata_kuliah_id,
                cpl_id: cplId,
                kode_cpmk: newCpmk.kode || `${cplKode}-01`,
                deskripsi: newCpmk.deskripsi
            });

            // Refresh tree
            const course = courses.find(c => c.id === parseInt(formData.mata_kuliah_id));
            if (course) fetchCPLs(course.prodi_id, course.id);

            // Reset form
            setNewCpmk({ kode: '', deskripsi: '' });
            setActiveCpl(null);
        } catch (error) {
            console.error('Failed to add CPMK:', error);
            alert('Gagal menambah CPMK');
        }
    };

    const handleAddSubCPMK = async (cpmkId, cpmkKode) => {
        try {
            await axios.post('/rps/curriculum/sub-cpmk', {
                cpmk_id: cpmkId,
                kode: newSubCpmk.kode || `${cpmkKode}.1`,
                deskripsi: newSubCpmk.deskripsi
            });

            // Refresh tree
            const course = courses.find(c => c.id === parseInt(formData.mata_kuliah_id));
            if (course) fetchCPLs(course.prodi_id, course.id);

            setNewSubCpmk({ kode: '', deskripsi: '' });
        } catch (error) {
            console.error('Failed to add Sub-CPMK:', error);
            alert('Gagal menambah Sub-CPMK');
        }
    };

    // --- Row Management ---
    const updateRow = (index, field, value) => {
        const newRows = [...rows];
        newRows[index] = { ...newRows[index], [field]: value };
        setRows(newRows);
    };

    const toggleMultiSelect = (index, field, value, maxItems = 3) => {
        const newRows = [...rows];
        const current = newRows[index][field] || [];
        if (current.includes(value)) {
            newRows[index][field] = current.filter(v => v !== value);
        } else if (current.length < maxItems) {
            newRows[index][field] = [...current, value];
        }
        setRows(newRows);
    };

    const toggleBentukPembelajaran = (index, value) => {
        const newRows = [...rows];
        const current = newRows[index].bentuk_pembelajaran || [];
        newRows[index].bentuk_pembelajaran = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        if (value === 'daring' && !newRows[index].bentuk_pembelajaran.includes('daring')) {
            newRows[index].link_daring = '';
        }
        setRows(newRows);
    };

    const addWeek = () => {
        const newMinggu = rows.length + 1;
        setRows([...rows, {
            id: Date.now(),
            minggu_ke: newMinggu,
            cpmk_id: '',
            sub_cpmk_id: '',
            indikator: '',
            teknik_penilaian: [],
            kriteria_penilaian: '',
            materi: '',
            metode_pembelajaran: [],
            bentuk_pembelajaran: [],
            link_daring: '',
            bobot_penilaian: '',
            is_uts: false,
            is_uas: false
        }]);
    };

    const removeWeek = (index) => {
        if (rows.length <= 10) {
            alert('Minimal 10 pertemuan');
            return;
        }
        const row = rows[index];
        if (row.is_uts || row.is_uas) {
            alert('Tidak bisa menghapus minggu UTS/UAS');
            return;
        }
        const newRows = rows.filter((_, i) => i !== index).map((r, i) => ({ ...r, minggu_ke: i + 1 }));
        setRows(newRows);
    };

    const setAsUTS = (index) => {
        const newRows = rows.map((r, i) => ({ ...r, is_uts: i === index, materi: i === index ? 'Ujian Tengah Semester' : (r.is_uts ? '' : r.materi) }));
        setRows(newRows);
    };

    const setAsUAS = (index) => {
        const newRows = rows.map((r, i) => ({ ...r, is_uas: i === index, materi: i === index ? 'Ujian Akhir Semester' : (r.is_uas ? '' : r.materi) }));
        setRows(newRows);
    };

    // --- Save ---
    // --- Save ---
    const handleSaveDraft = () => {
        if (!formData.mata_kuliah_id) {
            alert('Pilih Mata Kuliah terlebih dahulu');
            return;
        }
        const draftData = {
            formData,
            rows,
            selectedCPLs,
            selectedCPMKs,
            definedSubCPMKs,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
        setLastSaved(new Date());
        alert('Draft berhasil disimpan di browser (Local Storage)');
    };

    const handleSaveToServer = async () => {
        if (!formData.mata_kuliah_id) {
            alert('Pilih Mata Kuliah terlebih dahulu');
            return;
        }
        try {
            setLoading(true);

            // Payload builder
            const payload = {
                ...formData,
                cpl_ids: selectedCPLs,
                cpmk_ids: selectedCPMKs // Make sure to send CPMKs too if needed by backend logic (though backend might not use it directly yet)
            };

            let saveId = currentRPSId;

            // If editing existing RPS, update instead of create
            if (currentRPSId) {
                await axios.put(`/rps/dosen/${currentRPSId}/update`, {
                    deskripsi_mk: formData.deskripsi_mk,
                    rumpun_mk: formData.rumpun_mk,
                    pengembang_rps: formData.pengembang_rps,
                    koordinator_rumpun_mk: formData.koordinator_rumpun_mk,
                    ketua_prodi: formData.ketua_prodi,
                    cpl_ids: selectedCPLs,
                    sub_cpmk_list: definedSubCPMKs // Add Sub-CPMK definitions
                });
                // Note: CPMK links normally saved via bulk or separate endpoint? 
                // Currently `updateRPS` controller only takes cpl_ids. 
                // We'll rely on `bulkUpsertPertemuan` to link specific Sub-CPMKs which implies CPMKs.
            } else {
                // Create new RPS
                const res = await axios.post('/rps/dosen/create', {
                    mata_kuliah_id: formData.mata_kuliah_id,
                    semester: formData.semester,
                    tahun_ajaran: formData.tahun_ajaran,
                    deskripsi_mk: formData.deskripsi_mk,
                    rumpun_mk: formData.rumpun_mk,
                    pengembang_rps: formData.pengembang_rps,
                    koordinator_rumpun_mk: formData.koordinator_rumpun_mk,
                    ketua_prodi: formData.ketua_prodi,
                    cpl_ids: selectedCPLs,
                    sub_cpmk_list: definedSubCPMKs // Add Sub-CPMK definitions
                });
                saveId = res.data.rps?.id || res.data.id;
                setCurrentRPSId(saveId);
            }

            if (rows.length > 0 && saveId) {
                await axios.post(`/rps/dosen/${saveId}/pertemuan/bulk`, { pertemuan: rows });
            }

            // Clear draft
            localStorage.removeItem(DRAFT_KEY);

            alert('RPS berhasil disimpan ke server');

            if (!currentRPSId) {
                const basePath = window.location.pathname.includes('/kaprodi/') ? '/kaprodi' : '/dosen';
                navigate(`${basePath}/rps/${saveId}/edit`, { replace: true });
            }
        } catch (error) {
            console.error('Save failed:', error);
            const msg = error.response?.data?.message || error.message;
            alert('Gagal menyimpan RPS: ' + msg);
        } finally {
            setLoading(false);
        }
    };

    // Filter courses by semester
    const filteredCourses = courses.filter(c => {
        if (!activeSemester) return true;
        const isGanjil = c.semester % 2 !== 0;
        if (activeSemester === 'Ganjil') return isGanjil || !c.semester;
        if (activeSemester === 'Genap') return !isGanjil || !c.semester;
        return true;
    });

    // Calculate total bobot
    const totalBobot = rows.reduce((sum, row) => sum + (parseFloat(row.bobot_penilaian) || 0), 0);

    // Section tabs
    const sections = [
        { id: 'identitas', label: 'Identitas MK', icon: BookOpen },
        { id: 'cpl', label: 'CPL & CPMK', icon: ChevronRight },
        { id: 'mingguan', label: 'Rencana Mingguan', icon: Monitor },
        { id: 'tambahan', label: 'Info Tambahan', icon: Users }
    ];

    if (loading && !formData.mata_kuliah_id) {
        return <div className="p-6 text-center">Memuat...</div>;
    }

    return (
        <div className="space-y-4 pb-24">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        {currentRPSId ? 'Edit RPS' : 'Buat RPS Baru'}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {formData.nama_mk ? `${formData.kode_mk} - ${formData.nama_mk}` : 'Pilih Mata Kuliah'}
                    </p>
                </div>
                <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
                </button>
            </div>

            {/* Floating Footer for Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg z-50">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        {lastSaved ? (
                            <span className="flex items-center gap-1 text-green-600">
                                <Cloud size={14} /> Tersimpan otomatis di browser {lastSaved.toLocaleTimeString()}
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-gray-400">
                                <CloudOff size={14} /> Belum tersimpan di browser
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => navigate(-1)} className="btn btn-ghost">Batal</button>
                        <button
                            onClick={handleSaveToServer}
                            disabled={loading || !formData.mata_kuliah_id}
                            className="btn btn-primary"
                        >
                            <Save size={18} className="mr-2" />
                            {loading ? 'Menyimpan...' : 'Simpan ke Server'}
                        </button>
                    </div>
                </div>
            </div>
            {/* Section Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex-1 min-w-[120px] px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${activeSection === section.id
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                        >
                            <section.icon size={16} />
                            {section.label}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {/* Section: Identitas MK */}
                    {activeSection === 'identitas' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label">Mata Kuliah</label>
                                    <select
                                        value={formData.mata_kuliah_id}
                                        onChange={handleCourseChange}
                                        className="input w-full"
                                        disabled={!!rpsId}
                                    >
                                        <option value="">Pilih MK...</option>
                                        {filteredCourses.map(c => (
                                            <option key={c.id} value={c.id}>{c.kode_mk} - {c.nama_mk}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Menampilkan MK semester {activeSemester || 'semua'}
                                    </p>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="label">Kode MK</label>
                                        <input type="text" value={formData.kode_mk} disabled className="input bg-gray-100 dark:bg-gray-700 w-full" />
                                    </div>
                                    <div>
                                        <label className="label">SKS</label>
                                        <input type="text" value={formData.sks} disabled className="input bg-gray-100 dark:bg-gray-700 w-full" />
                                    </div>
                                    <div>
                                        <label className="label">Revisi</label>
                                        <input type="number" value={formData.revisi} onChange={e => setFormData({ ...formData, revisi: e.target.value })} className="input w-full" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label">Rumpun MK</label>
                                    {!showNewRumpun ? (
                                        <div className="flex gap-2">
                                            <select value={formData.rumpun_mk} onChange={e => setFormData({ ...formData, rumpun_mk: e.target.value })} className="input flex-1">
                                                <option value="">Pilih Rumpun...</option>
                                                {rumpunOptions.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                            <button onClick={() => setShowNewRumpun(true)} className="btn btn-outline btn-sm" title="Tambah Rumpun Baru">
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input type="text" value={newRumpunValue} onChange={e => setNewRumpunValue(e.target.value)} className="input flex-1" placeholder="Nama rumpun baru..." autoFocus />
                                            <button onClick={addNewRumpun} className="btn btn-primary btn-sm">Tambah</button>
                                            <button onClick={() => { setShowNewRumpun(false); setNewRumpunValue(''); }} className="btn btn-ghost btn-sm"><X size={16} /></button>
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Semester</label>
                                        <select value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })} className="input w-full">
                                            <option value="Ganjil">Ganjil</option>
                                            <option value="Genap">Genap</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Tahun Ajaran</label>
                                        <input type="text" value={formData.tahun_ajaran} onChange={e => setFormData({ ...formData, tahun_ajaran: e.target.value })} className="input w-full" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label">Pengembang RPS</label>
                                    <input type="text" value={formData.pengembang_rps} onChange={e => setFormData({ ...formData, pengembang_rps: e.target.value })} className="input w-full" />
                                </div>
                                <div>
                                    <label className="label">Ketua Program Studi</label>
                                    <input type="text" value={formData.ketua_prodi} onChange={e => setFormData({ ...formData, ketua_prodi: e.target.value })} className="input w-full" />
                                </div>
                            </div>
                            <div>
                                <label className="label">Deskripsi Mata Kuliah</label>
                                <textarea value={formData.deskripsi_mk} onChange={e => setFormData({ ...formData, deskripsi_mk: e.target.value })} className="input w-full" rows="3" placeholder="Deskripsi singkat mengenai mata kuliah..." />
                            </div>
                        </div>
                    )}

                    {/* Section: CPL & CPMK */}
                    {activeSection === 'cpl' && (
                        <div className="space-y-8">

                            {/* 1. CPL Table */}
                            <div>
                                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">1. Capaian Pembelajaran Lulusan (CPL)</h3>
                                <p className="text-sm text-gray-500 mb-3">Pilih CPL yang dibebankan pada mata kuliah ini.</p>

                                <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Kode CPL</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-20">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {selectedCPLs.map(id => {
                                                const cpl = availableCPLs.find(c => c.id === id);
                                                if (!cpl) return null;
                                                return (
                                                    <tr key={id}>
                                                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white align-top">{cpl.kode}</td>
                                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 align-top">{cpl.deskripsi}</td>
                                                        <td className="px-4 py-3 text-center align-top">
                                                            <button
                                                                onClick={() => toggleCPL(id)}
                                                                className="text-red-500 hover:text-red-700"
                                                                title="Hapus"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {selectedCPLs.length === 0 && (
                                                <tr>
                                                    <td colSpan="3" className="px-4 py-8 text-center text-gray-400 italic">Belum ada CPL yang dipilih</td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot className="bg-gray-50 dark:bg-gray-800/50">
                                            <tr>
                                                <td colSpan="3" className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <select
                                                            className="input input-sm flex-1 max-w-md"
                                                            onChange={(e) => {
                                                                if (e.target.value) {
                                                                    toggleCPL(parseInt(e.target.value));
                                                                    e.target.value = "";
                                                                }
                                                            }}
                                                        >
                                                            <option value="">+ Tambah CPL...</option>
                                                            {availableCPLs
                                                                .filter(c => !selectedCPLs.includes(c.id))
                                                                .map(c => (
                                                                    <option key={c.id} value={c.id}>{c.kode} - {c.deskripsi.substring(0, 50)}...</option>
                                                                ))}
                                                        </select>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* 2. CPMK Table */}
                            <div>
                                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">2. Capaian Pembelajaran Mata Kuliah (CPMK)</h3>
                                <p className="text-sm text-gray-500 mb-3">Pilih CPMK turunan dari CPL terpilih. Deskripsi dan CPL Induk otomatis terisi.</p>

                                <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Kode CPMK</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-48">CPL Yang Didukung</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-20">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {selectedCPMKs.map(id => {
                                                // Find CPMK across all CPLs
                                                const parentCPL = availableCPLs.find(c => c.cpmks?.some(mk => mk.id === id));
                                                const cpmk = parentCPL?.cpmks?.find(mk => mk.id === id);

                                                if (!cpmk) return null;

                                                return (
                                                    <tr key={id}>
                                                        <td className="px-4 py-3 font-semibold text-blue-600 dark:text-blue-400 align-top">
                                                            {cpmk.kode}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 align-top">
                                                            {cpmk.deskripsi}
                                                        </td>
                                                        <td className="px-4 py-3 align-top text-xs">
                                                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                                                                {parentCPL?.kode}
                                                            </span>
                                                            <div className="text-[10px] text-gray-400 mt-1 leading-tight hidden xl:block">
                                                                {parentCPL?.deskripsi}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center align-top">
                                                            <button
                                                                onClick={() => toggleCPMK(id)}
                                                                className="text-red-500 hover:text-red-700"
                                                                title="Hapus"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {selectedCPMKs.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="px-4 py-8 text-center text-gray-400 italic">Belum ada CPMK yang dipilih</td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot className="bg-gray-50 dark:bg-gray-800/50">
                                            <tr>
                                                <td colSpan="4" className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <select
                                                            className="input input-sm flex-1 max-w-md"
                                                            onChange={(e) => {
                                                                if (e.target.value) {
                                                                    toggleCPMK(parseInt(e.target.value));
                                                                    e.target.value = "";
                                                                }
                                                            }}
                                                            disabled={selectedCPLs.length === 0}
                                                        >
                                                            <option value="">{selectedCPLs.length === 0 ? 'Pilih CPL Terlebih Dahulu' : '+ Tambah CPMK...'}</option>
                                                            {availableCPLs
                                                                .filter(c => selectedCPLs.includes(c.id)) // Only CPMKs from selected CPLs
                                                                .flatMap(c => c.cpmks || [])
                                                                .filter(mk => !selectedCPMKs.includes(mk.id))
                                                                .map(mk => (
                                                                    <option key={mk.id} value={mk.id}>{mk.kode} - {mk.deskripsi.substring(0, 50)}...</option>
                                                                ))
                                                            }
                                                        </select>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                {/* 3. Sub-CPMK Table */}
                                <div>
                                    <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">3. Sub-CPMK (Indikator Kinerja)</h3>
                                    <p className="text-sm text-gray-500 mb-3">Definisikan Sub-CPMK yang lebih spesifik. Ini yang akan dipilih di Rencana Mingguan.</p>

                                    <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Kode</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-48">CPMK Induk</th>
                                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-20">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {definedSubCPMKs.map(sub => {
                                                    // Find parent CPMK details
                                                    const parentCPL = availableCPLs.find(c => c.cpmks?.some(mk => mk.id === parseInt(sub.cpmk_id)));
                                                    const parentCPMK = parentCPL?.cpmks?.find(mk => mk.id === parseInt(sub.cpmk_id));

                                                    return (
                                                        <tr key={sub.id}>
                                                            <td className="px-4 py-3 font-semibold text-purple-600 dark:text-purple-400 align-top">
                                                                {sub.kode}
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300 align-top">
                                                                {sub.deskripsi}
                                                            </td>
                                                            <td className="px-4 py-3 align-top text-xs">
                                                                {parentCPMK ? (
                                                                    <>
                                                                        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded font-mono block w-fit mb-1">
                                                                            {parentCPMK.kode}
                                                                        </span>
                                                                        <div className="text-[10px] text-gray-400 leading-tight hidden xl:block">
                                                                            {parentCPMK.deskripsi.substring(0, 50)}...
                                                                        </div>
                                                                    </>
                                                                ) : <span className="text-red-500 italic">Induk terhapus</span>}
                                                            </td>
                                                            <td className="px-4 py-3 text-center align-top">
                                                                <button
                                                                    onClick={() => handleDeleteSubCPMK(sub.id)}
                                                                    className="text-red-500 hover:text-red-700"
                                                                    title="Hapus"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {definedSubCPMKs.length === 0 && (
                                                    <tr>
                                                        <td colSpan="4" className="px-4 py-8 text-center text-gray-400 italic">Belum ada Sub-CPMK yang didefinisikan</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                            <tfoot className="bg-gray-50 dark:bg-gray-800/50">
                                                <tr>
                                                    <td className="px-4 py-3 align-top">
                                                        <input
                                                            type="text"
                                                            placeholder="Kode (ex: L1)"
                                                            className="input input-sm w-full"
                                                            value={newSubCpmk.kode}
                                                            onChange={e => setNewSubCpmk({ ...newSubCpmk, kode: e.target.value })}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        <textarea
                                                            placeholder="Deskripsi Sub-CPMK..."
                                                            className="input input-sm w-full resize-none h-20 leading-tight py-2"
                                                            value={newSubCpmk.deskripsi}
                                                            onChange={e => setNewSubCpmk({ ...newSubCpmk, deskripsi: e.target.value })}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        <select
                                                            className="select select-sm w-full"
                                                            value={newSubCpmk.cpmk_id}
                                                            onChange={e => setNewSubCpmk({ ...newSubCpmk, cpmk_id: e.target.value })}
                                                            disabled={selectedCPMKs.length === 0}
                                                        >
                                                            <option value="">Pilih CPMK Induk...</option>
                                                            {selectedCPMKs.map(id => {
                                                                const parentCPL = availableCPLs.find(c => c.cpmks?.some(mk => mk.id === id));
                                                                const mk = parentCPL?.cpmks?.find(m => m.id === id);
                                                                if (!mk) return null;
                                                                return <option key={id} value={id}>{mk.kode}</option>
                                                            })}
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-3 text-center align-top">
                                                        <button
                                                            onClick={handleAddSubCPMKLocal}
                                                            className="btn btn-sm btn-primary w-full"
                                                            disabled={!newSubCpmk.kode || !newSubCpmk.deskripsi || !newSubCpmk.cpmk_id}
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section: Rencana Mingguan */}
                    {activeSection === 'mingguan' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center flex-wrap gap-3">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Rencana Pembelajaran Mingguan</h3>
                                    <p className="text-sm text-gray-500">
                                        Rencanakan pertemuan mingguan atau kelompokkan pertemuan (contoh Minggu: "1-2").
                                        <br />
                                        Total Bobot: <span className={totalBobot === 100 ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>{totalBobot}%</span>
                                        {totalBobot !== 100 && <span className="text-red-500"> (Harus 100%)</span>}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={addWeek} className="btn btn-outline btn-sm">
                                        <Plus size={16} className="mr-1" /> Tambah Baris
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto border rounded-lg bg-white dark:bg-gray-800">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                    <thead className="bg-gray-100 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-2 py-3 text-center font-semibold w-16">Mg</th>
                                            <th className="px-2 py-3 text-left font-semibold min-w-[100px] w-24">CPMK</th>
                                            <th className="px-2 py-3 text-left font-semibold min-w-[200px]">Sub-CPMK</th>
                                            <th className="px-2 py-3 text-left font-semibold min-w-[150px]">Indikator</th>
                                            <th className="px-2 py-3 text-left font-semibold min-w-[150px]">Kriteria & Penilaian</th>
                                            <th className="px-2 py-3 text-left font-semibold min-w-[150px]">Materi</th>
                                            <th className="px-2 py-3 text-left font-semibold min-w-[150px]">Metode</th>
                                            <th className="px-2 py-3 text-center font-semibold w-16">Bentuk</th>
                                            <th className="px-2 py-3 text-center font-semibold w-12">%</th>
                                            <th className="px-2 py-3 w-8"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {rows.map((row, index) => {
                                            // Handle case where id might be string vs number
                                            const selectedSub = definedSubCPMKs.find(s => String(s.id) === String(row.sub_cpmk_id));

                                            // Parent Resolution
                                            let parentCPMKCode = '-';

                                            if (selectedSub) {
                                                const pCPL = availableCPLs.find(c => c.cpmks?.some(mk => mk.id === parseInt(selectedSub.cpmk_id)));
                                                const pCPMK = pCPL?.cpmks?.find(mk => mk.id === parseInt(selectedSub.cpmk_id));
                                                if (pCPMK) parentCPMKCode = pCPMK.kode;
                                            }

                                            return (
                                                <tr key={row.id} className={row.is_uts || row.is_uas ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'hover:bg-gray-50 dark:hover://bg-gray-700/50'}>
                                                    {/* Minggu Ke (Editable) */}
                                                    <td className="px-2 py-2 text-center align-top">
                                                        <input
                                                            type="text"
                                                            value={row.minggu_ke}
                                                            onChange={e => updateRow(index, 'minggu_ke', e.target.value)}
                                                            className="w-full text-center border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent font-bold text-gray-500"
                                                        />
                                                        {row.is_uts && <span className="block text-[10px] font-bold text-yellow-600 uppercase mt-1">UTS</span>}
                                                        {row.is_uas && <span className="block text-[10px] font-bold text-yellow-600 uppercase mt-1">UAS</span>}
                                                    </td>

                                                    {/* CPMK (Read Only) */}
                                                    <td className="px-2 py-2 align-top">
                                                        <div className="px-2 py-1.5 bg-gray-50 dark:bg-gray-700 rounded text-xs font-mono text-center border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300">
                                                            {parentCPMKCode}
                                                        </div>
                                                    </td>

                                                    {/* Sub-CPMK Selection */}
                                                    <td className="px-2 py-2 align-top">
                                                        <select
                                                            value={row.sub_cpmk_id || ''}
                                                            onChange={e => {
                                                                const subId = e.target.value;
                                                                const sub = definedSubCPMKs.find(s => String(s.id) === String(subId));

                                                                const newRow = { ...row, sub_cpmk_id: subId };
                                                                if (sub) {
                                                                    newRow.cpmk_id = sub.cpmk_id;
                                                                } else {
                                                                    newRow.cpmk_id = '';
                                                                }

                                                                const newRows = [...rows];
                                                                newRows[index] = newRow;
                                                                setRows(newRows);
                                                            }}
                                                            className="w-full px-2 py-1.5 border rounded text-xs dark:bg-gray-800 font-medium"
                                                        >
                                                            <option value="">- Pilih Sub-CPMK -</option>
                                                            {definedSubCPMKs.map(sub => (
                                                                <option key={sub.id} value={sub.id}>{sub.kode} - {sub.deskripsi.substring(0, 30)}...</option>
                                                            ))}
                                                        </select>
                                                        {selectedSub && (
                                                            <div className="mt-1 text-[10px] text-gray-400 italic leading-tight">
                                                                {selectedSub.deskripsi}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Indikator */}
                                                    <td className="px-2 py-2 align-top">
                                                        <textarea
                                                            value={row.indikator}
                                                            onChange={e => updateRow(index, 'indikator', e.target.value)}
                                                            className="w-full px-2 py-1.5 border rounded text-xs dark:bg-gray-800 resize-none h-24"
                                                            placeholder="Indikator..."
                                                        />
                                                    </td>

                                                    {/* Kriteria & Penilaian */}
                                                    <td className="px-2 py-2 align-top">
                                                        <textarea
                                                            value={row.kriteria_penilaian}
                                                            onChange={e => updateRow(index, 'kriteria_penilaian', e.target.value)}
                                                            className="w-full px-2 py-1.5 border rounded text-xs dark:bg-gray-800 resize-none h-24 mb-1"
                                                            placeholder="Kriteria..."
                                                        />
                                                        <div className="flex flex-wrap gap-1">
                                                            {teknikPenilaian.slice(0, 4).map(t => (
                                                                <label key={t} className={`text-[10px] px-1 py-0.5 rounded cursor-pointer border ${(row.teknik_penilaian || []).includes(t)
                                                                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30'
                                                                    : 'bg-white border-gray-200 text-gray-500'
                                                                    }`}>
                                                                    <input type="checkbox" checked={(row.teknik_penilaian || []).includes(t)} onChange={() => toggleMultiSelect(index, 'teknik_penilaian', t, 3)} className="hidden" />
                                                                    {t.split(' ')[0]}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </td>

                                                    {/* Materi */}
                                                    <td className="px-2 py-2 align-top">
                                                        <textarea
                                                            value={row.materi}
                                                            onChange={e => updateRow(index, 'materi', e.target.value)}
                                                            className="w-full px-2 py-1.5 border rounded text-xs dark:bg-gray-800 resize-none h-24"
                                                            placeholder={row.is_uts ? "Materi UTS" : row.is_uas ? "Materi UAS" : "Materi..."}
                                                        />
                                                    </td>

                                                    {/* Metode */}
                                                    <td className="px-2 py-2 align-top">
                                                        <div className="flex flex-col gap-1">
                                                            {metodePembelajaran.slice(0, 5).map(m => (
                                                                <label key={m} className={`flex items-center gap-1.5 text-[10px] px-1.5 py-1 rounded cursor-pointer border ${(row.metode_pembelajaran || []).includes(m)
                                                                    ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30'
                                                                    : 'bg-white border-gray-200 text-gray-500'
                                                                    }`}>
                                                                    <input type="checkbox" checked={(row.metode_pembelajaran || []).includes(m)} onChange={() => toggleMultiSelect(index, 'metode_pembelajaran', m, 3)} className="h-3 w-3" />
                                                                    {m}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </td>

                                                    {/* Bentuk (L/D) */}
                                                    <td className="px-2 py-2 text-center align-top">
                                                        <div className="flex flex-col gap-1 justify-center items-center h-full">
                                                            <label className={`w-8 h-8 flex items-center justify-center rounded border cursor-pointer ${row.bentuk_pembelajaran?.includes('luring') ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-400 border-gray-200'
                                                                }`}>
                                                                <input type="checkbox" checked={row.bentuk_pembelajaran?.includes('luring')} onChange={() => toggleBentukPembelajaran(index, 'luring')} className="hidden" />
                                                                <span className="font-bold text-xs">L</span>
                                                            </label>
                                                            <label className={`w-8 h-8 flex items-center justify-center rounded border cursor-pointer ${row.bentuk_pembelajaran?.includes('daring') ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-400 border-gray-200'
                                                                }`}>
                                                                <input type="checkbox" checked={row.bentuk_pembelajaran?.includes('daring')} onChange={() => toggleBentukPembelajaran(index, 'daring')} className="hidden" />
                                                                <span className="font-bold text-xs">D</span>
                                                            </label>
                                                        </div>
                                                    </td>

                                                    {/* Bobot */}
                                                    <td className="px-2 py-2 align-top">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={row.bobot_penilaian}
                                                            onChange={e => updateRow(index, 'bobot_penilaian', e.target.value)}
                                                            className="w-full px-1 py-1 border rounded text-xs text-center dark:bg-gray-800"
                                                        />
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-2 py-2 align-top text-center">
                                                        <button
                                                            onClick={() => removeWeek(index)}
                                                            disabled={row.is_uts || row.is_uas}
                                                            className="text-gray-400 hover:text-red-600 disabled:opacity-20 transition-colors p-1"
                                                            title="Hapus Baris"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-800 rounded-sm"></span> L = Luring (Tatap Muka)</span>
                                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-600 rounded-sm"></span> D = Daring (Online)</span>
                            </div>
                        </div>
                    )}

                    {/* Section: Info Tambahan */}
                    {activeSection === 'tambahan' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label">Pustaka Utama</label>
                                    <textarea value={pustakaUtama} onChange={e => setPustakaUtama(e.target.value)} className="input w-full" rows="4" placeholder="Daftar pustaka utama..." />
                                </div>
                                <div>
                                    <label className="label">Pustaka Pendukung</label>
                                    <textarea value={pustakaPendukung} onChange={e => setPustakaPendukung(e.target.value)} className="input w-full" rows="4" placeholder="Daftar pustaka pendukung..." />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label">Media Pembelajaran - Software</label>
                                    <input type="text" value={mediaSoftware} onChange={e => setMediaSoftware(e.target.value)} className="input w-full" placeholder="Contoh: VS Code, Python, dll" />
                                </div>
                                <div>
                                    <label className="label">Media Pembelajaran - Hardware</label>
                                    <input type="text" value={mediaHardware} onChange={e => setMediaHardware(e.target.value)} className="input w-full" placeholder="Contoh: Laptop, Proyektor, dll" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label">Ambang Batas Kelulusan Mahasiswa (%)</label>
                                    <input type="number" min="0" max="100" value={ambangKelulusanMhs} onChange={e => setAmbangKelulusanMhs(e.target.value)} className="input w-full" />
                                </div>
                                <div>
                                    <label className="label">Ambang Batas Kelulusan MK (%)</label>
                                    <input type="number" min="0" max="100" value={ambangKelulusanMK} onChange={e => setAmbangKelulusanMK(e.target.value)} className="input w-full" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t p-4 z-40 flex justify-end gap-3 shadow-lg lg:pl-64">
                <button onClick={() => navigate(-1)} className="btn btn-ghost">Batal</button>
                <button onClick={handleSaveDraft} disabled={loading || !formData.mata_kuliah_id} className="btn btn-primary flex items-center gap-2">
                    <Save size={18} />
                    {loading ? 'Menyimpan...' : (currentRPSId ? 'Simpan Perubahan' : 'Simpan Draft RPS')}
                </button>
            </div>
        </div>
    );
}
