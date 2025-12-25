import { useState, useRef } from 'react';
import { formatDateToDDMMYYYY, parseDateFromDDMMYYYY, isValidDateFormat } from '../utils/dateUtils';
import { useTranslation } from 'react-i18next';
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
    const formRef = useRef<HTMLDivElement>(null);
    const phoneInputRef = useRef<HTMLInputElement>(null);

    // Step management: 'cta' -> 'dates' -> 'phone' -> 'success'
    const [step, setStep] = useState<'cta' | 'dates' | 'phone' | 'success'>('cta');

    // Convert initial dates from YYYY-MM-DD to DD/MM/YYYY for display
    const [checkInDate, setCheckInDate] = useState(initialCheckIn ? formatDateToDDMMYYYY(initialCheckIn) : '');
    const [checkOutDate, setCheckOutDate] = useState(initialCheckOut ? formatDateToDDMMYYYY(initialCheckOut) : '');
    const [userPhoneNumber, setUserPhoneNumber] = useState('');
    const [isAcceptedTerms, setIsAcceptedTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [bookingRef, setBookingRef] = useState<string>('');

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

            if (result.IsAvailable) {
                setMessage({ type: 'success', text: t('booking.available') });
                // Move to phone step
                setStep('phone');
                // Scroll to phone input after a short delay
                setTimeout(() => {
                    phoneInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    phoneInputRef.current?.focus();
                }, 300);
            } else {
                setMessage({ type: 'error', text: t('booking.notAvailable') });
            }

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
            setBookingRef(createdBooking.BookingReference || '');
            setStep('success');

            // Scroll to the beginning of the form so user sees the success message
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || t('common.error');
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStep('cta');
        setCheckInDate('');
        setCheckOutDate('');
        setUserPhoneNumber('');
        setIsAcceptedTerms(false);
        setIsAvailable(null);
        setMessage(null);
        setBookingRef('');
    };

    // CTA Step - Just show "Book Now" button
    if (step === 'cta') {
        return (
            <div ref={formRef} className="space-y-4">
                <div className="text-center py-2">
                    <div className="inline-flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full text-sm font-bold mb-4 select-none">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        {isRTL ? 'متاح للحجز' : 'Available to Book'}
                    </div>
                </div>
                <button
                    onClick={() => setStep('dates')}
                    className="w-full px-6 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black rounded-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all shadow-2xl shadow-blue-500/30 transform hover:-translate-y-1 hover:scale-[1.02] active:scale-95 text-xl relative overflow-hidden group"
                >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                    <span className="relative flex items-center justify-center gap-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {isRTL ? 'احجز الآن' : 'Book Now'}
                    </span>
                </button>
                <p className="text-center text-slate-500 text-sm">
                    {isRTL ? 'اختر التواريخ وأكد حجزك في دقائق' : 'Select dates and confirm your booking in minutes'}
                </p>
            </div>
        );
    }

    // Success Step - Show booking confirmation with WhatsApp button
    if (step === 'success') {
        return (
            <div ref={formRef} className="space-y-6 animate-fade-in">
                <div className="text-center py-6">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">
                        {isRTL ? 'تم تسجيل الحجز بنجاح!' : 'Booking Registered!'}
                    </h3>
                    <p className="text-slate-600 mb-4">
                        {isRTL ? 'يرجى دفع العربون لتأكيد الحجز' : 'Please pay the deposit to confirm your booking'}
                    </p>
                    {bookingRef && (
                        <div className="inline-block bg-slate-100 px-6 py-3 rounded-xl mb-4">
                            <span className="text-slate-500 text-sm block">{isRTL ? 'رقم الحجز' : 'Booking Reference'}</span>
                            <span className="text-2xl font-black text-indigo-600 font-mono">{bookingRef}</span>
                        </div>
                    )}
                </div>

                {/* Deposit Info */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <span className="text-xl">💰</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-amber-900">{isRTL ? 'قيمة العربون المطلوب' : 'Required Deposit'}</h4>
                            <p className="text-amber-700 text-sm">{isRTL ? 'قيمة ليلة واحدة' : 'One night price'}</p>
                        </div>
                    </div>
                    <div className="text-center py-3 bg-white rounded-xl border border-amber-100">
                        <span className="text-3xl font-black text-amber-600">{pricePerNight.toLocaleString()}</span>
                        <span className="text-amber-600 font-bold ml-2">{t('common.sar')}</span>
                    </div>
                </div>

                {/* Vodafone Cash Payment Card */}
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
                                href={`https://wa.me/201016141387?text=${encodeURIComponent(isRTL ? `مرحبا، أريد تأكيد حجزي رقم ${bookingRef}` : `Hello, I want to confirm my booking #${bookingRef}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 py-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-lg transition-all text-sm font-bold active:scale-95 shadow-sm"
                            >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.82c1.516.903 3.12 1.378 4.759 1.379h.005c5.448 0 9.882-4.437 9.885-9.885.002-2.641-1.03-5.123-2.906-6.999-1.875-1.875-4.357-2.907-6.997-2.907-5.447 0-9.882 4.437-9.885 9.885-.001 1.761.465 3.473 1.348 4.965l-1.01 3.684 3.77-.988z" />
                                </svg>
                                {isRTL ? 'تأكيد عبر واتساب' : 'Confirm via WhatsApp'}
                            </a>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                    <p className="font-bold mb-2">{isRTL ? 'الخطوات التالية:' : 'Next Steps:'}</p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-700">
                        <li>{isRTL ? 'حوّل العربون إلى الرقم أعلاه' : 'Transfer the deposit to the number above'}</li>
                        <li>{isRTL ? 'تواصل معنا عبر واتساب لتأكيد الحجز' : 'Contact us via WhatsApp to confirm'}</li>
                        <li>{isRTL ? 'ستصلك رسالة تأكيد الحجز النهائي' : 'You will receive a final confirmation'}</li>
                    </ol>
                </div>

                <button
                    onClick={resetForm}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
                >
                    {isRTL ? 'حجز جديد' : 'New Booking'}
                </button>
            </div>
        );
    }

    return (
        <div ref={formRef} className="scroll-mt-20">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className={`w-3 h-3 rounded-full transition-all ${step === 'dates' ? 'bg-blue-600 scale-125' : 'bg-slate-200'}`}></div>
                    <div className="w-8 h-0.5 bg-slate-200"></div>
                    <div className={`w-3 h-3 rounded-full transition-all ${step === 'phone' ? 'bg-blue-600 scale-125' : 'bg-slate-200'}`}></div>
                </div>

                {/* Dates Step */}
                {step === 'dates' && (
                    <div className="space-y-4 animate-fade-in">
                        <h3 className="text-lg font-bold text-slate-800 text-center mb-4">
                            {isRTL ? 'اختر تواريخ إقامتك' : 'Select Your Dates'}
                        </h3>

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
                                minDate={(() => {
                                    if (!checkInDate) return new Date();
                                    const [d, m, y] = checkInDate.split('/');
                                    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                                    date.setDate(date.getDate() + 1);
                                    return date;
                                })()}
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

                        {/* Duration Summary with Shadow */}
                        {checkInDate && checkOutDate && nights > 0 && !errors.dates && (
                            <div className="bg-white p-5 rounded-2xl shadow-[0_20px_50px_rgba(37,99,235,0.12)] border border-blue-50/50 animate-in zoom-in-95 duration-500 overflow-hidden relative group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/30 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-blue-100/40 transition-colors" />
                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">
                                                {isRTL ? 'إجمالي مدة الإقامة' : 'Total Stay Duration'}
                                            </p>
                                            <p className="text-xl font-black text-slate-900 leading-none">
                                                {nights} {isRTL ? 'ليالي' : 'nights'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                                            {isRTL ? 'السعر التقديري' : 'Est. Total'}
                                        </p>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-2xl font-black text-blue-600 leading-none">
                                                {totalPrice.toLocaleString()}
                                            </p>
                                            <span className="text-[10px] font-bold text-blue-600 uppercase">{t('common.sar')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

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

                        <button
                            type="button"
                            onClick={handleCheckAvailability}
                            disabled={loading || !checkInDate || !checkOutDate}
                            className="w-full px-4 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('common.loading')}
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {t('booking.checkAvailability')}
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep('cta')}
                            className="w-full py-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
                        >
                            {isRTL ? '← رجوع' : '← Back'}
                        </button>
                    </div>
                )}

                {/* Phone Step */}
                {step === 'phone' && (
                    <div className="space-y-6 animate-fade-in p-2 sm:p-4">
                        <h3 className="text-xl font-black text-slate-900 text-center mb-6">
                            {isRTL ? 'تأكيد معلومات التواصل' : 'Confirm Contact Info'}
                        </h3>

                        {/* Summary Card - More premium */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/40 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-100/50 transition-colors" />

                            <div className="relative z-10 space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'تاريخ الوصول' : 'Check-in'}</p>
                                        <p className="font-bold text-slate-800">{checkInDate}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                        <svg className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </div>
                                    <div className="space-y-0.5 text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'تاريخ المغادرة' : 'Check-out'}</p>
                                        <p className="font-bold text-slate-800">{checkOutDate}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                            {nights} {isRTL ? 'ليالي' : 'nights'}
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'الإجمالي' : 'Total'}</span>
                                        <span className="text-2xl font-black text-blue-600">{totalPrice.toLocaleString()}</span>
                                        <span className="text-[10px] font-bold text-blue-600 uppercase">{t('common.sar')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Phone Input */}
                        <div ref={phoneInputRef} className="space-y-2">
                            <label htmlFor="userPhone" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                {t('booking.yourPhone')}
                            </label>
                            <div className="relative group/phone">
                                <div className={`absolute inset-y-0 ${isRTL ? 'right-4' : 'left-4'} flex items-center pointer-events-none text-slate-300 group-hover/phone:text-blue-500 transition-colors`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <input
                                    type="tel"
                                    id="userPhone"
                                    value={userPhoneNumber}
                                    onChange={(e) => setUserPhoneNumber(e.target.value)}
                                    placeholder={t('booking.phonePlaceholder')}
                                    className={`soft-input w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 font-black text-slate-900 text-lg tracking-[0.1em]`}
                                    required
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        {/* Terms Checkbox - Refined */}
                        <div className="flex items-start gap-3 select-none bg-slate-50/50 p-5 rounded-[1.5rem] border border-slate-100 transition-all hover:bg-slate-100/50 group cursor-pointer" onClick={() => setIsAcceptedTerms(!isAcceptedTerms)}>
                            <div className="flex items-center h-5 mt-0.5">
                                <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${isAcceptedTerms ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200 group-hover:border-blue-400'}`}>
                                    {isAcceptedTerms && (
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <div className="text-xs">
                                <label className="text-slate-600 cursor-pointer leading-relaxed block">
                                    {isRTL ? (
                                        <>
                                            أوافق على <span className="text-blue-600 font-black hover:underline">الشروط والأحكام</span> وأقر بأن تأكيد الحجز يتطلب دفع العربون بقيمة ليلة واحدة.
                                        </>
                                    ) : (
                                        <>
                                            I agree to the <span className="text-blue-600 font-black hover:underline">Terms & Conditions</span> and understand that a one-night deposit is required.
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Submit Button - Enhanced CTA */}
                        <button
                            type="submit"
                            disabled={loading || !userPhoneNumber || !isAcceptedTerms}
                            className="w-full px-8 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-black rounded-[1.5rem] hover:shadow-2xl hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:scale-95 text-lg uppercase tracking-widest flex items-center justify-center gap-3"
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
                                <>
                                    <span>{t('booking.confirm')}</span>
                                    <svg className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setStep('dates');
                                setIsAvailable(null);
                            }}
                            className="w-full py-2 text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
                        >
                            {isRTL ? 'تعديل التواريخ' : 'Edit Dates'}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default BookingForm;
