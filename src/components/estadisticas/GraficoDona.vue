<script setup lang="ts">
import { computed } from 'vue'
import { hmm } from '../../utils/estudio'

const props = defineProps<{ items: { id: number; nombre: string; color: string; valor: number }[] }>()

const R = 38
const C = 2 * Math.PI * R
const total = computed(() => props.items.reduce((a, i) => a + i.valor, 0))
const segmentos = computed(() => {
  let acumulado = 0
  const hueco = props.items.length > 1 ? 1.2 : 0
  return props.items.map(item => {
    const fraccion = item.valor / Math.max(1, total.value)
    const largo = Math.max(0, fraccion * C - hueco)
    const s = { ...item, fraccion, dash: `${largo} ${C}`, offset: -acumulado * C }
    acumulado += fraccion
    return s
  })
})
const pct = (f: number) => `${Math.round(f * 100)}%`
</script>

<template>
  <div class="dona">
    <svg viewBox="0 0 100 100" role="img" :aria-label="`Total ${hmm(total)}`">
      <circle class="pista" cx="50" cy="50" :r="R" />
      <circle
        v-for="s in segmentos"
        :key="s.id"
        class="segmento"
        cx="50"
        cy="50"
        :r="R"
        :stroke="s.color"
        :stroke-dasharray="s.dash"
        :stroke-dashoffset="s.offset"
        transform="rotate(-90 50 50)"
      >
        <title>{{ s.nombre }}: {{ hmm(s.valor) }} ({{ pct(s.fraccion) }})</title>
      </circle>
      <text class="total num" x="50" y="50" text-anchor="middle">{{ hmm(total) }}</text>
      <text class="sub" x="50" y="61" text-anchor="middle">total</text>
    </svg>
    <ul class="lista">
      <li v-for="s in segmentos" :key="s.id">
        <span class="barra" :style="{ background: s.color }" aria-hidden="true" />
        <span class="nombre">{{ s.nombre }}</span>
        <span class="valor num">{{ hmm(s.valor) }} · {{ pct(s.fraccion) }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.dona {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.25rem;
}

svg {
  flex: none;
  width: 150px;
  height: 150px;
}

.pista {
  fill: none;
  stroke: var(--calor-0);
  stroke-width: 16;
}

.segmento {
  fill: none;
  stroke-width: 16;
  transition: stroke-dasharray 0.4s ease, stroke-dashoffset 0.4s ease;
}

.total {
  fill: var(--text-h);
  font-size: 13px;
  font-weight: 600;
}

.sub {
  fill: var(--text);
  font-size: 7px;
}

.lista {
  display: flex;
  flex: 1 1 200px;
  flex-direction: column;
  gap: 0.45rem;
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.85rem;
}

.lista li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.barra {
  flex: none;
  width: 0.3rem;
  height: 1rem;
  border-radius: 2px;
}

.nombre {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: var(--text-h);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.valor {
  flex: none;
}
</style>
