
import { useState } from 'react';
import { X, HelpCircle, FileText, Download, Upload } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

export default function HelpModal({ isOpen, onClose, context = 'general' }) {
    if (!isOpen) return null;

    const { user } = useAuthStore();
    const role = user?.role || 'guest';

    const helpContent = {
        guest: [
            {
                title: 'Masuk ke Aplikasi',
                content: 'Gunakan username dan password yang telah diberikan oleh admin. Jika lupa password, hubungi admin bagian akademik.'
            },
            {
                title: 'Akun Demo',
                content: 'Untuk keperluan demo, gunakan kredensial yang tertera di halaman login (Kaprodi, Dosen, Mahasiswa).'
            }
        ],
        kaprodi: [
            {
                title: 'Manajemen Kurikulum',
                content: 'Anda dapat mengelola CPL, Bahan Kajian, CPMK, dan Sub-CPMK melalui menu "Data Kurikulum".'
            },
            {
                title: 'Import Data',
                content: 'Gunakan fitur Import CSV untuk memasukkan data dalam jumlah banyak sekaligus. Pastikan menggunakan template yang disediakan.',
                subitems: [
                    'Template CPL: KodeUnik, KodeProdi, Deskripsi, Kategori',
                    'Template Bahan Kajian: KodeBK, KodeProdi, Jenis, Deskripsi, BobotMin, BobotMax',
                    'Template MK: KodeMK, NamaMK, SKS, Semester, Deskripsi',
                    'Template CPMK: KodeMK, KodeCPMK, Deskripsi, KodeCPL',
                    'Template Sub-CPMK: KodeMK, KodeCPMK, KodeSubCPMK, Deskripsi'
                ]
            },
            {
                title: 'Manajemen RPS',
                content: 'Anda dapat memantau dan menyetujui RPS yang dibuat oleh dosen.'
            }
        ],
        dosen: [
            {
                title: 'Menyusun RPS',
                content: 'Pilih mata kuliah yang diampu, lalu klik "Edit RPS" untuk mulai menyusun Rencana Pembelajaran Semester.'
            },
            {
                title: 'Komponen RPS',
                content: 'Isi detail RPS meliputi informasi umum, deskripsi, CPL/CPMK yang dibebankan, dan rencana pembelajaran mingguan.'
            }
        ],
        mahasiswa: [
            {
                title: 'Melihat RPS',
                content: 'Anda dapat melihat rencana pembelajaran untuk mata kuliah yang Anda ambil pada semester ini.'
            },
            {
                title: 'Kontrak Kuliah',
                content: 'Pelajari kontrak kuliah dan komponen penilaian yang ditetapkan oleh dosen.'
            }
        ]
    };

    const content = helpContent[role] || helpContent.guest;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-primary-50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
                            <HelpCircle size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pusat Bantuan</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Panduan penggunaan sistem untuk peran: <span className="font-semibold text-primary-600 capitalize">{role === 'guest' ? 'Pengunjung' : role}</span>
                        </p>

                        <div className="grid gap-4">
                            {content.map((item, idx) => (
                                <div key={idx} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                        <FileText size={18} className="text-primary-500" />
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                        {item.content}
                                    </p>
                                    {item.subitems && (
                                        <ul className="mt-3 space-y-1 ml-6 list-disc text-sm text-gray-500 dark:text-gray-400">
                                            {item.subitems.map((sub, i) => (
                                                <li key={i}>{sub}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>

                        {role === 'kaprodi' && (
                            <div className="mt-6">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Download Template Import</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        { name: 'Template CPL', url: '/templates/template_cpl.csv' },
                                        { name: 'Template Bahan Kajian', url: '/templates/template_bahan_kajian.csv' },
                                        { name: 'Template Mata Kuliah', url: '/templates/template_matakuliah.csv' },
                                        { name: 'Template CPMK', url: '/templates/template_cpmk.csv' },
                                        { name: 'Template Sub-CPMK', url: '/templates/template_subcpmk.csv' },
                                    ].map((t) => (
                                        <a
                                            key={t.name}
                                            href={t.url}
                                            download
                                            className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:shadow-md transition-all group"
                                        >
                                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-md text-green-600 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-900/30">
                                                <Download size={18} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.name}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Butuh bantuan lebih lanjut? Hubungi Administrator Akademik.
                    </p>
                </div>
            </div>
        </div>
    );
}
