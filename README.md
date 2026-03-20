# AnimeFav 🎌

Proyecto de **Paola Franco Gilabert** — 2º DAW

---

## ¿Qué es?

AnimeFav es una web para gestionar tu lista de anime. La idea surgió porque uso mucho MyAnimeList y quería hacer algo parecido pero más moderno y a mi manera.

Puedes buscar animes, añadirlos a tus listas, llevar el control de episodios, puntuar lo que ves y ver estadísticas de tu consumo.

---

## Tecnologías que he usado

**Backend:** Node.js + Express + MySQL + Redis + JWT  
**Frontend:** Next.js + React + Tailwind CSS  
**API externa:** Jikan (API pública de MyAnimeList, sin key)  
**Infraestructura:** Docker + Docker Compose

---

## Cómo levantarlo

### Requisitos
- Docker Desktop

### Pasos

```bash
git clone https://github.com/IES-Almunia-25-26-PIDAW/animefav.git
cd animefav
cp .env.example .env
docker-compose up --build
```

Eso levanta la BD (MySQL), Redis y el backend. La BD se crea automáticamente con el schema.

Para el frontend, en otra terminal:
```bash
cd frontend
npm install
npm run dev
```

Y ya está en `http://localhost:3000`

---

## Estructura

```
animefav/
├── backend/        # API REST
├── frontend/       # Next.js
├── database/
│   └── schema.sql  # Se aplica solo al hacer docker-compose up
└── docker-compose.yml
```

---

## Lo que hay implementado

- Registro y login con JWT
- 5 listas predeterminadas + listas personalizadas con color
- Seguimiento de episodios por anime
- Búsqueda integrada con Jikan
- Página de detalle de cada anime
- Puntuaciones del 1 al 10
- Estadísticas (tiempo invertido, géneros favoritos, distribución de notas...)
- Calendario de emisiones de tus animes en Watching
- Caché con Redis para no saturar la API de Jikan

---

## Lo que queda por hacer / ideas futuras

- Reseñas de texto por anime
- Sistema de recomendaciones basado en historial
- Verificación por email al registrarse
- Sinopsis, trailer de YouTube, personajes y voice actors — está en Jikan solo tengo que implementarlo
- Perfil público para compartir tu lista con otros
- Página de novedades de la temporada actual
- Avatar de perfil personalizable con imagenes de anime
- Foro o comentarios por anime
---

**Paola Franco Gilabert — IES Almunia — DAW 2025/2026**