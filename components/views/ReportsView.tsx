import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { MENU_DATA } from '../../constants';
import type { Order } from '../../types';

interface ReportsViewProps {
    orders: Order[];
}

const COLORS = ['#10B981', '#F97316', '#3B82F6', '#EC4899', '#8B5CF6', '#6EE7B7', '#FBBF24', '#60A5FA'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      if (payload[0].name === 'sales') { // For BarChart
        return (
          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-neutral-200">
            <p className="font-semibold text-neutral-700">{payload[0].payload.name}</p>
            <p className="text-sm text-primary">Sold: <span className="font-medium">{payload[0].value} units</span></p>
          </div>
        );
      }
      // For PieChart
      return (
        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-neutral-200">
          <p className="font-semibold text-neutral-700">{payload[0].name}</p>
          <p className="text-sm" style={{ color: payload[0].fill }}>Sales: <span className="font-medium">₹{payload[0].value.toFixed(2)}</span></p>
        </div>
      );
    }
    return null;
  };

const ReportsView: React.FC<ReportsViewProps> = ({ orders }) => {
  const salesByCategoryData = MENU_DATA.map(category => {
    const categorySales = orders.flatMap(order => order.items)
        .filter(item => category.items.some(menuItem => menuItem.name === item.name))
        // FIX: Explicitly cast `item.price` and `item.quantity` to Number to avoid type errors during arithmetic operations.
        .reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    return {
        name: category.name,
        value: categorySales,
    };
  }).filter(c => c.value > 0);

  const productPerformanceData = orders.flatMap(order => order.items)
    .reduce((acc, item) => {
        // FIX: Explicitly cast `item.quantity` to a Number to prevent string concatenation which would cause errors in subsequent calculations.
        acc[item.name] = (acc[item.name] || 0) + Number(item.quantity);
        return acc;
    }, {} as { [key: string]: number });

  const topProductsData = Object.entries(productPerformanceData)
    .map(([name, sales]) => ({ name, sales }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 10);
    
  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-800 mb-6">Sales & Inventory Reports</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <h2 className="text-xl font-semibold text-neutral-700 mb-4">Sales by Category</h2>
          {salesByCategoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={salesByCategoryData} cx="50%" cy="50%" labelLine={false} outerRadius={110} fill="#8884d8" dataKey="value" nameKey="name">
                  {salesByCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-neutral-500 text-center pt-16">No sales data available.</p>}
        </div>

        <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <h2 className="text-xl font-semibold text-neutral-700 mb-4">Product Performance (Top 10)</h2>
           {topProductsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topProductsData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }}/>
                        <Tooltip content={<CustomTooltip />}/>
                        <Legend />
                        <Bar dataKey="sales" fill="#10B981" />
                    </BarChart>
                </ResponsiveContainer>
            ) : <p className="text-neutral-500 text-center pt-16">No sales data available.</p>}
        </div>

        <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
             <h2 className="text-xl font-semibold text-neutral-700 mb-4">All Sales Transactions</h2>
              <div className="overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Items</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total</th>
                        </tr>
                    </thead>
                     <tbody className="bg-white divide-y divide-neutral-200">
                        {orders.length > 0 ? orders.map(order => (
                            <tr key={order.id} className="hover:bg-neutral-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{order.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{new Date(order.date).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{order.customerName}</td>
                                {/* FIX: Explicitly cast `i.quantity` to a Number to prevent type errors during arithmetic operations. */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{order.items.reduce((sum, i) => sum + Number(i.quantity), 0)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-700">₹{order.total.toFixed(2)}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} className="text-center py-8 text-neutral-500">No orders have been placed yet.</td></tr>
                        )}
                    </tbody>
                </table>
              </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;