import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BudgetFilterProps {
    onPriceFilterChange: (min: number | undefined, max: number | undefined) => void;
    currentMin?: number;
    currentMax?: number;
}

const BudgetFilter: React.FC<BudgetFilterProps> = ({ onPriceFilterChange, currentMin, currentMax }) => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    // 0: All, 1: <1000, 2: 1000-2000, 3: >2000
    const getSelectedOption = () => {
        if (currentMax === 1000) return 1;
        if (currentMin === 1000 && currentMax === 2000) return 2;
        if (currentMin === 2000) return 3;
        return 0; // All
    };

    const [selectedOption, setSelectedOption] = useState<number>(getSelectedOption());

    const handleOptionChange = (option: number) => {
        setSelectedOption(option);
        if (option === 0) {
            onPriceFilterChange(undefined, undefined);
        } else if (option === 1) {
            onPriceFilterChange(undefined, 1000);
        } else if (option === 2) {
            onPriceFilterChange(1000, 2000);
        } else if (option === 3) {
            onPriceFilterChange(2000, undefined);
        }
    };

    const options = [
        { id: 0, label: isRTL ? 'الكل' : 'All' },
        { id: 1, label: isRTL ? 'أقل من 1000 ج.م' : 'Under 1000 EGP' },
        { id: 2, label: isRTL ? 'من 1000 إلى 2000 ج.م' : '1000 - 2000 EGP' },
        { id: 3, label: isRTL ? 'أكثر من 2000 ج.م' : 'More than 2000 EGP' },
    ];

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 mt-4 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-4">
                <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                    💰 {isRTL ? 'تصفية حسب الميزانية' : 'Budget Filter'}:
                </label>
                <div className="flex flex-wrap gap-2">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleOptionChange(option.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedOption === option.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BudgetFilter;
