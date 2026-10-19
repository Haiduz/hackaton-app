<script setup lang="ts">
import { useMateriasStore } from '../../stores/materias.ts';

const store = useMateriasStore()
</script>

<template>
  <div v-for="m in store.seleccionadas" :key="m.id">
    {{ m.name }}
  </div>
</template>