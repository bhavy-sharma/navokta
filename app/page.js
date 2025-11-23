'use client';

import { useState, useEffect } from 'react';
import {
  Building,
  User,
  Mail,
  Phone,
  Calendar,
  Tag,
  Plus,
  Trash2,
  IndianRupee,
  Percent,
  Truck,
  FileText,
  Share2,
  Download,
  Save,
} from 'lucide-react';

export default function CreateInvoicePage() {
  const [billFrom] = useState({
    name: 'Navokta Innovation',
    address: 'Haryana, India',
    email: 'navokta@gmail.com',
    phone: '+91 8307233996',
  });

  const [billTo, setBillTo] = useState({
    name: '',
    address: '',
    email: '',
    phone: '',
  });

  const today = new Date().toISOString().split('T')[0];
  const futureDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceNumber: '',
    issueDate: today,
    dueDate: futureDate,
  });

  const [items, setItems] = useState([
    { id: '1', name: 'Consulting Service', qty: 1, rate: 5000, description: 'Web development consultation' },
  ]);

  const [summary, setSummary] = useState({
    discount: 0,
    tax: 18,
    shipping: 0,
  });

  // Auto-generate invoice number if blank
  const displayInvoiceNumber = invoiceDetails.invoiceNumber || `INV-${new Date().getFullYear()}-${String(items.length).padStart(3, '0')}`;

  // --- Calculations (live) ---
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const discountAmount = summary.discount;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * (summary.tax / 100);
  const total = afterDiscount + taxAmount + summary.shipping;

  // --- Handlers ---
  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), name: '', qty: 1, rate: 0, description: '' }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id, field, value) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? { ...item, [field]: field === 'qty' || field === 'rate' ? Number(value) : value }
          : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">Navokta Invoice Generator</h1>
        <p className="text-slate-400 mt-2">Create, export & share beautiful invoices instantly.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ===== FORM ===== */}
        <div className="w-full lg:w-1/2 space-y-6">
          <Card title="Bill From" icon={<Building className="text-indigo-400" />}>
            <ReadOnlyField label="Company Name" value={billFrom.name} />
            <ReadOnlyField label="Address" value={billFrom.address} />
            <ReadOnlyField label="Email" value={billFrom.email}  />
            <ReadOnlyField label="Phone" value={billFrom.phone}  />
          </Card>

          <Card title="Bill To" icon={<User className="text-indigo-400" />}>
            <InputField
              label="Client Name"
              value={billTo.name}
              onChange={(e) => setBillTo({ ...billTo, name: e.target.value })}
              // icon={<User size={16} />}
            />
            <InputField
              label="Address"
              value={billTo.address}
              onChange={(e) => setBillTo({ ...billTo, address: e.target.value })}
            />
            <InputField
              label="Email"
              value={billTo.email}
              onChange={(e) => setBillTo({ ...billTo, email: e.target.value })}
              // icon={<Mail size={16} />}
            />
            <InputField
              label="Phone"
              value={billTo.phone}
              onChange={(e) => setBillTo({ ...billTo, phone: e.target.value })}
              // icon={<Phone size={16} />}
            />
          </Card>

          <Card title="Invoice Details" icon={<FileText className="text-indigo-400" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Invoice Number"
                value={invoiceDetails.invoiceNumber}
                onChange={(e) => setInvoiceDetails({ ...invoiceDetails, invoiceNumber: e.target.value })}
                placeholder="Leave blank for auto"
                // icon={<Tag size={16} />}
              />
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Currency</label>
                <div className="px-3 py-2.5 bg-slate-800 rounded-lg border border-slate-700 text-white">
                  INR (₹) — Fixed
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <InputField
                label="Issue Date"
                type="date"
                value={invoiceDetails.issueDate}
                onChange={(e) => setInvoiceDetails({ ...invoiceDetails, issueDate: e.target.value })}
                // icon={<Calendar size={16} />}
              />
              <InputField
                label="Due Date"
                type="date"
                value={invoiceDetails.dueDate}
                onChange={(e) => setInvoiceDetails({ ...invoiceDetails, dueDate: e.target.value })}
                // icon={<Calendar size={16} />}
              />
            </div>
          </Card>

          <Card title="Items" icon={<Plus className="text-indigo-400" />}>
            {items.map((item) => (
              <div key={item.id} className="bg-slate-800/50 p-4 rounded-lg mb-4 border border-slate-700">
                <InputField
                  label="Item Name"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                />
                <InputField
                  label="Description"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <InputField
                    label="Qty"
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                  />
                  <InputField
                    label="Rate (₹)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="mt-3 flex items-center gap-1 text-rose-500 hover:text-rose-400"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 size={16} /> Remove Item
                </button>
              </div>
            ))}
            <button
              type="button"
              className="w-full py-2.5 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 text-white transition"
              onClick={addItem}
            >
              <Plus size={18} /> Add New Item
            </button>
          </Card>

          <Card title="Summary" icon={<IndianRupee className="text-indigo-400" />}>
            <InputField
              label="Discount (₹)"
              type="number"
              step="0.01"
              min="0"
              value={summary.discount}
              onChange={(e) => setSummary({ ...summary, discount: parseFloat(e.target.value) || 0 })}
              icon={<Percent size={16} />}
            />
            <InputField
              label="Tax (%)"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={summary.tax}
              onChange={(e) => setSummary({ ...summary, tax: parseFloat(e.target.value) || 0 })}
              icon={<Percent size={16} />}
            />
            <InputField
              label="Shipping (₹)"
              type="number"
              step="0.01"
              min="0"
              value={summary.shipping}
              onChange={(e) => setSummary({ ...summary, shipping: parseFloat(e.target.value) || 0 })}
              icon={<Truck size={16} />}
            />
          </Card>
        </div>

        {/* ===== LIVE PREVIEW ===== */}
        <div className="w-full lg:w-1/2">
          <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-slate-700">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
                <FileText size={20} className="text-indigo-400" /> Live Invoice Preview
              </h2>
            </div>
            <div className="p-5">
              {/* PRINT-STYLE PREVIEW — WHITE BG, BLACK TEXT */}
              <div className="bg-white text-black rounded-lg p-6 min-h-[650px] shadow-sm">
                <div className="flex justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{billFrom.name}</h2>
                    <p className="text-gray-700 mt-1">{billFrom.address}</p>
                    <p className="text-gray-700">{billFrom.email} • {billFrom.phone}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-gray-900">Invoice</h3>
                    <p className="text-gray-600 mt-1">#{displayInvoiceNumber}</p>
                    <p className="text-gray-600">Issued: {invoiceDetails.issueDate}</p>
                    <p className="text-gray-600">Due: {invoiceDetails.dueDate}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="font-bold text-gray-900 mb-2">Bill To</h4>
                  <p className="text-gray-800">{billTo.name || '—'}</p>
                  {billTo.address && <p className="text-gray-700">{billTo.address}</p>}
                  {billTo.email && <p className="text-gray-700">{billTo.email}</p>}
                  {billTo.phone && <p className="text-gray-700">{billTo.phone}</p>}
                </div>

                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="pb-3 text-gray-900 font-medium">Description</th>
                      <th className="pb-3 text-gray-900 font-medium text-right">Qty</th>
                      <th className="pb-3 text-gray-900 font-medium text-right">Rate</th>
                      <th className="pb-3 text-gray-900 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i} className="border-b border-gray-200 py-3">
                        <td className="py-3">
                          <div className="font-medium text-gray-900">{item.name || '—'}</div>
                          {item.description && <div className="text-gray-600 text-sm mt-1">{item.description}</div>}
                        </td>
                        <td className="text-right py-3 text-gray-800">{item.qty}</td>
                        <td className="text-right py-3 text-gray-800">₹{Number(item.rate).toFixed(2)}</td>
                        <td className="text-right py-3 text-gray-800">₹{(item.qty * item.rate).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-6 text-sm">
                  <DetailRow label="Subtotal" value={`₹${subtotal.toFixed(2)}`} />
                  {summary.discount > 0 && (
                    <DetailRow label="Discount" value={`- ₹${summary.discount.toFixed(2)}`} className="text-red-600" />
                  )}
                  {summary.tax > 0 && (
                    <DetailRow label={`Tax (${summary.tax}%)`} value={`₹${taxAmount.toFixed(2)}`} />
                  )}
                  {summary.shipping > 0 && (
                    <DetailRow label="Shipping" value={`₹${summary.shipping.toFixed(2)}`} />
                  )}
                  <div className="border-t border-gray-300 pt-3 mt-3 flex justify-between font-bold text-lg text-gray-900">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <ActionButton icon={<Download size={18} />}>Export PDF</ActionButton>
                <ActionButton icon={<Save size={18} />} variant="secondary">Save Draft</ActionButton>
                <ActionButton icon={<Share2 size={18} />} variant="success">Share Link</ActionButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// === Reusable Components ===
const Card = ({ title, icon, children }) => (
  <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-white">
      {icon} {title}
    </h3>
    {children}
  </div>
);

const InputField = ({ label, value, onChange, type = 'text', placeholder = '', icon = null }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 pl-${icon ? '10' : '3'} bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
      />
    </div>
  </div>
);

const ReadOnlyField = ({ label, value, icon = null }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
      <div
        className={`w-full px-3 py-2.5 pl-${icon ? '10' : '3'} bg-slate-800 border border-slate-700 rounded-lg text-white`}
      >
        {value || '—'}
      </div>
    </div>
  </div>
);

const DetailRow = ({ label, value, className = 'text-gray-700' }) => (
  <div className="flex justify-between py-1">
    <span className={className}>{label}</span>
    <span className={className}>{value}</span>
  </div>
);

const ActionButton = ({ icon, children, variant = 'primary' }) => {
  const base = 'px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition';
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  };
  return (
    <button className={`${base} ${variants[variant]}`}>
      {icon} {children}
    </button>
  );
};