import { useState, useMemo, useCallback } from "react";
  import { Eye, Trash2, Search } from "lucide-react";
  import { useInvoices } from "../context/InvoiceContext";
  import { useNavigate } from "react-router";
  import type { SavedInvoice } from "../context/InvoiceContext";

  // Utility function for currency formatting
  const formatINRCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Utility function for date formatting
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  export function Invoices() {
    const { invoices, deleteInvoice } = useInvoices();
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    // Memoize filtered invoices for performance
    const filteredInvoices = useMemo(() => {
      if (!searchTerm.trim()) return invoices;

      const term = searchTerm.toLowerCase().trim();
      return invoices.filter(
        (inv) =>
          inv.invoiceNo.toLowerCase().includes(term) ||
          inv.customer.name.toLowerCase().includes(term)
      );
    }, [invoices, searchTerm]);

    const viewInvoice = useCallback((invoice: SavedInvoice) => {
      navigate('/invoice-preview', { state: { invoice } });
    }, [navigate]);

    const handleDelete = useCallback(async (id: string) => {
      if (window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
        try {
          await deleteInvoice(id);
        } catch (err) {
          // Error handling would be managed by the context or error boundary
          console.error('Failed to delete invoice:', err);
        }
      }
    }, [deleteInvoice]);

    return (
      <div className="space-y-6 h-full flex flex-col">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Invoices
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View and manage all generated invoices
            </p>
          </div>

      {/* Actions could go here - like import/export buttons */}
      <div className="flex gap-3">
        {/* Example action button */}
        <button
          className="btn-secondary px-4 py-2 rounded-lg hover:bg-gray-200/hover:bg-gray-700 transition-colors flex
  items-center gap-2"
        >
          <Search className="h-4 w-4" />
          Export
        </button>
      </div>
    </div>

    {/* Search and Filter Section */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-white">
        <div className="relative flex-1 max-w-md">
          <label htmlFor="invoice-search" className="sr-only">
            Search invoices
          </label>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            id="invoice-search"
            type="text"
            placeholder="Search by invoice number or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none
  focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>

        {/* Filter dropdown could go here */}
        <div className="relative">
          <button
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100
  transition-colors"
          >
            <span className="text-sm text-gray-600">All Statuses</span>
            <Eye className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => viewInvoice(invoice)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Eye className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{invoice.invoiceNo}</div>
                        <div className="text-sm text-gray-500">{new Date(invoice.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{invoice.customer.name}</div>
                      {invoice.customer.gst && (
                        <div className="text-gray-500 text-xs mt-0.5">
                          GST: {invoice.customer.gst}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {formatDate(invoice.date)}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {formatINRCurrency(invoice.totals.grandTotal)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50
  text-blue-700">
                      {invoice.items.length} item{invoice.items.length !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click from triggering
                          viewInvoice(invoice);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors hover:bg-blue-50"
                        title="View Invoice"
                        aria-label="View invoice"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click from triggering
                          handleDelete(invoice.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors hover:bg-red-50"
                        title="Delete Invoice"
                        aria-label="Delete invoice"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  {invoices.length === 0
                    ? (
                      <>
                        <p className="mb-3">No invoices created yet.</p>
                        <button
                          onClick={() => navigate('/create-invoice')}
                          className="btn-primary px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Create First Invoice
                        </button>
                      </>
                    )
                    : (
                      <>
                        <p className="mb-3">No invoices found matching your search.</p>
                        <button
                          onClick={() => setSearchTerm('')}
                          className="btn-secondary px-4 py-2 rounded-lg hover:bg-gray-200/hover:bg-gray-700
  transition-colors"
                        >
                          Clear Search
                        </button>
                      </>
                    )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info Section */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-sm
  text-gray-500">
        <div>
          Showing {filteredInvoices.length} of {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
        </div>
        <div className="flex gap-3">
          {/* Per page selector */}
          <div className="relative">
            <button
              className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-md hover:bg-gray-50
  transition-colors"
            >
              <span className="text-sm font-medium">10</span>
              <Eye className="h-3 w-3 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
    );
  }