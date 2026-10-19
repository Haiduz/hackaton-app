<script setup lang="ts">
import { useMateriasStore } from '../../stores/materias'

const store = useMateriasStore()
</script>

<template>
  <section class="home">
    <p v-if="!store.seleccionadas.length" class="vacio">
      Todavía no elegiste materias. Podés hacerlo en Perfil.
    </p>

    <ul v-else class="lista">
      <li v-for="m in store.seleccionadas" :key="m.id" class="materia">
        {{ m.name }}
      </li>
    </ul>
  </section>
</template>