<script setup lang="ts">
import { computed } from 'vue'
import { useEstudioStore } from '../../stores/estudio'
import { acumular, clave, DIAS_CORTOS, DIAS_LARGOS, desdeClave, fechaCorta, hmmss } from '../../utils/estudio'
import GraficoComparacion from './GraficoComparacion.vue'
import GraficoHorario from './GraficoHorario.vue'
import GraficoDispersion from './GraficoDispersion.vue'
import GraficoBarrasMateria from './GraficoBarrasMateria.vue'
import GraficoDona from './GraficoDona.vue'
import GraficoAreaAcumulada from './GraficoAreaAcumulada.vue'

const props = defineProps<{
  tipo: 'semana' | 'mes'
  titulo: string
  dias: string[]
  anteriores: string[]
}>()
const store = useEstudioStore()

const resumenes = computed(() => props.dias.map(k => store.porDia.get(k)))
const totales = computed(() => resumenes.value.map(r => r?.total ?? 0))
const total = computed(() => totales.value.reduce((a, v) => a + v, 0))
const diasConEstudio = computed(() => totales.value.filter(v => v > 0).length)
const promedio = computed(() => total.value / Math.max(1, diasConEstudio.value))

const corte = computed(() => {
  const i = props.dias.indexOf(clave(new Date()))
  return i === -1 ? null : i
})

const etiqueta = (k: string, i: number) => (props.tipo === 'semana' ? DIAS_CORTOS[i] : fechaCorta(desdeClave(k)))
const indicesEtiqueta = computed(() =>
  props.tipo === 'semana' ? undefined : [0, Math.floor(props.dias.length / 2), props.dias.length - 1],
)

const ejes = computed(() =>
  props.tipo === 'semana'
    ? DIAS_CORTOS.map((d, i) => ({ pos: (i + 0.5) / 7, texto: d }))
    : [
        { pos: 0, texto: '1' },
        { pos: 0.5, texto: String(Math.ceil(props.dias.length / 2)) },
        { pos: 1, texto: String(props.dias.length) },
      ],
)

const textoCorte = computed(() => {
  if (corte.value === null) return props.tipo === 'semana' ? 'Semana completa' : 'Mes completo'
  return props.tipo === 'semana' ? `Hasta el ${DIAS_LARGOS[corte.value]}` : `Hasta el día ${corte.value + 1}`
})

const horario = computed(() =>
  props.dias.map((k, i) => {
    const r = resumenes.value[i]
    return { etiqueta: etiqueta(k, i), total: r?.total ?? 0, inicio: r?.inicio ?? null, fin: r?.fin ?? null }
  }),
)

const porDiaMateria = computed(() =>
  props.dias.map((k, i) => ({ etiqueta: etiqueta(k, i), porMateria: resumenes.value[i]?.porMateria ?? {} })),
)

const totalesMateria = computed(() => {
  const t: Record<number, number> = {}
  for (const r of resumenes.value) {
    if (!r) continue
    for (const [id, v] of Object.entries(r.porMateria)) t[Number(id)] = (t[Number(id)] ?? 0) + v
  }
  return t
})
const materiasActivas = computed(() =>
  store.materias.filter(m => (totalesMateria.value[m.id] ?? 0) > 0).sort((a, b) => totalesMateria.value[b.id] - totalesMateria.value[a.id]),
)
const dona = computed(() =>
  materiasActivas.value.map(m => ({ id: m.id, nombre: m.nombre, color: m.color, valor: totalesMateria.value[m.id] })),
)

const dispersion = computed(() =>
  resumenes.value.flatMap(r => (r && r.inicio !== null && r.fin !== null ? [{ inicio: r.inicio, fin: r.fin, total: r.total }] : [])),
)
</script>

<template>
  <div class="detalle">
    <section class="tarjeta resumen" aria-labelledby="titulo-periodo">
      <h3 id="titulo-periodo" class="titulo">{{ titulo }}</h3>
      <dl class="cifras">
        <div><dt>Tiempo total</dt><dd class="num">{{ hmmss(total) }}</dd></div>
        <div>
          <dt>Promedio diario</dt>
          <dd class="num">{{ hmmss(promedio) }}</dd>
          <p class="nota">en {{ diasConEstudio }} {{ diasConEstudio === 1 ? 'día' : 'días' }} con estudio</p>
        </div>
      </dl>
      <hr />
      <GraficoComparacion
        :actual="acumular(totales)"
        :anterior="acumular(anteriores.map(k => store.porDia.get(k)?.total ?? 0))"
        :corte="corte"
        :etiquetas="ejes"
        :texto-corte="textoCorte"
        :texto-actual="tipo === 'semana' ? 'Esta semana' : 'Este mes'"
        :texto-anterior="tipo === 'semana' ? 'Semana anterior' : 'Mes anterior'"
      />
    </section>

    <template v-if="total > 0">
      <section class="tarjeta" aria-labelledby="titulo-horario">
        <h3 id="titulo-horario" class="tarjeta-titulo">Horas por día e inicio/fin</h3>
        <GraficoHorario :dias="horario" :con-etiquetas="tipo === 'semana'" :indices-etiqueta="indicesEtiqueta" />
      </section>

      <section v-if="tipo === 'mes' && dispersion.length" class="tarjeta" aria-labelledby="titulo-dispersion">
        <h3 id="titulo-dispersion" class="tarjeta-titulo">Distribución de horario de inicio y fin</h3>
        <GraficoDispersion :puntos="dispersion" />
      </section>

      <div class="par">
        <section class="tarjeta" aria-labelledby="titulo-dona">
          <h3 id="titulo-dona" class="tarjeta-titulo">Proporción por materia</h3>
          <GraficoDona :items="dona" />
        </section>

        <section class="tarjeta" aria-labelledby="titulo-barras">
          <h3 id="titulo-barras" class="tarjeta-titulo">Estudio por materia</h3>
          <GraficoBarrasMateria :dias="porDiaMateria" :materias="materiasActivas" :indices-etiqueta="indicesEtiqueta" />
        </section>
      </div>

      <section class="tarjeta" aria-labelledby="titulo-area">
        <h3 id="titulo-area" class="tarjeta-titulo">Tiempo acumulado</h3>
        <GraficoAreaAcumulada :dias="porDiaMateria" :materias="materiasActivas" :indices-etiqueta="indicesEtiqueta" />
      </section>
    </template>
    <p v-else class="tarjeta vacio">
      No hay tiempo de foco registrado en {{ tipo === 'semana' ? 'esta semana' : 'este mes' }}.
    </p>
  </div>
</template>

<style scoped>
.detalle {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.titulo {
  margin: 0 0 1rem;
  font-size: 1rem;
  text-align: center;
  color: var(--text-h);
}

.cifras {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin: 0;
  text-align: center;
}

dt {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent);
}

dd {
  margin: 0.2rem 0 0;
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--text-h);
}

.nota {
  margin: 0.1rem 0 0;
  font-size: 0.75rem;
}

hr {
  margin: 1.25rem 0;
  border: none;
  border-top: 1px solid var(--border);
}

.par {
  display: grid;
  gap: 1rem;
}

@media (min-width: 1100px) {
  .par { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

.vacio {
  margin: 0;
  text-align: center;
  font-size: 0.9rem;
}
</style>
