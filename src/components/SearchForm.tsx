import { useState, useEffect } from 'react';
import { formatDateToDDMMYYYY, parseDateFromDDMMYYYY, isValidDateFormat } from '../utils/dateUtils';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DatePicker from './DatePicker';

interface SearchFormProps {
    initialCheckIn?: string;
    initialCheckOut?: string;
    initialAdults?: number;
    initialChildren?: number;
    onSearch?: (params: any) => void; // Optional if we want to override default navigation
}

const SearchForm = ({
    initialCheckIn = '',
    initialCheckOut = '',
    initialAdults = 2,
    initialChildren = 0,
    onSearch
}: SearchFormProps) => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const isRTL = i18n.language === 'ar';

    // Convert initial dates from YYYY-MM-DD to DD/MM/YYYY for display
    const [checkIn, setCheckIn] = useState(() => {
        const propValue = initialCheckIn ? formatDateToDDMMYYYY(initialCheckIn) : '';
        return propValue || sessionStorage.getItem('checkIn_display') || '';
    });
    const [checkOut, setCheckOut] = useState(() => {
        const propValue = initialCheckOut ? formatDateToDDMMYYYY(initialCheckOut) : '';
        return propValue || sessionStorage.getItem('checkOut_display') || '';
    });
    const [adults, setAdults] = useState(() => {
        return Number(sessionStorage.getItem('adults')) || initialAdults;
    });
    const [children, setChildren] = useState(() => {
        return Number(sessionStorage.getItem('children')) || initialChildren;
    });

    // Update sessionStorage when values change
    useEffect(() => {
        if (checkIn) sessionStorage.setItem('checkIn_display', checkIn);
        if (checkOut) sessionStorage.setItem('checkOut_display', checkOut);
        sessionStorage.setItem('adults', adults.toString());
        sessionStorage.setItem('children', children.toString());
    }, [checkIn, checkOut, adults, children]);

    // Sync with props when they change (e.g. browser back/forward)
    useEffect(() => {
        if (initialCheckIn) setCheckIn(formatDateToDDMMYYYY(initialCheckIn));
        if (initialCheckOut) setCheckOut(formatDateToDDMMYYYY(initialCheckOut));
        setAdults(initialAdults);
        setChildren(initialChildren);
    }, [initialCheckIn, initialCheckOut, initialAdults, initialChildren]);

    // Helper to get Date object from string
    const getCheckInDateObj = () => {
        if (!checkIn || !isValidDateFormat(checkIn)) return new Date();
        const parsed = parseDateFromDDMMYYYY(checkIn);
        const date = new Date(parsed);
        // Add 1 day for minimum check-out
        date.setDate(date.getDate() + 1);
        return date;
    };

    const minCheckOutDate = getCheckInDateObj();

    // Range dates for highlighting
    const checkInDate = checkIn && isValidDateFormat(checkIn) ? new Date(parseDateFromDDMMYYYY(checkIn)) : undefined;
    const checkOutDate = checkOut && isValidDateFormat(checkOut) ? new Date(parseDateFromDDMMYYYY(checkOut)) : undefined;

    // Error states
    const [errors, setErrors] = useState<{
        checkIn?: string;
        checkOut?: string;
        dates?: string;
    }>({});

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        // Clear previous errors
        setErrors({});

        // Validate and convert dates from DD/MM/YYYY to YYYY-MM-DD
        if (!checkIn || !checkOut) {
            setErrors({
                checkIn: !checkIn ? (isRTL ? 'اختر تاريخ الوصول' : 'Select check-in date') : undefined,
                checkOut: !checkOut ? (isRTL ? 'اختر تاريخ المغادرة' : 'Select check-out date') : undefined,
            });
            return;
        }

        if (!isValidDateFormat(checkIn) || !isValidDateFormat(checkOut)) {
            setErrors({
                checkIn: !isValidDateFormat(checkIn) ? (isRTL ? 'صيغة التاريخ غير صحيحة' : 'Invalid date format') : undefined,
                checkOut: !isValidDateFormat(checkOut) ? (isRTL ? 'صيغة التاريخ غير صحيحة' : 'Invalid date format') : undefined,
            });
            return;
        }

        const checkInISO = parseDateFromDDMMYYYY(checkIn);
        const checkOutISO = parseDateFromDDMMYYYY(checkOut);

        if (checkInISO >= checkOutISO) {
            setErrors({
                dates: isRTL ? 'تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول' : 'Check-out date must be after check-in date',
            });
            return;
        }

        if (onSearch) {
            onSearch({ checkIn: checkInISO, checkOut: checkOutISO, adults, children });
        } else {
            // Default behavior: Navigate to search results page
            const params = new URLSearchParams();
            params.append('checkIn', checkInISO);
            params.append('checkOut', checkOutISO);
            params.append('adults', adults.toString());
            params.append('children', children.toString());

            navigate(`/searchchalet?${params.toString()}`);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-blue-100 max-w-5xl mx-auto" >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3 whitespace-nowrap">
                <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {isRTL ? 'ابحث عن إقامتك المثالية' : 'Find Your Perfect Stay'}
            </h2>

            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Check-in Date */}
                <div className="relative group">
                    <DatePicker
                        value={checkIn}
                        onChange={(value) => {
                            setCheckIn(value);
                            setErrors({});
                            // If check-in is set/changed, we might want to validate check-out
                            const newCheckInISO = parseDateFromDDMMYYYY(value);
                            const currentCheckOutISO = checkOut ? parseDateFromDDMMYYYY(checkOut) : '';
                            if (currentCheckOutISO && newCheckInISO >= currentCheckOutISO) {
                                setCheckOut(''); // Clear check-out if it's now invalid
                            }
                        }}
                        label={isRTL ? 'تاريخ الوصول' : 'Check-in'}
                        placeholder={isRTL ? 'يوم/شهر/سنة' : 'DD/MM/YYYY'}
                        minDate={new Date()}
                        maxDate={checkOutDate ? new Date(checkOutDate.getTime() - 24 * 60 * 60 * 1000) : undefined}
                        rangeFrom={checkInDate}
                        rangeTo={checkOutDate}
                        isRTL={isRTL}
                        defaultMonth={checkOutDate}
                    />
                    {errors.checkIn && (
                        <p className="text-sm text-red-600 mt-1 font-medium">{errors.checkIn}</p>
                    )}
                </div>

                {/* Check-out Date */}
                <div className="relative group">
                    <DatePicker
                        value={checkOut}
                        onChange={(value) => {
                            setCheckOut(value);
                            setErrors({});
                        }}
                        label={isRTL ? 'تاريخ المغادرة' : 'Check-out'}
                        placeholder={isRTL ? 'يوم/شهر/سنة' : 'DD/MM/YYYY'}
                        minDate={minCheckOutDate}
                        rangeFrom={checkInDate}
                        rangeTo={checkOutDate}
                        isRTL={isRTL}
                        defaultMonth={checkInDate}
                    />
                    {errors.checkOut && (
                        <p className="text-sm text-red-600 mt-1 font-medium">{errors.checkOut}</p>
                    )}
                </div>

                {/* Adults */}
                <div className="relative group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <svg className="w-4 h-4 inline mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        {isRTL ? 'عدد الكبار' : 'Adults'}
                    </label>
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl border-2 border-gray-200 p-1">
                        <button
                            type="button"
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                            className="w-10 h-10 rounded-lg bg-white shadow-sm text-gray-600 hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center font-bold text-lg"
                        >
                            -
                        </button>
                        <input
                            type="number"
                            value={adults}
                            onChange={(e) => setAdults(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-16 bg-transparent border-none focus:ring-0 text-center text-gray-700 font-bold text-lg p-0"
                            min="1"
                        />
                        <button
                            type="button"
                            onClick={() => setAdults(adults + 1)}
                            className="w-10 h-10 rounded-lg bg-white shadow-sm text-gray-600 hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center font-bold text-lg"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Children */}
                <div className="relative group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <svg className="w-4 h-4 inline mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {isRTL ? 'عدد الأطفال' : 'Children'}
                    </label>
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl border-2 border-gray-200 p-1">
                        <button
                            type="button"
                            onClick={() => setChildren(Math.max(0, children - 1))}
                            className="w-10 h-10 rounded-lg bg-white shadow-sm text-gray-600 hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center font-bold text-lg"
                        >
                            -
                        </button>
                        <input
                            type="number"
                            value={children}
                            onChange={(e) => setChildren(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-16 bg-transparent border-none focus:ring-0 text-center text-gray-700 font-bold text-lg p-0"
                            min="0"
                        />
                        <button
                            type="button"
                            onClick={() => setChildren(children + 1)}
                            className="w-10 h-10 rounded-lg bg-white shadow-sm text-gray-600 hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center font-bold text-lg"
                        >
                            +
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5 italic text-center">
                        {isRTL ? '(تحت 12 سنة)' : '(Under 12 years)'}
                    </p>
                </div>

                {/* Search Button */}
                {/* Search Button */}
                <div className="col-span-1 md:col-span-2 lg:col-span-4 mt-2">
                    {errors.dates && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded mb-4">
                            <p className="text-red-700 font-medium flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {errors.dates}
                            </p>
                        </div>
                    )}
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="px-12 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full font-bold text-lg shadow-lg shadow-blue-300 hover:shadow-xl hover:shadow-blue-400 transition-all transform hover:-translate-y-0.5 flex items-center gap-3"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {isRTL ? 'ابحث الآن' : 'Search Now'}
                        </button>
                    </div>
                </div>
            </form>
        </div >
    );
};

export default SearchForm;
