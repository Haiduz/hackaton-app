<script setup lang="ts">
import { computed } from 'vue'
import { CONDICIONES, useMateriasStore, type Condicion, type Materia } from '../../stores/materias'
import { NODO_ALTO, NODO_ANCHO } from '../../utils/arbol'

const props = defineProps<{ materia: Materia; x: number; y: number; atenuado?: boolean }>()
const store = useMateriasStore()

const selectId = `condicion-${props.materia.id}`
const hintId = `bloqueo-${props.materia.id}`

const condicion = computed(() => store.condicionDe(props.materia.id))
const bloqueadaPorLibre = computed(() => store.bloqueadaPorLibre(props.materia.id))

function cambiarCondicion(event: Event) {
  store.setCondicion(props.materia.id, (event.target as HTMLSelectElement).value as Condicion)
}
</script>

<template>
  <div
    class="nodo"
    :class="{ atenuado }"
    :data-condicion="condicion"
    :style="{ left: `${x}px`, top: `${y}px`, width: `${NODO_ANCHO}px`, height: `${NODO_ALTO}px` }"
  >
    <div class="info">
      <span class="nombre" :title="materia.name">
        {{ materia.name }}<span v-if="condicion === 'aprobada'" class="sr-only"> (aprobada)</span>
      </span>
      <code v-if="materia.code" class="codigo">{{ materia.code }}</code>
    </div>

    <label :for="selectId" class="sr-only">Condición en {{ materia.name }}</label>
    <select
      :id="selectId"
      class="selector"
      :value="condicion"
      :disabled="bloqueadaPorLibre"
      :aria-describedby="bloqueadaPorLibre ? hintId : undefined"
      @change="cambiarCondicion"
    >
      <option v-for="c in CONDICIONES" :key="c.valor" :value="c.valor">{{ c.etiqueta }}</option>
    </select>
    <span v-if="bloqueadaPorLibre" :id="hintId" class="sr-only">
      Bloqueada porque una correlativa está en condición Libre.
    </span>
  </div>
</template>

<style scoped>
.nodo {
  position: absolute;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.375rem;
  padding: 0.5rem 0.625rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
  transition: opacity 0.2s, border-color 0.2s;
}

.nodo:focus-within {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.nodo[data-condicion='regular'],
.nodo[data-condicion='libre'] {
  border-color: var(--accent-border);
}

.nodo[data-condicion='no_cursable'] {
  border-style: dashed;
}

.nodo[data-condicion='no_cursable'] .info {
  opacity: 0.6;
}

.nodo.atenuado {
  opacity: 0.35;
}

.info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  min-width: 0;
}

.nombre {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  color: var(--text-h);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.25;
}

.nodo[data-condicion='aprobada'] .nombre {
  color: var(--text);
  text-decoration: line-through;
  text-decoration-thickness: 2px;
}

.codigo {
  font-size: 12px;
  padding: 1px 6px;
}

.selector {
  width: 100%;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text-h);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.selector:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.selector:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
