<script setup lang="ts">
import { computed } from 'vue'
import { Check, ChevronRight, Lock } from 'lucide-vue-next'
import type { MateriaPlan } from '../../data/correlativas'
import { ESTADOS } from '../../data/correlativas'

const props = defineProps<{ materias: MateriaPlan[] }>()
const emit = defineEmits<{ select: [materia: MateriaPlan] }>()

const porId = computed(() => new Map(props.materias.map((m) => [m.id, m])))

const grupos = computed(() => {
  const claves = new Map<string, { year: number; term: number; materias: MateriaPlan[] }>()
  props.materias.forEach((m) => {
    const clave = `${m.year}-${m.term}`
    if (!claves.has(clave)) claves.set(clave, { year: m.year, term: m.term, materias: [] })
    claves.get(clave)!.materias.push(m)
  })
  return [...claves.values()]
})

function requisitos(materia: MateriaPlan) {
  if (materia.correlativas.length) {
    return materia.correlativas.map((id) => porId.value.get(id)?.code).filter(Boolean).join(' · ')
  }
  return materia.nota ? 'Requisitos especiales' : 'Sin correlativas'
}
</script>

<template>
  <div class="lista">
    <section v-for="grupo in grupos" :key="`${grupo.year}-${grupo.term}`" class="grupo">
      <h2 class="grupo-titulo">
        <span>{{ grupo.year }}º año</span>
        <span class="cuatri">{{ grupo.term }}º cuatrimestre</span>
      </h2>
      <ul>
        <li v-for="materia in grupo.materias" :key="materia.id">
          <button
            type="button"
            class="materia"
            :class="`estado-${materia.estado}`"
            @click="emit('select', materia)"
          >
            <span class="texto">
              <span class="fila-superior">
                <span class="codigo">{{ materia.code }}</span>
                <span class="estado">
                  <Check v-if="materia.estado === 'aprobada'" :size="12" :stroke-width="2.5" aria-hidden="true" />
                  <Lock v-else-if="materia.estado === 'no_cursable'" :size="11" :stroke-width="2.25" aria-hidden="true" />
                  {{ ESTADOS[materia.estado].label }}
                </span>
              </span>
              <span class="nombre">{{ materia.name }}</span>
              <span class="requisitos">{{ requisitos(materia) }}</span>
            </span>
            <ChevronRight :size="18" class="ir" aria-hidden="true" />
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.lista {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  padding: 16px 16px 24px;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.grupo {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.grupo-titulo {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 0;
  padding-bottom: 6px;
  border-bottom: 2px solid var(--c-tinta);
  font-size: 14px;
  font-weight: 700;
  color: var(--c-tinta);
}

.cuatri {
  font-size: 12px;
  font-weight: 500;
  color: var(--c-tinta-suave);
}

ul {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.materia {
  --tono: var(--c-no-cursable);
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 64px;
  box-sizing: border-box;
  padding: 10px 12px 10px 16px;
  border: 1px solid var(--c-borde);
  border-radius: 12px;
  background: var(--c-superficie);
  box-shadow: inset 4px 0 0 var(--tono);
  color: var(--c-tinta);
  font: inherit;
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.materia:active {
  background: var(--c-fondo);
}

.materia:focus-visible {
  outline: 2px solid var(--c-tinta);
  outline-offset: 2px;
}

.estado-aprobada { --tono: var(--c-aprobada); }
.estado-regular { --tono: var(--c-regular); }
.estado-cursable { --tono: var(--c-cursable); }
.estado-no_cursable { --tono: var(--c-no-cursable); }

.texto {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.fila-superior {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.codigo {
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--c-tinta-suave);
}

.estado {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: var(--tono);
  background: color-mix(in srgb, var(--tono) 12%, transparent);
}

.nombre {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--c-tinta);
}

.requisitos {
  font-size: 12px;
  color: var(--c-tinta-suave);
}

.ir {
  flex-shrink: 0;
  color: var(--c-tinta-suave);
}
</style>
