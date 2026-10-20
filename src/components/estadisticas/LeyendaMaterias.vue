<script setup lang="ts">
import type { MateriaEstudio } from '../../utils/estudio'

defineProps<{ materias: MateriaEstudio[] }>()
</script>

<template>
  <ul class="leyenda">
    <li v-for="m in materias" :key="m.id" :title="m.nombre">
      <span class="punto-materia" :style="{ background: m.color }" aria-hidden="true" />
      {{ m.corto }}
    </li>
  </ul>
</template>

<style scoped>
.leyenda {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.8rem;
}

li {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
</style>
