export const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Format date string from YYYY-MM-DD to DD/MM/YYYY
export const formatDateToDDMMYYYY = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

// Parse date string from DD/MM/YYYY to YYYY-MM-DD
export const parseDateFromDDMMYYYY = (dateString: string): string => {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('/');
    if (!day || !month || !year) return '';
    return `${year}-${month}-${day}`;
};

// Validate DD/MM/YYYY date format
export const isValidDateFormat = (dateString: string): boolean => {
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!dateRegex.test(dateString)) return false;
    
    const [day, month, year] = dateString.split('/');
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (monthNum < 1 || monthNum > 12) return false;
    if (dayNum < 1 || dayNum > 31) return false;
    
    const date = new Date(yearNum, monthNum - 1, dayNum);
    return date.getFullYear() === yearNum && date.getMonth() === monthNum - 1 && date.getDate() === dayNum;
};
