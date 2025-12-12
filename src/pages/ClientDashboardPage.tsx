import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Button, Card, LoadingSpinner } from '../components/ui';
import { requestOwnerUpgrade, getMyOwnerRequest, type OwnerRequest } from '../api/admin';

const ClientDashboardPage = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const { role, fullName, email, logout } = useAuth();
    const isRTL = i18n.language === 'ar';

    const [pendingRequest, setPendingRequest] = useState<OwnerRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [requestLoading, setRequestLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Redirect if not a Client
    useEffect(() => {
        if (role === 'Owner') {
            navigate('/owner/dashboard');
        } else if (role === 'Admin') {
            navigate('/admin/owner-requests');
        }
    }, [role, navigate]);

    // Fetch pending request
    useEffect(() => {
        fetchMyRequest();
    }, []);

    const fetchMyRequest = async () => {
        try {
            setLoading(true);
            const data = await getMyOwnerRequest();
            setPendingRequest(data.request);
        } catch (err: any) {
            // Not found is fine, just means no pending request
            if (err.response?.status !== 404) {
                setError(err.message || 'Failed to check request status');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRequestOwner = async () => {
        try {
            setRequestLoading(true);
            setError(null);
            const result = await requestOwnerUpgrade();
            setPendingRequest(result);
            setSuccessMessage(isRTL
                ? 'تم إرسال طلبك بنجاح! سيتم مراجعته من قبل المسؤول.'
                : 'Your request has been submitted! An admin will review it.');
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to submit request');
        } finally {
            setRequestLoading(false);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'Pending':
                return {
                    icon: '⏳',
                    text: isRTL ? 'طلبك قيد المراجعة' : 'Your request is being reviewed',
                    color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
                };
            case 'Approved':
                return {
                    icon: '✅',
                    text: isRTL ? 'تم قبول طلبك! أنت الآن مالك.' : 'Your request was approved! You are now an Owner.',
                    color: 'bg-green-50 border-green-200 text-green-800'
                };
            case 'Rejected':
                return {
                    icon: '❌',
                    text: isRTL ? 'تم رفض طلبك.' : 'Your request was rejected.',
                    color: 'bg-red-50 border-red-200 text-red-800'
                };
            default:
                return null;
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen text={isRTL ? 'جاري التحميل...' : 'Loading...'} />;
    }

    return (
        <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">
                                {isRTL ? 'لوحة تحكم العميل' : 'Client Dashboard'}
                            </h1>
                            <p className="text-blue-200 mt-1">
                                {isRTL ? 'مرحباً' : 'Welcome'}, {fullName || email}
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
                                className="border-white text-white hover:bg-white hover:text-blue-600"
                            >
                                {isRTL ? 'تسجيل الخروج' : 'Logout'}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
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

                {/* Become an Owner Card */}
                <Card className="mb-8">
                    <div className="text-center py-6">
                        <div className="text-6xl mb-4">🏠</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {isRTL ? 'كن مالك شاليه!' : 'Become a Chalet Owner!'}
                        </h2>
                        <p className="text-gray-600 max-w-md mx-auto mb-6">
                            {isRTL
                                ? 'اطلب ترقية حسابك لتتمكن من إضافة وإدارة الشاليهات الخاصة بك.'
                                : 'Request an upgrade to your account to add and manage your own chalets.'}
                        </p>

                        {/* Request Status */}
                        {pendingRequest && (
                            <div className={`mb-6 p-4 rounded-lg border ${getStatusInfo(pendingRequest.Status)?.color}`}>
                                <div className="flex items-center justify-center gap-3">
                                    <span className="text-2xl">{getStatusInfo(pendingRequest.Status)?.icon}</span>
                                    <span className="font-medium">{getStatusInfo(pendingRequest.Status)?.text}</span>
                                </div>
                            </div>
                        )}

                        {/* Request Button */}
                        {!pendingRequest || pendingRequest.Status === 'Rejected' ? (
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleRequestOwner}
                                isLoading={requestLoading}
                                leftIcon={<span className="text-xl">🚀</span>}
                            >
                                {isRTL ? 'طلب ترقية للمالك' : 'Request Owner Upgrade'}
                            </Button>
                        ) : pendingRequest.Status === 'Pending' ? (
                            <Button
                                variant="secondary"
                                size="lg"
                                disabled
                                leftIcon={<span className="text-xl">⏳</span>}
                            >
                                {isRTL ? 'الطلب قيد المراجعة' : 'Request Pending'}
                            </Button>
                        ) : null}
                    </div>
                </Card>

                {/* Benefits Card */}
                <Card>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        {isRTL ? 'مميزات المالك' : 'Owner Benefits'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                            <span className="text-2xl">🏖️</span>
                            <div>
                                <h4 className="font-medium text-gray-800">
                                    {isRTL ? 'إضافة شاليهات' : 'Add Chalets'}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    {isRTL ? 'أضف شاليهاتك الخاصة للعرض' : 'List your own chalets for booking'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                            <span className="text-2xl">📅</span>
                            <div>
                                <h4 className="font-medium text-gray-800">
                                    {isRTL ? 'إدارة الحجوزات' : 'Manage Bookings'}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    {isRTL ? 'استلم وأدر الحجوزات' : 'Receive and manage booking requests'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                            <span className="text-2xl">💰</span>
                            <div>
                                <h4 className="font-medium text-gray-800">
                                    {isRTL ? 'كسب الدخل' : 'Earn Income'}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    {isRTL ? 'حقق دخلاً من تأجير شاليهاتك' : 'Generate income from your properties'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                            <span className="text-2xl">📊</span>
                            <div>
                                <h4 className="font-medium text-gray-800">
                                    {isRTL ? 'لوحة تحكم' : 'Dashboard'}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    {isRTL ? 'لوحة تحكم خاصة لإدارة كل شيء' : 'Dedicated dashboard to manage everything'}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </main>
        </div>
    );
};

export default ClientDashboardPage;
