# Reporte de lo realizado - Hackaton App

Aplicación en Vue 3 + Vite + TypeScript + Pinia para organizar el cursado de la carrera: materias, árbol de correlativas, horarios, calendario y exámenes. Rama de trabajo: `v0/render-views-per-tab`.

## 1. Estructura y navegación

- Se lifteó el estado de la pestaña activa a `App.vue` y se renderiza una vista por cada pestaña de la barra inferior (`BottomNavBar.vue`): Home, Materias, Árbol, Calendario (y Estadísticas / Timer como vistas base).
- La sección "Perfil" pasó al header, a la misma altura del título "Hackaton App", conservando su funcionalidad. Más adelante se renombró a **Materias** (`Subjects.vue`).

## 2. Datos y API

- Se agregó `.env` con `VITE_API_URL`; el store (`src/stores/materias.ts`) lo usa para todos los fetch.
- Se corrigió el error `JSON.parse: unexpected character` causado por una URL vacía en el fetch.
- Las materias se filtran por carrera con `id = 1`.
- Se integró el endpoint `/api/v1/subjects/{subject_id}/overview`: el store cachea el overview por materia y expone comisiones, horarios, aula y URL del campus.
- Se blindó el manejo de sesiones con `start_time` / `end_time` nulos, que producía un crash en el calendario.

## 3. Materias y Home

- Las materias se agrupan por año y cuatrimestre con desplegables (`Colapsable.vue`, `utils/agrupar.ts`).
- Cada materia seleccionada se muestra en el Home como desplegable (`ColapsableMateria.vue`) con:
  - Horarios y aula por comisión (`SeccionHorarios.vue`, `utils/horarios.ts`).
  - URL del campus.
  - Sección de exámenes.
- Mensaje de "todavía no elegiste materias" parametrizable mediante el componente reutilizable `EstadoVacio.vue`.
- Una sección de año o cuatrimestre con todas sus materias aprobadas se muestra tachada.

## 4. Condiciones de las materias

Las condiciones finales son cuatro: **No cursable**, **Regular**, **Libre** y **Aprobada**.

- **No cursable**: bloqueada, no se puede elegir. El usuario no puede asignarla manualmente; es un valor derivado.
- **Regular / Libre**: la materia se puede elegir para estudiarla.
- **Aprobada**: no se puede elegir (se ve tachada), ya no hace falta estudiarla.
- Una materia con condición **Libre** vuelve **No cursable** a sus correlativas adyacentes.
- **Desbloqueo automático**: cuando todas las correlativas de una materia están al menos en **Regular**, la materia pasa sola de "No cursable" a **Libre**.
- **Valores por defecto**: todas las materias arrancan en "No cursable", excepto las de 1º año 1º cuatrimestre, que arrancan en "Regular". Ambos valores son constantes configurables al inicio de `src/stores/materias.ts`.
- La condición se elige desde la pestaña **Materias**; el árbol es solo lectura y muestra materias y condiciones.

## 5. Árbol de correlativas

- Se restauró el gráfico de árbol (no listas desplegables), basado en la rama `v0/arbol-correlativas`, usando **Vue Flow** (`@vue-flow/core`, `@vue-flow/background`).
- Componentes: `Tree.vue`, `arbol/GrafoCorrelativas.vue`, `arbol/NodoMateria.vue`, layout en `utils/arbol.ts`.
- El gráfico ocupa todo el ancho, con columnas por cuatrimestre para distinguir cada año y cuatrimestre.
- Barra de progreso con las cuatro condiciones.

## 6. Exámenes

- Selector de fecha de "Agregar examen" acotado entre **hoy** y **dentro de 1 año** (`utils/fechas.ts`).
- Cada materia seleccionada muestra una **cuenta regresiva** al próximo examen (`secciones/CuentaRegresiva.vue`, `secciones/SeccionExamenes.vue`).

## 7. Calendario

- Calendario estilo Google Calendar (`views/Calendar.vue`, `calendario/CalendarioGrilla.vue`, `utils/calendario.ts`) con horarios y aula por comisión.
- Detección de **conflictos** cuando dos materias coinciden en día y horario, con aviso (`AvisoConflictos.vue`) y detalle (`DetalleEvento.vue`).
- Corregida la duplicación de sesiones de una materia en el calendario.
- Se muestran siempre los 7 días, incluido el domingo.
- Vistas **Semana** y **Mes** (`CalendarioMes.vue`), con los **parciales** marcados en la fecha correspondiente en ambas vistas. La vista por día se eliminó y se corrigió la vista de mes.

## 8. Cómo cambiar valores clave

| Qué | Dónde |
| --- | --- |
| URL de la API | `.env` -> `VITE_API_URL` |
| Condición por defecto de las materias | Constantes al inicio de `src/stores/materias.ts` |
| Rango permitido para fechas de examen | `src/utils/fechas.ts` |
| Texto del estado vacío | Props de `src/components/EstadoVacio.vue` |

## 9. Verificación

- `vue-tsc` y `vite build` pasan en cada cambio.
- No fue posible verificar visualmente en navegador (`agent-browser` no estaba disponible en el entorno), por lo que conviene revisar el resultado en el preview.
