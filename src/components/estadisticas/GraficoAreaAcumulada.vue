<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAncho } from '../../composables/useAncho'
import { acumular, hmm, type MateriaEstudio } from '../../utils/estudio'
import LeyendaMaterias from './LeyendaMaterias.vue'

const props = defineProps<{
  dias: { etiqueta: string; porMateria: Record<number, number> }[]
  materias: MateriaEstudio[]
  indicesEtiqueta?: number[]
}>()

const caja = ref<HTMLElement | null>(null)
const ancho = useAncho(caja)
const ALTO = 200
const BASE = ALTO - 22
const TOPE = 14

const n = computed(() => props.dias.length)
const x = (i: number) => (n.value <= 1 ? ancho.value / 2 : (i / (n.value - 1)) * ancho.value)

const capas = computed(() => {
  const base = Array<number>(n.value).fill(0)
  return props.materias.map(m => {
    const acc = acumular(props.dias.map(d => d.porMateria[m.id] ?? 0))
    const inferior = [...base]
    acc.forEach((v, i) => (base[i] += v))
    return { materia: m, inferior, superior: [...base] }
  })
})
const max = computed(() => Math.max(1, ...(capas.value.at(-1)?.superior ?? [1])))
const y = (v: number) => BASE - (v / max.value) * (BASE - TOPE)

function camino(inf: number[], sup: number[]) {
  const arriba = sup.map((v, i) => `${x(i)},${y(v)}`)
  const abajo = inf.map((v, i) => `${x(i)},${y(v)}`).reverse()
  return `M${arriba.join(' L')} L${abajo.join(' L')} Z`
}
const indices = computed(() => props.indicesEtiqueta ?? props.dias.map((_, i) => i))
</script>

<template>
  <div class="area">
    <div ref="caja">
      <svg :width="ancho" :height="ALTO" role="img" :aria-label="`Tiempo acumulado del período: ${hmm(max)}`">
        <line class="guia" x1="0" :x2="ancho" :y1="y(max)" :y2="y(max)" />
        <line class="guia" x1="0" :x2="ancho" :y1="y(max / 2)" :y2="y(max / 2)" />
        <text class="valor" :x="ancho" :y="y(max) - 4" text-anchor="end">{{ hmm(max) }}</text>
        <text class="valor" :x="ancho" :y="y(max / 2) - 4" text-anchor="end">{{ hmm(max / 2) }}</text>
        <path
          v-for="c in capas"
          :key="c.materia.id"
          :d="camino(c.inferior, c.superior)"
          :fill="c.materia.color"
          class="capa"
        >
          <title>{{ c.materia.nombre }}: {{ hmm((c.superior.at(-1) ?? 0) - (c.inferior.at(-1) ?? 0)) }}</title>
        </path>
        <line class="eje" x1="0" :x2="ancho" :y1="BASE" :y2="BASE" />
        <text
          v-for="i in indices"
          :key="`x${i}`"
          class="eje-x"
          :x="x(i)"
          :y="ALTO - 4"
          :text-anchor="i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'"
        >
          {{ dias[i]?.etiqueta }}
        </text>
      </svg>
    </div>
    <LeyendaMaterias :materias="materias" />
  </div>
</template>

<style scoped>
.area {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

svg {
  display: block;
  overflow: visible;
}

.capa {
  stroke: var(--bg);
  stroke-width: 0.75;
}

.guia {
  stroke: var(--border);
  stroke-dasharray: 3 4;
}

.eje {
  stroke: var(--border);
}

.valor {
  fill: var(--text);
  font-size: 10px;
}

.eje-x {
  fill: var(--text);
  font-size: 11px;
}
</style>
