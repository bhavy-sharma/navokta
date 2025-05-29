import { InvoiceData } from '../types';

export const sampleInvoiceData: InvoiceData = {
  businessInfo: {
    name: 'Navokta',
    email: 'work.bhavy@gmail.com',
    address: '531/8 Dhola Kua\nHansi\nHaryana',
    logo: 'https://images.unsplash.com/photo-1636819488524-1f019c4e1c44?w=100&h=100&fit=crop',
    paypalMe: 'https://paypal.me/bhavysharma18',
  },
  clientInfo: {
    name: 'Kuch bhi ho skta hai',
    email: 'accounts@gmail.com',
    address: '123 floor\nABC Nagar\nAbc Jagah',
  },
  invoiceDetails: {
    number: 'INV-2024-001',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Payment is due within 30 days. Please include the invoice number with your payment.',
    currency: 'USD',
  },
  lineItems: [
    {
      description: 'Website Development',
      quantity: 1,
      unitPrice: 5000,
      total: 5000,
    },
    {
      description: 'UI/UX Design',
      quantity: 2,
      unitPrice: 1500,
      total: 3000,
    },
    {
      description: 'Content Creation',
      quantity: 10,
      unitPrice: 100,
      total: 1000,
    },
  ],
  taxRate: 10,
  subtotal: 9000,
  taxAmount: 900,
  total: 9900,
};