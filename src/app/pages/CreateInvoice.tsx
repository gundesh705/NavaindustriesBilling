import { useState, useMemo } from "react";
import { Plus, Trash2, Search, Calculator, FileText, Printer, Download, X, AlertCircle } from "lucide-react";
import { mockCustomers } from "../data/mock";
import { useNavigate } from "react-router";
import { useInvoices } from "../context/InvoiceContext";
import { useCustomers } from "../context/CustomerContext";
import { useProducts } from "../context/ProductContext";

interface InvoiceItem {
  id: string;
  productId: string;
  name: string;
  hsn: string;
  quantity: number;
  rate: number;
  gstPercent: number;
}

export function CreateInvoice() {
  const navigate = useNavigate();
  const { saveInvoice } = useInvoices();
  const { customers, addCustomer } = useCustomers();
  const { products: contextProducts } = useProducts();
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', mobile: '', gst: '', address: '' });

  const allCustomers = [...customers, ...mockCustomers];
  const allProducts = [...contextProducts];
  
  const generateInvoiceNumber = () => {
    return `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
  };
  
  const [invoiceNo] = useState(generateInvoiceNumber());
  const [validationError, setValidationError] = useState("");

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Math.random().toString(36).substring(7),
        productId: "",
        name: "",
        hsn: "",
        quantity: 1,
        rate: 0,
        gstPercent: 18,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleProductSelect = (id: string, productId: string) => {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
      setItems(items.map(item =>
        item.id === id
          ? { ...item, productId, name: product.name, hsn: product.hsn, rate: product.price, gstPercent: product.gst }
          : item
      ));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const totals = useMemo(() => {
    let subtotal = 0;
    let cgst = 0;
    let sgst = 0;

    items.forEach(item => {
      const amount = item.quantity * item.rate;
      subtotal += amount;
      
      const gstAmount = (amount * item.gstPercent) / 100;
      // Assuming intrastate for simplicity (CGST/SGST split)
      cgst += gstAmount / 2;
      sgst += gstAmount / 2;
    });

    return {
      subtotal,
      cgst,
      sgst,
      totalGst: cgst + sgst,
      grandTotal: subtotal + cgst + sgst
    };
  }, [items]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleGenerate = () => {
    setValidationError("");

    // Validate customer selection
    if (!selectedCustomerId) {
      setValidationError("Please select a customer to generate invoice.");
      return;
    }

    // Validate products
    if (items.length === 0) {
      setValidationError("Please add at least one product to the invoice.");
      return;
    }

    // Validate each item has a rate
    const invalidItems = items.some(item => !item.name || item.rate <= 0);
    if (invalidItems) {
      setValidationError("Please ensure all products have a valid rate.");
      return;
    }

    const selectedCustomer = allCustomers.find(c => c.id === selectedCustomerId);
    const dueDate = new Date(new Date(invoiceDate).getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const invoiceData = {
      id: Math.random().toString(36).substring(7),
      invoiceNo,
      date: invoiceDate,
      dueDate,
      customer: selectedCustomer,
      items: items.map((item) => ({
        ...item,
        amount: item.quantity * item.rate * (1 + item.gstPercent / 100)
      })),
      totals,
      createdAt: new Date().toISOString()
    };

    // Save the invoice
    saveInvoice(invoiceData);

    navigate('/invoice-preview', { state: { invoice: invoiceData } });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {validationError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">Cannot Generate Invoice</h3>
            <p className="text-sm text-red-800 mt-0.5">{validationError}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Create GST Invoice</h1>
          <p className="text-base text-gray-500 mt-2">Generate a new tax invoice for your customer</p>
        </div>
        <button
          onClick={handleGenerate}
          className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <FileText size={18} />
          Generate Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Invoice Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Details */}
          <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Invoice Number</label>
                <input 
                  type="text" 
                  disabled 
                  value={invoiceNo}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Invoice Date</label>
                <input 
                  type="date" 
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900"
                />
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Select Customer</label>
                  <button 
                    type="button" 
                    onClick={() => setShowAddCustomer(true)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus size={14} /> Add New
                  </button>
                </div>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900"
                >
                  <option value="">-- Select a Customer --</option>
                  {allCustomers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - {c.gst}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Products</h2>
              <button 
                onClick={handleAddItem}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg"
              >
                <Plus size={16} />
                Add Row
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="pb-3 font-medium w-1/3">Product</th>
                    <th className="pb-3 font-medium w-24 text-right">Qty</th>
                    <th className="pb-3 font-medium w-32 text-right">Rate (₹)</th>
                    <th className="pb-3 font-medium w-24 text-right">GST %</th>
                    <th className="pb-3 font-medium w-32 text-right">Amount (₹)</th>
                    <th className="pb-3 font-medium w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 pr-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                          placeholder="Product name"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-sm text-right"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          min="0"
                          value={item.rate}
                          onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-sm text-right"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <select
                          value={item.gstPercent}
                          onChange={(e) => updateItem(item.id, 'gstPercent', parseInt(e.target.value))}
                          className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-sm text-right"
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </td>
                      <td className="py-3 pl-2 text-right font-medium text-gray-900">
                        {((item.quantity * item.rate * (1 + item.gstPercent / 100)) || 0).toFixed(2)}
                      </td>
                      <td className="py-3 pl-2 text-right">
                        <button 
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500 text-sm">
                        No products added. Click "Add Row" to start.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6 hover:shadow-lg transition-all duration-300">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calculator size={20} className="text-blue-600" />
              Invoice Summary
            </h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>CGST</span>
                <span className="font-medium text-gray-900">{formatCurrency(totals.cgst)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>SGST</span>
                <span className="font-medium text-gray-900">{formatCurrency(totals.sgst)}</span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-900">Grand Total</span>
                  <span className="text-xl font-bold text-blue-600">{formatCurrency(totals.grandTotal)}</span>
                </div>
                <p className="text-xs text-gray-500 text-right mt-1">Total includes GST of {formatCurrency(totals.totalGst)}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes / Terms</label>
              <textarea 
                rows={3}
                placeholder="Thanks for your business..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-700"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Add New Customer</h3>
              <button 
                onClick={() => setShowAddCustomer(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer Name</label>
                <input 
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-900"
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">GST Number</label>
                <input
                  type="text"
                  value={newCustomer.gst}
                  onChange={(e) => setNewCustomer({...newCustomer, gst: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-900"
                  placeholder="e.g. 27ABCDE1234F1Z0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number</label>
                <input
                  type="tel"
                  value={newCustomer.mobile}
                  onChange={(e) => setNewCustomer({...newCustomer, mobile: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-900"
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                <textarea
                  rows={2}
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-900"
                  placeholder="Full billing address"
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
              <button 
                onClick={() => setShowAddCustomer(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newCustomer.name || !newCustomer.gst) {
                    alert("Please fill in customer name and GST number");
                    return;
                  }
                  const customer = {
                    id: `C${Date.now()}`,
                    name: newCustomer.name,
                    mobile: newCustomer.mobile,
                    gst: newCustomer.gst,
                    address: newCustomer.address
                  };
                  addCustomer(customer);
                  setSelectedCustomerId(customer.id);
                  setShowAddCustomer(false);
                  setNewCustomer({ name: '', mobile: '', gst: '', address: '' });
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
