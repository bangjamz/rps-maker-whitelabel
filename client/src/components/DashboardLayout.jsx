import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import { isAdmin, isDosen } from '../utils/permissions';

export default function DashboardLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Navigation items based on role
    const navItems = isAdmin() ? [
        { path: '/kaprodi/dashboard', label: 'Dashboard' },
        { path: '/kaprodi/curriculum', label: 'Data Kurikulum' },
        { path: '/kaprodi/courses', label: 'Mata Kuliah' },
        { path: '/kaprodi/rps', label: 'Kelola RPS' },
        { path: '/kaprodi/reports', label: 'Laporan' },
    ] : isDosen() ? [
        { path: '/dosen/dashboard', label: 'Dashboard' },
        { path: '/dosen/courses', label: 'Mata Kuliah Saya' },
        { path: '/dosen/rps', label: 'RPS Saya' },
        { path: '/dosen/grades', label: 'Penilaian' },
    ] : [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
                {/* Logo */}
                <div className="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-800">
                    <img
                        src="/logo-mahardika.jpg"
                        alt="Logo Institut Mahardika"
                        className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                        <h1 className="font-bold text-gray-900 dark:text-white">RPS Maker</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Institut Mahardika</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
                    <Link
                        to="/settings"
                        className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors mb-2 ${location.pathname === '/settings'
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                    >
                        Pengaturan
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="pl-64">
                {/* Top Bar */}
                <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Selamat datang, {user?.nama_lengkap}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user?.role === 'kaprodi' ? 'Ketua Program Studi' : 'Dosen'}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
                            >
                                {theme === 'dark' ? (
                                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                Keluar
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
