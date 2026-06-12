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

- **Rate limiting de Jikan:** implementé caché con Redis para evitar superar el límite de la API
- **Merge conflicts con el repositorio del instituto:** aprendí a resolver conflictos de Git y a trabajar con múltiples remotos
- **Exposición de credenciales:** detecté y eliminé una API key expuesta en el historial de Git
- **Sincronización del estado de usuario:** implementé el patrón stale-while-revalidate en el AuthContext para que el avatar y el rol se carguen correctamente al recargar

## 👩‍💻 Autora

**Paola Franco**  
2º DAM — IES Almunia — Curso 2025/2026  
GitHub: [@paolafranco0123](https://github.com/paolafranco0123)