<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { Check, Lock } from 'lucide-vue-next'
import type { MateriaPlan } from '../../data/correlativas'
import { ESTADOS } from '../../data/correlativas'

defineProps<{
  data: {
    materia: MateriaPlan
    atenuada: boolean
    resaltada: boolean
  }
}>()
</script>

<template>
  <div
    class="materia-node"
    :class="[`estado-${data.materia.estado}`, { atenuada: data.atenuada, resaltada: data.resaltada }]"
    role="button"
    :aria-label="`${data.materia.name}, ${ESTADOS[data.materia.estado].label}`"
  >
    <Handle type="target" :position="Position.Left" :connectable="false" />
    <div class="cabecera">
      <span class="codigo">{{ data.materia.code }}</span>
      <span class="estado">
        <Check v-if="data.materia.estado === 'aprobada'" :size="12" :stroke-width="2.5" aria-hidden="true" />
        <Lock v-else-if="data.materia.estado === 'no_cursable'" :size="11" :stroke-width="2.25" aria-hidden="true" />
        {{ ESTADOS[data.materia.estado].label }}
      </span>
    </div>
    <p class="nombre">{{ data.materia.name }}</p>
    <Handle type="source" :position="Position.Right" :connectable="false" />
  </div>
</template>

<style scoped>
.materia-node {
  --tono: var(--c-no-cursable);
  width: 176px;
  min-height: 72px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  background: var(--c-superficie);
  border: 1px solid var(--c-borde);
  border-left: 0;
  border-radius: 10px;
  box-shadow: inset 4px 0 0 var(--tono), 0 1px 2px rgba(20, 33, 61, 0.06);
  text-align: left;
  cursor: pointer;
  transition: opacity 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.materia-node:hover {
  transform: translateY(-1px);
  box-shadow: inset 4px 0 0 var(--tono), 0 6px 14px rgba(20, 33, 61, 0.12);
}

.estado-aprobada { --tono: var(--c-aprobada); }
.estado-regular { --tono: var(--c-regular); }
.estado-cursable { --tono: var(--c-cursable); }
.estado-no_cursable { --tono: var(--c-no-cursable); }

.atenuada { opacity: 0.28; }

.resaltada {
  box-shadow: inset 4px 0 0 var(--tono), 0 0 0 2px var(--c-tinta), 0 6px 14px rgba(20, 33, 61, 0.14);
}

.cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.codigo {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--c-tinta-suave);
}

.estado {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  color: var(--tono);
  background: color-mix(in srgb, var(--tono) 12%, transparent);
}

.nombre {
  margin: 0;
  font-size: 13px;
  line-height: 1.3;
  font-weight: 600;
  color: var(--c-tinta);
  text-wrap: balance;
}

.materia-node :deep(.vue-flow__handle) {
  opacity: 0;
  pointer-events: none;
}
</style>
