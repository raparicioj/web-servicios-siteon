import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Shield,
  Lock,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Scale,
  Server,
  Database,
  Eye,
  Trash2,
  RefreshCw,
  Building2,
  ExternalLink,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Privacidad y Protección de Datos Personales (Ley 21.719 y Ley 19.628) | Site On Tecnología',
  description:
    'Política corporativa de privacidad, consentimiento informado, seguridad de la información y ejercicio de derechos ARCO-P de Site On Tecnología SpA conforme al marco legal chileno.',
  alternates: {
    canonical: 'https://www.siteon.cl/privacidad',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-32 pb-24 bg-slate-950 text-slate-300 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header / Badge */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 text-xs font-semibold text-emerald-300">
            <Shield className="h-4 w-4" /> Cumplimiento Normativo República de Chile • Ley N° 21.719 y Ley N° 19.628
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Política de Privacidad y Protección de Datos Personales
          </h1>

          <p className="text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            En <strong>Site On Tecnología SpA</strong> velamos por la máxima transparencia, confidencialidad y resguardo ético y técnico de los datos personales de nuestros clientes, empresas usuarias y visitantes digitales.
          </p>

          <p className="text-xs text-slate-400 font-mono">
            Última actualización: Noviembre 2026 • Aplicable a{' '}
            <strong className="text-white">https://www.siteon.cl</strong> y sus canales de atención oficiales
          </p>
        </div>

        {/* Resumen Ejecutivo / Principios Fundamentales */}
        <div className="rounded-3xl border border-cyan-500/30 bg-slate-900/80 p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-3 text-white font-display text-xl font-bold">
            <Lock className="w-5 h-5 text-cyan-400" />
            <h2>Principios Rectores de Tratamiento de Site On Tecnología</h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-300">
            El tratamiento de datos personales en Site On se rige estrictamente por los principios de{' '}
            <strong className="text-white">licitud, lealtad, transparencia, proporcionalidad, minimización, exactitud, limitación del plazo de conservación y seguridad de la información</strong>{' '}
            consagrados en la <strong>Ley N° 21.719</strong> sobre Protección de Datos Personales y la <strong>Ley N° 19.628</strong> sobre Protección de la Vida Privada. Bajo ningún concepto vendemos, comercializamos, cedemos ni arrendamos bases de datos a terceros, y garantizamos el ejercicio oportuno y gratuito de los derechos de los titulares.
          </p>
        </div>

        {/* 1. Responsable del Tratamiento */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono text-cyan-300 font-bold text-sm">
              01
            </span>
            <h2 className="text-xl font-display font-bold text-white">
              1. Identificación del Responsable del Tratamiento
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            El responsable legal y operativo del tratamiento de los datos personales recopilados a través de esta plataforma web y sus canales de comunicación es:
          </p>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs sm:text-sm space-y-2.5 font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong>Razón Social:</strong> Site On Tecnología SpA
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong>Domicilio Operativo:</strong> Viña del Mar, Región de Valparaíso, Chile
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong>Correo Oficial de Privacidad:</strong>{' '}
                <a href="mailto:contacto@siteon.cl" className="text-cyan-400 hover:underline">
                  contacto@siteon.cl
                </a>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong>Teléfono / WhatsApp Directo:</strong> +56 9 5832 4650
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong>Sitio Web Oficial:</strong> https://www.siteon.cl
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Todas las operaciones de tratamiento se ajustan a las directrices dictadas por la legislación chilena y están sujetas a la supervigilancia y fiscalización de la <strong>Agencia de Protección de Datos Personales</strong> de la República de Chile.
          </p>
        </section>

        {/* 2. Datos Recolectados y Principio de Minimización */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono text-cyan-300 font-bold text-sm">
              02
            </span>
            <h2 className="text-xl font-display font-bold text-white">
              2. Datos Personales Recolectados y Principio de Minimización
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            En virtud del principio de minimización (Art. 3 Ley 21.719), Site On solicita y trata únicamente los datos que resultan adecuados, pertinentes y estrictamente indispensables para atender solicitudes de cotización, diagnósticos tecnológicos y contratos de servicios TI:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300">
            <li>
              <strong className="text-white">Datos de Identificación y Contacto:</strong> Nombre y apellido de la persona de contacto, cargo en la empresa, nombre o razón social de la empresa, correo electrónico corporativo o personal, y teléfono móvil / WhatsApp.
            </li>
            <li>
              <strong className="text-white">Datos Técnicos de Dimensionamiento y Diagnóstico TI:</strong> Cantidad de usuarios o puestos de trabajo, número de servidores físicos o virtuales, requerimiento de redes Wi-Fi, necesidades de ciberseguridad, herramientas de colaboración (Microsoft 365 / Google Workspace) y rango presupuestario referencial ingresado en el Cotizador Inteligente.
            </li>
            <li>
              <strong className="text-white">Datos de Coordinación en Terreno:</strong> Dirección comercial o de dependencias de la empresa en la Región de Valparaíso o Región Metropolitana para la ejecución del diagnóstico técnico presencial gratuito.
            </li>
            <li>
              <strong className="text-white">Datos Técnicos de Conexión:</strong> Registros de conexión (logs), parámetros UTM de atribución de campañas y navegador con fines exclusivamente preventivos de seguridad de red y métricas agregadas de rendimiento del sitio.
            </li>
          </ul>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-400">
            <strong className="text-white">Aclaración de Exclusión:</strong> Site On <strong>no recopila datos sensibles</strong> (como datos de salud, opiniones políticas o convicciones religiosas) ni datos financieros confidenciales (números de tarjetas de crédito o claves bancarias) a través de formularios en su sitio web.
          </div>
        </section>

        {/* 3. Finalidades y Base de Licitud */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono text-cyan-300 font-bold text-sm">
              03
            </span>
            <h2 className="text-xl font-display font-bold text-white">
              3. Finalidades Específicas y Base de Licitud del Tratamiento
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            La base jurídica que sustenta el tratamiento de datos es el{' '}
            <strong className="text-white">consentimiento previo, libre, expreso, informado e inequívoco</strong>{' '}
            otorgado por el titular al enviar nuestros formularios (marcando la casilla de aceptación obligatoria), así como la{' '}
            <strong className="text-white">ejecución de medidas precontractuales indispensables</strong> a solicitud del interesado (preparación y entrega de cotizaciones y planes a la medida).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs sm:text-sm">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Generar y remitir cotizaciones formales de planes mensuales en UF (Site On Start, Business, Business Pro y Enterprise).</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Coordinar auditorías técnicas y diagnósticos de infraestructura TI 100% gratuitos para empresas.</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Prestar servicios de soporte técnico helpdesk, ciberseguridad, gestión de servidores y consultoría cloud.</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Emisión de facturación electrónica y cumplimiento de las obligaciones tributarias y contables legales (SII).</span>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-xs text-emerald-200 leading-relaxed">
            <strong>Cláusula de Prohibición de Comercialización y Anti-Spam:</strong> Site On Tecnología jamás vende, arrienda, comercializa ni cede bases de datos de prospectos o clientes a empresas de marketing o terceros. No realizamos llamadas no consentidas ni envíos masivos de spam.
          </div>
        </section>

        {/* 4. Seguridad de la Información y Almacenamiento */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono text-cyan-300 font-bold text-sm">
              04
            </span>
            <h2 className="text-xl font-display font-bold text-white">
              4. Medidas de Seguridad de la Información y Almacenamiento
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            Como empresa especialista en ciberseguridad e infraestructura TI, implementamos salvaguardas técnicas, administrativas y operativas de estándar corporativo para prevenir la pérdida, mal uso, alteración o acceso no autorizado a los datos:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-1">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Lock className="w-4 h-4 text-cyan-400" /> Cifrado en Tránsito y Reposo
              </div>
              <p className="text-slate-400 text-xs">
                Protocolo HTTPS con TLS 1.3 de extremo a extremo y cifrado de datos en reposo mediante AES-256 en bases de datos PostgreSQL (Supabase Cloud).
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-1">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Database className="w-4 h-4 text-cyan-400" /> Políticas Row Level Security (RLS)
              </div>
              <p className="text-slate-400 text-xs">
                Aislamiento estricto de tablas y registros mediante políticas RLS a nivel de motor de base de datos para restringir cualquier acceso no autenticado.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-1">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Server className="w-4 h-4 text-cyan-400" /> Control de Acceso Basado en Roles (RBAC)
              </div>
              <p className="text-slate-400 text-xs">
                El acceso a solicitudes y cotizaciones está limitado exclusivamente a personal técnico autorizado con credenciales robustas y autenticación protegida.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-1">
              <div className="flex items-center gap-2 text-white font-semibold">
                <RefreshCw className="w-4 h-4 text-cyan-400" /> Respaldos y Resiliencia
              </div>
              <p className="text-slate-400 text-xs">
                Respaldos periódicos automatizados y protocolos de recuperación ante incidentes (BCP/DRP) para salvaguardar la continuidad operacional.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Plazo de Conservación */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono text-cyan-300 font-bold text-sm">
              05
            </span>
            <h2 className="text-xl font-display font-bold text-white">
              5. Plazo de Conservación y Eliminación Segura
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            En cumplimiento del principio de conservación limitada:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300">
            <li>
              <strong className="text-white">Datos de Prospectos y Cotizaciones:</strong> Los antecedentes de cotizaciones no formalizadas se conservan por un plazo máximo de <strong>12 meses</strong> para permitir el seguimiento comercial y la revisión de factibilidad técnica, tras lo cual son eliminados o anonimizados de forma segura.
            </li>
            <li>
              <strong className="text-white">Datos de Clientes Activos:</strong> Se conservan durante toda la vigencia de la relación contractual de soporte y durante los plazos legalmente obligatorios para fines tributarios y contables establecidos por el Servicio de Impuestos Internos (SII) y el Código de Comercio chileno.
            </li>
            <li>
              <strong className="text-white">Supresión a Solicitud:</strong> Cualquier titular puede solicitar la eliminación anticipada de sus datos de contacto en cualquier momento, siempre que no subsista una obligación legal de conservación.
            </li>
          </ul>
        </section>

        {/* 6. Derechos de los Titulares (ARCO-P) */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono text-cyan-300 font-bold text-sm">
              06
            </span>
            <h2 className="text-xl font-display font-bold text-white">
              6. Derechos de los Titulares (Derechos ARCO-P)
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            De conformidad con la Ley N° 21.719 y la Ley N° 19.628, los titulares de datos personales pueden ejercer gratuitamente en cualquier momento los siguientes derechos:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-1">
              <strong className="text-white font-semibold flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-400" /> Derecho de Acceso
              </strong>
              <p className="text-slate-400">
                Obtener confirmación sobre si sus datos están siendo tratados y acceder a los detalles específicos del tratamiento.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-1">
              <strong className="text-white font-semibold flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> Derecho de Rectificación
              </strong>
              <p className="text-slate-400">
                Solicitar la corrección o actualización de antecedentes inexactos, desactualizados o incompletos.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-1">
              <strong className="text-white font-semibold flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-cyan-400" /> Derecho de Cancelación / Supresión
              </strong>
              <p className="text-slate-400">
                Exigir la eliminación definitiva de sus datos personales cuando ya no sean necesarios para las finalidades informadas o cuando revoque su consentimiento.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-1">
              <strong className="text-white font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" /> Derecho de Oposición
              </strong>
              <p className="text-slate-400">
                Oponerse al tratamiento de sus datos para determinados fines cuando existan motivos legítimos.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-1 sm:col-span-2">
              <strong className="text-white font-semibold flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-cyan-400" /> Derecho de Portabilidad
              </strong>
              <p className="text-slate-400">
                Solicitar una copia de sus datos personales en un formato electrónico estructurado, genérico, interoperable y de uso común.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-cyan-500/30 bg-slate-950 p-4 space-y-2">
            <h4 className="font-display font-semibold text-white text-sm flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" /> Canal Gratuito para Ejercer sus Derechos
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Para ejercer cualquiera de estos derechos, basta enviar un correo electrónico a{' '}
              <a
                href="mailto:contacto@siteon.cl?subject=Ejercicio%20Derechos%20Ley%2021.719%20Protección%20de%20Datos"
                className="text-cyan-400 underline font-semibold"
              >
                contacto@siteon.cl
              </a>{' '}
              o comunicarse a través de nuestro WhatsApp oficial{' '}
              <a
                href="https://wa.me/56958324650?text=Hola,%20solicito%20información%20sobre%20el%20ejercicio%20de%20mis%20derechos%20según%20la%20Ley%2021.719"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 underline font-semibold"
              >
                +56 9 5832 4650
              </a>{' '}
              indicando su nombre completo, empresa (si corresponde) y el derecho que desea hacer valer. Su solicitud será atendida y respondida formalmente dentro de los plazos legales aplicables.
            </p>
          </div>
        </section>

        {/* 7. Cookies y Tecnologías de Almacenamiento Local */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono text-cyan-300 font-bold text-sm">
              07
            </span>
            <h2 className="text-xl font-display font-bold text-white">
              7. Cookies y Tecnologías de Almacenamiento Local
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            El sitio web <strong className="text-white">siteon.cl</strong> utiliza exclusivamente mecanismos de almacenamiento local y cookies técnicas estrictamente necesarias para el correcto funcionamiento de la plataforma:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-300">
            <li>
              <strong className="text-white">Persistencia del Cotizador Inteligente:</strong> Almacenamiento temporal de las opciones seleccionadas (número de puestos, servidores, extras) para que el usuario no pierda el cálculo al navegar entre secciones.
            </li>
            <li>
              <strong className="text-white">Seguridad de Sesión Administrativa:</strong> Cookies cifradas `httpOnly` y `SameSite=Lax` para la autenticación segura del panel administrativo interno.
            </li>
            <li>
              <strong className="text-white">Ausencia de Rastreadores Publicitarios:</strong> No empleamos píxeles de remarketing invasivos ni compartimos historiales de navegación con corredores de datos publicitarios.
            </li>
          </ul>
        </section>

        {/* 8. Autoridad de Control y Reclamos */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono text-cyan-300 font-bold text-sm">
              08
            </span>
            <h2 className="text-xl font-display font-bold text-white">
              8. Autoridad de Control y Reclamos
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            Si el titular considera que el tratamiento de sus datos vulnera la legislación chilena o que su requerimiento no ha sido atendido en conformidad a la ley, tiene el derecho de recurrir ante la{' '}
            <strong className="text-white">Agencia de Protección de Datos Personales</strong> o deducir las acciones legales correspondientes ante los tribunales ordinarios de justicia de la República de Chile.
          </p>
        </section>

        {/* 9. Enlaces Externos y Modificaciones */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono text-cyan-300 font-bold text-sm">
              09
            </span>
            <h2 className="text-xl font-display font-bold text-white">
              9. Enlaces a Plataformas de Terceros y Vigencia
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            Nuestro sitio web puede contener enlaces o accesos a plataformas de terceros (como el chat directo de WhatsApp o integraciones con Microsoft 365). Dichas plataformas cuentan con sus propias políticas de privacidad independientes, por lo que recomendamos revisar sus respectivos términos al interactuar con ellas.
          </p>
          <p className="text-sm leading-relaxed text-slate-400">
            Site On Tecnología se reserva el derecho de actualizar o adecuar la presente política ante futuras modificaciones legislativas o mejoras en nuestros sistemas de seguridad. Cualquier cambio sustancial será publicado oportunamente en esta misma dirección web con indicación de la fecha de última actualización.
          </p>
        </section>

        {/* Botones de Navegación y Volver */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Inicio
          </Link>
          <Link
            href="/#contacto"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
          >
            <FileText className="w-4 h-4" />
            Solicitar Diagnóstico TI Gratuito
          </Link>
        </div>

      </div>
    </div>
  );
}
