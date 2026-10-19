<script setup lang="ts">
import { computed, watch } from 'vue'
import { useMateriasStore, type Comision } from '../../stores/materias'
import { nombreDia, textoAula } from '../../utils/horarios'

interface Clase extends Comision {
  materia: string
}

const store = useMateriasStore()

watch(
  () => store.seleccionadas.map(m => m.id),
  ids => ids.forEach(id => store.cargarOverview(id)),
  { immediate: true },
)

const cargando = computed(() => store.seleccionadas.some(m => store.overviewsCargando[m.id]))
const errores = computed(() =>
  store.seleccionadas.filter(m => store.overviewsError[m.id]).map(m => m.name),
)

const dias = computed(() => {
  const porDia = new Map<number, Clase[]>()
  for (const m of store.seleccionadas) {
    for (const c of store.overviews[m.id]?.sessions ?? []) {
      const lista = porDia.get(c.weekday) ?? []
      lista.push({ ...c, materia: m.name })
      porDia.set(c.weekday, lista)
    }
  }
  return [...porDia.entries()]
    .sort(([a], [b]) => a - b)
    .map(([weekday, clases]) => ({
      weekday,
      clases: clases.sort((a, b) => a.start_time.localeCompare(b.start_time)),
    }))
})
</script>

<template>
  <section class="calendario" aria-labelledby="calendar-title">
    <h3 id="calendar-title">Calendario</h3>

    <p v-if="!store.seleccionadas.length" class="estado">
      Todavía no elegiste materias. Podés hacerlo en Perfil.
    </p>
    <template v-else>
      <p v-if="cargando" class="estado">Cargando horarios...</p>
      <p v-if="errores.length" class="estado estado-error">
        No se pudieron cargar los horarios de: {{ errores.join(', ') }}
      </p>
      <p v-if="!cargando && !dias.length && !errores.length" class="estado">
        Tus materias no tienen horarios publicados.
      </p>

      <ul v-if="dias.length" class="dias">
        <li v-for="d in dias" :key="d.weekday" class="dia">
          <h4 class="dia-titulo">{{ nombreDia(d.weekday) }}</h4>
          <ul class="clases">
            <li v-for="c in d.clases" :key="c.id" class="clase">
              <span class="hora">{{ c.start_time }} - {{ c.end_time }}</span>
              <span class="materia">{{ c.materia }}</span>
              <code v-if="textoAula(c)">{{ textoAula(c) }}</code>
            </li>
          </ul>
        </li>
      </ul>
    </template>
  </section>
</template>

<style scoped>
.calendario {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.estado {
  margin: 0;
  font-size: 14px;
}

.estado-error {
  color: #e5484d;
}

.dias,
.clases {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.dias {
  gap: 0.75rem;
}

.dia {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 10px;
}

.dia-titulo {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-h);
}

.clases {
  gap: 0.5rem;
}

.clase {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 0.75rem;
  font-size: 14px;
}

.hora {
  min-width: 7rem;
  color: var(--text-h);
  font-weight: 500;
}
</style>
