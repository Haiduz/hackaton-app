<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useMateriasStore, type Materia } from '../../stores/materias'
import { agruparPorAnioYCuatrimestre, tituloAnio, tituloCuatrimestre } from '../../utils/agrupar'
import Colapsable from '../Colapsable.vue'
import NodoMateria from '../arbol/NodoMateria.vue'

const store = useMateriasStore()
onMounted(() => {
  if (!store.disponibles.length) store.cargarDisponibles()
})

function todasAprobadas(materias: Materia[]) {
  return materias.length > 0 && materias.every(m => store.condicionDe(m.id) === 'aprobada')
}

function aprobadasTexto(materias: Materia[]) {
  const aprobadas = materias.filter(m => store.condicionDe(m.id) === 'aprobada').length
  return `${aprobadas}/${materias.length} aprobadas`
}

const grupos = computed(() =>
  agruparPorAnioYCuatrimestre(store.disponibles).map(grupo => {
    const todas = grupo.cuatrimestres.flatMap(c => c.materias)
    return {
      ...grupo,
      todas,
      superado: todasAprobadas(todas),
    }
  }),
)
</script>

<template>
  <section class="arbol" aria-labelledby="tree-title">
    <header class="arbol-header">
      <h3 id="tree-title">Árbol de correlativas</h3>
    </header>

    <p v-if="store.cargando" class="estado">Cargando materias...</p>
    <p v-else-if="store.error" class="estado estado-error">{{ store.error }}</p>
    <p v-else-if="!store.disponibles.length" class="estado">No hay materias disponibles.</p>

    <div class="anios">
      <Colapsable
        v-for="grupo in grupos"
        :key="String(grupo.anio)"
        :titulo="tituloAnio(grupo.anio)"
        :badge="aprobadasTexto(grupo.todas)"
        :superado="grupo.superado"
        variante="anio"
      >
        <Colapsable
          v-for="cuatri in grupo.cuatrimestres"
          :key="String(cuatri.term)"
          :titulo="tituloCuatrimestre(cuatri.term)"
          :badge="aprobadasTexto(cuatri.materias)"
          :superado="todasAprobadas(cuatri.materias)"
          variante="cuatrimestre"
        >
          <ul class="lista">
            <li v-for="m in cuatri.materias" :key="m.id">
              <NodoMateria :materia="m" />
            </li>
          </ul>
        </Colapsable>
      </Colapsable>
    </div>
  </section>
</template>

<style scoped>
.arbol {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.arbol-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.arbol-header h3 {
  margin: 0;
  color: var(--text-h);
}

.estado-error {
  color: #e5484d;
}

.anios,
.lista {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.lista {
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
