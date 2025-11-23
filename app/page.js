'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Building,
  User,
  Plus,
  Trash2,
  IndianRupee,
  FileText,
  Download,
  CreditCard,
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
  const signatureRef = useRef(null);

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

  const [notes, setNotes] = useState('Thank you for your business!');
  const [termsAndConditions, setTermsAndConditions] = useState('Payment due within 15 days. Late payments may incur additional charges.');

  // Derived values
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

  // ✅ 100% WORKING PDF EXPORT
  const exportToPDF = () => {
    const printArea = document.getElementById('print-area');
    if (!printArea) return;

    // Populate print area with current data
    const content = `
      <div style="font-family: Arial, sans-serif; font-size: 14px; background: white; color: black; padding: 24px; border-radius: 8px;">
        ${logoPreview ? `<div style="text-align: center; margin-bottom: 24px;"><img src="${logoPreview}" alt="Logo" style="height: 64px; object-fit: contain;" /></div>` : ''}

        <div style="display: flex; justify-content: space-between; margin-bottom: 32px;">
          <div>
            <h2 style="font-size: 24px; font-weight: bold; color: #111827;">${billFrom.name}</h2>
            <p style="color: #4b5563; margin-top: 4px;">${billFrom.address}</p>
            <p style="color: #4b5563;">${billFrom.email}</p>
            <p style="color: #4b5563;">${billFrom.phone}</p>
            <p style="color: #4b5563;">UPI: ${billFrom.upiId}</p>
          </div>
          <div style="text-align: right;">
            <h3 style="font-size: 20px; font-weight: bold; color: #111827;">INVOICE</h3>
            <p style="color: #4b5563; margin-top: 4px;">#${displayInvoiceNumber}</p>
            <p style="color: #4b5563;">Issue: ${invoiceDetails.issueDate}</p>
            <p style="color: #4b5563;">Due: ${invoiceDetails.dueDate}</p>
          </div>
        </div>

        <div style="margin-bottom: 32px;">
          <h4 style="font-weight: bold; color: #111827; margin-bottom: 8px;">Bill To:</h4>
          <p style="color: #1f2937;">${billTo.name || '—'}</p>
          ${billTo.address ? `<p style="color: #4b5563;">${billTo.address}</p>` : ''}
          ${billTo.email ? `<p style="color: #4b5563;">${billTo.email}</p>` : ''}
          ${billTo.phone ? `<p style="color: #4b5563;">${billTo.phone}</p>` : ''}
        </div>

        <table style="width: 100%; margin-bottom: 24px; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid #d1d5db;">
              <th style="text-align: left; padding: 12px 0; color: #111827;">Description</th>
              <th style="text-align: right; padding: 12px 0; color: #111827;">Qty</th>
              <th style="text-align: right; padding: 12px 0; color: #111827;">Rate</th>
              <th style="text-align: right; padding: 12px 0; color: #111827;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0;">
                  <div style="font-weight: bold; color: #111827;">${item.name || '—'}</div>
                  ${item.description ? `<div style="font-size: 12px; color: #4b5563;">${item.description}</div>` : ''}
                </td>
                <td style="text-align: right; padding: 12px 0; color: #374151;">${item.qty}</td>
                <td style="text-align: right; padding: 12px 0; color: #374151;">₹${Number(item.rate).toFixed(2)}</td>
                <td style="text-align: right; padding: 12px 0; font-weight: bold; color: #111827;">₹${(item.qty * item.rate).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="text-align: right; margin-bottom: 24px; width: 256px; float: right;">
          <div style="display: flex; justify-content: space-between; padding: 8px 0;">
            <span style="color: #374151;">Subtotal:</span>
            <span style="color: #111827;">₹${subtotal.toFixed(2)}</span>
          </div>
          ${summary.discount > 0 ? `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; color: #ef4444;">
              <span>Discount:</span>
              <span>- ₹${summary.discount.toFixed(2)}</span>
            </div>
          ` : ''}
          ${summary.tax > 0 ? `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; color: #374151;">
              <span>Tax (${summary.tax}%):</span>
              <span>₹${taxAmount.toFixed(2)}</span>
            </div>
          ` : ''}
          ${summary.shipping > 0 ? `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; color: #374151;">
              <span>Shipping:</span>
              <span>₹${summary.shipping.toFixed(2)}</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #1f2937; font-weight: bold; font-size: 18px;">
            <span style="color: #111827;">TOTAL:</span>
            <span style="color: #111827;">₹${total.toFixed(2)}</span>
          </div>
        </div>
        <div style="clear: both;"></div>

        ${notes ? `
          <div style="margin-bottom: 16px; padding: 16px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px;">
            <h4 style="font-weight: bold; color: #111827; margin-bottom: 8px;">Notes:</h4>
            <p style="color: #374151; font-size: 13px;">${notes}</p>
          </div>
        ` : ''}

        ${termsAndConditions ? `
          <div style="margin-bottom: 16px; padding: 16px; background: #fef9c3; border: 1px solid #fde68a; border-radius: 6px;">
            <h4 style="font-weight: bold; color: #111827; margin-bottom: 8px;">Terms & Conditions:</h4>
            <p style="color: #92400e; font-size: 13px;">${termsAndConditions}</p>
          </div>
        ` : ''}

        ${signatureImage ? `
          <div style="margin-bottom: 24px;">
            <h4 style="font-weight: bold; color: #111827; margin-bottom: 8px;">Authorized Signature:</h4>
            <img src="${signatureImage}" alt="Signature" style="height: 48px;" />
          </div>
        ` : ''}

        <div style="text-align: center; margin-top: 32px; padding: 24px; background: linear-gradient(to bottom right, #eff6ff, #f3e8ff); border: 2px solid #93c5fd; border-radius: 8px;">
          <h4 style="font-weight: bold; color: #111827; margin-bottom: 12px; font-size: 18px;">💳 Scan to Pay via UPI</h4>
          <div style="display: inline-block; padding: 12px; background: white; border: 2px solid #d1d5db; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiLink)}" alt="QR" style="width: 144px; height: 144px;" />
          </div>
          <p style="color: #374151; font-weight: bold; margin-top: 12px;">Scan to pay ₹${total.toFixed(2)}</p>
          <p style="color: #6b7280; font-size: 13px; margin-top: 4px;">UPI ID: ${billFrom.upiId}</p>
        </div>
      </div>
    `;

    printArea.innerHTML = content;

    // Wait a moment for images to load
    setTimeout(() => {
      html2canvas(printArea, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        pdf.save(`Invoice_${displayInvoiceNumber}.pdf`);
      }).catch((err) => {
        console.error('PDF Error:', err);
        alert('PDF generate nahi ho paya. Kripya dobara try karein.');
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-6">
      {/* HIDDEN PRINT AREA - SAFE FOR PDF */}
      <div id="print-area" style={{ position: 'fixed', left: '-9999px', top: 0, width: '800px' }}></div>

      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">✨ Navokta Invoice Generator</h1>
        <p className="text-slate-300 text-lg">Create professional invoices with UPI payment in seconds</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
        {/* ===== FORM ===== */}
        <div className="w-full lg:w-1/2 space-y-6">
          <Card title="Bill From" icon={<Building className="text-blue-400" />}>
            <InputField label="Company Name" value={billFrom.name} onChange={(e) => setBillFrom({ ...billFrom, name: e.target.value })} />
            <InputField label="Address" value={billFrom.address} onChange={(e) => setBillFrom({ ...billFrom, address: e.target.value })} />
            <InputField label="Email" value={billFrom.email} onChange={(e) => setBillFrom({ ...billFrom, email: e.target.value })} />
            <InputField label="Phone" value={billFrom.phone} onChange={(e) => setBillFrom({ ...billFrom, phone: e.target.value })} />
            <InputField label="UPI ID" value={billFrom.upiId} onChange={(e) => setBillFrom({ ...billFrom, upiId: e.target.value })} placeholder="e.g. yourname@oksbi" />

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Company Logo</label>
              <div className="flex items-center gap-3">
                <label className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg cursor-pointer hover:bg-slate-600 transition flex items-center gap-2">
                  📷 Upload Logo
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
                {logoPreview && (
                  <div className="relative">
                    <img src={logoPreview} alt="Logo" className="h-12 w-12 object-contain rounded border-2 border-blue-500" />
                    <button onClick={() => setLogoPreview(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600">
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Digital Signature</label>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 border border-blue-500 rounded-lg text-white hover:bg-blue-700 transition flex items-center gap-2"
                onClick={() => setShowSignatureModal(true)}
              >
                <PenTool size={16} /> {signatureImage ? 'Edit Signature' : 'Add Signature'}
              </button>
            </div>
          </Card>

          <Card title="Bill To" icon={<User className="text-green-400" />}>
            <InputField label="Client Name" value={billTo.name} onChange={(e) => setBillTo({ ...billTo, name: e.target.value })} />
            <InputField label="Address" value={billTo.address} onChange={(e) => setBillTo({ ...billTo, address: e.target.value })} />
            <InputField label="Email" value={billTo.email} onChange={(e) => setBillTo({ ...billTo, email: e.target.value })} />
            <InputField label="Phone" value={billTo.phone} onChange={(e) => setBillTo({ ...billTo, phone: e.target.value })} />
          </Card>

          <Card title="Invoice Details" icon={<FileText className="text-purple-400" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Invoice Number" value={invoiceDetails.invoiceNumber} onChange={(e) => setInvoiceDetails({ ...invoiceDetails, invoiceNumber: e.target.value })} placeholder="Auto-generated" />
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Currency</label>
                <div className="px-3 py-2.5 bg-slate-700 rounded-lg border border-slate-600 text-white">₹ INR (Indian Rupee)</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <InputField label="Issue Date" type="date" value={invoiceDetails.issueDate} onChange={(e) => setInvoiceDetails({ ...invoiceDetails, issueDate: e.target.value })} />
              <InputField label="Due Date" type="date" value={invoiceDetails.dueDate} onChange={(e) => setInvoiceDetails({ ...invoiceDetails, dueDate: e.target.value })} />
            </div>
          </Card>

          <Card title="Items / Services" icon={<Plus className="text-yellow-400" />}>
            {items.map((item) => (
              <div key={item.id} className="bg-slate-700/50 p-4 rounded-lg mb-4 border border-slate-600">
                <InputField label="Item Name" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} />
                <InputField label="Description" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} />
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <InputField label="Quantity" type="number" min="1" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', e.target.value)} />
                  <InputField label="Rate (₹)" type="number" step="0.01" min="0" value={item.rate} onChange={(e) => updateItem(item.id, 'rate', e.target.value)} />
                </div>
                {items.length > 1 && (
                  <button type="button" className="mt-3 flex items-center gap-1 text-red-400 hover:text-red-300 transition" onClick={() => removeItem(item.id)}>
                    <Trash2 size={16} /> Remove Item
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="w-full py-3 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 rounded-lg border border-slate-600 text-white transition" onClick={addItem}>
              <Plus size={18} /> Add New Item
            </button>
          </Card>

          <Card title="Summary" icon={<IndianRupee className="text-orange-400" />}>
            <InputField label="Discount (₹)" type="number" step="0.01" min="0" value={summary.discount} onChange={(e) => setSummary({ ...summary, discount: parseFloat(e.target.value) || 0 })} />
            <InputField label="Tax (%)" type="number" step="0.1" min="0" max="100" value={summary.tax} onChange={(e) => setSummary({ ...summary, tax: parseFloat(e.target.value) || 0 })} />
            <InputField label="Shipping (₹)" type="number" step="0.01" min="0" value={summary.shipping} onChange={(e) => setSummary({ ...summary, shipping: parseFloat(e.target.value) || 0 })} />
          </Card>

          <Card title="Additional Information" icon={<FileText className="text-pink-400" />}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes..."
                rows="3"
                className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Terms & Conditions</label>
              <textarea
                value={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.value)}
                placeholder="Add payment terms..."
                rows="3"
                className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </Card>
        </div>

        {/* ===== LIVE PREVIEW ===== */}
        <div className="w-full lg:w-1/2">
          <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden sticky top-6">
            <div className="p-5 bg-gradient-to-r from-blue-600 to-purple-600 border-b border-slate-700">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <FileText size={22} /> Live Invoice Preview
              </h2>
            </div>
            <div className="p-5 overflow-y-auto max-h-[calc(100vh-200px)]">
              <div
                id="invoice-preview"
                className="bg-white text-black p-6 rounded-lg shadow-lg"
                style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}
              >
                {logoPreview && (
                  <div className="text-center mb-6">
                    <img src={logoPreview} alt="Company Logo" className="h-16 mx-auto object-contain" />
                  </div>
                )}

                <div className="flex justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{billFrom.name}</h2>
                    <p className="text-gray-600 mt-1">{billFrom.address}</p>
                    <p className="text-gray-600">{billFrom.email}</p>
                    <p className="text-gray-600">{billFrom.phone}</p>
                    <p className="text-gray-600">UPI: {billFrom.upiId}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-gray-900">INVOICE</h3>
                    <p className="text-gray-600 mt-1">#{displayInvoiceNumber}</p>
                    <p className="text-gray-600">Issue: {invoiceDetails.issueDate}</p>
                    <p className="text-gray-600">Due: {invoiceDetails.dueDate}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="font-bold text-gray-900 mb-2">Bill To:</h4>
                  <p className="text-gray-800">{billTo.name || '—'}</p>
                  {billTo.address && <p className="text-gray-600">{billTo.address}</p>}
                  {billTo.email && <p className="text-gray-600">{billTo.email}</p>}
                  {billTo.phone && <p className="text-gray-600">{billTo.phone}</p>}
                </div>

                <table className="w-full mb-6">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 text-gray-900">Description</th>
                      <th className="text-right py-3 text-gray-900">Qty</th>
                      <th className="text-right py-3 text-gray-900">Rate</th>
                      <th className="text-right py-3 text-gray-900">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i} className="border-b border-gray-200">
                        <td className="py-3">
                          <div className="font-semibold text-gray-900">{item.name || '—'}</div>
                          {item.description && <div className="text-sm text-gray-600">{item.description}</div>}
                        </td>
                        <td className="text-right py-3 text-gray-700">{item.qty}</td>
                        <td className="text-right py-3 text-gray-700">₹{Number(item.rate).toFixed(2)}</td>
                        <td className="text-right py-3 text-gray-900 font-semibold">₹{(item.qty * item.rate).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end mb-6">
                  <div className="w-64">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-700">Subtotal:</span>
                      <span className="text-gray-900">₹{subtotal.toFixed(2)}</span>
                    </div>
                    {summary.discount > 0 && (
                      <div className="flex justify-between py-2 text-red-600">
                        <span>Discount:</span>
                        <span>- ₹{summary.discount.toFixed(2)}</span>
                      </div>
                    )}
                    {summary.tax > 0 && (
                      <div className="flex justify-between py-2">
                        <span className="text-gray-700">Tax ({summary.tax}%):</span>
                        <span className="text-gray-900">₹{taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {summary.shipping > 0 && (
                      <div className="flex justify-between py-2">
                        <span className="text-gray-700">Shipping:</span>
                        <span className="text-gray-900">₹{summary.shipping.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-3 border-t-2 border-gray-800 font-bold text-lg">
                      <span className="text-gray-900">TOTAL:</span>
                      <span className="text-gray-900">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {notes && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-2">Notes:</h4>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{notes}</p>
                  </div>
                )}

                {termsAndConditions && (
                  <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-300">
                    <h4 className="font-bold text-gray-900 mb-2">Terms & Conditions:</h4>
                    <p className="text-yellow-900 text-sm whitespace-pre-wrap">{termsAndConditions}</p>
                  </div>
                )}

                {signatureImage && (
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-900 mb-2">Authorized Signature:</h4>
                    <img src={signatureImage} alt="Signature" className="h-12" />
                  </div>
                )}

                <div className="text-center mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-300">
                  <h4 className="font-bold text-gray-900 mb-3 text-lg">💳 Scan to Pay via UPI</h4>
                  <div className="inline-block p-3 bg-white rounded-lg border-2 border-gray-300 shadow-md">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiLink)}`}
                      alt="Payment QR"
                      className="w-36 h-36"
                    />
                  </div>
                  <p className="text-gray-700 font-semibold mt-3">Scan to pay ₹{total.toFixed(2)}</p>
                  <p className="text-gray-500 text-sm mt-1">UPI ID: {billFrom.upiId}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={exportToPDF}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold flex items-center gap-2 justify-center transition shadow-lg"
                >
                  <Download size={20} /> Download as PDF
                </button>

                <a
                  href={upiLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold text-center transition shadow-lg"
                >
                  <div className="flex items-center gap-2 justify-center">
                    <CreditCard size={20} /> Pay ₹{total.toFixed(2)} via UPI
                  </div>
                </a>

                <div className="text-center pt-2 bg-slate-700 rounded-lg p-3">
                  <p className="text-slate-300 text-sm">
                    Invoice Total: <span className="text-white font-bold text-2xl">₹{total.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SIGNATURE MODAL ===== */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-3xl border-2 border-blue-500 shadow-2xl">
            <div className="p-5 bg-gradient-to-r from-blue-600 to-purple-600 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">✍️ Sign Your Invoice</h3>
              <button onClick={() => setShowSignatureModal(false)} className="text-white hover:text-gray-200 transition">
                <X size={28} />
              </button>
            </div>
            <div className="p-6">
              <div className="border-2 border-slate-600 rounded-lg bg-white overflow-hidden">
                <SignatureCanvas
                  ref={signatureRef}
                  penColor="black"
                  canvasProps={{
                    width: 700,
                    height: 250,
                    className: 'cursor-crosshair'
                  }}
                  backgroundColor="rgba(0,0,0,0)"
                />
              </div>
              <p className="text-slate-400 text-sm mt-3">✏️ Draw your signature using your mouse or touchscreen</p>
              <div className="mt-5 flex gap-3 justify-between">
                <button
                  type="button"
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center gap-2 transition"
                  onClick={() => signatureRef.current?.clear()}
                >
                  <Trash2 size={18} /> Clear
                </button>
                <button
                  type="button"
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 transition"
                  onClick={() => {
                    const trimmedCanvas = signatureRef.current?.getTrimmedCanvas();
                    if (trimmedCanvas) {
                      setSignatureImage(trimmedCanvas.toDataURL('image/png'));
                    }
                    setShowSignatureModal(false);
                  }}
                >
                  <Download size={18} /> Save Signature
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-preview, #invoice-preview * { visibility: visible; }
          #invoice-preview { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}

const Card = ({ title, icon, children }) => (
  <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-lg">
    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-white">
      {icon} {title}
    </h3>
    {children}
  </div>
);

const InputField = ({ label, value, onChange, type = 'text', placeholder = '', min, max, step }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
    />
  </div>
);