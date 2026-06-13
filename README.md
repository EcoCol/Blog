# EcoPeques — Blog infantil sobre medio ambiente

Sitio listo para usar: Home, Categorías, Sobre mí y Contacto, con un sistema
de publicaciones muy fácil de mantener.

## Estructura del proyecto

```
ecopeques-blog/
├── index.html       → estructura general (header, menú, footer). No tocar.
├── styles.css        → todo el diseño (colores, tipografías, etc).
├── posts-data.js     → ⭐ ACÁ SE AGREGAN LOS POSTS NUEVOS ⭐
└── app.js            → arma las páginas automáticamente. No tocar.
```

## Cómo agregar una publicación nueva

1. Abrí `posts-data.js` con cualquier editor de texto (incluso el Bloc de notas).
2. Copiá uno de los bloques que empiezan con `{` y terminan con `},` dentro
   del arreglo `POSTS`.
3. Pegalo arriba o abajo de los demás, dentro de los corchetes `[ ]`.
4. Cambiá:
   - `slug`: un identificador único sin espacios ni tildes (ej: `"mi-nuevo-post"`)
   - `title`: el título
   - `category`: alguna de `Reciclaje`, `Animales`, `Energía`, `Manualidades`, `Naturaleza`
     (o creá una categoría nueva agregándola en `CATEGORIES`, al principio del archivo)
   - `date`: fecha en formato `"AAAA-MM-DD"`
   - `emoji`: un emoji representativo
   - `excerpt`: resumen corto (1-2 frases)
   - `content`: el texto completo (podés usar `<p>`, `<strong>`, `<ul><li>`)
5. Guardá el archivo.

El nuevo post va a aparecer automáticamente en el Inicio (si es uno de los
más recientes), en Categorías y va a tener su propia página en
`#post/tu-slug`. No hace falta crear archivos nuevos ni tocar el diseño.

## Cómo ver el sitio en tu computadora

Como el sitio carga `posts-data.js` y `app.js` como archivos separados,
algunos navegadores no los cargan bien si abrís `index.html` haciendo
doble clic (por seguridad). La forma más simple de probarlo:

1. Instalá [VS Code](https://code.visualstudio.com/) y la extensión
   "Live Server" (o similar), abrí la carpeta y hacé clic en "Go Live".
2. O, si tenés Python instalado, abrí una terminal en esta carpeta y
   ejecutá: `python3 -m http.server 8000`, después abrí
   `http://localhost:8000` en el navegador.

## Cómo publicarlo

### Opción A — Hosting gratuito de archivos estáticos (recomendado)
Servicios como GitHub Pages, Netlify o Vercel permiten subir esta carpeta
tal cual y obtener una URL pública gratis. Esta es la forma más simple de
usar exactamente este sitio.

### Opción B — Blogger
Blogger no permite subir esta carpeta directamente (funciona con su propio
sistema de plantillas y entradas). Si preferís usar Blogger, lo más práctico
es:
- Crear cada publicación de `posts-data.js` como una "Entrada" nueva en
  Blogger (copiando el texto de `content`), o
- Adaptar el diseño de `styles.css` como una plantilla personalizada de
  Blogger (requiere ajustes adicionales).

Si querés, te puedo ayudar con cualquiera de las dos opciones.

## Personalización rápida

- **Colores**: están definidos como variables al principio de `styles.css`
  (sección `:root`), por ejemplo `--color-sky`, `--color-leaf`, etc.
- **Nombre del blog / logo**: en `index.html`, dentro de `<a class="logo">`.
- **Texto del Inicio**: en `app.js`, función `renderHome()`.
- **Texto de "Sobre mí"**: en `app.js`, función `renderSobre()`.
- **Redes sociales y email de contacto**: en `app.js`, función `renderContacto()`.
