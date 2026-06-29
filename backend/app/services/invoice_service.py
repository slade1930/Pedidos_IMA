# app/services/invoice_service.py
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch, mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    Image,
)
from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.graphics import renderPDF
from io import BytesIO
from datetime import datetime, timezone
from app.models.order_model import Order


class InvoiceService:

    # ─── COLORES IMA ───────────────────────────────────
    IMA_GREEN = colors.HexColor("#166534")
    IMA_LIGHT_GREEN = colors.HexColor("#dcfce7")
    IMA_GOLD = colors.HexColor("#f59e0b")
    WHITE = colors.white
    GRAY = colors.HexColor("#6b7280")
    LIGHT_GRAY = colors.HexColor("#f9fafb")

    @classmethod
    def generate_pdf(cls, order: Order) -> bytes:
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=0.75 * inch,
            leftMargin=0.75 * inch,
            topMargin=0.75 * inch,
            bottomMargin=0.75 * inch,
        )

        styles = getSampleStyleSheet()
        elements = []

        # ─── HEADER ────────────────────────────────────
        header_style = ParagraphStyle(
            "Header",
            parent=styles["Normal"],
            fontSize=22,
            textColor=cls.IMA_GREEN,
            fontName="Helvetica-Bold",
            alignment=0,
        )

        subheader_style = ParagraphStyle(
            "SubHeader",
            parent=styles["Normal"],
            fontSize=10,
            textColor=cls.GRAY,
        )

        elements.append(Paragraph("IMA SYSTEM", header_style))
        elements.append(Paragraph("Instituto de Mercadeo Agropecuario", subheader_style))
        elements.append(Paragraph("Factura Digital de Pedido", subheader_style))
        elements.append(HRFlowable(width="100%", color=cls.IMA_GREEN, thickness=2))
        elements.append(Spacer(1, 16))

        # ─── DATOS DEL PEDIDO ──────────────────────────
        info_style = ParagraphStyle(
            "Info",
            parent=styles["Normal"],
            fontSize=10,
            textColor=colors.black,
        )
        bold_style = ParagraphStyle(
            "Bold",
            parent=info_style,
            fontName="Helvetica-Bold",
        )

        elements.append(Paragraph(f"<b>Pedido:</b> {order.order_number}", info_style))
        elements.append(Paragraph(
            f"<b>Fecha:</b> {datetime.now(timezone.utc).strftime('%d de %B de %Y - %H:%M')}",
            info_style
        ))
        elements.append(Paragraph(f"<b>Estado:</b> {order.status.value.upper()}", info_style))
        elements.append(Paragraph(f"<b>Método de pago:</b> {order.payment_method.value.upper()}", info_style))
        elements.append(Spacer(1, 12))

        # ─── DATOS DEL CLIENTE ─────────────────────────
        user = getattr(order, "user", None)
        if user:
            elements.append(Paragraph("DATOS DEL CLIENTE", bold_style))
            elements.append(Paragraph(f"Nombre: {getattr(user, 'full_name', 'N/A')}", info_style))
            elements.append(Paragraph(f"Cédula: {getattr(user, 'cedula', 'N/A')}", info_style))
            elements.append(Spacer(1, 8))

        # ─── PICKUP CODE ───────────────────────────────
        if order.pickup_code:
            pickup_style = ParagraphStyle(
                "Pickup",
                parent=styles["Normal"],
                fontSize=12,
                textColor=cls.IMA_GREEN,
                fontName="Helvetica-Bold",
                alignment=0,
            )
            elements.append(Paragraph("CÓDIGO DE RETIRO", pickup_style))
            elements.append(Paragraph(
                f"<font size='24' color='#166534'><b>{order.pickup_code}</b></font>",
                info_style
            ))
            elements.append(Paragraph("Presenta este código en la feria para recoger tu pedido", subheader_style))
            elements.append(Spacer(1, 12))

        # ─── TABLA DE PRODUCTOS ────────────────────────
        table_header_style = ParagraphStyle(
            "TH",
            parent=styles["Normal"],
            fontSize=9,
            textColor=cls.WHITE,
            fontName="Helvetica-Bold",
            alignment=1,
        )
        table_cell_style = ParagraphStyle(
            "TD",
            parent=styles["Normal"],
            fontSize=9,
            textColor=colors.black,
            alignment=1,
        )

        table_data = [
            [
                Paragraph("Producto", table_header_style),
                Paragraph("Cant.", table_header_style),
                Paragraph("Precio Unit.", table_header_style),
                Paragraph("Subtotal", table_header_style),
            ]
        ]

        for item in order.items:
            table_data.append([
                Paragraph(item.product_name, table_cell_style),
                Paragraph(str(item.quantity), table_cell_style),
                Paragraph(f"${float(item.unit_price):.2f}", table_cell_style),
                Paragraph(f"${float(item.subtotal):.2f}", table_cell_style),
            ])

        # Fila de total
        table_data.append([
            Paragraph("", table_cell_style),
            Paragraph("", table_cell_style),
            Paragraph("<b>TOTAL</b>", ParagraphStyle("TH2", parent=table_header_style, textColor=cls.IMA_GREEN)),
            Paragraph(f"<b>${float(order.total_amount):.2f}</b>", ParagraphStyle("TD2", parent=table_cell_style, fontName="Helvetica-Bold")),
        ])

        col_widths = [3.25 * inch, 0.75 * inch, 1.25 * inch, 1.25 * inch]
        table = Table(table_data, colWidths=col_widths, repeatRows=1)

        table_style = TableStyle([
            # Header
            ("BACKGROUND", (0, 0), (-1, 0), cls.IMA_GREEN),
            ("TEXTCOLOR", (0, 0), (-1, 0), cls.WHITE),
            # Grid
            ("GRID", (0, 0), (-1, -2), 0.5, cls.LIGHT_GRAY),
            # Alineación
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            # Padding
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            # Filas alternas
            ("BACKGROUND", (0, 1), (-1, -2), cls.LIGHT_GRAY),
            # Total
            ("BACKGROUND", (0, -1), (-1, -1), cls.IMA_LIGHT_GREEN),
            ("LINEABOVE", (0, -1), (-1, -1), 1.5, cls.IMA_GREEN),
        ])

        table.setStyle(table_style)
        elements.append(table)
        elements.append(Spacer(1, 24))

        # ─── NOTAS ─────────────────────────────────────
        if order.notes:
            elements.append(Paragraph("<b>Notas:</b>", info_style))
            elements.append(Paragraph(order.notes, info_style))
            elements.append(Spacer(1, 8))

        # ─── FOOTER ────────────────────────────────────
        footer_style = ParagraphStyle(
            "Footer",
            parent=styles["Normal"],
            fontSize=8,
            textColor=cls.GRAY,
            alignment=1,
        )
        elements.append(HRFlowable(width="100%", color=cls.GRAY))
        elements.append(Paragraph(
            "IMA System - Instituto de Mercadeo Agropecuario - Panamá",
            footer_style
        ))
        elements.append(Paragraph(
            "Este documento es una factura digital válida.",
            footer_style
        ))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()