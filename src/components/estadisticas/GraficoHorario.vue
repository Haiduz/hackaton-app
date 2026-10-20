<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAncho } from '../../composables/useAncho'
import { hmm, reloj } from '../../utils/estudio'

interface DiaHorario {
  etiqueta: string
  total: number
  inicio: number | null
  fin: number | null
}

const props = defineProps<{ dias: DiaHorario[]; conEtiquetas?: boolean; indicesEtiqueta?: number[] }>()

const caja = ref<HTMLElement | null>(null)
const ancho = useAncho(caja)
const ALTO = 220
const BASE = ALTO - 22
const TOPE = 22

const paso = computed(() => ancho.value / Math.max(1, props.dias.length))
const xCentro = (i: number) => paso.value * (i + 0.5)
const maxTotal = computed(() => Math.max(1, ...props.dias.map(d => d.total)))

const rango = computed(() => {
  const con = props.dias.filter(d => d.inicio !== null && d.fin !== null)
  if (!con.length) return [0, 1440]
  return [Math.min(...con.map(d => d.inicio!)) - 30, Math.max(...con.map(d => d.fin!)) + 30]
})
const yHora = (t: number) => BASE - ((t - rango.value[0]) / (rango.value[1] - rango.value[0])) * (BASE - TOPE)

const barras = computed(() =>
  props.dias.map((d, i) => {
    const h = (d.total / maxTotal.value) * (BASE - TOPE) * 0.85
    const w = Math.max(2, paso.value * 0.62)
    return { x: xCentro(i) - w / 2, y: BASE - h, w, h, d }
  }),
)

function puntos(campo: 'inicio' | 'fin') {
  return props.dias.flatMap((d, i) => {
    const t = d[campo]
    return t === null ? [] : [{ x: xCentro(i), y: yHora(t), t }]
  })
}
const inicios = computed(() => puntos('inicio'))
const fines = computed(() => puntos('fin'))
const polilinea = (ps: { x: number; y: number }[]) => ps.map(p => `${p.x},${p.y}`).join(' ')
const indices = computed(() => props.indicesEtiqueta ?? props.dias.map((_, i) => i))
</script>

<template>
  <div class="horario">
    <ul class="leyenda">
      <li><span class="marca inicio" aria-hidden="true" />Hora de inicio</li>
      <li><span class="marca fin" aria-hidden="true" />Hora de fin</li>
      <li><span class="marca barra" aria-hidden="true" />Horas de foco</li>
    </ul>
    <div ref="caja">
      <svg :width="ancho" :height="ALTO" role="img" aria-label="Horas de foco por día con hora de inicio y fin">
        <line class="eje" x1="0" :x2="ancho" :y1="BASE" :y2="BASE" />
        <rect
          v-for="(b, i) in barras"
          :key="i"
          class="barra"
          :x="b.x"
          :y="b.y"
          :width="b.w"
          :height="b.h"
          rx="3"
        >
          <title>{{ b.d.etiqueta }}: {{ hmm(b.d.total) }}</title>
        </rect>
        <polyline class="linea fin" :points="polilinea(fines)" />
        <polyline class="linea inicio" :points="polilinea(inicios)" />
        <g v-for="(p, i) in fines" :key="`f${i}`">
          <circle class="punto fin" :cx="p.x" :cy="p.y" r="3" />
          <text v-if="conEtiquetas" class="hora" :x="p.x" :y="p.y - 8" text-anchor="middle">{{ reloj(p.t) }}</text>
        </g>
        <g v-for="(p, i) in inicios" :key="`i${i}`">
          <circle class="punto inicio" :cx="p.x" :cy="p.y" r="3" />
          <text v-if="conEtiquetas" class="hora" :x="p.x" :y="p.y + 15" text-anchor="middle">{{ reloj(p.t) }}</text>
        </g>
        <text
          v-for="i in indices"
          :key="`x${i}`"
          class="eje-x"
          :x="xCentro(i)"
          :y="ALTO - 4"
          text-anchor="middle"
        >
          {{ dias[i]?.etiqueta }}
        </text>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.horario {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.leyenda {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.8rem;
}

.leyenda li {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.marca {
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 50%;
}

.marca.inicio { background: var(--text-h); }
.marca.fin { background: var(--text); }
.marca.barra { border-radius: 2px; background: var(--calor-3); }

svg {
  display: block;
  overflow: visible;
}

.eje {
  stroke: var(--border);
}

.barra {
  fill: var(--calor-3);
}

.linea {
  fill: none;
  stroke-width: 1.5;
  stroke-linejoin: round;
}

.linea.inicio { stroke: var(--text-h); }
.linea.fin { stroke: var(--text); stroke-dasharray: 4 3; }

.punto {
  stroke: var(--bg);
  stroke-width: 1.5;
}

.punto.inicio { fill: var(--text-h); }
.punto.fin { fill: var(--text); }

.hora {
  fill: var(--text-h);
  font-size: 10px;
  paint-order: stroke;
  stroke: var(--bg);
  stroke-width: 3px;
}

.eje-x {
  fill: var(--text);
  font-size: 11px;
}
</style>
