import React, { useState, useEffect } from 'react';
import LoginPage from './components/views/LoginPage';
import RegistrationPage from './components/views/RegistrationPage';
import Sidebar from './components/Sidebar';
import DashboardView from './components/views/DashboardView';
import OrderView from './components/views/OrderView';
import AllOrdersView from './components/views/AllOrdersView';
import InventoryView from './components/views/InventoryView';
import ReportsView from './components/views/ReportsView';
import PromotionsView from './components/views/PromotionsView';
import SettingsView from './components/views/SettingsView';
import CustomerView from './components/views/CustomerView';
import LandingPage from './components/views/LandingPage';
import { MenuIcon, XIcon } from './components/icons';

import { USERS_DATA, INVENTORY_DATA, PROMOTIONS_DATA } from './constants';
import type { User, Order, OrderItem, InventoryItem, Promotion, OrderStatus } from './types';

export type AdminView = 'dashboard' | 'orders' | 'all-orders' | 'inventory' | 'reports' | 'promotions' | 'settings';
type AppView = 'landing' | 'login' | 'register' | 'admin' | 'customer';

const App: React.FC = () => {
    // State Management
    const [users, setUsers] = useState<User[]>(() => {
        const savedUsers = localStorage.getItem('users');
        return savedUsers ? JSON.parse(savedUsers) : USERS_DATA;
    });
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('currentUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [appView, setAppView] = useState<AppView>(currentUser ? (currentUser.role === 'admin' ? 'admin' : 'customer') : 'landing');
    const [adminView, setAdminView] = useState<AdminView>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [orders, setOrders] = useState<Order[]>(() => {
        const savedOrders = localStorage.getItem('orders');
        return savedOrders ? JSON.parse(savedOrders) : [];
    });
    const [inventory, setInventory] = useState<InventoryItem[]>(() => {
        const savedInventory = localStorage.getItem('inventory');
        return savedInventory ? JSON.parse(savedInventory) : INVENTORY_DATA;
    });
    const [promotions, setPromotions] = useState<Promotion[]>(() => {
        const savedPromotions = localStorage.getItem('promotions');
        return savedPromotions ? JSON.parse(savedPromotions) : PROMOTIONS_DATA;
    });
    
    // Effects for persisting state to localStorage
    useEffect(() => { localStorage.setItem('users', JSON.stringify(users)); }, [users]);
    useEffect(() => { if (currentUser) { localStorage.setItem('currentUser', JSON.stringify(currentUser)); } else { localStorage.removeItem('currentUser'); }}, [currentUser]);
    useEffect(() => { localStorage.setItem('orders', JSON.stringify(orders)); }, [orders]);
    useEffect(() => { localStorage.setItem('inventory', JSON.stringify(inventory)); }, [inventory]);
    useEffect(() => { localStorage.setItem('promotions', JSON.stringify(promotions)); }, [promotions]);
    
    // Auth Handlers
    const handleLogin = (email: string, pass: string): boolean => {
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
        if (user) {
            setCurrentUser(user);
            setAppView(user.role === 'admin' ? 'admin' : 'customer');
            return true;
        }
        return false;
    };

    const handleRegister = (name: string, email: string, pass: string): boolean => {
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            alert('An account with this email already exists.');
            return false;
        }
        const newUser: User = { id: Date.now(), name, email, password: pass, role: 'customer' };
        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser);
        setAppView('customer');
        return true;
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setAppView('landing');
    };

    // Data Handlers
    const handlePlaceOrder = (orderItems: OrderItem[], total: number, promotion: Promotion | undefined, id: string): Order => {
        const newOrder: Order = {
            id,
            customerName: currentUser?.name || 'In-Store',
            date: new Date().toISOString(),
            items: orderItems,
            total,
            status: 'Pending',
            promotionApplied: promotion,
        };
        setOrders(prev => [newOrder, ...prev]);
        return newOrder;
    };

    const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        
        // Simulate sending an email notification
        const order = orders.find(o => o.id === orderId);
        const customer = users.find(u => u.name === order?.customerName);
        if (order && customer && customer.email) {
            let message = '';
            switch(status) {
                case 'Preparing': message = `Your order #${order.id} is now being prepared!`; break;
                case 'Ready for Pickup': message = `Great news! Your order #${order.id} is ready for pickup.`; break;
                case 'Completed': message = `Your order #${order.id} has been completed. Thank you!`; break;
                case 'Cancelled': message = `We're sorry, but your order #${order.id} has been cancelled.`; break;
                default: break;
            }
            if(message) {
                 console.log(`--- EMAIL SIMULATION ---
To: ${customer.email}
Subject: Order Status Update: #${order.id}
Body: ${message}
------------------------`);
            }
        }
    };

    const handleSavePromotion = (data: Omit<Promotion, 'id'>) => {
        const newPromotion: Promotion = { ...data, id: Date.now() };
        setPromotions(prev => [...prev, newPromotion]);
    };

    const handleUpdatePromotion = (data: Promotion) => {
        setPromotions(prev => prev.map(p => p.id === data.id ? data : p));
    };

    const handleDeletePromotion = (id: number) => {
        setPromotions(prev => prev.filter(p => p.id !== id));
    };

    // View Rendering Logic
    const renderAdminView = () => {
        if (!currentUser) return null;
        switch (adminView) {
            case 'dashboard': return <DashboardView user={currentUser} orders={orders} inventory={inventory} onUpdateStatus={handleUpdateOrderStatus} />;
            case 'orders': return <OrderView promotions={promotions} onPlaceOrder={handlePlaceOrder} />;
            case 'all-orders': return <AllOrdersView orders={orders} onUpdateStatus={handleUpdateOrderStatus} />;
            case 'inventory': return <InventoryView inventory={inventory} setInventory={setInventory} />;
            case 'reports': return <ReportsView orders={orders} />;
            case 'promotions': return <PromotionsView promotions={promotions} onSave={handleSavePromotion} onUpdate={handleUpdatePromotion} onDelete={handleDeletePromotion} />;
            case 'settings': return <SettingsView />;
            default: return null;
        }
    };
    
    if (appView === 'landing') return <LandingPage onNavigateToLogin={() => setAppView('login')} onNavigateToRegister={() => setAppView('register')} />;
    if (appView === 'login') return <LoginPage onLogin={handleLogin} onNavigateToRegister={() => setAppView('register')} />;
    if (appView === 'register') return <RegistrationPage onRegister={handleRegister} onNavigateToLogin={() => setAppView('login')} />;
    
    if (appView === 'customer' && currentUser) {
        return <CustomerView user={currentUser} onLogout={handleLogout} promotions={promotions} onPlaceOrder={handlePlaceOrder} orders={orders.filter(o => o.customerName === currentUser.name)} />;
    }

    if (appView === 'admin' && currentUser) {
        return (
            <div className="flex h-screen bg-neutral-100 font-sans">
                <Sidebar currentView={adminView} setView={setAdminView} onLogout={handleLogout} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <main className="flex-1 flex flex-col h-screen overflow-y-auto">
                    <header className="lg:hidden flex justify-between items-center bg-neutral-50/80 backdrop-blur-sm border-b border-neutral-200 p-4 sticky top-0 z-20">
                         <div className="flex items-center">
                            <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 3.16 2.03 5.84 4.85 6.71L12 22l2.15-6.29C16.97 14.84 19 12.16 19 9c0-3.87-3.13-7-7-7zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" /></svg>
                            <span className="ml-2 text-lg font-bold text-neutral-800">Mocktail Town</span>
                        </div>
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-neutral-600">
                            {isSidebarOpen ? <XIcon /> : <MenuIcon />}
                        </button>
                    </header>
                    <div className="flex-1 p-4 sm:p-6 lg:p-8">
                        {renderAdminView()}
                    </div>
                </main>
            </div>
        );
    }

    // Fallback if state is inconsistent
    return <LandingPage onNavigateToLogin={() => setAppView('login')} onNavigateToRegister={() => setAppView('register')} />;
};

export default App;