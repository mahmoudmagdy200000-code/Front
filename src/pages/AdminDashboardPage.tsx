import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Button, Card, LoadingSpinner, EmptyState } from '../components/ui';
import { getAllOwnerRequests, approveOwnerRequest, rejectOwnerRequest, type OwnerRequest } from '../api/admin';

const AdminDashboardPage = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const { role, logout } = useAuth();
    const isRTL = i18n.language === 'ar';

    const [requests, setRequests] = useState<OwnerRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Redirect non-admin users
    useEffect(() => {
        if (role !== 'Admin') {
            navigate('/');
        }
    }, [role, navigate]);

    // Fetch owner requests
    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllOwnerRequests();
            setRequests(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load owner requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId: number) => {
        try {
            setActionLoading(requestId);
            setError(null);
            const result = await approveOwnerRequest(requestId);
            setSuccessMessage(result.message);
            // Update local state
            setRequests(prev => prev.map(r =>
                r.Id === requestId ? { ...r, Status: 'Approved' } : r
            ));
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to approve request');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (requestId: number) => {
        try {
            setActionLoading(requestId);
            setError(null);
            const result = await rejectOwnerRequest(requestId);
            setSuccessMessage(result.message);
            // Update local state
            setRequests(prev => prev.map(r =>
                r.Id === requestId ? { ...r, Status: 'Rejected' } : r
            ));
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to reject request');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            Approved: 'bg-green-100 text-green-800 border-green-200',
            Rejected: 'bg-red-100 text-red-800 border-red-200'
        };
        return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return <LoadingSpinner fullScreen text={isRTL ? 'جاري التحميل...' : 'Loading...'} />;
    }

    return (
        <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">
                                {isRTL ? 'لوحة تحكم المدير' : 'Admin Dashboard'}
                            </h1>
                            <p className="text-purple-200 mt-1">
                                {isRTL ? 'إدارة طلبات ترقية المالكين' : 'Manage Owner Upgrade Requests'}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/')}
                                className="text-white hover:bg-white/20"
                            >
                                {isRTL ? 'الرئيسية' : 'Home'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={logout}
                                className="border-white text-white hover:bg-white hover:text-purple-600"
                            >
                                {isRTL ? 'تسجيل الخروج' : 'Logout'}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">⏳</span>
                            </div>
                            <div>
                                <p className="text-yellow-800 text-sm font-medium">
                                    {isRTL ? 'قيد الانتظار' : 'Pending'}
                                </p>
                                <p className="text-3xl font-bold text-yellow-900">
                                    {requests.filter(r => r.Status === 'Pending').length}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">✅</span>
                            </div>
                            <div>
                                <p className="text-green-800 text-sm font-medium">
                                    {isRTL ? 'تم القبول' : 'Approved'}
                                </p>
                                <p className="text-3xl font-bold text-green-900">
                                    {requests.filter(r => r.Status === 'Approved').length}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">❌</span>
                            </div>
                            <div>
                                <p className="text-red-800 text-sm font-medium">
                                    {isRTL ? 'مرفوض' : 'Rejected'}
                                </p>
                                <p className="text-3xl font-bold text-red-900">
                                    {requests.filter(r => r.Status === 'Rejected').length}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Requests Table */}
                <Card padding="none">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {isRTL ? 'طلبات ترقية المالكين' : 'Owner Upgrade Requests'}
                        </h2>
                    </div>

                    {requests.length === 0 ? (
                        <EmptyState
                            icon={<span className="text-6xl">📭</span>}
                            title={isRTL ? 'لا توجد طلبات' : 'No Requests'}
                            description={isRTL ? 'لا توجد طلبات ترقية حالياً' : 'No owner upgrade requests at the moment'}
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {isRTL ? 'المستخدم' : 'User'}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {isRTL ? 'البريد الإلكتروني' : 'Email'}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {isRTL ? 'رقم الهاتف' : 'Phone'}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {isRTL ? 'الحالة' : 'Status'}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {isRTL ? 'تاريخ الطلب' : 'Requested At'}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {isRTL ? 'الإجراءات' : 'Actions'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {requests.map((request) => (
                                        <tr key={request.Id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                        {request.FullName?.charAt(0) || request.Username?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{request.FullName}</p>
                                                        <p className="text-sm text-gray-500">@{request.Username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {request.Email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <div dir="ltr" className="font-mono text-gray-700">
                                                    {request.PhoneNumber || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(request.Status)}`}>
                                                    {request.Status === 'Pending' && (isRTL ? 'قيد الانتظار' : 'Pending')}
                                                    {request.Status === 'Approved' && (isRTL ? 'مقبول' : 'Approved')}
                                                    {request.Status === 'Rejected' && (isRTL ? 'مرفوض' : 'Rejected')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {formatDate(request.CreatedAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {request.Status === 'Pending' ? (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="success"
                                                            size="sm"
                                                            onClick={() => handleApprove(request.Id)}
                                                            isLoading={actionLoading === request.Id}
                                                            disabled={actionLoading !== null}
                                                        >
                                                            {isRTL ? 'قبول' : 'Approve'}
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => handleReject(request.Id)}
                                                            isLoading={actionLoading === request.Id}
                                                            disabled={actionLoading !== null}
                                                        >
                                                            {isRTL ? 'رفض' : 'Reject'}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        {isRTL ? 'تم الإجراء' : 'Processed'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </main>
        </div>
    );
};

export default AdminDashboardPage;
