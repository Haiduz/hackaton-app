<script setup lang="ts">
import { computed, inject } from 'vue'
import { useEstudioStore } from '../../stores/estudio'
import {
  calcularRacha, capitalizar, clave, DIAS_CORTOS, fechaLarga, horasMinutos, inicioSemana, MESES_CORTOS, nivel,
  sumarDias, UMBRALES,
} from '../../utils/estudio'

const SEMANAS = 18
const DIAS_FILA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const INICIALES = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const store = useEstudioStore()
const navegar = inject<(tab: string) => void>('navegar', () => {})

const hoy = new Date()
const hoyClave = clave(hoy)

const columnas = computed(() => {
  const primera = sumarDias(inicioSemana(hoy), -(SEMANAS - 1) * 7)
  const etiquetas = Array.from({ length: SEMANAS }, (_, s) => {
    const lunes = sumarDias(primera, s * 7)
    for (let d = 0; d < 7; d++) {
      const fecha = sumarDias(lunes, d)
      if (fecha.getDate() === 1) return MESES_CORTOS[fecha.getMonth()]
    }
    return ''
  })
  // La primera columna lleva su mes solo si hay lugar antes de la siguiente etiqueta.
  const siguiente = etiquetas.findIndex((e, i) => i > 0 && e !== '')
  if (etiquetas[0] === '' && siguiente >= 3) etiquetas[0] = MESES_CORTOS[primera.getMonth()]

  return Array.from({ length: SEMANAS }, (_, s) => {
    const lunes = sumarDias(primera, s * 7)
    const etiqueta = etiquetas[s]
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

const tiempoHoy = computed(() => store.porDia.get(hoyClave)?.total ?? 0)
const racha = computed(() => calcularRacha(store.porDia, hoy))

const semanaActual = computed(() => {
  const lunes = inicioSemana(hoy)
  return Array.from({ length: 7 }, (_, i) => {
    const k = clave(sumarDias(lunes, i))
    return {
      id: k,
      inicial: INICIALES[i],
      nombre: DIAS_CORTOS[i],
      hecho: (store.porDia.get(k)?.total ?? 0) > 0,
      hoy: k === hoyClave,
      futuro: k > hoyClave,
    }
  })
})

const mensajeRacha = computed(() => {
  const { actual, hoyActivo } = racha.value
  if (actual === 0) return 'Estudiá hoy para empezar tu racha.'
  if (!hoyActivo) return 'Estudiá hoy para no perder tu racha.'
  return actual === 1 ? 'Primer día. Volvé mañana para sumar.' : 'Racha asegurada por hoy. Seguí así.'
})
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

    <div class="contenido">
    <div class="calendario">
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
    </div>

    <aside class="resumen" aria-label="Resumen de hoy y racha">
      <div class="hoy">
        <span class="etiqueta">Hoy</span>
        <strong class="tiempo">{{ tiempoHoy > 0 ? horasMinutos(tiempoHoy) : '0 min' }}</strong>
        <span class="detalle">{{ tiempoHoy > 0 ? 'estudiado' : 'sin estudio todavía' }}</span>
      </div>

      <div class="racha" :class="{ viva: racha.actual > 0, pendiente: racha.actual > 0 && !racha.hoyActivo }">
        <div class="racha-cifra">
          <svg class="llama" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 2c.6 3.2-1 5-2.6 6.8C7.8 10.6 6 12.4 6 15.2 6 18.6 8.6 22 12 22s6-3.1 6-6.6c0-2.2-1-3.9-2.2-5.2-.3 1.2-.9 2-1.8 2.5.5-3.7-.3-7.9-2-10.7Z"
              fill="currentColor"
            />
          </svg>
          <strong class="racha-numero">{{ racha.actual }}</strong>
        </div>
        <span class="etiqueta">{{ racha.actual === 1 ? 'día seguido' : 'días seguidos' }}</span>

        <ul class="semana-racha" aria-label="Días estudiados esta semana">
          <li
            v-for="d in semanaActual"
            :key="d.id"
            class="dia-racha"
            :class="{ hecho: d.hecho, hoy: d.hoy, futuro: d.futuro }"
            :title="`${d.nombre}: ${d.hecho ? 'estudiado' : d.futuro ? 'pendiente' : 'sin estudio'}`"
          >
            <span class="punto" />
            <span class="inicial" aria-hidden="true">{{ d.inicial }}</span>
            <span class="sr-only">{{ d.nombre }}: {{ d.hecho ? 'estudiado' : 'sin estudio' }}</span>
          </li>
        </ul>

        <p class="mensaje">{{ mensajeRacha }}</p>
        <span v-if="racha.mejor > 0" class="mejor">Mejor racha: {{ racha.mejor }} {{ racha.mejor === 1 ? 'día' : 'días' }}</span>
      </div>
    </aside>
    </div>
  </section>
</template>

<style scoped>
.mini {
  container-type: inline-size;
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
  --hueco: 3px;
  --meses-alto: 0.85rem;
  --meses-gap: 0.4rem;
  display: flex;
  gap: 0.5rem;
}

.dias {
  display: grid;
  grid-template-rows: repeat(7, minmax(0, 1fr));
  gap: var(--hueco);
  padding-top: calc(var(--meses-alto) + var(--meses-gap));
  font-size: 0.62rem;
}

.dias span {
  display: flex;
  align-items: center;
  line-height: 1;
}

.mapa {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--meses-gap);
  min-width: 0;
}

.meses {
  display: grid;
  grid-template-columns: repeat(var(--semanas), minmax(0, 1fr));
  column-gap: var(--hueco);
  align-items: end;
  height: var(--meses-alto);
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

.contenido {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  align-items: stretch;
  gap: 1rem 1.5rem;
}

.calendario {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.6rem;
  min-width: 0;
}

.resumen {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.85rem;
  min-width: 0;
  padding-left: 1.5rem;
  border-left: 1px solid var(--border);
}

.etiqueta {
  font-size: 0.72rem;
}

.hoy {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.tiempo {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2;
  color: var(--text-h);
}

.detalle {
  font-size: 0.72rem;
}

.racha {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding-top: 0.85rem;
  border-top: 1px solid var(--border);
}

.racha-cifra {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--text);
}

.llama {
  width: 1.6rem;
  height: 1.6rem;
  opacity: 0.35;
}

.racha-numero {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
  color: var(--text-h);
}

.racha.viva .llama {
  color: var(--accent);
  opacity: 1;
}

.racha.pendiente .llama {
  opacity: 0.55;
}

.semana-racha {
  display: flex;
  justify-content: space-between;
  gap: 0.35rem;
  margin: 0.5rem 0 0;
  padding: 0;
  list-style: none;
}

.dia-racha {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.punto {
  display: block;
  width: 1.1rem;
  height: 1.1rem;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: var(--calor-0);
}

.dia-racha.hecho .punto {
  border-color: var(--accent);
  background: var(--accent);
}

.dia-racha.futuro .punto {
  border-style: dashed;
  background: transparent;
}

.dia-racha.hoy .punto {
  outline: 2px solid var(--accent-border);
  outline-offset: 2px;
}

.inicial {
  font-size: 0.62rem;
  line-height: 1;
}

.dia-racha.hoy .inicial {
  font-weight: 700;
  color: var(--text-h);
}

.mensaje {
  margin: 0.25rem 0 0;
  font-size: 0.78rem;
  line-height: 1.4;
  color: var(--text-h);
}

.mejor {
  font-size: 0.72rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@container (max-width: 560px) {
  .contenido {
    grid-template-columns: minmax(0, 1fr);
  }

  .resumen {
    padding-top: 1rem;
    padding-left: 0;
    border-top: 1px solid var(--border);
    border-left: none;
  }
}
</style>
