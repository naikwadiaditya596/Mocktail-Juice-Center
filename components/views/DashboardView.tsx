import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import type { Order, InventoryItem, OrderStatus, User, OrderItem } from '../../types';
import { OrderIcon, InventoryIcon, ReportIcon, EyeIcon, TrendingUpIcon, BoltIcon, WarningIcon } from '../icons';
import { Card } from '../Card';
import OrderDetailsModal from '../OrderDetailsModal';

interface DashboardViewProps {
    user: User;
    orders: Order[];
    inventory: InventoryItem[];
    onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case 'Pending': return 'text-amber-600 bg-amber-100';
        case 'Preparing': return 'text-blue-600 bg-blue-100';
        case 'Ready for Pickup': return 'text-purple-600 bg-purple-100';
        case 'Completed': return 'text-green-600 bg-green-100';
        case 'Cancelled': return 'text-red-600 bg-red-100';
        default: return 'text-neutral-600 bg-neutral-100';
    }
};

const getStatusDotColor = (status: OrderStatus) => {
     switch (status) {
        case 'Pending': return 'bg-amber-500';
        case 'Preparing': return 'bg-blue-500';
        case 'Ready for Pickup': return 'bg-purple-500';
        case 'Completed': return 'bg-green-500';
        case 'Cancelled': return 'bg-red-500';
        default: return 'bg-neutral-500';
    }
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-neutral-200">
          <p className="font-semibold text-neutral-700">{label}</p>
          <p className="text-primary">Revenue: <span className="font-medium">₹{payload[0].value.toFixed(2)}</span></p>
        </div>
      );
    }
    return null;
  };

const DashboardView: React.FC<DashboardViewProps> = ({ user, inventory, onUpdateStatus, orders = [] }) => {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const { totalRevenue, totalOrders, pendingOrders } = useMemo(() => {
        const activeOrders = orders.filter(o => o.status !== 'Cancelled');
        return {
            totalRevenue: activeOrders.reduce((sum, order) => sum + order.total, 0),
            totalOrders: orders.length,
            pendingOrders: orders.filter(o => o.status === 'Pending').length
        };
    }, [orders]);
    
    const lowStockItemsCount = inventory.filter(item => item.stock <= item.threshold).length;

    const salesData = useMemo(() => orders.reduce((acc, order) => {
        if (order.status === 'Cancelled') return acc;
        const date = new Date(order.date).toLocaleDateString('en-CA');
        const existing = acc.find(d => d.date === date);
        if (existing) {
            existing.revenue += order.total;
        } else {
            acc.push({ date, revenue: order.total });
        }
        return acc;
    }, [] as { date: string; revenue: number }[]).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [orders]);

    const topProducts = useMemo(() => {
        const productCount = new Map<string, {name: string, count: number, image: string}>();
        orders.flatMap(o => o.items).forEach((item: OrderItem) => {
            const existing = productCount.get(item.name);
            productCount.set(item.name, {
                name: item.name,
                count: (existing?.count || 0) + item.quantity,
                image: item.image
            });
        });
        return Array.from(productCount.values()).sort((a, b) => b.count - a.count).slice(0, 5);
    }, [orders]);

    return (
        <div className="space-y-8">
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-neutral-200">
                <h1 className="text-4xl font-bold text-neutral-800">Welcome back, {user.name.split(' ')[0]}!</h1>
                <p className="text-neutral-500 mt-1 text-lg">Here's a summary of your store's activity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <Card title="Total Revenue" value={`₹${totalRevenue.toFixed(2)}`} icon={<ReportIcon />} color="primary" />
                <Card title="Total Orders" value={totalOrders.toString()} icon={<OrderIcon />} color="primary" />
                <Card title="Pending Orders" value={pendingOrders.toString()} icon={<OrderIcon />} color="accent" />
                <Card title="Low Stock Items" value={lowStockItemsCount.toString()} icon={<InventoryIcon />} color="red" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                    <div className="flex items-center mb-4">
                        <div className="p-2 bg-primary/10 rounded-full mr-4"><ReportIcon className="w-6 h-6 text-primary" /></div>
                        <h2 className="text-xl font-semibold text-neutral-700">Sales Overview</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.7}/>
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="space-y-8">
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                        <div className="flex items-center mb-4">
                             <div className="p-2 bg-neutral-100 rounded-full mr-4"><BoltIcon className="w-6 h-6 text-neutral-600" /></div>
                            <h2 className="text-xl font-semibold text-neutral-700">Quick Actions & Alerts</h2>
                        </div>
                        <div className="space-y-3">
                            <div className={`p-4 rounded-lg flex items-center ${lowStockItemsCount > 0 ? 'bg-red-50' : 'bg-neutral-50'}`}>
                                <WarningIcon className={`w-10 h-10 mr-4 ${lowStockItemsCount > 0 ? 'text-red-500' : 'text-neutral-400'}`}/>
                                <div>
                                    <p className="font-semibold text-neutral-800">Inventory Alert</p>
                                    <p className="text-sm text-neutral-600">{lowStockItemsCount} item(s) running low on stock.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                        <div className="flex items-center mb-4">
                            <div className="p-2 bg-neutral-100 rounded-full mr-4"><TrendingUpIcon className="w-6 h-6 text-neutral-600" /></div>
                            <h2 className="text-xl font-semibold text-neutral-700">Top Selling Products</h2>
                        </div>
                        <div className="space-y-4">
                            {topProducts.map(product => (
                                <div key={product.name} className="flex items-center">
                                    <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg mr-4" />
                                    <div className="flex-grow">
                                        <p className="font-semibold text-neutral-800 text-sm">{product.name}</p>
                                    </div>
                                    <p className="text-sm font-bold text-neutral-600">{product.count} sold</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                 <div className="flex items-center mb-4">
                    <div className="p-2 bg-primary/10 rounded-full mr-4"><OrderIcon className="w-6 h-6 text-primary" /></div>
                    <h2 className="text-xl font-semibold text-neutral-700">Recent Orders</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="border-b-2 border-neutral-100">
                           <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Order</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {orders.slice(0, 5).map(order => (
                                <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <p className="font-bold text-neutral-800">{order.id}</p>
                                        <p className="text-sm text-neutral-500">{order.customerName}</p>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-500">{new Date(order.date).toLocaleString()}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-neutral-700">₹{order.total.toFixed(2)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center font-semibold text-xs px-2.5 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                            <span className={`w-2 h-2 rounded-full mr-2 ${getStatusDotColor(order.status)}`}></span>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => setSelectedOrder(order)} className="text-primary hover:text-primary-dark flex items-center font-semibold">
                                            <EyeIcon className="w-5 h-5 mr-1" /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
};

export default DashboardView;