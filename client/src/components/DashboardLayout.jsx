import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import useAcademicStore from '../store/useAcademicStore';
import { isAdmin, isDosen } from '../utils/permissions';
import { ROLES } from '../utils/permissions';
import {
    Calendar, Bell, User, Settings, LogOut, ChevronDown,
    Home, GraduationCap, BookOpen, FileText, Users, BarChart, Award
} from 'lucide-react';
import axios from '../lib/axios';
import { useState, useEffect, useMemo } from 'react';

import { useState, useEffect, useMemo } from 'react';
import HelpModal from './HelpModal';

export default function DashboardLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();
    const { activeSemester, activeYear, setSemester, setYear } = useAcademicStore();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    // Role Switcher State
    const [activeRole, setActiveRole] = useState(user?.role || ROLES.DOSEN);

    // Notifications State
    const [unreadCount, setUnreadCount] = useState(0);

    // Sync activeRole with user.role on mount/change
    useEffect(() => {
        if (user?.role) {
            setActiveRole(user.role);
        }
    }, [user?.role]);

    // Handle Role Switch
    const handleRoleSwitch = (e) => {
        const newRole = e.target.value;
        setActiveRole(newRole);

        // Navigate to the respective dashboard to avoid dead links
        if (newRole === ROLES.KAPRODI) {
            navigate('/kaprodi/dashboard');
        } else if (newRole === ROLES.DOSEN) {
            navigate('/dosen/dashboard');
        }
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axios.get('/notifications');
                setUnreadCount(res.data.unreadCount || 0);
            } catch (err) {
                console.error('Failed to fetch notifications', err);
            }
        };
        fetchNotifications();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Navigation items based on role
    const navItems = useMemo(() => {
        const items = [
            {
                label: 'Profil',
                icon: User,
                path: '/profile'
            }
        ];

        // KAPRODI VIEW
        if (activeRole === ROLES.KAPRODI) {
            return [
                ...items,
                { label: 'Dashboard', icon: Home, path: '/kaprodi/dashboard' },
                { label: 'Data CPL CPMK', icon: GraduationCap, path: '/kaprodi/curriculum' },
                { label: 'Mata Kuliah', icon: BookOpen, path: '/kaprodi/courses' },
                { label: 'Kelola RPS', icon: FileText, path: '/kaprodi/rps' },
                { label: 'Penugasan Dosen', icon: Users, path: '/kaprodi/lecturer-assignments' },
                { label: 'Laporan', icon: BarChart, path: '/kaprodi/reports' }, // Placeholder
            ];
        }

        // DOSEN VIEW (Active Role is Dosen OR User is just Dosen)
        if (activeRole === ROLES.DOSEN) {
            return [
                ...items,
                { label: 'Dashboard', icon: Home, path: '/dosen/dashboard' },
                { label: 'Mata Kuliah Saya', icon: BookOpen, path: '/dosen/courses' },
                { label: 'RPS Saya', icon: FileText, path: '/dosen/rps' },
                // { label: 'Penilaian', icon: Award, path: '/dosen/grades' },
            ];
        }

        // MAHASISWA VIEW
        if (activeRole === ROLES.MAHASISWA) {
            return [
                ...items,
                { label: 'Dashboard', icon: Home, path: '/mahasiswa/dashboard' },
                { label: 'Jadwal Kuliah', icon: Calendar, path: '/mahasiswa/schedule' },
                { label: 'Nilai Semester', icon: Award, path: '/mahasiswa/grades' },
            ];
        }

        return items;
    }, [activeRole]);

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
                        <h1 className="font-bold text-gray-900 dark:text-white">SAMPIRANS</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Institut Mahardika</p>
                    </div>
                </div>

                {/* Role Switcher or Badge */}
                <div className="px-6 mb-6">
                    {user?.role === ROLES.KAPRODI ? (
                        <div className="relative">
                            <select
                                value={activeRole}
                                onChange={handleRoleSwitch}
                                className="w-full appearance-none bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 py-2 pl-4 pr-10 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value={ROLES.KAPRODI}>Kaprodi</option>
                                <option value={ROLES.DOSEN}>Dosen</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-primary-600 dark:text-primary-400">
                                <ChevronDown className="w-4 h-4" />
                            </div>
                        </div>
                    ) : (
                        <div className="inline-flex px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                            {user?.role === ROLES.DOSEN ? 'Dosen' : 'Mahasiswa'}
                        </div>
                    )}
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
                        {/* Left: User Info */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Selamat datang, {user?.nama_lengkap}
                            </h2>
                            {/* Role moved to sidebar */}
                        </div>

                        {/* Right: Semester Selector, Theme Toggle, Account */}
                        <div className="flex items-center gap-3">
                            {/* Semester Selector (Kaprodi Only) */}
                            {user?.role === 'kaprodi' && (
                                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <span className="text-xs text-gray-500 font-medium">Semester Aktif:</span>
                                    <select
                                        value={activeSemester}
                                        onChange={(e) => setSemester(e.target.value)}
                                        className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer text-gray-700 dark:text-gray-300 pr-8"
                                    >
                                        <option value="Ganjil">Ganjil</option>
                                        <option value="Genap">Genap</option>
                                    </select>
                                    <span className="text-gray-300">|</span>
                                    <select
                                        value={activeYear}
                                        onChange={(e) => setYear(e.target.value)}
                                        className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer text-gray-700 dark:text-gray-300 pr-8"
                                    >
                                        {Array.from({ length: 5 }, (_, i) => {
                                            const startYear = new Date().getFullYear() - 1 + i;
                                            const yearStr = `${startYear}/${startYear + 1}`;
                                            return <option key={yearStr} value={yearStr}>{yearStr}</option>;
                                        })}
                                    </select>
                                </div>
                            )}

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

                            {/* Notifications */}
                            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
                                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                            </button>

                            {/* Account Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-sm">
                                        {user?.nama_lengkap?.charAt(0) || 'U'}
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                </button>

                                {showProfileMenu && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setShowProfileMenu(false)}
                                        ></div>
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                                            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.nama_lengkap}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                                            </div>
                                            <Link
                                                to="/profile"
                                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                onClick={() => setShowProfileMenu(false)}
                                            >
                                                Profil Saya
                                            </Link>
                                            <Link
                                                to="/settings"
                                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                                onClick={() => setShowProfileMenu(false)}
                                            >
                                                <Settings className="w-4 h-4" /> Pengaturan
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setShowProfileMenu(false);
                                                    setShowHelp(true);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                            >
                                                <BookOpen className="w-4 h-4" /> Bantuan
                                            </button>
                                            <div className="border-t border-gray-200 dark:border-gray-700 mt-1"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                            >
                                                <LogOut className="w-4 h-4" /> Keluar
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
            {/* Help Modal */}
            <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </div>
    );
}
