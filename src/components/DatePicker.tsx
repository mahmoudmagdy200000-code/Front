import { useState, useRef, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { formatDateToDDMMYYYY } from '../utils/dateUtils';
import '../styles/datepicker.css';

interface DatePickerProps {
    value: string; // DD/MM/YYYY format
    onChange: (date: string) => void;
    placeholder?: string;
    label?: string;
    minDate?: Date;
    isRTL?: boolean;
    position?: 'top' | 'bottom';
}

const DatePicker = ({
    value,
    onChange,
    placeholder = 'DD/MM/YYYY',
    label,
    minDate,
    isRTL = false,
    position = 'bottom',
}: DatePickerProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [calendarDate, setCalendarDate] = useState<Date>(new Date());
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse the display value (DD/MM/YYYY) to Date object for calendar
    useEffect(() => {
        if (value) {
            const [day, month, year] = value.split('/');
            if (day && month && year) {
                setCalendarDate(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
            }
        }
    }, [value]);

    // Close calendar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDateChange = (date: Date) => {
        const formattedDate = formatDateToDDMMYYYY(
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        );
        onChange(formattedDate);
        setIsOpen(false);
    };

    // Wrapper for react-calendar onChange to handle correct type signature
    const handleCalendarChange = (value: Date | [Date, Date] | null) => {
        if (value instanceof Date) {
            handleDateChange(value);
        } else if (Array.isArray(value) && value[0] instanceof Date) {
            handleDateChange(value[0]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        onChange(val);

        // Try to parse and update calendar if valid format
        if (val.length === 10 && val.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            const [day, month, year] = val.split('/');
            setCalendarDate(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
        }
    };

    const handleInputFocus = () => {
        setIsOpen(true);
    };

    return (
        <div ref={containerRef} className="relative w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {label}
                </label>
            )}

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>

                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-700 font-medium"
                />
            </div>

            {/* Calendar Dropdown */}
            {isOpen && (
                <div className={`absolute ${isRTL ? 'right-0' : 'left-0'} ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
                    } bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-4`}>
                    <Calendar
                        onChange={handleCalendarChange as any}
                        value={calendarDate}
                        minDate={minDate}
                        maxDate={undefined}
                        className="react-calendar-custom"
                        locale={isRTL ? 'ar-EG' : 'en-US'}
                    />
                </div>
            )}
        </div>
    );
};

export default DatePicker;
