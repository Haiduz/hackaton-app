<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useMateriasStore } from '../../stores/materias'
import { nombreDia, ordenarComisiones, textoAula } from '../../utils/horarios'

const props = defineProps<{
  materiaId: number
}>()

const store = useMateriasStore()

const cargando = computed(() => store.overviewsCargando[props.materiaId] ?? false)
const error = computed(() => store.overviewsError[props.materiaId] ?? null)
const comisiones = computed(() =>
  ordenarComisiones(store.overviews[props.materiaId]?.sessions ?? []),
)
const cargado = computed(() => !!store.overviews[props.materiaId])

onMounted(() => store.cargarOverview(props.materiaId))
</script>

<template>
  <div class="horarios">
    <p v-if="cargando" class="estado">Cargando horarios...</p>
    <p v-else-if="error" class="estado estado-error">{{ error }}</p>
    <p v-else-if="cargado && !comisiones.length" class="estado">Sin horarios publicados.</p>

    <ul v-else class="lista">
      <li v-for="c in comisiones" :key="c.id" class="horario">
        <span class="dia">{{ nombreDia(c.weekday) }}</span>
        <span>{{ c.start_time }} - {{ c.end_time }}</span>
        <code v-if="textoAula(c)">{{ textoAula(c) }}</code>
        <span v-if="c.mode && c.mode !== 'presencial'" class="modo">{{ c.mode }}</span>
        <span v-if="c.notes" class="notas">{{ c.notes }}</span>
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
  gap: 0.25rem 0.75rem;
  font-size: 14px;
}

.dia {
  min-width: 5.5rem;
  color: var(--text-h);
  font-weight: 500;
}

.modo {
  text-transform: capitalize;
}

.notas {
  flex-basis: 100%;
  font-size: 13px;
}
</style>
