<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAncho } from '../../composables/useAncho'
import { hmmss } from '../../utils/estudio'

const props = defineProps<{
  actual: number[]
  anterior: number[]
  corte: number | null
  etiquetas: { pos: number; texto: string }[]
  textoCorte: string
  textoActual: string
  textoAnterior: string
}>()

const caja = ref<HTMLElement | null>(null)
const ancho = useAncho(caja)
const ALTO = 150
const BASE = ALTO - 20

const n = computed(() => props.actual.length)
const ultimo = computed(() => props.corte ?? n.value - 1)
const max = computed(() => Math.max(1, ...props.actual, ...props.anterior))
const x = (i: number) => (i / n.value) * ancho.value
const y = (v: number) => BASE - (v / max.value) * (BASE - 8)

function escalones(valores: number[], hasta: number) {
  let d = `M0 ${y(0)}`
  for (let i = 0; i <= hasta; i++) {
    const v = valores[i] ?? valores[valores.length - 1] ?? 0
    d += ` L${x(i)} ${y(v)} L${x(i + 1)} ${y(v)}`
  }
  return d
}

const area = computed(() => `${escalones(props.anterior, n.value - 1)} L${ancho.value} ${y(0)} Z`)
const linea = computed(() => escalones(props.actual, ultimo.value))
const marcador = computed(() => ({ x: x(ultimo.value + 1), y: y(props.actual[ultimo.value] ?? 0) }))
const diferencia = computed(
  () => (props.actual[ultimo.value] ?? 0) - (props.anterior[ultimo.value] ?? props.anterior[props.anterior.length - 1] ?? 0),
)
</script>

<template>
  <div class="comparacion">
    <div class="info">
      <p class="corte">{{ textoCorte }}</p>
      <p class="dif num" :class="{ positiva: diferencia >= 0 }">
        {{ diferencia >= 0 ? '+' : '−' }}{{ hmmss(Math.abs(diferencia)) }}
      </p>
      <ul class="leyenda">
        <li><span class="marca linea-marca" aria-hidden="true" />{{ textoActual }}</li>
        <li><span class="marca area-marca" aria-hidden="true" />{{ textoAnterior }}</li>
      </ul>
    </div>
    <div ref="caja" class="grafico">
      <svg
        :width="ancho"
        :height="ALTO"
        role="img"
        :aria-label="`${textoActual} contra ${textoAnterior}: diferencia de ${hmmss(Math.abs(diferencia))}`"
      >
        <line class="eje" x1="0" :x2="ancho" :y1="y(0)" :y2="y(0)" />
        <path class="area" :d="area" />
        <path class="linea" :d="linea" />
        <circle class="halo" :cx="marcador.x" :cy="marcador.y" r="8" />
        <circle class="punto" :cx="marcador.x" :cy="marcador.y" r="4" />
        <text
          v-for="e in etiquetas"
          :key="e.texto + e.pos"
          :x="e.pos * ancho"
          :y="ALTO - 4"
          :text-anchor="e.pos <= 0 ? 'start' : e.pos >= 1 ? 'end' : 'middle'"
        >
          {{ e.texto }}
        </text>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.comparacion {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
}

.info {
  flex: 0 0 9rem;
}

.info p {
  margin: 0;
}

.corte {
  font-size: 0.85rem;
}

.dif {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--text-h);
}

.dif.positiva {
  color: var(--accent);
}

.leyenda {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin: 0.75rem 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.8rem;
}

.leyenda li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.marca {
  width: 1.1rem;
  height: 0.65rem;
  border-radius: 2px;
}

.linea-marca {
  height: 3px;
  background: var(--accent);
}

.area-marca {
  background: var(--border);
}

.grafico {
  flex: 1 1 240px;
  min-width: 0;
}

svg {
  display: block;
  overflow: visible;
}

.eje {
  stroke: var(--border);
}

.area {
  fill: var(--border);
}

.linea {
  fill: none;
  stroke: var(--accent);
  stroke-width: 2.5;
  stroke-linejoin: round;
}

.halo {
  fill: var(--calor-1);
}

.punto {
  fill: var(--bg);
  stroke: var(--accent);
  stroke-width: 2.5;
}

text {
  fill: var(--text);
  font-size: 11px;
}
</style>
