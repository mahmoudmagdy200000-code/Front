import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parse, isValid } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import 'react-day-picker/style.css';
import '../styles/datepicker.css'; // We'll keep this for custom overrides if needed

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
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse the display value (DD/MM/YYYY) to Date object for calendar
    const getSelectedDate = (): Date | undefined => {
        if (!value) return undefined;
        const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
        return isValid(parsedDate) ? parsedDate : undefined;
    };

    const selectedDate = getSelectedDate();

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

    const handleDaySelect = (date: Date | undefined) => {
        if (date) {
            const formattedDate = format(date, 'dd/MM/yyyy');
            onChange(formattedDate);
            setIsOpen(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        onChange(val);
        // We don't auto-update the calendar from text input here to avoid jumping, 
        // relying on re-render with `selectedDate` derived from `value` is safer.
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

            {/* Calendar Popover */}
            {isOpen && (
                <div className={`absolute ${isRTL ? 'right-0' : 'left-0'} ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
                    } bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-2 animate-in fade-in zoom-in-95 duration-200`}
                    style={{ minWidth: '300px' }}
                >
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDaySelect}
                        disabled={minDate ? { before: minDate } : undefined}
                        locale={isRTL ? arSA : enUS}
                        dir={isRTL ? 'rtl' : 'ltr'}
                        showOutsideDays
                        modifiersClassNames={{
                            selected: 'bg-blue-600 text-white hover:bg-blue-700',
                            today: 'text-blue-500 font-bold'
                        }}
                        styles={{
                            head_cell: { width: '40px' },
                            cell: { width: '40px' },
                            day: { width: '40px', height: '40px' },
                            nav_button: { color: '#2563eb' } // Blue navigation
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default DatePicker;
