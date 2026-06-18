# AnimeFav 🎌

AnimeFav es mi proyecto de fin de grado de 2º DAM. Es una aplicación web fullstack para gestionar y seguir series de anime, inspirada en MyAnimeList. Los usuarios pueden buscar animes, añadirlos a listas personalizadas, puntuar, escribir reseñas con sistema de likes y ver estadísticas de su consumo.

## 💡 ¿Por qué este proyecto?

Soy aficionada al anime y siempre he usado MyAnimeList para llevar el seguimiento de lo que veo. Quise crear mi propia versión aplicando todo lo aprendido en el ciclo: backend con Node.js, frontend con React, base de datos MySQL, Docker y autenticación con JWT.

## 🛠️ Stack tecnológico y justificación

| Tecnología | Uso | Por qué la elegí |
|---|---|---|
| Next.js 16 + React 19 | Frontend | Framework moderno con SSR, enrutamiento automático y gran ecosistema |
| Tailwind CSS | Estilos | Permite diseñar rápido sin escribir CSS desde cero |
| Node.js + Express | Backend/API REST | Ligero, rápido y perfecto para APIs. JavaScript en ambos lados del stack |
| MySQL 8 | Base de datos | Relacional, bien documentada y la más usada en el ciclo |
| Redis | Caché | Reduce llamadas repetidas a la API de Jikan y mejora el rendimiento |
| JWT | Autenticación | Estándar seguro para APIs REST sin necesidad de sesiones en servidor |
| Docker + Docker Compose | Infraestructura | Garantiza que el proyecto funciona igual en cualquier máquina |
| Cloudinary + Multer | Almacenamiento de imágenes | Subida y almacenamiento de avatares en la nube con URL pública persistente |
| Jikan API | Datos de anime | API pública y gratuita de MyAnimeList, sin necesidad de scraping |
| Jest + Supertest | Testing | Framework de testing estándar para Node.js |

## ✨ Funcionalidades

**Usuario:**
- Registro con verificación de email (Nodemailer + Mailtrap)
- Login con JWT
- Buscar animes por nombre con filtros por tipo y estado
- Ver detalle de anime (sinopsis, trailer, puntuación MAL, géneros)
- Añadir animes a listas predeterminadas (Viendo, Completado, En pausa, Abandonado, Pendiente) y listas personalizadas con color propio
- Seguimiento de episodios vistos
- Puntuar animes del 1 al 10
- Escribir y editar reseñas
- Ver reseñas de otros usuarios ordenadas por likes y dar like a las que te gusten
- Ver estadísticas personales (tiempo invertido, nota media, géneros favoritos)
- Calendario de emisiones de animes en seguimiento
- Avatar personalizable: elegir personaje de anime de una galería o subir foto propia (Cloudinary)
- Editar nombre de perfil

**Administrador:**
- Panel de administración con dashboard y gráfica de registros por día
- Gestión de usuarios: buscar por nombre o email, cambiar rol y eliminar
- Moderación de reseñas
- Estadísticas globales: animes más populares, mejor puntuados y usuarios más activos

## 🐳 Instalación

### Requisitos previos
- Docker Desktop instalado y corriendo
- Node.js 20 o superior

### Pasos

**1. Clona el repositorio:**
```bash
git clone https://github.com/paolafranco0123/animefav.git
cd animefav
```

**2. Crea el archivo `.env` en la raíz (copia `.env.example` y rellena los valores):**
```env
DB_HOST=db
DB_USER=animefav_user
DB_PASS=tu_password
DB_NAME=animefav_db
DB_ROOT_PASSWORD=tu_root_password
JWT_SECRET=un_secreto_seguro_largo
RESEND_API_KEY=tu_api_key_de_resend
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
NODE_ENV=development
```

**3. Levanta el backend (MySQL + Redis + API):**
```bash
docker-compose up --build -d
```

**4. Instala y arranca el frontend:**
```bash
cd frontend
npm install
npm run dev
```

**5. Abre el navegador en `http://localhost:3000`**

> **Nota:** La primera vez que arranca Docker crea automáticamente la base de datos con el schema de `database/schema.sql`.

## 🧪 Tests

```bash
cd backend
npm test
```

Los tests cubren:
- Validación de datos en registro y login
- Control de acceso a rutas protegidas
- Comportamiento ante credenciales incorrectas

## 🏗️ Arquitectura del proyecto

```
animefav/
├── backend/                  # API REST
│   ├── src/
│   │   ├── controllers/      # Lógica de cada endpoint
│   │   ├── models/           # Acceso a base de datos
│   │   ├── routes/           # Definición de rutas
│   │   ├── middleware/        # Auth JWT, control de roles y optionalAuth
│   │   ├── services/         # Lógica de negocio (Jikan, email)
│   │   └── config/           # Conexiones a BD, Redis y Cloudinary
│   ├── __tests__/            # Tests con Jest y Supertest
│   └── server.js             # Punto de entrada
├── frontend/                 # Next.js
│   └── src/
│       ├── app/              # Páginas (enrutamiento por carpetas)
│       ├── components/       # Navbar y componentes reutilizables
│       ├── context/          # AuthContext (estado global de usuario)
│       └── lib/              # Cliente API (axios)
├── database/
│   └── schema.sql            # Estructura de la base de datos
├── docker-compose.yml        # Orquestación de servicios
└── .env.example              # Variables de entorno de ejemplo
```

## 🗄️ Base de datos

La base de datos está en 3ª Forma Normal. El esquema incluye las siguientes tablas:

| Tabla | Descripción |
|---|---|
| Usuario | Datos de usuario con roles (user/admin), avatar y verificación de email |
| Anime | Animes importados desde Jikan |
| Lista | Listas de cada usuario (predeterminadas y personalizadas con color) |
| Lista_Anime | Relación entre listas y animes con seguimiento de episodios vistos |
| Puntuacion | Puntuaciones (1-10) de usuarios sobre animes |
| Resenia | Reseñas de texto con fecha |
| Resenia_Like | Tabla de likes en reseñas (clave compuesta id_usuario + id_resenia) |

## 🔐 Seguridad

- Contraseñas hasheadas con **bcrypt** (10 rondas de sal)
- Tokens **JWT** con expiración de 24 horas
- **authMiddleware**: verifica el JWT en todas las rutas protegidas
- **adminAuth**: verifica el rol admin para el panel de administración (encadenado con authMiddleware)
- **optionalAuth**: middleware propio para rutas públicas que se personalizan si el usuario está autenticado — por ejemplo, las reseñas son visibles para todos pero si estás logueado también ves si ya diste like
- Todas las queries SQL usan **prepared statements** para prevenir inyección SQL
- Variables sensibles en `.env`, nunca en el repositorio
- `.env.example` incluido con los nombres de las variables pero sin valores reales

## 🚀 Decisiones técnicas

**¿Por qué Redis?** La API de Jikan tiene un límite de 3 peticiones por segundo. Sin caché, cada vez que un usuario visita un anime se hace una llamada a Jikan. Con Redis cacheo los detalles de cada anime durante 24 horas, reduciendo el tiempo de respuesta de ~500ms a <10ms en accesos repetidos y eliminando los errores por rate limiting.

**¿Por qué Docker?** Garantiza que el proyecto funciona igual en cualquier máquina. Con un solo `docker-compose up --build` se levantan MySQL, Redis y el backend correctamente configurados y conectados entre sí.

**¿Por qué Next.js en lugar de React puro?** Next.js ofrece enrutamiento automático basado en carpetas (App Router), lo que simplifica mucho la organización del frontend. Además tiene mejor soporte para SEO y carga más rápida que una SPA de React puro.

**¿Por qué Cloudinary?** Para los avatares necesitaba un lugar donde almacenar las imágenes que suben los usuarios y obtener una URL pública persistente. Cloudinary con multer-storage-cloudinary sube la imagen directamente durante la petición HTTP y devuelve la URL que se guarda en la base de datos.

**¿Por qué optionalAuth?** Algunas rutas necesitan funcionar tanto para usuarios anónimos como para autenticados devolviendo respuestas distintas — las reseñas son el ejemplo principal. En lugar de duplicar el endpoint, creé un middleware propio que verifica el token si existe pero no bloquea la petición si no hay token o es inválido.

## 📝 Problemas resueltos durante el desarrollo

**La búsqueda siempre devolvía los mismos resultados**
El buscador siempre mostraba los mismos 25 animes sin importar lo que escribiera. Después de mucho revisar el código descubrí que el problema estaba en cómo construía la URL de la petición — cuando el nombre tenía espacios como "Dragon Ball Z", la URL se rompía y el backend recibía una búsqueda vacía. Lo arreglé usando el objeto `params` de axios en lugar de construir la URL a mano, que se encarga automáticamente de escapar los caracteres especiales.

**Credenciales expuestas en GitHub**
Sin querer subí el archivo `.env` con una API key real a un repositorio público. Borrar el archivo no era suficiente porque Git guarda el historial completo. Tuve que revocar la clave inmediatamente, limpiar todos los commits anteriores donde aparecía con `git filter-branch` y hacer un push forzado. Desde entonces siempre configuro el `.gitignore` antes del primer commit.

**Los cambios en el backend no se reflejaban al reiniciar Docker**
Durante el desarrollo me desesperé porque cambiaba código del backend y al reiniciar Docker los cambios no aparecían. Aprendí que Docker cachea las capas del contenedor y hay que usar `--build` para forzar la reconstrucción, y `--no-cache` cuando los cambios aún no aparecen.

**El avatar y el rol no aparecían al recargar la página**
Al recargar la página el avatar desaparecía y el botón de admin no aparecía aunque el usuario fuera admin. El problema era que al iniciar la app leía los datos del usuario de localStorage, que solo tenía nombre y email del momento del login pero no el avatar ni el rol. Lo resolví haciendo que al iniciar la app siempre llame al backend para obtener el perfil completo y actualizar el estado global.

**Errores de clave foránea al puntuar animes**
Al intentar puntuar un anime que nunca había abierto antes, el backend fallaba porque intentaba guardar la puntuación con un `id_anime` que no existía en mi base de datos local. Diseñé un sistema de importación automática: antes de cualquier operación, el sistema comprueba si el anime existe en la BD local y si no lo importa automáticamente desde Jikan de forma idempotente.

**Conflictos al sincronizar con el repositorio del instituto**
Después de semanas desarrollando por mi cuenta, al intentar sincronizar mi fork con el repo del instituto aparecieron más de 15 archivos en conflicto al mismo tiempo. Tuve que aprender a trabajar con múltiples remotos y a resolver cada conflicto manualmente.

**Certificado SSL de MyAnimeList caído**
Algunos animes no cargaban y devolvían error 500. Revisando los logs del backend vi que el error venía de Jikan, que no podía conectar con MyAnimeList porque su certificado SSL había expirado. Me llevó un rato darme cuenta de que no era un bug de mi código sino un problema externo.

**La paginación de React Query no actualizaba los resultados**
Al implementar los filtros de búsqueda, cuando cambiabas el tipo de anime o el estado los resultados no se actualizaban. El problema era que la `queryKey` de React Query no incluía los filtros, así que pensaba que era la misma query y devolvía el resultado cacheado anterior. Lo arreglé añadiendo los filtros a la `queryKey`.

**El panel de admin redirigía al inicio antes de cargar el usuario**
Al entrar directamente en `/admin` la página redirigía al inicio aunque fuera admin. Era una condición de carrera — el `useEffect` que redirige si el usuario no es admin se ejecutaba antes de que el AuthContext terminara de cargar el perfil. Lo solucioné añadiendo el estado `loading` a la condición: si todavía está cargando no redirige.

**Las estadísticas del admin no mostraban datos**
La pestaña de estadísticas no mostraba nada aunque había animes añadidos. Las queries SQL eran correctas pero un `console.log` de depuración se había colado dentro del template string de la query, así que MySQL intentaba ejecutarlo como SQL y fallaba.

**Docker tardaba muchísimo en arrancar**
En varios momentos Docker se quedaba colgado arrancando los contenedores sin dar ningún error claro. El backend intentaba conectarse a MySQL antes de que estuviera listo. El `healthcheck` del `docker-compose.yml` resuelve esto — hace que el backend espere a que MySQL responda correctamente antes de arrancar.

**Los node_modules se subieron al repositorio**
Al principio no tenía bien configurado el `.gitignore` y Git empezó a trackear los `node_modules`. Tuve que usar `git rm -r --cached` para decirle a Git que dejara de seguirlos sin borrarlos del disco.

**Los likes en reseñas no actualizaban la interfaz**
El botón de like ejecutaba la petición correctamente (status 200) pero el corazón no cambiaba de color ni el contador se actualizaba. El problema tenía dos partes: el backend no devolvía los campos `likes` y `liked` en el endpoint de reseñas, y en el frontend `invalidateQueries` no refrescaba los datos a tiempo. Lo resolví añadiendo `ReseniaLike` al controlador `getAnimeReviews` para calcular likes y estado por usuario, y sustituyendo `invalidateQueries` por `setQueryData` para actualizar el caché directamente sin necesidad de refetch. También añadí ordenación por número de likes.

## 👩‍💻 Autora

Paola Franco Gilabert
2º DAM — IES Almunia — Curso 2025/2026
GitHub: [@paolafranco0123](https://github.com/paolafranco0123)