<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { Check, Lock } from 'lucide-vue-next'
import { etiquetaCondicion, useMateriasStore, type Materia } from '../../stores/materias'
import { NODO_ALTO, NODO_ANCHO } from '../../utils/arbol'

const props = defineProps<{
  data: { materia: Materia; atenuada: boolean; resaltada: boolean }
}>()

const store = useMateriasStore()

const condicion = computed(() => store.condicionDe(props.data.materia.id))
const bloqueadaPorLibre = computed(() => store.bloqueadaPorLibre(props.data.materia.id))
</script>

<template>
  <div
    class="nodo"
    :class="[`condicion-${condicion}`, { atenuada: data.atenuada, resaltada: data.resaltada }]"
    :style="{ width: `${NODO_ANCHO}px`, minHeight: `${NODO_ALTO}px` }"
  >
    <Handle type="target" :position="Position.Left" :connectable="false" />

    <div class="cabecera">
      <code v-if="data.materia.code" class="codigo">{{ data.materia.code }}</code>
      <span v-else />
      <Check v-if="condicion === 'aprobada'" class="icono" :size="14" :stroke-width="2.5" aria-hidden="true" />
      <Lock v-else-if="condicion === 'no_cursable'" class="icono" :size="13" :stroke-width="2.25" aria-hidden="true" />
    </div>

    <p class="nombre" :title="data.materia.name">
      {{ data.materia.name }}<span v-if="condicion === 'aprobada'" class="sr-only"> (aprobada)</span>
    </p>

    <span class="estado">
      {{ etiquetaCondicion(condicion) }}
      <span v-if="bloqueadaPorLibre" class="sr-only"> (bloqueada porque una correlativa está en condición Libre)</span>
    </span>

    <Handle type="source" :position="Position.Right" :connectable="false" />
  </div>
</template>

<style scoped>
.nodo {
  --tono: var(--c-no-cursable);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-left: 0;
  border-radius: 10px;
  box-shadow: inset 4px 0 0 var(--tono), 0 1px 2px rgba(20, 33, 61, 0.08);
  text-align: left;
  transition: opacity 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.nodo:hover {
  transform: translateY(-1px);
  box-shadow: inset 4px 0 0 var(--tono), 0 6px 14px rgba(20, 33, 61, 0.16);
}

.nodo:focus-within {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.condicion-aprobada { --tono: var(--c-aprobada); }
.condicion-regular { --tono: var(--c-regular); }
.condicion-libre { --tono: var(--c-libre); }
.condicion-no_cursable { --tono: var(--c-no-cursable); }

.condicion-no_cursable {
  border-style: dashed;
}

.condicion-no_cursable .nombre {
  opacity: 0.65;
}

.atenuada {
  opacity: 0.28;
}

.resaltada {
  box-shadow: inset 4px 0 0 var(--tono), 0 0 0 2px var(--accent), 0 6px 14px rgba(20, 33, 61, 0.2);
}

.cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 20px;
}

.codigo {
  padding: 1px 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.icono {
  flex-shrink: 0;
  color: var(--tono);
}

.nombre {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  margin: 0;
  color: var(--text-h);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
}

.condicion-aprobada .nombre {
  color: var(--text);
  text-decoration: line-through;
  text-decoration-thickness: 2px;
}

.estado {
  align-self: flex-start;
  margin-top: auto;
  padding: 2px 8px;
  border: 1px solid color-mix(in srgb, var(--tono) 55%, var(--border));
  border-radius: 999px;
  background: color-mix(in srgb, var(--tono) 10%, var(--bg));
  color: var(--text-h);
  font-size: 12px;
  font-weight: 500;
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
