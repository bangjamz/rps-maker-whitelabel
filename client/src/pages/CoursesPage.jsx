import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../lib/axios';

export default function CoursesPage() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({ semester: 'all', search: '' });

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

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mata Kuliah</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total {courses.length} mata kuliah
                    </p>
                </div>
                <button className="btn btn-primary">
                    Tambah Mata Kuliah
                </button>
            </div>

            {/* Filters */}
            <div className="card p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Cari Mata Kuliah</label>
                        <input
                            type="text"
                            placeholder="Cari berdasarkan kode atau nama..."
                            value={filter.search}
                            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                            className="input"
                        />
                    </div>
                    <div>
                        <label className="label">Filter Semester</label>
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

            {/* Course Grid */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : filteredCourses.length === 0 ? (
                <div className="card p-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400">Tidak ada mata kuliah yang ditemukan</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <div key={course.id} className="card p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                        {course.nama_mk}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{course.kode_mk}</p>
                                </div>
                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                    {course.sks} SKS
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Semester {course.semester}
                                </div>
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
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
                                <button className="btn btn-ghost btn-sm">Edit</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
