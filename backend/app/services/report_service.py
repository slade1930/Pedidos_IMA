# app/services/report_service.py
import io
from datetime import datetime, timezone
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
)
from reportlab.platypus.flowables import HRFlowable
from app.models.order_model import Order
import qrcode


class ReportService:
    
    # Colores IMA
    DARK_GREEN = HexColor("#1E3A1E")
    GREEN = HexColor("#3A5F26")
    GOLD = HexColor("#FBBF24")
    DARK_BG = HexColor("#2D1A10")
    LIGHT_BG = HexColor("#F5F5F0")
    WHITE = white
    BLACK = black
    GRAY = HexColor("#666666")
    
    @classmethod
    def generate_orders_report(cls, orders: list[Order]) -> bytes:
        """Genera un PDF con el reporte de todas las órdenes"""
        buffer = io.BytesIO()
        
        # Configurar documento horizontal para mejor visualización
        doc = SimpleDocTemplate(
            buffer,
            pagesize=landscape(A4),
            leftMargin=1.5*cm,
            rightMargin=1.5*cm,
            topMargin=1.5*cm,
            bottomMargin=1.5*cm,
        )
        
        elements = []
        styles = getSampleStyleSheet()
        
        # Estilos personalizados
        title_style = ParagraphStyle(
            "Title_IMA",
            parent=styles["Title"],
            fontSize=20,
            textColor=cls.DARK_GREEN,
            fontName="Helvetica-Bold",
            spaceAfter=6,
        )
        
        subtitle_style = ParagraphStyle(
            "Subtitle_IMA",
            parent=styles["Normal"],
            fontSize=10,
            textColor=cls.GRAY,
            fontName="Helvetica",
            spaceAfter=4,
        )
        
        header_style = ParagraphStyle(
            "Header_IMA",
            parent=styles["Normal"],
            fontSize=9,
            textColor=cls.WHITE,
            fontName="Helvetica-Bold",
        )
        
        cell_style = ParagraphStyle(
            "Cell_IMA",
            parent=styles["Normal"],
            fontSize=8,
            textColor=cls.BLACK,
            fontName="Helvetica",
            leading=10,
        )
        
        # ─── TÍTULO ────────────────────────────────────
        elements.append(Paragraph("IMA SYSTEM - REPORTE DE ÓRDENES", title_style))
        elements.append(Paragraph(
            f"Generado: {datetime.now(timezone.utc).strftime('%d/%m/%Y %H:%M')} UTC | Total: {len(orders)} órdenes",
            subtitle_style
        ))
        elements.append(HRFlowable(width="100%", color=cls.GOLD, thickness=1.5))
        elements.append(Spacer(1, 0.5*cm))
        
        # ─── TABLA DE ÓRDENES ──────────────────────────
        table_data = []
        
        # Encabezados
        headers = [
            Paragraph("#", header_style),
            Paragraph("N° Orden", header_style),
            Paragraph("Cliente", header_style),
            Paragraph("Cédula", header_style),
            Paragraph("Feria", header_style),
            Paragraph("Productos", header_style),
            Paragraph("Total", header_style),
            Paragraph("Estado", header_style),
            Paragraph("Código", header_style),
        ]
        table_data.append(headers)
        
        # Datos
        for i, order in enumerate(orders, 1):
            # Datos del cliente
            customer_name = getattr(order.user, "full_name", "N/A") if order.user else "N/A"
            customer_cedula = getattr(order.user, "cedula", "N/A") if order.user else "N/A"
            
            # Feria
            fair_name = getattr(order.fair, "name", "N/A") if order.fair else "N/A"
            
            # Productos
            products_str = ", ".join([
                f"{item.product_name} ({item.quantity})"
                for item in order.items
            ]) if order.items else "Sin productos"
            
            # Estado formateado
            status_map = {
                "pending": "Pendiente",
                "confirmed": "Confirmada",
                "ready": "Lista",
                "delivered": "Entregada",
                "cancelled": "Cancelada",
                "expired": "Expirada",
            }
            status_label = status_map.get(str(order.status), str(order.status))
            
            row = [
                Paragraph(str(i), cell_style),
                Paragraph(order.order_number, cell_style),
                Paragraph(customer_name, cell_style),
                Paragraph(customer_cedula, cell_style),
                Paragraph(fair_name, cell_style),
                Paragraph(products_str, cell_style),
                Paragraph(f"${order.total_amount:,.2f}" if order.total_amount else "$0.00", cell_style),
                Paragraph(status_label, cell_style),
                Paragraph(order.pickup_code or "N/A", cell_style),
            ]
            table_data.append(row)
        
        # Crear tabla
        col_widths = [1.2*cm, 3*cm, 4*cm, 3*cm, 3.5*cm, 7*cm, 2.5*cm, 2.5*cm, 2.5*cm]
        
        table = Table(table_data, colWidths=col_widths, repeatRows=1)
        
        # Estilo de tabla
        table_style = TableStyle([
            # Encabezado
            ("BACKGROUND", (0, 0), (-1, 0), cls.DARK_GREEN),
            ("TEXTCOLOR", (0, 0), (-1, 0), cls.WHITE),
            ("ALIGN", (0, 0), (-1, 0), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 9),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
            ("TOPPADDING", (0, 0), (-1, 0), 10),
            
            # Filas de datos
            ("BACKGROUND", (0, 1), (-1, -1), cls.WHITE),
            ("TEXTCOLOR", (0, 1), (-1, -1), cls.BLACK),
            ("ALIGN", (0, 0), (0, -1), "CENTER"),  # Columna # centrada
            ("ALIGN", (6, 1), (6, -1), "RIGHT"),   # Total a la derecha
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 1), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 1), (-1, -1), 8),
            ("TOPPADDING", (0, 1), (-1, -1), 8),
            
            # Líneas
            ("GRID", (0, 0), (-1, -1), 0.5, cls.GRAY),
            ("LINEBELOW", (0, 0), (-1, 0), 1.5, cls.GOLD),
            
            # Alternar colores de fila
            *[
                ("BACKGROUND", (0, i), (-1, i), cls.LIGHT_BG)
                for i in range(2, len(table_data), 2)
            ],
        ])
        
        table.setStyle(table_style)
        elements.append(table)
        
        # ─── PIE DE PÁGINA ─────────────────────────────
        elements.append(Spacer(1, 0.5*cm))
        elements.append(HRFlowable(width="100%", color=cls.GOLD, thickness=1))
        elements.append(Spacer(1, 0.2*cm))
        elements.append(Paragraph(
            f"IMA System - Mercadeo Agropecuario | Reporte generado el {datetime.now().strftime('%d/%m/%Y a las %H:%M')}",
            subtitle_style
        ))
        
        # Generar PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()