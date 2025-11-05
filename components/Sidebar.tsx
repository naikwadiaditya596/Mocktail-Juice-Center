import React from 'react';
import type { AdminView } from '../App';
import { DashboardIcon, OrderIcon, PlusIcon, InventoryIcon, ReportIcon, SettingsIcon, PromotionIcon, LogoutIcon } from './icons';

interface SidebarProps {
    currentView: AdminView;
    setView: (view: AdminView) => void;
    onLogout: () => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-4 py-3 text-sm rounded-lg transition-all duration-200 group ${isActive
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'
            }`}
    >
        <span className={`${isActive ? 'text-primary' : 'text-neutral-400 group-hover:text-neutral-600'}`}>{icon}</span>
        <span className="ml-4">{label}</span>
    </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onLogout, isOpen, setIsOpen }) => {
    const navItems: { view: AdminView; label: string; icon: React.ReactNode }[] = [
        { view: 'dashboard', label: 'Dashboard', icon: <DashboardIcon className="w-5 h-5" /> },
        { view: 'all-orders', label: 'All Orders', icon: <OrderIcon className="w-5 h-5" /> },
        { view: 'orders', label: 'New Order (POS)', icon: <PlusIcon className="w-5 h-5" /> },
        { view: 'inventory', label: 'Inventory', icon: <InventoryIcon className="w-5 h-5" /> },
        { view: 'reports', label: 'Reports', icon: <ReportIcon className="w-5 h-5" /> },
        { view: 'promotions', label: 'Promotions', icon: <PromotionIcon className="w-5 h-5" /> },
        { view: 'settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> },
    ];

    const handleNavigation = (view: AdminView) => {
        setView(view);
        if (window.innerWidth < 1024) {
            setIsOpen(false);
        }
    }

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            ></div>
            <aside
                className={`fixed lg:relative flex-shrink-0 w-64 bg-white text-neutral-800 flex flex-col h-full z-40 transform transition-transform duration-300 ease-in-out border-r border-neutral-200 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                <div className="flex items-center justify-center p-6 border-b border-neutral-200">
                    <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 3.16 2.03 5.84 4.85 6.71L12 22l2.15-6.29C16.97 14.84 19 12.16 19 9c0-3.87-3.13-7-7-7zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
                    </svg>
                    <span className="ml-3 text-xl font-bold">Mocktail Town</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <NavItem
                            key={item.view}
                            icon={item.icon}
                            label={item.label}
                            isActive={currentView === item.view}
                            onClick={() => handleNavigation(item.view)}
                        />
                    ))}
                </nav>

                <div className="p-4 mt-auto border-t border-neutral-200">
                    <button
                        onClick={onLogout}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-neutral-500 rounded-lg hover:bg-red-500/10 hover:text-red-600 transition-colors group"
                    >
                        <span className="text-neutral-400 group-hover:text-red-500"><LogoutIcon className="w-5 h-5" /></span>
                        <span className="ml-4">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;