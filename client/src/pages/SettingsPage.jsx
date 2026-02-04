import { useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import axios from '../lib/axios';

export default function SettingsPage() {
    const { user, updateUser } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        nama_lengkap: user?.nama_lengkap || '',
        email: user?.email || '',
    });
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await axios.put('/auth/profile', formData);
            updateUser(response.data.user);
            setMessage({ type: 'success', text: 'Profil berhasil diperbarui' });
            setIsEditing(false);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal memperbarui profil' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Password baru tidak cocok' });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password minimal 6 karakter' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await axios.post('/auth/change-password', {
                currentPassword,
                newPassword
            });
            setMessage({ type: 'success', text: 'Password berhasil diubah' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal mengubah password' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Pengaturan
            </h1>

            {message.text && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="space-y-6">
                {/* Profile Section */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Informasi Profil
                        </h2>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="btn btn-ghost text-sm"
                            >
                                Edit Profil
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="label">Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={formData.nama_lengkap}
                                    onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                                    className="input"
                                    required
                                />
                            </div>

                            <div>
                                <label className="label">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input"
                                    required
                                />
                            </div>

                            <div>
                                <label className="label">Username</label>
                                <input
                                    type="text"
                                    value={user?.username}
                                    className="input bg-gray-100 dark:bg-gray-800"
                                    disabled
                                />
                                <p className="text-xs text-gray-500 mt-1">Username tidak dapat diubah</p>
                            </div>

                            <div className="flex gap-3">
                                <button type="submit" disabled={loading} className="btn btn-primary">
                                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({ nama_lengkap: user?.nama_lengkap || '', email: user?.email || '' });
                                    }}
                                    className="btn btn-secondary"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Nama Lengkap</p>
                                <p className="text-gray-900 dark:text-white">{user?.nama_lengkap}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                <p className="text-gray-900 dark:text-white">{user?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Username</p>
                                <p className="text-gray-900 dark:text-white">{user?.username}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                                    {user?.role === 'kaprodi' ? 'Ketua Program Studi' : user?.role === 'dosen' ? 'Dosen' : 'Mahasiswa'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Theme Section */}
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Tampilan
                    </h2>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-900 dark:text-white font-medium">Mode Gelap</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Aktifkan mode gelap untuk kenyamanan mata
                            </p>
                        </div>

                        <button
                            onClick={toggleTheme}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-primary-600' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Password Section */}
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        Ubah Password
                    </h2>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="label">Password Saat Ini</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="input"
                                required
                            />
                        </div>

                        <div>
                            <label className="label">Password Baru</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="input"
                                required
                                minLength={6}
                            />
                            <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
                        </div>

                        <div>
                            <label className="label">Konfirmasi Password Baru</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input"
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading} className="btn btn-primary">
                            {loading ? 'Mengubah...' : 'Ubah Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
