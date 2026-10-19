<script setup lang="ts">
import { onMounted } from 'vue'
import { useMateriasStore } from '../../stores/materias';

const store = useMateriasStore()
onMounted(() => store.cargarDisponibles())
</script>

<template>
  <ul>
    <li v-for="m in store.disponibles" :key="m.id">
      <label>
        <input
          type="checkbox"
          :checked="store.seleccionadas.some(s => s.id === m.id)"
          @change="store.toggleMateria(m)"
        />
        {{ m.name }}
      </label>
    </li>
  </ul>
</template>