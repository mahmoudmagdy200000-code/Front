import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Button, Input } from '../components/ui';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { LogIn, User, Lock, ArrowLeft, Loader2, Sparkles, AlertCircle } from 'lucide-react';

const OwnerLoginPage = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated, role, login, googleLogin } = useAuth();
    const isRTL = i18n.language === 'ar';

    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        if (isAuthenticated) {
            if (role === 'Admin') navigate('/admin/owner-requests');
            else if (role === 'Owner') navigate('/owner/dashboard');
            else if (role === 'Client') navigate('/client/dashboard');
            else navigate('/');
        }
    }, [isAuthenticated, role, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!emailOrUsername || !password) {
            setError(isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            await login(emailOrUsername, password);

            const userRole = localStorage.getItem('role');
            if (userRole === 'Admin') navigate('/admin/owner-requests');
            else if (userRole === 'Owner') navigate('/owner/dashboard');
            else navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || (isRTL ? 'فشل تسجيل الدخول' : 'Login failed. Please check your credentials.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#F0F8FF]" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Optimized Background - Summer Vibe Gradient */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-[#F0F8FF] to-[#E3F2FD]"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#4A90E2]/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-[120px]"></div>
            </div>

            {/* Language Switcher Floating */}
            <div className="absolute top-6 right-6 z-20">
                <LanguageSwitcher />
            </div>

            <div className={`relative z-10 w-full max-w-md transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white border border-[#87CEEB]/30 shadow-md mb-6 transform hover:rotate-6 transition-transform">
                        <Sparkles className="w-10 h-10 text-[#4A90E2]" />
                    </div>
                    <h1 className="text-4xl font-black text-[#1A374D] mb-2 tracking-tight">
                        {isRTL ? 'أهلاً بك مجدداً' : 'Welcome Back'}
                    </h1>
                    <p className="text-[#1A374D]/60 font-medium">
                        {isRTL ? 'سجل دخولك لاستكشاف أفضل الشاليهات' : 'Sign in to access your dream escape'}
                    </p>
                </div>

                {/* Soft UI Login Card */}
                <div className="bg-white/90 backdrop-blur-sm border border-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden relative group">
                    {/* Interior Glow */}
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#4A90E2]/5 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-400/5 rounded-full blur-2xl pointer-events-none"></div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#1A374D]/80 flex items-center gap-2 mb-1 px-1">
                                <User className="w-4 h-4" />
                                {isRTL ? 'البريد أو اسم المستخدم' : 'Email or Username'}
                            </label>
                            <div className="relative group/input">
                                <Input
                                    type="text"
                                    value={emailOrUsername}
                                    onChange={(e) => setEmailOrUsername(e.target.value)}
                                    placeholder={isRTL ? 'أدخل بياناتك' : 'Enter your credentials'}
                                    disabled={loading}
                                    className="bg-white border-[#D1D5DB] text-[#1A374D] placeholder:text-gray-400 h-14 rounded-2xl focus:border-[#4A90E2] focus:ring-[#4A90E2]/20 transition-all pl-12 shadow-sm"
                                />
                                <LogIn className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${emailOrUsername ? 'text-[#4A90E2]' : 'text-gray-300'}`} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#1A374D]/80 flex items-center gap-2 mb-1 px-1">
                                <Lock className="w-4 h-4" />
                                {isRTL ? 'كلمة المرور' : 'Password'}
                            </label>
                            <div className="relative group/input">
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter your password'}
                                    disabled={loading}
                                    className="bg-white border-[#D1D5DB] text-[#1A374D] placeholder:text-gray-400 h-14 rounded-2xl focus:border-[#4A90E2] focus:ring-[#4A90E2]/20 transition-all pl-12 shadow-sm"
                                />
                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${password ? 'text-[#4A90E2]' : 'text-gray-300'}`} />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl animate-shake">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                        <AlertCircle className="w-3 h-3" />
                                    </div>
                                    <span className="text-sm font-bold leading-tight">{error}</span>
                                </div>
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            isLoading={loading}
                            className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-200/50 transition-all font-bold text-lg active:scale-95 disabled:opacity-50 text-white"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin mx-auto text-white" />
                            ) : (
                                isRTL ? 'تسجيل الدخول' : 'Sign In'
                            )}
                        </Button>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-8">
                            <div className="h-[1px] flex-1 bg-gray-100"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{isRTL ? 'أو عبر' : 'Or via'}</span>
                            <div className="h-[1px] flex-1 bg-gray-100"></div>
                        </div>

                        {/* Google Auth Wrapper */}
                        <div className="google-auth-container flex justify-center">
                            <div className="w-full [&>div]:!w-full [&>div]:!justify-center [&>div]:!rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform active:scale-[0.98] border border-gray-100 rounded-2xl">
                                <GoogleLogin
                                    onSuccess={async (credentialResponse) => {
                                        if (credentialResponse.credential) {
                                            try {
                                                setLoading(true);
                                                await googleLogin(credentialResponse.credential);
                                                const userRole = localStorage.getItem('role');
                                                if (userRole === 'Admin') navigate('/admin/owner-requests');
                                                else if (userRole === 'Owner') navigate('/owner/dashboard');
                                                else navigate('/');
                                            } catch (err: any) {
                                                setError(isRTL ? 'فشل تسجيل الدخول عبر جوجل' : 'Google login failed');
                                            } finally {
                                                setLoading(false);
                                            }
                                        }
                                    }}
                                    onError={() => {
                                        setError(isRTL ? 'فشل تسجيل الدخول عبر جوجل' : 'Google login failed');
                                    }}
                                    theme="outline"
                                    size="large"
                                    width="350"
                                    shape="pill"
                                />
                            </div>
                        </div>
                    </form>

                    {/* Bottom Links */}
                    <div className="mt-10 space-y-4 relative z-10">
                        <div className="p-1 px-4 text-center">
                            <p className="text-sm text-gray-500 font-medium inline-block">
                                {isRTL ? 'ليس لديك حساب؟' : "Don't have an account?"}
                            </p>
                            <button
                                onClick={() => navigate('/owner/register')}
                                className="text-[#4A90E2] font-black ml-2 hover:text-blue-600 transition-colors underline decoration-2 underline-offset-4"
                            >
                                {isRTL ? 'سجل الآن' : 'Create Account'}
                            </button>
                        </div>

                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-3 rounded-2xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 group/back"
                        >
                            <ArrowLeft className={`w-4 h-4 transition-transform group-hover/back:-translate-x-1 ${isRTL ? 'rotate-180' : ''}`} />
                            <span className="text-xs font-bold uppercase tracking-widest">
                                {isRTL ? 'العودة للرئيسية' : 'Back to Explorer'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Footer Disclaimer */}
                <p className="mt-8 text-center text-gray-400 text-[10px] font-bold uppercase underline-offset-4 tracking-wider px-4">
                    {isRTL ? 'بالدخول أنت توافق على شروط الخدمة وسياسة الخصوصية' : 'By signing in, you agree to our Terms of Service & Privacy Policy'}
                </p>
            </div>
        </div>
    );
};

export default OwnerLoginPage;

