import { useState, useEffect } from 'react';
import { FileText, Search, Filter, Eye, CheckCircle, XCircle, Clock, FileCheck } from 'lucide-react';
import axios from '../lib/axios';
import useAuthStore from '../store/useAuthStore';

export default function RPSManagementPage() {
    const { user, canApproveRPS } = useAuthStore();
    const [rpsList, setRpsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [selectedRPS, setSelectedRPS] = useState(null);
    const [approvalAction, setApprovalAction] = useState(null); // 'approve' or 'reject'
    const [catatan, setCatatan] = useState('');
    const [processing, setProcessing] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        semester: '',
        tahunAjaran: ''
    });

    useEffect(() => {
        fetchRPSList();
    }, []);

    const fetchRPSList = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/rps', {
                params: filters
            });
            setRpsList(res.data);
        } catch (error) {
            console.error('Failed to fetch RPS list:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenApprovalModal = (rps, action) => {
        setSelectedRPS(rps);
        setApprovalAction(action);
        setCatatan('');
        setShowApprovalModal(true);
    };

    const handleCloseApprovalModal = () => {
        setShowApprovalModal(false);
        setSelectedRPS(null);
        setApprovalAction(null);
        setCatatan('');
    };

    const handleSubmitApproval = async (e) => {
        e.preventDefault();
        if (!selectedRPS || !approvalAction) return;

        try {
            setProcessing(true);
            const endpoint = `/api/rps/${selectedRPS.id}/${approvalAction}`;
            await axios.put(endpoint, { catatan_approval: catatan });

            // Refresh list
            await fetchRPSList();
            handleCloseApprovalModal();
        } catch (error) {
            console.error(`Failed to ${approvalAction} RPS:`, error);
            alert(error.response?.data?.message || `Failed to ${approvalAction} RPS`);
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            draft: 'bg-gray-100 text-gray-800 border-gray-300',
            pending: 'bg-amber-100 text-amber-800 border-amber-300',
            approved: 'bg-green-100 text-green-800 border-green-300',
            rejected: 'bg-red-100 text-red-800 border-red-300'
        };

        const icons = {
            draft: <FileText className="w-3 h-3" />,
            pending: <Clock className="w-3 h-3" />,
            approved: <CheckCircle className="w-3 h-3" />,
            rejected: <XCircle className="w-3 h-3" />
        };

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${styles[status]}`}>
                {icons[status]}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const filteredRPS = rpsList.filter(rps => {
        if (filters.status && rps.status !== filters.status) return false;
        if (filters.search) {
            const search = filters.search.toLowerCase();
            return (
                rps.mata_kuliah?.nama_mk.toLowerCase().includes(search) ||
                rps.mata_kuliah?.kode_mk.toLowerCase().includes(search) ||
                rps.dosen?.nama_lengkap.toLowerCase().includes(search)
            );
        }
        return true;
    });

    // Group by status for better UX
    const pendingRPS = filteredRPS.filter(r => r.status === 'pending');
    const approvedRPS = filteredRPS.filter(r => r.status === 'approved');
    const draftRPS = filteredRPS.filter(r => r.status === 'draft');
    const rejectedRPS = filteredRPS.filter(r => r.status === 'rejected');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">RPS Management</h1>
                <p className="text-gray-600 mt-1">
                    {canApproveRPS() ? 'Review and approve RPS documents' : 'View RPS documents'}
                </p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-amber-700">Pending Review</p>
                            <p className="text-2xl font-bold text-amber-900">{pendingRPS.length}</p>
                        </div>
                        <Clock className="w-8 h-8 text-amber-600" />
                    </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-700">Approved</p>
                            <p className="text-2xl font-bold text-green-900">{approvedRPS.length}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-700">Draft</p>
                            <p className="text-2xl font-bold text-gray-900">{draftRPS.length}</p>
                        </div>
                        <FileText className="w-8 h-8 text-gray-600" />
                    </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-700">Rejected</p>
                            <p className="text-2xl font-bold text-red-900">{rejectedRPS.length}</p>
                        </div>
                        <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search course or lecturer..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-2"
                        />
                    </div>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="border border-gray-300 rounded-lg px-4 py-2"
                    >
                        <option value="">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <select
                        value={filters.semester}
                        onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                        className="border border-gray-300 rounded-lg px-4 py-2"
                    >
                        <option value="">All Semesters</option>
                        <option value="Ganjil">Ganjil</option>
                        <option value="Genap">Genap</option>
                    </select>
                    <select
                        value={filters.tahunAjaran}
                        onChange={(e) => setFilters({ ...filters, tahunAjaran: e.target.value })}
                        className="border border-gray-300 rounded-lg px-4 py-2"
                    >
                        <option value="">All Years</option>
                        <option value="2025/2026">2025/2026</option>
                        <option value="2024/2025">2024/2025</option>
                    </select>
                </div>
            </div>

            {/* RPS Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Mata Kuliah</th>
                            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Dosen</th>
                            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Semester</th>
                            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Status</th>
                            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Last Updated</th>
                            <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    Loading RPS list...
                                </td>
                            </tr>
                        ) : filteredRPS.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    No RPS found
                                </td>
                            </tr>
                        ) : (
                            filteredRPS.map((rps) => (
                                <tr key={rps.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {rps.mata_kuliah?.nama_mk}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {rps.mata_kuliah?.kode_mk} • {rps.mata_kuliah?.sks} SKS
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900">{rps.dosen?.nama_lengkap}</div>
                                            <div className="text-gray-500">{rps.dosen?.nidn}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div>{rps.semester}</div>
                                        <div className="text-gray-500">{rps.tahun_ajaran}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(rps.status)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(rps.updatedAt).toLocaleDateString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => window.open(`/kaprodi/rps/${rps.mata_kuliah_id}`, '_blank')}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </button>
                                            {canApproveRPS() && rps.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleOpenApprovalModal(rps, 'approve')}
                                                        className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenApprovalModal(rps, 'reject')}
                                                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Approval Modal */}
            {showApprovalModal && selectedRPS && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="border-b px-6 py-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                {approvalAction === 'approve' ? (
                                    <>
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                        Approve RPS
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-6 h-6 text-red-600" />
                                        Reject RPS
                                    </>
                                )}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmitApproval} className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Mata Kuliah:</p>
                                <p className="font-medium">{selectedRPS.mata_kuliah?.nama_mk}</p>
                                <p className="text-sm text-gray-500">
                                    {selectedRPS.mata_kuliah?.kode_mk} • Dosen: {selectedRPS.dosen?.nama_lengkap}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Catatan {approvalAction === 'reject' ? '*' : '(Optional)'}
                                </label>
                                <textarea
                                    value={catatan}
                                    onChange={(e) => setCatatan(e.target.value)}
                                    placeholder={
                                        approvalAction === 'approve'
                                            ? 'Add any comments or feedback...'
                                            : 'Jelaskan alasan penolakan...'
                                    }
                                    rows="4"
                                    required={approvalAction === 'reject'}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={handleCloseApprovalModal}
                                    disabled={processing}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || (approvalAction === 'reject' && !catatan.trim())}
                                    className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${approvalAction === 'approve'
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-red-600 hover:bg-red-700'
                                        }`}
                                >
                                    {processing ? (
                                        <>Processing...</>
                                    ) : (
                                        <>
                                            {approvalAction === 'approve' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                            {approvalAction === 'approve' ? 'Approve RPS' : 'Reject RPS'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
