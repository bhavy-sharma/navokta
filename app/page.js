'use client';

import { useState, useRef, useEffect } from 'react';
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
  X,
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function CreateInvoicePage() {
  const [billFrom, setBillFrom] = useState({
    name: 'Navokta Innovation',
    address: 'Haryana, India',
    email: 'navokta@gmail.com',
    phone: '+91 8307233996',
    upiId: 'navokta@oksbi',
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureImage, setSignatureImage] = useState(null);
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

  const upiLink = `upi://pay?pa=${encodeURIComponent(billFrom.upiId)}&pn=${encodeURIComponent(billFrom.name)}&am=${total}&cu=INR&tn=Invoice%20${displayInvoiceNumber}`;

  // --- Handlers ---
  const addItem = () => setItems([...items, { id: Date.now().toString(), name: '', qty: 1, rate: 0, description: '' }]);
  const removeItem = (id) => items.length > 1 && setItems(items.filter((item) => item.id !== id));
  const updateItem = (id, field, value) =>
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: field === 'qty' || field === 'rate' ? Number(value) : value } : item
      )
    );

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const clearSignature = () => signatureRef.current?.clear();
  const saveSignature = () => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) return;
    const canvas = signatureRef.current.getTrimmedCanvas();
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      if (r > 200 && g > 200 && b > 200) {
        imageData.data[i + 3] = 0;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    setSignatureImage(canvas.toDataURL('image/png'));
    setShowSignatureModal(false);
  };

  // --- PDF Export — FINAL FIX — SINGLE PAGE + QR + NO DUPLICATE ---
  const exportPDF = async () => {
    const element = document.getElementById('invoice-export-container');
    if (!element) return;

    // Give time for external image (QR) to load
    await new Promise(r => setTimeout(r, 600));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // ✅ SINGLE PAGE ONLY — NO DUPLICATION
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, 297));
    pdf.save(`invoice-${displayInvoiceNumber}.pdf`);
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
            <InputField label="Company Name" value={billFrom.name} onChange={(e) => setBillFrom({ ...billFrom, name: e.target.value })} />
            <InputField label="Address" value={billFrom.address} onChange={(e) => setBillFrom({ ...billFrom, address: e.target.value })} />
            <InputField label="Email" value={billFrom.email} onChange={(e) => setBillFrom({ ...billFrom, email: e.target.value })} />
            <InputField label="Phone" value={billFrom.phone} onChange={(e) => setBillFrom({ ...billFrom, phone: e.target.value })} />
            <InputField label="UPI ID" value={billFrom.upiId} onChange={(e) => setBillFrom({ ...billFrom, upiId: e.target.value })} placeholder="e.g. yourname@oksbi" />

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Company Logo</label>
              <div className="flex items-center gap-3">
                <label className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-700 flex items-center gap-2">
                  <ImageIcon size={16} /> Upload Logo
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
                {logoPreview && <img src={logoPreview} alt="Logo" className="h-10 w-10 object-contain rounded border border-slate-600" />}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Digital Signature</label>
              <button
                type="button"
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 flex items-center gap-2"
                onClick={() => setShowSignatureModal(true)}
              >
                <PenTool size={16} /> {signatureImage ? 'Edit Signature' : 'Add Signature'}
              </button>
            </div>
          </Card>

          <Card title="Bill To" icon={<User className="text-indigo-400" />}>
            <InputField label="Client Name" value={billTo.name} onChange={(e) => setBillTo({ ...billTo, name: e.target.value })} />
            <InputField label="Address" value={billTo.address} onChange={(e) => setBillTo({ ...billTo, address: e.target.value })} />
            <InputField label="Email" value={billTo.email} onChange={(e) => setBillTo({ ...billTo, email: e.target.value })} />
            <InputField label="Phone" value={billTo.phone} onChange={(e) => setBillTo({ ...billTo, phone: e.target.value })} />
          </Card>

          <Card title="Invoice Details" icon={<FileText className="text-indigo-400" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Invoice Number" value={invoiceDetails.invoiceNumber} onChange={(e) => setInvoiceDetails({ ...invoiceDetails, invoiceNumber: e.target.value })} placeholder="Leave blank for auto" />
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Currency</label>
                <div className="px-3 py-2.5 bg-slate-800 rounded-lg border border-slate-700 text-white">INR (Rs.) — Fixed</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <InputField label="Issue Date" type="date" value={invoiceDetails.issueDate} onChange={(e) => setInvoiceDetails({ ...invoiceDetails, issueDate: e.target.value })} />
              <InputField label="Due Date" type="date" value={invoiceDetails.dueDate} onChange={(e) => setInvoiceDetails({ ...invoiceDetails, dueDate: e.target.value })} />
            </div>
          </Card>

          <Card title="Items" icon={<Plus className="text-indigo-400" />}>
            {items.map((item) => (
              <div key={item.id} className="bg-slate-800/50 p-4 rounded-lg mb-4 border border-slate-700">
                <InputField label="Item Name" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} />
                <InputField label="Description" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} />
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <InputField label="Qty" type="number" min="1" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', e.target.value)} />
                  <InputField label="Rate (Rs.)" type="number" step="0.01" min="0" value={item.rate} onChange={(e) => updateItem(item.id, 'rate', e.target.value)} />
                </div>
                <button type="button" className="mt-3 flex items-center gap-1 text-rose-500 hover:text-rose-400" onClick={() => removeItem(item.id)}>
                  <Trash2 size={16} /> Remove Item
                </button>
              </div>
            ))}
            <button type="button" className="w-full py-2.5 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 text-white transition" onClick={addItem}>
              <Plus size={18} /> Add New Item
            </button>
          </Card>

          <Card title="Summary" icon={<IndianRupee className="text-indigo-400" />}>
            <InputField label="Discount (Rs.)" type="number" step="0.01" min="0" value={summary.discount} onChange={(e) => setSummary({ ...summary, discount: parseFloat(e.target.value) || 0 })} />
            <InputField label="Tax (%)" type="number" step="0.1" min="0" max="100" value={summary.tax} onChange={(e) => setSummary({ ...summary, tax: parseFloat(e.target.value) || 0 })} />
            <InputField label="Shipping (Rs.)" type="number" step="0.01" min="0" value={summary.shipping} onChange={(e) => setSummary({ ...summary, shipping: parseFloat(e.target.value) || 0 })} />
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
              {/* ✅ 100% PDF-SAFE — NO TAILWIND, SAFE FONTS, SAFE SYMBOLS */}
              <div
                id="invoice-export-container"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  fontFamily: 'Arial, sans-serif', // PDF-safe font
                  padding: '24px',
                  borderRadius: '8px',
                  minHeight: '700px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
              >
                {logoPreview && (
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <img src={logoPreview} alt="Company Logo" style={{ height: '64px', objectFit: 'contain' }} />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                  <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#000000', margin: '0' }}>{billFrom.name}</h2>
                    <p style={{ color: '#374151', marginTop: '4px', margin: '0' }}>{billFrom.address}</p>
                    <p style={{ color: '#374151', margin: '0' }}>{billFrom.email} • {billFrom.phone}</p>
                    <p style={{ color: '#374151', margin: '0' }}>UPI: {billFrom.upiId}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#000000', margin: '0' }}>Invoice</h3>
                    <p style={{ color: '#6b7280', marginTop: '4px', margin: '0' }}>#{displayInvoiceNumber}</p>
                    <p style={{ color: '#6b7280', margin: '0' }}>Issued: {invoiceDetails.issueDate}</p>
                    <p style={{ color: '#6b7280', margin: '0' }}>Due: {invoiceDetails.dueDate}</p>
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <h4 style={{ fontWeight: 'bold', color: '#000000', marginBottom: '8px', fontSize: '16px' }}>Bill To</h4>
                  <p style={{ color: '#1f2937', margin: '0' }}>{billTo.name || '—'}</p>
                  {billTo.address && <p style={{ color: '#374151', margin: '0' }}>{billTo.address}</p>}
                  {billTo.email && <p style={{ color: '#374151', margin: '0' }}>{billTo.email}</p>}
                  {billTo.phone && <p style={{ color: '#374151', margin: '0' }}>{billTo.phone}</p>}
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', paddingBottom: '12px', color: '#000000', fontWeight: '600' }}>Description</th>
                      <th style={{ textAlign: 'right', paddingBottom: '12px', color: '#000000', fontWeight: '600' }}>Qty</th>
                      <th style={{ textAlign: 'right', paddingBottom: '12px', color: '#000000', fontWeight: '600' }}>Rate</th>
                      <th style={{ textAlign: 'right', paddingBottom: '12px', color: '#000000', fontWeight: '600' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ paddingTop: '12px', paddingBottom: '12px' }}>
                          <div style={{ fontWeight: '600', color: '#000000' }}>{item.name || '—'}</div>
                          {item.description && <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>{item.description}</div>}
                        </td>
                        <td style={{ textAlign: 'right', paddingTop: '12px', paddingBottom: '12px', color: '#1f2937' }}>{item.qty}</td>
                        <td style={{ textAlign: 'right', paddingTop: '12px', paddingBottom: '12px', color: '#1f2937' }}>Rs. {Number(item.rate).toFixed(2)}</td>
                        <td style={{ textAlign: 'right', paddingTop: '12px', paddingBottom: '12px', color: '#1f2937' }}>Rs. {(item.qty * item.rate).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ marginTop: '24px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span style={{ color: '#1f2937' }}>Subtotal</span>
                    <span style={{ color: '#1f2937' }}>Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  {summary.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#ef4444' }}>
                      <span>Discount</span>
                      <span>- Rs. {summary.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {summary.tax > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#1f2937' }}>
                      <span>Tax ({summary.tax}%)</span>
                      <span>Rs. {taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {summary.shipping > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#1f2937' }}>
                      <span>Shipping</span>
                      <span>Rs. {summary.shipping.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px', color: '#000000' }}>
                    <span>Total</span>
                    <span>Rs. {total.toFixed(2)}</span>
                  </div>
                </div>

                {signatureImage && (
                  <div style={{ marginTop: '32px' }}>
                    <h4 style={{ fontWeight: 'bold', color: '#000000', marginBottom: '8px' }}>Authorized Signature</h4>
                    <img src={signatureImage} alt="Signature" style={{ height: '48px' }} />
                  </div>
                )}

                {/* ✅ QR CODE — SAFE IMAGE URL */}
                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                  <h4 style={{ fontWeight: 'bold', color: '#000000', marginBottom: '12px' }}>Scan to Pay</h4>
                  <div style={{
                    display: 'inline-block',
                    padding: '12px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(upiLink)}`}
                      alt="Payment QR"
                      style={{ width: '120px', height: '120px', display: 'block' }}
                    />
                  </div>
                  <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '8px' }}>
                    Scan with any UPI app to pay Rs. {total.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <ActionButton icon={<Download size={18} />} onClick={exportPDF}>
                  Export PDF
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SIGNATURE MODAL ===== */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-2xl">
            <div className="p-5 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Sign Invoice</h3>
              <button onClick={() => setShowSignatureModal(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="p-5">
              <div className="border border-slate-600 rounded bg-slate-900 overflow-hidden">
                <SignatureCanvas
                  ref={signatureRef}
                  penColor="white"
                  canvasProps={{ width: '100%', height: 200 }}
                  backgroundColor="rgba(15, 23, 42, 1)"
                />
              </div>
              <div className="mt-4 flex justify-between">
                <button
                  type="button"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg"
                  onClick={clearSignature}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                  onClick={saveSignature}
                >
                  Save Signature
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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

const ActionButton = ({ icon, children, onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 w-full md:w-auto justify-center"
  >
    {icon} {children}
  </button>
);