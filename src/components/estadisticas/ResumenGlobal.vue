<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { GraduationCap, Hourglass } from 'lucide-vue-next'
import { useEstudioStore } from '../../stores/estudio'
import { useMateriasStore } from '../../stores/materias'
import { capitalizar, fechaLarga, horasMinutos } from '../../utils/estudio'
import ChipMateria from '../estudio/ChipMateria.vue'

const estudio = useEstudioStore()
const materias = useMateriasStore()

onMounted(() => {
  if (!materias.disponibles.length && !materias.cargando) void materias.cargarDisponibles()
})

const totalSegundos = computed(() => estudio.sesiones.reduce((a, s) => a + s.foco, 0))
const horasEnteras = computed(() => Math.floor(totalSegundos.value / 3600))
const minutosRestantes = computed(() => Math.round((totalSegundos.value % 3600) / 60))
const diasEstudiados = computed(() => estudio.porDia.size)
const primeraFecha = computed(() => estudio.ordenadas.at(-1)?.fecha)
const promedioPorDia = computed(() => (diasEstudiados.value ? totalSegundos.value / diasEstudiados.value : 0))

const porMateria = computed(() => {
  const totales = new Map<number, number>()
  for (const s of estudio.sesiones) totales.set(s.materiaId, (totales.get(s.materiaId) ?? 0) + s.foco)
  const max = Math.max(1, ...totales.values())
  return [...totales]
    .map(([id, seg]) => ({ id, seg, materia: estudio.materia(id), ancho: (seg / max) * 100 }))
    .sort((a, b) => b.seg - a.seg)
})

const totalMaterias = computed(() => materias.disponibles.length)
const aprobadas = computed(() => materias.disponibles.filter(m => materias.condicionDe(m.id) === 'aprobada').length)
const porcentaje = computed(() =>
  totalMaterias.value ? Math.round((aprobadas.value / totalMaterias.value) * 100) : 0,
)
</script>

<template>
  <div class="global">
    <section class="tarjeta total" aria-labelledby="global-total">
      <header class="encabezado">
        <span class="icono" aria-hidden="true"><Hourglass :size="18" /></span>
        <h3 id="global-total">Total de todos los tiempos</h3>
      </header>
      <p class="cifra num">
        {{ horasEnteras }}<span class="unidad">h</span>
        {{ minutosRestantes }}<span class="unidad">min</span>
      </p>
      <p v-if="primeraFecha" class="desde">Desde el {{ capitalizar(fechaLarga(primeraFecha)) }}</p>
      <dl class="metricas">
        <div>
          <dt>Sesiones</dt>
          <dd class="num">{{ estudio.sesiones.length }}</dd>
        </div>
        <div>
          <dt>Días estudiados</dt>
          <dd class="num">{{ diasEstudiados }}</dd>
        </div>
        <div>
          <dt>Promedio por día</dt>
          <dd class="num">{{ horasMinutos(promedioPorDia) }}</dd>
        </div>
      </dl>
    </section>

    <section class="tarjeta carrera" aria-labelledby="global-carrera">
      <header class="encabezado">
        <span class="icono" aria-hidden="true"><GraduationCap :size="18" /></span>
        <h3 id="global-carrera">Completitud de la carrera</h3>
        <strong v-if="totalMaterias" class="porcentaje num">{{ porcentaje }}%</strong>
      </header>
      <template v-if="totalMaterias">
        <div
          class="barra"
          role="progressbar"
          aria-labelledby="global-carrera"
          :aria-valuenow="porcentaje"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <span class="relleno" :style="{ width: `${porcentaje}%` }" />
        </div>
        <p class="nota num">{{ aprobadas }} de {{ totalMaterias }} materias aprobadas</p>
      </template>
      <p v-else-if="materias.cargando" class="nota">Cargando materias…</p>
      <p v-else class="nota">No se pudieron cargar las materias del plan.</p>
    </section>

    <section v-if="porMateria.length" class="tarjeta" aria-labelledby="global-materias">
      <header class="encabezado">
        <h3 id="global-materias">Horas por materia</h3>
      </header>
      <ul class="lista">
        <li v-for="m in porMateria" :key="m.id">
          <ChipMateria :materia="m.materia" />
          <span class="sr-only">{{ m.materia?.nombre }}</span>
          <span class="pista" aria-hidden="true">
            <span class="relleno-materia" :style="{ width: `${m.ancho}%`, background: m.materia?.color }" />
          </span>
          <span class="num valor">{{ horasMinutos(m.seg) }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.global {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.encabezado {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.encabezado h3 {
  flex: 1;
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-h);
}

.icono {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--calor-1);
  color: var(--accent-text);
}

.cifra {
  margin: 0.75rem 0 0;
  font-size: 2.75rem;
  font-weight: 700;
  line-height: 1;
  color: var(--text-h);
}

.unidad {
  margin: 0 0.4rem 0 0.15rem;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text);
}

.desde {
  margin: 0.35rem 0 0;
  font-size: 0.8rem;
}

.metricas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 2rem;
  margin: 1rem 0 0;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}

.metricas dt {
  font-size: 0.75rem;
}

.metricas dd {
  margin: 0.15rem 0 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-h);
}

.porcentaje {
  font-size: 1.25rem;
  color: var(--accent-text);
}

.barra {
  height: 0.85rem;
  margin-top: 0.85rem;
  overflow: hidden;
  border-radius: 999px;
  background: var(--calor-0);
}

.relleno {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--accent);
  transition: width 0.6s ease;
}

.nota {
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
}

.lista {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin: 0.75rem 0 0;
  padding: 0;
  list-style: none;
}

.lista li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.lista :deep(.chip-materia) {
  flex: none;
  min-width: 4.5rem;
}

.pista {
  flex: 1;
  height: 0.45rem;
  overflow: hidden;
  border-radius: 999px;
  background: var(--calor-0);
}

.relleno-materia {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.valor {
  flex: none;
  min-width: 5.5rem;
  font-size: 0.85rem;
  text-align: right;
  color: var(--text-h);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
