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
import ListaExamenes from './ListaExamenes.vue'

interface DiaGrilla {
  fecha: Date
  weekday: number
}

const ALTO_HORA = 56

const props = defineProps<{
  dias: DiaGrilla[]
  eventos: EventoCalendario[]
  examenes: ExamenCalendario[]
  conflictoIds: Set<number>
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
  props.dias.map(dia => {
    const clave = claveFecha(dia.fecha)
    return {
      ...dia,
      esHoy: mismoDia(dia.fecha, props.ahora),
      eventos: posicionar(props.eventos.filter(e => e.weekday === dia.weekday)),
      examenes: props.examenes.filter(x => x.fecha === clave),
    }
  }),
)

const examenesSemana = computed(() => columnas.value.flatMap(c => c.examenes))

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
    left: `calc(${e.columna * ancho}% + 1px)`,
    width: `calc(${ancho}% - 2px)`,
    '--hue': e.hue,
  }
}

function corto(e: EventoCalendario): string {
  return e.codigo ?? e.materia.slice(0, 3)
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
    <div class="interna">
      <div class="fijo">
        <div class="cabecera">
          <div class="gutter" />
          <div v-for="c in columnas" :key="c.weekday" class="cab-dia" :class="{ hoy: c.esHoy }">
            <span class="nombre">{{ nombreDia(c.weekday).slice(0, 3) }}</span>
            <span class="numero">{{ c.fecha.getDate() }}</span>
            <span class="marcas" aria-hidden="true">
              <i
                v-for="x in c.examenes.slice(0, 3)"
                :key="x.id"
                class="marca"
                :style="{ '--hue': x.hue }"
              />
            </span>
          </div>
        </div>

        <ListaExamenes
          v-if="examenesSemana.length"
          class="examenes"
          :examenes="examenesSemana"
          titulo="Exámenes de la semana"
        />
      </div>

      <div class="cuerpo" :style="{ height: `${altoTotal}px` }">
        <div class="horas" aria-hidden="true">
          <span
            v-for="(h, i) in horas"
            :key="h"
            class="hora"
            :style="{ top: `${i * ALTO_HORA}px` }"
          >
            <template v-if="i > 0">
              <span class="hora-larga">{{ String(h).padStart(2, '0') }}:00</span>
              <span class="hora-corta">{{ h }}</span>
            </template>
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
              <span class="nombre-largo">{{ e.materia }}</span>
              <span class="nombre-corto">{{ corto(e) }}</span>
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
  container-type: inline-size;
  max-height: calc(100svh - 300px);
  min-height: 320px;
  overflow-x: hidden;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg);
}

.cabecera,
.cuerpo {
  display: grid;
  grid-template-columns: 3.25rem repeat(var(--cols), minmax(0, 1fr));
}

.fijo {
  position: sticky;
  top: 0;
  z-index: 3;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}

.examenes {
  padding: 0.5rem 0.75rem;
  border-top: 1px solid var(--border);
}

.cab-dia {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 0.5rem 0 0.35rem;
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

.cab-dia.hoy {
  color: var(--accent);
}

.cab-dia.hoy .numero {
  background: var(--accent);
  color: #fff;
}

.marcas {
  display: flex;
  gap: 2px;
  min-height: 6px;
}

.marca {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: hsl(var(--hue) 55% 40%);
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

.hora-corta {
  display: none;
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

.nombre-corto {
  display: none;
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

/* Celulares: 7 días comprimidos, el detalle se ve al tocar el bloque. */
@container (max-width: 520px) {
  .cabecera,
  .cuerpo {
    grid-template-columns: 1.5rem repeat(var(--cols), minmax(0, 1fr));
  }

  .cab-dia {
    font-size: 10px;
    letter-spacing: 0;
  }

  .numero {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 14px;
  }

  .hora {
    right: 0.25rem;
    font-size: 10px;
  }

  .hora-larga {
    display: none;
  }

  .hora-corta {
    display: inline;
  }

  .evento {
    padding: 2px;
    border-radius: 4px;
    font-size: 10px;
    line-height: 1.15;
    text-align: center;
  }

  .evento-titulo {
    justify-content: center;
    min-width: 0;
  }

  .nombre-largo,
  .evento-hora,
  .evento-aula,
  .icono-alerta {
    display: none;
  }

  .nombre-corto {
    display: inline;
    overflow: hidden;
    text-overflow: clip;
  }
}
</style>
