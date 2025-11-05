import React, { useState } from 'react';
import type { InventoryItem } from '../../types';
import { WarningIcon } from '../icons';

interface InventoryViewProps {
    inventory: InventoryItem[];
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}

const InventoryView: React.FC<InventoryViewProps> = ({ inventory, setInventory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
        setToastMessage(null);
    }, 5000); // Show for 5 seconds
  };

  const handleInventoryUpdate = (id: number, field: 'stock' | 'price', value: number) => {
    const validValue = Math.max(0, value);

    const itemToUpdate = inventory.find(item => item.id === id);
    if (!itemToUpdate) return;
    
    // Check if the stock level just dropped below the threshold
    if (field === 'stock') {
        const oldStock = itemToUpdate.stock;
        const newStock = validValue;
        const threshold = itemToUpdate.threshold;

        if (oldStock > threshold && newStock <= threshold) {
            showToast(`Alert: "${itemToUpdate.name}" stock is low! Current: ${newStock} ${itemToUpdate.unit}.`);
        }
    }

    setInventory(prevInventory =>
      prevInventory.map(item =>
        item.id === id ? { ...item, [field]: validValue } : item
      )
    );
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {toastMessage && (
          <div className="fixed bottom-5 right-5 bg-red-600 text-white py-3 px-5 rounded-lg shadow-xl animate-slide-in-up z-50 flex items-center">
              <WarningIcon className="w-6 h-6 mr-3" />
              <span>{toastMessage}</span>
          </div>
      )}
      <h1 className="text-3xl font-bold text-neutral-800 mb-6">Inventory Management</h1>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search for an item..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto border border-neutral-200">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Item Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Price/Unit (₹)</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Value (₹)</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {filteredInventory.map(item => {
              const isLowStock = item.stock <= item.threshold;
              return (
                <tr key={item.id} className={isLowStock ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-neutral-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <input
                      type="number"
                      value={item.stock}
                      onChange={(e) => handleInventoryUpdate(item.id, 'stock', parseFloat(e.target.value) || 0)}
                      className="w-24 p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                     <span className="ml-2 text-neutral-500">{item.unit}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                     <input
                      type="number"
                      value={item.price}
                      onChange={(e) => handleInventoryUpdate(item.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-24 p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-800">
                    {(item.stock * item.price).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {isLowStock ? (
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Low Stock
                        </span>
                        <WarningIcon className="w-5 h-5 text-red-600" />
                      </div>
                    ) : (
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        In Stock
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryView;