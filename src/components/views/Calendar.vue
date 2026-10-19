<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useMateriasStore } from '../../stores/materias'
import {
  aMinutos,
  detectarConflictos,
  formatearMinutos,
  inicioSemana,
  sumarDias,
  weekdayDe,
  type EventoCalendario,
} from '../../utils/calendario'
import { comisionesUnicas, nombreDia } from '../../utils/horarios'
import AvisoConflictos from '../calendario/AvisoConflictos.vue'
import CalendarioGrilla from '../calendario/CalendarioGrilla.vue'
import DetalleEvento from '../calendario/DetalleEvento.vue'

type Vista = 'semana' | 'dia'

const HUES = [217, 142, 28, 280, 188, 340, 95, 8]

const store = useMateriasStore()

watch(
  () => store.seleccionadas.map(m => m.id),
  ids => ids.forEach(id => store.cargarOverview(id)),
  { immediate: true },
)

const cargando = computed(() => store.seleccionadas.some(m => store.overviewsCargando[m.id]))
const errores = computed(() =>
  store.seleccionadas.filter(m => store.overviewsError[m.id]).map(m => m.name),
)

const vista = ref<Vista>(window.innerWidth < 640 ? 'dia' : 'semana')
const fecha = ref(new Date())
const ahora = ref(new Date())
const temporizador = window.setInterval(() => (ahora.value = new Date()), 60_000)
onUnmounted(() => window.clearInterval(temporizador))

const eventos = computed<EventoCalendario[]>(() =>
  store.seleccionadas.flatMap((m, i) =>
    comisionesUnicas(store.overviews[m.id]?.sessions ?? [])
      .filter(c => c.start_time && c.end_time && c.weekday)
      .map(c => ({
        id: c.id,
        materiaId: m.id,
        materia: m.name,
        weekday: c.weekday,
        inicio: aMinutos(c.start_time),
        fin: aMinutos(c.end_time),
        hue: HUES[i % HUES.length],
        comision: c,
      }))
      .filter(e => e.fin > e.inicio),
  ),
)

const dias = computed(() => {
  if (vista.value === 'dia') return [{ fecha: fecha.value, weekday: weekdayDe(fecha.value) }]
  const lunes = inicioSemana(fecha.value)
  const hayDomingo = eventos.value.some(e => e.weekday === 7)
  return Array.from({ length: hayDomingo ? 7 : 6 }, (_, i) => ({
    fecha: sumarDias(lunes, i),
    weekday: i + 1,
  }))
})

const horaInicio = computed(() =>
  eventos.value.length
    ? Math.max(0, Math.floor(Math.min(...eventos.value.map(e => e.inicio)) / 60) - 1)
    : 8,
)
const horaFin = computed(() =>
  eventos.value.length
    ? Math.min(24, Math.ceil(Math.max(...eventos.value.map(e => e.fin)) / 60) + 1)
    : 20,
)

const titulo = computed(() => {
  const formato = (d: Date, opciones: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('es-AR', opciones).format(d)
  const primero = dias.value[0].fecha
  const ultimo = dias.value[dias.value.length - 1].fecha
  if (vista.value === 'dia') return formato(primero, { day: 'numeric', month: 'long', year: 'numeric' })
  if (primero.getMonth() === ultimo.getMonth()) return formato(primero, { month: 'long', year: 'numeric' })
  return `${formato(primero, { month: 'short' })} - ${formato(ultimo, { month: 'short', year: 'numeric' })}`
})

function mover(sentido: -1 | 1) {
  fecha.value = sumarDias(fecha.value, sentido * (vista.value === 'semana' ? 7 : 1))
}

const conflictos = computed(() => detectarConflictos(eventos.value))
const conflictoIds = computed(
  () => new Set(conflictos.value.flatMap(c => [c.a.id, c.b.id])),
)
const firmaConflictos = computed(() =>
  conflictos.value.map(c => `${c.a.id}-${c.b.id}`).join('|'),
)

const firmaDescartada = ref('')
const mostrarAviso = computed(
  () => conflictos.value.length > 0 && firmaDescartada.value !== firmaConflictos.value,
)

const soportaNotificaciones = typeof Notification !== 'undefined'
const notificacionesActivas = ref(false)

async function alternarNotificaciones() {
  if (notificacionesActivas.value) {
    notificacionesActivas.value = false
    return
  }
  try {
    const permiso =
      Notification.permission === 'default'
        ? await Notification.requestPermission()
        : Notification.permission
    notificacionesActivas.value = permiso === 'granted'
  } catch {
    notificacionesActivas.value = false
  }
}

watch(firmaConflictos, (nueva, anterior) => {
  if (!nueva || nueva === anterior || !notificacionesActivas.value) return
  const primero = conflictos.value[0]
  const resto = conflictos.value.length - 1
  try {
    new Notification('Superposición de horarios', {
      body: `${nombreDia(primero.weekday)} ${formatearMinutos(primero.inicio)}: ${primero.a.materia} y ${primero.b.materia}${resto > 0 ? ` (y ${resto} más)` : ''}`,
    })
  } catch {
    notificacionesActivas.value = false
  }
})

const seleccionado = ref<EventoCalendario | null>(null)
const superpuestoCon = computed(() => {
  const actual = seleccionado.value
  if (!actual) return []
  return [
    ...new Set(
      conflictos.value.flatMap(c =>
        c.a.id === actual.id ? [c.b.materia] : c.b.id === actual.id ? [c.a.materia] : [],
      ),
    ),
  ]
})
</script>

<template>
  <section class="calendario" aria-labelledby="calendar-title">
    <h3 id="calendar-title" class="sr-only">Calendario</h3>

    <p v-if="!store.seleccionadas.length" class="estado">
      Todavía no elegiste materias. Podés hacerlo en Perfil.
    </p>
    <template v-else>
      <div class="barra">
        <div class="navegacion">
          <button type="button" class="boton" @click="fecha = new Date()">Hoy</button>
          <button type="button" class="icono" aria-label="Anterior" @click="mover(-1)">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>
          </button>
          <button type="button" class="icono" aria-label="Siguiente" @click="mover(1)">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
          </button>
          <p class="titulo" aria-live="polite">{{ titulo }}</p>
        </div>

        <div class="segmentado" role="group" aria-label="Vista del calendario">
          <button
            type="button"
            :aria-pressed="vista === 'dia'"
            :class="{ activo: vista === 'dia' }"
            @click="vista = 'dia'"
          >
            Día
          </button>
          <button
            type="button"
            :aria-pressed="vista === 'semana'"
            :class="{ activo: vista === 'semana' }"
            @click="vista = 'semana'"
          >
            Semana
          </button>
        </div>
      </div>

      <AvisoConflictos
        v-if="mostrarAviso"
        :conflictos="conflictos"
        :notificaciones="soportaNotificaciones ? notificacionesActivas : null"
        @descartar="firmaDescartada = firmaConflictos"
        @alternar-notificaciones="alternarNotificaciones"
      />

      <p v-if="cargando" class="estado">Cargando horarios...</p>
      <p v-if="errores.length" class="estado estado-error">
        No se pudieron cargar los horarios de: {{ errores.join(', ') }}
      </p>
      <p v-if="!cargando && !eventos.length && !errores.length" class="estado">
        Tus materias no tienen horarios publicados.
      </p>

      <CalendarioGrilla
        :dias="dias"
        :eventos="eventos"
        :conflicto-ids="conflictoIds"
        :hora-inicio="horaInicio"
        :hora-fin="horaFin"
        :ahora="ahora"
        @seleccionar="seleccionado = $event"
      />

      <DetalleEvento
        v-if="seleccionado"
        :evento="seleccionado"
        :superpuesto-con="superpuestoCon"
        @cerrar="seleccionado = null"
      />
    </template>
  </section>
</template>

<style scoped>
.calendario {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.estado {
  margin: 0;
  font-size: 14px;
}

.estado-error {
  color: #e5484d;
}

.barra {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1rem;
}

.navegacion {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.titulo {
  margin: 0 0 0 0.5rem;
  font-size: 18px;
  font-weight: 500;
  text-transform: capitalize;
  color: var(--text-h);
}

.boton,
.segmentado button {
  padding: 0.35rem 0.9rem;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-h);
  font: inherit;
  font-size: 14px;
  letter-spacing: 0;
  cursor: pointer;
}

.boton {
  margin-right: 0.25rem;
  border-radius: 999px;
}

.boton:hover,
.icono:hover,
.segmentado button:hover {
  background: var(--code-bg);
}

.icono {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 50%;
  background: none;
  color: var(--text-h);
  cursor: pointer;
}

.icono svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.segmentado {
  display: flex;
}

.segmentado button:first-child {
  border-radius: 999px 0 0 999px;
}

.segmentado button:last-child {
  margin-left: -1px;
  border-radius: 0 999px 999px 0;
}

.segmentado button.activo {
  background: var(--accent-bg);
  border-color: var(--accent-border);
  color: var(--accent);
  font-weight: 600;
  position: relative;
}

.boton:focus-visible,
.icono:focus-visible,
.segmentado button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
