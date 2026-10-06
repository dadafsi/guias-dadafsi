/* ============================================================
   CONFIGURACIÓN — lo único que hay que tocar
   ============================================================ */
window.CLASE = {
  // URL del Apps Script publicado como aplicación web (termina en /exec).
  // Mientras esté vacía, el formulario no deja registrarse.
  // Pega aquí la URL del Apps Script NUEVO (el de este embudo), termina en /exec
  SCRIPT_URL: '',

  // ID del Pixel de Meta (solo números). Vacío = no carga el pixel.
  PIXEL_ID: '1785944622649398',

  // Datos del lead magnet
  TITULO: '3 guías para conversar con una mujer'
};

/* ---------- Pixel de Meta (se activa solo si hay PIXEL_ID) ---------- */
(function () {
  var id = window.CLASE.PIXEL_ID;
  if (!id) { window.fbq = function () {}; return; }
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', id);
  fbq('track', 'PageView');
})();

/* ---------- Dispara un evento una sola vez por sesion ---------- */
window.__fbOnce = {};
window.fbOnce = function (tipo, nombre, datos) {
  try {
    if (window.__fbOnce[nombre]) return;
    window.__fbOnce[nombre] = true;
    if (typeof fbq !== 'function') return;
    fbq(tipo, nombre, datos || {});
  } catch (e) {}
};

/* ---------- Links de descarga de las 3 guías ----------
   Reemplaza cada '' por la URL real del PDF (Netlify, Drive con enlace directo,
   donde sea). Mientras estén vacíos, los botones avisan que faltan. */
window.GUIAS = [
  { id: 'manual-pimp',   titulo: 'Manual del PIMP',                 url: '' },
  { id: 'conversacion',  titulo: 'Guía completa de conversación',   url: '' },
  { id: 'que-decirle',   titulo: 'Qué decirle a una chica',         url: '' }
];

/* A dónde lleva el botón de la llamada de ayuda */
window.LLAMADA_URL = 'https://dadafsi.netlify.app/?src=guias';

/* ---------- Origen y campaña: se guardan junto al lead ---------- */
window.origenLead = function () {
  var d = {};
  try {
    var p = new URLSearchParams(window.location.search);
    ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','src','fbclid'].forEach(function (k) {
      var v = p.get(k); if (v) d[k] = String(v).slice(0, 120);
    });
    if (!d.src && !d.utm_source) {
      var r = (document.referrer || '').toLowerCase();
      var ua = (navigator.userAgent || '').toLowerCase();
      if (r.indexOf('tiktok') > -1 || ua.indexOf('musical_ly') > -1 || ua.indexOf('bytedance') > -1) d.src = 'tiktok';
      else if (r.indexOf('instagram') > -1 || ua.indexOf('instagram') > -1) d.src = 'instagram';
      else if (r.indexOf('facebook') > -1 || ua.indexOf('fban') > -1 || ua.indexOf('fbav') > -1) d.src = 'facebook';
      else d.src = 'directo';
    }
  } catch (e) {}
  return d;
};

/* Guarda el nombre para saludar en la página de gracias */
window.recordarNombre = function (n) {
  try { sessionStorage.setItem('dadafsi_nombre', (n || '').trim().split(' ')[0]); } catch (e) {}
};
window.nombreGuardado = function () {
  try { return sessionStorage.getItem('dadafsi_nombre') || ''; } catch (e) { return ''; }
};
