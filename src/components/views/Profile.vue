<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useMateriasStore, type Materia } from '../../stores/materias'
import Colapsable from '../Colapsable.vue'

interface GrupoCuatrimestre {
  term: number | null
  materias: Materia[]
  seleccionadas: number
}

interface GrupoAnio {
  anio: number | null
  cuatrimestres: GrupoCuatrimestre[]
  seleccionadas: number
}

const store = useMateriasStore()
onMounted(() => store.cargarDisponibles())

function estaSeleccionada(materia: Materia) {
  return store.seleccionadas.some(s => s.id === materia.id)
}

function porValorNullAlFinal(a: number | null, b: number | null) {
  if (a === b) return 0
  if (a === null) return 1
  if (b === null) return -1
  return a - b
}

const materiasPorAnioYCuatrimestre = computed<GrupoAnio[]>(() => {
  const anios = new Map<number | null, Map<number | null, Materia[]>>()

  for (const m of store.disponibles) {
    const cuatrimestres = anios.get(m.year) ?? new Map<number | null, Materia[]>()
    const lista = cuatrimestres.get(m.term) ?? []
    lista.push(m)
    cuatrimestres.set(m.term, lista)
    anios.set(m.year, cuatrimestres)
  }

  return [...anios.entries()]
    .sort(([a], [b]) => porValorNullAlFinal(a, b))
    .map(([anio, cuatrimestres]) => {
      const grupos = [...cuatrimestres.entries()]
        .sort(([a], [b]) => porValorNullAlFinal(a, b))
        .map(([term, materias]) => ({
          term,
          materias: [...materias].sort((a, b) => a.name.localeCompare(b.name)),
          seleccionadas: materias.filter(estaSeleccionada).length,
        }))
      return {
        anio,
        cuatrimestres: grupos,
        seleccionadas: grupos.reduce((total, g) => total + g.seleccionadas, 0),
      }
    })
})

function tituloAnio(anio: number | null) {
  return anio !== null ? `${anio}º año` : 'Sin año asignado'
}

function tituloCuatrimestre(term: number | null) {
  return term !== null ? `${term}º cuatrimestre` : 'Sin cuatrimestre asignado'
}

function contadorTexto(cantidad: number) {
  return `${cantidad} ${cantidad === 1 ? 'seleccionada' : 'seleccionadas'}`
}
</script>

<template>
  <section class="profile">
    <header class="profile-header">
      <h3>Mis materias</h3>
      <span class="contador">{{ contadorTexto(store.seleccionadas.length) }}</span>
    </header>

    <p v-if="store.cargando" class="estado">Cargando materias...</p>
    <p v-else-if="store.error" class="estado estado-error">{{ store.error }}</p>
    <p v-else-if="!store.disponibles.length" class="estado">No hay materias disponibles.</p>

    <div class="anios">
      <Colapsable
        v-for="grupo in materiasPorAnioYCuatrimestre"
        :key="String(grupo.anio)"
        :titulo="tituloAnio(grupo.anio)"
        :badge="contadorTexto(grupo.seleccionadas)"
        variante="anio"
      >
        <Colapsable
          v-for="cuatri in grupo.cuatrimestres"
          :key="String(cuatri.term)"
          :titulo="tituloCuatrimestre(cuatri.term)"
          :badge="contadorTexto(cuatri.seleccionadas)"
          variante="cuatrimestre"
        >
          <ul class="lista">
            <li v-for="m in cuatri.materias" :key="m.id">
              <label class="materia" :class="{ activa: estaSeleccionada(m) }">
                <input
                  type="checkbox"
                  :checked="estaSeleccionada(m)"
                  @change="store.toggleMateria(m)"
                />
                <span class="materia-info">
                  <span class="materia-nombre">{{ m.name }}</span>
                  <span v-if="m.code" class="materia-meta">
                    <code>{{ m.code }}</code>
                  </span>
                </span>
              </label>
            </li>
          </ul>
        </Colapsable>
      </Colapsable>
    </div>
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

.anios {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

.materia:focus-within {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
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
