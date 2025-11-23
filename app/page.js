'use client';

import { useState, useRef } from 'react';
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
  Download,
  CreditCard,
  Image as ImageIcon,
  PenTool,
} from 'lucide-react';
import {QRCodeCanvas} from 'qrcode.react';
import SignatureCanvas from 'react-signature-canvas';

export default function CreateInvoicePage() {
  const [billFrom, setBillFrom] = useState({
    name: 'Navokta Innovation',
    address: 'Haryana, India',
    email: 'navokta@gmail.com',
    phone: '+91 8307233996',
    upiId: 'navokta@oksbi', // Default UPI
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [showSignature, setShowSignature] = useState(false);
  const signatureRef = useRef();

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

  const displayInvoiceNumber = invoiceDetails.invoiceNumber || `INV-${new Date().getFullYear()}-${String(items.length).padStart(3, '0')}`;
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

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  // UPI Deep Link
  const upiLink = `upi://pay?pa=${encodeURIComponent(billFrom.upiId)}&pn=${encodeURIComponent(billFrom.name)}&am=${total}&cu=INR&tn=Invoice%20${displayInvoiceNumber}`;
  const upiUrl = `https://navokta-invoice.vercel.app/pay?upi=${encodeURIComponent(billFrom.upiId)}&amount=${total}&name=${encodeURIComponent(billFrom.name)}&note=${encodeURIComponent('Invoice ' + displayInvoiceNumber)}`;

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
            <InputField label="Company Name" value={billFrom.name} onChange={(e) => setBillFrom({ ...billFrom, name: e.target.value })} />
            <InputField label="Address" value={billFrom.address} onChange={(e) => setBillFrom({ ...billFrom, address: e.target.value })} />
            <InputField label="Email" value={billFrom.email} onChange={(e) => setBillFrom({ ...billFrom, email: e.target.value })} />
            <InputField label="Phone" value={billFrom.phone} onChange={(e) => setBillFrom({ ...billFrom, phone: e.target.value })} />
            <InputField
              label="UPI ID"
              value={billFrom.upiId}
              onChange={(e) => setBillFrom({ ...billFrom, upiId: e.target.value })}
              placeholder="e.g. yourname@oksbi"
              // icon={<CreditCard size={16} />}
            />

            {/* Logo Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Company Logo</label>
              <div className="flex items-center gap-3">
                <label className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-700 flex items-center gap-2">
                  <ImageIcon size={16} /> Upload Logo
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
                {logoPreview && (
                  <img src={logoPreview} alt="Logo" className="h-10 w-10 object-contain rounded border border-slate-600" />
                )}
              </div>
            </div>

            {/* Signature Toggle */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Digital Signature</label>
              <button
                type="button"
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 flex items-center gap-2"
                onClick={() => setShowSignature(!showSignature)}
              >
                <PenTool size={16} /> {showSignature ? 'Hide Canvas' : 'Add Signature'}
              </button>
            </div>

            {showSignature && (
              <div className="mb-4 border border-slate-700 rounded-lg p-2 bg-slate-800">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-300">Draw your signature</span>
                  <button
                    type="button"
                    className="text-xs text-rose-500 hover:text-rose-400"
                    onClick={clearSignature}
                  >
                    Clear
                  </button>
                </div>
                <SignatureCanvas
                  ref={signatureRef}
                  penColor="white"
                  canvasProps={{
                    width: '100%',
                    height: 120,
                    className: 'border border-slate-600 rounded bg-slate-900',
                  }}
                />
              </div>
            )}
          </Card>

          {/* ===== Rest of the form (Bill To, Items, etc.) ===== */}
          <Card title="Bill To" icon={<User className="text-indigo-400" />}>
            <InputField label="Client Name" value={billTo.name} onChange={(e) => setBillTo({ ...billTo, name: e.target.value })} />
            <InputField label="Address" value={billTo.address} onChange={(e) => setBillTo({ ...billTo, address: e.target.value })} />
            <InputField label="Email" value={billTo.email} onChange={(e) => setBillTo({ ...billTo, email: e.target.value })} />
            <InputField label="Phone" value={billTo.phone} onChange={(e) => setBillTo({ ...billTo, phone: e.target.value })} />
          </Card>

          <Card title="Invoice Details" icon={<FileText className="text-indigo-400" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Invoice Number"
                value={invoiceDetails.invoiceNumber}
                onChange={(e) => setInvoiceDetails({ ...invoiceDetails, invoiceNumber: e.target.value })}
                placeholder="Leave blank for auto"
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
              />
              <InputField
                label="Due Date"
                type="date"
                value={invoiceDetails.dueDate}
                onChange={(e) => setInvoiceDetails({ ...invoiceDetails, dueDate: e.target.value })}
              />
            </div>
          </Card>

          <Card title="Items" icon={<Plus className="text-indigo-400" />}>
            {items.map((item) => (
              <div key={item.id} className="bg-slate-800/50 p-4 rounded-lg mb-4 border border-slate-700">
                <InputField label="Item Name" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} />
                <InputField label="Description" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} />
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <InputField label="Qty" type="number" min="1" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', e.target.value)} />
                  <InputField label="Rate (₹)" type="number" step="0.01" min="0" value={item.rate} onChange={(e) => updateItem(item.id, 'rate', e.target.value)} />
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
            />
            <InputField
              label="Tax (%)"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={summary.tax}
              onChange={(e) => setSummary({ ...summary, tax: parseFloat(e.target.value) || 0 })}
            />
            <InputField
              label="Shipping (₹)"
              type="number"
              step="0.01"
              min="0"
              value={summary.shipping}
              onChange={(e) => setSummary({ ...summary, shipping: parseFloat(e.target.value) || 0 })}
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
              <div className="bg-white text-black rounded-lg p-6 min-h-[700px] shadow-sm">
                {/* Logo */}
                {logoPreview && (
                  <div className="flex justify-center mb-4">
                    <img src={logoPreview} alt="Company Logo" className="h-16 object-contain" />
                  </div>
                )}

                <div className="flex justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{billFrom.name}</h2>
                    <p className="text-gray-700 mt-1">{billFrom.address}</p>
                    <p className="text-gray-700">{billFrom.email} • {billFrom.phone}</p>
                    <p className="text-gray-700">UPI: {billFrom.upiId}</p>
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
                  {summary.discount > 0 && <DetailRow label="Discount" value={`- ₹${summary.discount.toFixed(2)}`} className="text-red-600" />}
                  {summary.tax > 0 && <DetailRow label={`Tax (${summary.tax}%)`} value={`₹${taxAmount.toFixed(2)}`} />}
                  {summary.shipping > 0 && <DetailRow label="Shipping" value={`₹${summary.shipping.toFixed(2)}`} />}
                  <div className="border-t border-gray-300 pt-3 mt-3 flex justify-between font-bold text-lg text-gray-900">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* UPI QR Code */}
                <div className="mt-8 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">Scan to Pay</h4>
                  <div className="inline-block p-3 bg-white border border-gray-300 rounded-lg">
                    <QRCodeCanvas value={upiLink} size={120} level="M" />
                  </div>
                  <p className="text-gray-600 text-sm mt-2">Scan with any UPI app to pay ₹{total.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <ActionButton icon={<Download size={18} />}>Export PDF</ActionButton>
                {/* Save Draft & Share Link removed as requested */}
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
  };
  return <button className={`${base} ${variants[variant]}`}>{icon} {children}</button>;
};