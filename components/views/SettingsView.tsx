import React from 'react';

const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 mb-8">
    <h2 className="text-xl font-semibold text-neutral-700 border-b border-neutral-200 pb-4 mb-6">{title}</h2>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const SettingsInput: React.FC<{ label: string; type: string; value: string | number; id: string }> = ({ label, type, value, id }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>
    <input
      type={type}
      id={id}
      defaultValue={value}
      className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
    />
  </div>
);

const SettingsView: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-800 mb-6">Settings</h1>

      <div className="max-w-4xl mx-auto">
        <SettingsSection title="Store Information">
          <SettingsInput label="Store Name" id="storeName" type="text" value="Mocktail Juice Town" />
          <SettingsInput label="Address" id="address" type="text" value="Kalyan, Maharashtra" />
          <SettingsInput label="Contact Number" id="phone" type="tel" value="+91 12345 67890" />
        </SettingsSection>

        <SettingsSection title="Financials">
          <SettingsInput label="Tax Rate (%)" id="taxRate" type="number" value={5} />
          <div className="flex items-center pt-2">
            <input id="taxIncluded" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded" />
            <label htmlFor="taxIncluded" className="ml-3 block text-sm text-neutral-900">Prices are inclusive of tax</label>
          </div>
        </SettingsSection>
        
        <SettingsSection title="Customer Loyalty Program">
          <div className="flex items-center">
            <input id="loyaltyEnabled" type="checkbox" defaultChecked className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded" />
            <label htmlFor="loyaltyEnabled" className="ml-3 block text-sm font-medium text-neutral-900">Enable Loyalty Program</label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <SettingsInput label="Points per ₹100 Spent" id="points" type="number" value={10} />
            <SettingsInput label="Discount per 100 Points (₹)" id="discount" type="number" value={20} />
          </div>
        </SettingsSection>

        <div className="text-right">
            <button className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-sm hover:shadow-md">
                Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;