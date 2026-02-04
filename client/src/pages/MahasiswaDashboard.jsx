import React from 'react';
import useAuthStore from '../store/useAuthStore';
import { BookOpen, Calendar, Award, Clock } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
    </div>
);

const MahasiswaDashboard = () => {
    const { user } = useAuthStore();

    const stats = [
        { title: 'Total Mata Kuliah', value: '8', icon: BookOpen, color: 'bg-blue-500' },
        { title: 'SKS Diambil', value: '24', icon: Award, color: 'bg-green-500' },
        { title: 'Kehadiran', value: '95%', icon: Clock, color: 'bg-purple-500' },
        { title: 'Jadwal Hari Ini', value: '2', icon: Calendar, color: 'bg-orange-500' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Dashboard Mahasiswa
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Selamat datang kembali, {user?.nama_lengkap || 'Mahasiswa'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Jadwal Kuliah Hari Ini
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900 dark:text-white">Pemrogaman Web</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">08:00 - 10:30 • Ruang Lab 1</p>
                            </div>
                            <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                                Sedang Berlangsung
                            </span>
                        </div>
                        <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900 dark:text-white">Basis Data</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">13:00 - 15:30 • Ruang 302</p>
                            </div>
                            <span className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                                Akan Datang
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Pengumuman Akademik
                    </h2>
                    <div className="space-y-4">
                        <div className="p-4 border border-blue-100 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800 rounded-lg">
                            <h3 className="font-medium text-blue-900 dark:text-blue-300">Pengisian KRS Semester Genap</h3>
                            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                Pengisian KRS untuk semester genap akan dimulai pada tanggal 20 Februari 2026.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MahasiswaDashboard;
