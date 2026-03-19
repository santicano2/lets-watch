# AGENTS.md - Continuidad de Sesión para Let's Watch

Este archivo documenta el contexto esencial del proyecto para que cualquier agente de IA pueda retomar el desarrollo sin perder información crítica.

---

## Información Crítica del Proyecto

### Objetivo
Aplicación móvil de votación grupal para decidir qué película ver. Los usuarios crean salas, comparten código/link, agregan películas desde TMDB y votan (upvote/downvote).

### Stack Tecnológico
- **Frontend**: Expo SDK 54 + React Native + NativeWind v4 (Tailwind CSS v3.4.19)
- **Backend**: Firebase (Firestore)
- **API Externa**: TMDB (The Movie Database) - idioma: **es-MX**
- **Navegación**: Expo Router (file-based routing) con tabs
- **Package Manager**: **pnpm** (NO npm)
- **Autenticación**: Usuarios anónimos (sin login)

### Decisiones de Diseño Clave

#### 1. Colores
- Verde: `#22c55e` (green-500)
- Azul: `#3b82f6` (blue-500)
- Estilo fresco y moderno (NO tema cinema rojo/ámbar)

#### 2. Estructura de Datos Firebase

**Colección: `rooms`**
```
rooms/{roomCode}
  - code: string (6 caracteres, ej: "ABC123")
  - creatorName: string
  - status: "voting" | "closed"
  - createdAt: timestamp
  - participantCount: number
  - selectedMovieId?: number

  /movies (subcolección)
    /{movieId}
      - id: number (TMDB ID)
      - title: string
      - posterPath: string | null
      - releaseDate: string
      - overview: string
      - addedBy: string (user ID)
      - addedAt: timestamp
      - upvotes: number
      - downvotes: number
      - score: number (upvotes - downvotes)
```

**Colección: `votes`** (top-level para queries eficientes)
```
votes/{roomCode}_{movieId}_{userId}
  - roomCode: string
  - movieId: number
  - userId: string (anonymous user ID)
  - voteType: "upvote" | "downvote"
  - votedAt: timestamp
```

#### 3. Lógica de Votación
- **Toggle behavior**: Si el usuario vota lo mismo dos veces, se elimina el voto
- **Switch behavior**: Si el usuario cambia de upvote a downvote (o viceversa), se actualiza el voto
- **Recalculation**: Después de cada voto, se recuentan todos los votos y se actualiza el score de la película

#### 4. Deep Linking
- **Scheme**: `letswatch://room/{code}`
- **Fallback**: Entrada manual del código de 6 caracteres

#### 5. Seguridad Firebase
- **IMPORTANTE**: Firestore está en **modo de prueba** (reglas permisivas, expiración 30 días)
- **Recordatorio**: El usuario pidió que se le recuerde implementar reglas de seguridad antes de producción

---

## Plan de Desarrollo (13 Fases)

Ver `README.md` para el plan completo. Progreso actual:

- ✅ **FASE 0**: Setup inicial (Expo + NativeWind + Firebase + estructura)
- ✅ **FASE 1**: Configuración Firebase (types, utils, services)
- ⏳ **FASE 2**: Cliente TMDB
- ⏳ **FASE 3**: UI Componentes básicos
- ⏳ **FASE 4-13**: Pantallas, lógica, features avanzadas

---

## Preferencias del Usuario

### Metodología
- **Trabajar fase por fase**: NO hacer todo de golpe, hacer pausas entre fases
- **Pedir confirmación**: Preguntar antes de continuar con la siguiente fase
- **Commits frecuentes**: Al completar cada fase

### Características Importantes
- **Dark mode**: Incluido en el plan (FASE 9)
- **Push notifications**: Incluido en el plan (FASE 10)
- **Detección de streaming**: Usar ubicación del teléfono, si no disponible, preguntar al usuario
- **Hook useUser**: Pospuesto hasta FASE 6 (NO crearlo antes)

### Convenciones de Código
- **TypeScript**: Strict mode
- **Imports**: Usar alias `@/` para rutas absolutas
- **Comentarios**: En español, concisos y útiles
- **Naming**: camelCase para variables/funciones, PascalCase para componentes

---

## Archivos Sensibles

### NO Commitear
- `.env.local` - Contiene credenciales de Firebase (ya en .gitignore)

### Credenciales Firebase (Ya Configuradas)
- **Project ID**: `lets-watch-dd394`
- **Database**: Firestore (mode: test)
- Todas las keys están en `.env.local`

---

## Comandos Útiles

```bash
# Instalar dependencias
pnpm install

# Iniciar desarrollo
pnpm start

# Limpiar caché (si hay problemas)
pnpm expo start -c

# Build para producción (futuro)
pnpm build:android
pnpm build:ios
```

---

## Próximos Pasos Inmediatos

1. ✅ Completar FASE 1 (crear archivos restantes)
2. ✅ Crear este archivo `AGENTS.md`
3. ⏳ Actualizar README.md marcando FASE 1 como completada
4. ⏳ Commit: "feat: FASE 1 completada - Firebase configurado"
5. ⏳ Esperar confirmación del usuario antes de FASE 2

---

## Notas Técnicas Importantes

### NativeWind v4 Quirks
- Requiere Tailwind CSS v3.4.19 (NO v4.x)
- Configuración en `metro.config.js` y `babel.config.js`
- Importar `global.css` en `app/_layout.tsx`

### Firebase SDK
- Usamos **Web SDK** (no @react-native-firebase)
- Funciona perfectamente con Expo
- Más simple y sin configuración nativa extra

### Expo Router
- Navegación file-based (carpeta `app/`)
- Template inicial incluye tabs navigation
- Deep linking configurado en `app.json`

---

## Estado del Proyecto

**Última actualización**: FASE 1 completada
**Commit actual**: "feat: FASE 1 completada - Firebase configurado"
**Próxima tarea**: Esperar confirmación del usuario para FASE 2

---

## Contacto y Documentación
- TMDB API: https://developer.themoviedb.org/docs
- Firebase Docs: https://firebase.google.com/docs/firestore
- Expo Docs: https://docs.expo.dev/
- NativeWind: https://www.nativewind.dev/
