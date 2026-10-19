<script setup lang="ts">
import { computed, ref } from 'vue'
import { VueFlow, MarkerType, type Edge, type Node } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import MateriaNode from './MateriaNode.vue'
import MateriaDialog from './MateriaDialog.vue'
import type { EstadoMateria, MateriaPlan } from '../../data/correlativas'
import { ESTADOS } from '../../data/correlativas'

const props = defineProps<{ materias: MateriaPlan[] }>()
const emit = defineEmits<{ materiaClick: [materia: MateriaPlan] }>()

const COLUMNA = 232
const FILA = 100
const CABECERA = 56

const seleccionada = ref<MateriaPlan | null>(null)
const enfocadaId = ref<number | null>(null)

const porId = computed(() => new Map(props.materias.map((m) => [m.id, m])))

const relacionadas = computed(() => {
  const id = enfocadaId.value
  if (id === null) return null
  const ids = new Set<number>([id])
  porId.value.get(id)?.correlativas.forEach((c) => ids.add(c))
  props.materias.forEach((m) => m.correlativas.includes(id) && ids.add(m.id))
  return ids
})

const nodes = computed<Node[]>(() => {
  const filasPorColumna = new Map<number, number>()
  const materiaNodes: Node[] = props.materias.map((materia) => {
    const columna = (materia.year - 1) * 2 + (materia.term - 1)
    const fila = filasPorColumna.get(columna) ?? 0
    filasPorColumna.set(columna, fila + 1)
    return {
      id: String(materia.id),
      type: 'materia',
      position: { x: columna * COLUMNA, y: CABECERA + fila * FILA },
      draggable: false,
      connectable: false,
      data: {
        materia,
        atenuada: !!relacionadas.value && !relacionadas.value.has(materia.id),
        resaltada: enfocadaId.value === materia.id,
      },
    }
  })

  const años = [...new Set(props.materias.map((m) => m.year))]
  const cabeceras: Node[] = años.map((year) => ({
    id: `year-${year}`,
    type: 'year',
    position: { x: (year - 1) * 2 * COLUMNA, y: 0 },
    draggable: false,
    selectable: false,
    connectable: false,
    data: { year },
  }))

  return [...cabeceras, ...materiaNodes]
})

const edges = computed<Edge[]>(() =>
  props.materias.flatMap((materia) =>
    materia.correlativas.map((origen) => {
      const id = enfocadaId.value
      const activa = id !== null && (materia.id === id || origen === id)
      const color = activa ? 'var(--c-tinta)' : 'var(--c-arista)'
      return {
        id: `${origen}-${materia.id}`,
        source: String(origen),
        target: String(materia.id),
        type: 'smoothstep',
        animated: activa,
        style: { stroke: color, strokeWidth: activa ? 2 : 1.25, opacity: id !== null && !activa ? 0.25 : 1 },
        markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
      }
    }),
  ),
)

const resumen = computed(() => {
  const conteo: Record<EstadoMateria, number> = { aprobada: 0, regular: 0, cursable: 0, no_cursable: 0 }
  props.materias.forEach((m) => conteo[m.estado]++)
  return conteo
})

const ordenEstados: EstadoMateria[] = ['aprobada', 'regular', 'cursable', 'no_cursable']

function abrirMateria(id: string) {
  const materia = porId.value.get(Number(id))
  if (!materia) return
  enfocadaId.value = materia.id
  seleccionada.value = materia
  emit('materiaClick', materia)
}

function cerrarDialog() {
  seleccionada.value = null
  enfocadaId.value = null
}
</script>

<template>
  <section class="correlativas" aria-labelledby="correlativas-titulo">
    <header class="barra">
      <div class="titulos">
        <h1 id="correlativas-titulo">Árbol de correlativas</h1>
        <p>{{ resumen.aprobada }} de {{ materias.length }} materias aprobadas</p>
      </div>
      <ul class="leyenda" aria-label="Estados">
        <li v-for="estado in ordenEstados" :key="estado" :class="`estado-${estado}`">
          <span class="punto" aria-hidden="true" />
          {{ ESTADOS[estado].label }}
          <span class="cantidad">{{ resumen[estado] }}</span>
        </li>
      </ul>
    </header>

    <div class="lienzo">
      <VueFlow
        :nodes="nodes"
        :edges="edges"
        :fit-view-on-init="true"
        :min-zoom="0.3"
        :max-zoom="1.6"
        :nodes-draggable="false"
        :nodes-connectable="false"
        :elements-selectable="false"
        :zoom-on-double-click="false"
        @node-click="({ node }) => node.type === 'materia' && abrirMateria(node.id)"
        @node-mouse-enter="({ node }) => node.type === 'materia' && !seleccionada && (enfocadaId = Number(node.id))"
        @node-mouse-leave="() => !seleccionada && (enfocadaId = null)"
      >
        <template #node-materia="nodeProps">
          <MateriaNode :data="nodeProps.data" />
        </template>
        <template #node-year="{ data }">
          <div class="cabecera-año">
            <span>{{ data.year }}º año</span>
            <span class="cuatris">1º cuat. · 2º cuat.</span>
          </div>
        </template>
        <Background pattern-color="var(--c-borde)" :gap="20" :size="1.2" />
        <Controls :show-interactive="false" position="bottom-right" />
      </VueFlow>
    </div>

    <MateriaDialog :materia="seleccionada" :materias="materias" @close="cerrarDialog" />
  </section>
</template>

<style>
.correlativas {
  --c-tinta: #14213d;
  --c-tinta-suave: #5b6478;
  --c-fondo: #f5f6f8;
  --c-superficie: #ffffff;
  --c-borde: #e1e4ea;
  --c-arista: #a3abba;
  --c-aprobada: #1f8a5b;
  --c-regular: #b7791f;
  --c-cursable: #2563a8;
  --c-no-cursable: #8a93a6;
}
</style>

<style scoped>
.correlativas {
  display: flex;
  flex-direction: column;
  height: calc(100svh - 140px);
  min-height: 440px;
  background: var(--c-fondo);
  color: var(--c-tinta);
  text-align: left;
}

.barra {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: var(--c-superficie);
  border-bottom: 1px solid var(--c-borde);
}

@media (min-width: 720px) {
  .barra {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.titulos {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

h1 {
  margin: 0;
  font-size: 20px;
  line-height: 1.2;
  color: var(--c-tinta);
}

.titulos p {
  margin: 0;
  font-size: 14px;
  color: var(--c-tinta-suave);
}

.leyenda {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.leyenda li {
  --tono: var(--c-no-cursable);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px solid var(--c-borde);
  border-radius: 999px;
  font-size: 13px;
  color: var(--c-tinta);
}

.leyenda li.estado-aprobada { --tono: var(--c-aprobada); }
.leyenda li.estado-regular { --tono: var(--c-regular); }
.leyenda li.estado-cursable { --tono: var(--c-cursable); }
.leyenda li.estado-no_cursable { --tono: var(--c-no-cursable); }

.punto {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--tono);
}

.cantidad {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--c-tinta-suave);
}

.lienzo {
  flex: 1;
  min-height: 0;
}

.cabecera-año {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  width: 408px;
  padding-bottom: 6px;
  border-bottom: 2px solid var(--c-tinta);
  font-size: 14px;
  font-weight: 700;
  color: var(--c-tinta);
  cursor: default;
}

.cuatris {
  font-size: 11px;
  font-weight: 500;
  color: var(--c-tinta-suave);
}

.lienzo :deep(.vue-flow__node-year) {
  pointer-events: none;
}

.lienzo :deep(.vue-flow__controls) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(20, 33, 61, 0.12);
}

.lienzo :deep(.vue-flow__controls-button) {
  width: 32px;
  height: 32px;
}
</style>
