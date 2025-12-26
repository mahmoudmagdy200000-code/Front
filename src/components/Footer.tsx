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
                                loading="lazy"
                                className="h-24 md:h-28 w-auto brightness-0 invert opacity-70 transition-all hover:opacity-100"
                            />
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs font-medium">
                            {isRTL
                                ? 'رأس سدر رينتال - بوابتكم الرائدة لحجز أرقى الشاليهات في قلب رأس سدر. نجمع بين السهولة والرفاهية.'
                                : 'Ras Sedr Rental - Your premium gateway to the finest chalets in Ras Sedr. Combining luxury with simplicity.'}
                        </p>
                        <div className="flex gap-4">
                            {/* Social Icons */}
                            {[
                                { name: 'WhatsApp', icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.554 4.189 1.605 6.006L0 24l6.117-1.605a11.803 11.803 0 005.925 1.586h.005c6.637 0 12.032-5.396 12.035-12.032a11.76 11.76 0 00-3.483-8.41z', url: '#' },
                                { name: 'Instagram', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.805.249 2.227.412.56.216.96.474 1.38.894.42.42.678.82.894 1.38.163.422.358 1.057.412 2.227.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.249 1.805-.412 2.227-.216.56-.474.96-.894 1.38-.42.42-.82.678-1.38.894-.422.163-1.057.358-2.227.412-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.805-.249-2.227-.412-.56-.216-.96-.474-1.38-.894-.42-.42-.678-.82-.894-1.38-.163-.422-.358-1.057-.412-2.227-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.054-1.17.249-1.805.412-2.227.216-.56.474-.96.894-1.38.42-.42.82-.678 1.38-.894.422-.163 1.057-.358 2.227-.412 1.266-.058 1.646-.07 4.85-.07zM12 0C8.741 0 8.333.014 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.741 0 12s.014 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126s1.337 1.079 2.126 1.384c.766.296 1.636.499 2.913.558C8.333 23.986 8.741 24 12 24s3.667-.014 4.947-.072c1.277-.06 2.148-.261 2.913-.558.788-.306 1.459-.717 2.126-1.384s1.079-1.337 1.384-2.126c.296-.765.499-1.636.558-2.913.058-1.28.072-1.687.072-4.947s-.014-3.667-.072-4.947c-.06-1.277-.261-2.148-.558-2.913-.306-.788-.717-1.459-1.384-2.126s-1.337-1.079-2.126-1.384c-.765-.296-1.636-.499-2.913-.558C15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z', url: '#' },
                                { name: 'Facebook', icon: 'M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.326V1.326C24 .597 23.403 0 22.675 0z', url: '#' }
                            ].map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    className="w-10 h-10 rounded-2xl bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1 shadow-lg"
                                >
                                    <span className="sr-only">{social.name}</span>
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                        <path d={social.icon} />
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
