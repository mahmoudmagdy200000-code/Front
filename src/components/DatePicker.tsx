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
    rangeFrom?: Date;
    rangeTo?: Date;
    isRTL?: boolean;
    position?: 'top' | 'bottom';
}

const DatePicker = ({
    value,
    onChange,
    placeholder = 'DD/MM/YYYY',
    label,
    minDate,
    rangeFrom,
    rangeTo,
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
                    readOnly
                    onFocus={handleInputFocus}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-700 font-medium cursor-pointer bg-white"
                />
            </div>

            {/* Calendar Popover */}
            {isOpen && (
                <div className={`absolute ${isRTL ? 'right-0' : 'left-0'} ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
                    } bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-50 p-3 animate-in fade-in zoom-in-95 duration-200`}
                    style={{ minWidth: '320px' }}
                >
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDaySelect}
                        disabled={minDate ? { before: minDate } : undefined}
                        locale={isRTL ? arSA : enUS}
                        dir={isRTL ? 'rtl' : 'ltr'}
                        showOutsideDays
                        modifiers={{
                            selectedRange: { from: rangeFrom, to: rangeTo }
                        }}
                        modifiersClassNames={{
                            selected: 'custom-selected',
                            selectedRange: 'bg-blue-50 text-blue-700',
                            today: 'text-blue-600 font-black'
                        }}
                        styles={{
                            head_cell: { width: '44px', color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' },
                            cell: { width: '44px' },
                            day: { width: '44px', height: '44px', borderRadius: '12px', transition: 'all 0.2s' },
                            nav_button: { color: '#2563eb' }
                        }}
                    />
                    <style>{`
                        .custom-selected {
                            background-color: #2563eb !important;
                            color: white !important;
                            border-radius: 12px !important;
                            box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4) !important;
                            font-weight: bold !important;
                        }
                        .rdp-day_selectedRange:not(.rdp-day_selected) {
                            background-color: #eff6ff !important;
                            color: #2563eb !important;
                            border-radius: 0 !important;
                        }
                        .rdp-day:hover:not(.rdp-day_selected) {
                            background-color: #f8fafc !important;
                            color: #2563eb !important;
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
};

export default DatePicker;
