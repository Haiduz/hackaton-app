<script setup lang="ts">
import { useMateriasStore } from '../../stores/materias'
import ColapsableMateria from '../ColapsableMateria.vue'

const store = useMateriasStore()
</script>

<template>
  <section class="home">
    <p v-if="!store.seleccionadas.length" class="vacio">
      Todavía no elegiste materias. Podés hacerlo en Perfil.
    </p>

    <ul v-else class="lista">
      <li v-for="m in store.seleccionadas" :key="m.id">
        <ColapsableMateria :materia="m" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.vacio {
  margin: 0;
  font-size: 14px;
}

.lista {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
