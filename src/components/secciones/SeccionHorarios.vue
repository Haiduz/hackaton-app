<script setup lang="ts">
import { ref } from 'vue'

interface Horario {
  id: number
  dia: string
  desde: string
  hasta: string
  aula: string | null
}

const props = defineProps<{
  materiaId: number
}>()

const horarios = ref<Horario[]>([])
const cargando = ref(false)
const error = ref<string | null>(null)

// TODO: pedir los horarios a la API con props.materiaId
// (ej: GET `${import.meta.env.VITE_API_URL}/subjects/${props.materiaId}/schedules`),
// cargarlos en `horarios` y manejar `cargando` / `error`.
void props
</script>

<template>
  <div class="horarios">
    <p v-if="cargando" class="estado">Cargando horarios...</p>
    <p v-else-if="error" class="estado estado-error">{{ error }}</p>
    <p v-else-if="!horarios.length" class="estado">Horarios (próximamente)</p>

    <ul v-else class="lista">
      <li v-for="h in horarios" :key="h.id" class="horario">
        <span class="dia">{{ h.dia }}</span>
        <span>{{ h.desde }} - {{ h.hasta }}</span>
        <code v-if="h.aula">{{ h.aula }}</code>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.estado {
  margin: 0;
  font-size: 14px;
}

.estado-error {
  color: #e5484d;
}

.lista {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.horario {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.75rem;
  font-size: 14px;
}

.dia {
  color: var(--text-h);
  font-weight: 500;
}
</style>
