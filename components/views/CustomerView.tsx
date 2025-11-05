import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { User, Promotion, Order, OrderItem, MenuItem, MenuCategory, OrderStatus } from '../../types';
import { MENU_DATA } from '../../constants';
import { UserIcon, LogoutIcon, ShoppingBagIcon, XIcon, CheckIcon, OrderIcon } from '../icons';

type CustomerViewTab = 'menu' | 'orders';

const ProductDetailModal: React.FC<{
    item: MenuItem;
    onClose: () => void;
    onAddToCart: (item: MenuItem) => void;
    onBuyNow: (item: MenuItem) => void;
}> = ({ item, onClose, onAddToCart, onBuyNow }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all animate-slide-in-up">
                <div className="p-4">
                    <img src={item.image} alt={item.name} className="w-full h-64 object-cover rounded-lg mb-4" />
                    <h3 className="text-2xl font-bold text-neutral-800">{item.name}</h3>
                    <p className="text-lg font-semibold text-primary mb-2">₹{item.price.toFixed(2)}</p>
                    <p className="text-neutral-600 mb-6">{item.description}</p>
                </div>
                <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-b-lg gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded-md hover:bg-neutral-300 font-semibold w-1/3">Close</button>
                    <button onClick={() => { onAddToCart(item); onClose(); }} className="px-4 py-2 bg-primary/20 text-primary-dark rounded-md hover:bg-primary/30 font-semibold w-1/3">Add to Cart</button>
                    <button onClick={() => { onBuyNow(item); onClose(); }} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark font-semibold w-1/3">Buy Now</button>
                </div>
            </div>
        </div>
    );
};

const OrderSuccessModal: React.FC<{
    orderId: string;
    onContinue: () => void;
    onViewOrders: () => void;
}> = ({ orderId, onContinue, onViewOrders }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md text-center p-8 transform transition-all animate-slide-in-up">
            <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mb-4">
                <CheckIcon className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-2">Order Successful!</h2>
            <p className="text-neutral-600 mb-6">Your order <span className="font-bold text-primary">#{orderId}</span> has been placed.</p>
            <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={onViewOrders} className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-semibold transition-colors">View My Orders</button>
                <button onClick={onContinue} className="w-full px-4 py-3 bg-neutral-200 text-neutral-800 rounded-lg hover:bg-neutral-300 font-semibold transition-colors">Continue Shopping</button>
            </div>
        </div>
    </div>
);

const CustomerView: React.FC<{
    user: User;
    onLogout: () => void;
    promotions: Promotion[];
    onPlaceOrder: (orderItems: any[], total: number, promotion: Promotion | undefined, id: string) => Order;
    orders: Order[];
}> = ({ user, onLogout, promotions, onPlaceOrder, orders }) => {
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
    const [viewTab, setViewTab] = useState<CustomerViewTab>('menu');
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isBagAnimating, setIsBagAnimating] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [successfulOrder, setSuccessfulOrder] = useState<Order | null>(null);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [activeCategory, setActiveCategory] = useState(MENU_DATA[0].name);
    const [isTotalAnimating, setIsTotalAnimating] = useState(false);
    
    const categoryRefs = useRef<(HTMLDivElement | null)[]>([]);
    const categoryNavRef = useRef<HTMLDivElement>(null);
    const categoryButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const cartRef = useRef<HTMLDivElement>(null);

    // Intersection Observer for highlighting active category
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const categoryName = entry.target.getAttribute('data-category-name');
                        if (categoryName) setActiveCategory(categoryName);
                    }
                });
            },
            { rootMargin: '-40% 0px -60% 0px', threshold: 0 }
        );

        const currentRefs = categoryRefs.current;
        currentRefs.forEach(ref => { if (ref) observer.observe(ref); });

        return () => currentRefs.forEach(ref => { if (ref) observer.unobserve(ref); });
    }, []);

    // Effect to scroll category nav bar
    useEffect(() => {
        const activeCategoryIndex = MENU_DATA.findIndex(c => c.name === activeCategory);
        if (activeCategoryIndex !== -1) {
            const button = categoryButtonRefs.current[activeCategoryIndex];
            button?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, [activeCategory]);
    

    const scrollToCategory = (index: number) => {
        categoryRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const showToast = (message: string) => {
        setToastMessage(message);
        setIsBagAnimating(true);
        setTimeout(() => setToastMessage(null), 3000);
        setTimeout(() => setIsBagAnimating(false), 500);
    };

    const addToCart = (item: MenuItem) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.name === item.name);
            if (existingItem) {
                return prevCart.map(cartItem =>
                    cartItem.name === item.name ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
                );
            }
            return [...prevCart, { ...item, quantity: 1 }];
        });
        showToast(`${item.name} added!`);
    };

    const handleBuyNow = (item: MenuItem) => {
        addToCart(item);
        setTimeout(() => {
            cartRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
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
            const applicableTotal = isPromotionForAllItems ? subtotal : cart.filter(item => selectedPromotion.applicableItems.includes(item.name)).reduce((sum, item) => sum + item.price * item.quantity, 0);
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
        if (cart.length === 0) return;
        setIsPlacingOrder(true);
        
        setTimeout(() => {
            const newOrderId = `MJT-${Date.now().toString().slice(-6)}`;
            const newOrder = onPlaceOrder(cart, finalTotal, selectedPromotion || undefined, newOrderId);
            setSuccessfulOrder(newOrder);
            setCart([]);
            setSelectedPromotion(null);
            setIsPlacingOrder(false);
        }, 1000);
    };

    const filteredMenu = useMemo(() => {
        if (!searchTerm) return MENU_DATA;
        const lowercasedFilter = searchTerm.toLowerCase();
        return MENU_DATA.map(category => ({
            ...category,
            items: category.items.filter(item => item.name.toLowerCase().includes(lowercasedFilter))
        })).filter(category => category.items.length > 0);
    }, [searchTerm]);
    
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const getStatusColor = (status: OrderStatus) => {
        const colors = { 'Pending': 'bg-amber-100 text-amber-800', 'Preparing': 'bg-blue-100 text-blue-800', 'Ready for Pickup': 'bg-purple-100 text-purple-800', 'Completed': 'bg-green-100 text-green-800', 'Cancelled': 'bg-red-100 text-red-800' };
        return colors[status] || 'bg-neutral-100 text-neutral-800';
    };
    
    return (
        <div className="min-h-screen bg-neutral-50">
            {successfulOrder && <OrderSuccessModal orderId={successfulOrder.id} onContinue={() => setSuccessfulOrder(null)} onViewOrders={() => { setSuccessfulOrder(null); setViewTab('orders'); }} />}
            {selectedItem && <ProductDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} onAddToCart={addToCart} onBuyNow={handleBuyNow} />}
            {toastMessage && <div className="fixed bottom-5 right-5 bg-neutral-800 text-white py-3 px-5 rounded-lg shadow-xl animate-slide-in-up z-50">{toastMessage}</div>}
            
            <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-20"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex justify-between items-center h-16"><div className="flex-shrink-0 flex items-center"><svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 3.16 2.03 5.84 4.85 6.71L12 22l2.15-6.29C16.97 14.84 19 12.16 19 9c0-3.87-3.13-7-7-7zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" /></svg><span className="ml-2 text-xl font-bold text-neutral-800">Mocktail Town</span></div><div className="flex items-center space-x-4"><div className="relative"><ShoppingBagIcon className="w-7 h-7 text-neutral-600" />{cartItemCount > 0 && <span className={`absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ${isBagAnimating ? 'animate-bounce' : ''}`}>{cartItemCount}</span>}</div><div className="flex items-center space-x-2"><UserIcon className="w-6 h-6 text-neutral-500" /><span className="font-medium text-neutral-700 hidden sm:block">{user.name}</span></div><button onClick={onLogout} className="text-neutral-500 hover:text-primary transition-colors"><LogoutIcon className="w-6 h-6" /></button></div></div></div></header>
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                 <div className="border-b border-neutral-200 mb-6"><nav className="-mb-px flex space-x-8"><button onClick={() => setViewTab('menu')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base transition-colors ${viewTab === 'menu' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}>Menu</button><button onClick={() => setViewTab('orders')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base transition-colors ${viewTab === 'orders' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}>My Orders</button></nav></div>
                {viewTab === 'menu' && (<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="lg:sticky top-[65px] bg-neutral-50/80 backdrop-blur-sm py-4 z-10 -mt-6">
                            <input type="text" placeholder="Search for juices, momos, shakes..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-4 border border-neutral-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4 shadow-sm" />
                            <div ref={categoryNavRef} className="overflow-x-auto pb-2 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 scrollbar-hide"><div className="flex space-x-3">{MENU_DATA.map((category, index) => (<button ref={el => { categoryButtonRefs.current[index] = el; }} key={category.name} onClick={() => scrollToCategory(index)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold border-2 transition-colors ${activeCategory === category.name ? 'bg-primary text-white border-primary' : 'bg-white text-neutral-700 border-transparent shadow-sm hover:bg-primary/10 hover:text-primary-dark'}`}>{category.name}</button>))}</div></div>
                        </div>
                        {filteredMenu.map((category, index) => (<div key={category.name} ref={el => { categoryRefs.current[index] = el; }} data-category-name={category.name} className="pt-2"><h2 className="text-2xl font-bold text-neutral-800 mb-4">{category.name}</h2><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">{category.items.map(item => (<div key={item.name} onClick={() => setSelectedItem(item)} className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden cursor-pointer group transition-all transform hover:shadow-xl hover:-translate-y-1 active:scale-95"><div className="relative"><img src={item.image} alt={item.name} className="w-full h-40 object-cover" />{category.name === "Most Popular" && <span className="absolute top-2 left-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded-full">Bestseller</span>}{category.name === "Newly Launched" && <span className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">New!</span>}</div><div className="p-4"><h3 className="font-semibold text-neutral-800 group-hover:text-primary transition-colors">{item.name}</h3><p className="text-neutral-600 font-bold">₹{item.price.toFixed(2)}</p></div></div>))}</div></div>))}
                    </div>
                    <div ref={cartRef} className="lg:col-span-1 lg:sticky top-[65px]">
                         <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col max-h-[calc(100vh-100px)]">{cart.length === 0 ? (<div className="text-center py-10 flex flex-col items-center"><ShoppingBagIcon className="w-16 h-16 text-neutral-300 mb-4"/><p className="text-neutral-500 font-medium">Your cart is empty</p><p className="text-sm text-neutral-400">Add items from the menu to get started.</p></div>) : (<><h2 className="text-2xl font-bold text-neutral-800 mb-4">Your Cart</h2><div className="flex-1 overflow-y-auto -mr-4 pr-4">{cart.map(item => (<div key={item.name} className="flex items-center justify-between mb-3 pb-3 border-b border-neutral-100"><img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md mr-3" /><div className="flex-grow"><p className="font-semibold text-neutral-800 text-sm">{item.name}</p><p className="text-xs text-neutral-500">₹{item.price.toFixed(2)}</p></div><div className="flex items-center"><button onClick={() => updateQuantity(item.name, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center bg-neutral-100 rounded-md hover:bg-neutral-200 font-bold">-</button><span className="w-10 text-center font-semibold">{item.quantity}</span><button onClick={() => updateQuantity(item.name, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center bg-neutral-100 rounded-md hover:bg-neutral-200 font-bold">+</button></div></div>))}</div><div className="mt-auto pt-4">{promotions.filter(p=>p.isActive).length > 0 && <div className="mb-4"><label htmlFor="promo" className="text-sm font-medium text-neutral-700 block mb-1">Apply Promotion</label><select id="promo" value={selectedPromotion?.id || ''} onChange={e => setSelectedPromotion(promotions.find(p => p.id === parseInt(e.target.value)) || null)} className="w-full p-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary"><option value="">None</option>{promotions.filter(p=>p.isActive).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>}<div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-neutral-600">Subtotal</span><span className="font-medium">₹{subtotal.toFixed(2)}</span></div>{discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discount.toFixed(2)}</span></div>}<div className="flex justify-between"><span className="text-neutral-600">Tax (5%)</span><span>₹{tax.toFixed(2)}</span></div><div className={`flex justify-between text-lg font-bold text-neutral-900 pt-2 border-t mt-2 transition-transform ${isTotalAnimating ? 'animate-pulse-sm' : ''}`}><span>Total</span><span>₹{finalTotal.toFixed(2)}</span></div></div><button onClick={handlePlaceOrder} disabled={isPlacingOrder} className="w-full mt-4 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed">{isPlacingOrder ? (<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>) : null}{isPlacingOrder ? 'Processing...' : 'Buy Now'}</button></div></>)}</div>
                    </div>
                </div>)}
                 {viewTab === 'orders' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-neutral-800">Your Order History</h2>
                        {orders.length > 0 ? (
                            orders.map(order => (
                                <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-neutral-800">Order #{order.id}</h3>
                                            <p className="text-sm text-neutral-500">{new Date(order.date).toLocaleString()}</p>
                                        </div>
                                        <div className={`mt-2 sm:mt-0 px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>{order.status}</div>
                                    </div>
                                    <div className="border-t border-neutral-200 pt-4">
                                        {order.items.map(item => (
                                            <div key={item.name} className="flex justify-between items-center text-sm mb-1 text-neutral-600">
                                                <span>{item.name} x {item.quantity}</span>
                                                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-neutral-200 mt-2 pt-2 text-right">
                                        <p className="font-bold text-neutral-800">Total: ₹{order.total.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                             <div className="text-center py-16 bg-white rounded-lg border border-neutral-200">
                                <OrderIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4"/>
                                <p className="text-neutral-500 font-medium">You haven't placed any orders yet.</p>
                                <p className="text-sm text-neutral-400">Your past orders will appear here.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default CustomerView;