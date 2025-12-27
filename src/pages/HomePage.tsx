import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getChalets } from '../api/chalets';
import type { Chalet } from '../types/chalet';
import { requestOwnerUpgrade, getMyOwnerRequest, type OwnerRequest } from '../api/admin';
import { useAuth } from '../context/AuthContext';
import ChaletCard from '../components/ChaletCard';
import HomeHeader from '../components/HomeHeader';
import Footer from '../components/Footer';
import SearchForm from '../components/SearchForm';
import { Button } from '../components/ui';
import {
    Sparkles,
    Phone,
    CheckCircle2,
    Clock,
    AlertCircle,
    ShieldCheck,
    DollarSign,
    LayoutDashboard
} from 'lucide-react';

const HomePage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated, role, phoneNumber } = useAuth();
    const isRTL = i18n.language === 'ar';

    const [chalets, setChalets] = useState<Chalet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Owner Upgrade State
    const [pendingRequest, setPendingRequest] = useState<OwnerRequest | null>(null);
    const [requestLoading, setRequestLoading] = useState(false);
    const [requestError, setRequestError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [contactPhone, setContactPhone] = useState(phoneNumber || '');
    const [showBecomeOwnerForm, setShowBecomeOwnerForm] = useState(false);

    useEffect(() => {
        const fetchChalets = async () => {
            try {
                setLoading(true);
                const result = await getChalets({ isFeatured: true, pageSize: 6 });
                setChalets(result.Items);
                setError(null);
            } catch (err: any) {
                setError(t('common.error'));
                console.error('Error fetching chalets:', err);
            } finally {
                setLoading(false);
            }
        };

        const fetchRequest = async () => {
            if (isAuthenticated && role === 'Client') {
                try {
                    const data = await getMyOwnerRequest();
                    setPendingRequest(data.request);
                } catch {
                    // Silently fail if no request found
                }
            }
        };

        fetchChalets();
        fetchRequest();
    }, [t, isAuthenticated, role]);

    const handleRequestOwner = async () => {
        if (!isAuthenticated) {
            navigate('/owner/login');
            return;
        }

        if (!contactPhone) {
            setRequestError(isRTL ? 'يرجى إدخال رقم الهاتف للتواصل' : 'Please enter your phone number');
            return;
        }

        try {
            setRequestLoading(true);
            setRequestError(null);
            const result = await requestOwnerUpgrade(contactPhone);
            setPendingRequest(result);
            setSuccessMessage(isRTL
                ? 'تم إرسال طلبك بنجاح! سنتواصل معك قريباً.'
                : 'Request submitted! We will contact you soon.');
            setShowBecomeOwnerForm(false);
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err: any) {
            setRequestError(err.message || 'Failed to submit request');
        } finally {
            setRequestLoading(false);
        }
    };

    const filteredChalets = Array.isArray(chalets) ? chalets.filter(chalet => {
        const title = (isRTL ? chalet.TitleAr : chalet.TitleEn) || "";
        return title.toLowerCase().includes(searchQuery.toLowerCase());
    }) : [];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
            <HomeHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            <main className="flex-grow">
                {/* Search Form Section */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-12 border-b border-gray-200">
                    <div className="container mx-auto">
                        <SearchForm />
                    </div>
                </div>

                {/* Featured Section */}
                <div className="px-6 py-12">
                    <div className="container mx-auto">
                        {/* Section Header */}
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-3">
                                {isRTL ? 'أفضل الإيجارات في رأس سدر' : 'Top-rated vacation rentals in Ras Sedr'}
                            </h2>
                            <p className="text-gray-600 text-lg">
                                {isRTL
                                    ? 'يتفق الضيوف: هذه الإقامات تحظى بتقييمات عالية للموقع والنظافة والمزيد.'
                                    : 'Guests agree: these stays are highly rated for location, cleanliness, and more.'}
                            </p>
                        </div>

                        {loading && (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                                <p className="mt-4 text-gray-600">{t('common.loading')}</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-2xl mx-auto">
                                {error}
                            </div>
                        )}

                        {!loading && !error && filteredChalets.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                                {filteredChalets.slice(0, 6).map((chalet, index) => (
                                    <ChaletCard key={chalet.Id} chalet={chalet} priority={index < 2} />
                                ))}
                            </div>
                        )}

                        {!loading && !error && filteredChalets.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">
                                    {isRTL ? 'لا توجد شاليهات متاحة' : 'No chalets available'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Become Owner Section */}
                <div className="px-6 py-16 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                    </div>

                    <div className="container mx-auto relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            {/* Left Content */}
                            <div className="text-center lg:text-left space-y-6">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-semibold">
                                    <Sparkles className="w-4 h-4 text-yellow-300" />
                                    {isRTL ? 'فرصة للملاك' : 'Owner Opportunity'}
                                </div>

                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight">
                                    {isRTL ? 'عندك شاليه في رأس سدر؟' : 'Own a Chalet in Ras Sedr?'}
                                </h2>

                                <p className="text-blue-100 text-lg md:text-xl max-w-xl">
                                    {isRTL
                                        ? 'انضم لمنصتنا وابدأ في تأجير شاليهك بكل سهولة. نوفر لك إدارة الحجوزات والتواصل مع العملاء.'
                                        : 'Join our platform and start renting your chalet easily. We handle bookings and customer communication for you.'}
                                </p>

                                {/* Benefits */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                                    <div className="flex items-center gap-3 text-white/90">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                            <DollarSign className="w-5 h-5 text-green-300" />
                                        </div>
                                        <span className="text-sm font-medium">{isRTL ? 'دخل إضافي' : 'Extra Income'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/90">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                            <LayoutDashboard className="w-5 h-5 text-cyan-300" />
                                        </div>
                                        <span className="text-sm font-medium">{isRTL ? 'لوحة تحكم' : 'Dashboard'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/90">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                            <ShieldCheck className="w-5 h-5 text-blue-300" />
                                        </div>
                                        <span className="text-sm font-medium">{isRTL ? 'دعم مستمر' : '24/7 Support'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Card */}
                            <div className="flex justify-center lg:justify-end">
                                <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
                                    <div className="space-y-6">
                                        <div className="text-center">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                                {isRTL ? 'سجل كمالك شاليه' : 'Register as Owner'}
                                            </h3>
                                            <p className="text-gray-500 text-sm">
                                                {isRTL
                                                    ? 'أدخل رقم هاتفك وسيتواصل معك فريقنا'
                                                    : 'Enter your phone and our team will contact you'}
                                            </p>
                                        </div>

                                        {successMessage && (
                                            <div className="bg-green-50 text-green-700 p-4 rounded-2xl text-sm font-medium border border-green-100 flex items-center gap-3">
                                                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                                {successMessage}
                                            </div>
                                        )}

                                        {requestError && (
                                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100 flex items-center gap-3">
                                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                                {requestError}
                                            </div>
                                        )}

                                        {role === 'Owner' || role === 'Admin' ? (
                                            <div className="text-center space-y-4 py-4">
                                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                                </div>
                                                <p className="text-gray-700 font-semibold">
                                                    {isRTL ? 'أنت مسجل كمالك بالفعل!' : "You're already registered as an owner!"}
                                                </p>
                                                <Button
                                                    onClick={() => navigate('/owner/dashboard')}
                                                    className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                                >
                                                    {isRTL ? 'اذهب للوحة التحكم' : 'Go to Dashboard'}
                                                </Button>
                                            </div>
                                        ) : pendingRequest ? (
                                            <div className={`p-6 rounded-2xl border text-center space-y-3 ${pendingRequest.Status === 'Pending' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                                    pendingRequest.Status === 'Approved' ? 'bg-green-50 border-green-200 text-green-700' :
                                                        'bg-red-50 border-red-200 text-red-700'
                                                }`}>
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${pendingRequest.Status === 'Pending' ? 'bg-amber-200' :
                                                        pendingRequest.Status === 'Approved' ? 'bg-green-200' :
                                                            'bg-red-200'
                                                    }`}>
                                                    {pendingRequest.Status === 'Pending' ? <Clock className="w-6 h-6" /> :
                                                        pendingRequest.Status === 'Approved' ? <CheckCircle2 className="w-6 h-6" /> :
                                                            <AlertCircle className="w-6 h-6" />}
                                                </div>
                                                <p className="font-semibold">
                                                    {pendingRequest.Status === 'Pending' ? (isRTL ? 'طلبك قيد المراجعة' : 'Request under review') :
                                                        pendingRequest.Status === 'Approved' ? (isRTL ? 'تم قبول طلبك!' : 'Request approved!') :
                                                            (isRTL ? 'تم رفض الطلب' : 'Request rejected')}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {showBecomeOwnerForm ? (
                                                    <>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-gray-700">
                                                                {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                                                            </label>
                                                            <div className="relative">
                                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                                <input
                                                                    type="tel"
                                                                    value={contactPhone}
                                                                    onChange={(e) => setContactPhone(e.target.value)}
                                                                    placeholder="01xxxxxxxxx"
                                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                                    dir="ltr"
                                                                />
                                                            </div>
                                                        </div>
                                                        <Button
                                                            onClick={handleRequestOwner}
                                                            isLoading={requestLoading}
                                                            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200"
                                                        >
                                                            {isRTL ? 'إرسال الطلب' : 'Submit Request'}
                                                        </Button>
                                                        <button
                                                            onClick={() => setShowBecomeOwnerForm(false)}
                                                            className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
                                                        >
                                                            {isRTL ? 'إلغاء' : 'Cancel'}
                                                        </button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        onClick={isAuthenticated ? () => setShowBecomeOwnerForm(true) : () => navigate('/owner/login')}
                                                        className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg flex items-center justify-center gap-2"
                                                    >
                                                        <Sparkles className="w-5 h-5" />
                                                        {isRTL ? 'أضف شاليهك الآن' : 'List Your Chalet Now'}
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;
