from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (Table, TableStyle, Paragraph, Spacer, Image,
                                SimpleDocTemplate, PageBreak)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch, mm
from reportlab.graphics.barcode import code39
from django.templatetags.static import static
from django.contrib.staticfiles import finders

def generate_purchase_order_pdf(order, response):
    # Create the PDF document
    doc = SimpleDocTemplate(response, pagesize=letter, rightMargin=30, leftMargin=30, topMargin=40, bottomMargin=40)

    # Styles
    styles = getSampleStyleSheet()
    normal_style = styles['Normal']
    header_style = styles['Heading2']
    centered_style = ParagraphStyle('Centered', parent=normal_style, alignment=1)

    # Content list
    content = []

    # Header Section with Logo and Company Info
    logo_path = finders.find("logo.png")  # Path to your logo
    if logo_path:
        content.append(Image(logo_path, width=2*inch, height=1*inch))
    else:
        content.append(Paragraph("[Company Logo]", centered_style))
    content.append(Paragraph("Your Company Name", centered_style))
    content.append(Paragraph("Your Address Line 1, City, State, ZIP", centered_style))
    content.append(Paragraph("Phone: (123) 456-7890 | Email: info@yourcompany.com", centered_style))
    content.append(Spacer(1, 0.2 * inch))

    # Barcode for Purchase Order ID (Right Corner)
    barcode = code39.Standard39(str(order.purchase_order_id), barHeight=0.5*inch, stop=True)
    barcode_table = Table([
        ["", barcode]
    ], colWidths=[400, 100])  # Adjust colWidths to position barcode on the right
    barcode_table.setStyle(TableStyle([
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')
    ]))
    content.append(barcode_table)

    # Add Header Title
    content.append(Spacer(1, 0.2 * inch))
    content.append(Paragraph("Purchase Order", header_style))
    content.append(Paragraph(f"Purchase Order ID: {order.purchase_order_id}", normal_style))
    content.append(Paragraph(f"Date: {order.order_date.strftime('%B %d, %Y')}", normal_style))
    content.append(Spacer(1, 0.2 * inch))

    # Vendor and Purchase Order Details
    vendor_info = f"""
        <b>Vendor:</b> {order.vendor.company_name}<br/>
        <b>Address:</b> {order.vendor.address_line1}, {order.vendor.city}, {order.vendor.state} {order.vendor.zip_code}<br/>
        <b>Contact:</b> {order.vendor.phone_number}<br/>
    """
    order_info = f"""
        <b>Status:</b> {order.get_status_display()}<br/>
        <b>Terms:</b> {order.terms}<br/>
        <b>Payment Method:</b> {order.payment_method}<br/>
        <b>Expected Delivery Date:</b> {order.expected_date.strftime('%B %d, %Y') if order.expected_date else 'N/A'}<br/>
    """
    vendor_order_table = Table([
        [Paragraph(order_info, normal_style), Paragraph(vendor_info, normal_style)]
    ], colWidths=[250, 250])
    vendor_order_table.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')
    ]))
    content.append(vendor_order_table)
    content.append(Spacer(1, 0.5 * inch))

    # Table Header and Data
    item_desc_style = ParagraphStyle(name='ItemDescriptionStyle', fontName='Helvetica', fontSize=10, leading=12, wordWrap='LTR', alignment=0)
    data = [["Item ID", "Description", "Quantity", "Unit Cost", "Line Total"]]
    for item in order.items.all():
        data.append([
            str(item.item_id),
            Paragraph(item.item_desc, item_desc_style),
            str(item.quantity),
            f"${item.unit_cost:.2f}",
            f"${item.quantity * item.unit_cost:.2f}"
        ])

    # Define table with fixed column widths
    table = Table(data, colWidths=[50, 200, 60, 80, 80])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
    ]))
    content.append(table)

    # Summary Section
    note_style = ParagraphStyle(name='NoteStyle', fontName='Helvetica', fontSize=10, leading=12, wordWrap='LTR', alignment=0)
    summary_data = [
        ["Summary", ""],
        ["Total Quantity", order.total_quantity],
        ["Total Cost", f"${order.calculated_total_cost:.2f}"],
        ["Notes", Paragraph(order.notes, note_style) or "N/A"]
    ]
    summary_table = Table(summary_data, colWidths=[150, 300])
    summary_table.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('ALIGN', (1, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    content.append(Spacer(1, 0.5 * inch))
    content.append(summary_table)

    # Footer Section
    content.append(Spacer(1, 1 * inch))
    content.append(Paragraph("Thank you for your business!", centered_style))
    content.append(Paragraph("For any inquiries, please contact us at info@yourcompany.com.", centered_style))

    # Page Numbering
    def add_page_number(canvas, doc):
        page_num = canvas.getPageNumber()
        text = f"Page {page_num}"
        canvas.drawRightString(200 * mm, 15 * mm, text)

    # Build the PDF
    doc.build(content, onFirstPage=add_page_number, onLaterPages=add_page_number)
