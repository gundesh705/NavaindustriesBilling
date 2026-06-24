#!/usr/bin/env python3
"""
Flask backend for GST Invoice PDF generation
"""

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from datetime import date
import os
import io
import traceback
from invoice_generator import generate_invoice_pdf

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200

@app.route('/api/generate-invoice', methods=['POST'])
def generate_invoice():
    """
    Generate PDF invoice from JSON data
    
    Expected JSON:
    {
        "invoiceNo": "INV-2025-001",
        "date": "2025-06-16",
        "customer": {
            "name": "ABC Corp",
            "address": "...",
            "mobile": "...",
            "gst": "..."
        },
        "items": [
            {
                "name": "...",
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
    """
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('customer') or not data.get('items'):
            return jsonify({'error': 'Missing customer or items data'}), 400
        
        # Generate PDF
        pdf_buffer = generate_invoice_pdf(data)
        
        # Return PDF
        invoice_no = data.get('invoiceNo', 'invoice').replace('/', '-')
        filename = f"{invoice_no}.pdf"
        
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename
        )
    
    except Exception as e:
        print(f"Error generating invoice: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
