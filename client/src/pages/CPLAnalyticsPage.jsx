import { useState, useEffect } from 'react';
import { RadarChart, Radar, BarChart, Bar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Download, TrendingUp, Award, Target } from 'lucide-react';
import axios from '../lib/axios';

export default function CPLAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [tahunAjaran, setTahunAjaran] = useState('2025/2026');
    const [semester, setSemester] = useState('Ganjil');

    // CPL data
    const [cplData, setCplData] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [courses, setCourses] = useState([]);

    // CPMK data
    const [cpmkData, setCpmkData] = useState([]);

    // Heatmap data
    const [heatmapData, setHeatmapData] = useState(null);

    // Stats
    const [stats, setStats] = useState({
        avgAttainment: 0,
        goodCount: 0,
        fairCount: 0,
        poorCount: 0
    });

    useEffect(() => {
        fetchCPLAttainment();
        fetchCourses();
        fetchHeatmap();
    }, [tahunAjaran]);

    useEffect(() => {
        if (selectedCourse) {
            fetchCPMKAttainment();
        }
    }, [selectedCourse, semester, tahunAjaran]);

    const fetchCourses = async () => {
        try {
            const res = await axios.get('/api/analytics/courses');
            setCourses(res.data);
            if (res.data.length > 0) {
                setSelectedCourse(res.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchCPLAttainment = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/cpl-analytics/cpl/attainment', {
                params: {
                    prodi_id: 1, // TODO: Get from user context
                    tahun_ajaran: tahunAjaran
                }
            });

            setCplData(res.data);

            // Calculate stats
            const avgAttainment = res.data.reduce((sum, cpl) => sum + cpl.attainment, 0) / res.data.length || 0;
            const goodCount = res.data.filter(c => c.status === 'Good').length;
            const fairCount = res.data.filter(c => c.status === 'Fair').length;
            const poorCount = res.data.filter(c => c.status === 'Poor').length;

            setStats({
                avgAttainment: Math.round(avgAttainment * 100) / 100,
                goodCount,
                fairCount,
                poorCount
            });
        } catch (error) {
            console.error('Error fetching CPL attainment:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCPMKAttainment = async () => {
        try {
            const res = await axios.get('/api/cpl-analytics/cpmk/attainment', {
                params: {
                    mata_kuliah_id: selectedCourse,
                    semester,
                    tahun_ajaran: tahunAjaran
                }
            });
            setCpmkData(res.data);
        } catch (error) {
            console.error('Error fetching CPMK attainment:', error);
        }
    };

    const fetchHeatmap = async () => {
        try {
            const res = await axios.get('/api/cpl-analytics/cpl/heatmap', {
                params: {
                    prodi_id: 1, // TODO: Get from user context
                    tahun_ajaran: tahunAjaran
                }
            });
            setHeatmapData(res.data);
        } catch (error) {
            console.error('Error fetching heatmap:', error);
        }
    };

    const handleExport = async () => {
        try {
            const res = await axios.get('/api/cpl-analytics/cpl/export', {
                params: {
                    prodi_id: 1,
                    tahun_ajaran: tahunAjaran
                }
            });

            // Download as JSON
            const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CPL_Report_${tahunAjaran}.json`;
            a.click();
        } catch (error) {
            console.error('Error exporting report:', error);
            alert('Failed to export report');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Good': return '#10b981';
            case 'Fair': return '#f59e0b';
            case 'Poor': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getHeatmapColor = (value) => {
        if (value === null) return '#f3f4f6';
        if (value >= 75) return '#10b981';
        if (value >= 60) return '#fbbf24';
        return '#ef4444';
    };

    if (loading) {
        return <div className="p-6">Loading CPL analytics...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">CPL Achievement Analytics</h1>
                    <p className="text-gray-600 mt-1">Outcome-Based Education Performance Analysis</p>
                </div>

                <button onClick={handleExport} className="btn btn-secondary flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Export Report
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Avg CPL Attainment</p>
                            <p className="text-3xl font-bold text-blue-600 mt-1">{stats.avgAttainment}%</p>
                        </div>
                        <TrendingUp className="w-10 h-10 text-blue-600 opacity-50" />
                    </div>
                </div>

                <div className="card p-6 bg-green-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-700">Good (≥75%)</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{stats.goodCount}</p>
                        </div>
                        <Award className="w-10 h-10 text-green-600 opacity-50" />
                    </div>
                </div>

                <div className="card p-6 bg-yellow-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-700">Fair (60-74%)</p>
                            <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.fairCount}</p>
                        </div>
                        <Target className="w-10 h-10 text-yellow-600 opacity-50" />
                    </div>
                </div>

                <div className="card p-6 bg-red-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-700">Poor (&lt;60%)</p>
                            <p className="text-3xl font-bold text-red-600 mt-1">{stats.poorCount}</p>
                        </div>
                        <Target className="w-10 h-10 text-red-600 opacity-50" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-6">
                <h2 className="font-semibold mb-4">Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Academic Year</label>
                        <input
                            type="text"
                            value={tahunAjaran}
                            onChange={(e) => setTahunAjaran(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="2025/2026"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Semester (for CPMK)</label>
                        <select
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                        >
                            <option value="Ganjil">Ganjil</option>
                            <option value="Genap">Genap</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Course (for CPMK)</label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                        >
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.kode_mk} - {course.nama_mk}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* CPL Attainment Radar Chart */}
            <div className="card p-6">
                <h2 className="font-semibold mb-4">CPL Attainment Overview</h2>
                {cplData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                        <RadarChart data={cplData.map(c => ({ name: c.cpl_kode, value: c.attainment }))}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="name" />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} />
                            <Radar name="Attainment %" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                            <Tooltip />
                            <Legend />
                        </RadarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center text-gray-500 py-12">
                        No CPL data available
                    </div>
                )}
            </div>

            {/* CPL Status Distribution */}
            <div className="card p-6">
                <h2 className="font-semibold mb-4">CPL Status Breakdown</h2>
                <div className="space-y-3">
                    {cplData.map((cpl, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                            <div className="flex-1">
                                <p className="font-semibold">{cpl.cpl_kode}</p>
                                <p className="text-sm text-gray-600">{cpl.cpl_deskripsi.substring(0, 80)}...</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-2xl font-bold" style={{ color: getStatusColor(cpl.status) }}>
                                        {cpl.attainment}%
                                    </p>
                                    <p className="text-xs text-gray-500">{cpl.status}</p>
                                </div>
                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full transition-all"
                                        style={{
                                            width: `${Math.min(cpl.attainment, 100)}%`,
                                            backgroundColor: getStatusColor(cpl.status)
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CPMK Attainment Bar Chart */}
            {cpmkData.length > 0 && (
                <div className="card p-6">
                    <h2 className="font-semibold mb-4">CPMK Attainment (Selected Course)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={cpmkData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="cpmk_kode" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="attainment" name="Attainment %">
                                {cpmkData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* CPL x Course Heatmap */}
            {heatmapData && (
                <div className="card p-6">
                    <h2 className="font-semibold mb-4">CPL Attainment Heatmap (CPL × Course)</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="border p-2 bg-gray-100 sticky left-0 z-10 text-left font-semibold">CPL</th>
                                    {heatmapData.courses?.map((course, idx) => (
                                        <th key={idx} className="border p-2 bg-gray-100 text-xs" title={course.nama}>
                                            {course.kode}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {heatmapData.heatmap?.map((row, rowIdx) => (
                                    <tr key={rowIdx}>
                                        <td className="border p-2 font-semibold bg-gray-50 sticky left-0 z-10">
                                            {row.cpl_kode}
                                        </td>
                                        {row.courses?.map((cell, cellIdx) => (
                                            <td
                                                key={cellIdx}
                                                className="border p-2 text-center text-sm font-semibold"
                                                style={{
                                                    backgroundColor: getHeatmapColor(cell.attainment),
                                                    color: cell.attainment !== null ? '#fff' : '#6b7280'
                                                }}
                                                title={cell.attainment !== null ? `${cell.attainment}%` : 'No data'}
                                            >
                                                {cell.attainment !== null ? `${cell.attainment}%` : '-'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center gap-4 mt-4 text-sm">
                        <span className="font-semibold">Legend:</span>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded" style={{ backgroundColor: '#10b981' }}></div>
                            <span>Good (≥75%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded" style={{ backgroundColor: '#fbbf24' }}></div>
                            <span>Fair (60-74%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                            <span>Poor (&lt;60%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-gray-200"></div>
                            <span>No Data</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
