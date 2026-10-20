<script setup lang="ts">
import { computed, inject } from 'vue'
import { useEstudioStore } from '../../stores/estudio'
import {
  capitalizar, clave, fechaLarga, horasMinutos, inicioSemana, MESES_CORTOS, nivel, sumarDias, UMBRALES,
} from '../../utils/estudio'

const SEMANAS = 18
const DIAS_FILA = ['Lun', '', 'Mié', '', 'Vie', '', '']

const store = useEstudioStore()
const navegar = inject<(tab: string) => void>('navegar', () => {})

const hoy = new Date()
const hoyClave = clave(hoy)

const columnas = computed(() => {
  const primera = sumarDias(inicioSemana(hoy), -(SEMANAS - 1) * 7)
  let mesPrevio = -1
  return Array.from({ length: SEMANAS }, (_, s) => {
    const lunes = sumarDias(primera, s * 7)
    const mes = lunes.getMonth()
    const etiqueta = mes !== mesPrevio ? MESES_CORTOS[mes] : ''
    mesPrevio = mes
    const dias = Array.from({ length: 7 }, (_, d) => {
      const fecha = sumarDias(lunes, d)
      const k = clave(fecha)
      const valor = store.porDia.get(k)?.total ?? 0
      return {
        id: k,
        valor,
        nivel: nivel(valor, UMBRALES.dia),
        futuro: k > hoyClave,
        titulo: `${capitalizar(fechaLarga(k))}: ${valor > 0 ? horasMinutos(valor) : 'sin estudio'}`,
      }
    })
    return { id: clave(lunes), etiqueta, dias }
  })
})

const totalPeriodo = computed(() =>
  columnas.value.reduce((a, c) => a + c.dias.reduce((b, d) => b + d.valor, 0), 0),
)
const diasActivos = computed(() =>
  columnas.value.reduce((a, c) => a + c.dias.filter(d => d.valor > 0).length, 0),
)
</script>

<template>
  <section class="mini" aria-labelledby="mini-titulo">
    <header class="cabecera">
      <h3 id="mini-titulo">Actividad de estudio</h3>
      <button type="button" class="ver" @click="navegar('stats')">Ver estadísticas</button>
    </header>

    <p v-if="store.sesiones.length === 0" class="vacio">
      Todavía no hay sesiones. Tu actividad aparece acá cuando estudies.
    </p>

    <div class="cuerpo" :style="{ '--semanas': SEMANAS }">
      <div class="dias" aria-hidden="true">
        <span v-for="(d, i) in DIAS_FILA" :key="i">{{ d }}</span>
      </div>

      <div class="mapa">
        <div class="meses" aria-hidden="true">
          <span v-for="c in columnas" :key="c.id">{{ c.etiqueta }}</span>
        </div>
        <div class="grilla" role="img" :aria-label="`${diasActivos} días con estudio en las últimas ${SEMANAS} semanas, ${horasMinutos(totalPeriodo)} en total`">
          <div v-for="c in columnas" :key="c.id" class="semana">
            <span
              v-for="d in c.dias"
              :key="d.id"
              class="celda"
              :class="[`n${d.nivel}`, { futuro: d.futuro }]"
              :title="d.futuro ? undefined : d.titulo"
            />
          </div>
        </div>
      </div>
    </div>

    <footer class="pie">
      <span class="num">{{ horasMinutos(totalPeriodo) }} en {{ SEMANAS }} semanas</span>
      <span class="leyenda" aria-hidden="true">
        Menos
        <span v-for="n in 6" :key="n" class="celda" :class="`n${n - 1}`" />
        Más
      </span>
    </footer>
  </section>
</template>

<style scoped>
.mini {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--border);
  border-radius: 12px;
}

.cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.cabecera h3 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-h);
}

.ver {
  padding: 0.15rem 0.25rem;
  border: none;
  background: none;
  color: var(--accent);
  font: inherit;
  font-size: 0.78rem;
  cursor: pointer;
}

.ver:hover {
  text-decoration: underline;
}

.ver:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.vacio {
  margin: 0;
  font-size: 0.8rem;
}

.cuerpo {
  --lado: 0.8rem;
  --hueco: 3px;
  display: flex;
  gap: 0.4rem;
  max-width: calc(var(--semanas) * (var(--lado) + var(--hueco)) + 2rem);
}

.dias {
  display: flex;
  flex-direction: column;
  gap: var(--hueco);
  padding-top: 1.1rem;
  font-size: 0.62rem;
}

.dias span {
  display: flex;
  align-items: center;
  height: var(--lado);
  line-height: 1;
}

.mapa {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.meses {
  display: grid;
  grid-template-columns: repeat(var(--semanas), minmax(0, 1fr));
  height: 0.85rem;
  font-size: 0.62rem;
  line-height: 1;
}

.meses span {
  overflow: visible;
  white-space: nowrap;
}

.grilla {
  display: grid;
  grid-template-columns: repeat(var(--semanas), minmax(0, 1fr));
  gap: var(--hueco);
}

.semana {
  display: flex;
  flex-direction: column;
  gap: var(--hueco);
}

.celda {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 2px;
  background: var(--calor-0);
}

.celda.futuro {
  background: transparent;
}

.n0 { background: var(--calor-0); }
.n1 { background: var(--calor-1); }
.n2 { background: var(--calor-2); }
.n3 { background: var(--calor-3); }
.n4 { background: var(--calor-4); }
.n5 { background: var(--calor-5); }

.pie {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.72rem;
}

.leyenda {
  display: flex;
  align-items: center;
  gap: 3px;
}

.leyenda .celda {
  width: 0.7rem;
}

.leyenda .celda:first-of-type {
  margin-left: 0.2rem;
}

.leyenda .celda:last-of-type {
  margin-right: 0.2rem;
}
</style>
