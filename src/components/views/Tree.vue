<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { CONDICIONES, useMateriasStore, type Condicion } from '../../stores/materias'
import GrafoCorrelativas from '../arbol/GrafoCorrelativas.vue'

const store = useMateriasStore()

onMounted(async () => {
  if (!store.disponibles.length) await store.cargarDisponibles()
  await store.cargarOverviews(store.disponibles.map(m => m.id))
})

const cargandoCorrelativas = computed(() =>
  store.disponibles.some(m => store.overviewsCargando[m.id]),
)

const resumen = computed(() => {
  const conteo: Record<Condicion, number> = { no_cursable: 0, regular: 0, libre: 0, aprobada: 0 }
  store.disponibles.forEach(m => conteo[store.condicionDe(m.id)]++)
  return conteo
})

const ordenLeyenda: Condicion[] = ['aprobada', 'regular', 'libre', 'no_cursable']

function etiqueta(condicion: Condicion) {
  return CONDICIONES.find(c => c.valor === condicion)?.etiqueta ?? condicion
}
</script>

<template>
  <section class="arbol" aria-labelledby="tree-title">
    <header class="barra">
      <h3 id="tree-title">Árbol de correlativas</h3>
      <p
        v-if="store.disponibles.length"
        class="progreso"
        :aria-label="`${resumen.aprobada} de ${store.disponibles.length} materias aprobadas`"
      >
        <strong>{{ resumen.aprobada }}</strong>/{{ store.disponibles.length }}
      </p>
      <ul v-if="store.disponibles.length" class="leyenda" aria-label="Condiciones">
        <li v-for="c in ordenLeyenda" :key="c" :class="`condicion-${c}`">
          <span class="punto" aria-hidden="true"></span>
          {{ etiqueta(c) }}
          <span class="cantidad">{{ resumen[c] }}</span>
        </li>
        <li class="nota">
          <span class="muestra-libre" aria-hidden="true"></span>
          Flecha punteada: correlativa Libre
        </li>
      </ul>
    </header>

    <p v-if="store.cargando" class="estado">Cargando materias...</p>
    <p v-else-if="store.error" class="estado estado-error">{{ store.error }}</p>
    <p v-else-if="!store.disponibles.length" class="estado">No hay materias disponibles.</p>
    <p v-else-if="cargandoCorrelativas" class="estado">Cargando correlativas...</p>

    <div v-if="store.disponibles.length" class="lienzo">
      <GrafoCorrelativas :materias="store.disponibles" />
    </div>
  </section>
</template>

<style>
body:has(.arbol) {
  overflow-x: clip;
}
</style>

<style scoped>
.arbol {
  --c-aprobada: #1f8a5b;
  --c-regular: #b7791f;
  --c-libre: #2563a8;
  --c-no-cursable: #8a93a6;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100vw;
  margin-left: calc(50% - 50vw);
}

.barra {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
  padding: 0 1rem;
}

.barra h3 {
  margin: 0;
  color: var(--text-h);
}

.progreso {
  margin: 0;
  font-family: var(--mono);
  font-size: 15px;
}

.progreso strong {
  color: var(--c-aprobada);
  font-weight: 700;
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
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 13px;
  white-space: nowrap;
  color: var(--text-h);
}

.leyenda li.condicion-aprobada { --tono: var(--c-aprobada); }
.leyenda li.condicion-regular { --tono: var(--c-regular); }
.leyenda li.condicion-libre { --tono: var(--c-libre); }
.leyenda li.condicion-no_cursable { --tono: var(--c-no-cursable); }

.punto {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--tono);
}

.cantidad {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--text);
}

.leyenda .nota {
  border-color: transparent;
  color: var(--text);
}

.muestra-libre {
  width: 18px;
  height: 0;
  border-top: 2px dashed var(--text);
}

.estado {
  margin: 0;
  padding: 0 1rem;
  font-size: 14px;
}

.estado-error {
  color: #e5484d;
}

.lienzo {
  height: calc(100svh - 230px);
  min-height: 440px;
  border-block: 1px solid var(--border);
}
</style>
