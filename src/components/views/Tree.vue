<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useMateriasStore, type Materia } from '../../stores/materias'
import { agruparPorAnioYCuatrimestre, tituloAnio, tituloCuatrimestre } from '../../utils/agrupar'
import { calcularAristas, calcularLayout, NODO_ANCHO } from '../../utils/arbol'
import NodoMateria from '../arbol/NodoMateria.vue'

const store = useMateriasStore()

onMounted(async () => {
  if (!store.disponibles.length) await store.cargarDisponibles()
  await store.cargarOverviews(store.disponibles.map(m => m.id))
})

const cargandoCorrelativas = computed(() =>
  store.disponibles.some(m => store.overviewsCargando[m.id]),
)

function todasAprobadas(materias: Materia[]) {
  return materias.length > 0 && materias.every(m => store.condicionDe(m.id) === 'aprobada')
}

function aprobadasTexto(materias: Materia[]) {
  const aprobadas = materias.filter(m => store.condicionDe(m.id) === 'aprobada').length
  return `${aprobadas}/${materias.length} aprobadas`
}

const layout = computed(() => calcularLayout(agruparPorAnioYCuatrimestre(store.disponibles)))
const aristas = computed(() => calcularAristas(layout.value.nodos, store.prerequisitosDe))

const activo = ref<number | null>(null)

function estaRelacionada(id: number) {
  if (activo.value === null || id === activo.value) return true
  return aristas.value.some(
    a => (a.desde === activo.value && a.hasta === id) || (a.hasta === activo.value && a.desde === id),
  )
}

function estadoArista(desde: number, hasta: number) {
  if (activo.value === null) return 'normal'
  return desde === activo.value || hasta === activo.value ? 'resaltada' : 'atenuada'
}
</script>

<template>
  <section class="arbol" aria-labelledby="tree-title">
    <header class="arbol-header">
      <h3 id="tree-title">Árbol de correlativas</h3>
    </header>

    <p v-if="store.cargando" class="estado">Cargando materias...</p>
    <p v-else-if="store.error" class="estado estado-error">{{ store.error }}</p>
    <p v-else-if="!store.disponibles.length" class="estado">No hay materias disponibles.</p>
    <p v-else-if="cargandoCorrelativas" class="estado">Cargando correlativas...</p>

    <div
      v-if="store.disponibles.length"
      class="visor"
      role="region"
      aria-label="Gráfico del árbol de correlativas"
      tabindex="0"
    >
      <div
        class="lienzo"
        :style="{ width: `${layout.ancho}px`, height: `${layout.alto}px` }"
        @mouseleave="activo = null"
      >
        <svg
          class="aristas"
          :width="layout.ancho"
          :height="layout.alto"
          :viewBox="`0 0 ${layout.ancho} ${layout.alto}`"
          aria-hidden="true"
        >
          <defs>
            <marker id="flecha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" class="punta" />
            </marker>
            <marker id="flecha-resaltada" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" class="punta punta-resaltada" />
            </marker>
          </defs>
          <path
            v-for="a in aristas"
            :key="a.key"
            :d="a.d"
            class="arista"
            :class="[estadoArista(a.desde, a.hasta), { libre: store.condicionElegida(a.desde) === 'libre' }]"
            :marker-end="estadoArista(a.desde, a.hasta) === 'resaltada' ? 'url(#flecha-resaltada)' : 'url(#flecha)'"
          />
        </svg>

        <div
          v-for="col in layout.anios"
          :key="col.key"
          class="encabezado-anio"
          :class="{ superado: todasAprobadas(col.materias) }"
          :style="{ left: `${col.x}px`, width: `${NODO_ANCHO}px` }"
        >
          <span class="titulo">{{ tituloAnio(col.anio) }}</span>
          <span class="badge">{{ aprobadasTexto(col.materias) }}</span>
        </div>

        <div
          v-for="t in layout.terminos"
          :key="t.key"
          class="encabezado-term"
          :class="{ superado: todasAprobadas(t.materias) }"
          :style="{ left: `${t.x}px`, top: `${t.y}px`, width: `${NODO_ANCHO}px` }"
        >
          {{ tituloCuatrimestre(t.term) }}
        </div>

        <div
          v-for="n in layout.nodos"
          :key="n.materia.id"
          class="slot"
          @mouseenter="activo = n.materia.id"
          @focusin="activo = n.materia.id"
          @focusout="activo = null"
        >
          <NodoMateria :materia="n.materia" :x="n.x" :y="n.y" :atenuado="!estaRelacionada(n.materia.id)" />
        </div>
      </div>
    </div>

    <ul class="leyenda" aria-label="Referencias">
      <li><span class="muestra muestra-regular" aria-hidden="true"></span>Regular / Libre: se puede elegir</li>
      <li><span class="muestra muestra-bloqueada" aria-hidden="true"></span>No cursable: bloqueada</li>
      <li><span class="muestra muestra-libre" aria-hidden="true"></span>Flecha punteada: correlativa Libre</li>
      <li><span class="tachado">Aprobada</span>: ya no se elige</li>
    </ul>
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

.estado {
  margin: 0;
  font-size: 14px;
}

.estado-error {
  color: #e5484d;
}

.visor {
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.5rem;
}

.visor:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.lienzo {
  position: relative;
  flex-shrink: 0;
}

.aristas {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.arista {
  fill: none;
  stroke: var(--text);
  stroke-width: 1.5;
  opacity: 0.45;
  transition: opacity 0.2s, stroke 0.2s;
}

.arista.libre {
  stroke-dasharray: 5 4;
}

.arista.resaltada {
  stroke: var(--accent);
  stroke-width: 2.25;
  opacity: 1;
}

.arista.atenuada {
  opacity: 0.12;
}

.punta {
  fill: var(--text);
}

.punta-resaltada {
  fill: var(--accent);
}

.encabezado-anio {
  position: absolute;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: var(--text-h);
}

.encabezado-anio .titulo {
  font-weight: 600;
}

.badge {
  font-size: 12px;
  color: var(--text);
}

.encabezado-term {
  position: absolute;
  display: flex;
  align-items: center;
  height: 30px;
  font-size: 13px;
  color: var(--text);
  border-bottom: 1px solid var(--border);
}

.superado .titulo,
.encabezado-term.superado {
  text-decoration: line-through;
  text-decoration-thickness: 2px;
  opacity: 0.7;
}

.slot {
  display: contents;
}

.leyenda {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 13px;
}

.leyenda li {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.muestra {
  display: inline-block;
  width: 16px;
  height: 12px;
  border: 1px solid var(--border);
  border-radius: 3px;
}

.muestra-regular {
  border-color: var(--accent-border);
}

.muestra-bloqueada {
  border-style: dashed;
}

.muestra-libre {
  height: 0;
  border: 0;
  border-top: 2px dashed var(--text);
  border-radius: 0;
}

.tachado {
  text-decoration: line-through;
  text-decoration-thickness: 2px;
}
</style>
