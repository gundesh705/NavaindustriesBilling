import { useState } from "react";
import { IndianRupee, Users, Package, FileText, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { mockStats, mockRecentBills, salesDataByYear } from "../data/mock";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from "react-router";
import { useInvoices } from "../context/InvoiceContext";

export function Dashboard() {
  const currentYear = new Date().getFullYear();
const [selectedYear, setSelectedYear] = useState<number>(currentYear);  const { invoices } = useInvoices();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const currentSalesData = salesDataByYear[selectedYear] || salesDataByYear[currentYear] || [];

  const totalSales = invoices.reduce((sum, inv) => sum + inv.totals.grandTotal, 0);
  const todaySales = invoices
    .filter(inv => new Date(inv.date).toDateString() === new Date().toDateString())
    .reduce((sum, inv) => sum + inv.totals.grandTotal, 0);
  const totalCustomers = new Set(invoices.map(inv => inv.customer.id)).size;
  const totalInvoices = invoices.length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-base text-gray-500 mt-2">Overview of your business performance</p>
        </div>
        <Link
          to="/create-invoice"
          className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <FileText size={18} />
          Create Invoice
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-gray-900 shadow-sm">
              <IndianRupee size={24} />
            </div>
            {totalSales > 0 && (
              <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-full">
                <ArrowUpRight size={16} />
                {invoices.length}
              </div>
            )}
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Sales (YTD)</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(totalSales)}</h3>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-gray-900 shadow-sm">
              <IndianRupee size={24} />
            </div>
            {todaySales > 0 && (
              <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-full">
                <ArrowUpRight size={16} />
                {invoices.filter(inv => new Date(inv.date).toDateString() === new Date().toDateString()).length}
              </div>
            )}
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Today's Sales</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(todaySales)}</h3>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-gray-900 shadow-sm">
              <Users size={24} />
            </div>
            {totalCustomers > 0 && (
              <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-full">
                <ArrowUpRight size={16} />
                {totalCustomers}
              </div>
            )}
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Customers</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">{totalCustomers}</h3>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-gray-900 shadow-sm">
              <Package size={24} />
            </div>
            {totalInvoices > 0 && (
              <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-full">
                <ArrowUpRight size={16} />
                {totalInvoices}
              </div>
            )}
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Invoices</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">{totalInvoices}</h3>
          </div>
        </div>
      </div>
        {/* Recent Bills */}
        <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bills</h2>
            <Link to="/reports" className="text-sm font-medium text-gray-900 hover:text-black transition-colors duration-200">View All →</Link>
          </div>

          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
            {invoices.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No invoices created yet</p>
            ) : (
              invoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {invoice.customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-[150px]">{invoice.customer.name}</p>
                      <p className="text-xs text-gray-500">{invoice.invoiceNo} • {new Date(invoice.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(invoice.totals.grandTotal)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
  );
}
