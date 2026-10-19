<script setup lang="ts">
import type { Materia } from '../stores/materias'
import Colapsable from './Colapsable.vue'
import SeccionHorarios from './secciones/SeccionHorarios.vue'

defineProps<{
  materia: Materia
}>()
</script>

<template>
  <Colapsable :titulo="materia.name" :subtitulo="materia.code ?? undefined" variante="materia">
    <slot>
      <p class="placeholder">Información de {{ materia.name }} (próximamente)</p>

      <!-- Cada sección tendrá su propio componente y su propia petición a la API -->
      <section class="seccion">
        <h5 class="seccion-titulo">Horarios</h5>
        <SeccionHorarios :materia-id="materia.id" />
      </section>

      <section class="seccion">
        <h5 class="seccion-titulo">Bibliografía</h5>
        <div class="seccion-vacia" />
      </section>

      <section class="seccion">
        <h5 class="seccion-titulo">Exámenes</h5>
        <div class="seccion-vacia" />
      </section>
    </slot>
  </Colapsable>
</template>

<style scoped>
.placeholder {
  margin: 0;
  font-size: 14px;
}

.seccion {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px dashed var(--border);
  border-radius: 10px;
}

.seccion-titulo {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-h);
}

.seccion-vacia {
  min-height: 1.5rem;
}
</style>
