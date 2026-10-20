<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useMateriasStore, etiquetaCondicion, type Materia } from '../../stores/materias.ts'
import { agruparPorAnioYCuatrimestre, tituloAnio, tituloCuatrimestre } from '../../utils/agrupar'
import Colapsable from '../Colapsable.vue'

const store = useMateriasStore()
onMounted(() => store.cargarDisponibles())

function estaSeleccionada(materia: Materia) {
  return store.seleccionadas.some(s => s.id === materia.id)
}

function estaAprobada(materia: Materia) {
  return store.condicionDe(materia.id) === 'aprobada'
}

function todasAprobadas(materias: Materia[]) {
  return materias.length > 0 && materias.every(estaAprobada)
}

const materiasPorAnioYCuatrimestre = computed(() =>
  agruparPorAnioYCuatrimestre(store.disponibles).map(grupo => {
    const cuatrimestres = grupo.cuatrimestres.map(c => ({
      ...c,
      seleccionadas: c.materias.filter(estaSeleccionada).length,
      superado: todasAprobadas(c.materias),
    }))
    return {
      anio: grupo.anio,
      cuatrimestres,
      seleccionadas: cuatrimestres.reduce((total, c) => total + c.seleccionadas, 0),
      superado: cuatrimestres.every(c => c.superado),
    }
  }),
)

function contadorTexto(cantidad: number) {
  return `${cantidad} ${cantidad === 1 ? 'seleccionada' : 'seleccionadas'}`
}
</script>

<template>
  <section class="subjects">
    <header class="subjects-header">
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
        :superado="grupo.superado"
        variante="anio"
      >
        <Colapsable
          v-for="cuatri in grupo.cuatrimestres"
          :key="String(cuatri.term)"
          :titulo="tituloCuatrimestre(cuatri.term)"
          :badge="contadorTexto(cuatri.seleccionadas)"
          :superado="cuatri.superado"
          variante="cuatrimestre"
        >
          <ul class="lista">
            <li v-for="m in cuatri.materias" :key="m.id">
              <label
                class="materia"
                :class="{
                  activa: estaSeleccionada(m),
                  bloqueada: !store.esSeleccionable(m.id),
                  aprobada: estaAprobada(m),
                }"
              >
                <input
                  type="checkbox"
                  :checked="estaSeleccionada(m)"
                  :disabled="!store.esSeleccionable(m.id)"
                  @change="store.toggleMateria(m)"
                />
                <span class="materia-info">
                  <span class="materia-nombre">{{ m.name }}</span>
                  <span class="materia-meta">
                    <code v-if="m.code">{{ m.code }}</code>
                    <span class="condicion" :data-condicion="store.condicionDe(m.id)">
                      {{ etiquetaCondicion(store.condicionDe(m.id)) }}
                    </span>
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
.subjects {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.subjects-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.subjects-header h3 {
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

.materia.bloqueada {
  cursor: not-allowed;
  opacity: 0.6;
}

.materia.bloqueada:hover {
  border-color: var(--border);
}

.materia.aprobada .materia-nombre {
  color: var(--text);
  text-decoration: line-through;
  text-decoration-thickness: 2px;
}

.condicion {
  padding: 1px 8px;
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 12px;
}

.condicion[data-condicion='regular'],
.condicion[data-condicion='libre'] {
  border-color: var(--accent-border);
  color: var(--accent);
}
</style>
