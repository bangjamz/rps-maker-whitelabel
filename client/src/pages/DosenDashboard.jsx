export default function DosenDashboard() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Dashboard Dosen
            </h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Mata Kuliah Aktif</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">4</p>
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
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">RPS Pending</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">2</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Mahasiswa</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">120</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        Buat RPS Baru
                    </button>
                    <button className="btn btn-secondary justify-start">
                        Input Nilai Mahasiswa
                    </button>
                    <button className="btn btn-secondary justify-start">
                        Export Laporan
                    </button>
                </div>
            </div>

            {/* Course List */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Mata Kuliah Semester Ini
                </h2>
                <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">Algoritma Pemrograman</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">IF-101 • Semester 1 • 3 SKS</p>
                                <div className="flex items-center gap-4 mt-3">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                        RPS Approved
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">30 Mahasiswa</span>
                                </div>
                            </div>
                            <button className="btn btn-ghost btn-sm">
                                Kelola
                            </button>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">Struktur Data</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">IF-201 • Semester 2 • 3 SKS</p>
                                <div className="flex items-center gap-4 mt-3">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                                        RPS Draft
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">30 Mahasiswa</span>
                                </div>
                            </div>
                            <button className="btn btn-ghost btn-sm">
                                Kelola
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
