<script setup lang="ts">
import { computed, ref } from 'vue'
import { VueFlow, MarkerType, type Edge, type Node } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import NodoMateria from './NodoMateria.vue'
import { useMateriasStore, type Materia } from '../../stores/materias'
import { agruparPorAnioYCuatrimestre, tituloAnio, tituloCuatrimestre } from '../../utils/agrupar'
import { calcularLayout, NODO_ANCHO, Y_ANIO, Y_TERM } from '../../utils/arbol'

const props = defineProps<{ materias: Materia[] }>()

const store = useMateriasStore()

const MARGEN = 16
const ZOOM_MINIMO = 0.25
const ZOOM_MAXIMO = 1.6
const ZOOM_TELEFONO = 0.85
const esTelefono = window.matchMedia('(max-width: 719px)').matches

const contenedor = ref<HTMLElement | null>(null)

const layout = computed(() => calcularLayout(agruparPorAnioYCuatrimestre(props.materias)))

const idsEnArbol = computed(() => new Set(props.materias.map(m => m.id)))

function prerequisitosVisibles(id: number) {
  return store.prerequisitosDe(id).filter(p => idsEnArbol.value.has(p))
}

const fijadaId = ref<number | null>(null)
const hoverId = ref<number | null>(null)
const enfocadaId = computed(() => fijadaId.value ?? hoverId.value)

const relacionadas = computed(() => {
  const id = enfocadaId.value
  if (id === null) return null
  const ids = new Set<number>([id, ...prerequisitosVisibles(id)])
  props.materias.forEach(m => prerequisitosVisibles(m.id).includes(id) && ids.add(m.id))
  return ids
})

function todasAprobadas(materias: Materia[]) {
  return materias.length > 0 && materias.every(m => store.condicionDe(m.id) === 'aprobada')
}

function aprobadasTexto(materias: Materia[]) {
  const aprobadas = materias.filter(m => store.condicionDe(m.id) === 'aprobada').length
  return `${aprobadas}/${materias.length} aprobadas`
}

const nodes = computed<Node[]>(() => {
  const anios: Node[] = layout.value.anios.map(a => ({
    id: `anio-${a.key}`,
    type: 'anio',
    position: { x: a.x, y: Y_ANIO },
    draggable: false,
    selectable: false,
    connectable: false,
    focusable: false,
    data: {
      titulo: tituloAnio(a.anio),
      resumen: aprobadasTexto(a.materias),
      ancho: a.ancho,
      superado: todasAprobadas(a.materias),
    },
  }))

  const terminos: Node[] = layout.value.terminos.map(t => ({
    id: `term-${t.key}`,
    type: 'term',
    position: { x: t.x, y: Y_TERM },
    draggable: false,
    selectable: false,
    connectable: false,
    focusable: false,
    data: { titulo: tituloCuatrimestre(t.term), superado: todasAprobadas(t.materias) },
  }))

  const materias: Node[] = layout.value.nodos.map(n => ({
    id: String(n.materia.id),
    type: 'materia',
    position: { x: n.x, y: n.y },
    draggable: false,
    connectable: false,
    data: {
      materia: n.materia,
      atenuada: !!relacionadas.value && !relacionadas.value.has(n.materia.id),
      resaltada: enfocadaId.value === n.materia.id,
    },
  }))

  return [...anios, ...terminos, ...materias]
})

const edges = computed<Edge[]>(() =>
  layout.value.nodos.flatMap(({ materia }) =>
    prerequisitosVisibles(materia.id).map(origen => {
      const foco = enfocadaId.value
      const activa = foco !== null && (materia.id === foco || origen === foco)
      const color = activa ? 'var(--accent)' : 'var(--text)'
      const libre = store.condicionElegida(origen) === 'libre'
      return {
        id: `${origen}-${materia.id}`,
        source: String(origen),
        target: String(materia.id),
        type: 'smoothstep',
        animated: activa,
        style: {
          stroke: color,
          strokeWidth: activa ? 2.25 : 1.5,
          strokeDasharray: libre ? '6 4' : undefined,
          opacity: foco === null ? 0.55 : activa ? 1 : 0.12,
        },
        markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
      }
    }),
  ),
)

// Ajusta el ancho del gráfico al del contenedor para ver todos los años a la vez.
function ajustarVista(instance: { setViewport: (v: { x: number; y: number; zoom: number }) => unknown }) {
  if (esTelefono) {
    instance.setViewport({ x: MARGEN, y: MARGEN, zoom: ZOOM_TELEFONO })
    return
  }
  const anchoDisponible = contenedor.value?.clientWidth ?? 0
  const zoom = Math.min(1, Math.max(ZOOM_MINIMO, (anchoDisponible - MARGEN * 2) / layout.value.ancho))
  const x = Math.max(MARGEN, (anchoDisponible - layout.value.ancho * zoom) / 2)
  instance.setViewport({ x, y: MARGEN, zoom })
}

function alternarFijada(id: number) {
  fijadaId.value = fijadaId.value === id ? null : id
}
</script>

<template>
  <div ref="contenedor" class="grafo" role="region" aria-label="Gráfico del árbol de correlativas">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      :min-zoom="ZOOM_MINIMO"
      :max-zoom="ZOOM_MAXIMO"
      :nodes-draggable="false"
      :nodes-connectable="false"
      :elements-selectable="false"
      :zoom-on-double-click="false"
      @pane-ready="ajustarVista"
      @pane-click="fijadaId = null"
      @node-click="({ node }) => node.type === 'materia' && alternarFijada(Number(node.id))"
      @node-mouse-enter="({ node }) => node.type === 'materia' && (hoverId = Number(node.id))"
      @node-mouse-leave="hoverId = null"
    >
      <template #node-materia="{ data }">
        <NodoMateria :data="data" />
      </template>

      <template #node-anio="{ data }">
        <div class="cabecera-anio" :class="{ superado: data.superado }" :style="{ width: `${data.ancho}px` }">
          <span class="titulo-anio">{{ data.titulo }}</span>
          <span class="resumen">{{ data.resumen }}</span>
        </div>
      </template>

      <template #node-term="{ data }">
        <div class="cabecera-term" :class="{ superado: data.superado }" :style="{ width: `${NODO_ANCHO}px` }">
          {{ data.titulo }}
        </div>
      </template>

      <Background pattern-color="var(--border)" :gap="20" :size="1.2" />
    </VueFlow>
  </div>
</template>

<style scoped>
.grafo {
  height: 100%;
  min-height: 0;
  background: var(--bg);
}

.cabecera-anio {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: 6px;
  border-bottom: 2px solid var(--text-h);
  color: var(--text-h);
  cursor: default;
}

.titulo-anio {
  font-size: 15px;
  font-weight: 700;
}

.resumen {
  font-size: 12px;
  font-weight: 500;
  color: var(--text);
}

.cabecera-term {
  display: flex;
  align-items: center;
  height: 28px;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  color: var(--text);
  cursor: default;
}

.superado .titulo-anio,
.cabecera-term.superado {
  text-decoration: line-through;
  text-decoration-thickness: 2px;
  opacity: 0.7;
}

.grafo :deep(.vue-flow__node-anio),
.grafo :deep(.vue-flow__node-term) {
  pointer-events: none;
}

.grafo :deep(.vue-flow__pane) {
  touch-action: none;
}
</style>
