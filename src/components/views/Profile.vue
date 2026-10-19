<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useMateriasStore, type Materia } from '../../stores/materias'

const store = useMateriasStore()
onMounted(() => store.cargarDisponibles())

const materiasPorAnio = computed(() => {
  const grupos = new Map<number | null, Materia[]>()
  for (const m of store.disponibles) {
    const lista = grupos.get(m.year) ?? []
    lista.push(m)
    grupos.set(m.year, lista)
  }
  return [...grupos.entries()]
    .sort(([a], [b]) => (a ?? 99) - (b ?? 99))
    .map(([anio, materias]) => ({
      anio,
      materias: [...materias].sort(
        (a, b) => (a.term ?? 99) - (b.term ?? 99) || a.name.localeCompare(b.name)
      ),
    }))
})

function estaSeleccionada(materia: Materia) {
  return store.seleccionadas.some(s => s.id === materia.id)
}
</script>

<template>
  <section class="profile">
    <header class="profile-header">
      <h3>Mis materias</h3>
      <span class="contador">{{ store.seleccionadas.length }} seleccionadas</span>
    </header>

    <p v-if="store.cargando" class="estado">Cargando materias...</p>
    <p v-else-if="store.error" class="estado estado-error">{{ store.error }}</p>
    <p v-else-if="!store.disponibles.length" class="estado">No hay materias disponibles.</p>

    <section v-for="grupo in materiasPorAnio" :key="String(grupo.anio)" class="anio">
      <h4 class="anio-titulo">
        {{ grupo.anio ? `${grupo.anio}º año` : 'Sin año asignado' }}
      </h4>
      <ul class="lista">
        <li v-for="m in grupo.materias" :key="m.id">
          <label class="materia" :class="{ activa: estaSeleccionada(m) }">
            <input
              type="checkbox"
              :checked="estaSeleccionada(m)"
              @change="store.toggleMateria(m)"
            />
            <span class="materia-info">
              <span class="materia-nombre">{{ m.name }}</span>
              <span class="materia-meta">
                <code v-if="m.code">{{ m.code }}</code>
                <span v-if="m.term">{{ m.term }}º cuatrimestre</span>
              </span>
            </span>
          </label>
        </li>
      </ul>
    </section>
  </section>
</template>

<style scoped>
.profile {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.profile-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.profile-header h3 {
  margin: 0;
  color: var(--text-h);
}

.contador {
  font-size: 14px;
  color: var(--accent);
}

.estado {
  margin: 0;
  font-size: 14px;
}

.estado-error {
  color: #e5484d;
}

.anio {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.anio-titulo {
  margin: 0;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.lista {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.materia {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

.materia:hover {
  border-color: var(--accent-border);
}

.materia.activa {
  border-color: var(--accent);
  background: var(--accent-bg);
}

.materia input {
  width: 18px;
  height: 18px;
  accent-color: var(--accent);
  flex-shrink: 0;
}

.materia-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.materia-nombre {
  color: var(--text-h);
  font-weight: 500;
  font-size: 16px;
}

.materia-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
}

.materia-meta code {
  font-size: 13px;
  padding: 2px 6px;
}
</style>
