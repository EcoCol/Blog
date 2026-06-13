/* ========================================================================
   POSTS-DATA.JS
   ------------------------------------------------------------------------
   Este es el ÚNICO archivo que necesitás editar para agregar,
   modificar o borrar publicaciones del blog. ¡No hace falta tocar nada
   de diseño ni de programación!

   PARA AGREGAR UN POST NUEVO:
   1. Copiá uno de los bloques { ... } de abajo (incluye las llaves).
   2. Pegalo dentro de los corchetes [ ... ], antes o después de otro.
   3. Cambiá los datos (título, texto, categoría, etc).
   4. Guardá el archivo. ¡Listo! El post aparece solo en el Inicio,
      en Categorías y tiene su propia página.

   CAMPOS:
   - slug: identificador único, sin espacios ni acentos (ej: "mi-post-2")
   - title: título del post
   - category: una de las categorías definidas en CATEGORIES (abajo)
   - date: fecha en formato "AAAA-MM-DD" (se muestra formateada)
   - emoji: un emoji que represente el post (aparece como ícono)
   - image: (OPCIONAL) ruta a una imagen de portada, ej: "images/mi-foto.jpg"
            Si no la incluís, el post se muestra solo con el emoji.
   - excerpt: resumen corto (1-2 frases) que se ve en las tarjetas
   - content: el texto completo del post. Podés usar HTML simple:
       <p>...</p> para párrafos
       <strong>...</strong> para negrita
       <ul><li>...</li></ul> para listas
       <img src="images/foto.jpg" alt="descripción"> para una imagen
       <figure><img src="images/foto.jpg" alt="..."><figcaption>Pie de
         foto</figcaption></figure> para imagen + texto debajo
   ======================================================================== */

// Categorías disponibles y su color de acento.
// Para agregar una categoría nueva, sumá un objeto acá y usá ese
// "name" en el campo "category" de tus posts.
const CATEGORIES = [
  { name: "Reciclaje",    color: "leaf",  emoji: "♻️" },
  { name: "Animales",     color: "coral", emoji: "🦔" },
  { name: "Energía",      color: "sun",   emoji: "💡" },
  { name: "Manualidades", color: "berry", emoji: "🌻" },
  { name: "Naturaleza",   color: "sky",   emoji: "🌳" },
   { name: "Números",    color: "leaf",   emoji: "💡"},
];

const POSTS = [
  {
    slug: "reciclaje-divertido",
    title: "¿Qué es el reciclaje y por qué es una superaventura?",
    category: "Reciclaje",
    date: "2026-06-01",
    emoji: "♻️",
    excerpt: "Descubrí cómo la basura puede transformarse en cosas nuevas, ¡y cómo vos podés ser parte de esa magia todos los días!",
    content: `
      <p>¿Sabías que muchas cosas que tiramos a la basura pueden transformarse en
      objetos nuevos? A esa magia la llamamos <strong>reciclaje</strong>, ¡y vos
      podés ser parte de ella!</p>

      <p>Cuando separamos la basura en distintos colores de tachos, le damos a
      cada material la oportunidad de tener una segunda vida:</p>

      <ul>
        <li>🟦 <strong>Papel y cartón:</strong> pueden convertirse en cuadernos nuevos.</li>
        <li>🟨 <strong>Plástico:</strong> puede transformarse en juguetes o mochilas.</li>
        <li>🟩 <strong>Vidrio:</strong> ¡se puede derretir y usar una y otra vez!</li>
        <li>🟥 <strong>Metales:</strong> las latitas pueden volver a ser bicicletas.</li>
      </ul>

      <p>La próxima vez que termines de tomar un jugo, en vez de tirar el
      envase a cualquier tacho, pensá: <strong>"¿A qué tacho de color
      pertenezco?"</strong> Así ayudás a que ese material empiece su próxima
      aventura.</p>

      <p>¡Sos un superhéroe del planeta cada vez que reciclás! 🦸</p>
    `,
  },
  {
    slug: "heroes-del-bosque",
    title: "Los héroes secretos del bosque",
    category: "Animales",
    date: "2026-06-04",
    emoji: "🦔",
    excerpt: "Hay animales pequeñitos que cumplen tareas gigantes para que el bosque esté sano. ¡Conocelos!",
    content: `
      <p>En cada bosque viven pequeños héroes que trabajan en silencio para que
      todo funcione bien. ¡Vamos a conocer a algunos!</p>

      <p><strong>🐝 Las abejas:</strong> vuelan de flor en flor llevando polen.
      Gracias a ellas, las plantas pueden crecer frutas y semillas nuevas.</p>

      <p><strong>🐿️ Las ardillas:</strong> entierran semillas para comer
      después... ¡pero a veces se olvidan! Esas semillas se convierten en
      árboles nuevos.</p>

      <p><strong>🪱 Las lombrices:</strong> viven bajo tierra y la van
      removiendo, haciendo que la tierra sea más rica para que las plantas
      crezcan fuertes.</p>

      <p>Cada animal, por más pequeño que sea, tiene una misión importante.
      Por eso, cuidar su hogar (¡el bosque!) es cuidarlos a ellos también.</p>

      <p>💚 <strong>Misión EcoPeques:</strong> la próxima vez que veas un
      bichito en el jardín, observalo un ratito antes de espantarlo. ¡Quizás
      esté en medio de una misión súper importante!</p>
    `,
  },
  {
    slug: "campeones-del-ahorro-de-energia",
    title: "Cómo convertirte en un campeón del ahorro de energía",
    category: "Energía",
    date: "2026-06-07",
    emoji: "💡",
    excerpt: "Apagar una luz puede parecer algo chiquito, pero sumando pequeñas acciones logramos grandes cambios. ¡Sumate al desafío!",
    content: `
      <p>La energía que usamos en casa (para prender luces, cargar la tablet o
      ver tele) muchas veces viene de procesos que generan humo y afectan al
      planeta. Por suerte, ¡hay un montón de formas divertidas de cuidarla!</p>

      <p><strong>Desafío de los 5 días:</strong> probá hacer una de estas
      misiones cada día durante una semana:</p>

      <ul>
        <li>Día 1: Apagá la luz de cada cuarto cuando salgas de él.</li>
        <li>Día 2: Aprovechá la luz del sol en vez de prender lámparas.</li>
        <li>Día 3: Desenchufá los cargadores cuando no los uses.</li>
        <li>Día 4: Cerrá bien la heladera (¡no la dejes abierta pensando!).</li>
        <li>Día 5: Contale a tu familia un truco de ahorro que aprendiste hoy.</li>
      </ul>

      <p>Si toda tu familia participa, al final de la semana van a poder
      compararla con la del mes anterior y ver cuánta energía ahorraron entre
      todos. ¡Cada granito de arena suma!</p>
    `,
  },
  {
    slug: "jardin-con-material-reciclado",
    title: "Creá tu propio mini jardín con material reciclado",
    category: "Manualidades",
    date: "2026-06-10",
    emoji: "🌻",
    excerpt: "Con botellas, cajas de huevos y un poco de tierra podés armar un jardín propio. ¡Te mostramos cómo, paso a paso!",
    content: `
      <p>¿Tenés botellas de plástico vacías o cajas de huevos por casa? ¡Son el
      punto de partida perfecto para tu propio mini jardín!</p>

      <p><strong>Vas a necesitar:</strong></p>
      <ul>
        <li>Una botella de plástico vacía y limpia</li>
        <li>Tierra para macetas</li>
        <li>Semillas (de albahaca, lechuga o flores son fáciles para empezar)</li>
        <li>Tijeras (¡con ayuda de un adulto!)</li>
        <li>Témperas o marcadores para decorar</li>
      </ul>

      <p><strong>Pasos:</strong></p>
      <ul>
        <li>1. Con ayuda de un adulto, cortá la botella por la mitad.</li>
        <li>2. Decorá la parte de afuera como más te guste: ¡puede ser un
        monstruito, un cohete o lo que imagines!</li>
        <li>3. Llená la mitad inferior con tierra.</li>
        <li>4. Hacé un pequeño pozo y colocá las semillas, después tapalas con
        un poquito más de tierra.</li>
        <li>5. Regá con cuidado y ubicá tu maceta cerca de una ventana con
        sol.</li>
      </ul>

      <p>En unos días vas a empezar a ver brotes asomando. ¡Tomale fotos cada
      semana para ver cómo crece tu jardín reciclado! 🌱</p>
    `,
  },
];
