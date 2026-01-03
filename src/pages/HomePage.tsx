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
import { ArrowRight, Phone, CheckCircle2, Clock, AlertCircle, X } from 'lucide-react';

const HomePage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated, role, phoneNumber } = useAuth();
    const isRTL = i18n.language === 'ar';

    const [chalets, setChalets] = useState<Chalet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Owner Request State
    const [showPhoneForm, setShowPhoneForm] = useState(false);
    const [contactPhone, setContactPhone] = useState(phoneNumber || '');
    const [requestLoading, setRequestLoading] = useState(false);
    const [requestError, setRequestError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [pendingRequest, setPendingRequest] = useState<OwnerRequest | null>(null);

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

        const fetchPendingRequest = async () => {
            if (isAuthenticated && role === 'Client') {
                try {
                    const data = await getMyOwnerRequest();
                    setPendingRequest(data.request);
                } catch {
                    // No pending request
                }
            }
        };

        fetchChalets();
        fetchPendingRequest();
    }, [t, isAuthenticated, role]);

    const handleOwnerButtonClick = () => {
        if (!isAuthenticated) {
            navigate('/owner/login');
            return;
        }

        if (role === 'Owner' || role === 'Admin') {
            navigate('/owner/dashboard');
            return;
        }

        setShowPhoneForm(true);
    };

    const handleSubmitRequest = async () => {
        const phone = contactPhone.trim();

        // Validate phone number
        if (!phone) {
            setRequestError(isRTL ? 'يرجى إدخال رقم الهاتف' : 'Please enter your phone number');
            return;
        }

        // Check if phone starts with 01 and is 11 digits
        if (!/^01\d{9}$/.test(phone)) {
            setRequestError(isRTL
                ? 'رقم الهاتف يجب أن يكون 11 رقم ويبدأ بـ 01'
                : 'Phone number must be 11 digits and start with 01');
            return;
        }

        try {
            setRequestLoading(true);
            setRequestError(null);
            const result = await requestOwnerUpgrade(contactPhone);
            setPendingRequest(result);
            setSuccessMessage(isRTL
                ? 'تم إرسال طلبك بنجاح! سيتم التواصل معك خلال 24 ساعة.'
                : 'Request submitted! We will contact you within 24 hours.');
            setShowPhoneForm(false);
            setTimeout(() => setSuccessMessage(null), 8000);
        } catch (err: any) {
            setRequestError(err.message || (isRTL ? 'حدث خطأ، حاول مرة أخرى' : 'Failed, please try again'));
        } finally {
            setRequestLoading(false);
        }
    };

    const filteredChalets = Array.isArray(chalets) ? chalets.filter(chalet => {
        const title = (isRTL ? chalet.TitleAr : chalet.TitleEn) || "";
        return title.toLowerCase().includes(searchQuery.toLowerCase());
    }) : [];

    const handleSearch = (query: string) => {
        if (query.trim()) {
            navigate(`/chalets?searchTerm=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
            <HomeHeader
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearch={handleSearch}
            />

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

                {/* Explore All Chalets Catchy Section - High Impact Guest CTA */}
                <div className="px-6 py-20 bg-slate-950 text-white relative overflow-hidden border-y border-white/5">
                    {/* Subtle decorative glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[120px]"></div>

                    <div className="container mx-auto relative z-10">
                        <div className="max-w-4xl mx-auto text-center space-y-8">
                            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                                {isRTL
                                    ? 'لم تجد ما تبحث عنه بعد؟'
                                    : "Haven't found your perfect stay yet?"}
                                <span className="block mt-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                                    {isRTL ? 'اكتشف مجموعتنا الكاملة' : 'Explore our complete collection'}
                                </span>
                            </h2>

                            <p className="text-slate-400 text-lg md:text-2xl max-w-2xl mx-auto font-medium leading-relaxed">
                                {isRTL
                                    ? 'مئات الشاليهات الفاخرة بانتظارك في رأس سدر. اعثر على المكان المثالي لإجازتك القادمة.'
                                    : 'Hundreds of premium chalets await you in Ras Sedr. Find the perfect spot for your next summer escape.'}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                                <Button
                                    onClick={() => navigate('/chalets')}
                                    className="group h-16 px-12 rounded-2xl bg-white text-slate-950 hover:bg-blue-50 font-black text-xl transition-all shadow-2xl shadow-white/5 flex items-center gap-3 w-full sm:w-auto"
                                >
                                    {isRTL ? 'تصفح كل الشاليهات' : 'Browse All Chalets'}
                                    <ArrowRight className={`w-6 h-6 group-hover:translate-x-1.5 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1.5' : ''}`} />
                                </Button>

                                <div className="flex items-center gap-4 text-slate-500 font-bold uppercase tracking-widest text-[11px] py-4 px-8 border border-white/5 rounded-2xl bg-white/5 backdrop-blur-md">
                                    <div className="flex -space-x-3 rtl:space-x-reverse">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="w-9 h-9 rounded-full border-2 border-slate-950 bg-blue-500 overflow-hidden shadow-lg">
                                                <img
                                                    src={`https://i.pravatar.cc/100?u=${i + 10}`}
                                                    alt="user"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-slate-300">500+ {isRTL ? 'عملاء سعداء' : 'Happy Guests'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Minimal Owner CTA Section - Before Footer */}
                {role !== 'Admin' && role !== 'SuperAdmin' && (
                    <div className="bg-white border-t border-gray-200 px-6 py-16">
                        <div className="container mx-auto">
                            <div className="max-w-xl mx-auto text-center space-y-6">
                                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    {isRTL ? 'هل تمتلك شاليه في رأس سدر؟' : 'Own a chalet in Ras Sedr?'}
                                </h3>
                                <p className="text-gray-600 text-lg">
                                    {isRTL
                                        ? 'حوّل شاليهك لمصدر دخل ثابت معنا'
                                        : 'Turn your chalet into a steady income source with us'}
                                </p>

                                {/* Success Message */}
                                {successMessage && (
                                    <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-medium border border-green-200 flex items-center justify-center gap-2">
                                        <CheckCircle2 className="w-5 h-5" />
                                        {successMessage}
                                    </div>
                                )}

                                {/* Already Owner */}
                                {role === 'Owner' && (
                                    <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-sm font-medium border border-blue-200 flex items-center justify-center gap-2">
                                        <CheckCircle2 className="w-5 h-5" />
                                        {isRTL ? 'أنت مسجل كمالك بالفعل!' : "You're already registered as an owner!"}
                                    </div>
                                )}

                                {/* Pending Request Status */}
                                {pendingRequest && (
                                    <div className={`p-4 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 ${pendingRequest.Status === 'Pending'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : pendingRequest.Status === 'Approved'
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-red-50 text-red-700 border-red-200'
                                        }`}>
                                        {pendingRequest.Status === 'Pending' && <Clock className="w-5 h-5" />}
                                        {pendingRequest.Status === 'Approved' && <CheckCircle2 className="w-5 h-5" />}
                                        {pendingRequest.Status === 'Rejected' && <AlertCircle className="w-5 h-5" />}
                                        {pendingRequest.Status === 'Pending' && (isRTL ? 'طلبك قيد المراجعة، سيتم التواصل معك قريباً' : 'Your request is under review')}
                                        {pendingRequest.Status === 'Approved' && (isRTL ? 'تم قبول طلبك!' : 'Your request was approved!')}
                                        {pendingRequest.Status === 'Rejected' && (isRTL ? 'تم رفض الطلب' : 'Request was rejected')}
                                    </div>
                                )}

                                {/* Phone Form */}
                                {showPhoneForm && !pendingRequest && role !== 'Owner' && (
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-semibold text-gray-700">
                                                {isRTL ? 'رقم الهاتف للتواصل' : 'Contact Phone Number'}
                                            </label>
                                            <button
                                                onClick={() => { setShowPhoneForm(false); setRequestError(null); }}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={contactPhone}
                                                onChange={(e) => setContactPhone(e.target.value)}
                                                placeholder="01xxxxxxxxx"
                                                className="w-full bg-white border border-gray-300 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                dir="ltr"
                                            />
                                        </div>

                                        {requestError && (
                                            <p className="text-red-600 text-sm flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {requestError}
                                            </p>
                                        )}

                                        <Button
                                            onClick={handleSubmitRequest}
                                            isLoading={requestLoading}
                                            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                        >
                                            {isRTL ? 'إرسال الطلب' : 'Submit Request'}
                                        </Button>

                                        <p className="text-xs text-gray-500">
                                            {isRTL
                                                ? 'سيتم التواصل معك خلال 24 ساعة للموافقة على طلبك'
                                                : 'We will contact you within 24 hours to approve your request'}
                                        </p>
                                    </div>
                                )}

                                {/* Main CTA Button */}
                                {!showPhoneForm && !pendingRequest && role !== 'Owner' && (
                                    <Button
                                        onClick={handleOwnerButtonClick}
                                        className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                                    >
                                        {isRTL ? 'سجّل كمالك' : 'Register as Owner'}
                                        <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                                    </Button>
                                )}

                                {/* Go to Dashboard Button for Owners */}
                                {role === 'Owner' && (
                                    <Button
                                        onClick={() => navigate('/owner/dashboard')}
                                        className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold inline-flex items-center gap-2"
                                    >
                                        {isRTL ? 'اذهب للوحة التحكم' : 'Go to Dashboard'}
                                        <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;
