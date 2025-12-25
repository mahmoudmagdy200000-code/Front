import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// تأكد أن createChalet يقبل المعامل الثاني (images) في ملف api/chalets.ts كما عدلناه سابقاً
import { getMyChalets, createChalet, updateChalet, deleteChalet, uploadChaletImages, deleteChaletImage, reorderChaletImages } from '../api/chalets';
import { getEarningsSummary, type EarningsSummary } from '../api/earnings';
import type { Chalet, ChaletImage } from '../types/chalet';
import DashboardHeader from '../components/DashboardHeader';
import ChaletCard from '../components/dashboard/ChaletCard';
import { useNavigate } from 'react-router-dom';

import { getImageUrl } from '../config/api';
import { VILLAGES } from '../config/villages';

const DashboardPage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const isArabic = i18n.language === 'ar';

    const [chalets, setChalets] = useState<Chalet[]>([]);
    const [earningsSummary, setEarningsSummary] = useState<EarningsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingChalet, setEditingChalet] = useState<Chalet | null>(null);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<ChaletImage[]>([]);
    const [imageError, setImageError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const MAX_IMAGES = 18;
    const MAX_CHALETS = 5;

    const [formData, setFormData] = useState({
        titleEn: '',
        titleAr: '',
        descriptionEn: '',
        descriptionAr: '',
        pricePerNight: 0,
        adultsCapacity: 0,
        childrenCapacity: 0,
        roomsCount: 0,
        bathroomsCount: 0,
        villageNameEn: '',
        villageNameAr: '',
    });

    const [formErrors, setFormErrors] = useState<{
        titleEn?: string;
        titleAr?: string;
        descriptionEn?: string;
        descriptionAr?: string;
        pricePerNight?: string;
        adultsCapacity?: string;
        childrenCapacity?: string;
        roomsCount?: string;
        bathroomsCount?: string;
        villageNameEn?: string;
        villageNameAr?: string;
    }>({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [chaletsData, summaryData] = await Promise.all([
                getMyChalets(),
                getEarningsSummary()
            ]);
            setChalets(chaletsData);
            setEarningsSummary(summaryData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const errors: typeof formErrors = {};
        let hasImageError = false;
        console.log('🔍 [validateForm] Starting validation');
        console.log('   titleEn:', formData.titleEn, 'length:', formData.titleEn.trim().length);
        console.log('   titleAr:', formData.titleAr, 'length:', formData.titleAr.trim().length);
        console.log('   descriptionEn length:', formData.descriptionEn.trim().length);
        console.log('   descriptionAr length:', formData.descriptionAr.trim().length);
        console.log('   pricePerNight:', formData.pricePerNight);
        console.log('   adultsCapacity:', formData.adultsCapacity);
        console.log('   childrenCapacity:', formData.childrenCapacity);
        console.log('   selectedImages:', selectedImages.length);
        console.log('   existingImages:', existingImages.length);
        // التحقق من titleEn
        if (!formData.titleEn || formData.titleEn.trim().length < 3) {
            errors.titleEn = isArabic ? 'عنوان اللغة الإنجليزية مطلوب (3 أحرف على الأقل)' : 'English title is required (min 3 characters)';
            console.warn('❌ [validateForm] titleEn failed:', formData.titleEn);
        } else {
            console.log('✅ [validateForm] titleEn passed');
        }

        // التحقق من titleAr
        if (!formData.titleAr || formData.titleAr.trim().length < 3) {
            errors.titleAr = isArabic ? 'عنوان اللغة العربية مطلوب (3 أحرف على الأقل)' : 'Arabic title is required (min 3 characters)';
            console.warn('❌ [validateForm] titleAr failed:', formData.titleAr);
        } else {
            console.log('✅ [validateForm] titleAr passed');
        }

        // التحقق من descriptionEn
        if (!formData.descriptionEn || formData.descriptionEn.trim().length < 10) {
            errors.descriptionEn = isArabic ? 'الوصف بالإنجليزية مطلوب (10 أحرف على الأقل)' : 'English description is required (min 10 characters)';
            console.warn('❌ [validateForm] descriptionEn failed:', formData.descriptionEn?.length || 0, 'chars');
        } else {
            console.log('✅ [validateForm] descriptionEn passed');
        }

        // التحقق من descriptionAr
        if (!formData.descriptionAr || formData.descriptionAr.trim().length < 10) {
            errors.descriptionAr = isArabic ? 'الوصف بالعربية مطلوب (10 أحرف على الأقل)' : 'Arabic description is required (min 10 characters)';
            console.warn('❌ [validateForm] descriptionAr failed:', formData.descriptionAr?.length || 0, 'chars');
        } else {
            console.log('✅ [validateForm] descriptionAr passed');
        }

        // التحقق من السعر
        if (formData.pricePerNight <= 0) {
            errors.pricePerNight = isArabic ? 'السعر مطلوب (يجب أن يكون أكبر من 0)' : 'Price is required (must be greater than 0)';
            console.warn('❌ [validateForm] pricePerNight failed:', formData.pricePerNight);
        } else {
            console.log('✅ [validateForm] pricePerNight passed:', formData.pricePerNight);
        }

        // التحقق من سعة البالغين
        if (formData.adultsCapacity < 1) {
            errors.adultsCapacity = isArabic ? 'سعة البالغين مطلوبة (1 على الأقل)' : 'Adults capacity is required (min 1)';
            console.warn('❌ [validateForm] adultsCapacity failed:', formData.adultsCapacity);
        } else {
            console.log('✅ [validateForm] adultsCapacity passed:', formData.adultsCapacity);
        }

        // التحقق من سعة الأطفال
        if (formData.childrenCapacity < 0) {
            errors.childrenCapacity = isArabic ? 'سعة الأطفال مطلوبة (0 أو أكثر)' : 'Children capacity is required (0 or more)';
            console.warn('❌ [validateForm] childrenCapacity failed:', formData.childrenCapacity);
        } else {
            console.log('✅ [validateForm] childrenCapacity passed:', formData.childrenCapacity);
        }

        // Validate Village Name En
        if (!formData.villageNameEn || formData.villageNameEn.trim().length < 3) {
            errors.villageNameEn = isArabic ? 'اسم القرية بالإنجليزية مطلوب' : 'Village Name (EN) is required';
        }

        // Validate Village Name Ar
        if (!formData.villageNameAr || formData.villageNameAr.trim().length < 3) {
            errors.villageNameAr = isArabic ? 'اسم القرية بالعربية مطلوب' : 'Village Name (AR) is required';
        }

        // Validate Rooms
        if (formData.roomsCount < 1) {
            errors.roomsCount = isArabic ? 'عدد الغرف مطلوب' : 'Rooms count is required';
        }

        // Validate Bathrooms
        if (formData.bathroomsCount < 1) {
            errors.bathroomsCount = isArabic ? 'عدد الحمامات مطلوب' : 'Bathrooms count is required';
        }

        // التحقق من الصور
        if (!editingChalet && selectedImages.length === 0) {
            setImageError(isArabic ? 'يجب اختيار صورة واحدة على الأقل' : 'At least one image is required');
            hasImageError = true;
            console.warn('❌ [validateForm] No images selected and not editing');
        } else {
            setImageError(null);
            console.log('✅ [validateForm] Images check passed');
        }

        setFormErrors(errors);

        const isValid = Object.keys(errors).length === 0 && !hasImageError;

        if (!isValid) {
            console.error('❌ [validateForm] Validation FAILED');
            console.error('   Errors:', errors);
        } else {
            console.log('✅ [validateForm] Validation PASSED - all checks ok');
        }

        return isValid;
    };
    // ---------------------------------------------------------
    // التعديل الرئيسي هنا 👇
    // ---------------------------------------------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        console.log('🎯 [handleSubmit] Form submission started');

        if (!validateForm()) {
            console.warn('❌ [handleSubmit] Form validation failed');
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const chaletData = {
                TitleEn: formData.titleEn,
                TitleAr: formData.titleAr,
                DescriptionEn: formData.descriptionEn,
                DescriptionAr: formData.descriptionAr,
                PricePerNight: formData.pricePerNight,
                AdultsCapacity: formData.adultsCapacity,
                ChildrenCapacity: formData.childrenCapacity,
                RoomsCount: formData.roomsCount,
                BathroomsCount: formData.bathroomsCount,
                VillageNameEn: formData.villageNameEn,
                VillageNameAr: formData.villageNameAr,
            };

            console.log('📝 [handleSubmit] Chalet data:', chaletData);
            console.log('🖼️  [handleSubmit] Selected images:', selectedImages.length);

            if (editingChalet) {
                console.log('✏️  [handleSubmit] Editing chalet ID:', editingChalet.Id);

                // تحديث البيانات
                console.log('⏳ [handleSubmit] Awaiting updateChalet...');
                await updateChalet(editingChalet.Id, chaletData);
                console.log('✅ [handleSubmit] updateChalet completed');

                // رفع الصور إذا وجدت
                if (selectedImages.length > 0) {
                    console.log('⏳ [handleSubmit] Awaiting uploadChaletImages...');
                    await uploadChaletImages(editingChalet.Id, selectedImages);
                    console.log('✅ [handleSubmit] uploadChaletImages completed');
                }

                // تحديث ترتيب الصور الموجودة
                if (existingImages.length > 0) {
                    console.log('⏳ [handleSubmit] Reordering existing images...');
                    await reorderChaletImages(editingChalet.Id, existingImages.map(img => img.Id));
                }
            } else {
                console.log('➕ [handleSubmit] Creating new chalet');
                console.log('⏳ [handleSubmit] Awaiting createChalet...');

                const result = await createChalet(chaletData, selectedImages);

                console.log('✅ [handleSubmit] createChalet completed successfully');
                console.log('📦 [handleSubmit] Response:', result);
            }

            console.log('🧹 [handleSubmit] Clearing form...');
            setShowForm(false);
            setEditingChalet(null);
            setSelectedImages([]);
            setExistingImages([]);
            setImageError(null);
            setSubmitError(null);
            setFormData({
                titleEn: '',
                titleAr: '',
                descriptionEn: '',
                descriptionAr: '',
                pricePerNight: 0,
                adultsCapacity: 0,
                childrenCapacity: 0,
                roomsCount: 0,
                bathroomsCount: 0,
                villageNameEn: '',
                villageNameAr: '',
            });

            console.log('⏳ [handleSubmit] Fetching updated chalets...');
            await fetchData();

            console.log('✨ [handleSubmit] SUCCESS! All operations completed');

        } catch (error: any) {
            console.error('❌ [handleSubmit] FAILED - Caught error');
            console.error('Error object:', error);
            console.error('Error message:', error?.message);
            console.error('Response status:', error?.response?.status);
            console.error('Response data:', error?.response?.data);
            console.error('Config:', error?.config);

            // محاولة استخراج رسالة خطأ مفيدة
            let errorMessage = t('common.error');

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                // قد يكون هناك validation errors
                const errors = error.response.data.errors;
                errorMessage = Object.values(errors)
                    .flat()
                    .join(', ') as string;
            } else if (error.message) {
                errorMessage = error.message;
            }

            console.log('📣 [handleSubmit] Setting error message:', errorMessage);
            setSubmitError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };
    // ---------------------------------------------------------

    const handleEdit = (chalet: Chalet) => {
        setEditingChalet(chalet);
        setFormData({
            titleEn: chalet.TitleEn,
            titleAr: chalet.TitleAr,
            descriptionEn: chalet.DescriptionEn,
            descriptionAr: chalet.DescriptionAr,
            pricePerNight: chalet.PricePerNight,
            adultsCapacity: chalet.AdultsCapacity,
            childrenCapacity: chalet.ChildrenCapacity,
            roomsCount: chalet.RoomsCount || 0,
            bathroomsCount: chalet.BathroomsCount || 0,
            villageNameEn: chalet.VillageNameEn || '',
            villageNameAr: chalet.VillageNameAr || '',
        });
        setExistingImages((chalet.Images || []).sort((a, b) => a.DisplayOrder - b.DisplayOrder));
        setSelectedImages([]);
        setImageError(null);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('dashboard.confirmDelete'))) return;
        try {
            await deleteChalet(id);
            fetchData();
        } catch (error) {
            console.error('Error deleting chalet:', error);
            alert(t('common.error'));
        }
    };

    const handleDeleteImage = async (imageId: number) => {
        if (!editingChalet) return;
        if (!confirm(isArabic ? 'هل أنت متأكد من حذف هذه الصورة؟' : 'Are you sure you want to delete this image?')) return;

        try {
            await deleteChaletImage(editingChalet.Id, imageId);
            setExistingImages(prev => prev.filter(img => img.Id !== imageId));

            // Update the main chalets list to reflect changes
            setChalets(prev => prev.map(c => {
                if (c.Id === editingChalet.Id) {
                    return {
                        ...c,
                        Images: c.Images?.filter(img => img.Id !== imageId) || []
                    };
                }
                return c;
            }));
        } catch (error) {
            console.error('Error deleting image:', error);
            alert(t('common.error'));
        }
    };

    const moveExistingImage = (index: number, direction: 'left' | 'right') => {
        const newImages = [...existingImages];
        const newIndex = direction === 'left' ? index - 1 : index + 1;

        if (newIndex >= 0 && newIndex < newImages.length) {
            [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
            setExistingImages(newImages);
        }
    };

    const moveSelectedImage = (index: number, direction: 'left' | 'right') => {
        const newImages = [...selectedImages];
        const newIndex = direction === 'left' ? index - 1 : index + 1;

        if (newIndex >= 0 && newIndex < newImages.length) {
            [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
            setSelectedImages(newImages);
        }
    };

    const handleImageSelection = (files: FileList | null) => {
        if (!files) return;

        const totalImages = selectedImages.length + files.length + existingImages.length;

        if (totalImages > MAX_IMAGES) {
            setImageError(
                isArabic
                    ? `الحد الأقصى من الصور هو ${MAX_IMAGES} صورة لكل شالية. لديك ${existingImages.length} صورة وتحاول إضافة ${files.length} (المجموع ${totalImages}).`
                    : `Maximum ${MAX_IMAGES} images per chalet. You have ${existingImages.length} images and are trying to add ${files.length} (Total ${totalImages}).`
            );
            return;
        }

        setImageError(null);
        setSelectedImages(prev => [...prev, ...Array.from(files)]);
    };

    return (
        <div className="min-h-screen bg-stone-50 font-sans relative isolate" dir={isArabic ? 'rtl' : 'ltr'}>
            <DashboardHeader />

            <main className="container mx-auto px-4 md:px-6 py-6 font-sans">
                {/* Earnings Summary Section */}
                {(loading || earningsSummary) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {loading ? (
                            // Skeletons
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3 animate-pulse">
                                    <div className="h-3 w-24 bg-slate-100 rounded opacity-70" />
                                    <div className="h-8 w-32 bg-slate-50 rounded" />
                                    <div className="h-3 w-20 bg-slate-100 rounded opacity-50" />
                                </div>
                            ))
                        ) : earningsSummary && (
                            <>
                                <div
                                    onClick={() => navigate('/owner/earnings')}
                                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-1 cursor-pointer hover:shadow-md transition-all group overflow-hidden relative"
                                >
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50/50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                                    <span className="text-slate-500 text-sm font-medium z-10">{isArabic ? 'إجمالي الأرباح' : 'Total Earnings'}</span>
                                    <div className="flex items-baseline gap-1 z-10">
                                        <span className="text-2xl font-extrabold text-slate-800">{earningsSummary.TotalEarnings.toLocaleString()}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">{isArabic ? 'ج.م' : 'EGP'}</span>
                                    </div>
                                    <div className="mt-3 text-[11px] text-blue-500 font-bold flex items-center gap-1 group-hover:gap-2 transition-all z-10">
                                        {isArabic ? 'عرض التفاصيل' : 'View Details'}
                                        <svg className={`w-3 h-3 ${isArabic ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-1 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50/50 rounded-bl-full -mr-4 -mt-4" />
                                    <span className="text-slate-500 text-sm font-medium z-10">{isArabic ? 'أرباح قادمة' : 'Upcoming Revenue'}</span>
                                    <div className="flex items-baseline gap-1 z-10">
                                        <span className="text-2xl font-extrabold text-indigo-600">{earningsSummary.UpcomingEarnings.toLocaleString()}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">{isArabic ? 'ج.م' : 'EGP'}</span>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-1 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50/50 rounded-bl-full -mr-4 -mt-4" />
                                    <span className="text-slate-500 text-sm font-medium z-10">{isArabic ? 'أرباح مكتملة' : 'Completed Revenue'}</span>
                                    <div className="flex items-baseline gap-1 z-10">
                                        <span className="text-2xl font-extrabold text-emerald-600">{earningsSummary.CompletedEarnings.toLocaleString()}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">{isArabic ? 'ج.م' : 'EGP'}</span>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-1 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50/50 rounded-bl-full -mr-4 -mt-4" />
                                    <span className="text-slate-500 text-sm font-medium z-10">{isArabic ? 'إجمالي العمولة' : 'Total Commission'}</span>
                                    <div className="flex items-baseline gap-1 z-10">
                                        <span className="text-2xl font-extrabold text-rose-500">{earningsSummary.TotalCommission.toLocaleString()}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">{isArabic ? 'ج.م' : 'EGP'}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
                            {t('dashboard.myChalets')}
                        </h2>
                        <p className="text-slate-500 mt-1">
                            {isArabic ? 'إدارة عقاراتك وعروض الإيجار' : 'Manage your rental properties and listings'}
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            if (!editingChalet && chalets.length >= MAX_CHALETS) {
                                setSubmitError(
                                    isArabic
                                        ? `الحد الأقصى من الشاليهات هو ${MAX_CHALETS}. لديك بالفعل ${chalets.length} شاليهات.`
                                        : `Maximum ${MAX_CHALETS} chalets allowed. You already have ${chalets.length} chalets.`
                                );
                                return;
                            }
                            setEditingChalet(null);
                            setSelectedImages([]);
                            setExistingImages([]);
                            setImageError(null);
                            setSubmitError(null);
                            setFormErrors({});
                            setFormData({
                                titleEn: '',
                                titleAr: '',
                                descriptionEn: '',
                                descriptionAr: '',
                                pricePerNight: 0,
                                adultsCapacity: 0,
                                childrenCapacity: 0,
                                roomsCount: 0,
                                bathroomsCount: 0,
                                villageNameEn: '',
                                villageNameAr: '',
                            });
                            setShowForm(true);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all hover:scale-105"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {t('dashboard.addChalet')}
                    </button>
                </div>

                {/* Notifications */}
                {submitError && !showForm && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 animate-fade-in">
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                            <p className="text-sm text-red-700 font-medium">{submitError}</p>
                        </div>
                        <button onClick={() => setSubmitError(null)} className="text-red-400 hover:text-red-600">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                )}

                {/* Main Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-500 animate-pulse">{isArabic ? 'جاري التحميل...' : 'Loading chalets...'}</p>
                    </div>
                ) : chalets.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{isArabic ? 'لا توجد شاليهات' : 'No Chalets Found'}</h3>
                        <p className="text-slate-500 mb-6 max-w-md mx-auto">{isArabic ? 'ابدأ بإضافة شاليهك الأول واحصل على حجوزات!' : 'Start by adding your first chalet to get bookings!'}</p>
                        <button onClick={() => setShowForm(true)} className="px-6 py-2 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 font-medium text-slate-700 transition">
                            {t('dashboard.addChalet')}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {chalets.map((chalet) => (
                            <ChaletCard
                                key={chalet.Id}
                                chalet={chalet}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    {/* Background backdrop, show/hide based on modal state. */}
                    <div className="fixed inset-0 bg-gray-900/50 transition-opacity" aria-hidden="true" onClick={() => setShowForm(false)} />

                    <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                        <form
                            onSubmit={handleSubmit}
                            className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 w-full max-w-2xl"
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800" id="modal-title">
                                        {editingChalet ? t('dashboard.edit') : t('dashboard.addChalet')}
                                    </h2>
                                    {editingChalet && <p className="text-xs text-slate-400 font-mono mt-0.5">REF: {editingChalet.Id}</p>}
                                </div>
                                <button type="button" onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                                {submitError && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
                                        {submitError}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Titles */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('dashboard.titleEn')}</label>
                                        <input type="text" value={formData.titleEn} onChange={e => setFormData({ ...formData, titleEn: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none" required />
                                        {formErrors.titleEn && <p className="text-red-500 text-xs mt-1">{formErrors.titleEn}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('dashboard.titleAr')}</label>
                                        <input type="text" value={formData.titleAr} onChange={e => setFormData({ ...formData, titleAr: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none" required />
                                        {formErrors.titleAr && <p className="text-red-500 text-xs mt-1">{formErrors.titleAr}</p>}
                                    </div>

                                    {/* Villages selection (Merged into one dropdown) */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">{isArabic ? 'اختر القرية' : 'Select Village'}</label>
                                        <select
                                            value={VILLAGES.find(v => v.en === formData.villageNameEn)?.en || ''}
                                            onChange={(e) => {
                                                const selected = VILLAGES.find(v => v.en === e.target.value);
                                                if (selected) {
                                                    setFormData({
                                                        ...formData,
                                                        villageNameEn: selected.en,
                                                        villageNameAr: selected.ar
                                                    });
                                                } else {
                                                    setFormData({
                                                        ...formData,
                                                        villageNameEn: '',
                                                        villageNameAr: ''
                                                    });
                                                }
                                            }}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none bg-white font-medium"
                                            required
                                        >
                                            <option value="">{isArabic ? 'اختر قرية...' : 'Select a village...'}</option>
                                            {VILLAGES.map((v) => (
                                                <option key={v.en} value={v.en}>
                                                    {isArabic ? v.ar : v.en}
                                                </option>
                                            ))}
                                        </select>
                                        {(formErrors.villageNameEn || formErrors.villageNameAr) && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {isArabic ? 'يرجى اختيار القرية' : 'Please select a village'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Descriptions */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('dashboard.descriptionEn')}</label>
                                        <textarea value={formData.descriptionEn} onChange={e => setFormData({ ...formData, descriptionEn: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none" required />
                                        {formErrors.descriptionEn && <p className="text-red-500 text-xs mt-1">{formErrors.descriptionEn}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('dashboard.descriptionAr')}</label>
                                        <textarea value={formData.descriptionAr} onChange={e => setFormData({ ...formData, descriptionAr: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none" required />
                                        {formErrors.descriptionAr && <p className="text-red-500 text-xs mt-1">{formErrors.descriptionAr}</p>}
                                    </div>

                                    {/* Stats */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('dashboard.pricePerNight')}</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                                            <input type="number" value={formData.pricePerNight} onChange={e => setFormData({ ...formData, pricePerNight: Number(e.target.value) })} className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none" required />
                                        </div>
                                        {formErrors.pricePerNight && <p className="text-red-500 text-xs mt-1">{formErrors.pricePerNight}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{isArabic ? 'عدد الغرف' : 'Rooms'}</label>
                                            <input type="number" min="0" value={formData.roomsCount} onChange={e => setFormData({ ...formData, roomsCount: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none" required />
                                            {formErrors.roomsCount && <p className="text-red-500 text-xs mt-1">{formErrors.roomsCount}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{isArabic ? 'عدد الحمامات' : 'Bathrooms'}</label>
                                            <input type="number" min="0" value={formData.bathroomsCount} onChange={e => setFormData({ ...formData, bathroomsCount: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none" required />
                                            {formErrors.bathroomsCount && <p className="text-red-500 text-xs mt-1">{formErrors.bathroomsCount}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{isArabic ? 'البالغين' : 'Adults'}</label>
                                            <input type="number" min="1" value={formData.adultsCapacity} onChange={e => setFormData({ ...formData, adultsCapacity: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none" required />
                                            {formErrors.adultsCapacity && <p className="text-red-500 text-xs mt-1">{formErrors.adultsCapacity}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{isArabic ? 'الأطفال' : 'Children'}</label>
                                            <input type="number" min="0" value={formData.childrenCapacity} onChange={e => setFormData({ ...formData, childrenCapacity: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none" required />
                                            {formErrors.childrenCapacity && <p className="text-red-500 text-xs mt-1">{formErrors.childrenCapacity}</p>}
                                        </div>
                                    </div>

                                    {/* Images */}
                                    <div className="md:col-span-2 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-semibold text-slate-700">{isArabic ? 'الصور' : 'Images'}</label>
                                            <span className="text-xs text-slate-400">Max {MAX_IMAGES}</span>
                                        </div>
                                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 hover:bg-slate-100 transition-colors text-center cursor-pointer relative">
                                            <input type="file" multiple accept="image/*" onChange={e => handleImageSelection(e.target.files)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                            <svg className="w-8 h-8 mx-auto text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            <p className="text-sm text-slate-500">Click to upload or drag and drop</p>
                                        </div>
                                        {imageError && <p className="text-red-500 text-sm">{imageError}</p>}

                                        {(existingImages.length > 0 || selectedImages.length > 0) && (
                                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-4">
                                                {existingImages.map((img, index) => (
                                                    <div key={img.Id} className="aspect-square relative rounded-lg overflow-hidden group border border-slate-200">
                                                        <img
                                                            src={getImageUrl(img.ImageUrl)}
                                                            width={200}
                                                            height={200}
                                                            loading="lazy"
                                                            className="w-full h-full object-cover"
                                                        />
                                                        {/* Controls Overlay */}
                                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 flex justify-between items-center px-1 py-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.preventDefault(); moveExistingImage(index, 'left'); }}
                                                                className="text-white hover:text-blue-300 p-1 disabled:opacity-30"
                                                                disabled={index === 0}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleDeleteImage(img.Id);
                                                                }}
                                                                className="text-red-400 hover:text-red-500 p-1"
                                                                title={isArabic ? 'حذف' : 'Delete'}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.preventDefault(); moveExistingImage(index, 'right'); }}
                                                                className="text-white hover:text-blue-300 p-1 disabled:opacity-30"
                                                                disabled={index === existingImages.length - 1}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                            </button>
                                                        </div>
                                                        {index === 0 && (
                                                            <div className="absolute top-1 left-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm z-10 pointer-events-none">
                                                                Main
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {selectedImages.map((file, i) => (
                                                    <div key={i} className="aspect-square relative rounded-lg overflow-hidden group border-2 border-green-400">
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            width={200}
                                                            height={200}
                                                            loading="lazy"
                                                            className="w-full h-full object-cover"
                                                        />
                                                        {/* Controls Overlay for Selected Images */}
                                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 flex justify-between items-center px-1 py-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.preventDefault(); moveSelectedImage(i, 'left'); }}
                                                                className="text-white hover:text-blue-300 p-1 disabled:opacity-30"
                                                                disabled={i === 0}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                                            </button>
                                                            <button type="button" onClick={() => setSelectedImages(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-500 p-1">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.preventDefault(); moveSelectedImage(i, 'right'); }}
                                                                className="text-white hover:text-blue-300 p-1 disabled:opacity-30"
                                                                disabled={i === selectedImages.length - 1}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                            </button>
                                                        </div>
                                                        <div className="absolute top-1 left-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm z-10 pointer-events-none">
                                                            New
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-white hover:border-slate-300 transition-colors disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 shadow-md shadow-blue-200 transition-all disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px]"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            {isArabic ? 'جاري الحفظ...' : 'Saving...'}
                                        </>
                                    ) : (
                                        editingChalet ? t('dashboard.update') : t('dashboard.create')
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;