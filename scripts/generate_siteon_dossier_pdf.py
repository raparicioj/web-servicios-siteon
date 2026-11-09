# -*- coding: utf-8 -*-
import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable, PageBreak, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and draw total page count and professional header/footer.
    """
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_elements(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_elements(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Skip header and footer on Page 1 (Cover Page)
        if self._pageNumber > 1:
            # Header
            self.setStrokeColor(colors.HexColor("#0284c7"))
            self.setLineWidth(1)
            self.line(40, letter[1] - 35, letter[0] - 40, letter[1] - 35)

            self.drawString(40, letter[1] - 30, "SITE ON TECNOLOGÍA — DOSSIER CORPORATIVO & PROPUESTA DE VALOR")
            self.drawRightString(letter[0] - 40, letter[1] - 30, "SOPORTE TI & INFRAESTRUCTURA")

            # Footer
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.8)
            self.line(40, 42, letter[0] - 40, 42)

            self.drawString(40, 30, "Site On Tecnología SpA • Viña del Mar, Chile • www.siteon.cl • contacto@siteon.cl")
            page_text = f"Página {self._pageNumber} de {page_count}"
            self.drawRightString(letter[0] - 40, 30, page_text)

        self.restoreState()

def build_pdf(output_path, logo_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=48,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()

    # Color Palette
    PRIMARY = colors.HexColor("#0d2638")       # Deep Navy
    SECONDARY = colors.HexColor("#0284c7")     # Corporate Blue
    ACCENT_TEAL = colors.HexColor("#0d9488")   # Teal
    TEXT_DARK = colors.HexColor("#0f172a")     # Slate 900
    TEXT_MUTED = colors.HexColor("#475569")    # Slate 600
    BG_LIGHT = colors.HexColor("#f8fafc")      # Slate 50
    BORDER_LIGHT = colors.HexColor("#e2e8f0")  # Slate 200

    # Custom Typography Styles
    title_cover = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=PRIMARY
    )
    subtitle_cover = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=SECONDARY
    )
    slogan_cover = ParagraphStyle(
        'CoverSlogan',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=10,
        leading=15,
        textColor=TEXT_MUTED
    )
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=17,
        leading=22,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=8
    )
    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=SECONDARY,
        spaceBefore=10,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=TEXT_DARK
    )
    body_bold = ParagraphStyle(
        'Body_Bold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=TEXT_DARK,
        leftIndent=12,
        spaceAfter=3
    )
    cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=TEXT_DARK
    )
    cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=PRIMARY
    )
    cell_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=colors.white
    )

    story = []

    # =========================================================================
    # PÁGINA 1: PORTADA EJECUTIVA & IDENTIDAD CORPORATIVA
    # =========================================================================
    story.append(Spacer(1, 20))

    if os.path.exists(logo_path):
        img = Image(logo_path, width=180, height=55)
        img.hAlign = 'LEFT'
        story.append(img)
    story.append(Spacer(1, 25))

    story.append(Paragraph("DOSSIER CORPORATIVO Y PORTAFOLIO DE SOLUCIONES TI", subtitle_cover))
    story.append(Spacer(1, 6))
    story.append(Paragraph("Tu socio tecnológico: continuidad operativa, infraestructura y soporte para empresas", title_cover))
    story.append(Spacer(1, 10))
    story.append(Paragraph('"Transformamos tecnología en soluciones que impulsan tu negocio"', slogan_cover))
    story.append(Spacer(1, 20))

    # Tarjeta de Datos de la Empresa
    company_data = [
        [Paragraph("<b>Razón Social:</b>", cell_bold), Paragraph("Site On Tecnología SpA", cell_style),
         Paragraph("<b>Sitio Web:</b>", cell_bold), Paragraph("https://www.siteon.cl", cell_style)],
        [Paragraph("<b>Director de Tecnología:</b>", cell_bold), Paragraph("Rodrigo Aparicio", cell_style),
         Paragraph("<b>Correo Comercial:</b>", cell_bold), Paragraph("contacto@siteon.cl", cell_style)],
        [Paragraph("<b>Ubicación Central:</b>", cell_bold), Paragraph("Viña del Mar, Región de Valparaíso, Chile", cell_style),
         Paragraph("<b>WhatsApp Comercial:</b>", cell_bold), Paragraph("+56 9 5832 4650", cell_style)],
        [Paragraph("<b>Cobertura:</b>", cell_bold), Paragraph("Presencial en V Región • Remoto en todo Chile", cell_style),
         Paragraph("<b>Horario de Atención:</b>", cell_bold), Paragraph("Lun a Vie 09:00 a 18:30 hrs", cell_style)]
    ]
    t_company = Table(company_data, colWidths=[110, 160, 105, 155])
    t_company.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_LIGHT),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_company)
    story.append(Spacer(1, 24))

    # Quiénes Somos & Propuesta de Valor
    story.append(Paragraph("1. Quiénes Somos y Enfoque de Negocio", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=SECONDARY, spaceBefore=2, spaceAfter=10))

    story.append(Paragraph(
        "<b>Site On Tecnología</b> es una empresa chilena especializada en soporte informático empresarial, continuidad operativa, redes, infraestructura híbrida y soluciones de optimización tecnológica. Nacemos con el propósito de convertirnos en el <b>departamento TI externo de confianza</b> para pymes, estudios profesionales y empresas en crecimiento que no pueden permitir que una falla informática detenga sus operaciones o ventas.",
        body_style
    ))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "A diferencia del soporte técnico tradicional que reacciona tarde cuando el problema ya ocurrió, en Site On trabajamos bajo un modelo de <b>prevención proactiva</b>: monitoreo continuo, respaldos automáticos verificados, mantenciones periódicas y tarifas mensuales transparentes pactadas en UF sin costos sorpresa.",
        body_style
    ))
    story.append(Spacer(1, 14))

    # Pilares Fundamentales
    pilares = [
        [Paragraph("<b>Atención Humana y Rápida</b>", cell_bold), Paragraph("<b>Continuidad Operativa 99.9%</b>", cell_bold), Paragraph("<b>Previsibilidad Financiera en UF</b>", cell_bold)],
        [Paragraph("Hablas directo con especialistas que explican en simple sin tecnicismos confusos, con respuesta a urgencias en menos de 45 minutos.", cell_style),
         Paragraph("Mantenimiento preventivo, antivirus centralizado y respaldos probados para evitar pérdidas de facturación e información.", cell_style),
         Paragraph("Planes claros con diagnósticos iniciales gratuitos y sin cobros adicionales imprevistos.", cell_style)]
    ]
    t_pilares = Table(pilares, colWidths=[175, 180, 175])
    t_pilares.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f0fdfa")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#99f6e4")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#ccfbf1")),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(t_pilares)

    # =========================================================================
    # PÁGINA 2: ESTRUCTURA DE PLANES DE CONTINUIDAD TI (EN UF)
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("2. Estructura Oficial de Planes de Soporte TI", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=SECONDARY, spaceBefore=2, spaceAfter=12))

    story.append(Paragraph(
        "Nuestros planes mensuales están diseñados para adaptarse a la madurez tecnológica de cada empresa. Todos los valores corresponden a <b>referencias comerciales netas más IVA (19%)</b> facturadas mensualmente en UF.",
        body_style
    ))
    story.append(Spacer(1, 12))

    # Tabla de Planes
    planes_headers = [
        [Paragraph("Plan Comercial", cell_header),
         Paragraph("Tarifa Mensual", cell_header),
         Paragraph("Cobertura Base", cell_header),
         Paragraph("Modalidad Soporte", cell_header),
         Paragraph("Entregables Principales", cell_header)]
    ]
    planes_data = [
        [
            Paragraph("<b>SITE ON START</b><br/><font color='#0284c7'>Equipos Pequeños</font>", cell_style),
            Paragraph("<b>3,5 UF</b><br/><font color='#64748b'>Ref: $144.500 CLP*</font>", cell_style),
            Paragraph("Hasta 3 usuarios<br/>3 computadores", cell_style),
            Paragraph("100% Remoto en horario hábil", cell_style),
            Paragraph("&bull; Diagnóstico inicial gratis<br/>&bull; Hasta 3 solicitudes/mes<br/>&bull; Mantención preventiva básica<br/>&bull; Gestión Windows y correo", cell_style)
        ],
        [
            Paragraph("<b>SITE ON BUSINESS</b><br/><font color='#0284c7'>Pymes en Crecimiento</font>", cell_style),
            Paragraph("<b>6,5 UF</b><br/><font color='#64748b'>Ref: $268.400 CLP*</font>", cell_style),
            Paragraph("Hasta 6 usuarios<br/>6 computadores", cell_style),
            Paragraph("Remoto prioritario + 1 visita trimestral terreno", cell_style),
            Paragraph("&bull; Todo lo de Start<br/>&bull; Admin Microsoft 365 / Google<br/>&bull; Mantención preventiva mensual<br/>&bull; Gestión usuarios y permisos<br/>&bull; Reporte mensual de servicio", cell_style)
        ],
        [
            Paragraph("<b>SITE ON BUSINESS PRO</b><br/><font color='#0d9488'><b>★ RECOMENDADO</b></font>", cell_style),
            Paragraph("<b>10,5 UF</b><br/><font color='#64748b'>Ref: $433.500 CLP*</font>", cell_style),
            Paragraph("Hasta 12 usuarios<br/>12 computadores<br/>1 servidor base", cell_style),
            Paragraph("Remoto prioritario + 1 visita mensual terreno", cell_style),
            Paragraph("&bull; Todo lo de Business<br/>&bull; Administración de red y Wi-Fi<br/>&bull; Monitoreo de equipos acordados<br/>&bull; Gestión de respaldos existentes<br/>&bull; Administración de servidores<br/>&bull; SLA prioritario e informe mensual", cell_style)
        ],
        [
            Paragraph("<b>SITE ON ENTERPRISE</b><br/><font color='#0284c7'>Corporativo / Sedes</font>", cell_style),
            Paragraph("<b>Desde 12 UF</b><br/><font color='#64748b'>Ref: $495.500 CLP*</font>", cell_style),
            Paragraph("Hasta 15+ usuarios<br/>Múltiples sedes", cell_style),
            Paragraph("SLA personalizado + terreno flexible", cell_style),
            Paragraph("&bull; Administración integral de infra<br/>&bull; Windows Server y Linux<br/>&bull; Cloud e infra híbrida<br/>&bull; Seguridad y continuidad total<br/>&bull; Consultoría TI mensual", cell_style)
        ]
    ]

    t_planes = Table(planes_headers + planes_data, colWidths=[105, 80, 85, 110, 150])
    t_planes.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('ALIGN', (0, 0), (-1, 0), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('TOPPADDING', (0, 0), (-1, 0), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        # Highlight Recommended Row (Row 3)
        ('BACKGROUND', (0, 3), (-1, 3), colors.HexColor("#f0fdfa")),
    ]))
    story.append(t_planes)
    story.append(Spacer(1, 10))
    story.append(Paragraph("<font size='7.5' color='#64748b'>* Valores en pesos chilenos son netos referenciales calculados a tasa UF de $41.290 CLP. Las condiciones contractuales se estipulan en UF más IVA.</font>", body_style))
    story.append(Spacer(1, 14))

    # Reglas Comerciales y Adicionales
    story.append(Paragraph("3. Reglas Comerciales y Tarifas de Adicionales", h2_style))
    addons_data = [
        [Paragraph("<b>Servicio / Adicional</b>", cell_header), Paragraph("<b>Tarifa Mensual</b>", cell_header), Paragraph("<b>Alcance y Observaciones</b>", cell_header)],
        [Paragraph("Usuario adicional", cell_style), Paragraph("0,5 UF / mes", cell_style), Paragraph("Soporte remoto directo y configuración de puesto de trabajo.", cell_style)],
        [Paragraph("Computador adicional", cell_style), Paragraph("0,2 UF / mes", cell_style), Paragraph("Mantención preventiva, antivirus y optimización de endpoint.", cell_style)],
        [Paragraph("Servidor administrado adicional", cell_style), Paragraph("Desde 2,0 UF / mes", cell_style), Paragraph("Windows Server / Linux: parches, usuarios, roles y salud de discos.", cell_style)],
        [Paragraph("Monitoreo avanzado proactivo", cell_style), Paragraph("Desde 1,5 UF / mes", cell_style), Paragraph("Alertas tempranas de capacidad, CPU, RAM y servicios caídos.", cell_style)],
        [Paragraph("Visita extraordinaria en terreno", cell_style), Paragraph("Desde 1,0 UF / visita", cell_style), Paragraph("Dentro de la provincia de Valparaíso (otras comunas según viático).", cell_style)],
        [Paragraph("Gestión Cloud & Respaldos", cell_style), Paragraph("Desde 1,5 UF / mes", cell_style), Paragraph("Políticas de retención y pruebas de restauración periódica.", cell_style)],
        [Paragraph("Automatización e IA aplicada", cell_style), Paragraph("Desde 2,5 UF / mes", cell_style), Paragraph("Flujos automáticos, bots de atención y captura CRM.", cell_style)],
    ]
    t_addons = Table(addons_data, colWidths=[150, 100, 280])
    t_addons.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_addons)

    # =========================================================================
    # PÁGINA 3: CATÁLOGO INTEGRAL DE SERVICIOS
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("4. Portafolio de Servicios y Capacidades Técnicas", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=SECONDARY, spaceBefore=2, spaceAfter=12))

    servicios_principales = [
        ("Soporte Técnico e Informático para Empresas (On-Site y Remoto)",
         "Operación & Soporte TI",
         "Asistencia inmediata a usuarios ante caídas de internet, fallas de Windows/macOS, impresoras, configuración de correo y mantenimiento preventivo mensual para evitar que los problemas vuelvan a ocurrir. Cobertura remota a nivel nacional y visitas presenciales en terreno en Viña del Mar y la V Región."),

        ("Infraestructura TI, Redes Empresariales y Cableado Estructurado",
         "Infraestructura & Redes",
         "Diseño y despliegue de redes Wi-Fi de alta densidad (UniFi Ubiquiti, Mikrotik), segmentación de red con VLANs, seguridad perimetral con Firewalls, enlaces seguros VPN para teletrabajo y ordenamiento de racks corporativos."),

        ("Administración de Servidores Windows Server & Linux",
         "Servidores & Almacenamiento",
         "Gestión centralizada de identidades en Active Directory, control de permisos en carpetas compartidas, políticas de seguridad GPO, actualización de parches, auditoría de eventos y monitoreo de almacenamiento local o virtualizado."),

        ("Cloud Empresarial, Microsoft 365 & Google Workspace",
         "Cloud & Productividad",
         "Migración segura de correo corporativo a Microsoft 365 o Google Workspace, configuración de políticas antispam (SPF, DKIM, DMARC), almacenamiento seguro en SharePoint / Google Drive y respaldos automáticos en la nube."),

        ("Desarrollo Web Comercial, Portales y Sistemas a Medida",
         "Software & Web",
         "Construcción de sitios web corporativos rápidos, modernos y optimizados para Google (SEO). Desarrollo de aplicaciones web, portales de clientes y paneles administrativos conectados a bases de datos relacionales."),

        ("Automatización de Procesos con IA & Captación CRM",
         "Automatización & Negocio",
         "Implementación de embudos de captación automática de clientes (CRM integrado), flujos inteligentes de trabajo que eliminan tareas repetitivas en Excel y asistentes de atención integrados con WhatsApp empresarial."),

        ("Monitoreo Proactivo & Observabilidad Empresarial (Dynatrace / Datadog)",
         "Observabilidad & FinOps",
         "Supervisión continua 24/7 de plataformas críticas, servidores y servicios en la nube con alertas tempranas ante anomalías, dashboards ejecutivos y optimización de costos de licenciamiento (FinOps).")
    ]

    for title, cat, desc in servicios_principales:
        story.append(Paragraph(f"<b>{title}</b> &nbsp;|&nbsp; <font color='#0284c7'><b>{cat}</b></font>", h2_style))
        story.append(Paragraph(desc, bullet_style))
        story.append(Spacer(1, 4))

    story.append(Spacer(1, 10))
    story.append(Paragraph("5. Exclusiones Claras y Alcance Ético", h2_style))
    story.append(Paragraph(
        "Para garantizar una relación transparente y sin ambigüedades, los planes de soporte mensual <b>no incluyen como servicios gratuitos</b>: adquisición de licencias comerciales de terceros (Microsoft, Google, software contable), reemplazo de hardware o repuestos dañados, cableado de obra civil extraordinario o recuperación forense de desastres provocados por negligencia previa. Todo trabajo extraordinario se cotiza con aprobación formal del cliente.",
        body_style
    ))

    # =========================================================================
    # PÁGINA 4: CONTACTO, DIAGNÓSTICO GRATUITO Y FIRMA
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("6. Metodología de Inicio: Diagnóstico Técnico Gratuito", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=SECONDARY, spaceBefore=2, spaceAfter=12))

    story.append(Paragraph(
        "Antes de solicitar cualquier compromiso comercial, en Site On ofrecemos a toda empresa interesada un <b>Diagnóstico Inicial Sin Costo</b>. Este proceso nos permite conocer tu operación real y entregarte una recomendación técnica objetiva:",
        body_style
    ))
    story.append(Spacer(1, 10))

    pasos = [
        [Paragraph("<b>Paso 1: Levantamiento Inicial</b>", cell_bold), Paragraph("<b>Paso 2: Evaluación Técnica</b>", cell_bold), Paragraph("<b>Paso 3: Propuesta a la Medida</b>", cell_bold)],
        [Paragraph("Entrevista breve (remota o presencial) para conocer cantidad de usuarios, servidores, estado de los equipos y dolores actuales.", cell_style),
         Paragraph("Revisión de seguridad de red, estado de discos, licencias, antivirus y verificación real de los respaldos vigentes.", cell_style),
         Paragraph("Entrega de informe con las vulnerabilidades detectadas, mejoras urgentes recomendadas y el plan mensual ideal en UF.", cell_style)]
    ]
    t_pasos = Table(pasos, colWidths=[175, 180, 175])
    t_pasos.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_LIGHT),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_pasos)
    story.append(Spacer(1, 24))

    # Cuadro de Contacto y Canales Oficiales
    story.append(Paragraph("7. Canales Oficiales de Contacto y Atención", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=SECONDARY, spaceBefore=2, spaceAfter=12))

    contacto_data = [
        [Paragraph("<b>Canal de Atención</b>", cell_header), Paragraph("<b>Detalle / Enlace Oficial</b>", cell_header), Paragraph("<b>Disponibilidad</b>", cell_header)],
        [Paragraph("Sitio Web & Cotizador:", cell_bold), Paragraph("<font color='#0284c7'>https://www.siteon.cl</font> (Cotizador interactivo en línea)", cell_style), Paragraph("24/7 disponible", cell_style)],
        [Paragraph("Correo Central:", cell_bold), Paragraph("<font color='#0284c7'>contacto@siteon.cl</font>", cell_style), Paragraph("Respuesta < 2 hrs hábiles", cell_style)],
        [Paragraph("WhatsApp Directo:", cell_bold), Paragraph("<font color='#16a34a'>+56 9 5832 4650</font>", cell_style), Paragraph("Atención ágil", cell_style)],
        [Paragraph("Oficina Central:", cell_bold), Paragraph("Viña del Mar, Región de Valparaíso, Chile", cell_style), Paragraph("Visitas coordinadas", cell_style)],
        [Paragraph("Redes Sociales:", cell_bold), Paragraph("Instagram: @siteontecnologia • LinkedIn: Site On Tecnología", cell_style), Paragraph("Novedades y guías TI", cell_style)],
    ]
    t_contacto = Table(contacto_data, colWidths=[140, 250, 140])
    t_contacto.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_contacto)
    story.append(Spacer(1, 40))

    # Cuadro de Firma y Cierre
    firma_box = [
        [Paragraph("<b>SITE ON TECNOLOGÍA SpA</b><br/><font color='#64748b'>Transformamos tecnología en soluciones que impulsan tu negocio</font>", cell_style),
         Paragraph("<b>Rodrigo Aparicio</b><br/><font color='#64748b'>Director de Tecnología & Fundador<br/>Viña del Mar, Chile</font>", cell_style)]
    ]
    t_firma = Table(firma_box, colWidths=[270, 260])
    t_firma.setStyle(TableStyle([
        ('LINEABOVE', (0, 0), (-1, 0), 1.5, SECONDARY),
        ('TOPPADDING', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
    ]))
    story.append(t_firma)

    # Construcción final del PDF con NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF generado exitosamente en: {output_path}")

if __name__ == '__main__':
    out_pdf = r"c:\Users\rapar\Antigravity\Web de servicios\public\SiteON_Dossier_Corporativo.pdf"
    logo = r"c:\Users\rapar\Antigravity\Web de servicios\public\SiteON.png"
    build_pdf(out_pdf, logo)
