import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8 mt-auto">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link to="/" className="block">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="h-32 w-auto opacity-90 hover:opacity-100 transition-opacity"
                            />
                        </Link>
                        <p className="text-gray-400 leading-relaxed">
                            {isRTL
                                ? 'اكتشف أفضل الشاليهات في رأس سدر. تجربة حجز سهلة ومريحة لقضاء عطلة لا تُنسى.'
                                : 'Discover the best chalets in Ras Sedr. An easy and comfortable booking experience for an unforgettable vacation.'}
                        </p>
                        <div className="flex gap-4">
                            {/* Social Icons */}
                            {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                                <a
                                    key={social}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1"
                                >
                                    <span className="sr-only">{social}</span>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.477 2 2 6.477 2 12c0 5.063 3.77 9.253 8.625 9.88v-6.99h-2.6V12h2.6V9.745c0-2.57 1.524-3.99 3.868-3.99 1.123 0 2.296.2 2.296.2v2.525h-1.293c-1.274 0-1.67.79-1.67 1.6V12h2.844l-.455 2.89h-2.39v6.99C18.23 21.253 22 17.063 22 12c0-5.523-4.477-10-10-10z" />
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xl font-bold mb-6 relative inline-block">
                            {isRTL ? 'روابط سريعة' : 'Quick Links'}
                            <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-blue-500 rounded-full"></span>
                        </h3>
                        <ul className="space-y-4">
                            {[
                                { path: '/', label: isRTL ? 'الرئيسية' : 'Home' },
                                { path: '/chalets', label: isRTL ? 'الشاليهات' : 'Chalets' },
                                { path: '/bookings', label: isRTL ? 'حجوزاتي' : 'My Bookings' },
                            ].map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2 group"
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity ${isRTL ? 'ml-2' : 'mr-2'}`}></span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-xl font-bold mb-6 relative inline-block">
                            {isRTL ? 'تواصل معنا' : 'Contact Us'}
                            <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-blue-500 rounded-full"></span>
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-4 text-gray-400">
                                <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>
                                    {isRTL ? 'رأس سدر، جنوب سيناء، مصر' : 'Ras Sedr, South Sinai, Egypt'}
                                </span>
                            </li>
                            <li className="flex items-center gap-4 text-gray-400">
                                <svg className="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span dir="ltr">+20 123 456 7890</span>
                            </li>
                            <li className="flex items-center gap-4 text-gray-400">
                                <svg className="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>info@chaletbooking.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-xl font-bold mb-6 relative inline-block">
                            {isRTL ? 'النشرة البريدية' : 'Newsletter'}
                            <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-blue-500 rounded-full"></span>
                        </h3>
                        <p className="text-gray-400 mb-4">
                            {isRTL
                                ? 'اشترك معنا ليصلك كل جديد عن العروض والخصومات.'
                                : 'Subscribe to get the latest updates and offers.'}
                        </p>
                        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder={isRTL ? 'البريد الإلكتروني' : 'Email Address'}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-500 transition-colors"
                            />
                            <button
                                type="submit"
                                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-lg transition-all transform hover:-translate-y-0.5 shadow-lg"
                            >
                                {isRTL ? 'اشترك الآن' : 'Subscribe Now'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm text-center md:text-left">
                        © {new Date().getFullYear()} ChaletBooking. {isRTL ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
                    </p>
                    <div className="flex gap-6 text-sm text-gray-500">
                        <Link to="#" className="hover:text-white transition-colors">
                            {isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
                        </Link>
                        <Link to="#" className="hover:text-white transition-colors">
                            {isRTL ? 'الشروط والأحكام' : 'Terms of Service'}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
