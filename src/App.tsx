import React, { useEffect, useState } from 'react';
import { FileText, PenSquare } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
// import toast from 'react-hot-toast';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import { InvoiceData } from './types';
import { sampleInvoiceData } from './utils/sampleData';
// import { downloadPDF } from './utils/pdf';
import { generateUPIQRCode } from './utils/qrcode';

function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(sampleInvoiceData);
  // const [blackMode, setBlackMode] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [hideHeader, setHideHeader] = useState(false);


  useEffect(() => {
    const fetchQR = async () => {
      if (invoiceData) {
        const qr = await generateUPIQRCode(invoiceData.total, invoiceData.invoiceDetails.number);
        setQrCode(qr);
      }
    };
    fetchQR();
  }, [invoiceData]);

const handlePrint = () => {
  setHideHeader(true); // Add 'noprint' class
  setTimeout(() => {
    window.print();
    setHideHeader(false); // Remove class after printing
  }, 100); // delay to ensure DOM updates
};

  const handleInvoiceDataUpdate = (data: InvoiceData) => {
    setInvoiceData(data);
    if (activeTab === 'form') setActiveTab('preview');
  };

  return (
    <div className={`min-h-screen`}>
      <Toaster position="top-right" />
     <header className={` border-b border-black ${hideHeader ? 'noprint' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <FileText className={`h-8 w-8`} />
            <h1 className={`ml-2 text-2xl font-semibold `}>
              Navokta
            </h1>
          </div>
          <div className="flex space-x-4">

            <button
              onClick={() => setActiveTab('form')}
              className="flex items-center px-4 py-2 border border-black text-sm font-medium rounded-md text-black bg-white hover:bg-black hover:text-white"
            >
              <PenSquare className="h-4 w-4 mr-2" />
              Edit Form
            </button>
            <button onClick={handlePrint} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
  Print Invoice
</button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-5xl mx-auto">
        {activeTab === 'form' ? (
          <InvoiceForm initialData={invoiceData} onSubmit={handleInvoiceDataUpdate} />
        ) : (
          <InvoicePreview
            data={invoiceData}
            onEdit={() => setActiveTab('form')}
            qrCode={qrCode}
          />
        )}
      </main>
    </div>
  );
}

export default App;
