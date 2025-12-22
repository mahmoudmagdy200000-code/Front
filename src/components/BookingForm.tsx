import { useState } from 'react';
import { formatDateToDDMMYYYY, parseDateFromDDMMYYYY, isValidDateFormat } from '../utils/dateUtils';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { checkAvailability, createBooking } from '../api/bookings';
import type { Booking } from '../types/booking';
import DatePicker from './DatePicker';

interface BookingFormProps {
    chaletId: number;
    pricePerNight: number;
    initialCheckIn?: string;
    initialCheckOut?: string;
}

const BookingForm = ({ chaletId, pricePerNight, initialCheckIn = '', initialCheckOut = '' }: BookingFormProps) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    // Convert initial dates from YYYY-MM-DD to DD/MM/YYYY for display
    const [checkInDate, setCheckInDate] = useState(initialCheckIn ? formatDateToDDMMYYYY(initialCheckIn) : '');
    const [checkOutDate, setCheckOutDate] = useState(initialCheckOut ? formatDateToDDMMYYYY(initialCheckOut) : '');
    const [userPhoneNumber, setUserPhoneNumber] = useState('');
    const [isAcceptedTerms, setIsAcceptedTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

    // Error states
    const [errors, setErrors] = useState<{
        checkIn?: string;
        checkOut?: string;
        dates?: string;
    }>({});

    const calculateNights = () => {
        if (!checkInDate || !checkOutDate) return 0;

        // Parse DD/MM/YYYY format to Date objects
        const [inDay, inMonth, inYear] = checkInDate.split('/');
        const [outDay, outMonth, outYear] = checkOutDate.split('/');

        const start = new Date(parseInt(inYear), parseInt(inMonth) - 1, parseInt(inDay));
        const end = new Date(parseInt(outYear), parseInt(outMonth) - 1, parseInt(outDay));

        const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return nights > 0 ? nights : 0;
    };

    const nights = calculateNights();
    const totalPrice = nights * pricePerNight;

    const handleCheckAvailability = async () => {
        setErrors({});

        if (!checkInDate || !checkOutDate) {
            setErrors({
                checkIn: !checkInDate ? (isRTL ? 'اختر تاريخ الوصول' : 'Select check-in date') : undefined,
                checkOut: !checkOutDate ? (isRTL ? 'اختر تاريخ المغادرة' : 'Select check-out date') : undefined,
            });
            return;
        }

        // Validate date format
        if (!isValidDateFormat(checkInDate) || !isValidDateFormat(checkOutDate)) {
            setErrors({
                checkIn: !isValidDateFormat(checkInDate) ? (isRTL ? 'صيغة التاريخ غير صحيحة' : 'Invalid date format') : undefined,
                checkOut: !isValidDateFormat(checkOutDate) ? (isRTL ? 'صيغة التاريخ غير صحيحة' : 'Invalid date format') : undefined,
            });
            return;
        }

        // Convert to YYYY-MM-DD format for API
        const checkInISO = parseDateFromDDMMYYYY(checkInDate);
        const checkOutISO = parseDateFromDDMMYYYY(checkOutDate);

        // Client-side validation
        if (checkInISO >= checkOutISO) {
            setErrors({
                dates: isRTL ? 'تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول' : 'Check-out date must be after check-in date',
            });
            setMessage({
                type: 'error',
                text: isRTL ? 'تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول' : 'Check-out date must be after check-in date',
            });
            return;
        }

        const [inDay, inMonth, inYear] = checkInDate.split('/');
        const checkInDateObj = new Date(parseInt(inYear), parseInt(inMonth) - 1, parseInt(inDay));
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkInDateObj < today) {
            setMessage({ type: 'error', text: isRTL ? 'لا يمكن حجز تاريخ مضى' : 'Check-in date cannot be in the past' });
            return;
        }

        try {
            setLoading(true);
            const result = await checkAvailability(chaletId, checkInISO, checkOutISO);
            setIsAvailable(result.IsAvailable);
            setMessage({
                type: result.IsAvailable ? 'success' : 'error',
                text: result.IsAvailable ? t('booking.available') : t('booking.notAvailable'),
            });
        } catch (error) {
            setMessage({ type: 'error', text: t('common.error') });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!checkInDate || !checkOutDate || !userPhoneNumber || !isAvailable) {
            setMessage({ type: 'error', text: t('booking.fillAllFields') });
            return;
        }

        // Phone validation: must be exactly 11 digits
        const phoneRegex = /^\d{11}$/;
        if (!phoneRegex.test(userPhoneNumber)) {
            setMessage({ type: 'error', text: t('booking.invalidPhone') });
            return;
        }

        // Convert dates from DD/MM/YYYY to YYYY-MM-DD for API
        const checkInISO = parseDateFromDDMMYYYY(checkInDate);
        const checkOutISO = parseDateFromDDMMYYYY(checkOutDate);

        try {
            setLoading(true);
            // Construct booking object with PascalCase properties to match API/Type
            const booking: Omit<Booking, 'Id' | 'Status'> = {
                ChaletId: chaletId,
                CheckInDate: checkInISO,
                CheckOutDate: checkOutISO,
                UserPhoneNumber: userPhoneNumber,
            };
            const createdBooking = await createBooking(booking as any);
            const successMsg = t('booking.success') + (createdBooking.BookingReference ? `\nBooking Reference: ${createdBooking.BookingReference}` : '');
            setMessage({ type: 'success', text: successMsg });
            setCheckInDate('');
            setCheckOutDate('');
            setUserPhoneNumber('');
            setIsAvailable(null);
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || t('common.error');
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">{t('booking.title')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <DatePicker
                        value={checkInDate}
                        onChange={(value) => {
                            setCheckInDate(value);
                            setIsAvailable(null);
                            setMessage(null);
                            setErrors({});
                        }}
                        label={t('booking.checkIn')}
                        placeholder={isRTL ? 'يوم/شهر/سنة' : 'DD/MM/YYYY'}
                        minDate={new Date()}
                        isRTL={isRTL}
                    />
                    {errors.checkIn && (
                        <p className="text-sm text-red-600 mt-1 font-medium">{errors.checkIn}</p>
                    )}
                </div>

                <div>
                    <DatePicker
                        value={checkOutDate}
                        onChange={(value) => {
                            setCheckOutDate(value);
                            setIsAvailable(null);
                            setMessage(null);
                            setErrors({});
                        }}
                        label={t('booking.checkOut')}
                        placeholder={isRTL ? 'يوم/شهر/سنة' : 'DD/MM/YYYY'}
                        minDate={new Date()}
                        isRTL={isRTL}
                        position="top"
                    />
                    {errors.checkOut && (
                        <p className="text-sm text-red-600 mt-1 font-medium">{errors.checkOut}</p>
                    )}
                </div>

                {errors.dates && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                        <p className="text-red-700 font-medium flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {errors.dates}
                        </p>
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleCheckAvailability}
                    disabled={loading || !checkInDate || !checkOutDate}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? t('common.loading') : t('booking.checkAvailability')}
                </button>

                {message && (
                    <div className={`p-4 rounded-lg border flex items-center gap-2 ${message.type === 'success'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                        {message.type === 'success' ? (
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        <div className="whitespace-pre-line">{message.text}</div>
                    </div>
                )}

                {isAvailable && (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <label htmlFor="userPhone" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('booking.yourPhone')}
                            </label>
                            <input
                                type="tel"
                                id="userPhone"
                                value={userPhoneNumber}
                                onChange={(e) => setUserPhoneNumber(e.target.value)}
                                placeholder={t('booking.phonePlaceholder')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                            <div className="flex justify-between items-center text-gray-600">
                                <span>{t('booking.nights', { count: nights })}</span>
                                <span className="font-medium">{nights}</span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                                <span>{t('booking.totalPrice')}</span>
                                <span className="text-blue-600">
                                    {totalPrice.toLocaleString()} {t('common.sar')}
                                </span>
                            </div>
                        </div>

                        {/* --- Payment Policy Section --- */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                            <div className="flex items-center gap-3 text-slate-900">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-lg">{isRTL ? 'سياسة تأكيد الحجز' : 'Booking Confirmation Policy'}</h3>
                            </div>

                            <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
                                <p className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">●</span>
                                    {isRTL
                                        ? `يتم تأكيد الحجز بعد دفع عربون بقيمة يوم واحد (${pricePerNight.toLocaleString()} ${t('common.sar')}) من إجمالي مبلغ الإقامة.`
                                        : `Booking is confirmed after paying a deposit of one day (${pricePerNight.toLocaleString()} ${t('common.sar')}) from the total amount.`
                                    }
                                </p>
                                <p className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">●</span>
                                    {isRTL
                                        ? 'يتم الدفع عبر وسيلة الدفع الموضحة أدناه (فودافون كاش).'
                                        : 'Payment is made via the method shown below (Vodafone Cash).'
                                    }
                                </p>
                                <p className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">●</span>
                                    {isRTL
                                        ? 'سيتم التواصل معك فور استلام العربون لتأكيد الحجز نهائياً.'
                                        : 'You will be contacted as soon as the deposit is received to finalize the booking.'
                                    }
                                </p>
                            </div>
                        </div>

                        {/* --- Vodafone Cash Payment Card --- */}
                        <div className="bg-gradient-to-br from-red-50 to-white border border-red-100 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-[#E60000] rounded-xl flex items-center justify-center shadow-md">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 leading-tight">Vodafone Cash</h4>
                                        <p className="text-xs text-red-600 font-bold uppercase tracking-wider">فودافون كاش</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-red-100 p-4 flex flex-col items-center gap-3">
                                <span className="text-xs text-slate-400 font-medium uppercase">{isRTL ? 'رقم المحفظة' : 'Wallet Number'}</span>
                                <span className="text-2xl font-black text-slate-900 tracking-widest font-mono">01016141387</span>

                                <div className="grid grid-cols-2 gap-3 w-full mt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard.writeText('01016141387');
                                            alert(isRTL ? 'تم نسخ الرقم' : 'Number copied');
                                        }}
                                        className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all text-sm font-bold active:scale-95"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                        </svg>
                                        {isRTL ? 'نسخ الرقم' : 'Copy'}
                                    </button>

                                    <a
                                        href="https://wa.me/201016141387"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 py-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-lg transition-all text-sm font-bold active:scale-95 shadow-sm"
                                    >
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.82c1.516.903 3.12 1.378 4.759 1.379h.005c5.448 0 9.882-4.437 9.885-9.885.002-2.641-1.03-5.123-2.906-6.999-1.875-1.875-4.357-2.907-6.997-2.907-5.447 0-9.882 4.437-9.885 9.885-.001 1.761.465 3.473 1.348 4.965l-1.01 3.684 3.77-.988z" />
                                        </svg>
                                        {isRTL ? 'واتساب' : 'WhatsApp'}
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* --- Legal Confirmation & Terms --- */}
                        <div className="flex items-start gap-3 select-none bg-slate-50 p-4 rounded-xl border border-slate-100 transition-all hover:bg-slate-100/50 group">
                            <div className="flex items-center h-6 mt-0.5">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    checked={isAcceptedTerms}
                                    onChange={(e) => setIsAcceptedTerms(e.target.checked)}
                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer transition-all"
                                />
                            </div>
                            <div className="text-sm">
                                <label htmlFor="terms" className="text-gray-700 cursor-pointer leading-relaxed">
                                    {isRTL ? (
                                        <>
                                            أوافق على <Link to="/terms-and-conditions" target="_blank" className="text-blue-600 font-bold hover:underline">الشروط والأحكام</Link> وأقر بأن تأكيد الحجز يتم بعد دفع عربون يوم واحد بقيمة <span className="font-black text-slate-900 underline decoration-blue-500/30 decoration-2">{pricePerNight.toLocaleString()} {t('common.sar')}</span> عبر فودافون كاش
                                        </>
                                    ) : (
                                        <>
                                            I agree to the <Link to="/terms-and-conditions" target="_blank" className="text-blue-600 font-bold hover:underline">Terms & Conditions</Link> and acknowledge that booking confirmation requires a one-day deposit of <span className="font-bold text-slate-900">{pricePerNight.toLocaleString()} {t('common.sar')}</span> via Vodafone Cash
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* --- Submit Button --- */}
                        <button
                            type="submit"
                            disabled={loading || !userPhoneNumber || !isAcceptedTerms}
                            className="w-full px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-xl shadow-blue-500/20 transform hover:-translate-y-0.5 active:scale-95 text-lg"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('common.loading')}
                                </span>
                            ) : (
                                t('booking.confirm')
                            )}
                        </button>
                    </div>
                )}


            </form>
        </div>
    );
};

export default BookingForm;
