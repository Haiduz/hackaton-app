# Resumen de cambios - Pomodoro y Estadisticas

Rama de trabajo: `v0/pomodoro-estadisticas`

## 1. Ramas e integracion

- Se creo la rama `v0/pomodoro-estadisticas` para desarrollar el cronometro (Pomodoro) y las estadisticas, separada del resto del trabajo.
- Se trajeron a esta rama los cambios de `merge-correlativa-render-view` (arbol de correlativas, calendario movil con vista semana/mes y examenes por materia, pestaña Perfil movida al header, etc.).

## 2. Base de datos y logica (sin backend, datos mock)

| Archivo | Descripcion |
| --- | --- |
| `src/utils/estudio.ts` | Utilidades de tiempo, fechas, agregaciones por dia, semana, mes y periodo. |
| `src/data/sesionesMock.ts` | Sesiones de estudio de ejemplo y lista de materias (`MATERIAS_ESTUDIO`). |
| `src/stores/estudio.ts` | Store con sesiones, materia activa, estado del cronometro, alta, edicion y borrado de registros. |
| `src/composables/useAncho.ts` | Composable para medir el ancho de los contenedores de los graficos. |
| `src/style.css` | Estilos globales y variables usadas por los nuevos componentes. |

## 3. Cronometro / Pomodoro

Vista `src/components/views/Timer.vue` con componentes en `src/components/estudio/`:

- `RelojCircular.vue`: reloj circular con progreso.
- `SelectorMateria.vue`: selector de materia para la sesion.
- `EditorIntervalos.vue`: edicion de los intervalos de estudio y descanso.
- `EditorRegistro.vue`: alta y edicion manual de un registro.
- `Modal.vue`: modal reutilizable.

## 4. Estadisticas

Vista `src/components/views/Stats.vue` con pestañas Periodo, Dia, Semana, Mes y Tendencia, inspiradas en las capturas de referencia. Componentes en `src/components/estadisticas/`:

- `MapaCalor.vue`: mapa de calor de dias, semanas y meses.
- `DetalleDia.vue` y `DetallePeriodo.vue`: totales, promedios y comparacion con el periodo anterior.
- `GraficoComparacion.vue`: escalera acumulada hoy vs. periodo anterior.
- `GraficoHorario.vue`: barras con hora de inicio y fin.
- `GraficoDispersion.vue`: distribucion de inicio y fin de estudio.
- `GraficoBarrasMateria.vue`: tiempo de estudio por materia.
- `GraficoAreaAcumulada.vue`: tiempo acumulado por materia.
- `GraficoDona.vue`: ratio por materia y ratio estudio/descanso.
- `LeyendaMaterias.vue`: leyenda compartida.

## 5. Registros

- `src/components/views/Records.vue`: listado de registros de estudio con edicion y borrado.
- `src/App.vue`: se conectaron las vistas Timer, Stats y Records.

## 6. Materias del selector

Problema: el selector del cronometro solo mostraba 8 materias (2° y 3° año).

Solucion:
- `MATERIAS_ESTUDIO` ahora se construye a partir del plan completo de `src/data/correlativas.ts`.
- Se excluyeron las optativas.
- Se quitaron tambien: Practica Profesional, Taller de Tesina, Tesina y el examen de suficiencia de Ingles.

## 7. Commits principales

- `520910b` Add Pomodoro, statistics heatmaps and records management
- `2297ebe` Agregar todas las materias del plan al selector del cronometro
- `79590ee` Quitar Practica Profesional, Taller de Tesina, Tesina e Ingles del selector

## 8. Verificacion

- Los tipos compilan (`vue-tsc`).
- La compilacion de produccion (`vite build`) termino correctamente.
- La verificacion en navegador no pudo completarse porque el navegador automatizado no respondio.

## 9. Pendiente / notas

- Los datos de estadisticas y registros son mock; no hay persistencia real todavia.
- Para guardar sesiones habria que conectar una base de datos.
