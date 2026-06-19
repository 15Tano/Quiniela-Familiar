# Quiniela Familiar ⚽

App sencilla para llevar la quiniela del Mundial entre la familia: partidos, participantes, predicciones de cada uno, resultados reales y la tabla de posiciones, todo calculado solo.

## Cómo se reparten los puntos

- **Marcador exacto** → 2 puntos
- **Le atina al ganador, pero no al marcador** → 1 punto
- **No le atina a nada** → 0 puntos

## Cómo correrla en tu computadora

Necesitas tener Node.js instalado (versión 18 o más reciente, desde nodejs.org).

```bash
npm install
```

Antes de levantarla, sigue la siguiente sección para conectar la base de datos compartida — sin eso la app solo muestra una pantalla de "falta configurar". Luego:

```bash
npm run dev
```

Eso abre la app en http://localhost:5173 — ábrela en tu navegador y listo.

## Configurar la base de datos compartida (Firebase)

Para que **todos vean la misma tabla en vivo desde su propio celular**, esta app usa [Firebase Firestore](https://firebase.google.com) como base de datos compartida en la nube — es gratis para este tamaño de uso. Necesitas crear tu propio proyecto (gratis, con tu cuenta de Google) y pegar sus credenciales en un archivo `.env`. Son cinco minutos:

1. Ve a [console.firebase.google.com](https://console.firebase.google.com) y crea un proyecto nuevo (el nombre no importa, ej. "quiniela-familiar").
2. En el menú de la izquierda entra a **Firestore Database** → **Crear base de datos**. Elige la región más cercana (ej. `us-central` o `southamerica-east1`) y arranca en modo producción.
3. Ve a **Reglas** (dentro de Firestore) y pega esto, para que solo se pueda leer/escribir el documento de esta quiniela (cualquiera con el link puede jugar, nadie más puede tocar el resto de tu proyecto):

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /quinielas/{room} {
         allow read, write: if true;
       }
     }
   }
   ```

   > Esto deja la quiniela abierta a cualquiera que tenga el link (como tener la hojita pegada en el refri). Si más adelante quieres pedir una contraseña o login, se puede agregar Firebase Authentication — avísame.

4. Ve a **Configuración del proyecto** (el engranito) → baja hasta "Tus apps" → clic en el ícono `</>` para agregar una app web. Ponle un nombre y dale "Registrar app".
5. Firebase te va a mostrar un bloque `firebaseConfig` con varios valores (`apiKey`, `authDomain`, etc). Cópialos.
6. En este proyecto, copia el archivo `.env.example` a uno nuevo llamado `.env` y pega cada valor:

   ```bash
   cp .env.example .env
   ```

   ```
   VITE_FIREBASE_API_KEY=el-valor-de-apiKey
   VITE_FIREBASE_AUTH_DOMAIN=el-valor-de-authDomain
   VITE_FIREBASE_PROJECT_ID=el-valor-de-projectId
   VITE_FIREBASE_STORAGE_BUCKET=el-valor-de-storageBucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=el-valor-de-messagingSenderId
   VITE_FIREBASE_APP_ID=el-valor-de-appId
   ```

7. Corre `npm run dev` de nuevo. Si todo quedó bien, en vez de la pantalla de "Falta conectar la base de datos" vas a ver la app normal, con un indicador "En vivo" junto al título.

### Y en Vercel

El archivo `.env` **no se sube** al repositorio (está en `.gitignore` a propósito, para no exponer tus credenciales). En Vercel tienes que volver a pegar esas mismas variables a mano:

1. En tu proyecto de Vercel ve a **Settings → Environment Variables**.
2. Agrega las mismas 6 variables (`VITE_FIREBASE_API_KEY`, etc.) con los mismos valores que pusiste en tu `.env`.
3. Vuelve a desplegar (Vercel lo hace solo al guardar, o dale "Redeploy").

Con esto, en cuanto cualquiera de la familia abra tu URL de Vercel desde su celular, va a ver — y poder editar — los mismos partidos, participantes y resultados que tú, actualizándose en tiempo real conforme cada quien va capturando.

## Respaldo: exportar e importar datos

Aunque ahora los datos viven en Firebase (no solo en tu navegador), de todas formas hay botones de **"Exportar datos"** e **"Importar datos"** al final de la página. Sirven para:

- Tener un respaldo en tu computadora por si acaso (descarga un `.json`).
- Mover datos que ya hayas capturado en `localhost` hacia tu base de datos de producción la primera vez (expórtalos en local, impórtalos ya conectado a Firebase).
- Restaurar todo si algo sale mal.

**Importante:** importar un archivo reemplaza lo que TODOS están viendo en ese momento, no solo lo tuyo — la app te pide confirmación antes de hacerlo, justo para evitar accidentes.

Si quieres borrar todo y empezar de cero (por ejemplo, para un torneo nuevo), usa el botón "Reiniciar todos los datos (para todos)" al final de la página — igual, afecta a todos los que tengan el link abierto.

## Partidos ya cargados

Vienen precargados los 24 partidos de la fase de grupos que mandaste, con fecha estimada a partir de "mañana". Puedes editar la fecha, el grupo, o agregar/quitar partidos desde la pestaña Partidos.

## Estructura del proyecto

```
src/
  firebase/        configuración y credenciales de Firebase (via .env)
  data/            equipos + banderas, partidos iniciales
  hooks/           sincronización en tiempo real con Firestore
  utils/           lógica de puntos, tabla y respaldo en JSON
  components/      cada pestaña y piezas visuales (marcador LED, navegación, etc.)
  App.jsx          ensambla todo
  index.css        tema visual (glassmorphism, tipografías, colores)
```
