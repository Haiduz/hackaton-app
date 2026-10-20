<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAncho } from '../../composables/useAncho'
import { hmm, type MateriaEstudio } from '../../utils/estudio'
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

const paso = computed(() => ancho.value / Math.max(1, props.dias.length))
const totales = computed(() => props.dias.map(d => Object.values(d.porMateria).reduce((a, v) => a + v, 0)))
const max = computed(() => Math.max(1, ...totales.value))

const pilas = computed(() =>
  props.dias.map((d, i) => {
    const w = Math.max(2, paso.value * 0.62)
    const x = paso.value * (i + 0.5) - w / 2
    let y = BASE
    const segmentos = props.materias.flatMap(m => {
      const v = d.porMateria[m.id] ?? 0
      if (!v) return []
      const h = (v / max.value) * (BASE - 8)
      y -= h
      return [{ x, y, w, h, color: m.color, titulo: `${d.etiqueta} · ${m.nombre}: ${hmm(v)}` }]
    })
    return segmentos
  }),
)
const indices = computed(() => props.indicesEtiqueta ?? props.dias.map((_, i) => i))
</script>

<template>
  <div class="barras">
    <div ref="caja">
      <svg :width="ancho" :height="ALTO" role="img" aria-label="Horas de foco por día, apiladas por materia">
        <line class="eje" x1="0" :x2="ancho" :y1="BASE" :y2="BASE" />
        <g v-for="(pila, i) in pilas" :key="i">
          <rect
            v-for="(s, j) in pila"
            :key="j"
            :x="s.x"
            :y="s.y"
            :width="s.w"
            :height="Math.max(0, s.h - 1)"
            :fill="s.color"
            rx="2"
          >
            <title>{{ s.titulo }}</title>
          </rect>
        </g>
        <text
          v-for="i in indices"
          :key="`x${i}`"
          :x="paso * (i + 0.5)"
          :y="ALTO - 4"
          text-anchor="middle"
        >
          {{ dias[i]?.etiqueta }}
        </text>
      </svg>
    </div>
    <LeyendaMaterias :materias="materias" />
  </div>
</template>

<style scoped>
.barras {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

svg {
  display: block;
  overflow: visible;
}

.eje {
  stroke: var(--border);
}

text {
  fill: var(--text);
  font-size: 11px;
}
</style>
