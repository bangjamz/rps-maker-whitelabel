export default function KaprodiDashboard() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Dashboard Kaprodi
            </h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Mata Kuliah</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">52</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">RPS Pending Approval</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">8</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Dosen</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">2</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Mahasiswa</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">30</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Aksi Cepat
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="btn btn-primary justify-start">
                        Kelola Data Kurikulum
                    </button>
                    <button className="btn btn-secondary justify-start">
                        Review RPS Pending
                    </button>
                    <button className="btn btn-secondary justify-start">
                        Lihat Laporan
                    </button>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Aktivitas Terbaru
                </h2>
                <div className="space-y-4">
                    <div className="flex items-start gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white font-medium">
                                RPS Algoritma Pemrograman telah disubmit
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 jam yang lalu</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white font-medium">
                                RPS Basis Data telah disetujui
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">5 jam yang lalu</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white font-medium">
                                Data CPL telah diperbarui
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1 hari yang lalu</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
