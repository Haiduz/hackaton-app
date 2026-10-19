<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useMateriasStore } from '../../stores/materias';
import { ESTADOS, type EstadoMateria } from '../../data/correlativas'

const store = useMateriasStore()
onMounted(() => store.cargarDisponibles())

const opcionesEstado = Object.entries(ESTADOS) as [EstadoMateria, { label: string }][]

const planPorAño = computed(() => {
  const grupos = new Map<number, typeof store.plan>()
  store.plan.forEach((m) => grupos.set(m.year, [...(grupos.get(m.year) ?? []), m]))
  return [...grupos.entries()].sort(([a], [b]) => a - b)
})

function onEstadoChange(id: number, event: Event) {
  store.setEstado(id, (event.target as HTMLSelectElement).value as EstadoMateria)
}
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
        {{ m.nombre }}
      </label>
    </li>
  </ul>

  <section class="estados" aria-labelledby="estados-titulo">
    <h2 id="estados-titulo">Estado de mis materias</h2>
    <p class="ayuda">Lo que marques acá se refleja en el árbol de correlativas.</p>

    <div v-for="[año, materias] in planPorAño" :key="año" class="grupo">
      <h3>{{ año }}° año</h3>
      <ul>
        <li v-for="m in materias" :key="m.id" :class="`estado-${m.estado}`">
          <label :for="`estado-${m.id}`">
            <span class="codigo">{{ m.code }}</span>
            <span class="nombre">{{ m.name }}</span>
          </label>
          <select :id="`estado-${m.id}`" :value="m.estado" @change="onEstadoChange(m.id, $event)">
            <option v-for="[valor, info] in opcionesEstado" :key="valor" :value="valor">
              {{ info.label }}
            </option>
          </select>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.estados {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 16px 96px;
  text-align: left;
}
.estados h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-h);
}
.ayuda {
  margin: 0;
  color: var(--text);
  font-size: 0.875rem;
}
.grupo {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.grupo h3 {
  margin: 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text);
}
.grupo ul {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}
.grupo li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
}
.grupo li:last-child {
  border-bottom: none;
}
.grupo label {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}
.codigo {
  font-family: var(--mono);
  font-size: 0.75rem;
  color: var(--text);
}
.nombre {
  color: var(--text-h);
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
select {
  flex-shrink: 0;
  padding: 6px 8px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text-h);
  font: inherit;
  font-size: 0.85rem;
}
.estado-aprobada select,
.estado-regular select,
.estado-libre select {
  border-color: var(--accent-border);
  background: var(--accent-bg);
}
</style>
