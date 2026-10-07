# Embudo 3 guías → llamada de ayuda

Squeeze page + thank-you page para entregar las 3 guías y abrir la llamada de ayuda gratuita.

## Qué falta para encender

Los 3 PDF ya están en `/guias/` y cableados en `assets/config.js` → `window.GUIAS`
(rutas relativas, funcionan en cualquier dominio). Falta:

1. **Conectar el repo a Netlify** (deploy continuo, como los otros sitios). Netlify asigna
   el dominio; ahí queda el link del embudo.
2. **Crear el Apps Script** con `apps-script/Codigo.gs`, publicarlo como aplicación web
   (acceso: cualquier persona) y pegar la URL `/exec` en `assets/config.js` → `SCRIPT_URL`.
3. En el Apps Script: Configuración del proyecto → Propiedades del script →
   `GUIA_1`, `GUIA_2`, `GUIA_3` con las URLs completas de los PDF una vez haya dominio
   (ej. `https://TU-DOMINIO/guias/manual-del-pimp.pdf`). Son las que van en el correo.
4. Ejecutar la función `preparar()` una vez, para crear la pestaña y dar permisos.
5. Poner el enlace real de la política de privacidad en el pie del formulario.

Los 3 archivos: `guias/manual-del-pimp.pdf`, `guias/como-hablar-con-una-mujer.pdf`,
`guias/como-leer-la-conversacion.pdf`.

## Eventos que dispara

| Evento | Cuándo |
|---|---|
| `PageView` | carga cualquiera de las dos páginas |
| `Lead` | el formulario se guardó bien (no al hacer clic) |
| `DescargaGuia` | clic en cada botón de descarga |
| `ClicLlamada` | clic en el botón de la llamada |
| `Schedule` | lo dispara el bot, solo cuando la cita existe en el calendario |

Píxel: `1785944622649398` (el mismo del bot y de la clase, para que los eventos se acumulen juntos).
