# Sri Nava Industries Invoice PDF Backend

This Flask backend generates professional GST invoices in PDF format using the invoice data from the React frontend.

## Setup

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the Backend Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /health
```

### Generate Invoice PDF
```
POST /api/generate-invoice
Content-Type: application/json

{
  "invoiceNo": "INV-2025-001",
  "date": "2025-06-16",
  "customer": {
    "name": "ABC Corp",
    "address": "123 Main St, City",
    "mobile": "9876543210",
    "gst": "33AABCA1234B1ZX"
  },
  "items": [
    {
      "name": "Item 1",
      "quantity": 1,
      "rate": 100,
      "gstPercent": 9,
      "amount": 109
    }
  ],
  "totals": {
    "subtotal": 100,
    "cgst": 4.5,
    "sgst": 4.5,
    "grandTotal": 109
  }
}
```

Returns: PDF file download

## Features

- ✅ Professional PDF layout with brand styling
- ✅ Proper GST calculations (CGST, SGST)
- ✅ Page breaks and signatures at bottom
- ✅ Amount in words conversion
- ✅ Bank details section
- ✅ Declaration section
- ✅ Company header and footer on all pages

## Troubleshooting

**"Connection refused" error?**
- Make sure the backend is running on port 5000
- Check firewall/antivirus isn't blocking port 5000

**PDF generation fails?**
- Check that reportlab is installed: `pip install reportlab`
- Check console for error messages

**CORS errors?**
- Backend includes Flask-CORS for cross-origin requests
- Make sure React frontend is calling `http://localhost:5000`
