/**
 * Embudo de las 3 guías → hoja dadafsi-leads, pestaña "Guias 3".
 *
 * Proyecto de Apps Script INDEPENDIENTE (no toca el del bot ni el de la clase).
 * Instalación: ver README.md del repo.
 */

const SHEET_ID = '1xzKA7P-MUpTaIxIy19ZHe6uf0Ih1XpdI5597xj5tq6Y'; // dadafsi-leads
const PESTANA = 'Guias 3';
const IMAN = '3 guías para conversar con una mujer';

const COLUMNAS = [
  'Fecha registro', 'Nombre', 'Correo', 'WhatsApp', 'País', 'Código país',
  'Origen', 'Zona horaria', 'Autorizó datos',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'fbclid',
  'Contactado', 'Respondió', 'Agendó', 'Asistió', 'Compró', 'Monto USD'
];
const COL = {}; COLUMNAS.forEach((c, i) => COL[c] = i + 1);

/* ---------- Ejecutar UNA vez a mano para crear la pestaña y dar permisos ---------- */
function preparar() {
  const hoja = obtenerHoja_();
  Logger.log('Pestaña lista: ' + hoja.getName() + ' — inscritos: ' + contarInscritos_(hoja));
}

/* ---------- GET: solo para comprobar que el script responde ---------- */
function doGet(e) {
  return json_({ ok: true, iman: IMAN });
}

/* ---------- POST: nuevo registro ---------- */
function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, estado: 'datos_invalidos' }); }

  const nombre = limpiar_(d.nombre, 80);
  const correo = limpiar_(d.correo, 120).toLowerCase();
  const whatsapp = limpiar_(d.whatsapp, 20);
  if (nombre.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo) || !/^\+\d{7,16}$/.test(whatsapp) || d.acepto !== true) {
    return json_({ ok: false, estado: 'datos_invalidos' });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const hoja = obtenerHoja_();

    // ¿Ya estaba registrado? → no duplica, igual lo deja pasar a gracias
    const n = hoja.getLastRow() - 1;
    if (n > 0) {
      const correos = hoja.getRange(2, COL['Correo'], n, 1).getValues().flat().map(String);
      if (correos.indexOf(correo) !== -1) return json_({ ok: true, estado: 'ya_registrado' });
    }

    const fila = [];
    fila[COL['Fecha registro'] - 1] = Utilities.formatDate(new Date(), 'America/Bogota', 'yyyy-MM-dd HH:mm');
    fila[COL['Nombre'] - 1] = nombre;
    fila[COL['Correo'] - 1] = correo;
    fila[COL['WhatsApp'] - 1] = whatsapp;
    fila[COL['País'] - 1] = limpiar_(d.pais, 40);
    fila[COL['Código país'] - 1] = limpiar_(d.paisCodigo, 2);
    fila[COL['Origen'] - 1] = limpiar_(d.origen, 40);
    fila[COL['Zona horaria'] - 1] = limpiar_(d.zonaHoraria, 60);
    fila[COL['Autorizó datos'] - 1] = 'Sí';
    // De qué anuncio vino. Sin esto no se sabe qué campaña trae compradores.
    const c = (d && typeof d.campana === 'object' && d.campana) ? d.campana : {};
    fila[COL['utm_source'] - 1]   = limpiar_(c.utm_source || c.src || '', 60);
    fila[COL['utm_medium'] - 1]   = limpiar_(c.utm_medium || '', 60);
    fila[COL['utm_campaign'] - 1] = limpiar_(c.utm_campaign || '', 80);
    fila[COL['utm_content'] - 1]  = limpiar_(c.utm_content || '', 80);
    fila[COL['fbclid'] - 1]       = limpiar_(c.fbclid || '', 120);
    fila[COL['Contactado'] - 1] = '';
    fila[COL['Respondió'] - 1] = '';
    fila[COL['Agendó'] - 1] = '';
    fila[COL['Asistió'] - 1] = '';
    fila[COL['Compró'] - 1] = '';
    fila[COL['Monto USD'] - 1] = '';
    hoja.appendRow(fila.map(celdaSegura_));
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }

  try { correoConfirmacion_(nombre, correo); } catch (err) { Logger.log('Correo no enviado: ' + err); }
  return json_({ ok: true, estado: 'registrado' });
}

/* ---------- Internas ---------- */
function obtenerHoja_() {
  const libro = SpreadsheetApp.openById(SHEET_ID);
  let hoja = libro.getSheetByName(PESTANA);
  if (!hoja) {
    hoja = libro.insertSheet(PESTANA);
    hoja.getRange(1, 1, 1, COLUMNAS.length).setValues([COLUMNAS])
      .setBackground('#1C1612').setFontColor('#D4B98C').setFontWeight('bold');
    hoja.setFrozenRows(1);
    hoja.getRange('D:D').setNumberFormat('@'); // WhatsApp como texto, conserva el +
    // Columnas que llenas tú después de la clase, en otro color
    hoja.getRange(1, COL['Asistió'], 1, 3).setBackground('#3A2E24');
    hoja.setColumnWidths(1, COLUMNAS.length, 140);
    hoja.setColumnWidth(COL['Correo'], 220);
  }
  return hoja;
}

function contarInscritos_(hoja) {
  return Math.max(0, hoja.getLastRow() - 1);
}

/* Los links de las guías viven aquí, en las propiedades del script:
   Configuración del proyecto → Propiedades del script → GUIA_1, GUIA_2, GUIA_3 */
function correoConfirmacion_(nombre, correo) {
  const P = PropertiesService.getScriptProperties();
  const g1 = P.getProperty('GUIA_1') || '';
  const g2 = P.getProperty('GUIA_2') || '';
  const g3 = P.getProperty('GUIA_3') || '';
  const boton = function (url, texto) {
    if (!url) return '';
    return '<p><a href="' + url + '" style="color:#ECE4D6;border:1px solid #A7998A;padding:10px 16px;' +
           'text-decoration:none;display:inline-block">' + texto + '</a></p>';
  };
  MailApp.sendEmail({
    to: correo,
    name: 'David | DADAFSI',
    subject: 'Tus 3 guías',
    htmlBody: plantilla_(
      'Aquí están, ' + nombre.split(' ')[0] + '.',
      '<p>Estas son las tres guías. Guarda este correo: aquí van a estar siempre.</p>' +
      boton(g1, 'Manual del PIMP') +
      boton(g2, 'Guía completa de conversación') +
      boton(g3, 'Qué decirle a una chica') +
      '<p style="color:#A7998A">Si quieres que revisemos tu caso en concreto, respóndeme este correo contándome qué está pasando. Lo leo yo.</p>'
    )
  });
}

function plantilla_(titulo, cuerpo) {
  return '<div style="background:#1C1612;padding:32px 24px;font-family:Helvetica,Arial,sans-serif;color:#ECE4D6;line-height:1.6">' +
    '<div style="max-width:520px;margin:0 auto;border:1px solid #5a4a38;padding:28px">' +
    '<div style="color:#A7998A;font-size:13px">@dadafsi</div>' +
    '<h1 style="font-family:Didot,\'Bodoni 72\',Georgia,serif;font-style:italic;font-weight:400;font-size:30px;margin:24px 0">' + titulo + '</h1>' +
    cuerpo + '</div></div>';
}

function limpiar_(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u001F]/g, '').trim().slice(0, max);
}

// Evita que un texto que empiece por = + - @ se ejecute como fórmula
function celdaSegura_(v) {
  return (typeof v === 'string' && /^[=+\-@]/.test(v)) ? "'" + v : v;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
