import { useTranslation } from 'react-i18next';
import HomeHeader from '../components/HomeHeader';
import Footer from '../components/Footer';

const TermsPage = () => {
    const { i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col" dir={isArabic ? 'rtl' : 'ltr'}>
            <HomeHeader searchQuery="" setSearchQuery={() => { }} />

            <main className="flex-grow container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12">
                    <h1 className="text-3xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-6 text-center md:text-right">
                        {isArabic ? 'الشروط والأحكام' : 'Terms & Conditions'}
                    </h1>

                    <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
                        <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50 flex items-center justify-center gap-4 text-blue-800 font-medium">
                            <span className="text-2xl">⏳</span>
                            <p>
                                {isArabic ? 'سيتم إضافة الشروط والأحكام قريبًا' : 'Terms and conditions will be added soon'}
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TermsPage;
