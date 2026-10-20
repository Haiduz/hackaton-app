<script setup lang="ts">
import type { MateriaEstudio } from '../../utils/estudio'

defineProps<{ materia?: MateriaEstudio }>()
</script>

<template>
  <span
    class="chip-materia"
    :style="{ '--color-materia': materia?.color ?? 'var(--text)' }"
    :title="materia?.nombre"
  >
    <span class="punto" aria-hidden="true" />
    <span class="iniciales">{{ materia?.corto ?? '—' }}</span>
  </span>
</template>

<style scoped>
.chip-materia {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.15rem 0.5rem 0.15rem 0.4rem;
  border: 1px solid color-mix(in srgb, var(--color-materia) 55%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-materia) 16%, transparent);
  color: var(--text-h);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
}

.punto {
  flex: none;
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: var(--color-materia);
}
</style>
