import React, { useState, useMemo } from 'react';
import type { Order, OrderStatus } from '../../types';
import { EyeIcon } from '../icons';
import OrderDetailsModal from '../OrderDetailsModal';

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case 'Pending': return 'bg-amber-100 text-amber-800';
        case 'Preparing': return 'bg-blue-100 text-blue-800';
        case 'Ready for Pickup': return 'bg-purple-100 text-purple-800';
        case 'Completed': return 'bg-green-100 text-green-800';
        case 'Cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-neutral-100 text-neutral-800';
    }
};

const AllOrdersView: React.FC<{
    orders: Order[];
    onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}> = ({ orders, onUpdateStatus }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [orders, searchTerm, statusFilter]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-neutral-800 mb-6">All Orders</h1>
            
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by Order ID or Customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-2/3 p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                 <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                    className="w-full md:w-1/3 p-3 border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="all">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-x-auto border border-neutral-200">
                <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                        {filteredOrders.map(order => (
                            <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{order.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{new Date(order.date).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{order.customerName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-700">₹{order.total.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={order.status}
                                        onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                                        className={`w-full text-xs font-semibold rounded-md p-1 border-transparent focus:ring-2 focus:ring-primary ${getStatusColor(order.status)}`}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Preparing">Preparing</option>
                                        <option value="Ready for Pickup">Ready for Pickup</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => setSelectedOrder(order)} className="text-primary hover:text-primary-dark flex items-center">
                                        <EyeIcon className="w-5 h-5 mr-1" /> View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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

export default AllOrdersView;