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
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    Phone,
    Clock,
    LayoutDashboard,
    DollarSign,
    ChevronRight
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
                } catch (err) {
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
        <div className="min-h-screen bg-white flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
            <HomeHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            <main className="flex-grow">
                {/* Hero / Search Section */}
                <div className="relative bg-slate-900 border-b border-white/5 overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-600/10 via-transparent to-transparent opacity-60"></div>
                        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] translate-y-1/2 translate-x-1/2"></div>
                    </div>

                    <div className="container mx-auto px-6 py-16 relative z-10 text-center">
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                            {isRTL ? 'اكتشف أرقى الشاليهات في' : 'Discover Premium Stays in'}{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                                {isRTL ? 'رأس سدر' : 'Ras Sedr'}
                            </span>
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12">
                            {isRTL
                                ? 'احجز عطلتك القادمة بكل سهولة وأمان مع أفضل خيارات الإقامة الفاخرة.'
                                : 'Book your next escape with confidence and luxury in the heart of South Sinai.'}
                        </p>

                        <div className="max-w-4xl mx-auto backdrop-blur-3xl bg-white/5 p-2 rounded-[2.5rem] border border-white/10 shadow-2xl">
                            <SearchForm />
                        </div>
                    </div>
                </div>

                {/* Featured Chalets Section */}
                <div className="px-6 py-20 bg-white">
                    <div className="container mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 text-center md:text-left">
                            <div className="space-y-3">
                                <span className="text-blue-600 text-xs font-black uppercase tracking-[0.3em]">{isRTL ? 'إقامات مميزة' : 'Featured Stays'}</span>
                                <h2 className="text-3xl md:text-4xl font-black text-slate-900">
                                    {isRTL ? 'أفضل الإيجارات تقييماً' : 'Top-rated vacation rentals'}
                                </h2>
                            </div>
                            <Button
                                onClick={() => navigate('/chalets')}
                                variant="ghost"
                                className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 font-black h-12 px-6 rounded-2xl group"
                            >
                                {isRTL ? 'عرض الكل' : 'View All'}
                                <ChevronRight className={`w-4 h-4 transition-transform ${isRTL ? 'rotate-180 mr-2 group-hover:-translate-x-1' : 'ml-2 group-hover:translate-x-1'}`} />
                            </Button>
                        </div>

                        {loading && (
                            <div className="text-center py-20">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                            </div>
                        )}

                        {error && (
                            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-6 py-4 rounded-2xl max-w-2xl mx-auto text-center font-bold">
                                {error}
                            </div>
                        )}

                        {!loading && !error && filteredChalets.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                {filteredChalets.slice(0, 4).map((chalet, index) => (
                                    <ChaletCard key={chalet.Id} chalet={chalet} priority={index < 2} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Become Owner / Monetize Section - PREMUIUM DESIGN */}
                <div className="px-6 py-24 bg-slate-50 border-y border-slate-100 relative overflow-hidden">
                    <div className="container mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                            {/* Content */}
                            <div className="lg:col-span-12 xl:col-span-7 space-y-10 order-2 lg:order-1">
                                <div className="space-y-6 max-w-3xl">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest">
                                        <Sparkles className="w-4 h-4" />
                                        {isRTL ? 'فرصة للملاك' : 'Owner Opportunities'}
                                    </div>
                                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
                                        {isRTL ? 'حول شاليهك إلى مصدر' : 'Turn your chalet into a'}{' '}
                                        <span className="text-blue-600">{isRTL ? 'دخل متنامي' : 'growth machine'}</span>
                                    </h2>
                                    <p className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed">
                                        {isRTL
                                            ? 'انضم إلى شببتنا المتميزة من الملاك في رأس سدر. نحن نوفر لك المنصة والجمهور والأنظمة الذكية لإدارة حجوزاتك بكل احترافية.'
                                            : "Join Ras Sedr's most exclusive owner network. We provide the platform, the audience, and the smart tech to run your business."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                    <div className="p-6 bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl transition-all group">
                                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all"><DollarSign className="w-6 h-6" /></div>
                                        <h4 className="font-black text-slate-800 mb-1">{isRTL ? 'عائدات مرتفعة' : 'High Returns'}</h4>
                                        <p className="text-xs text-slate-500 font-bold">{isRTL ? 'أقل العمولات في السوق.' : 'Market-leading low rates.'}</p>
                                    </div>
                                    <div className="p-6 bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl transition-all group">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all"><LayoutDashboard className="w-6 h-6" /></div>
                                        <h4 className="font-black text-slate-800 mb-1">{isRTL ? 'إدارة ذكية' : 'Smart Dash'}</h4>
                                        <p className="text-xs text-slate-500 font-bold">{isRTL ? 'لوحة تحكم كاملة لشاليهك.' : 'Complete control panel.'}</p>
                                    </div>
                                    <div className="p-6 bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl transition-all group">
                                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all"><ShieldCheck className="w-6 h-6" /></div>
                                        <h4 className="font-black text-slate-800 mb-1">{isRTL ? 'ضمان وأمان' : 'Trust & Safety'}</h4>
                                        <p className="text-xs text-slate-500 font-bold">{isRTL ? 'نظام حجز موثق وآمن.' : 'Verified booking system.'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Card Form */}
                            <div className="lg:col-span-12 xl:col-span-5 order-1 lg:order-2">
                                <div className="bg-white rounded-[3rem] p-8 md:p-10 shadow-[0_40px_80px_-15px_rgba(30,41,59,0.12)] border border-slate-200 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                                    <div className="relative z-10 space-y-8">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 mb-2">
                                                {isRTL ? 'جاهز للانطلاق؟' : 'Ready to start?'}
                                            </h3>
                                            <p className="text-slate-500 text-sm font-bold">
                                                {isRTL
                                                    ? 'أدخل رقم هاتفك وسيقوم فريقنا بالتواصل معك لإكمال إجراءات الترقية.'
                                                    : 'Enter your phone number and our team will guide you through the activation.'}
                                            </p>
                                        </div>

                                        {successMessage && (
                                            <div className="bg-emerald-50 text-emerald-600 p-5 rounded-2xl text-sm font-black border border-emerald-100 flex items-center gap-3 animate-in zoom-in-95 duration-300">
                                                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                                {successMessage}
                                            </div>
                                        )}

                                        {requestError && (
                                            <div className="bg-rose-50 text-rose-600 p-5 rounded-2xl text-sm font-black border border-rose-100 flex items-center gap-3 animate-shake">
                                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                                {requestError}
                                            </div>
                                        )}

                                        {role === 'Owner' || role === 'Admin' ? (
                                            <div className="p-10 text-center space-y-6">
                                                <div className="w-20 h-20 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-blue-200">
                                                    <CheckCircle2 className="w-10 h-10" />
                                                </div>
                                                <h4 className="text-xl font-black text-slate-900">{isRTL ? 'أنت شريكنا المعتمد' : "You're a trusted partner"}</h4>
                                                <Button onClick={() => navigate('/owner/dashboard')} className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 font-black">
                                                    {isRTL ? 'اذهب للوحة التحكم' : 'Go to Dashboard'}
                                                </Button>
                                            </div>
                                        ) : pendingRequest ? (
                                            <div className={`p-8 rounded-[2.5rem] border transition-all space-y-6 text-center ${pendingRequest.Status === 'Pending' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                                                pendingRequest.Status === 'Approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                                    'bg-rose-50 border-rose-100 text-rose-700'
                                                }`}>
                                                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto ${pendingRequest.Status === 'Pending' ? 'bg-amber-500 text-white animate-pulse' :
                                                    pendingRequest.Status === 'Approved' ? 'bg-emerald-500 text-white' :
                                                        'bg-rose-500 text-white'
                                                    }`}>
                                                    {pendingRequest.Status === 'Pending' ? <Clock className="w-8 h-8" /> :
                                                        pendingRequest.Status === 'Approved' ? <CheckCircle2 className="w-8 h-8" /> :
                                                            <AlertCircle className="w-8 h-8" />}
                                                </div>
                                                <div className="space-y-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{isRTL ? 'حالة الطلب' : 'Request Status'}</span>
                                                    <p className="text-lg font-black leading-tight px-4">
                                                        {pendingRequest.Status === 'Pending' ? (isRTL ? 'طلبك قيد المراجعة حالياً' : 'Request is under review') :
                                                            pendingRequest.Status === 'Approved' ? (isRTL ? 'تم تنشيط حساب المالك' : 'Owner account activated') :
                                                                (isRTL ? 'تم رفض الطلب، راجع الإيميل' : 'Rejected, check your email')}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {showBecomeOwnerForm ? (
                                                    <div className="space-y-5 animate-in slide-in-from-bottom-5 duration-500">
                                                        <div className="space-y-3">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                                                                {isRTL ? 'رقم التليفون لنتواصل معك' : 'Contact Phone Number'}
                                                            </label>
                                                            <div className="relative group">
                                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                                                <input
                                                                    type="tel"
                                                                    value={contactPhone}
                                                                    onChange={(e) => setContactPhone(e.target.value)}
                                                                    placeholder="01xxxxxxxxx"
                                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-black"
                                                                />
                                                            </div>
                                                        </div>
                                                        <Button
                                                            onClick={handleRequestOwner}
                                                            isLoading={requestLoading}
                                                            className="w-full h-15 rounded-2.5xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-2xl shadow-blue-200 transform active:scale-[0.98]"
                                                        >
                                                            {isRTL ? 'إرسال الطلب الآن' : 'Send Request Now'}
                                                        </Button>
                                                        <button
                                                            onClick={() => setShowBecomeOwnerForm(false)}
                                                            className="w-full text-center text-xs font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                                                        >
                                                            {isRTL ? 'إلغاء' : 'Cancel'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <Button
                                                            onClick={isAuthenticated ? () => setShowBecomeOwnerForm(true) : () => navigate('/owner/login')}
                                                            className="w-full h-16 rounded-2.5xl bg-slate-900 text-white font-black hover:bg-blue-700 shadow-2xl transition-all flex items-center justify-center gap-3 group/btn hover:scale-[1.02] transform transition-transform"
                                                        >
                                                            <Sparkles className="w-5 h-5 text-blue-400 group-hover/btn:rotate-12 transition-transform" />
                                                            {isRTL ? 'سجل كمالك شريك' : 'List Your Chalet'}
                                                        </Button>
                                                        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                            {isRTL ? 'نحتاج فقط رقم هاتف للتواصل' : 'Priority support included'}
                                                        </p>
                                                    </div>
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
