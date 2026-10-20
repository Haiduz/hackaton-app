<script setup lang="ts">
import { computed } from 'vue'
import {
  claveFecha,
  formatearMinutos,
  mismoDia,
  posicionar,
  type EventoCalendario,
  type ExamenCalendario,
} from '../../utils/calendario'
import { nombreDia, textoAula } from '../../utils/horarios'

interface DiaGrilla {
  fecha: Date
  weekday: number
}

const ALTO_HORA = 56

const props = defineProps<{
  dias: DiaGrilla[]
  eventos: EventoCalendario[]
  conflictoIds: Set<number>
  examenes: ExamenCalendario[]
  horaInicio: number
  horaFin: number
  ahora: Date
}>()

const emit = defineEmits<{ seleccionar: [evento: EventoCalendario] }>()

const horas = computed(() =>
  Array.from({ length: props.horaFin - props.horaInicio + 1 }, (_, i) => props.horaInicio + i),
)
const altoTotal = computed(() => (props.horaFin - props.horaInicio) * ALTO_HORA)
const base = computed(() => props.horaInicio * 60)

const columnas = computed(() =>
  props.dias.map(dia => ({
    ...dia,
    esHoy: mismoDia(dia.fecha, props.ahora),
    examenes: props.examenes
      .filter(e => e.clave === claveFecha(dia.fecha))
      .sort((a, b) => a.hora.localeCompare(b.hora)),
    eventos: posicionar(props.eventos.filter(e => e.weekday === dia.weekday)),
  })),
)

const minutosAhora = computed(() => props.ahora.getHours() * 60 + props.ahora.getMinutes())
const lineaAhoraVisible = computed(
  () => minutosAhora.value >= base.value && minutosAhora.value <= props.horaFin * 60,
)
const topAhora = computed(() => ((minutosAhora.value - base.value) / 60) * ALTO_HORA)

function estilo(e: { inicio: number; fin: number; columna: number; columnas: number; hue: number }) {
  const ancho = 100 / e.columnas
  return {
    top: `${((e.inicio - base.value) / 60) * ALTO_HORA}px`,
    height: `${((e.fin - e.inicio) / 60) * ALTO_HORA - 2}px`,
    left: `calc(${e.columna * ancho}% + 2px)`,
    width: `calc(${ancho}% - 5px)`,
    '--hue': e.hue,
  }
}

function etiqueta(e: EventoCalendario): string {
  const aula = textoAula(e.comision)
  return `${e.materia}, ${nombreDia(e.weekday)} de ${formatearMinutos(e.inicio)} a ${formatearMinutos(e.fin)}${aula ? `, ${aula}` : ''}`
}
</script>

<template>
  <div
    class="grilla"
    :style="{ '--cols': dias.length, '--alto-hora': `${ALTO_HORA}px` }"
    role="group"
    aria-label="Horarios semanales"
  >
    <div class="interna" :class="{ multiple: dias.length > 1 }">
      <div class="cabecera">
        <div class="gutter" />
        <div v-for="c in columnas" :key="c.weekday" class="cab-dia" :class="{ hoy: c.esHoy }">
          <span class="nombre">{{ nombreDia(c.weekday).slice(0, 3) }}</span>
          <span class="numero">{{ c.fecha.getDate() }}</span>
          <ul v-if="c.examenes.length" class="examenes">
            <li
              v-for="e in c.examenes"
              :key="e.id"
              class="examen"
              :style="{ '--hue': e.hue }"
              :title="`${e.titulo} - ${e.materia}, ${e.hora}`"
            >
              <span class="sr-only">Examen: </span>
              {{ e.hora }} {{ e.titulo }} · {{ e.materia }}
            </li>
          </ul>
        </div>
      </div>

      <div class="cuerpo" :style="{ height: `${altoTotal}px` }">
        <div class="horas" aria-hidden="true">
          <span
            v-for="(h, i) in horas"
            :key="h"
            class="hora"
            :style="{ top: `${i * ALTO_HORA}px` }"
          >
            <template v-if="i > 0">{{ String(h).padStart(2, '0') }}:00</template>
          </span>
        </div>

        <div v-for="c in columnas" :key="c.weekday" class="columna" :class="{ hoy: c.esHoy }">
          <button
            v-for="e in c.eventos"
            :key="e.id"
            type="button"
            class="evento"
            :class="{
              conflicto: conflictoIds.has(e.id),
              compacto: e.fin - e.inicio < 60,
            }"
            :style="estilo(e)"
            :aria-label="etiqueta(e)"
            @click="emit('seleccionar', e)"
          >
            <span class="evento-titulo">
              <svg
                v-if="conflictoIds.has(e.id)"
                class="icono-alerta"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 3 2 21h20L12 3Z" />
                <path d="M12 10v5M12 18h.01" />
              </svg>
              {{ e.materia }}
            </span>
            <span class="evento-hora">
              {{ formatearMinutos(e.inicio) }} - {{ formatearMinutos(e.fin) }}
            </span>
            <span v-if="textoAula(e.comision)" class="evento-aula">
              {{ textoAula(e.comision) }}
            </span>
          </button>

          <div
            v-if="c.esHoy && lineaAhoraVisible"
            class="ahora"
            :style="{ top: `${topAhora}px` }"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grilla {
  max-height: calc(100svh - 300px);
  min-height: 360px;
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg);
}

.interna.multiple {
  min-width: 640px;
}

.cabecera,
.cuerpo {
  display: grid;
  grid-template-columns: 3.25rem repeat(var(--cols), minmax(0, 1fr));
}

.cabecera {
  position: sticky;
  top: 0;
  z-index: 3;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}

.cab-dia {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 0.5rem 0;
  border-left: 1px solid var(--border);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text);
}

.numero {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  font-size: 18px;
  letter-spacing: 0;
  color: var(--text-h);
}

.examenes {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-self: stretch;
  margin: 4px 0 0;
  padding: 0 3px;
  list-style: none;
}

.examen {
  overflow: hidden;
  padding: 1px 5px;
  border-radius: 4px;
  background: hsl(var(--hue) 55% 40%);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: 0;
  text-overflow: ellipsis;
  text-transform: none;
  white-space: nowrap;
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

.cab-dia.hoy {
  color: var(--accent);
}

.cab-dia.hoy .numero {
  background: var(--accent);
  color: #fff;
}

.horas {
  position: relative;
}

.hora {
  position: absolute;
  right: 0.5rem;
  transform: translateY(-50%);
  font-size: 11px;
  color: var(--text);
}

.columna {
  position: relative;
  border-left: 1px solid var(--border);
  background-image: repeating-linear-gradient(
    to bottom,
    var(--border) 0,
    var(--border) 1px,
    transparent 1px,
    transparent var(--alto-hora)
  );
}

.columna.hoy {
  background-color: var(--accent-bg);
}

.evento {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 1px;
  box-sizing: border-box;
  padding: 4px 6px;
  overflow: hidden;
  border: 0;
  border-radius: 6px;
  background: hsl(var(--hue) 55% 40%);
  color: #fff;
  font: inherit;
  font-size: 12px;
  line-height: 1.25;
  letter-spacing: 0;
  text-align: left;
  cursor: pointer;
  z-index: 1;
}

.evento:hover {
  filter: brightness(1.1);
}

.evento:focus-visible {
  outline: 2px solid var(--text-h);
  outline-offset: 1px;
  z-index: 2;
}

.evento.conflicto {
  box-shadow: 0 0 0 2px #e5484d inset;
}

.evento.compacto {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 6px;
  padding-top: 2px;
  padding-bottom: 2px;
}

.evento.compacto .evento-aula {
  display: none;
}

.evento-titulo {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
}

.evento-hora,
.evento-aula {
  opacity: 0.92;
}

.icono-alerta {
  flex: none;
  width: 14px;
  height: 14px;
  fill: #ffd8d9;
  stroke: #7a1216;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.ahora {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: #e5484d;
  z-index: 2;
  pointer-events: none;
}

.ahora::before {
  content: '';
  position: absolute;
  left: -5px;
  top: -4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e5484d;
}
</style>
