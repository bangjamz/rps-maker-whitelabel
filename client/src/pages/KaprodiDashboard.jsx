import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Users, GraduationCap, AlertCircle, TrendingUp, CheckCircle, FileText } from 'lucide-react';
import axios from '../lib/axios';
import useAuthStore from '../store/useAuthStore';

export default function KaprodiDashboard() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get('/api/dashboard/stats');
            setStats(res.data.stats);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Dashboard Kaprodi
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {user?.prodi?.nama} • {user?.prodi?.fakultas?.nama}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Mata Kuliah</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {stats?.mataKuliahCount || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">RPS Pending Approval</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {stats?.rpsStats?.pending || 0}
                            </p>
                            {stats?.rpsStats && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {stats.rpsStats.approved || 0} approved • {stats.rpsStats.total || 0} total
                                </p>
                            )}
                        </div>
                        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Dosen</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {stats?.dosenCount || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Mahasiswa</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {stats?.mahasiswaCount || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* RPS Completion Progress */}
            {stats?.rpsStats && (
                <div className="card p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            RPS Completion Progress
                        </h2>
                        <span className="text-2xl font-bold text-blue-600">
                            {stats.rpsStats.completionRate}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div
                            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${stats.rpsStats.completionRate}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>{stats.rpsStats.approved} approved of {stats.rpsStats.total} total</span>
                        <span>{stats.rpsStats.pending} pending approval</span>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="card p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Aksi Cepat
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link to="/kaprodi/curriculum" className="btn btn-primary justify-start">
                        <FileText className="w-5 h-5 mr-2" />
                        Kelola Data Kurikulum
                    </Link>
                    <Link to="/kaprodi/lecturer-assignments" className="btn btn-secondary justify-start">
                        <Users className="w-5 h-5 mr-2" />
                        Assign Dosen ke MK
                    </Link>
                    <Link to="/kaprodi/rps" className="btn btn-secondary justify-start">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Review RPS Pending
                    </Link>
                </div>
            </div>

            {/* Action Needed Alert */}
            {stats?.rpsStats?.pending > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-8">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                                Action Needed
                            </h3>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                You have {stats.rpsStats.pending} RPS document{stats.rpsStats.pending > 1 ? 's' : ''} pending approval.
                                Please review them to ensure timely curriculum implementation.
                            </p>
                            <Link
                                to="/kaprodi/rps"
                                className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline mt-2 inline-block"
                            >
                                Review Now →
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
