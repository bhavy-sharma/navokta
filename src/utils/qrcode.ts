import QRCode from 'qrcode';

export const generateUPIQRCode = async (
  amount: number,
  invoiceId: string
): Promise<string> => {
  const upiId = '8307233996@jio';  
  const name = 'Bhavy Sharma';

  // Construct UPI payment URI with encoded parameters
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount.toFixed(2)}&cu=INR&tn=Invoice+${encodeURIComponent(invoiceId)}`;

  try {
    const qr = await QRCode.toDataURL(upiLink, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'H',
    });
    return qr;
  } catch (error) {
    console.error('QR generation failed:', error);
    return '';
  }
};
