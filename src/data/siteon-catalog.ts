import { BlogPost, PlatformSettings, PricingConfig, ServiceItem } from '@/types/siteon';

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  id: 'default',
  company_name: 'Site On Tecnología',
  commercial_slogan: 'Transformamos tecnología en soluciones que impulsan tu negocio',
  whatsapp_number: '56958324650',
  whatsapp_display: '+56 9 5832 4650',
  whatsapp_tooltip: '¿Hablamos de tu proyecto?',
  whatsapp_default_message:
    'Hola, llegué a Site On y quisiera recibir información sobre sus servicios de soporte y soluciones tecnológicas.',
  contact_email: 'contacto@siteon.cl',
  notification_email: 'raparicioj@gmail.com',
  city: 'Viña del Mar',
  region: 'Región de Valparaíso',
  country: 'Chile',
  linkedin_url: 'https://www.linkedin.com',
  instagram_url: 'https://instagram.com/siteontecnologia',
  facebook_url: 'https://www.facebook.com/profile.php?id=100086742518173',
  ga4_measurement_id: process.env.NEXT_PUBLIC_GA4_ID || '',
  resend_enabled: true,
  webhook_enabled: true,
  updated_at: new Date().toISOString(),
};

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-01',
    slug: 'soporte-tecnico-servicios-ti',
    title: 'Soporte Técnico e Informático para Empresas (On-Site y Remoto)',
    short_title: 'Soporte TI Empresas',
    category: 'Operación & Soporte TI',
    tagline: 'Tu equipo siempre operativo: asistencia técnica rápida en terreno y remota sin enredos.',
    summary:
      'Cuando un computador falla, el internet se cae o el correo no funciona, tu empresa pierde plata. Respondemos rápido —en tu oficina o en línea— para que tu equipo nunca se detenga.',
    problem_statement:
      'Esperar días a que un técnico responda mientras tu equipo de ventas o administración no puede trabajar genera estrés, atrasos con clientes y pérdidas directas para tu negocio.',
    solution_description:
      'Nos convertimos en el equipo de soporte TI de tu empresa. Atendemos urgencias en minutos por vía remota en todo Chile y vamos presencialmente a tu oficina o sucursal en Viña del Mar y la V Región. Además, realizamos mantenimiento preventivo para evitar que los problemas vuelvan a ocurrir.',
    benefits: [
      {
        title: 'Respuesta humana e inmediata',
        description: 'Hablas directo con especialistas que te explican todo en simple, sin tecnicismos confusos.',
        metric: 'Atención < 1 Hora',
      },
      {
        title: 'Soporte en terreno (On-Site) y Remoto',
        description: 'Si no basta con conectarse a distancia, vamos personalmente a tu empresa a resolverlo.',
        metric: 'Presencial & Online',
      },
      {
        title: 'Planes mensuales predecibles en UF',
        description: 'Olvídate de cobros sorpresa: mantén tus computadores, impresoras y red siempre al 100%.',
        metric: 'Diagnóstico Gratis',
      },
    ],
    use_cases: [
      {
        title: 'Continuidad Operativa en Oficinas Comerciales y Pymes',
        industry: 'Empresas & Comercio',
        challenge: 'Computadores lentos, cortes de red en cierre de mes y demoras del soporte anterior.',
        outcome: 'Puesta a punto de todos los equipos, red estable y canal directo de atención inmediata.',
        metric: '98% de problemas resueltos en el primer contacto',
      },
      {
        title: 'Habilitación y Renovación de Equipos en Sucursales',
        industry: 'Servicios & Salud',
        challenge: 'Instalación de nuevos puestos de trabajo sin frenar la atención al público.',
        outcome: 'Configuración llave en mano fuera de horario hábil y soporte continuo a usuarios.',
        metric: '0 horas de interrupción en ventas',
      },
    ],
    deliverables: [
      'Diagnóstico inicial gratuito del estado de tus computadores y red',
      'Asistencia remota rápida para usuarios y visitas presenciales en terreno',
      'Mantenimiento preventivo, limpieza, optimización de velocidad y antivirus',
      'Configuración de impresoras, periféricos, respaldos y cuentas de correo',
    ],
    technologies: ['Windows 11 / macOS', 'Redes Wi-Fi Pro', 'Microsoft 365', 'Google Workspace', 'Respaldo Cloud', 'Seguridad Endpoint'],
    icon_name: 'ShieldCheck',
    featured: true,
    sort_order: 1,
    active: true,
    whatsapp_prompt:
      'Hola Site On, necesito Soporte Técnico e Informático para los equipos o red de mi empresa.',
    seo_title: 'Soporte Informático y Servicios TI para Empresas en Viña del Mar y Chile | Site On',
    seo_description:
      'Soporte técnico para empresas en Viña del Mar, Región de Valparaíso y remoto en todo Chile. Planes mensuales y atención de urgencias TI.',
  },
  {
    id: 'srv-02',
    slug: 'implementacion-soluciones-tecnologicas',
    title: 'Infraestructura TI, Redes Empresariales y Soluciones Llave en Mano',
    short_title: 'Infraestructura & Redes',
    category: 'Operación & Soporte TI',
    tagline: 'Redes Wi-Fi estables, servidores, seguridad y proyectos TI bien hechos desde el primer día.',
    summary:
      'Modernizamos la infraestructura física y digital de tu oficina: redes de alta velocidad, firewalls, servidores, VPN para teletrabajo y equipamiento empresarial.',
    problem_statement:
      'Señal Wi-Fi que se corta en reuniones, cables desordenados, redes inseguras y equipos mal configurados frenan la productividad diaria de todo tu equipo.',
    solution_description:
      'Diseñamos, instalamos y dejamos funcionando toda la infraestructura tecnológica que tu empresa necesita. Desde reestructurar tu red y Wi-Fi corporativo hasta conectar sucursales y habilitar teletrabajo seguro.',
    benefits: [
      {
        title: 'Conectividad estable en toda tu oficina',
        description: 'Redes empresariales diseñadas para soportar videollamadas, sistemas de venta y múltiples equipos sin caídas.',
        metric: '100% Cobertura Wi-Fi',
      },
      {
        title: 'Instalación limpia y sin interrupciones',
        description: 'Planificamos cada implementación para no detener el trabajo diario de tu empresa.',
        metric: 'Llave en Mano',
      },
      {
        title: 'Seguridad para tu información',
        description: 'Separación de red de invitados, firewall y accesos seguros para trabajadores remotos.',
        metric: 'Red Blindada',
      },
    ],
    use_cases: [
      {
        title: 'Modernización de Red y Conectividad en Oficina Corporativa',
        industry: 'Inmobiliaria & Servicios Profesionales',
        challenge: 'Caídas constantes de internet en salas de reuniones y lentitud al abrir archivos compartidos.',
        outcome: 'Instalación de puntos de acceso empresariales UniFi/Mikrotik y segmentación de red.',
        metric: '3x velocidad interna y 0 cortes en 12 meses',
      },
    ],
    deliverables: [
      'Levantamiento técnico en terreno o remoto y propuesta de equipamiento justo',
      'Instalación y configuración de routers, switches, puntos Wi-Fi y VPN',
      'Migración de archivos compartidos, permisos de carpetas y respaldos',
      'Capacitación práctica a tu equipo y garantía post-implementación',
    ],
    technologies: ['UniFi Ubiquiti', 'Mikrotik', 'Cisco', 'VPN Segura', 'NAS / Servidores', 'Firewalls'],
    icon_name: 'Layers',
    featured: true,
    sort_order: 2,
    active: true,
    whatsapp_prompt:
      'Hola Site On, queremos mejorar nuestra infraestructura TI, red Wi-Fi o equipamiento en la empresa.',
    seo_title: 'Infraestructura TI y Redes para Empresas en Viña del Mar y Chile | Site On',
    seo_description:
      'Implementación de infraestructura tecnológica, redes Wi-Fi empresariales, servidores y proyectos TI llave en mano en Chile.',
  },
  {
    id: 'srv-03',
    slug: 'administracion-sistemas-windows-linux',
    title: 'Administración de Servidores y Sistemas Windows & Linux',
    short_title: 'Servidores Windows & Linux',
    category: 'Operación & Soporte TI',
    tagline: 'Tus servidores seguros, actualizados, respaldados y funcionando 24/7.',
    summary:
      'Nos hacemos cargo de la administración, seguridad y respaldos de tus servidores Windows Server y Linux para garantizar que tus sistemas centrales nunca fallen.',
    problem_statement:
      'Tener un servidor sin mantención, sin respaldos verificados o con accesos descontrolados pone en riesgo toda la facturación, contabilidad e información histórica de tu negocio.',
    solution_description:
      'Administramos tus servidores locales o en la nube con rigor profesional: control de usuarios en Active Directory, actualizaciones seguras, monitoreo de discos, blindaje contra ransomware y pruebas periódicas de restauración de respaldos.',
    benefits: [
      {
        title: 'Tranquilidad total ante emergencias',
        description: 'Respaldos automáticos diarios fuera de la oficina para recuperar tu operación ante cualquier imprevisto.',
        metric: 'Respaldos Verificados',
      },
      {
        title: 'Control de accesos y permisos',
        description: 'Cada colaborador accede únicamente a las carpetas y sistemas que le corresponden.',
        metric: 'Seguridad Activa',
      },
      {
        title: 'Prevención antes de que falle',
        description: 'Revisamos salud de discos, memoria y servicios para evitar caídas en horario laboral.',
        metric: 'Operación 24/7',
      },
    ],
    use_cases: [
      {
        title: 'Estabilización y Respaldo de Servidores de Gestión (ERP / Contabilidad)',
        industry: 'Empresas Medianas & Estudios Contables',
        challenge: 'Servidor lento con riesgo de pérdida de base de datos y sin control de usuarios.',
        outcome: 'Optimización de sistema operativo, Active Directory y respaldo automático en la nube.',
        metric: '100% continuidad en cierres contables',
      },
    ],
    deliverables: [
      'Auditoría completa de estado, seguridad y respaldos de tus servidores',
      'Administración de usuarios, permisos, Active Directory y accesos remotos',
      'Mantenimiento preventivo mensual y aplicación segura de parches',
    ],
    technologies: ['Windows Server', 'Active Directory', 'Linux (Ubuntu, RHEL, Debian)', 'VMware / Proxmox', 'Backups Inmutables'],
    icon_name: 'Server',
    featured: true,
    sort_order: 3,
    active: true,
    whatsapp_prompt:
      'Hola Site On, necesitamos apoyo experto para administrar o revisar nuestros servidores Windows / Linux.',
    seo_title: 'Administración de Servidores Windows y Linux en Chile | Site On Tecnología',
    seo_description:
      'Administración, soporte y seguridad de servidores Windows Server y Linux para empresas en Viña del Mar y todo Chile.',
  },
  {
    id: 'srv-04',
    slug: 'consultoria-ti',
    title: 'Outsourcing TI y Consultoría Tecnológica para Empresas',
    short_title: 'Outsourcing & Consultoría TI',
    category: 'Consultoría & Cloud',
    tagline: 'Suma un equipo TI experto a tu empresa por una fracción del costo de contratar personal interno.',
    summary:
      'Te acompañamos como tu departamento o gerente TI externo: resolvemos el día a día, ordenamos tus proveedores y te guiamos para invertir bien en tecnología.',
    problem_statement:
      'Contratar un equipo informático interno a tiempo completo es costoso, pero no tener a nadie a cargo hace que la empresa tome malas decisiones de compra y sufra problemas técnicos constantes.',
    solution_description:
      'Mediante nuestro servicio de Outsourcing y Consultoría TI, ponemos a tu disposición especialistas senior que conocen tu negocio, atienden a tu equipo y te asesoran con honestidad sobre qué tecnología realmente necesitas.',
    benefits: [
      {
        title: 'Ahorro en costos de contratación',
        description: 'Cuentas con especialistas en soporte, redes, cloud y desarrollo sin pagar sueldos fijos altos ni leyes sociales.',
        metric: '-50% Costo Operativo TI',
      },
      {
        title: 'Cero lenguaje enredado',
        description: 'Te explicamos cada decisión en claro español comercial, con presupuestos transparentes.',
        metric: '100% Transparencia',
      },
      {
        title: 'Un solo aliado para todo lo tecnológico',
        description: 'Centralizas soporte, internet, correos, servidores y página web en una sola mano confiable.',
        metric: 'Gestión Integral',
      },
    ],
    use_cases: [
      {
        title: 'Departamento TI Externo para Empresa en Crecimiento',
        industry: 'Logística, Salud & Servicios',
        challenge: 'Empresa de 35 personas sin encargado TI formal y con múltiples proveedores descoordinados.',
        outcome: 'Tercerización integral con Site On: soporte diario, ordenamiento de licencias y plan de mejora.',
        metric: 'Reducción del 45% en gasto TI mensual',
      },
    ],
    deliverables: [
      'Diagnóstico integral de la situación tecnológica actual de tu empresa',
      'Asignación de equipo técnico y ejecutivo de cuenta directo',
      'Gestión de licencias, proveedores de internet, hosting y equipamiento',
      'Reuniones periódicas de seguimiento y mejora continua',
    ],
    technologies: ['Outsourcing TI', 'Gestión de Activos', 'Mesa de Ayuda', 'Estrategia Digital', 'Seguridad Corporativa'],
    icon_name: 'Compass',
    featured: true,
    sort_order: 4,
    active: true,
    whatsapp_prompt:
      'Hola Site On, me interesa conversar sobre Outsourcing TI o Consultoría para que nos apoyen con la tecnología de la empresa.',
    seo_title: 'Outsourcing TI y Consultoría Informática en Chile | Site On Tecnología',
    seo_description:
      'Servicios de Outsourcing TI, departamento informático externo y consultoría tecnológica para pymes y empresas en Chile.',
  },
  {
    id: 'srv-05',
    slug: 'cloud-infraestructura',
    title: 'Servicios Cloud, Correo Corporativo y Trabajo Remoto Seguro',
    short_title: 'Cloud & Correo Empresas',
    category: 'Consultoría & Cloud',
    tagline: 'Tus correos, archivos y sistemas en la nube: seguros, rápidos y accesibles desde cualquier lugar.',
    summary:
      'Migramos y administramos tu correo empresarial (Microsoft 365 / Google Workspace), discos compartidos en la nube y servidores Cloud en AWS, Google Cloud o Azure.',
    problem_statement:
      'Correos que caen en spam, archivos repartidos en pendrives o computadores personales y servidores antiguos que se apagan con un corte de luz ponen en jaque tu operación.',
    solution_description:
      'Llevamos tu empresa a la nube de forma ordenada y sin perder un solo correo ni archivo. Configuramos plataformas colaborativas modernas y servidores Cloud con respaldos automáticos para que tu equipo trabaje seguro desde la oficina o desde casa.',
    benefits: [
      {
        title: 'Correo profesional que nunca cae en Spam',
        description: 'Configuración certificada de seguridad (SPF, DKIM, DMARC) en Microsoft 365 o Google Workspace.',
        metric: '100% Entregabilidad',
      },
      {
        title: 'Archivos compartidos y respaldados',
        description: 'Tu equipo trabaja sobre documentos actualizados en tiempo real con permisos por área.',
        metric: 'Cero pérdida de datos',
      },
      {
        title: 'Servidores Cloud sin comprar hardware',
        description: 'Infraestructura moderna que crece según lo necesite tu negocio.',
        metric: 'Alta Disponibilidad',
      },
    ],
    use_cases: [
      {
        title: 'Migración de Correos y Archivos a Microsoft 365 / Cloud',
        industry: 'Estudios Jurídicos, Ingeniería & Comercio',
        challenge: 'Cuentas de correo llenas en hosting antiguo y dificultad para compartir carpetas entre sucursales.',
        outcome: 'Migración en un fin de semana hacia la nube con SharePoint/Drive y respaldos automáticos.',
        metric: 'Transición 100% transparente sin detener el trabajo',
      },
    ],
    deliverables: [
      'Migración completa de buzones de correo históricos, contactos y calendarios',
      'Estructuración de carpetas corporativas en la nube con permisos de seguridad',
      'Despliegue y administración de servidores Cloud (AWS, Google Cloud, Azure)',
    ],
    technologies: ['Microsoft 365', 'Google Workspace', 'SharePoint / OneDrive', 'AWS', 'Google Cloud', 'Microsoft Azure'],
    icon_name: 'Cloud',
    featured: true,
    sort_order: 5,
    active: true,
    whatsapp_prompt:
      'Hola Site On, necesito ayuda con Correo Corporativo, respaldo en la nube o Servicios Cloud para mi empresa.',
    seo_title: 'Servicios Cloud y Correo Corporativo para Empresas en Chile | Site On',
    seo_description:
      'Migración a la nube, Microsoft 365, Google Workspace y servidores Cloud seguros para empresas en Viña del Mar y Chile.',
  },
  {
    id: 'srv-06',
    slug: 'desarrollo-web-plataformas',
    title: 'Desarrollo de Páginas Web Comerciales y Plataformas Digitales',
    short_title: 'Desarrollo Web Comercial',
    category: 'Desarrollo & IA',
    tagline: 'Sitios web modernos, rápidos y diseñados para transformar visitas en clientes reales.',
    summary:
      'Creamos páginas web empresariales y plataformas digitales que proyectan confianza inmediata, posicionan en Google y captan prospectos directo a tu WhatsApp y CRM.',
    problem_statement:
      'Tener una página web antigua, lenta o que no genera ningún contacto comercial hace que tus potenciales clientes elijan a la competencia antes siquiera de llamarte.',
    solution_description:
      'Diseñamos y construimos tu presencia digital con enfoque 100% comercial. Sitios ultrarrápidos, adaptados a teléfonos móviles, optimizados para aparecer en Google (SEO) y conectados con herramientas reales de seguimiento de clientes.',
    benefits: [
      {
        title: 'Imagen corporativa de primer nivel',
        description: 'Tu empresa transmite solidez, modernidad y confianza desde el primer segundo.',
        metric: 'Diseño Premium',
      },
      {
        title: 'Enfocada en conseguir clientes',
        description: 'Formularios inteligentes, botones de WhatsApp estratégicos y estructura pensada para vender.',
        metric: '+Conversión Comercial',
      },
      {
        title: 'Optimizada para Google (SEO)',
        description: 'Configurada técnicamente para que te encuentren quienes buscan tus servicios en tu ciudad o en Chile.',
        metric: '95+ Velocidad & SEO',
      },
    ],
    use_cases: [
      {
        title: 'Renovación Web Comercial con CRM de Prospectos',
        industry: 'Empresas de Servicios, Clínicas & Consultoras',
        challenge: 'Sitio informativo antiguo que no recibía consultas ni aparecía en búsquedas locales.',
        outcome: 'Nueva plataforma web rápida con catálogo de servicios, botón WhatsApp inteligente y panel de clientes.',
        metric: 'Incremento inmediato en solicitudes de cotización',
      },
    ],
    deliverables: [
      'Diseño visual moderno y personalizado a la identidad de tu empresa',
      'Desarrollo completo adaptable a celulares, tablets y computadores',
      'Integración de formulario de captación, WhatsApp y correo corporativo',
      'Posicionamiento SEO inicial en Google y panel autoadministrable',
    ],
    technologies: ['Next.js', 'React', 'Diseño UI/UX', 'SEO Local Chile', 'CRM Integrado', 'Analítica Comercial'],
    icon_name: 'Globe',
    featured: true,
    sort_order: 6,
    active: true,
    whatsapp_prompt:
      'Hola Site On, quiero cotizar el diseño o renovación de la página web comercial de mi empresa.',
    seo_title: 'Desarrollo Web Profesional para Empresas en Viña del Mar y Chile | Site On',
    seo_description:
      'Diseño y desarrollo de páginas web empresariales de alta conversión y plataformas digitales en Viña del Mar y todo Chile.',
  },
  {
    id: 'srv-07',
    slug: 'automatizacion-procesos-ia',
    title: 'Automatización de Procesos e Inteligencia Artificial Práctica',
    short_title: 'Automatización & IA',
    category: 'Desarrollo & IA',
    tagline: 'Ahorra horas de trabajo manual haciendo que tus sistemas trabajen por ti.',
    summary:
      'Eliminamos tareas repetitivas en Excel y conectamos tus formularios, correos, WhatsApp y sistemas administrativos con automatización e Inteligencia Artificial.',
    problem_statement:
      'Tu equipo pierde horas valiosas todas las semanas copiando datos de un lado a otro, armando reportes a mano o respondiendo tarde a los clientes por exceso de carga operativa.',
    solution_description:
      'Analizamos dónde se pierde tiempo en tu oficina y creamos flujos automáticos simples de usar. Desde responder y registrar clientes al instante hasta generar reportes, alertas y documentos en segundos.',
    benefits: [
      {
        title: 'Más tiempo libre para vender y crecer',
        description: 'Tu equipo deja de hacer trabajo mecánico y se enfoca en atender mejor a los clientes.',
        metric: '+20 hrs/mes ahorradas',
      },
      {
        title: 'Respuesta inmediata a tus clientes',
        description: 'Nadie se queda esperando: cada solicitud recibe confirmación y aviso a tu celular al instante.',
        metric: 'Atención en segundos',
      },
      {
        title: 'Cero errores por copiar y pegar',
        description: 'La información viaja ordenada y sin errores entre tus plataformas.',
        metric: 'Orden Total',
      },
    ],
    use_cases: [
      {
        title: 'Reemplazo de Planillas Excel Manuales por Flujo Automatizado',
        industry: 'Administración & Ventas',
        challenge: 'Registro manual de solicitudes y seguimiento desordenado en múltiples archivos Excel.',
        outcome: 'Centralización automática de clientes con alertas a WhatsApp y panel de control en vivo.',
        metric: 'Ahorro de 20+ horas mensuales de trabajo administrativo',
      },
    ],
    deliverables: [
      'Revisión práctica de tus procesos actuales para detectar ahorros rápidos de tiempo',
      'Implementación de automatizaciones conectadas a tu correo, WhatsApp, CRM o planillas',
      'Asistentes de IA configurados con la información real de tu negocio',
    ],
    technologies: ['Make', 'Automatización Comercial', 'IA Aplicada', 'Integración WhatsApp / Email', 'CRM Workflows'],
    icon_name: 'Sparkles',
    featured: false,
    sort_order: 7,
    active: true,
    whatsapp_prompt:
      'Hola Site On, me gustaría automatizar procesos manuales en mi empresa para ahorrar tiempo.',
    seo_title: 'Automatización de Procesos e IA para Empresas en Chile | Site On',
    seo_description:
      'Automatización de procesos administrativos, comerciales e integraciones con Inteligencia Artificial para empresas en Chile.',
  },
  {
    id: 'srv-08',
    slug: 'desarrollo-software-aplicaciones',
    title: 'Desarrollo de Software y Aplicaciones a Medida',
    short_title: 'Software a Medida',
    category: 'Desarrollo & IA',
    tagline: 'Sistemas web y aplicaciones móviles creadas exactamente para la forma en que trabaja tu empresa.',
    summary:
      'Desarrollamos sistemas internos, portales de clientes, control de operaciones en terreno y aplicaciones móviles (PWA) fáciles de usar.',
    problem_statement:
      'Muchas veces los programas enlatados son caros, cobran por cada usuario nuevo y no se adaptan a cómo realmente funciona tu negocio en el día a día.',
    solution_description:
      'Creamos tu propio software a medida: intuitivo, rápido y accesible desde el computador o el celular, sin cobros eternos por licencia de usuario.',
    benefits: [
      {
        title: 'Hecho 100% a tu medida',
        description: 'El sistema se adapta a tu empresa y no tu empresa al sistema.',
        metric: '100% Personalizado',
      },
      {
        title: 'Funciona en celular y computador',
        description: 'Ideal para equipos en terreno, ventas, agendamiento, inventario o gestión interna.',
        metric: 'Web & Móvil',
      },
      {
        title: 'Sin cobros por cantidad de usuarios',
        description: 'Crece tu equipo sin que aumente una mensualidad por cada persona que ingresa.',
        metric: 'Activo Propio',
      },
    ],
    use_cases: [
      {
        title: 'Sistema de Gestión Operativa y Clientes en Línea',
        industry: 'Servicios, Terreno & Pymes',
        challenge: 'Órdenes de trabajo en papel o WhatsApp que se perdían antes de facturar.',
        outcome: 'Aplicación web y móvil donde el equipo registra avances y gerencia ve todo en tiempo real.',
        metric: 'Control total de operaciones y cobros',
      },
    ],
    deliverables: [
      'Diseño de pantallas fáciles de entender para todo tu equipo',
      'Desarrollo completo con base de datos segura en la nube y perfiles de acceso',
      'Puesta en marcha, capacitación y soporte continuo',
    ],
    technologies: ['Aplicaciones Web', 'Apps Móviles PWA', 'Bases de Datos Cloud', 'Paneles de Control', 'Reportes Automáticos'],
    icon_name: 'Code2',
    featured: false,
    sort_order: 8,
    active: true,
    whatsapp_prompt:
      'Hola Site On, queremos cotizar el desarrollo de un sistema o aplicación a medida para nuestro negocio.',
    seo_title: 'Desarrollo de Software y Aplicaciones a Medida en Chile | Site On',
    seo_description:
      'Desarrollo de software empresarial, sistemas internos y aplicaciones web/móviles a medida en Viña del Mar y Chile.',
  },
  {
    id: 'srv-09',
    slug: 'optimizacion-infraestructura-finops',
    title: 'Optimización de Costos TI, Licencias y Rendimiento (FinOps)',
    short_title: 'Optimización & Ahorro TI',
    category: 'Observabilidad & FinOps',
    tagline: 'Haz que tus equipos y servidores funcionen más rápido pagando solo lo justo.',
    summary:
      'Auditamos tus gastos en servidores, nube, licencias e internet para eliminar cobros innecesarios y acelerar el rendimiento de tus sistemas.',
    problem_statement:
      'Muchas empresas pagan todos los meses por servidores sobredimensionados, licencias que nadie ocupa o sistemas lentos que nadie ha optimizado.',
    solution_description:
      'Revisamos con lupa técnica y comercial toda tu infraestructura. Optimizamos tus servidores y recortamos gastos innecesarios sin sacrificar calidad ni seguridad.',
    benefits: [
      {
        title: 'Reducción directa de gastos mensuales',
        description: 'Detectamos servicios duplicados, licencias inactivas y recursos mal dimensionados.',
        metric: '20% a 40% de Ahorro',
      },
      {
        title: 'Sistemas más rápidos con lo que ya tienes',
        description: 'Ajustamos y optimizamos tus equipos y servidores actuales antes de hacerte gastar de más.',
        metric: '+Velocidad Real',
      },
    ],
    use_cases: [
      {
        title: 'Auditoría y Reducción de Facturación Mensual TI',
        industry: 'Empresas Medianas & Corporativos',
        challenge: 'Aumento sostenido de costos en servicios Cloud y licencias de software.',
        outcome: 'Reordenamiento de contratos, limpieza de recursos ociosos y optimización de bases de datos.',
        metric: 'Ahorro anual superior al 30% en presupuesto TI',
      },
    ],
    deliverables: [
      'Informe claro de ahorro con oportunidades inmediatas de reducción de costos',
      'Optimización técnica de rendimiento en servidores y plataformas Cloud',
    ],
    technologies: ['FinOps', 'Optimización Cloud', 'Auditoría de Licencias', 'Tuning de Servidores'],
    icon_name: 'TrendingDown',
    featured: false,
    sort_order: 9,
    active: true,
    whatsapp_prompt:
      'Hola Site On, nos interesa optimizar nuestros costos TI y mejorar el rendimiento de nuestra infraestructura.',
    seo_title: 'Optimización de Infraestructura TI y Reducción de Costos Cloud | Site On',
    seo_description:
      'Auditoría de costos TI, FinOps y optimización de rendimiento de servidores e infraestructura en Chile.',
  },
  {
    id: 'srv-10',
    slug: 'observabilidad-monitoreo-dynatrace-datadog',
    title: 'Monitoreo Proactivo y Observabilidad Empresarial (Dynatrace & Datadog)',
    short_title: 'Monitoreo & Observabilidad',
    category: 'Observabilidad & FinOps',
    tagline: 'Nos enteramos y resolvemos antes de que tus sistemas críticos se caigan.',
    summary:
      'Monitoreo continuo 24/7 de servidores, plataformas web y aplicaciones críticas mediante tecnologías líderes como Dynatrace y Datadog.',
    problem_statement:
      'Enterarse de que un sistema o sitio de ventas está caído porque un cliente reclama significa llegar tarde y perder ventas.',
    solution_description:
      'Implementamos monitoreo inteligente que vigila la salud de tus servidores y aplicaciones las 24 horas, enviando alertas preventivas e identificando la causa exacta de cualquier lentitud.',
    benefits: [
      {
        title: 'Prevención de caídas críticas',
        description: 'Alertas tempranas cuando un disco se está llenando o un servicio empieza a ponerse lento.',
        metric: 'Vigilancia 24/7',
      },
      {
        title: 'Especialistas certificados en plataformas líderes',
        description: 'Experiencia comprobada en entornos corporativos con Dynatrace, Datadog y monitoreo sintético.',
        metric: '-80% Tiempo de Caída',
      },
    ],
    use_cases: [
      {
        title: 'Monitoreo Proactivo de Plataformas Críticas y Servidores',
        industry: 'Banca, Retail & Empresas de Servicios',
        challenge: 'Caídas intermitentes fuera de horario hábil sin visibilidad de la causa raíz.',
        outcome: 'Tableros de control en vivo y alertas automáticas directas al equipo de guardia.',
        metric: '99.95% de continuidad anual',
      },
    ],
    deliverables: [
      'Configuración de monitoreo 24/7 sobre servidores, enlaces y páginas web críticas',
      'Tableros visuales claros y alertas tempranas por WhatsApp / Correo',
      'Consultoría especializada en Dynatrace y Datadog para corporaciones',
    ],
    technologies: ['Monitoreo 24/7', 'Dynatrace', 'Datadog', 'Alertas Tempranas', 'Dashboards Ejecutivos'],
    icon_name: 'Activity',
    featured: false,
    sort_order: 10,
    active: true,
    whatsapp_prompt:
      'Hola Site On, quisiera información sobre monitoreo proactivo 24/7 y observabilidad para nuestros sistemas.',
    seo_title: 'Monitoreo de Servidores y Observabilidad Dynatrace en Chile | Site On',
    seo_description:
      'Monitoreo preventivo 24/7 de servidores y consultoría en observabilidad empresarial (Dynatrace, Datadog) en Chile.',
  },
];

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-01',
    slug: 'como-elegir-partner-servicios-ti-vina-del-mar-valparaiso',
    title: 'Soporte TI para Empresas en Viña del Mar y Chile: Cómo evitar que los problemas técnicos frenen tus ventas',
    excerpt:
      'Guía práctica para dueños de empresas y gerentes: qué exigir a tu soporte informático para tener continuidad total, respaldos seguros y costos predecibles.',
    content: `## La tecnología debe impulsar a tu equipo, no detenerlo

En el día a día de cualquier empresa, un computador que no enciende, una red Wi-Fi inestable o un servidor sin respaldo puede paralizar ventas, facturación y atención al cliente durante horas.

### 4 señales de que tu empresa necesita modernizar su soporte TI

1. **Tiempos de espera eternos:** Cuando reportas un problema y pasan días sin una solución concreta.
2. **Nadie sabe si los respaldos funcionan:** Tener un disco externo conectado no sirve si nadie verifica periódicamente que la información se pueda recuperar.
3. **Cortes de internet y lentitud en la oficina:** Redes armadas con routers domésticos que colapsan cuando hay más de 10 personas conectadas.
4. **Costos impredecibles:** Pagar urgencias caras cada vez que algo se rompe en lugar de contar con mantenimiento preventivo mensual.

En **Site On Tecnología** combinamos asistencia remota en minutos hacia todo Chile con soporte presencial en terreno en **Viña del Mar y la Región de Valparaíso**, hablándote siempre en simple y con precios claros en UF.`,
    category: 'Soporte & Continuidad TI',
    read_time_minutes: 4,
    author_name: 'Rodrigo Aparicio',
    author_role: 'Director — Site On Tecnología',
    cover_gradient: 'from-cyan-600/35 via-blue-800/30 to-slate-900',
    seo_keywords: ['Servicios TI Viña del Mar', 'Soporte informático para empresas', 'Consultoría informática Chile'],
    published: true,
    published_at: '2026-11-02T14:00:00.000Z',
    updated_at: '2026-11-02T14:00:00.000Z',
  },
  {
    id: 'post-02',
    slug: 'automatizacion-comercial-ia-para-pymes-y-empresas-en-chile',
    title: 'Del caos en Excel a un negocio ordenado: 5 procesos que toda pyme chilena puede automatizar hoy',
    excerpt:
      'Cómo ahorrar más de 20 horas mensuales eliminando el trabajo repetitivo y conectando tu página web con un CRM real y WhatsApp.',
    content: `## El costo oculto del trabajo manual en las empresas

En la mayoría de las empresas chilenas, personas muy capaces pierden gran parte de su semana copiando datos de correos a planillas Excel, buscando qué pasó con una cotización o respondiendo las mismas preguntas una y otra vez.

### ¿Por dónde empezar a automatizar sin complicarse?

1. **Captación de clientes en piloto automático:** Que cada consulta en tu web quede registrada al instante en un CRM, avise a tu celular y no se pierda nunca en una bandeja de correo.
2. **Seguimiento de cotizaciones:** Saber exactamente a qué clientes hay que llamar hoy para cerrar la venta.
3. **Respaldos automáticos en la nube:** Que los documentos importantes de tu empresa se respalden solos todos los días sin depender de que alguien se acuerde.

En **Site On Tecnología** implementamos soluciones prácticas que cualquier persona de tu equipo puede usar desde el primer día.`,
    category: 'Automatización & Productividad',
    read_time_minutes: 4,
    author_name: 'Rodrigo Aparicio',
    author_role: 'Director — Site On Tecnología',
    cover_gradient: 'from-emerald-600/35 via-teal-800/30 to-slate-900',
    seo_keywords: ['Automatización de procesos', 'CRM para pymes Chile', 'Desarrollo web Chile'],
    published: true,
    published_at: '2026-10-28T14:00:00.000Z',
    updated_at: '2026-10-28T14:00:00.000Z',
  },
  {
    id: 'post-03',
    slug: 'infraestructura-redes-y-servidores-seguros-para-empresas',
    title: 'Redes Wi-Fi Empresariales y Servidores Seguros: La base silenciosa de una empresa productiva',
    excerpt:
      'Por qué fallan las redes de oficina tradicionales y cómo diseñar una infraestructura estable para equipos presenciales y teletrabajo.',
    content: `## Cuando la red funciona bien, toda la empresa trabaja mejor

Muchas empresas crecen en cantidad de trabajadores pero mantienen el mismo router básico que instaló la compañía de internet hace años. El resultado: videollamadas que se cortan, sistemas lentos y zonas de la oficina sin señal.

### Cómo lo solucionamos en Site On Tecnología

- **Puntos de acceso empresariales (UniFi / Mikrotik):** Cobertura total y estable incluso con decenas de dispositivos conectados al mismo tiempo.
- **Red separada para visitas y clientes:** Protege los computadores de administración y contabilidad frente a dispositivos externos.
- **VPN segura para teletrabajo:** Permite que gerencia y colaboradores accedan a los archivos de la oficina desde cualquier lugar con seguridad total.`,
    category: 'Infraestructura & Redes',
    read_time_minutes: 5,
    author_name: 'Rodrigo Aparicio',
    author_role: 'Director — Site On Tecnología',
    cover_gradient: 'from-blue-600/35 via-indigo-800/30 to-slate-900',
    seo_keywords: ['Redes empresariales Chile', 'Soporte servidores Windows Linux', 'Infraestructura TI'],
    published: true,
    published_at: '2026-10-20T14:00:00.000Z',
    updated_at: '2026-10-20T14:00:00.000Z',
  },
];

export function convertUfToClp(uf: number, ufRate: number): number {
  if (!ufRate || ufRate <= 0) return 0;
  return Math.round((uf * ufRate) / 100) * 100;
}

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  id: 'default',
  uf_mode: 'manual_reference',
  uf_value_clp: 41290,
  uf_last_updated: new Date().toISOString().split('T')[0],
  uf_source_label: 'Valor UF Referencia Comercial Vigente (Sincronizable SII / Banco Central)',
  iva_percentage: 19,
  promo_active: true,
  promo_text: 'Diagnóstico técnico inicial gratuito en Viña del Mar, V Región y remoto en todo Chile',
  promo_discount_pct: 0,
  section_badge: 'Planes de Continuidad Operativa & Soporte TI',
  section_title: 'Planes transparentes que escalan al ritmo de tu empresa',
  section_subtitle:
    'Compara coberturas reales, simula tus necesidades en nuestro Cotizador Inteligente y solicita tu diagnóstico inicial sin costo. Valores comerciales expresados en UF más IVA.',
  legal_disclaimer:
    'Los precios publicados corresponden a referencias comerciales iniciales en valores netos más IVA (19%) y no constituyen tarifas estáticas sin evaluación previa. El valor final del contrato mensual está sujeto a diagnóstico técnico gratuito y validación del alcance operativo de equipos, red y servidores.',
  support_hours: 'Lunes a Viernes de 09:00 a 18:30 hrs (Horario hábil Chile Continental)',
  onsite_coverage_area:
    'Visitas programadas presenciales incluidas según plan en Viña del Mar, Concón, Valparaíso, Quilpué y Villa Alemana. Otras comunas o regiones bajo cotización.',
  addon_rates: {
    extra_user_uf: 0.5,
    extra_computer_uf: 0.2,
    managed_server_uf: 2.0,
    advanced_monitoring_uf: 1.5,
    extra_visit_uf: 1.0,
    cloud_management_uf: 1.5,
    automation_ai_uf: 2.5,
  },
  plans: [
    {
      id: 'plan-start',
      slug: 'site-on-start',
      name: 'SITE ON START',
      badge: 'Equipos Pequeños',
      tagline: 'Continuidad esencial y soporte remoto en horario hábil para estudios y microempresas.',
      price_uf: 3.5,
      is_from_price: false,
      reference_clp: 144500,
      max_users: 3,
      included_computers: 3,
      included_servers: 0,
      includes_m365_workspace: false,
      includes_monitoring: false,
      includes_cloud_hybrid: false,
      onsite_visits_summary: 'Soporte 100% remoto (visitas a solicitud desde 1 UF)',
      features: [
        'Diagnóstico inicial gratuito',
        'Soporte remoto en horario hábil',
        'Hasta 3 solicitudes mensuales',
        'Mantención preventiva básica',
        'Gestión básica de Windows y correo',
        'Revisión básica de seguridad',
      ],
      cta_label: 'Solicitar diagnóstico gratuito',
      recommended: false,
      active: true,
      sort_order: 1,
    },
    {
      id: 'plan-business',
      slug: 'site-on-business',
      name: 'SITE ON BUSINESS',
      badge: 'Pymes en Crecimiento',
      tagline: 'Soporte prioritario, administración de correo corporativo y visitas trimestrales.',
      price_uf: 6.5,
      is_from_price: false,
      reference_clp: 268400,
      max_users: 6,
      included_computers: 6,
      included_servers: 0,
      includes_m365_workspace: true,
      includes_monitoring: false,
      includes_cloud_hybrid: false,
      onsite_visits_summary: '1 visita programada trimestral en Viña del Mar y alrededores',
      features: [
        'Todo lo incluido en Start',
        'Soporte remoto prioritario',
        'Administración Microsoft 365 o Google Workspace',
        'Mantención preventiva mensual',
        'Gestión de usuarios y permisos',
        'Una visita programada trimestral en Viña del Mar y alrededores',
        'Reporte mensual de soporte',
      ],
      cta_label: 'Solicitar diagnóstico gratuito',
      recommended: false,
      active: true,
      sort_order: 2,
    },
    {
      id: 'plan-business-pro',
      slug: 'site-on-business-pro',
      name: 'SITE ON BUSINESS PRO',
      badge: 'PLAN RECOMENDADO',
      tagline: 'Gestión integral de red, servidores, respaldos y visita presencial todos los meses.',
      price_uf: 10.5,
      is_from_price: false,
      reference_clp: 433500,
      max_users: 12,
      included_computers: 12,
      included_servers: 1,
      includes_m365_workspace: true,
      includes_monitoring: true,
      includes_cloud_hybrid: false,
      onsite_visits_summary: '1 visita mensual programada en terreno',
      features: [
        'Todo lo incluido en Business',
        'Administración de red y Wi-Fi',
        'Monitoreo de equipos y servicios acordados',
        'Gestión de respaldos existentes',
        'Administración de servidores dentro del alcance definido',
        'Una visita mensual programada',
        'SLA prioritario',
        'Informe mensual del estado tecnológico',
      ],
      cta_label: 'Solicitar diagnóstico gratuito',
      recommended: true,
      active: true,
      sort_order: 3,
    },
    {
      id: 'plan-enterprise',
      slug: 'site-on-enterprise',
      name: 'SITE ON ENTERPRISE',
      badge: 'Corporativo & Multi-Sede',
      tagline: 'Operación avanzada Windows Server / Linux, Cloud híbrido, seguridad y SLA a medida.',
      price_uf: 12.0,
      is_from_price: true,
      reference_clp: 495500,
      max_users: 15,
      included_computers: 15,
      included_servers: 2,
      includes_m365_workspace: true,
      includes_monitoring: true,
      includes_cloud_hybrid: true,
      onsite_visits_summary: 'Gestión de múltiples sedes y visitas según alcance',
      features: [
        'Administración integral de infraestructura',
        'Administración Windows Server y Linux',
        'Cloud e infraestructura híbrida',
        'Seguridad y continuidad operacional',
        'Monitoreo avanzado',
        'Consultoría TI mensual',
        'SLA personalizado',
        'Gestión de múltiples sedes según alcance',
      ],
      cta_label: 'Solicitar evaluación empresarial',
      recommended: false,
      active: true,
      sort_order: 4,
    },
  ],
  comparison_rows: [
    {
      id: 'cmp-users',
      feature_name: 'Usuarios incluidos',
      category: 'Cobertura & Soporte',
      values: {
        'site-on-start': 'Hasta 3 usuarios',
        'site-on-business': 'Hasta 6 usuarios',
        'site-on-business-pro': 'Hasta 12 usuarios',
        'site-on-enterprise': 'Hasta 15 usuarios (base)',
      },
    },
    {
      id: 'cmp-remote',
      feature_name: 'Soporte remoto',
      category: 'Cobertura & Soporte',
      values: {
        'site-on-start': 'Horario hábil (hasta 3 solic./mes)',
        'site-on-business': 'Prioritario en horario hábil',
        'site-on-business-pro': 'Prioritario continuo en alcance',
        'site-on-enterprise': 'Preferente dedicado & continuidad',
      },
    },
    {
      id: 'cmp-onsite',
      feature_name: 'Soporte presencial',
      category: 'Cobertura & Soporte',
      values: {
        'site-on-start': 'Opcional (desde 1 UF / visita)',
        'site-on-business': '1 visita trimestral programada',
        'site-on-business-pro': '1 visita mensual programada',
        'site-on-enterprise': 'Múltiples sedes según alcance',
      },
    },
    {
      id: 'cmp-m365',
      feature_name: 'Microsoft 365',
      category: 'Infraestructura & Cloud',
      values: {
        'site-on-start': 'Gestión básica de correo',
        'site-on-business': true,
        'site-on-business-pro': true,
        'site-on-enterprise': 'Administración avanzada + Híbrido',
      },
    },
    {
      id: 'cmp-gws',
      feature_name: 'Google Workspace',
      category: 'Infraestructura & Cloud',
      values: {
        'site-on-start': 'Gestión básica de correo',
        'site-on-business': true,
        'site-on-business-pro': true,
        'site-on-enterprise': 'Administración corporativa + Políticas',
      },
    },
    {
      id: 'cmp-network',
      feature_name: 'Administración de redes',
      category: 'Infraestructura & Cloud',
      values: {
        'site-on-start': false,
        'site-on-business': 'Revisión preventiva básica',
        'site-on-business-pro': 'Administración de red y Wi-Fi',
        'site-on-enterprise': 'Redes empresariales, VPN y sedes',
      },
    },
    {
      id: 'cmp-servers',
      feature_name: 'Administración de servidores',
      category: 'Infraestructura & Cloud',
      values: {
        'site-on-start': false,
        'site-on-business': 'Adicional (desde 2 UF/servidor)',
        'site-on-business-pro': 'Incluido según alcance definido',
        'site-on-enterprise': 'Windows Server, Linux & Cloud',
      },
    },
    {
      id: 'cmp-monitoring',
      feature_name: 'Monitoreo',
      category: 'Infraestructura & Cloud',
      values: {
        'site-on-start': false,
        'site-on-business': 'Chequeo mensual preventivo',
        'site-on-business-pro': 'Equipos y servicios acordados',
        'site-on-enterprise': 'Monitoreo avanzado de infraestructura',
      },
    },
    {
      id: 'cmp-backups',
      feature_name: 'Respaldos',
      category: 'Infraestructura & Cloud',
      values: {
        'site-on-start': false,
        'site-on-business': 'Revisión básica de estado',
        'site-on-business-pro': 'Gestión de respaldos existentes',
        'site-on-enterprise': 'Continuidad operacional e inmutabilidad',
      },
    },
    {
      id: 'cmp-consulting',
      feature_name: 'Consultoría TI',
      category: 'Gestión & SLA',
      values: {
        'site-on-start': 'Diagnóstico inicial gratuito',
        'site-on-business': 'Orientación técnica trimestral',
        'site-on-business-pro': 'Revisión mensual de mejoras',
        'site-on-enterprise': 'Consultoría TI mensual de gerencia',
      },
    },
    {
      id: 'cmp-sla',
      feature_name: 'SLA (Nivel de Servicio)',
      category: 'Gestión & SLA',
      values: {
        'site-on-start': 'Estándar horario hábil',
        'site-on-business': 'Soporte remoto prioritario',
        'site-on-business-pro': 'SLA Prioritario',
        'site-on-enterprise': 'SLA Personalizado por criticidad',
      },
    },
    {
      id: 'cmp-reports',
      feature_name: 'Reportes',
      category: 'Gestión & SLA',
      values: {
        'site-on-start': 'Resumen de tickets atendidos',
        'site-on-business': 'Reporte mensual de soporte',
        'site-on-business-pro': 'Informe mensual del estado tecnológico',
        'site-on-enterprise': 'Informe ejecutivo e indicadores KPI',
      },
    },
  ],
  exclusions: [
    'Costo de licencias de software o suscripciones de terceros (Microsoft 365, Google Workspace, antivirus comerciales, almacenamiento cloud externo, ERP).',
    'Compra de equipamiento de hardware, computadores, servidores físicos, switches, puntos Wi-Fi o repuestos electrónicos.',
    'Implementaciones extraordinarias desde cero o cableado estructurado físico (se cotizan como proyecto llave en mano independiente).',
    'Recuperación forense o de desastres mayores en infraestructura previa sin respaldos vigentes.',
    'Guardias de soporte 24/7 fuera de horario hábil no pactadas expresamente en un anexo SLA Enterprise.',
    'Proyectos de migración masiva de servidores, cambios de domicilio de oficina o desarrollo de software a medida.',
  ],
  hiring_conditions: [
    'Diagnóstico técnico inicial 100% gratuito para validar el estado actual del parque de equipos, red y servidores antes de iniciar.',
    'Facturación mensual en pesos chilenos (CLP) según el valor oficial de la UF vigente al día de emisión de la factura más IVA (19%).',
    'Atención en horario hábil de Lunes a Viernes (09:00 a 18:30 hrs) mediante canal directo de soporte, ticketing y asistencia remota segura.',
    'Cobertura presencial programada en Viña del Mar, Concón, Valparaíso, Quilpué y Villa Alemana según la frecuencia incluida en cada plan.',
  ],
  updated_at: new Date().toISOString(),
};

