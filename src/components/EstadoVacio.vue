<script setup lang="ts">
withDefaults(
  defineProps<{
    mensaje?: string
  }>(),
  { mensaje: 'Todavía no elegiste materias. Podés hacerlo en Perfil.' }
)
</script>

<template>
  <p class="estado-vacio">
    <slot>{{ mensaje }}</slot>
  </p>
</template>

<style scoped>
.estado-vacio {
  margin: 0;
  font-size: 14px;
}
</style>
