import React from 'react';
import type { Order, OrderStatus } from '../types';
import { XIcon } from './icons';

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

const OrderDetailsModal: React.FC<{
    order: Order;
    onClose: () => void;
}> = ({ order, onClose }) => {
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all">
                <div className="flex justify-between items-center p-5 border-b border-neutral-200">
                    <h2 className="text-xl font-bold text-neutral-800">Order Details: #{order.id}</h2>
                    <button onClick={onClose} className="text-neutral-500 hover:text-neutral-800"><XIcon /></button>
                </div>
                
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div>
                            <p className="text-sm text-neutral-500">Customer</p>
                            <p className="font-semibold text-neutral-800">{order.customerName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-neutral-500">Date</p>
                            <p className="font-semibold text-neutral-800">{new Date(order.date).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-neutral-500">Status</p>
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
                        </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-neutral-700 mb-2 border-t pt-4">Order Items</h3>
                    <div className="space-y-2">
                        {order.items.map(item => (
                            <div key={item.name} className="flex justify-between items-center text-sm p-2 bg-neutral-50 rounded-md">
                                <div>
                                    <p className="font-medium text-neutral-800">{item.name}</p>
                                    <p className="text-neutral-500">{item.quantity} x ₹{item.price.toFixed(2)}</p>
                                </div>
                                <p className="font-semibold text-neutral-800">₹{(item.quantity * item.price).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-neutral-600">Subtotal</span><span className="font-medium text-neutral-800">₹{subtotal.toFixed(2)}</span></div>
                        {order.promotionApplied && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Discount ({order.promotionApplied.name})</span>
                                <span>-₹{(subtotal - (order.total / 1.05)).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm"><span className="text-neutral-600">Tax (5%)</span><span className="font-medium text-neutral-800">₹{(order.total - (order.total / 1.05)).toFixed(2)}</span></div>
                        <div className="flex justify-between text-lg font-bold text-neutral-900 pt-2 border-t"><span >Total</span><span>₹{order.total.toFixed(2)}</span></div>
                    </div>

                </div>

                 <div className="p-4 bg-neutral-50 rounded-b-lg text-right">
                    <button onClick={onClose} className="px-5 py-2 bg-neutral-200 text-neutral-800 rounded-lg hover:bg-neutral-300 font-semibold transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;