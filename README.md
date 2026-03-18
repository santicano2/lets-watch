# Let's Watch 🍿

App móvil para crear salas de votación de películas en grupo. Crea una sala, comparte el link, agreguen películas desde TMDB y voten juntos para decidir qué ver.

## 🎯 Stack Tecnológico

- **Expo SDK 54** con Expo Router (navegación file-based)
- **React Native + TypeScript**
- **NativeWind v4** (Tailwind CSS para React Native)
- **Firebase** (Firestore + Realtime)
- **TMDB API** (The Movie Database)
- **AsyncStorage** (persistencia local)
- **pnpm** (package manager)

## 🎨 Paleta de Colores

- **Verde Principal**: `#22c55e` (fresh, estilo fresco)
- **Azul Secundario**: `#3b82f6` (complemento)
- **Background**: Negro `#000000`

## ✨ Características Principales

- ✅ Crear salas con código único de 6 caracteres
- ✅ Compartir sala vía deep link (`letswatch://room/ABC123`)
- ✅ Buscar películas desde TMDB
- ✅ Agregar películas a la sala
- ✅ Sistema de votación upvote/downvote en tiempo real
- ✅ Ver detalles completos de película (sinopsis, actores, plataformas streaming)
- ✅ Modo oscuro con persistencia
- ✅ Notificaciones push (cuando se agregan películas o se completa votación)
- ✅ Película ganadora automática (más votos netos)
- ✅ Detección automática de país para plataformas de streaming

## 📁 Estructura del Proyecto

```
lets-watch/
├── app/                      # Expo Router (file-based routing)
│   ├── _layout.tsx          # Root layout con NativeWind
│   ├── index.tsx            # Home/Welcome screen
│   ├── create.tsx           # Create room screen
│   ├── join.tsx             # Join room by code
│   ├── room/
│   │   ├── [code].tsx       # Room details (main voting screen)
│   │   └── [code]/
│   │       └── search.tsx   # Search movies to add
│   └── movie/
│       └── [id].tsx         # Movie details modal
├── components/              # Componentes reutilizables
│   └── ui/                 # Componentes base UI
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Input.tsx
├── services/               # Servicios externos
│   ├── firebase/
│   │   ├── config.ts       # Firebase init
│   │   ├── rooms.ts        # CRUD de salas
│   │   ├── movies.ts       # Películas en sala
│   │   └── votes.ts        # Sistema de votación
│   ├── tmdb/
│   │   ├── config.ts       # TMDB config
│   │   └── client.ts       # API calls TMDB
│   └── notifications/
│       └── push.ts         # Push notifications
├── hooks/                  # Custom hooks
│   ├── useRoom.ts         # Realtime room data
│   ├── useMovies.ts       # Realtime movies in room
│   ├── useVotes.ts        # Realtime votes
│   ├── useMovieSearch.ts  # Debounced search
│   └── useUser.ts         # Anonymous user ID
├── context/               # React Context
│   └── ThemeContext.tsx  # Dark/Light mode
├── types/                # TypeScript types
│   ├── domain.ts        # Room, Vote, etc.
│   └── tmdb.ts          # TMDB API types
├── utils/               # Utilidades
│   ├── roomCode.ts     # Generate room codes
│   └── storage.ts      # AsyncStorage helpers
├── constants/          # Constantes
│   └── Colors.ts      # Theme colors
├── global.css         # Tailwind entry point
├── .env.local        # Variables de entorno (NO COMMITEAR)
└── README.md
```

## 🚀 Instalación y Setup

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Configurar variables de entorno

Edita el archivo `.env.local` con tus credenciales:

```env
# Firebase Configuration (obtener de Firebase Console)
EXPO_PUBLIC_FIREBASE_API_KEY=tu-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# TMDB API (obtener de https://www.themoviedb.org/settings/api)
EXPO_PUBLIC_TMDB_API_KEY=tu-tmdb-api-key
EXPO_PUBLIC_TMDB_LANGUAGE=es-MX
```

### 3. Correr el proyecto

```bash
# Iniciar dev server
pnpm start

# Android
pnpm run android

# iOS
pnpm run ios

# Web
pnpm run web
```

## 📋 Plan de Desarrollo (Fases)

### ✅ FASE 0: Setup Inicial (COMPLETADA)
- [x] Crear proyecto Expo con template default
- [x] Instalar dependencias (NativeWind, Firebase, AsyncStorage, UUID)
- [x] Configurar NativeWind (tailwind, metro, babel, global.css, types)
- [x] Configurar app.json (deep linking, colores, bundle IDs)
- [x] Crear estructura de carpetas
- [x] Crear .env.local y agregarlo al .gitignore
- [x] Crear README.md con plan completo

### 🔥 FASE 1: Configuración de Firebase
- [ ] Crear proyecto en Firebase Console
- [ ] Registrar app web y obtener configuración
- [ ] Configurar Firestore Database
- [ ] Crear estructura de colecciones (rooms, movies subcollection, votes)
- [ ] Configurar reglas de seguridad Firestore
- [ ] Crear servicios Firebase:
  - [ ] `services/firebase/config.ts` - Inicialización
  - [ ] `services/firebase/rooms.ts` - CRUD de salas
  - [ ] `services/firebase/movies.ts` - Películas en sala
  - [ ] `services/firebase/votes.ts` - Sistema de votación
- [ ] Crear tipos TypeScript (`types/domain.ts`)

**Estructura Firestore:**
```
rooms/{roomCode}
  - id, code, name, hostUserId, createdAt, status, participants[]
  
  movies/{movieId}
    - tmdbId, title, posterPath, backdropPath, releaseDate
    - addedBy, addedAt, upvotes, downvotes, netVotes

votes/{voteId}
  - roomCode, movieId, userId, type ('up'|'down'), createdAt
```

### 🎬 FASE 2: Integración TMDB API
- [ ] Obtener API Key de TMDB
- [ ] Agregar API key a `.env.local`
- [ ] Crear cliente TMDB (`services/tmdb/client.ts`):
  - [ ] `searchMovies(query)` - Buscar películas
  - [ ] `getMovieDetails(id)` - Detalles completos
  - [ ] `getMovieCredits(id)` - Obtener actores
  - [ ] `getMovieProviders(id)` - Plataformas de streaming
  - [ ] `getPopularMovies()` - Películas populares
- [ ] Crear tipos TypeScript (`types/tmdb.ts`)
- [ ] Crear helpers para imágenes TMDB

### 🏗️ FASE 3: Componentes Base UI
- [ ] `components/ui/Button.tsx` - Botón con variantes
- [ ] `components/ui/Card.tsx` - Tarjeta con bordes/sombras
- [ ] `components/ui/Input.tsx` - Input con label y error
- [ ] `components/MovieCard.tsx` - Card de película con poster
- [ ] `components/MovieVoteCard.tsx` - Card con botones de voto
- [ ] `components/SearchBar.tsx` - Barra de búsqueda con debounce

### 📱 FASE 4: Pantallas Principales
- [ ] `app/index.tsx` - Pantalla de bienvenida con CTA
- [ ] `app/create.tsx` - Crear sala con nombre y código
- [ ] `app/join.tsx` - Unirse a sala con código manual
- [ ] `app/room/[code].tsx` - Pantalla principal de sala con:
  - [ ] Header con nombre y botón compartir
  - [ ] Badge de película ganadora
  - [ ] Lista de películas con votos en tiempo real
  - [ ] FAB para agregar películas

### 🔍 FASE 5: Búsqueda y Selección de Películas
- [ ] `app/room/[code]/search.tsx` - Pantalla de búsqueda
- [ ] Hook `useMovieSearch.ts` con debounce
- [ ] Agregar película a Firestore
- [ ] Validar duplicados antes de agregar
- [ ] Loading states y estados vacíos

### 🗳️ FASE 6: Sistema de Votación
- [ ] Hook `useUser.ts` - Generar y persistir userId anónimo
- [ ] Hook `useRoom.ts` - Escuchar cambios de sala en tiempo real
- [ ] Hook `useMovies.ts` - Escuchar películas de sala ordenadas
- [ ] Hook `useVotes.ts` - Gestionar votos del usuario
- [ ] Implementar lógica `toggleVote()`:
  - [ ] Mismo voto → eliminar
  - [ ] Voto opuesto → cambiar
  - [ ] Sin voto → crear nuevo
- [ ] Actualizar contadores en tiempo real
- [ ] Calcular y mostrar película ganadora

### 🎭 FASE 7: Detalles de Película
- [ ] `app/movie/[id].tsx` - Modal con detalles completos
- [ ] Mostrar backdrop, poster, título, año, duración
- [ ] Sinopsis completa
- [ ] Lista de actores con fotos (horizontal scroll)
- [ ] Plataformas de streaming disponibles por país
- [ ] Puntuación de TMDB

### 🔗 FASE 8: Deep Linking Robusto
- [ ] Manejar deep links entrantes en `_layout.tsx`
- [ ] Navegación automática a sala desde link
- [ ] Agregar userId a participants al unirse
- [ ] Botón copiar código de sala
- [ ] Mejorar Share con metadata

### 🌙 FASE 9: Modo Oscuro
- [ ] `context/ThemeContext.tsx` - Context de tema
- [ ] Función `toggleTheme()`
- [ ] Persistir preferencia en AsyncStorage
- [ ] Actualizar `tailwind.config.js` para dark mode
- [ ] Agregar variantes dark a todos los componentes
- [ ] Toggle de tema en header

### 🔔 FASE 10: Notificaciones Push (Opcional)
- [ ] Configurar Firebase Cloud Messaging
- [ ] Pedir permisos de notificaciones
- [ ] Guardar tokens FCM en Firestore
- [ ] Notificar cuando:
  - [ ] Alguien se une a tu sala
  - [ ] Se agrega nueva película
  - [ ] Todos han votado

### 🎨 FASE 11: Mejoras UI/UX
- [ ] Skeleton loaders para películas
- [ ] Animaciones con Reanimated:
  - [ ] Fade in/out para películas
  - [ ] Spring animation para votos
  - [ ] Slide in para modales
- [ ] Haptic feedback en votaciones
- [ ] Estados vacíos personalizados
- [ ] Toast notifications
- [ ] Accesibilidad (labels, contrast ratios)

### 🧪 FASE 12: Testing y Validaciones
- [ ] Validaciones de negocio:
  - [ ] Máximo de películas por sala (10)
  - [ ] No agregar duplicadas
  - [ ] No votar en salas cerradas
- [ ] Error boundaries en React
- [ ] Retry logic para TMDB
- [ ] Mensajes de error amigables
- [ ] Manejo de offline

### 📦 FASE 13: Build y Deploy
- [ ] Configurar EAS Build
- [ ] Crear builds de desarrollo
- [ ] Configurar signing para iOS/Android
- [ ] Testear en dispositivos físicos
- [ ] Optimizar bundle size
- [ ] Preparar para tiendas

## 🔒 Seguridad

- **Variables de entorno**: Nunca commitear `.env.local`
- **Reglas Firestore**: Configuradas para permitir lectura pública pero escritura controlada
- **API Keys**: Usar restricciones de dominio en Firebase Console y TMDB
- **Bundle IDs**: `com.letswatch.app` para iOS y Android

## 📚 Referencias Oficiales

- [Expo Docs](https://docs.expo.dev/)
- [NativeWind Docs](https://www.nativewind.dev/)
- [Firebase Web SDK](https://firebase.google.com/docs/web/setup)
- [TMDB API](https://developers.themoviedb.org/3)
- [Expo Router](https://docs.expo.dev/router/introduction/)

## 📝 Notas de Desarrollo

- Este README se actualiza en cada sesión
- El progreso se marca con checkboxes en cada fase
- Usar commits descriptivos por fase completada
- Testear en Expo Go antes de cada commit importante

## 🤝 Contribuciones

Este es un proyecto personal de aprendizaje. Si tienes sugerencias, abre un issue.

## 📄 Licencia

MIT

---

**Última actualización**: Marzo 18, 2026 - FASE 0 completada ✅
