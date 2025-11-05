import React, { useState, useEffect } from 'react';
import { MENU_DATA } from '../../constants';
import type { Promotion } from '../../types';
import { XIcon, ChevronLeftIcon, ChevronRightIcon, CheckIcon, PencilIcon, TrashIcon } from '../icons';

// A single promotion card component
const PromotionCard: React.FC<{
    promotion: Promotion;
    onToggleStatus: (promotion: Promotion) => void;
    onEdit: (promotion: Promotion) => void;
    onDelete: (id: number) => void;
}> = ({ promotion, onToggleStatus, onEdit, onDelete }) => {
    const { id, name, description, discountType, discountValue, startDate, endDate, isActive } = promotion;
    
    const discountDisplay = discountType === 'percentage'
        ? `${discountValue}% OFF`
        : `₹${discountValue} OFF`;

    return (
        <div className={`bg-white p-6 rounded-2xl shadow-sm transition-all border-l-4 ${isActive ? 'border-primary hover:shadow-lg' : 'border-neutral-300 opacity-80 hover:opacity-100'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start">
                <div className="flex-1 pr-4 mb-4 sm:mb-0">
                    <h3 className="text-lg font-bold text-neutral-800">{name}</h3>
                    <p className="text-sm text-neutral-600 mt-1">{description}</p>
                </div>
                <div className="flex flex-col items-start sm:items-end space-y-2">
                    <span className="text-xl font-bold text-primary">{discountDisplay}</span>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-200 text-xs text-neutral-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <p className="font-medium text-neutral-600"><strong>Validity:</strong> {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-2 self-end sm:self-center">
                     <label htmlFor={`status-toggle-${id}`} className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input type="checkbox" id={`status-toggle-${id}`} className="sr-only" checked={isActive} onChange={() => onToggleStatus({ ...promotion, isActive: !isActive })} />
                            <div className="block bg-neutral-200 w-12 h-6 rounded-full"></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isActive ? 'translate-x-6 bg-primary' : ''}`}></div>
                        </div>
                    </label>
                    <button 
                        onClick={() => onEdit(promotion)} 
                        className="p-2 text-neutral-500 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors"
                        aria-label="Edit Promotion"
                    >
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => onDelete(id)} 
                        className="p-2 text-neutral-500 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                        aria-label="Delete Promotion"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const PromotionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (promotion: Omit<Promotion, 'id'> | Promotion) => void;
    editingPromotion: Promotion | null;
}> = ({ isOpen, onClose, onSave, editingPromotion }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [promotionData, setPromotionData] = useState<Partial<Promotion>>({});
    
    useEffect(() => {
        if (editingPromotion) {
            setPromotionData(editingPromotion);
        } else {
             setPromotionData({
                name: '', description: '', applicableItems: [],
                discountType: 'percentage', discountValue: 10,
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
                isActive: true,
            });
        }
        setCurrentStep(1);
    }, [editingPromotion, isOpen]);

    const allMenuItems = MENU_DATA.flatMap(category => category.items.map(item => item.name));

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPromotionData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = e.target.options;
        const value: string[] = [];
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) { value.push(options[i].value); }
        }
        setPromotionData(prev => ({ ...prev, applicableItems: value }));
    };

    const handleSave = () => {
        if (!promotionData.name || !promotionData.startDate || !promotionData.endDate) {
            alert('Please fill in all required fields.');
            return;
        }
        onSave(promotionData as Promotion);
        onClose();
    };

    if (!isOpen) return null;

    const steps = [ { number: 1, title: 'Basic Info' }, { number: 2, title: 'Discount Details' }, { number: 3, title: 'Validity' }, ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all">
                <div className="flex justify-between items-center p-5 border-b border-neutral-200">
                    <h2 className="text-xl font-bold text-neutral-800">{editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}</h2>
                    <button onClick={onClose} className="text-neutral-500 hover:text-neutral-800"><XIcon /></button>
                </div>

                <div className="p-6">
                    <div className="flex items-center justify-center mb-8">
                        {steps.map((step, index) => (
                            <React.Fragment key={step.number}>
                                <div className="flex flex-col items-center"><div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${currentStep >= step.number ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-600'}`}>{step.number}</div><p className={`text-xs mt-2 font-semibold ${currentStep >= step.number ? 'text-primary' : 'text-neutral-500'}`}>{step.title}</p></div>
                                {index < steps.length - 1 && <div className={`flex-auto border-t-2 mx-4 transition-colors duration-500 ${currentStep > index + 1 ? 'border-primary' : 'border-neutral-200'}`}></div>}
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="space-y-4 min-h-[280px]">
                        {currentStep === 1 && (<>
                            <div><label htmlFor="name" className="block text-sm font-medium text-neutral-700">Promotion Name</label><input type="text" name="name" id="name" value={promotionData.name || ''} onChange={handleChange} className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary" /></div>
                            <div><label htmlFor="description" className="block text-sm font-medium text-neutral-700">Description</label><textarea name="description" id="description" rows={4} value={promotionData.description || ''} onChange={handleChange} className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary"></textarea></div>
                        </>)}
                        {currentStep === 2 && (<>
                            <div><label htmlFor="applicableItems" className="block text-sm font-medium text-neutral-700">Applicable Items (Hold Ctrl/Cmd to select multiple)</label><select multiple name="applicableItems" id="applicableItems" value={promotionData.applicableItems} onChange={handleMultiSelectChange} className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm p-2 h-32 focus:ring-primary focus:border-primary">{allMenuItems.map(item => <option key={item} value={item}>{item}</option>)}</select></div>
                            <div className="flex items-center space-x-8 pt-2"><div className="flex-1"><label className="block text-sm font-medium text-neutral-700">Discount Type</label><div className="mt-2 flex space-x-4"><label className="flex items-center"><input type="radio" name="discountType" value="percentage" checked={promotionData.discountType === 'percentage'} onChange={handleChange} className="h-4 w-4 text-primary focus:ring-primary border-neutral-300"/> <span className="ml-2 text-neutral-800">Percentage</span></label><label className="flex items-center"><input type="radio" name="discountType" value="fixed" checked={promotionData.discountType === 'fixed'} onChange={handleChange} className="h-4 w-4 text-primary focus:ring-primary border-neutral-300"/> <span className="ml-2 text-neutral-800">Fixed Amount</span></label></div></div><div className="flex-1"><label htmlFor="discountValue" className="block text-sm font-medium text-neutral-700">Discount Value</label><input type="number" name="discountValue" id="discountValue" value={promotionData.discountValue || ''} onChange={handleChange} className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary" /></div></div>
                        </>)}
                        {currentStep === 3 && (<div className="flex items-center space-x-4"><div className="flex-1"><label htmlFor="startDate" className="block text-sm font-medium text-neutral-700">Start Date</label><input type="date" name="startDate" id="startDate" value={promotionData.startDate || ''} onChange={handleChange} className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary" /></div><div className="flex-1"><label htmlFor="endDate" className="block text-sm font-medium text-neutral-700">End Date</label><input type="date" name="endDate" id="endDate" value={promotionData.endDate || ''} onChange={handleChange} className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary" /></div></div>)}
                    </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-b-lg"><button onClick={handleBack} disabled={currentStep === 1} className="flex items-center px-4 py-2 bg-neutral-300 text-neutral-800 rounded-md hover:bg-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"><ChevronLeftIcon className="w-5 h-5 mr-2" /> Back</button>
                    {currentStep < 3 ? (<button onClick={handleNext} className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark font-semibold">Next <ChevronRightIcon className="w-5 h-5 ml-2" /></button>) : (<button onClick={handleSave} className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark font-semibold"><CheckIcon className="w-5 h-5 mr-2" /> Save Promotion</button>)}
                </div>
            </div>
        </div>
    );
};


interface PromotionsViewProps {
    promotions: Promotion[];
    onSave: (data: Omit<Promotion, 'id'>) => void;
    onUpdate: (data: Promotion) => void;
    onDelete: (id: number) => void;
}

const PromotionsView: React.FC<PromotionsViewProps> = ({ promotions, onSave, onUpdate, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

    const handleEdit = (promotion: Promotion) => {
        setEditingPromotion(promotion);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this promotion?')) {
            onDelete(id);
        }
    };
    
    const handleSaveOrUpdate = (data: Promotion | Omit<Promotion, 'id'>) => {
        if ('id' in data) {
            onUpdate(data);
        } else {
            onSave(data);
        }
    };

    const openCreateModal = () => {
        setEditingPromotion(null);
        setIsModalOpen(true);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-neutral-800">Promotions Management</h1>
                <button onClick={openCreateModal} className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                    + Create New Promotion
                </button>
            </div>
            
            <PromotionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveOrUpdate}
                editingPromotion={editingPromotion}
            />

            <div className="space-y-6">
                {promotions.length > 0 ? (
                    promotions.map(promo => (
                        <PromotionCard 
                            key={promo.id} 
                            promotion={promo} 
                            onToggleStatus={onUpdate}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200 text-center text-neutral-500">
                        <p>There are no promotions configured at the moment.</p>
                        <p className="mt-2">Click "Create New Promotion" to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromotionsView;