<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAncho } from '../../composables/useAncho'
import { hmm, reloj } from '../../utils/estudio'

const props = defineProps<{ puntos: { inicio: number; fin: number; total: number }[] }>()

const caja = ref<HTMLElement | null>(null)
const ancho = useAncho(caja)
const ALTO = 220
const IZQ = 48
const BASE = ALTO - 40
const TOPE = 10

const promedio = (vals: number[]) => vals.reduce((a, v) => a + v, 0) / Math.max(1, vals.length)
const promInicio = computed(() => promedio(props.puntos.map(p => p.inicio)))
const promFin = computed(() => promedio(props.puntos.map(p => p.fin)))
const promTotal = computed(() => promedio(props.puntos.map(p => p.total)))

const dominio = computed(() => {
  const min = Math.min(...props.puntos.map(p => p.inicio))
  const max = Math.max(...props.puntos.map(p => p.fin))
  return [Math.max(0, Math.floor((min - 60) / 60) * 60), Math.min(1440, Math.ceil((max + 60) / 60) * 60)]
})
const maxTotal = computed(() => Math.max(1, ...props.puntos.map(p => p.total)) * 1.12)
const x = (t: number) => IZQ + ((t - dominio.value[0]) / (dominio.value[1] - dominio.value[0])) * (ancho.value - IZQ - 8)
const y = (v: number) => BASE - (v / maxTotal.value) * (BASE - TOPE)
</script>

<template>
  <div class="dispersion">
    <ul class="leyenda">
      <li><span class="marca inicio" aria-hidden="true" />Inicio del día</li>
      <li><span class="marca fin" aria-hidden="true" />Fin del día</li>
    </ul>
    <div ref="caja">
      <svg
        :width="ancho"
        :height="ALTO"
        role="img"
        :aria-label="`Inicio promedio ${reloj(promInicio)}, fin promedio ${reloj(promFin)}, promedio diario ${hmm(promTotal)}`"
      >
        <line class="eje" :x1="IZQ" :x2="ancho" :y1="BASE" :y2="BASE" />
        <line class="eje" :x1="IZQ" :x2="IZQ" :y1="TOPE" :y2="BASE" />
        <line class="guia" :x1="IZQ" :x2="ancho" :y1="y(promTotal)" :y2="y(promTotal)" />
        <line class="guia" :x1="x(promInicio)" :x2="x(promInicio)" :y1="TOPE" :y2="BASE" />
        <line class="guia" :x1="x(promFin)" :x2="x(promFin)" :y1="TOPE" :y2="BASE" />

        <circle v-for="(p, i) in puntos" :key="`f${i}`" class="punto fin" :cx="x(p.fin)" :cy="y(p.total)" r="4.5">
          <title>Fin {{ reloj(p.fin) }} · {{ hmm(p.total) }}</title>
        </circle>
        <circle v-for="(p, i) in puntos" :key="`i${i}`" class="punto inicio" :cx="x(p.inicio)" :cy="y(p.total)" r="4.5">
          <title>Inicio {{ reloj(p.inicio) }} · {{ hmm(p.total) }}</title>
        </circle>

        <text class="etiqueta" :x="IZQ - 6" :y="y(promTotal) - 3" text-anchor="end">Prom.</text>
        <text class="valor" :x="IZQ - 6" :y="y(promTotal) + 10" text-anchor="end">{{ hmm(promTotal) }}</text>
        <text class="etiqueta" :x="x(promInicio)" :y="BASE + 16" text-anchor="middle">Prom. inicio</text>
        <text class="valor" :x="x(promInicio)" :y="BASE + 30" text-anchor="middle">{{ reloj(promInicio) }}</text>
        <text class="etiqueta" :x="x(promFin)" :y="BASE + 16" text-anchor="middle">Prom. fin</text>
        <text class="valor" :x="x(promFin)" :y="BASE + 30" text-anchor="middle">{{ reloj(promFin) }}</text>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.dispersion {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.leyenda {
  display: flex;
  gap: 1rem;
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

.marca.inicio { background: var(--accent); }
.marca.fin { background: var(--text); }

svg {
  display: block;
  overflow: visible;
}

.eje {
  stroke: var(--border);
}

.guia {
  stroke: var(--text);
  stroke-dasharray: 3 4;
  opacity: 0.5;
}

.punto {
  stroke: var(--bg);
  stroke-width: 1.5;
  opacity: 0.85;
}

.punto.inicio { fill: var(--accent); }
.punto.fin { fill: var(--text); }

.etiqueta {
  fill: var(--text);
  font-size: 10px;
}

.valor {
  fill: var(--text-h);
  font-size: 11px;
  font-weight: 600;
}
</style>
