<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { hmm, type Celda } from '../../utils/estudio'

const props = defineProps<{
  titulo: string
  celdas: Celda[]
  columnas: number
  cabeceras?: string[]
  seleccion: string
  umbrales: number[]
  total: string
  puedeSiguiente: boolean
  compacta?: boolean
}>()
const emit = defineEmits<{ seleccionar: [id: string]; anterior: []; siguiente: [] }>()

const niveles = computed(() => {
  const u = props.umbrales
  return ['0', `<${u[0]}`, ...u.map(x => `${x}+`)]
})
</script>

<template>
  <section class="tarjeta mapa" :aria-label="`Mapa de calor: ${titulo}`">
    <header class="nav">
      <button type="button" class="btn btn-icono btn-fantasma" aria-label="Período anterior" @click="emit('anterior')">
        <ChevronLeft :size="18" aria-hidden="true" />
      </button>
      <h4 class="titulo" aria-live="polite">{{ titulo }}</h4>
      <button
        type="button"
        class="btn btn-icono btn-fantasma"
        aria-label="Período siguiente"
        :disabled="!puedeSiguiente"
        @click="emit('siguiente')"
      >
        <ChevronRight :size="18" aria-hidden="true" />
      </button>
    </header>

    <div class="grilla" :class="{ compacta }" :style="{ gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))` }">
      <span v-for="c in cabeceras" :key="c" class="cabecera" aria-hidden="true">{{ c }}</span>
      <button
        v-for="celda in celdas"
        :key="celda.id"
        type="button"
        class="celda"
        :class="[`n${celda.nivel}`, { fuera: celda.fuera, sel: celda.id === seleccion }]"
        :disabled="celda.futuro"
        :aria-pressed="celda.id === seleccion"
        :aria-label="`${celda.etiqueta}: ${celda.valor > 0 ? hmm(celda.valor) : 'sin estudio'}`"
        @click="emit('seleccionar', celda.id)"
      >
        <span class="sup">{{ celda.superior }}</span>
        <span class="val num">{{ celda.valor > 0 ? hmm(celda.valor) : '' }}</span>
      </button>
    </div>

    <footer class="pie">
      <div class="leyenda" aria-label="Escala de intensidad en horas">
        <span>Menos</span>
        <span v-for="(n, i) in niveles" :key="n" class="nivel">
          <span class="cuadro" :class="`n${i}`" aria-hidden="true" />
          <span class="umbral">{{ n }}</span>
        </span>
        <span>Más (h)</span>
      </div>
      <span class="total num">{{ total }}</span>
    </footer>
  </section>
</template>

<style scoped>
.mapa {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.titulo {
  flex: 1;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-h);
  text-align: center;
}

.grilla {
  display: grid;
  gap: 3px;
}

.cabecera {
  padding-bottom: 0.15rem;
  font-size: 0.72rem;
  font-weight: 600;
  text-align: center;
  color: var(--text);
}

.celda {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
  min-height: 3.4rem;
  padding: 0.3rem 0.15rem;
  border: none;
  border-radius: 7px;
  background: var(--calor-0);
  color: var(--text-h);
  font: inherit;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.compacta .celda {
  min-height: 2.9rem;
}

.celda:hover:not(:disabled) {
  transform: scale(1.04);
}

.celda:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.celda.sel {
  box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--text-h);
}

.celda.fuera {
  opacity: 0.35;
}

.celda:disabled {
  background: transparent;
  color: var(--text);
  opacity: 0.45;
  cursor: default;
}

.sup {
  font-size: 0.72rem;
  line-height: 1.2;
  white-space: nowrap;
}

.val {
  min-height: 1em;
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.2;
}

.n0 { background: var(--calor-0); }
.n1 { background: var(--calor-1); }
.n2 { background: var(--calor-2); }
.n3 { background: var(--calor-3); }
.n4 { background: var(--calor-4); color: var(--on-accent); }
.n5 { background: var(--calor-5); color: #fff; }

.pie {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.72rem;
}

.leyenda {
  display: flex;
  align-items: flex-start;
  gap: 0.3rem;
}

.leyenda > span:first-child,
.leyenda > span:last-child {
  padding-top: 0.1rem;
}

.nivel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
}

.cuadro {
  width: 1.05rem;
  height: 1.05rem;
  border-radius: 4px;
}

.umbral {
  font-size: 0.65rem;
}

.total {
  font-weight: 600;
  color: var(--text-h);
}
</style>
