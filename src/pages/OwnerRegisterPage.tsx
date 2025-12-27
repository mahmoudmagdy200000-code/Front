import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '../components/ui';
import LanguageSwitcher from '../components/LanguageSwitcher';
import axiosInstance from '../api/axios';
import {
    User, Mail, Lock, Phone, UserPlus, ArrowLeft,
    ShieldCheck, CheckCircle2, AlertCircle, Loader2, Sparkles,
    Eye, EyeOff
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const OwnerRegisterPage = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated, role } = useAuth();
    const isRTL = i18n.language === 'ar';

    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        if (isAuthenticated) {
            if (role === 'Admin') navigate('/admin/owner-requests');
            else if (role === 'Owner') navigate('/owner/dashboard');
            else if (role === 'Client') navigate('/client/dashboard');
            else navigate('/');
        }
    }, [isAuthenticated, role, navigate]);

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [field]: e.target.value });
        setError(null);
    };

    const validateForm = (): string | null => {
        if (!formData.fullName || !formData.username || !formData.email || !formData.password || !formData.confirmPassword || !formData.phoneNumber) {
            return isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields';
        }

        if (formData.password !== formData.confirmPassword) {
            return isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match';
        }

        if (formData.password.length < 8) {
            return isRTL ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters';
        }

        const hasUpperCase = /[A-Z]/.test(formData.password);
        const hasLowerCase = /[a-z]/.test(formData.password);
        const hasDigit = /\d/.test(formData.password);
        const hasSpecial = /[^\da-zA-Z]/.test(formData.password);

        if (!hasUpperCase || !hasLowerCase || !hasDigit || !hasSpecial) {
            return isRTL
                ? 'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم ورمز خاص'
                : 'Password must contain uppercase, lowercase, digit, and special character';
        }

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);
            const apiPayload = {
                FullName: formData.fullName,
                Username: formData.username,
                Email: formData.email,
                PhoneNumber: formData.phoneNumber,
                Password: formData.password,
                ConfirmPassword: formData.confirmPassword
            };

            await axiosInstance.post('/auth/register', apiPayload);
            setSuccess(true);
            setTimeout(() => {
                navigate('/owner/login');
            }, 2500);
        } catch (err: any) {
            let errorMessage = '';
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.data?.errors) {
                errorMessage = Object.values(err.response.data.errors).flat().join('\n');
            } else {
                errorMessage = isRTL ? 'فشل التسجيل. يرجى المحاولة مرة أخرى.' : 'Registration failed. Please try again.';
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const passwordRequirements = [
        { label: isRTL ? '8 أحرف على الأقل' : 'Min 8 characters', met: formData.password.length >= 8 },
        { label: isRTL ? 'حرف كبير (A-Z)' : 'Uppercase letter', met: /[A-Z]/.test(formData.password) },
        { label: isRTL ? 'حرف صغير (a-z)' : 'Lowercase letter', met: /[a-z]/.test(formData.password) },
        { label: isRTL ? 'رقم واحد (0-9)' : 'One digit', met: /\d/.test(formData.password) },
        { label: isRTL ? 'رمز خاص (!@#$)' : 'Special char', met: /[^\da-zA-Z]/.test(formData.password) },
    ];

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 md:p-8 overflow-x-hidden bg-[#F0F8FF]" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Optimized Background - Summer Vibe Gradient */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-white via-[#F0F8FF] to-[#E3F2FD]"></div>
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#4A90E2]/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-[120px]"></div>
            </div>

            {/* Language Switcher */}
            <div className="absolute top-6 right-6 z-20">
                <LanguageSwitcher />
            </div>

            <div className={`relative z-10 w-full max-w-2xl transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-[#87CEEB]/30 shadow-md mb-4 group cursor-pointer">
                        <UserPlus className="w-8 h-8 text-[#4A90E2] group-hover:scale-110 transition-transform" />
                    </div>
                    <h1 className="text-4xl font-black text-[#1A374D] mb-2 tracking-tight drop-shadow-sm">
                        {isRTL ? 'انضم إلينا اليوم' : 'Join Our Community'}
                    </h1>
                    <p className="text-[#1A374D]/60 font-medium">
                        {isRTL ? 'ابدأ رحلتك في عالم الفخامة والخصوصية' : 'Start your journey into premium chalet experiences'}
                    </p>
                </div>

                {/* Soft UI Card */}
                <div className="bg-white/90 backdrop-blur-sm border border-white rounded-[3rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                    {/* Visual Accents */}
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#4A90E2]/5 rounded-full blur-[60px] pointer-events-none"></div>
                    <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-cyan-400/5 rounded-full blur-[60px] pointer-events-none"></div>

                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                        {/* Section 1: Personal Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-[#1A374D]/60 px-1 ml-1 flex items-center gap-2">
                                    <User className="w-3 h-3 text-[#4A90E2]" /> {isRTL ? 'الاسم الكامل' : 'Full Name'}
                                </label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={handleChange('fullName')}
                                        placeholder={isRTL ? "أدخل اسمك" : "John Doe"}
                                        className="bg-white border-[#D1D5DB] text-[#1A374D] placeholder:text-gray-400 h-14 rounded-2xl focus:border-[#4A90E2] shadow-sm"
                                    />
                                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-[#1A374D]/60 px-1 ml-1 flex items-center gap-2">
                                    <Phone className="w-3 h-3 text-[#4A90E2]" /> {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                                </label>
                                <div className="relative">
                                    <Input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={handleChange('phoneNumber')}
                                        placeholder={isRTL ? "01xxxxxxxxx" : "01xxxxxxxxx"}
                                        className="bg-white border-[#D1D5DB] text-[#1A374D] placeholder:text-gray-400 h-14 rounded-2xl focus:border-[#4A90E2] shadow-sm"
                                    />
                                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Account details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-[#1A374D]/60 px-1 ml-1 flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-[#4A90E2]" /> {isRTL ? 'اسم المستخدم' : 'Username'}
                                </label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        value={formData.username}
                                        onChange={handleChange('username')}
                                        placeholder={isRTL ? "اختر معرفاً" : "johny_99"}
                                        className="bg-white border-[#D1D5DB] text-[#1A374D] placeholder:text-gray-400 h-14 rounded-2xl focus:border-[#4A90E2] shadow-sm"
                                    />
                                    <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-[#1A374D]/60 px-1 ml-1 flex items-center gap-2">
                                    <Mail className="w-3 h-3 text-[#4A90E2]" /> {isRTL ? 'البريد الإلكتروني' : 'Email Address'}
                                </label>
                                <div className="relative">
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange('email')}
                                        placeholder="example@mail.com"
                                        className="bg-white border-[#D1D5DB] text-[#1A374D] placeholder:text-gray-400 h-14 rounded-2xl focus:border-[#4A90E2] shadow-sm"
                                    />
                                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Security */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-[#1A374D]/60 px-1 ml-1 flex items-center gap-2">
                                    <Lock className="w-3 h-3 text-[#4A90E2]" /> {isRTL ? 'كلمة المرور' : 'Secure Password'}
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange('password')}
                                        className="bg-white border-[#D1D5DB] text-[#1A374D] h-14 rounded-2xl pr-12 focus:border-[#4A90E2] shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-[#1A374D]/60 px-1 ml-1 flex items-center gap-2">
                                    <Lock className="w-3 h-3 text-[#4A90E2]" /> {isRTL ? 'تأكيد كلمة المرور' : 'Verify Password'}
                                </label>
                                <Input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange('confirmPassword')}
                                    className="bg-white border-[#D1D5DB] text-[#1A374D] h-14 rounded-2xl focus:border-[#4A90E2] shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Password Requirements Visualization */}
                        <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {passwordRequirements.map((req, i) => (
                                    <div key={i} className="flex items-center gap-2 transition-all">
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${req.met ? 'bg-green-100' : 'bg-gray-200'}`}>
                                            <CheckCircle2 className={`w-3 h-3 ${req.met ? 'text-green-600' : 'text-gray-400'}`} />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-tighter ${req.met ? 'text-green-700' : 'text-gray-400'}`}>
                                            {req.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Status Messages */}
                        {success && (
                            <div className="bg-green-50 border border-green-100 text-green-600 p-4 rounded-2xl animate-pulse text-center">
                                <span className="font-bold">{isRTL ? 'تم إنشاء الحساب بنجاح! جاري التوجه للمصادقة...' : 'Account created! Redirecting to login...'}</span>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <span className="text-sm font-bold">{error}</span>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-4">
                            <Button
                                type="submit"
                                variant="success"
                                size="lg"
                                isLoading={loading}
                                disabled={success}
                                className="w-full h-16 rounded-[1.5rem] bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-200/50 transition-all font-black text-lg text-white"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-white" /> : (isRTL ? 'إنشاء حساب جديد' : 'Create My Account')}
                            </Button>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                                <p className="text-sm text-gray-500 font-medium">
                                    {isRTL ? 'لديك حساب بالفعل؟' : 'Already have an account?'}
                                    <button
                                        type="button"
                                        onClick={() => navigate('/owner/login')}
                                        className="ml-2 font-black text-[#4A90E2] hover:text-blue-600 transition-colors uppercase tracking-widest text-xs border-b border-[#4A90E2]/30"
                                    >
                                        {isRTL ? 'تسجيل الدخول' : 'Sign In instead'}
                                    </button>
                                </p>

                                <button
                                    type="button"
                                    onClick={() => navigate('/')}
                                    className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors text-xs font-black uppercase tracking-[0.2em]"
                                >
                                    <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                                    {isRTL ? 'العودة' : 'Explorer'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Secure Badge */}
                <div className="mt-8 flex items-center justify-center gap-3 text-gray-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">{isRTL ? 'بياناتك مشفرة وآمنة تماماً' : 'Encrypted & Secure Registration'}</span>
                </div>
            </div>
        </div>

    );
};

export default OwnerRegisterPage;

