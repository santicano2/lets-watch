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

  /participants (subcolección)
    /{userId}
      - userId: string
      - name: string
      - joinedAt: timestamp
      - isCreator: boolean
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

## Plan de Desarrollo (16 Fases)

Ver `README.md` para el plan completo. Progreso actual:

- ✅ **FASE 0**: Setup inicial (Expo + NativeWind + Firebase + estructura)
- ✅ **FASE 1**: Configuración Firebase (types, utils, services)
- ✅ **FASE 2**: Cliente TMDB (completo con 8+ funciones)
- ✅ **FASE 3**: UI Componentes básicos (Button, Card, Input, MovieCard, etc.)
- ✅ **FASE 4**: Pantallas principales (Welcome, Create, Join, Room)
- ✅ **FASE 5**: Búsqueda y selección de películas
- ✅ **FASE 6**: Sistema de votación en tiempo real
- ✅ **FASE 7**: Detalles de película (cast, providers, país automático)
- ✅ **FASE 8**: Deep linking + Modal de participantes
- ✅ **FASE 9**: Temporizador y cierre de votación
- ✅ **FASE 10**: Sistema "Estoy listo"
- ✅ **FASE 11**: Pantalla de ganador (empates + selección aleatoria)
- ✅ **FASE 12**: Rejoin (volver a sala después de cerrar app)
- ✅ **FASE 13**: Mejoras UI/UX (animaciones, haptics)
- ✅ **FASE 14**: Testing y validaciones
- ⏳ **FASE 15**: Build y deploy
- ⏳ **FASE 16**: Notificaciones push (opcional)

---

## Preferencias del Usuario

### Metodología

- **Trabajar fase por fase**: NO hacer todo de golpe, hacer pausas entre fases
- **Pedir confirmación**: Preguntar antes de continuar con la siguiente fase
- **Commits frecuentes**: Al completar cada fase

### Características Importantes

- **Dark mode**: Fijo por diseño (NO toggle, siempre dark)
- **Push notifications**: Incluido en el plan (FASE 10, opcional)
- **Push notifications**: Incluido en el plan (FASE 10)
- **Detección de streaming**: Detecta país automático con expo-localization, si no puede, pregunta al usuario
- **Hooks implementados**:
  - `useUser` - ID anónimo persistente en AsyncStorage
  - `useCountry` - Detección/selección de país para providers de streaming

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

## Guia Oficial Expo Build (Fuente de verdad)

**IMPORTANTE**: Para builds y deploy, seguir exclusivamente la documentacion oficial de Expo:

- Introduccion EAS Build: https://docs.expo.dev/build/introduction/
- Create your first build: https://docs.expo.dev/build/setup/
- Troubleshooting: https://docs.expo.dev/build-reference/troubleshooting/

### Flujo oficial obligatorio (resumen)

1. `eas login`
2. `eas build:configure`
3. `eas build --platform android` o `eas build --platform ios`
4. Revisar logs en dashboard EAS si falla
5. `eas submit` para enviar a stores

### Reglas de ejecucion

- No inventar pasos fuera de docs oficiales para build/deploy
- Ante error de build, primero revisar el primer phase que falla en logs
- Validar bundling local cuando aplique (`npx expo export`)
- Verificar que variables de entorno y archivos no ignorados por `.gitignore` esten correctos
- Si hay diferencias local vs EAS, alinear versiones de herramientas y entorno

---

## Próximos Pasos Inmediatos

1. ✅ Completar FASE 1 (crear archivos restantes)
2. ✅ Crear este archivo `AGENTS.md`
3. ✅ Actualizar README.md marcando FASE 1 como completada
4. ✅ Commit FASE 1: "feat: FASE 1 completada - Firebase configurado"
5. ✅ Completar FASE 2 - Cliente TMDB
6. ⏳ Usuario revisará archivos antes de commit
7. ⏳ Esperar confirmación del usuario antes de FASE 3

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

**Última actualización**: FASE 15 en progreso - EAS configurado + base PWA online-first
**Último commit pendiente**: FASES 5-14 + FASE 15 parcial pendientes de commit
**Próxima tarea**: FASE 15 - completar builds/signing Android y validar PWA online-first

### Decisiones de Diseño para FASES 10-12

#### Cierre de Votación

- **Temporizador** con opciones: 15 min, 30 min, 1 hora, 2 horas
- **O** cuando todos presionan "Estoy listo" (lo que pase primero)
- Votar es **opcional** - el botón "Estoy listo" indica que terminaron

#### Empates

- Si hay empate, se muestran las películas empatadas
- Botón "Elegir al azar" para seleccionar ganador entre empates

#### Rejoin

- Guardar última sala en AsyncStorage
- Mostrar botón "Volver a sala XXXXXX" en home

### Archivos Nuevos/Modificados Recientemente

- `types/domain.ts` - Agregado `endsAt`, `duration`, `creatorId` a Room, `isReady` a Participant
- `services/firebase/rooms.ts` - `createRoom` recibe params, `subscribeToRoom` nuevo
- `services/firebase/participants.ts` - Agregado `setParticipantReady`, `isReady` en todos los métodos
- `hooks/useCountdown.ts` - NUEVO: Hook para countdown con callback onExpire
- `components/CountdownTimer.tsx` - NUEVO: Componente visual del countdown
- `components/Toast.tsx` - NUEVO: Toast temporal para eventos en sala
- `components/ParticipantsModal.tsx` - Estado de participante: "Listo" / "Votando"
- `utils/lastRoom.ts` - NUEVO: Persistencia de última sala para rejoin
- `app/create.tsx` - Selector de duración (15min, 30min, 1h, 2h)
- `app/join.tsx` - Guarda última sala al unirse
- `app/index.tsx` - Botón "Volver a sala" si existe última sala válida
- `app/room/[code]/index.tsx` - Toast de nuevos participantes + grid 2 columnas + botón "Estoy listo"
- `services/firebase/rooms.ts` - Soporte para desempate (`isTieBreak`, `tieBreakMovieIds`)
- `eas.json` - NUEVO: perfiles de build (`development`, `preview`, `production`)
- `app.json` - runtimeVersion + versionCode/buildNumber para stores
- `package.json` - scripts EAS (`build:android`, `build:ios`, `submit:*`)
- `app/+html.tsx` - NUEVO: metadata web para instalacion PWA
- `public/manifest.webmanifest` - NUEVO: manifest de PWA
- `public/sw.js` - NUEVO: service worker con cache basico para app shell
- `public/pwa-192.png` y `public/pwa-512.png` - NUEVO: iconos instalables

---

## Contacto y Documentación

- TMDB API: https://developer.themoviedb.org/docs
- Firebase Docs: https://firebase.google.com/docs/firestore
- Expo Docs: https://docs.expo.dev/
- NativeWind: https://www.nativewind.dev/
