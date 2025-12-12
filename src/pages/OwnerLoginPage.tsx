import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/ui';
import LanguageSwitcher from '../components/LanguageSwitcher';

const OwnerLoginPage = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const { login } = useAuth();
    const isRTL = i18n.language === 'ar';

    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

            // Get role from localStorage after successful login
            const userRole = localStorage.getItem('role');

            // Redirect based on role
            if (userRole === 'Admin') {
                navigate('/admin/owner-requests');
            } else if (userRole === 'Owner') {
                navigate('/owner/dashboard');
            } else {
                // Client goes to homepage
                navigate('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || (isRTL ? 'فشل تسجيل الدخول' : 'Login failed. Please check your credentials.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Language Switcher */}
            <div className="absolute top-4 right-4">
                <LanguageSwitcher />
            </div>

            <Card className="w-full max-w-md">
                {/* Logo/Title */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🏖️</div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {isRTL ? 'تسجيل الدخول' : 'Welcome Back'}
                    </h1>
                    <p className="text-gray-600">
                        {isRTL ? 'قم بتسجيل الدخول إلى حسابك' : 'Sign in to your account'}
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        type="text"
                        label={isRTL ? 'البريد الإلكتروني أو اسم المستخدم' : 'Email or Username'}
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        placeholder={isRTL ? 'أدخل البريد الإلكتروني أو اسم المستخدم' : 'Enter email or username'}
                        disabled={loading}
                        required
                    />

                    <Input
                        type="password"
                        label={isRTL ? 'كلمة المرور' : 'Password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter password'}
                        disabled={loading}
                        required
                    />

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={loading}
                        className="w-full"
                    >
                        {isRTL ? 'تسجيل الدخول' : 'Login'}
                    </Button>
                </form>

                {/* Register Link */}
                <div className="mt-6 text-center border-t border-gray-100 pt-6">
                    <p className="text-gray-600 mb-3">
                        {isRTL ? 'ليس لديك حساب؟' : "Don't have an account?"}
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/owner/register')}
                        className="w-full"
                    >
                        {isRTL ? 'سجل الآن' : 'Create Account'}
                    </Button>
                </div>

                {/* Back to Home */}
                <div className="mt-4 text-center">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="text-sm"
                    >
                        ← {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default OwnerLoginPage;
