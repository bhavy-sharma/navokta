import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InvoiceData, LineItem } from '../types';

const formatCurrency = (amount: number, currency: string): string => {
  // Force INR to display with ₹ symbol manually to avoid encoding issues
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  }

  // Use Intl for other currencies
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const generatePDF = (data: InvoiceData & { qrCode?: string }): jsPDF => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPos = 20;

  // Title
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INVOICE', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Invoice Meta Info (Right-aligned)
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Invoice #: ${data.invoiceDetails.number}`, pageWidth - 20, yPos, { align: 'right' });
  yPos += 7;
  pdf.text(`Date: ${data.invoiceDetails.date}`, pageWidth - 20, yPos, { align: 'right' });
  yPos += 7;
  pdf.text(`Due Date: ${data.invoiceDetails.dueDate}`, pageWidth - 20, yPos, { align: 'right' });
  yPos += 15;

  // From / To Columns
  const fromX = 20;
  const toX = pageWidth / 2 + 10;
  const topY = yPos;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('From:', fromX, topY);
  pdf.text('Bill To:', toX, topY);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);

  const fromLines = [data.businessInfo.name, data.businessInfo.email, ...data.businessInfo.address.split('\n')];
  const toLines = [data.clientInfo.name, data.clientInfo.email, ...data.clientInfo.address.split('\n')];

  fromLines.forEach((line, i) => pdf.text(line, fromX, topY + 7 + i * 6));
  toLines.forEach((line, i) => pdf.text(line, toX, topY + 7 + i * 6));

  yPos = topY + 7 + Math.max(fromLines.length, toLines.length) * 6 + 10;

  // Table
  const tableHeaders = [['Description', 'Quantity', 'Unit Price', 'Total']];
  const tableBody = data.lineItems.map((item: LineItem) => [
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unitPrice, data.invoiceDetails.currency),
    formatCurrency(item.total, data.invoiceDetails.currency),
  ]);

  autoTable(pdf, {
    head: tableHeaders,
    body: tableBody,
    startY: yPos,
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], textColor: 255, halign: 'center' },
    styles: { fontSize: 10, halign: 'center' },
    margin: { left: 20, right: 20 },
  });

  yPos = (pdf as any).lastAutoTable.finalY + 10;

  // Totals (Subtotal, Tax, Total)
  const labelX = pageWidth - 80;
  const valueX = pageWidth - 20;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Subtotal:', labelX, yPos);
  pdf.text(formatCurrency(data.subtotal, data.invoiceDetails.currency), valueX, yPos, { align: 'right' });
  yPos += 7;

  pdf.text(`Tax (${data.taxRate}%):`, labelX, yPos);
  pdf.text(formatCurrency(data.taxAmount, data.invoiceDetails.currency), valueX, yPos, { align: 'right' });
  yPos += 7;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Total:', labelX, yPos);
  pdf.text(formatCurrency(data.total, data.invoiceDetails.currency), valueX, yPos, { align: 'right' });
  yPos += 20;

  // QR Code Section
  if (data.qrCode) {
    const qrX = 20;
    const qrWidth = 60;
    const qrHeight = 60;

    // QR Code Image
    pdf.addImage(data.qrCode, 'PNG', qrX, yPos, qrWidth, qrHeight);
    yPos += qrHeight + 5;

    // Label
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Scan to Pay', qrX + qrWidth / 2, yPos, { align: 'center' });
    yPos += 10;
  }

  // Notes
  if (data.invoiceDetails.notes) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Notes:', 20, yPos);
    yPos += 7;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const noteLines = pdf.splitTextToSize(data.invoiceDetails.notes, pageWidth - 40);
    pdf.text(noteLines, 20, yPos);
    yPos += noteLines.length * 5 + 10;
  }

  // Footer
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(10);
  pdf.text('Thank you for your business!', pageWidth / 2, pageHeight - 15, { align: 'center' });

  return pdf;
};

export const downloadPDF = (data: InvoiceData & { qrCode?: string }): void => {
  const pdf = generatePDF(data);
  pdf.save(`invoice-${data.invoiceDetails.number}.pdf`);
};
