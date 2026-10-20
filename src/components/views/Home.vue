<script setup lang="ts">
import { useMateriasStore } from '../../stores/materias'
import ColapsableMateria from '../ColapsableMateria.vue'
import EstadoVacio from '../EstadoVacio.vue'
import MiniCalendario from '../estadisticas/MiniCalendario.vue'

const store = useMateriasStore()
</script>

<template>
  <section class="home">
    <MiniCalendario />

    <EstadoVacio v-if="!store.seleccionadas.length" />

    <ul v-else class="lista">
      <li v-for="m in store.seleccionadas" :key="m.id">
        <ColapsableMateria :materia="m" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.lista {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
