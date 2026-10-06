# Embudo 3 guías → llamada de ayuda

Squeeze page + thank-you page para entregar las 3 guías y abrir la llamada de ayuda gratuita.

## Qué falta para encender

1. **Subir los 3 PDF** y poner sus URLs en `assets/config.js` → `window.GUIAS`.
2. **Crear el Apps Script** con `apps-script/Codigo.gs`, publicarlo como aplicación web
   (acceso: cualquier persona) y pegar la URL `/exec` en `assets/config.js` → `SCRIPT_URL`.
3. En el Apps Script: Configuración del proyecto → Propiedades del script →
   `GUIA_1`, `GUIA_2`, `GUIA_3` con las mismas URLs (son las que van en el correo).
4. Ejecutar la función `preparar()` una vez, para crear la pestaña y dar permisos.
5. Poner el enlace real de la política de privacidad en el pie del formulario.

## Eventos que dispara

| Evento | Cuándo |
|---|---|
| `PageView` | carga cualquiera de las dos páginas |
| `Lead` | el formulario se guardó bien (no al hacer clic) |
| `DescargaGuia` | clic en cada botón de descarga |
| `ClicLlamada` | clic en el botón de la llamada |
| `Schedule` | lo dispara el bot, solo cuando la cita existe en el calendario |

Píxel: `1785944622649398` (el mismo del bot y de la clase, para que los eventos se acumulen juntos).
