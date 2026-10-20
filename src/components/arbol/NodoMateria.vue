<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  CONDICIONES,
  etiquetaCondicion,
  useMateriasStore,
  type Condicion,
  type Materia,
} from '../../stores/materias'

const props = defineProps<{ materia: Materia }>()
const store = useMateriasStore()

const selectId = `condicion-${props.materia.id}`
const panelId = `correlativas-${props.materia.id}`
const mostrarCorrelativas = ref(false)

const condicion = computed({
  get: () => store.condicionDe(props.materia.id),
  set: (valor: Condicion) => store.setCondicion(props.materia.id, valor),
})

const overview = computed(() => store.overviews[props.materia.id])
const cargando = computed(() => store.overviewsCargando[props.materia.id])
const error = computed(() => store.overviewsError[props.materia.id])

function toggleCorrelativas() {
  mostrarCorrelativas.value = !mostrarCorrelativas.value
  if (mostrarCorrelativas.value) store.cargarOverview(props.materia.id)
}
</script>

<template>
  <div class="nodo" :data-condicion="condicion">
    <div class="fila">
      <div class="info">
        <span class="nombre">
          {{ materia.name }}<span v-if="condicion === 'aprobada'" class="sr-only"> (aprobada)</span>
        </span>
        <code v-if="materia.code" class="codigo">{{ materia.code }}</code>
      </div>

      <div class="acciones">
        <label :for="selectId" class="sr-only">Condición en {{ materia.name }}</label>
        <select :id="selectId" v-model="condicion" class="selector">
          <option v-for="c in CONDICIONES" :key="c.valor" :value="c.valor">{{ c.etiqueta }}</option>
        </select>
        <button
          type="button"
          class="boton"
          :aria-expanded="mostrarCorrelativas"
          :aria-controls="panelId"
          @click="toggleCorrelativas"
        >
          Correlativas
        </button>
      </div>
    </div>

    <div v-if="mostrarCorrelativas" :id="panelId" class="correlativas">
      <p v-if="cargando" class="estado">Cargando correlativas...</p>
      <p v-else-if="error" class="estado estado-error">{{ error }}</p>
      <p v-else-if="overview && !overview.prerequisites.length" class="estado">
        No tiene correlativas.
      </p>
      <ul v-else-if="overview" class="lista-correlativas">
        <li v-for="p in overview.prerequisites" :key="p.id" class="correlativa">
          <span class="correlativa-nombre" :class="{ tachada: store.condicionDe(p.id) === 'aprobada' }">
            {{ p.name }}
          </span>
          <span v-if="p.requirement" class="requisito">Requiere: {{ p.requirement }}</span>
          <span class="estado-correlativa">{{ etiquetaCondicion(store.condicionDe(p.id)) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.nodo {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-left-width: 1px;
  border-radius: 10px;
}

.nodo[data-condicion='cursable'],
.nodo[data-condicion='regular'] {
  border-color: var(--accent-border);
}

.nodo[data-condicion='no_cursable'] {
  opacity: 0.65;
}

.fila {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.nombre {
  color: var(--text-h);
  font-weight: 500;
}

.nodo[data-condicion='aprobada'] .nombre,
.tachada {
  color: var(--text);
  text-decoration: line-through;
  text-decoration-thickness: 2px;
}

.codigo {
  align-self: flex-start;
  font-size: 13px;
  padding: 2px 6px;
}

.acciones {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.selector,
.boton {
  padding: 0.375rem 0.625rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text-h);
  font: inherit;
  font-size: 14px;
  cursor: pointer;
}

.selector:focus-visible,
.boton:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.boton[aria-expanded='true'] {
  border-color: var(--accent);
  color: var(--accent);
}

.correlativas {
  padding-top: 0.5rem;
  border-top: 1px dashed var(--border);
}

.estado {
  margin: 0;
  font-size: 14px;
}

.estado-error {
  color: #e5484d;
}

.lista-correlativas {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.correlativa {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
}

.correlativa-nombre {
  color: var(--text-h);
}

.requisito {
  color: var(--text);
}

.estado-correlativa {
  margin-left: auto;
  padding: 1px 8px;
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 12px;
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
