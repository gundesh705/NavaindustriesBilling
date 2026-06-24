import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, FileSpreadsheet, FileText, Calendar } from "lucide-react";
import { salesDataByYear } from "../data/mock";
import { useInvoices } from "../context/InvoiceContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function Reports() {
  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const { invoices } = useInvoices();
  console.log("REPORTS INVOICES:", invoices);
const exportExcel = () => {
  const data = invoices.map((invoice) => ({
    InvoiceNo: invoice.invoiceNo,
    Customer: invoice.customer.name,
    Date: invoice.date,
    GST: invoice.customer.gst,
    Amount: invoice.totals.grandTotal,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const file = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(file, "Nava_Industries_Invoices.xlsx");
};
const exportPDF = () => {
  console.log("PDF invoices:", invoices);

  if (!invoices || invoices.length === 0) {
    alert("No invoices found");
    return;
  }

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Nava Industries Invoice Report", 14, 20);

  autoTable(doc, {
    startY: 30,
    head: [["Invoice No", "Customer", "Date", "GST", "Amount"]],
    body: invoices.map((invoice) => [
  String(invoice.invoiceNo || ""),
  String(invoice.customer?.name || ""),
  String(new Date(invoice.date).toLocaleDateString()),
  String(invoice.customer?.gst || ""),
`Rs. ${Number(invoice.totals.grandTotal).toLocaleString("en-IN")}`]),
  });

  doc.save("Nava_Industries_Report.pdf");
};
  const gstDataByYear: Record<number, any> = {
    [currentYear]: [
      { name: '1st Qtr', cgst: 0, sgst: 0, igst: 0 },
      { name: '2nd Qtr', cgst: 0, sgst: 0, igst: 0 },
      { name: '3rd Qtr', cgst: 0, sgst: 0, igst: 0 },
      { name: '4th Qtr', cgst: 0, sgst: 0, igst: 0 },
    ],
  };

  const currentSalesData = salesDataByYear[selectedYear] || salesDataByYear[currentYear] || [];
  const currentGstData = gstDataByYear[selectedYear] || gstDataByYear[currentYear] || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-base text-gray-500 mt-2">View detailed insights and export tax reports</p>
        </div>
        <div className="flex gap-3">
          <button 
          onClick={exportExcel}
          className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5">
            <FileSpreadsheet size={18} />
            Export Excel
          </button>
          <button
           onClick={exportPDF}
           className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5">
            <FileText size={18} />
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Sales Trend</h2>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 block p-2.5 font-medium transition-all"
            >
              <option value={currentYear.toString()}>{currentYear}</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height={288}>
              <LineChart data={currentSalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} allowDuplicatedCategory={false} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value) => `₹${value/1000}k`} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Sales']}
                />
                <Line type="monotone" dataKey="sales" stroke="#000000" strokeWidth={3} dot={{ r: 4, fill: '#000000', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GST Collection Chart */}
        <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">GST Collection by Quarter</h2>
            <button className="text-sm text-gray-900 font-medium hover:text-black transition-colors duration-200">Detailed View →</button>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height={288}>
              <BarChart data={currentGstData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} allowDuplicatedCategory={false} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value) => `₹${value/1000}k`} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number, name: string) => [`₹${value.toLocaleString('en-IN')}`, name.toUpperCase()]}
                />
                <Bar dataKey="cgst" stackId="a" fill="#3B82F6" name="CGST" radius={[0, 0, 0, 0]} />
                <Bar dataKey="sgst" stackId="a" fill="#10B981" name="SGST" radius={[0, 0, 0, 0]} />
                <Bar dataKey="igst" stackId="a" fill="#F59E0B" name="IGST" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500"></span><span className="text-xs text-gray-600">CGST</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span><span className="text-xs text-gray-600">SGST</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500"></span><span className="text-xs text-gray-600">IGST</span></div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="p-4 border-b border-gray-100 bg-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Available Reports</h2>
        </div>
        {invoices.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No reports created yet. Create invoices to generate reports.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                <div>
                  <h3 className="font-medium text-gray-900">Invoice {invoice.invoiceNo}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{invoice.customer.name} • {new Date(invoice.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200" title="Download Excel">
                      <FileSpreadsheet size={18} />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200" title="Download PDF">
                      <FileText size={18} />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200" title="View Online">
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
