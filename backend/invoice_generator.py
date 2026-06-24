"""
GST Invoice PDF Generator - Modified for Flask
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph,
    Spacer, HRFlowable, PageBreak, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus.flowables import Flowable
import io
from datetime import datetime

# Brand colors
RED       = colors.HexColor('#C0392B')
DARK_RED  = colors.HexColor('#922B21')
LIGHT_GRAY= colors.HexColor('#F2F3F4')
DARK_GRAY = colors.HexColor('#2C3E50')
MID_GRAY  = colors.HexColor('#566573')
BORDER    = colors.HexColor('#D5D8DC')
WHITE     = colors.white

PAGE_W, PAGE_H = A4
MARGIN        = 15 * mm
CONTENT_W     = PAGE_W - 2 * MARGIN


class SectionLabel(Flowable):
    def __init__(self, text, width):
        super().__init__()
        self.text  = text
        self.width = width
        self.height = 14

    def draw(self):
        c = self.canv
        c.setFillColor(RED)
        c.rect(0, 0, self.width, self.height, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 7.5)
        c.drawString(6, 3.5, self.text.upper())


def make_styles():
    base = getSampleStyleSheet()
    def s(name, **kw):
        kw.setdefault('fontName', 'Calibri')
        kw.setdefault('textColor', DARK_GRAY)
        return ParagraphStyle(name, parent=base['Normal'], **kw)

    return {
        'co_name':   s('co_name',  fontName='Calibri', fontSize=15, textColor=RED, spaceAfter=2),
        'co_info':   s('co_info',  fontSize=7.5, textColor=DARK_GRAY, leading=11),
        'inv_title': s('inv_title', fontName='Calibri', fontSize=13, textColor=WHITE, alignment=TA_CENTER),
        'label':     s('label',    fontSize=7.5, textColor=MID_GRAY, spaceAfter=1),
        'value':     s('value',    fontName='Calibri', fontSize=8.5, textColor=DARK_GRAY, spaceAfter=2),
        'cell':      s('cell',     fontSize=7.5, textColor=DARK_GRAY, leading=10),
        'cell_bold': s('cell_bold', fontName='Calibri', fontSize=7.5, textColor=DARK_GRAY, leading=10),
        'tax_label': s('tax_label', fontSize=7.5, textColor=MID_GRAY, alignment=TA_RIGHT),
        'tax_value': s('tax_value', fontName='Calibri', fontSize=8.5, textColor=DARK_GRAY, alignment=TA_RIGHT),
        'total_big': s('total_big', fontName='Calibri', fontSize=11, textColor=WHITE, alignment=TA_RIGHT),
        'decl':      s('decl',     fontSize=7,  textColor=MID_GRAY,  leading=10),
        'sig_label': s('sig_label', fontSize=7.5, textColor=MID_GRAY, alignment=TA_CENTER),
        'footer':    s('footer',   fontSize=6.5, textColor=MID_GRAY, alignment=TA_CENTER),
    }


def num_to_words(n):
    """Convert number to words"""
    ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
            'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen',
            'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
    tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
            'Sixty', 'Seventy', 'Eighty', 'Ninety']

    def below_hundred(x):
        if x < 20: return ones[x]
        return tens[x // 10] + (' ' + ones[x % 10] if x % 10 else '')

    def below_thousand(x):
        if x < 100: return below_hundred(x)
        return ones[x // 100] + ' Hundred' + (' ' + below_hundred(x % 100) if x % 100 else '')

    if n == 0: return 'Zero'
    parts = []
    cr = n // 10_000_000; n %= 10_000_000
    if cr: parts.append(below_thousand(cr) + ' Crore')
    lac = n // 100_000;   n %= 100_000
    if lac: parts.append(below_thousand(lac) + ' Lakh')
    th  = n // 1_000;     n %= 1_000
    if th:  parts.append(below_thousand(th) + ' Thousand')
    if n:   parts.append(below_thousand(n))
    return ' '.join(parts)


def page_decorator(canv, doc):
    canv.saveState()
    canv.setFillColor(RED)
    canv.rect(0, PAGE_H - 6*mm, PAGE_W, 6*mm, fill=1, stroke=0)
    canv.setFillColor(WHITE)
    canv.setFont('Calibri', 7)
    canv.drawCentredString(PAGE_W/2, PAGE_H - 4*mm, "SRI NAVA INDUSTRIES")
    
    canv.setFillColor(LIGHT_GRAY)
    canv.rect(0, 0, PAGE_W, 8*mm, fill=1, stroke=0)
    canv.setFillColor(MID_GRAY)
    canv.setFont('Calibri', 6.5)
    canv.drawCentredString(PAGE_W/2, 2.5*mm,
        "1, Harbour Colony, 2nd Main Rd, Kodungaiyur, Chennai-600118  |  "
        "Ph: 9345858195  |  srinavaindustries@gmail.com")
    canv.drawRightString(PAGE_W - MARGIN, 2.5*mm, f"Page {doc.page}")
    canv.restoreState()


def generate_invoice_pdf(invoice_data):
    """Generate invoice PDF and return as BytesIO buffer"""
    styles = make_styles()
    
    # Create buffer
    buffer = io.BytesIO()
    
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=12*mm, bottomMargin=12*mm,
        title=f"Invoice – {invoice_data.get('invoiceNo', '')}",
        author="Sri Nava Industries",
    )

    # Extract data
    customer = invoice_data.get('customer', {})
    items = invoice_data.get('items', [])
    totals = invoice_data.get('totals', {})
    invoice_no = invoice_data.get('invoiceNo', 'N/A')
    invoice_date = invoice_data.get('date', '')
    
    # Parse date
    try:
        if invoice_date:
            date_obj = datetime.fromisoformat(invoice_date)
            formatted_date = date_obj.strftime('%d %b %Y')
        else:
            formatted_date = 'N/A'
    except:
        formatted_date = invoice_date or 'N/A'

    # Build story
    story = []
    
    SP = lambda h: Spacer(1, h*mm)

    # Header
    header_data = [[
        Paragraph("SRI NAVA INDUSTRIES", styles['co_name']),
        Paragraph("Tax Invoice", ParagraphStyle('inv', fontName='Calibri', fontSize=14, 
                  textColor=RED, alignment=TA_CENTER))
    ]]
    header_tbl = Table(header_data, colWidths=[CONTENT_W*0.65, CONTENT_W*0.35])
    header_tbl.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(header_tbl)
    story.append(SP(2))
    story.append(HRFlowable(width='100%', thickness=1, color=RED, spaceAfter=2))

    # Invoice info
    info_data = [[
        Paragraph("Invoice No:", styles['label']),
        Paragraph(invoice_no, styles['value']),
        Paragraph("Date:", styles['label']),
        Paragraph(formatted_date, styles['value']),
        Paragraph("GSTIN:", styles['label']),
        Paragraph("33AFHPB5508G2ZW", styles['value']),
    ]]
    info_tbl = Table(info_data, colWidths=[CONTENT_W/6]*6)
    info_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), LIGHT_GRAY),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(info_tbl)
    story.append(SP(2))

    # Bill To
    story.append(SectionLabel("Bill To", CONTENT_W))
    story.append(SP(1))
    bill_data = [[
        Paragraph(f"<b>Name:</b> {customer.get('name', 'N/A')}", styles['cell']),
        Paragraph(f"<b>Address:</b> {customer.get('address', 'N/A')}", styles['cell']),
        Paragraph(f"<b>Phone:</b> {customer.get('mobile', 'N/A')}", styles['cell']),
        Paragraph(f"<b>GSTIN:</b> {customer.get('gst', 'N/A')}", styles['cell']),
    ]]
    bill_tbl = Table(bill_data, colWidths=[CONTENT_W])
    bill_tbl.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 0.5, BORDER),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(bill_tbl)
    story.append(SP(2))

    # Products Table
    story.append(SectionLabel("Items", CONTENT_W))
    story.append(SP(1))
    
    items_data = [[
        Paragraph("#", styles['cell_bold']),
        Paragraph("Description", styles['cell_bold']),
        Paragraph("Qty", styles['cell_bold']),
        Paragraph("Rate", styles['cell_bold']),
        Paragraph("GST %", styles['cell_bold']),
        Paragraph("Amount", styles['cell_bold']),
    ]]
    
    for i, item in enumerate(items, 1):
        items_data.append([
            Paragraph(str(i), styles['cell']),
            Paragraph(item.get('name', ''), styles['cell']),
            Paragraph(str(item.get('quantity', 0)), styles['cell']),
            Paragraph(f"{item.get('rate', 0):,.2f}", styles['cell']),
            Paragraph(str(item.get('gstPercent', 0)), styles['cell']),
            Paragraph(f"{item.get('amount', 0):,.2f}", styles['cell']),
        ])
    
    items_tbl = Table(items_data, colWidths=[CONTENT_W/6]*6, repeatRows=1)
    items_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), DARK_GRAY),
        ('TEXTCOLOR', (0,0), (-1,0), WHITE),
        ('FONTNAME', (0,0), (-1,0), 'Calibri'),
        ('FONTSIZE', (0,0), (-1,0), 7),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.25, BORDER),
        ('LEFTPADDING', (0,0), (-1,-1), 3),
        ('RIGHTPADDING', (0,0), (-1,-1), 3),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(items_tbl)
    story.append(SP(2))

    # Totals
    story.append(SectionLabel("Totals", CONTENT_W))
    story.append(SP(1))
    
    grand_total = totals.get('grandTotal', 0)
    words = num_to_words(int(grand_total))
    
    totals_data = [[
        Paragraph("Subtotal:", styles['label']),
        Paragraph(f"₹{totals.get('subtotal', 0):,.2f}", styles['value']),
        Paragraph("CGST (9%):", styles['label']),
        Paragraph(f"₹{totals.get('cgst', 0):,.2f}", styles['value']),
    ],[
        Paragraph("SGST (9%):", styles['label']),
        Paragraph(f"₹{totals.get('sgst', 0):,.2f}", styles['value']),
        Paragraph("Grand Total:", ParagraphStyle('gt', fontName='Calibri', fontSize=10,
                  textColor=RED, spaceAfter=2)),
        Paragraph(f"₹{grand_total:,.2f}", ParagraphStyle('gt', fontName='Calibri', fontSize=11,
                  textColor=RED, spaceAfter=2)),
    ]]
    totals_tbl = Table(totals_data, colWidths=[CONTENT_W/2]*2)
    totals_tbl.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 0.5, BORDER),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(totals_tbl)
    story.append(SP(1))
    story.append(Paragraph(f"<b>Amount in words:</b> {words} Only", styles['cell']))
    story.append(SP(3))

    # Declaration
    story.append(SectionLabel("Declaration", CONTENT_W))
    story.append(SP(1))
    story.append(Paragraph(
        "We hereby declare that the particulars given above are true and correct. "
        "The goods/services mentioned in this invoice have been supplied as specified, "
        "and the amount charged is in accordance with the agreed terms and conditions.",
        styles['decl']
    ))
    story.append(SP(2))

    # Spacer to push signatures to bottom
    story.append(Spacer(1, 20*mm))

    # Signatures
    story.append(SectionLabel("Signatures", CONTENT_W))
    story.append(SP(1))
    
    sig_data = [[
        Paragraph("Customer Signature", styles['sig_label']),
        Paragraph("For Sri Nava Industries", styles['sig_label']),
    ],[
        Spacer(1, 20*mm),
        Spacer(1, 20*mm),
    ],[
        Paragraph(customer.get('name', ''), styles['sig_label']),
        Paragraph("Authorized Signatory", styles['sig_label']),
    ]]
    sig_tbl = Table(sig_data, colWidths=[CONTENT_W/2, CONTENT_W/2])
    sig_tbl.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 0.5, BORDER),
        ('LINEBETWEEN', (0,0), (0,-1), 0.5, BORDER),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(sig_tbl)

    # Build PDF
    doc.build(story, onFirstPage=page_decorator, onLaterPages=page_decorator)
    buffer.seek(0)
    
    return buffer
