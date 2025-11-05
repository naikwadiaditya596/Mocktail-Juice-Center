import React, { useState, useMemo, useEffect } from 'react';
import { MENU_DATA } from '../../constants';
import type { OrderItem, Promotion, Order } from '../../types';
import { ShoppingBagIcon } from '../icons';

const OrderConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    total: number;
    isPlacingOrder: boolean;
}> = ({ isOpen, onClose, onConfirm, total, isPlacingOrder }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm transform transition-all text-center p-6">
                <div className="mx-auto bg-primary/10 rounded-full h-16 w-16 flex items-center justify-center mb-4">
                    <ShoppingBagIcon className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800 mb-2">Confirm Your Order</h2>
                <p className="text-neutral-600 mb-4">Please confirm the total amount to place your order.</p>
                <div className="bg-neutral-100 p-4 rounded-lg mb-6">
                    <p className="text-sm text-neutral-500">Total Amount</p>
                    <p className="text-3xl font-bold text-primary">₹{total.toFixed(2)}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                        onClick={onClose} 
                        className="w-full px-4 py-3 bg-neutral-200 text-neutral-800 rounded-lg hover:bg-neutral-300 font-semibold transition-colors disabled:opacity-50"
                        disabled={isPlacingOrder}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-semibold transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                        disabled={isPlacingOrder}
                    >
                         {isPlacingOrder ? (<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>) : null}
                        {isPlacingOrder ? 'Processing...' : 'Confirm Order'}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface OrderViewProps {
    promotions: Promotion[];
    onPlaceOrder: (orderItems: OrderItem[], total: number, promotion: Promotion | undefined, id: string) => Order;
}

const OrderView: React.FC<OrderViewProps> = ({ promotions, onPlaceOrder }) => {
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'default' | 'price-asc' | 'price-desc'>('default');
    const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [isTotalAnimating, setIsTotalAnimating] = useState(false);
    const [isBagAnimating, setIsBagAnimating] = useState(false);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => {
            setToastMessage(null);
        }, 3000);
    };

    const addToCart = (item: OrderItem) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.name === item.name);
            if (existingItem) {
                return prevCart.map(cartItem =>
                    cartItem.name === item.name ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
                );
            }
            return [...prevCart, { ...item, quantity: 1 }];
        });
        showToast(`${item.name} added to cart!`);
        setIsBagAnimating(true);
        setTimeout(() => setIsBagAnimating(false), 500); // Animation duration matches 'pulse-sm'
    };

    const updateQuantity = (name: string, quantity: number) => {
        setCart(prevCart => {
            if (quantity <= 0) {
                return prevCart.filter(item => item.name !== name);
            }
            return prevCart.map(item =>
                item.name === name ? { ...item, quantity } : item
            );
        });
    };
    
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const { discount, finalTotal, tax } = useMemo(() => {
        let discount = 0;
        if (selectedPromotion) {
            const isPromotionForAllItems = !selectedPromotion.applicableItems || selectedPromotion.applicableItems.length === 0;
            
            const applicableTotal = isPromotionForAllItems
                ? subtotal
                : cart
                    .filter(item => selectedPromotion.applicableItems.includes(item.name))
                    .reduce((sum, item) => sum + item.price * item.quantity, 0);

            if (selectedPromotion.discountType === 'percentage') {
                discount = applicableTotal * (selectedPromotion.discountValue / 100);
            } else {
                discount = Math.min(applicableTotal, selectedPromotion.discountValue);
            }
        }
        const totalAfterDiscount = subtotal - discount;
        const tax = totalAfterDiscount * 0.05; // 5% tax
        const finalTotal = totalAfterDiscount + tax;
        return { discount, finalTotal, tax };
    }, [cart, selectedPromotion, subtotal]);
    
    useEffect(() => {
        if (finalTotal > 0) {
            setIsTotalAnimating(true);
            const timer = setTimeout(() => setIsTotalAnimating(false), 500);
            return () => clearTimeout(timer);
        }
    }, [finalTotal]);

    const handlePlaceOrder = () => {
        setIsPlacingOrder(true);
        const newOrderId = `POS-${Date.now().toString().slice(-6)}`;
        
        setTimeout(() => {
            const newOrder = onPlaceOrder(cart, finalTotal, selectedPromotion || undefined, newOrderId);
            setCart([]);
            setSelectedPromotion(null);
            setIsPlacingOrder(false);
            setIsConfirmationModalOpen(false);
            showToast(`Order #${newOrder.id} placed successfully!`);
        }, 500);
    };

    const handleInitiateOrder = () => {
        if (cart.length === 0) {
            showToast('Cannot place an empty order.');
            return;
        }
        setIsConfirmationModalOpen(true);
    };

    const filteredMenuItems = useMemo(() => {
        let items = selectedCategory === 'All'
            ? MENU_DATA.flatMap(cat => cat.items)
            : MENU_DATA.find(cat => cat.name === selectedCategory)?.items || [];
            
        if (searchTerm) {
             items = items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (sortOrder === 'price-asc') {
            return [...items].sort((a, b) => a.price - b.price);
        }
        if (sortOrder === 'price-desc') {
            return [...items].sort((a, b) => b.price - a.price);
        }

        return items;
    }, [selectedCategory, searchTerm, sortOrder]);

    const activePromotions = promotions.filter(p => p.isActive);

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-full max-h-[calc(100vh-120px)]">
             {toastMessage && (
                <div className="fixed bottom-5 right-5 bg-neutral-800 text-white py-3 px-5 rounded-lg shadow-xl animate-slide-in-up z-50">
                    {toastMessage}
                </div>
            )}
            <OrderConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={() => !isPlacingOrder && setIsConfirmationModalOpen(false)}
                onConfirm={handlePlaceOrder}
                total={finalTotal}
                isPlacingOrder={isPlacingOrder}
            />

            {/* Menu Section */}
            <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">Point of Sale</h2>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Search for any item..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                     <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'default' | 'price-asc' | 'price-desc')}
                        className="p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white sm:w-auto"
                        aria-label="Sort menu items"
                    >
                        <option value="default">Default Sort</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                    </select>
                </div>
                <div className="border-b border-neutral-200 mb-4 -mx-6 px-6 overflow-x-auto">
                    <nav className="-mb-px flex space-x-6">
                        <button
                            key="all-categories"
                            onClick={() => setSelectedCategory('All')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${selectedCategory === 'All'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                                }`}
                        >
                            All Categories
                        </button>
                        {MENU_DATA.map(category => (
                            <button
                                key={category.name}
                                onClick={() => setSelectedCategory(category.name)}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${selectedCategory === category.name
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                                    }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="flex-1 overflow-y-auto -mx-2 px-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {filteredMenuItems.map(item => (
                             <div key={item.name} onClick={() => addToCart(item as OrderItem)} className="bg-white border border-neutral-200 rounded-lg p-3 text-center cursor-pointer hover:shadow-lg hover:border-primary hover:scale-105 active:scale-100 transition-all group">
                                <p className="font-semibold text-neutral-700 group-hover:text-primary transition-colors text-sm">{item.name}</p>
                                <p className="text-sm text-neutral-500 font-bold">₹{item.price.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Billing Section */}
            <div className="w-full lg:w-96 bg-white rounded-2xl shadow-sm border border-neutral-200 flex flex-col">
                <div className="p-6 pb-4 sticky top-0 bg-white z-10 border-b border-neutral-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-neutral-800">Current Bill</h2>
                        <ShoppingBagIcon className={`w-7 h-7 text-primary transition-transform ${isBagAnimating ? 'animate-pulse-sm' : ''}`} />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-6">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <ShoppingBagIcon className="w-20 h-20 text-neutral-300 mb-4" />
                            <p className="text-neutral-500 font-semibold">The bill is empty.</p>
                            <p className="text-neutral-400 text-sm">Add items to get started.</p>
                        </div>
                    ) : (
                        <div className="pt-4">
                            {cart.map(item => (
                                <div key={item.name} className="flex items-center justify-between mb-3 pb-3 border-b border-neutral-100">
                                    <div className="flex items-center flex-1 min-w-0">
                                        <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-md mr-3 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="font-semibold text-neutral-800 text-sm truncate">{item.name}</p>
                                            <p className="text-xs text-neutral-500">₹{item.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center flex-shrink-0">
                                        <button onClick={() => updateQuantity(item.name, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center bg-neutral-100 rounded-md hover:bg-neutral-200 font-bold" aria-label={`Decrease quantity for ${item.name}`}>-</button>
                                        <input
                                            type="number"
                                            aria-label={`Quantity for ${item.name}`}
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.name, parseInt(e.target.value) || 0)}
                                            className="w-10 text-center font-semibold bg-transparent focus:outline-none"
                                            min="1"
                                        />
                                        <button onClick={() => updateQuantity(item.name, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center bg-neutral-100 rounded-md hover:bg-neutral-200 font-bold" aria-label={`Increase quantity for ${item.name}`}>+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-6 pt-4 border-t border-neutral-200">
                     {activePromotions.length > 0 && (
                        <div className="mb-4">
                            <label htmlFor="promotion-select" className="block text-sm font-medium text-neutral-700 mb-1">Apply Promotion</label>
                            <select
                                id="promotion-select"
                                value={selectedPromotion?.id || ''}
                                onChange={(e) => setSelectedPromotion(promotions.find(p => p.id === parseInt(e.target.value)) || null)}
                                className="w-full p-2 border border-neutral-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">No Promotion</option>
                                {activePromotions.map(promo => (
                                    <option key={promo.id} value={promo.id}>{promo.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-neutral-600">Subtotal:</span><span className="font-medium text-neutral-800">₹{subtotal.toFixed(2)}</span></div>
                        {discount > 0 && <div className="flex justify-between"><span className="text-green-600">Discount:</span><span className="font-medium text-green-600">-₹{discount.toFixed(2)}</span></div>}
                        <div className="flex justify-between"><span className="text-neutral-600">Tax (5%):</span><span className="font-medium text-neutral-800">₹{tax.toFixed(2)}</span></div>
                        <div className={`flex justify-between text-lg font-bold text-neutral-900 pt-2 border-t border-neutral-200 transition-transform ${isTotalAnimating ? 'animate-pulse-sm' : ''}`}><span >Total:</span><span>₹{finalTotal.toFixed(2)}</span></div>
                    </div>
                    <button onClick={handleInitiateOrder} disabled={cart.length === 0} className="w-full mt-4 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                        Place Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderView;