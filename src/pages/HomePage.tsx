import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getChalets } from '../api/chalets';
import type { Chalet } from '../types/chalet';
import ChaletCard from '../components/ChaletCard';
import HomeHeader from '../components/HomeHeader';
import Footer from '../components/Footer';
import SearchForm from '../components/SearchForm';
import { Button } from '../components/ui';
import { ArrowRight } from 'lucide-react';

const HomePage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const isRTL = i18n.language === 'ar';

    const [chalets, setChalets] = useState<Chalet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

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

        fetchChalets();
    }, [t]);

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

                {/* Minimal Owner CTA Section - Before Footer */}
                <div className="bg-white border-t border-gray-200 px-6 py-16">
                    <div className="container mx-auto">
                        <div className="max-w-2xl mx-auto text-center space-y-6">
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                                {isRTL ? 'هل تمتلك شاليه في رأس سدر؟' : 'Own a chalet in Ras Sedr?'}
                            </h3>
                            <p className="text-gray-600 text-lg">
                                {isRTL
                                    ? 'حوّل شاليهك لمصدر دخل ثابت معنا'
                                    : 'Turn your chalet into a steady income source with us'}
                            </p>
                            <Button
                                onClick={() => navigate('/owner/login')}
                                className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                            >
                                {isRTL ? 'سجّل كمالك' : 'Register as Owner'}
                                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;
