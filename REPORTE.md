# Reporte de lo realizado - Hackaton App

Aplicación en Vue 3 + Vite + TypeScript + Pinia para organizar el cursado de la carrera: materias, árbol de correlativas, horarios, calendario, exámenes, cronómetro (Pomodoro) y estadísticas.

Este reporte reúne el trabajo de las ramas `v0/render-views-per-tab` (vistas, árbol, calendario, exámenes) y `v0/pomodoro-estadisticas` (cronómetro, estadísticas, registros), integradas en la rama `merge/render-pomodoro`.

## 1. Estructura y navegación

- El estado de la pestaña activa está en `App.vue` y se renderiza una vista por cada pestaña de la barra inferior (`BottomNavBar.vue`): Home, Materias, Árbol, Calendario, Estadísticas y Timer.
- La sección "Perfil" pasó al header, a la misma altura del título "Hackaton App", y se renombró a **Materias** (`Subjects.vue`).
- `App.vue` también conecta las vistas Timer, Stats y Records.

## 2. Integración de ramas

- Se creó la rama `merge/render-pomodoro` para unir ambos trabajos. La simulación del merge dio 8 archivos en conflicto; `package.json` y el lockfile se fusionaron solos.
- Decisiones tomadas en los conflictos de lógica:
  - **Modelo de examen**: se unificaron ambos modelos en `stores/materias.ts`. Se conserva la fecha, hora, validación de fechas y cuenta regresiva (render) y se suma el tipo `parcial | final | recuperatorio`, la prevención de duplicados y los marcadores P/F/R (pomodoro).
  - **Calendario**: base de render (semana y mes, sin vista por día, con conflictos de horario) más la lista de exámenes por materia (`ListaExamenes.vue`).
  - **Árbol de correlativas**: se conserva el de render (`arbol/GrafoCorrelativas`) y se eliminó el viejo (`correlativas/CorrelativasGraph`, con datos estáticos).

## 3. Datos y API

- `.env` con `VITE_API_URL`; el store (`src/stores/materias.ts`) lo usa para todos los fetch.
- Las materias se filtran por carrera con `id = 1`.
- Se integró el endpoint `/api/v1/subjects/{subject_id}/overview`: el store cachea el overview por materia y expone comisiones, horarios, aula y URL del campus.
- Se blindó el manejo de sesiones con `start_time` / `end_time` nulos, que producía un crash en el calendario.
- Se corrigió el error `JSON.parse: unexpected character` causado por una URL vacía.

## 4. Materias y Home

- Las materias se agrupan por año y cuatrimestre con desplegables (`Colapsable.vue`, `utils/agrupar.ts`).
- Cada materia seleccionada se muestra en el Home como desplegable (`ColapsableMateria.vue`) con horarios y aula por comisión (`SeccionHorarios.vue`, `utils/horarios.ts`), URL del campus y sección de exámenes.
- Cada materia del Home tiene su propio fueguito de racha (`RachaMateria.vue`), a la derecha del título y antes del badge de examen. Cuenta los días seguidos con estudio de esa materia (mismo cálculo `calcularRacha` que la racha global) y se vincula a las sesiones por el código del plan (`idEstudioDeCodigoPlan`). Es independiente de la racha global.
- Mensaje de "todavía no elegiste materias" parametrizable con `EstadoVacio.vue`.
- Una sección de año o cuatrimestre con todas sus materias aprobadas se muestra tachada.

## 5. Condiciones de las materias

Las condiciones son cuatro: **No cursable**, **Regular**, **Libre** y **Aprobada**.

- **No cursable**: bloqueada, no se puede elegir. Es un valor derivado, el usuario no lo asigna.
- **Regular / Libre**: la materia se puede elegir para estudiarla.
- **Aprobada**: no se puede elegir (se ve tachada).
- Una materia **Libre** vuelve **No cursable** a sus correlativas adyacentes.
- **Desbloqueo automático**: cuando todas las correlativas de una materia están al menos en **Regular**, pasa sola de "No cursable" a **Libre**.
- **Valores por defecto**: todas las materias arrancan en "No cursable", excepto las de 1º año 1º cuatrimestre, que arrancan en "Regular". Ambos son constantes configurables al inicio de `src/stores/materias.ts`.
- La condición se elige desde la pestaña **Materias**; el árbol es solo lectura.

## 6. Árbol de correlativas

- Gráfico de árbol con **Vue Flow** (`@vue-flow/core`, `@vue-flow/background`). Componentes: `Tree.vue`, `arbol/GrafoCorrelativas.vue`, `arbol/NodoMateria.vue`, layout en `utils/arbol.ts`.
- Ocupa todo el ancho, con columnas por cuatrimestre para distinguir cada año y cuatrimestre. Barra de progreso con las cuatro condiciones.
- **Nuevo orden de correlatividades**: el plan prioritario se cargó en `src/data/planLCC2024.ts`. Reemplaza a las materias con código `r-xxx` por las de código `t-xxx`, manteniendo la arquitectura y la estética anteriores.
- **Código de materia**: ya no se muestra en el árbol; queda como dato interno para diferenciar materias en el futuro.

## 7. Exámenes

- Selector de fecha de "Agregar examen" acotado entre **hoy** y **dentro de 1 año** (`utils/fechas.ts`).
- Cada examen tiene tipo (parcial, final o recuperatorio), fecha y hora; se evitan duplicados (`secciones/SeccionExamenes.vue`).
- Cuenta regresiva al próximo examen por materia (`secciones/CuentaRegresiva.vue`).

## 8. Calendario

- Estilo Google Calendar (`views/Calendar.vue`, `calendario/CalendarioGrilla.vue`, `calendario/CalendarioMes.vue`, `utils/calendario.ts`) con horarios y aula por comisión.
- Vistas **Semana** y **Mes**; se eliminó la vista por día. Se muestran siempre los 7 días, incluido el domingo.
- Detección de **conflictos** cuando dos materias coinciden en día y horario, con aviso (`AvisoConflictos.vue`) y detalle (`DetalleEvento.vue`). Corregida la duplicación de sesiones.
- Marcadores **P / F / R** de exámenes en ambas vistas, y lista de exámenes por materia (`ListaExamenes.vue`).

## 9. Cronómetro / Pomodoro

Vista `views/Timer.vue` con componentes en `src/components/estudio/`:

- `RelojCircular.vue` (reloj con progreso), `SelectorMateria.vue`, `EditorIntervalos.vue` (estudio y descanso), `EditorRegistro.vue` (alta y edición manual) y `Modal.vue`.
- El selector de materias se construye con el plan completo de `src/data/correlativas.ts`, excluyendo optativas, Práctica Profesional, Taller de Tesina, Tesina y el examen de suficiencia de Inglés.

## 10. Estadísticas y registros

Vista `views/Stats.vue` con pestañas Periodo, Día, Semana, Mes y Tendencia. Componentes en `src/components/estadisticas/`:

- `MapaCalor.vue`, `DetalleDia.vue`, `DetallePeriodo.vue`, `GraficoComparacion.vue`, `GraficoHorario.vue`, `GraficoDispersion.vue`, `GraficoBarrasMateria.vue`, `GraficoAreaAcumulada.vue`, `GraficoDona.vue` y `LeyendaMaterias.vue`.
- `views/Records.vue`: listado de registros de estudio con edición y borrado.

Archivos de soporte:

| Archivo | Descripción |
| --- | --- |
| `src/utils/estudio.ts` | Utilidades de tiempo, fechas y agregaciones por día, semana, mes y periodo. |
| `src/data/sesionesMock.ts` | Sesiones de estudio de ejemplo y lista `MATERIAS_ESTUDIO`. |
| `src/stores/estudio.ts` | Sesiones, materia activa, estado del cronómetro, alta, edición y borrado de registros. |
| `src/composables/useAncho.ts` | Medición del ancho de los contenedores de los gráficos. |
| `src/style.css` | Estilos globales y variables de los nuevos componentes. |

## Calendario: siempre activo y sesiones de estudio

- El calendario se muestra aunque no haya materias elegidas; en ese caso aparece un aviso que invita a elegirlas en Inicio.
- En la vista **Semana** se dibujan todas las sesiones de estudio registradas como una barra vertical fina pegada a la izquierda de cada día, con el color Okabe-Ito de la materia (el mismo que el fueguito y las estadísticas).
- Cuando hay sesiones, cada día reserva una franja de 7px a la izquierda y los horarios de cursada se corren para no quedar tapados.
- Al pasar el cursor, enfocar o hacer clic sobre una barra se ve el detalle: materia, hora de inicio y fin, y tiempo de foco. En los dos últimos días el detalle se abre hacia la izquierda para que no se corte.
- Debajo de la grilla hay una leyenda con las materias estudiadas en la semana visible.
- El rango de horas de la grilla tiene en cuenta también las sesiones de estudio.

## 11. Cómo cambiar valores clave

| Qué | Dónde |
| --- | --- |
| URL de la API | `.env` -> `VITE_API_URL` |
| Condición por defecto de las materias | Constantes al inicio de `src/stores/materias.ts` |
| Plan de correlatividades (códigos `t-xxx`) | `src/data/planLCC2024.ts` |
| Rango permitido para fechas de examen | `src/utils/fechas.ts` |
| Texto del estado vacío | Props de `src/components/EstadoVacio.vue` |

## 12. Verificación y pendientes

- `vue-tsc` y `vite build` pasan en cada cambio.
- No fue posible verificar visualmente en navegador (el navegador automatizado no estaba disponible o no respondió); conviene revisar el resultado en el preview.
- Los datos de estadísticas y registros son mock; no hay persistencia real todavía. Para guardar sesiones habría que conectar una base de datos.
