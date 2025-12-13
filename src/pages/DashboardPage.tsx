import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { getMyChalets, createChalet, updateChalet, deleteChalet, uploadChaletImages } from '../api/chalets';
import type { Chalet, ChaletImage } from '../types/chalet';
import DashboardHeader from '../components/DashboardHeader';
import ChaletCard from '../components/dashboard/ChaletCard';

import { getImageUrl } from '../config/api';

const DashboardPage = () => {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';

    const [chalets, setChalets] = useState<Chalet[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingChalet, setEditingChalet] = useState<Chalet | null>(null);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<ChaletImage[]>([]);
    const [imageError, setImageError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const MAX_IMAGES = 12;
    const MAX_CHALETS = 5;

    const [formData, setFormData] = useState({
        titleEn: '',
        titleAr: '',
        descriptionEn: '',
        descriptionAr: '',
        pricePerNight: 0,
        adultsCapacity: 0,
        childrenCapacity: 0,
    });

    const [formErrors, setFormErrors] = useState<{
        titleEn?: string;
        titleAr?: string;
        descriptionEn?: string;
        descriptionAr?: string;
        pricePerNight?: string;
        adultsCapacity?: string;
        childrenCapacity?: string;
    }>({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const chaletsData = await getMyChalets();
            setChalets(chaletsData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const errors: typeof formErrors = {};
        let hasImageError = false;

        if (!formData.titleEn || formData.titleEn.trim().length < 3) {
            errors.titleEn = isArabic ? 'عنوان اللغة الإنجليزية مطلوب (3 أحرف على الأقل)' : 'English title is required (min 3 characters)';
        }

        if (!formData.titleAr || formData.titleAr.trim().length < 3) {
            errors.titleAr = isArabic ? 'عنوان اللغة العربية مطلوب (3 أحرف على الأقل)' : 'Arabic title is required (min 3 characters)';
        }

        if (!formData.descriptionEn || formData.descriptionEn.trim().length < 10) {
            errors.descriptionEn = isArabic ? 'الوصف بالإنجليزية مطلوب (10 أحرف على الأقل)' : 'English description is required (min 10 characters)';
        }

        if (!formData.descriptionAr || formData.descriptionAr.trim().length < 10) {
            errors.descriptionAr = isArabic ? 'الوصف بالعربية مطلوب (10 أحرف على الأقل)' : 'Arabic description is required (min 10 characters)';
        }

        if (formData.pricePerNight <= 0) {
            errors.pricePerNight = isArabic ? 'السعر مطلوب (يجب أن يكون أكبر من 0)' : 'Price is required (must be greater than 0)';
        }

        if (formData.adultsCapacity < 1) {
            errors.adultsCapacity = isArabic ? 'سعة البالغين مطلوبة (1 على الأقل)' : 'Adults capacity is required (min 1)';
        }

        if (formData.childrenCapacity < 0) {
            errors.childrenCapacity = isArabic ? 'سعة الأطفال مطلوبة (0 أو أكثر)' : 'Children capacity is required (0 or more)';
        }

        // Check if at least one image is selected for new chalets
        if (!editingChalet && selectedImages.length === 0) {
            setImageError(isArabic ? 'يجب اختيار صورة واحدة على الأقل' : 'At least one image is required');
            hasImageError = true;
        } else {
            setImageError(null);
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0 && !hasImageError;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        if (!validateForm()) {
            // validateForm() will set imageError and formErrors directly
            // Both will be displayed in the UI
            return;
        }

        try {
            const chaletData = {
                TitleEn: formData.titleEn,
                TitleAr: formData.titleAr,
                DescriptionEn: formData.descriptionEn,
                DescriptionAr: formData.descriptionAr,
                PricePerNight: formData.pricePerNight,
                AdultsCapacity: formData.adultsCapacity,
                ChildrenCapacity: formData.childrenCapacity,
            };

            let chaletId: number;
            if (editingChalet) {
                await updateChalet(editingChalet.Id, chaletData);
                chaletId = editingChalet.Id;
            } else {
                const newChalet = await createChalet(chaletData);
                chaletId = newChalet.Id;
            }

            if (selectedImages.length > 0) {
                await uploadChaletImages(chaletId, selectedImages);
            }

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
            });
            fetchData();
        } catch (error: any) {
            console.error('Error saving chalet:', error);

            // Handle specific error messages from backend
            if (error.response?.data?.message) {
                setSubmitError(error.response.data.message);
            } else if (error.message === 'Maximum 5 chalets allowed per owner') {
                setSubmitError(
                    isArabic
                        ? 'الحد الأقصى من الشاليهات هو 5 شاليهات لكل مالك'
                        : 'Maximum 5 chalets allowed per owner'
                );
            } else {
                setSubmitError(t('common.error'));
            }
        }
    };

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
        });
        setExistingImages(chalet.Images || []);
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

    const handleImageSelection = (files: FileList | null) => {
        if (!files) return;

        const totalImages = selectedImages.length + files.length;

        if (totalImages > MAX_IMAGES) {
            setImageError(
                isArabic
                    ? `الحد الأقصى من الصور هو ${MAX_IMAGES} صورة لكل شالية. أنت تحاول إضافة ${totalImages} صورة.`
                    : `Maximum ${MAX_IMAGES} images per chalet. You're trying to add ${totalImages} images.`
            );
            return;
        }

        setImageError(null);
        setSelectedImages(Array.from(files));
    };

    return (
        <div className="min-h-screen bg-stone-50 font-sans relative isolate" dir={isArabic ? 'rtl' : 'ltr'}>
            <DashboardHeader />

            <main className="container mx-auto px-4 md:px-6 py-6">
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

                                    {/* Descriptions */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('dashboard.descriptionEn')}</label>
                                        <textarea value={formData.descriptionEn} onChange={e => setFormData({ ...formData, descriptionEn: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none" required />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('dashboard.descriptionAr')}</label>
                                        <textarea value={formData.descriptionAr} onChange={e => setFormData({ ...formData, descriptionAr: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none" required />
                                    </div>

                                    {/* Stats */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('dashboard.pricePerNight')}</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                                            <input type="number" value={formData.pricePerNight} onChange={e => setFormData({ ...formData, pricePerNight: Number(e.target.value) })} className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none" required />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{isArabic ? 'البالغين' : 'Adults'}</label>
                                            <input type="number" min="1" value={formData.adultsCapacity} onChange={e => setFormData({ ...formData, adultsCapacity: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{isArabic ? 'الأطفال' : 'Children'}</label>
                                            <input type="number" min="0" value={formData.childrenCapacity} onChange={e => setFormData({ ...formData, childrenCapacity: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none" required />
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
                                                {existingImages.map(img => (
                                                    <div key={img.Id} className="aspect-square relative rounded-lg overflow-hidden group">
                                                        <img src={getImageUrl(img.ImageUrl)} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-white text-[10px] font-bold">SAVED</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {selectedImages.map((file, i) => (
                                                    <div key={i} className="aspect-square relative rounded-lg overflow-hidden group border-2 border-green-400">
                                                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => setSelectedImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">×</button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-white hover:border-slate-300 transition-colors">
                                    {t('common.cancel')}
                                </button>
                                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 shadow-md shadow-blue-200 transition-all">
                                    {editingChalet ? t('dashboard.update') : t('dashboard.create')}
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
