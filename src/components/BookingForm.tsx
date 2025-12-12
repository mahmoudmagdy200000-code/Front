import { useState } from 'react';
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

    // Convert initial dates from YYYY-MM-DD to DD/MM/YYYY for display
    const [checkInDate, setCheckInDate] = useState(initialCheckIn ? formatDateToDDMMYYYY(initialCheckIn) : '');
    const [checkOutDate, setCheckOutDate] = useState(initialCheckOut ? formatDateToDDMMYYYY(initialCheckOut) : '');
    const [userPhoneNumber, setUserPhoneNumber] = useState('');
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
        } catch (error) {
            setMessage({ type: 'error', text: t('common.error') });
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
                        label={t('booking.checkInDate')}
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
                        label={t('booking.checkOutDate')}
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
                    className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed"
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

                        <button
                            type="submit"
                            disabled={loading || !userPhoneNumber}
                            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
