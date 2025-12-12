import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Input, Card } from '../components/ui';
import LanguageSwitcher from '../components/LanguageSwitcher';
import axiosInstance from '../api/axios';

const OwnerRegisterPage = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const isRTL = i18n.language === 'ar';

    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        // Note: Role removed - backend forces 'Client' for all registrations
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [field]: e.target.value });
        setError(null); // Clear error on input change
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

        // Password complexity check
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

            // Map to PascalCase for API
            const apiPayload = {
                FullName: formData.fullName,
                Username: formData.username,
                Email: formData.email,
                PhoneNumber: formData.phoneNumber,
                Password: formData.password,
                ConfirmPassword: formData.confirmPassword
            };

            await axiosInstance.post('/api/auth/register', apiPayload);
            setSuccess(true);
            setTimeout(() => {
                navigate('/owner/login');
            }, 2000);
        } catch (err: any) {
            console.error('Registration failed', err);
            let errorMessage = '';

            if (err.response) {
                // Server responded with a status code
                const data = err.response.data;

                if (data?.message) {
                    errorMessage = data.message;
                } else if (data?.errors) {
                    // ASP.NET Core Validation Problem Details
                    if (typeof data.errors === 'object') {
                        errorMessage = Object.values(data.errors).flat().join('\n');
                    } else if (Array.isArray(data.errors)) {
                        errorMessage = data.errors.join('\n');
                    }
                } else if (typeof data === 'string') {
                    errorMessage = data;
                } else {
                    // Fallback to showing the status text or raw data
                    errorMessage = `Server Error (${err.response.status}): ${JSON.stringify(data)}`;
                }
            } else if (err.request) {
                // Request was made but no response received
                errorMessage = isRTL ? 'لم يتم استلام رد من الخادم. تحقق من اتصالك بالإنترنت.' : 'No response from server. Check your internet connection.';
            } else {
                // Request setup error
                errorMessage = isRTL ? 'حدث خطأ غير متوقع.' : `Unexpected error: ${err.message}`;
            }

            // Final fallback
            if (!errorMessage) {
                errorMessage = isRTL ? 'فشل التسجيل. يرجى المحاولة مرة أخرى.' : 'Registration failed. Please try again.';
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Language Switcher */}
            <div className="absolute top-4 right-4">
                <LanguageSwitcher />
            </div>

            <Card className="w-full max-w-md">
                {/* Logo/Title */}
                <div className="text-center mb-6">
                    <div className="text-6xl mb-4">🏖️</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        {isRTL ? 'تسجيل حساب جديد' : 'Create Account'}
                    </h1>
                </div>

                {/* Register Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        type="text"
                        label={isRTL ? 'الاسم الكامل' : 'Full Name'}
                        value={formData.fullName}
                        onChange={handleChange('fullName')}
                        placeholder={isRTL ? 'أدخل الاسم الكامل' : 'Enter your full name'}
                        disabled={loading}
                        required
                    />

                    <Input
                        type="tel"
                        label={isRTL ? 'رقم الهاتف' : 'Phone Number'}
                        value={formData.phoneNumber}
                        onChange={handleChange('phoneNumber')}
                        placeholder={isRTL ? 'أدخل رقم الهاتف' : 'Enter phone number'}
                        disabled={loading}
                        required
                    />

                    <Input
                        type="text"
                        label={isRTL ? 'اسم المستخدم' : 'Username'}
                        value={formData.username}
                        onChange={handleChange('username')}
                        placeholder={isRTL ? 'أدخل اسم المستخدم' : 'Enter username'}
                        disabled={loading}
                        required
                    />

                    <Input
                        type="email"
                        label={isRTL ? 'البريد الإلكتروني' : 'Email'}
                        value={formData.email}
                        onChange={handleChange('email')}
                        placeholder={isRTL ? 'أدخل البريد الإلكتروني' : 'Enter email'}
                        disabled={loading}
                        required
                    />

                    <Input
                        type="password"
                        label={isRTL ? 'كلمة المرور' : 'Password'}
                        value={formData.password}
                        onChange={handleChange('password')}
                        placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter password'}
                        disabled={loading}
                        required
                        helperText={isRTL ? '8 أحرف على الأقل، حرف كبير، حرف صغير، رقم، ورمز خاص' : 'Min 8 chars, uppercase, lowercase, digit, special char'}
                    />

                    <Input
                        type="password"
                        label={isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                        value={formData.confirmPassword}
                        onChange={handleChange('confirmPassword')}
                        placeholder={isRTL ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
                        disabled={loading}
                        required
                    />

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>{isRTL ? 'تم التسجيل بنجاح! جاري التحويل...' : 'Registration successful! Redirecting...'}</span>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="success"
                        size="lg"
                        isLoading={loading}
                        disabled={success}
                        className="w-full"
                    >
                        {isRTL ? 'تسجيل' : 'Register'}
                    </Button>
                </form>

                {/* Already have account */}
                <div className="mt-6 text-center border-t border-gray-100 pt-6">
                    <p className="text-gray-600 mb-3">
                        {isRTL ? 'لديك حساب بالفعل؟' : 'Already have an account?'}
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/owner/login')}
                        className="w-full"
                    >
                        {isRTL ? 'تسجيل الدخول' : 'Login'}
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

                {/* Password Requirements */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                        {isRTL ? 'متطلبات كلمة المرور:' : 'Password Requirements:'}
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                        <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            {isRTL ? 'على الأقل 8 أحرف' : 'At least 8 characters'}
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            {isRTL ? 'حرف كبير واحد (A-Z)' : 'One uppercase letter (A-Z)'}
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            {isRTL ? 'حرف صغير واحد (a-z)' : 'One lowercase letter (a-z)'}
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            {isRTL ? 'رقم واحد (0-9)' : 'One digit (0-9)'}
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            {isRTL ? 'رمز خاص (!@#$%...)' : 'One special character (!@#$%...)'}
                        </li>
                    </ul>
                </div>
            </Card>
        </div>
    );
};

export default OwnerRegisterPage;
