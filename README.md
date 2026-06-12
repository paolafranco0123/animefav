# AnimeFav 🎌

AnimeFav es mi proyecto de fin de grado de 2º DAM. Es una aplicación web fullstack para gestionar y seguir series de anime, inspirada en MyAnimeList. Los usuarios pueden buscar animes, añadirlos a listas personalizadas, puntuar, escribir reseñas y ver estadísticas de su consumo.

## 💡 ¿Por qué este proyecto?

Soy aficionada al anime y siempre he usado MyAnimeList para llevar el seguimiento de lo que veo. Quise crear mi propia versión aplicando todo lo aprendido en el ciclo: backend con Node.js, frontend con React, base de datos MySQL, Docker y autenticación con JWT.

## 🛠️ Stack tecnológico y justificación

| Tecnología | Uso | Por qué la elegí |
|-----------|-----|-----------------|
| Next.js 16 + React 19 | Frontend | Framework moderno con SSR, enrutamiento automático y gran ecosistema |
| Tailwind CSS | Estilos | Permite diseñar rápido sin escribir CSS desde cero |
| Node.js + Express | Backend/API REST | Ligero, rápido y perfecto para APIs. JavaScript en ambos lados del stack |
| MySQL 8 | Base de datos | Relacional, bien documentada y la más usada en el ciclo |
| Redis | Caché | Reduce llamadas repetidas a la API de Jikan y mejora el rendimiento |
| JWT | Autenticación | Estándar seguro para APIs REST sin necesidad de sesiones en servidor |
| Docker + Docker Compose | Infraestructura | Garantiza que el proyecto funciona igual en cualquier máquina |
| Jikan API | Datos de anime | API pública y gratuita de MyAnimeList, sin necesidad de scraping |
| Jest + Supertest | Testing | Framework de testing estándar para Node.js |

## ✨ Funcionalidades

**Usuario:**
- Registro con verificación de email (Nodemailer + Mailtrap)
- Login con JWT
- Buscar animes por nombre
- Ver detalle de anime (sinopsis, trailer, puntuación MAL)
- Añadir animes a listas predeterminadas (Viendo, Completado, En pausa, Abandonado, Pendiente) y listas personalizadas
- Seguimiento de episodios vistos
- Puntuar animes del 1 al 10
- Escribir reseñas
- Ver estadísticas personales (tiempo invertido, nota media, géneros favoritos)
- Calendario de emisiones de animes que está viendo
- Avatar personalizable con personajes de anime

**Administrador:**
- Panel de administración con dashboard
- Gestión de usuarios (cambiar rol, eliminar)
- Moderación de reseñas
- Estadísticas globales de la aplicación

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

**2. Crea el archivo `.env` en la raíz** (copia `.env.example` y rellena los valores):
```env
DB_HOST=db
DB_USER=animefav_user
DB_PASS=tu_password
DB_NAME=animefav_db
DB_ROOT_PASSWORD=tu_root_password
JWT_SECRET=un_secreto_seguro_largo
RESEND_API_KEY=tu_api_key_de_resend
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
animefav/

├── backend/                  # API REST

│   ├── src/

│   │   ├── controllers/      # Lógica de cada endpoint

│   │   ├── models/           # Acceso a base de datos

│   │   ├── routes/           # Definición de rutas

│   │   ├── middleware/       # Auth JWT y control de roles

│   │   └── services/        # Lógica de negocio (Jikan, email)

│   ├── tests/            # Tests con Jest

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

## 🗄️ Base de datos

La base de datos está en **3ª Forma Normal**. El esquema incluye las siguientes tablas:

- `Usuario` — datos de usuario con roles (user/admin)
- `Anime` — animes importados desde Jikan
- `Lista` — listas de cada usuario (predeterminadas y personalizadas)
- `Lista_Anime` — relación entre listas y animes con seguimiento de episodios
- `Puntuacion` — puntuaciones de usuarios sobre animes
- `Resenia` — reseñas de texto

## 🔐 Seguridad

- Contraseñas hasheadas con **bcrypt** (10 rondas de sal)
- Tokens **JWT** con expiración de 24 horas
- Middleware de autenticación en todas las rutas protegidas
- Middleware de rol admin para el panel de administración
- Variables sensibles en `.env`, nunca en el repositorio

## 🚀 Decisiones técnicas

**¿Por qué Redis?**
La API de Jikan tiene un límite de 3 peticiones por segundo. Sin caché, cada vez que un usuario visita un anime se hace una llamada a Jikan. Con Redis cacheo los detalles de cada anime durante 24 horas, reduciendo drásticamente las llamadas externas.

**¿Por qué Docker?**
Garantiza que el proyecto funciona igual en cualquier máquina. Con un solo `docker-compose up` se levanta MySQL, Redis y el backend correctamente configurados y conectados entre sí.

**¿Por qué Next.js en lugar de React puro?**
Next.js ofrece enrutamiento automático basado en carpetas, lo que simplifica mucho la organización del frontend. Además tiene mejor soporte para SEO y carga más rápida que una SPA de React puro.

## 📝 Problemas resueltos durante el desarrollo

## 📝 Problemas resueltos durante el desarrollo

**La búsqueda siempre devolvía los mismos resultados**
El buscador siempre mostraba los mismos 25 animes sin importar lo que escribiera. Después de mucho revisar el código descubrí que el problema estaba en cómo construía la URL de la petición — cuando el nombre tenía espacios como "Dragon Ball Z", la URL se rompía y el backend recibía una búsqueda vacía. Lo arreglé usando el objeto `params` de axios en lugar de construir la URL a mano, que se encarga automáticamente de escapar los caracteres especiales.

**Credenciales expuestas en GitHub**
Sin querer subí el archivo `.env` con una API key real a un repositorio público. Borrar el archivo no era suficiente porque Git guarda el historial completo. Tuve que revocar la clave inmediatamente, limpiar todos los commits anteriores donde aparecía con `git filter-branch` y hacer un push forzado. Desde entonces siempre configuro el `.gitignore` antes del primer commit.

**Los cambios en el backend no se reflejaban al reiniciar Docker**
Durante el desarrollo me desesperé porque cambiaba código del backend y al reiniciar Docker los cambios no aparecían. Aprendí que Docker cachea las capas del contenedor y hay que usar `--build` para forzar la reconstrucción, y `--no-cache` cuando los cambios aún no aparecen. Me costó entenderlo pero ahora tengo claro cuándo usar cada opción.

**El avatar y el rol no aparecían al recargar la página**
Al recargar la página el avatar desaparecía y el botón de admin no aparecía aunque el usuario fuera admin. El problema era que al iniciar la app leía los datos del usuario de `localStorage`, que solo tenía nombre y email del momento del login pero no el avatar ni el rol. Lo resolví haciendo que al iniciar la app siempre llame al backend para obtener el perfil completo y actualizar el estado.

**Errores de clave foránea al puntuar animes**
Al intentar puntuar un anime que nunca había abierto antes, el backend fallaba porque intentaba guardar la puntuación con un `id_anime` que no existía en mi base de datos local — los animes vienen de Jikan pero hay que importarlos primero. Diseñé un sistema de importación automática: antes de cualquier operación, el sistema comprueba si el anime existe en la BD local y si no lo importa automáticamente desde Jikan. Así el usuario nunca nota nada.

**Conflictos al sincronizar con el repositorio del instituto**
Después de semanas desarrollando por mi cuenta, al intentar sincronizar mi fork con el repo del instituto aparecieron más de 15 archivos en conflicto al mismo tiempo. Tuve que aprender a trabajar con múltiples remotos y a resolver cada conflicto manualmente eligiendo qué cambios mantener, los míos o los del instituto, o combinando ambos cuando era posible.

**Certificado SSL de MyAnimeList caído**
Algunos animes no cargaban y devolvían error 500. Revisando los logs del backend vi que el error venía de Jikan, que no podía conectar con MyAnimeList porque su certificado SSL había expirado. Me llevó un rato darme cuenta de que no era un bug de mi código sino un problema externo. Añadí mensajes de error más claros para que el usuario sepa que el problema es temporal y no de la app.

**La paginación de React Query no actualizaba los resultados**
Al implementar los filtros de búsqueda, cuando cambiabas el tipo de anime o el estado los resultados no se actualizaban. El problema era que la `queryKey` de React Query no incluía los filtros, solo el texto de búsqueda, así que React Query pensaba que era la misma query y devolvía el resultado cacheado anterior. Lo arreglé añadiendo los filtros a la `queryKey` para que React Query detecte el cambio y haga una nueva petición.

**El panel de admin redirigía al inicio antes de cargar el usuario**
Al entrar directamente en `/admin` desde el navegador la página redirigía al inicio aunque fuera admin. El problema era una condición de carrera — el `useEffect` que redirige si el usuario no es admin se ejecutaba antes de que el `AuthContext` terminara de cargar el perfil desde el backend, así que `user` era `null` momentáneamente y la redirección se disparaba. Lo solucione añadiendo el estado `loading` a la condición: si todavía está cargando no redirige, espera a tener los datos del usuario.

**Las estadísticas del admin no mostraban datos aunque había animes en las listas**
La pestaña de estadísticas globales del panel de admin no mostraba nada aunque había animes añadidos. Después de revisar el código vi que las queries SQL eran correctas pero al probarlas directamente en la base de datos sí funcionaban. El problema estaba en el controller — el `console.log` que había añadido para depurar se había colado dentro del template string de la query SQL, así que MySQL intentaba ejecutar el `console.log` como si fuera SQL y fallaba. Me enseñó a revisar bien los template strings multilínea de JavaScript.

**Docker tardaba muchísimo en arrancar o se quedaba colgado**
En varios momentos durante el desarrollo Docker se quedaba colgado arrancando los contenedores de MySQL y Redis sin dar ningún error claro. Aprendí que MySQL tarda varios segundos en estar listo para aceptar conexiones aunque el contenedor ya esté arrancado, y que el backend intentaba conectarse antes de que la base de datos estuviera lista. El `healthcheck` del `docker-compose.yml` resuelve esto — hace que el backend espere a que MySQL responda correctamente antes de arrancar.

**Los node_modules se subieron al repositorio**
Al principio no tenía bien configurado el `.gitignore` y Git empezó a trackear los `node_modules` del backend, que tienen miles de archivos. El repositorio se volvió enorme y los push tardaban minutos. Simplemente añadir `node_modules/` al `.gitignore` no eliminaba los archivos que Git ya tenía trackeados — tuve que usar `git rm -r --cached` para decirle a Git que dejara de seguirlos sin borrarlos del disco, y luego hacer un commit limpio.
## 👩‍💻 Autora

**Paola Franco**  
2º DAM — IES Almunia — Curso 2025/2026  
GitHub: [@paolafranco0123](https://github.com/paolafranco0123)