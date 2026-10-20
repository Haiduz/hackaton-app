<script setup lang="ts">
import { computed } from 'vue'
import { desdeClave, ETIQUETA_TIPO, type ExamenCalendario } from '../../utils/calendario'

const props = defineProps<{
  examenes: ExamenCalendario[]
  titulo: string
  vacio?: string
}>()

const formato = new Intl.DateTimeFormat('es-AR', { weekday: 'short', day: 'numeric' })

const filas = computed(() =>
  [...props.examenes]
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .map(e => ({ ...e, dia: formato.format(desdeClave(e.fecha)).replace('.', '') })),
)
</script>

<template>
  <section class="lista" :aria-label="titulo">
    <ul v-if="filas.length">
      <li v-for="f in filas" :key="f.id" :style="{ '--hue': f.hue }">
        <span class="punto" aria-hidden="true" />
        <span class="dia">{{ f.dia }}</span>
        <span class="texto">{{ ETIQUETA_TIPO[f.tipo] }} de {{ f.materia }}</span>
      </li>
    </ul>
    <p v-else-if="vacio" class="vacio">{{ vacio }}</p>
  </section>
</template>

<style scoped>
ul {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

li {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 14px;
  line-height: 1.3;
  color: var(--text-h);
}

.punto {
  flex: none;
  align-self: center;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: hsl(var(--hue) 55% 40%);
}

.dia {
  flex: none;
  min-width: 3.4rem;
  font-weight: 600;
  text-transform: capitalize;
}

.texto {
  min-width: 0;
  overflow-wrap: anywhere;
}

.vacio {
  margin: 0;
  font-size: 14px;
}
</style>
