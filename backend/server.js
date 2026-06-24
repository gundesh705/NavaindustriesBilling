import express from 'express';
import cors from 'cors';
import { createCanvas } from 'canvas';
import jsPDF from 'jspdf';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Generate invoice PDF
app.post('/api/generate-invoice', async (req, res) => {
  try {
    const { invoiceNo, date, customer, items, totals } = req.body;

    // Create PDF using jsPDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to add text
    const addText = (text, x, y, options = {}) => {
      pdf.setFontSize(options.fontSize || 10);
      pdf.setTextColor(options.color || [0, 0, 0]);
      if (options.bold) pdf.setFont(undefined, 'bold');
      else pdf.setFont(undefined, 'normal');
      
      if (options.align === 'right') {
        pdf.text(text, x + contentWidth, y, { align: 'right' });
      } else if (options.align === 'center') {
        pdf.text(text, x + contentWidth / 2, y, { align: 'center' });
      } else {
        pdf.text(text, x, y);
      }
    };

    // Header
    pdf.setDrawColor(192, 57, 43); // Red
    pdf.rect(margin, yPosition, contentWidth, 10, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text('SRI NAVA INDUSTRIES', pageWidth / 2, yPosition + 6, { align: 'center' });
    yPosition += 12;

    // Company Info + Tax Invoice
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    addText('Sri Nava Industries', margin, yPosition, { bold: true });
    yPosition += 6;
    addText('1, Harbour Colony, 2nd Main Rd, Kodungaiyur, Chennai-600118', margin, yPosition, { fontSize: 8 });
    yPosition += 4;
    addText('Ph: 9345858195 | Email: srinavaindustries@gmail.com', margin, yPosition, { fontSize: 8 });
    yPosition += 6;

    // Tax Invoice title (right side)
    pdf.setTextColor(192, 57, 43);
    pdf.setFontSize(13);
    pdf.setFont(undefined, 'bold');
    pdf.text('TAX INVOICE', pageWidth - margin, yPosition - 10, { align: 'right' });
    pdf.setTextColor(0, 0, 0);

    yPosition += 4;

    // Invoice details
    pdf.setFontSize(9);
    addText(`Invoice No: ${invoiceNo || 'N/A'}`, margin, yPosition);
    addText(`Date: ${date || 'N/A'}`, pageWidth / 2 + margin, yPosition);
    yPosition += 5;
    addText(`GSTIN: 33AFHPB5508G2ZW`, margin, yPosition);
    yPosition += 8;

    // Bill To section
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, yPosition, contentWidth, 6, 'F');
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'bold');
    addText('BILL TO', margin + 2, yPosition + 4);
    yPosition += 7;

    pdf.setFontSize(8);
    pdf.setFont(undefined, 'normal');
    addText(`Name: ${customer?.name || 'N/A'}`, margin, yPosition);
    yPosition += 4;
    addText(`Address: ${customer?.address || 'N/A'}`, margin, yPosition);
    yPosition += 4;
    addText(`Phone: ${customer?.mobile || 'N/A'}`, margin, yPosition);
    yPosition += 4;
    addText(`GSTIN: ${customer?.gst || 'N/A'}`, margin, yPosition);
    yPosition += 8;

    // Items Table
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, yPosition, contentWidth, 6, 'F');
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'bold');
    addText('#', margin + 2, yPosition + 4);
    addText('Description', margin + 10, yPosition + 4);
    addText('Qty', margin + 90, yPosition + 4);
    addText('Rate', margin + 105, yPosition + 4);
    addText('GST %', margin + 120, yPosition + 4);
    addText('Amount', margin + 135, yPosition + 4);
    yPosition += 7;

    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(8);
    items?.forEach((item, idx) => {
      addText(String(idx + 1), margin + 2, yPosition);
      addText(item.name || '', margin + 10, yPosition);
      addText(String(item.quantity || 0), margin + 90, yPosition, { align: 'center' });
      addText(`${item.rate?.toFixed(2) || 0}`, margin + 105, yPosition, { align: 'right' });
      addText(String(item.gstPercent || 0), margin + 120, yPosition, { align: 'center' });
      addText(`${item.amount?.toFixed(2) || 0}`, margin + 135, yPosition, { align: 'right' });
      yPosition += 5;
    });
    yPosition += 3;

    // Totals
    pdf.setFont(undefined, 'bold');
    addText('Subtotal:', margin, yPosition);
    addText(`₹${(totals?.subtotal || 0).toFixed(2)}`, margin + 135, yPosition, { align: 'right' });
    yPosition += 5;

    addText('CGST (9%):', margin, yPosition);
    addText(`₹${(totals?.cgst || 0).toFixed(2)}`, margin + 135, yPosition, { align: 'right' });
    yPosition += 5;

    addText('SGST (9%):', margin, yPosition);
    addText(`₹${(totals?.sgst || 0).toFixed(2)}`, margin + 135, yPosition, { align: 'right' });
    yPosition += 7;

    // Grand Total
    pdf.setFillColor(192, 57, 43);
    pdf.setTextColor(255, 255, 255);
    pdf.rect(margin, yPosition, contentWidth, 8, 'F');
    pdf.setFontSize(11);
    addText('GRAND TOTAL', margin + 2, yPosition + 5);
    addText(`₹${(totals?.grandTotal || 0).toFixed(2)}`, margin + 135, yPosition + 5, { align: 'right' });
    yPosition += 10;

    // Amount in words
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(8);
    const words = numToWords(Math.floor(totals?.grandTotal || 0));
    addText(`Amount in words: ${words} Only`, margin, yPosition);
    yPosition += 8;

    // Declaration
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, yPosition, contentWidth, 6, 'F');
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'bold');
    addText('DECLARATION', margin + 2, yPosition + 4);
    yPosition += 7;

    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(7);
    const declText = 'We hereby declare that the particulars given above are true and correct. The goods/services mentioned in this invoice have been supplied as specified, and the amount charged is in accordance with the agreed terms and conditions.';
    const declLines = pdf.splitTextToSize(declText, contentWidth - 4);
    pdf.text(declLines, margin + 2, yPosition);
    yPosition += declLines.length * 3.5 + 5;

    // Signatures
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'normal');
    addText('Customer Signature', margin + 20, yPosition + 25, { align: 'center' });
    addText('For Sri Nava Industries', margin + contentWidth - 20, yPosition + 25, { align: 'center' });
    pdf.line(margin + 5, yPosition + 20, margin + 35, yPosition + 20);
    pdf.line(margin + contentWidth - 35, yPosition + 20, margin + contentWidth - 5, yPosition + 20);

    // Return PDF
    const pdfData = pdf.output('arraybuffer');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoiceNo || 'invoice'}.pdf"`);
    res.send(Buffer.from(pdfData));
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

// Number to words converter
function numToWords(n) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const belowHundred = (x) => {
    if (x < 20) return ones[x];
    return tens[Math.floor(x / 10)] + (x % 10 ? ' ' + ones[x % 10] : '');
  };

  const belowThousand = (x) => {
    if (x < 100) return belowHundred(x);
    return ones[Math.floor(x / 100)] + ' Hundred' + (x % 100 ? ' ' + belowHundred(x % 100) : '');
  };

  if (n === 0) return 'Zero';
  
  const parts = [];
  const crore = Math.floor(n / 10_000_000); n %= 10_000_000;
  if (crore) parts.push(belowThousand(crore) + ' Crore');
  
  const lakh = Math.floor(n / 100_000); n %= 100_000;
  if (lakh) parts.push(belowThousand(lakh) + ' Lakh');
  
  const thousand = Math.floor(n / 1000); n %= 1000;
  if (thousand) parts.push(belowThousand(thousand) + ' Thousand');
  
  if (n) parts.push(belowThousand(n));
  
  return parts.join(' ');
}

app.listen(PORT, () => {
  console.log(`Invoice PDF server running on port ${PORT}`);
});
