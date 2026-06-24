import { Printer, Download, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router";
import html2pdf from "html2pdf.js";
export function InvoicePreview() {
  const location = useLocation();
  const invoiceData = location.state?.invoice;
  const useSecondPage = (invoiceData?.items?.length || 0) > 5;

  const handleDownloadPDF = async () => {
    try {
      const pdfPayload = {
        invoiceNo: invoiceData?.invoiceNo || "N/A",
        date: invoiceData?.date || new Date().toISOString().split('T')[0],
        customer: {
          name: invoiceData?.customer?.name || "N/A",
          address: invoiceData?.customer?.address || "N/A",
          mobile: invoiceData?.customer?.mobile || "N/A",
          gst: invoiceData?.customer?.gst || "N/A",
        },
        items: invoiceData?.items || [],
        totals: invoiceData?.totals || {},
      };

      const response = await fetch("/api/generate-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pdfPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoiceData?.invoiceNo || "invoice"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF download failed:", error);
      alert("Failed to download PDF. Please try again.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const convertNumberToWords = (num:number):string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    const convertLessThanThousand = (n: number): string => {
      let word = '';

      if (n >= 100) {
        word += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }

      if (n >= 20) {
        word += tens[Math.floor(n / 10)];
        if (n % 10 > 0) {
          word += ' ' + ones[n % 10];
        }
      } else if (n >= 10) {
        word += teens[n - 10];
      } else if (n > 0) {
        word += ones[n];
      }

      return word.trim();
    };

    if (num === 0) return 'Zero Only';
    if (num < 0) return 'Minus ' + convertNumberToWords(-num);

    const n = Math.floor(num);
    let words = '';

    if (n >= 10000000) {
      words += convertLessThanThousand(Math.floor(n / 10000000)) + ' Crore ';
    }

    if ((n % 10000000) >= 100000) {
      words += convertLessThanThousand(Math.floor((n % 10000000) / 100000)) + ' Lakh ';
    }

    if ((n % 100000) >= 1000) {
      words += convertLessThanThousand(Math.floor((n % 100000) / 1000)) + ' Thousand ';
    }

    if ((n % 1000) > 0) {
      words += convertLessThanThousand(n % 1000);
    }

    return words.trim() + ' Only';
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link to="/create-invoice" className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-medium transition-colors">
          <ArrowLeft size={16} />
          Back to Edit
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
          >
            <Download size={16} />
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
          >
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>

      {/* A4 Size Print Container */}
      <div id="invoice-content" className="bg-white p-10 print:shadow-none print:p-0 print:m-0 w-full print:border-none mx-auto text-sm text-gray-800" style={{ fontFamily: 'Calibri, sans-serif'}}>

        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-40 h-32 flex items-center justify-center flex-shrink-0">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F09261f8b72144e6abe5bb6013b963524%2F31eafa10c5e24ba0b87a80f773abedf3?format=webp&width=800&height=1200"
                alt="Sri Nava Industries"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1
  className="text-2xl text-gray-900 uppercase tracking-wide"
  style={{ fontFamily: "'Times New Roman', Times, serif" }}
>
  <b>
    Sri Nava Industries</b>
</h1>
              <p className="text-black-500 mt-0.5">1, Harbour Colony, 2nd Main road, Kodungaiyur, Chennai-600118</p>
              <p className="text-black-500">Phone: +91 93458 58195</p>
              <p className="text-black-500">Email: srinavaindustries@gmail.com</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-light text-blue-600 uppercase tracking-widest mb-2 print:text-gray-800">Tax Invoice</h2>
            <div className="text-sm">
              <p className="flex justify-end gap-4"><span className="text-gray-500 font-medium w-24">Invoice No:</span> <span className="font-bold w-32 text-left">{invoiceData?.invoiceNo || 'N/A'}</span></p>
              <p className="flex justify-end gap-4 mt-1"><span className="text-gray-500 font-medium w-24">Date:</span> <span className="font-bold w-32 text-left">{invoiceData?.date ? new Date(invoiceData.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span></p>
              <p className="flex justify-end gap-4 mt-1"><span className="text-gray-500 font-medium w-24">GSTIN:</span> <span className="font-bold w-32 text-left">33AFHPB5508G2ZW</span></p>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-5">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-black-200 pb-1">Billed To</h3>
            <p className="font-bold text-base text-gray-900">{invoiceData?.customer?.name || 'N/A'}</p>
            <p className="text-gray-600 mt-1">{invoiceData?.customer?.address || 'N/A'}</p>
            <p className="text-gray-600 mt-1"><span className="font-medium">Phone:</span> {invoiceData?.customer?.mobile || 'N/A'}</p>
            <p className="text-gray-800 font-semibold mt-1"><span className="text-gray-500 font-medium">GSTIN:</span> {invoiceData?.customer?.gst || 'N/A'}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 print:bg-gray-200 text-gray-800 border-b-2 border-gray-300">
                <th className="py-2 px-3 font-semibold w-10 text-center">#</th>
                <th className="py-2 px-3 font-semibold">Description of Goods</th>
                <th className="py-2 px-3 font-semibold w-20 text-right">Qty</th>
                <th className="py-2 px-3 font-semibold w-28 text-right">Rate</th>
                <th className="py-2 px-3 font-semibold w-20 text-right">GST %</th>
                <th className="py-2 px-3 font-semibold w-32 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 border-b-2 border-gray-300">
              {invoiceData?.items?.map((item:any, index:number) => (
                <tr key={item.id}>
                  <td className="py-3 px-3 text-center text-gray-500">{index + 1}</td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-gray-900">{item.name}</p>
                  </td>
                  <td className="py-3 px-3 text-right font-medium">{Math.floor(item.quantity)}</td>
                  <td className="py-3 px-3 text-right text-gray-600">{item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="py-3 px-3 text-right text-gray-600">{item.gstPercent}%</td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900">{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Taxes */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-4">
          {/* Bank Details */}
          <div className="w-full md:w-1/2 order-2 md:order-1">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 border-b border-gray-200 pb-1">Bank Details</h3>
              <div className="text-sm mt-2">
                <p className="flex"><span className="w-24 text-gray-500">Bank Name:</span> <span className="font-semibold">Bank of India</span></p>
                <p className="flex"><span className="w-24 text-gray-500">A/C Name:</span> <span className="font-semibold">SRI NAVA INDUSTRIES</span></p>
                <p className="flex"><span className="w-24 text-gray-500">A/C No:</span> <span className="font-semibold">802120110001169</span></p>
                <p className="flex"><span className="w-24 text-gray-500">IFSC Code:</span> <span className="font-semibold">BKID0008021</span></p>
              </div>
            </div>
          </div>

          {/* Totals Calculation */}
          <div className="w-full md:w-1/2 md:max-w-[320px] order-1 md:order-2 self-start md:self-end">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Taxable Amount</span>
                <span className="font-semibold">{formatCurrency(invoiceData?.totals?.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Add: CGST @ 9%</span>
                <span className="font-semibold">{formatCurrency(invoiceData?.totals?.cgst || 0)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Add: SGST @ 9%</span>
                <span className="font-semibold">{formatCurrency(invoiceData?.totals?.sgst || 0)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Round Off</span>
                <span className="font-semibold">₹0.00</span>
              </div>
              <div className="border-t-2 border-gray-800 pt-2 pb-1 mt-2 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900 uppercase">Total Amount</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(invoiceData?.totals?.grandTotal || 0)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 font-medium">
              Amount in words: <span className="text-gray-800">{invoiceData?.totals?.grandTotal ? convertNumberToWords(invoiceData.totals.grandTotal) : 'N/A'}</span>
            </p>
          </div>
        </div>

        

        {/* Declaration & Signature Footer */}
       {/* Declaration & Signature Footer - Page 1 */}
{!useSecondPage && (
  <div
    className="mt-4"
    style={{
      pageBreakInside: "avoid",
      breakInside: "avoid",
    }}
  >
    <div className=" pt-5 border-t border-gray-300">
      <h3 className="text-xs font-bold text-black-400 uppercase tracking-wider mb-2">
       <b> Declaration</b>
      </h3>

      <p className="text-xs text-gray-700 leading-tight">
        We hereby declare that the particulars given above are true and correct.The goods/services mentioned in this invoice have been supplied as specified,
        and the amount charged is in accordance with the agreed terms and conditions.
      </p>
    </div>

    <div className="flex justify-between mt-206">
      <div className="text-center">
        <div className="w-40 border-b border-gray-400 mb-10"></div>
        <p className="font-bold text-gray-800 text-sm">Customer Signature</p>
        <p className="text-xs text-gray-500">{invoiceData?.customer?.name}</p>
      </div>

      <div className="text-center">
        <div className="w-40 border-b border-gray-400 mb-10"></div>
        <p className="font-bold text-gray-800 text-sm">For Nava Industries</p>
        <p className="text-xs text-gray-500">Authorized Signatory</p>
      </div>
    </div>
  </div>
)})
      </div>
    </div>
  );
}