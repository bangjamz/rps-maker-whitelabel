import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import { LayoutGrid, List, Table as TableIcon, Edit, Trash2, Plus, Search, BookOpen, Clock, Calendar } from 'lucide-react';

const EditCourseModal = ({ course, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        kode_mk: '',
        nama_mk: '',
        sks: 0,
        semester: 1,
        scope: 'prodi',
        fakultas_id: null,
        prodi_id: null
    });

    useEffect(() => {
        if (course) {
            setFormData({
                kode_mk: course.kode_mk || '',
                nama_mk: course.nama_mk || '',
                sks: course.sks || 0,
                semester: course.semester || 1,
                scope: course.scope || 'prodi',
                fakultas_id: course.fakultas_id || null,
                prodi_id: course.prodi_id || null
            });
        }
    }, [course]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        onSave(course.id, formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Edit Mata Kuliah</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Kode MK</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.kode_mk}
                                onChange={(e) => setFormData({ ...formData, kode_mk: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="label">SKS</label>
                            <input
                                type="number"
                                className="input"
                                value={formData.sks}
                                onChange={(e) => setFormData({ ...formData, sks: parseInt(e.target.value) })}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="label">Nama Mata Kuliah</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.nama_mk}
                            onChange={(e) => setFormData({ ...formData, nama_mk: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="label">Semester</label>
                        <select
                            className="input"
                            value={formData.semester}
                            onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                        >
                            {[...Array(8)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={onClose} className="btn btn-ghost">Batal</button>
                        <button type="submit" className="btn btn-primary">Simpan Perubahan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function CoursesPage() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({ semester: 'all', search: '' });
    const [viewMode, setViewMode] = useState('grid'); // grid, list, table
    const [editingCourse, setEditingCourse] = useState(null);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/courses');
            setCourses(response.data);
        } catch (error) {
            console.error('Failed to load courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCourse = async (id, data) => {
        try {
            await axios.put(`/courses/${id}`, data);
            setEditingCourse(null);
            loadCourses(); // Reload to refresh data
        } catch (error) {
            console.error('Failed to update course:', error);
            alert('Gagal memperbarui mata kuliah');
        }
    };

    const filteredCourses = courses.filter(course => {
        const matchSemester = filter.semester === 'all' || course.semester === parseInt(filter.semester);
        const matchSearch = course.nama_mk.toLowerCase().includes(filter.search.toLowerCase()) ||
            course.kode_mk.toLowerCase().includes(filter.search.toLowerCase());
        return matchSemester && matchSearch;
    });

    const semesterOptions = [
        { value: 'all', label: 'Semua Semester' },
        ...Array.from({ length: 8 }, (_, i) => ({ value: (i + 1).toString(), label: `Semester ${i + 1}` }))
    ];

    const ViewToggle = () => (
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 gap-1">
            <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                title="Grid View"
            >
                <LayoutGrid size={18} />
            </button>
            <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                title="List View"
            >
                <List size={18} />
            </button>
            <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                title="Table View"
            >
                <TableIcon size={18} />
            </button>
        </div>
    );

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mata Kuliah</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total {courses.length} mata kuliah
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ViewToggle />
                    <button className="btn btn-primary flex items-center gap-2">
                        <Plus size={18} />
                        <span>Tambah MK</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari berdasarkan kode atau nama..."
                            value={filter.search}
                            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                            className="input pl-10"
                        />
                    </div>
                    <div>
                        <select
                            value={filter.semester}
                            onChange={(e) => setFilter({ ...filter, semester: e.target.value })}
                            className="input"
                        >
                            {semesterOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Content Display */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : filteredCourses.length === 0 ? (
                <div className="card p-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400">Tidak ada mata kuliah yang ditemukan</p>
                </div>
            ) : (
                <>
                    {/* GRID VIEW */}
                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCourses.map((course) => (
                                <div key={course.id} className="card p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg line-clamp-2">
                                                {course.nama_mk}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                                                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
                                                    {course.kode_mk}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-xs ${course.scope === 'institusi' ? 'bg-purple-100 text-purple-700' : course.scope === 'fakultas' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {course.scope}
                                                </span>
                                            </p>
                                        </div>
                                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 whitespace-nowrap">
                                            {course.sks} SKS
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-4 border-t border-b border-gray-100 dark:border-gray-700 py-3">
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <Clock className="w-4 h-4 mr-2" />
                                            Semester {course.semester}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <BookOpen className="w-4 h-4 mr-2" />
                                            RPS tersedia
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/kaprodi/rps/${course.id}`)}
                                            className="btn btn-primary btn-sm flex-1"
                                        >
                                            Lihat RPS
                                        </button>
                                        <button
                                            onClick={() => setAssigningCourse(course)}
                                            className="btn btn-ghost btn-sm px-2 text-green-600"
                                            title="Assign Dosen"
                                        >
                                            <UserPlus size={16} />
                                        </button>
                                        <button
                                            onClick={() => setEditingCourse(course)}
                                            className="btn btn-ghost btn-sm px-2"
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* LIST VIEW */}
                    {viewMode === 'list' && (
                        <div className="flex flex-col gap-3">
                            {filteredCourses.map((course) => (
                                <div key={course.id} className="card p-4 flex flex-col md:flex-row items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                {course.kode_mk}
                                            </span>
                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                {course.nama_mk}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded text-xs ${course.scope === 'institusi' ? 'bg-purple-100 text-purple-700' : course.scope === 'fakultas' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {course.scope}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            <span>Sem {course.semester}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} />
                                            <span>{course.sks} SKS</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                                        <button
                                            onClick={() => navigate(`/kaprodi/rps/${course.id}`)}
                                            className="btn btn-outline btn-sm flex-1"
                                        >
                                            RPS
                                        </button>
                                        <button
                                            onClick={() => setAssigningCourse(course)}
                                            className="btn btn-ghost btn-sm text-green-600"
                                            title="Assign Dosen"
                                        >
                                            <UserPlus size={16} />
                                        </button>
                                        <button
                                            onClick={() => setEditingCourse(course)}
                                            className="btn btn-ghost btn-sm"
                                        >
                                            <Edit size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* TABLE VIEW */}
                    {viewMode === 'table' && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kode</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mata Kuliah</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SKS</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Semester</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Scope</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredCourses.map((course) => (
                                        <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {course.kode_mk}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {course.nama_mk}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {course.sks} SKS
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {course.semester}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.scope === 'institusi' ? 'bg-purple-100 text-purple-800' : course.scope === 'fakultas' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {course.scope}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => navigate(`/kaprodi/rps/${course.id}`)}
                                                    className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 mr-4"
                                                >
                                                    RPS
                                                </button>
                                                <button
                                                    onClick={() => setAssigningCourse(course)}
                                                    className="text-green-600 hover:text-green-900 dark:hover:text-green-400 mr-4"
                                                    title="Assign Dosen"
                                                >
                                                    Assign
                                                </button>
                                                <button
                                                    onClick={() => setEditingCourse(course)}
                                                    className="text-amber-600 hover:text-amber-900 dark:hover:text-amber-400"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            <EditCourseModal
                course={editingCourse}
                isOpen={!!editingCourse}
                onClose={() => setEditingCourse(null)}
                onSave={handleUpdateCourse}
            />

            <AssignLecturerModal
                course={assigningCourse}
                isOpen={!!assigningCourse}
                onClose={() => setAssigningCourse(null)}
                onSave={handleAssignLecturer}
            />
        </div>
    );
}
