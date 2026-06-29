# app/utils/pdf_generator.py
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)
from io import BytesIO
from datetime import datetime, timezone
from app.utils.helpers import format_currency


def generate_invoice_pdf(order_data: dict) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=inch,
        leftMargin=inch,
        topMargin=inch,
        bottomMargin=inch,
    )

    styles = getSampleStyleSheet()
    elements = []

    # Header
    title_style = ParagraphStyle(
        "Title",
        parent=styles["Title"],
        fontSize=20,
        textColor=colors.HexColor("#1a5276"),
    )
    elements.append(Paragraph("Instituto de Mercadeo Agropecuario", title_style))
    elements.append(Paragraph("Factura Digital", styles["Heading2"]))
    elements.append(HRFlowable(width="100%", color=colors.HexColor("#1a5276")))
    elements.append(Spacer(1, 12))

    # Info del pedido
    elements.append(
        Paragraph(f"N° Pedido: {order_data['order_number']}", styles["Normal"])
    )
    elements.append(
        Paragraph(
            f"Fecha: {datetime.now(timezone.utc).strftime('%d/%m/%Y %H:%M')}",
            styles["Normal"],
        )
    )
    elements.append(Paragraph(f"Estado: {order_data['status']}", styles["Normal"]))
    elements.append(
        Paragraph(f"Método de pago: {order_data['payment_method']}", styles["Normal"])
    )
    elements.append(Spacer(1, 12))

    # Info del cliente
    elements.append(Paragraph("Datos del Cliente", styles["Heading3"]))
    elements.append(Paragraph(f"Nombre: {order_data['user_name']}", styles["Normal"]))
    elements.append(Paragraph(f"Cédula: {order_data['user_cedula']}", styles["Normal"]))
    elements.append(Spacer(1, 12))

    # Tabla de productos
    table_data = [["Producto", "Cant.", "Precio Unit.", "Subtotal"]]
    for item in order_data["items"]:
        table_data.append(
            [
                item["product_name"],
                str(item["quantity"]),
                format_currency(item["unit_price"]),
                format_currency(item["subtotal"]),
            ]
        )

    table_data.append(["", "", "TOTAL", format_currency(order_data["total_amount"])])

    table = Table(table_data, colWidths=[3 * inch, inch, 1.5 * inch, 1.5 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a5276")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("ALIGN", (1, 0), (-1, -1), "CENTER"),
                ("GRID", (0, 0), (-1, -2), 0.5, colors.grey),
                ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
                ("LINEABOVE", (0, -1), (-1, -1), 1, colors.black),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -2),
                    [colors.white, colors.HexColor("#eaf4fb")],
                ),
            ]
        )
    )

    elements.append(table)
    elements.append(Spacer(1, 24))

    # Footer
    elements.append(HRFlowable(width="100%", color=colors.grey))
    elements.append(
        Paragraph(
            "Este documento es una factura digital válida del IMA - Panamá",
            styles["Normal"],
        )
    )

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
