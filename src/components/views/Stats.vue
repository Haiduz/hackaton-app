<script setup lang="ts">
import { computed, inject, reactive, ref } from 'vue'
import { ChartNoAxesColumnIncreasing, ListChecks, RotateCcw, Timer } from 'lucide-vue-next'
import { useEstudioStore } from '../../stores/estudio'
import {
  capitalizar, clave, desdeClave, diasEnMes, fechaCorta, fechaLarga, horasMinutos, inicioSemana, MESES, MESES_CORTOS,
  nivel, pad, sumarDias, UMBRALES, DIAS_CORTOS, type Celda,
} from '../../utils/estudio'
import MapaCalor from '../estadisticas/MapaCalor.vue'
import DetalleDia from '../estadisticas/DetalleDia.vue'
import DetallePeriodo from '../estadisticas/DetallePeriodo.vue'

type Pestania = 'dia' | 'semana' | 'mes'

const store = useEstudioStore()
const navegar = inject<(tab: string) => void>('navegar', () => {})

const hoy = new Date()
const hoyClave = clave(hoy)
const pestania = ref<Pestania>('dia')
const PESTANIAS: { id: Pestania; nombre: string }[] = [
  { id: 'dia', nombre: 'Día' },
  { id: 'semana', nombre: 'Semana' },
  { id: 'mes', nombre: 'Mes' },
]

const cursor = reactive({
  dia: { anio: hoy.getFullYear(), mes: hoy.getMonth() },
  semana: { anio: hoy.getFullYear(), trimestre: Math.floor(hoy.getMonth() / 3) },
  mes: { anio: hoy.getFullYear() },
})
const seleccion = reactive<Record<Pestania, string>>({
  dia: hoyClave,
  semana: clave(inicioSemana(hoy)),
  mes: `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}`,
})

const totalDia = (k: string) => store.porDia.get(k)?.total ?? 0
const rangoDias = (desde: Date, n: number) => Array.from({ length: n }, (_, i) => clave(sumarDias(desde, i)))
const sumar = (claves: string[]) => claves.reduce((a, k) => a + totalDia(k), 0)
const diasDelMes = (anio: number, mes: number) => rangoDias(new Date(anio, mes, 1), diasEnMes(anio, mes))

const celdasDia = computed<Celda[]>(() => {
  const { anio, mes } = cursor.dia
  const desde = inicioSemana(new Date(anio, mes, 1))
  const hasta = sumarDias(inicioSemana(new Date(anio, mes, diasEnMes(anio, mes))), 6)
  const celdas: Celda[] = []
  for (let d = desde; d <= hasta; d = sumarDias(d, 1)) {
    const k = clave(d)
    const valor = totalDia(k)
    celdas.push({
      id: k,
      superior: String(d.getDate()),
      etiqueta: capitalizar(fechaLarga(k)),
      valor,
      nivel: nivel(valor, UMBRALES.dia),
      fuera: d.getMonth() !== mes,
      futuro: k > hoyClave,
    })
  }
  return celdas
})

const celdasSemana = computed<Celda[]>(() => {
  const { anio, trimestre } = cursor.semana
  const fin = new Date(anio, trimestre * 3 + 3, 0)
  const celdas: Celda[] = []
  for (let l = inicioSemana(new Date(anio, trimestre * 3, 1)); l <= fin; l = sumarDias(l, 7)) {
    const valor = sumar(rangoDias(l, 7))
    celdas.push({
      id: clave(l),
      superior: `${fechaCorta(l)} ~`,
      etiqueta: `Semana del ${fechaLarga(clave(l))}`,
      valor,
      nivel: nivel(valor, UMBRALES.semana),
      futuro: l > hoy,
    })
  }
  return celdas
})

const celdasMes = computed<Celda[]>(() => {
  const { anio } = cursor.mes
  return MESES_CORTOS.map((nombre, m) => {
    const valor = sumar(diasDelMes(anio, m))
    return {
      id: `${anio}-${pad(m + 1)}`,
      superior: nombre,
      etiqueta: `${capitalizar(MESES[m])} ${anio}`,
      valor,
      nivel: nivel(valor, UMBRALES.mes),
      futuro: new Date(anio, m, 1) > hoy,
    }
  })
})

const mapa = computed(() => {
  if (pestania.value === 'dia') {
    const { anio, mes } = cursor.dia
    const celdas = celdasDia.value
    return {
      titulo: `${capitalizar(MESES[mes])} ${anio}`,
      celdas,
      columnas: 7,
      cabeceras: DIAS_CORTOS,
      umbrales: UMBRALES.dia,
      total: `${capitalizar(MESES[mes])}: ${horasMinutos(sumar(diasDelMes(anio, mes)))}`,
      puedeSiguiente: new Date(anio, mes + 1, 1) <= hoy,
    }
  }
  if (pestania.value === 'semana') {
    const { anio, trimestre } = cursor.semana
    return {
      titulo: `${anio} · T${trimestre + 1}`,
      celdas: celdasSemana.value,
      columnas: 5,
      cabeceras: undefined,
      umbrales: UMBRALES.semana,
      total: `T${trimestre + 1}: ${horasMinutos(celdasSemana.value.reduce((a, c) => a + c.valor, 0))}`,
      puedeSiguiente: new Date(anio, trimestre * 3 + 3, 1) <= hoy,
    }
  }
  const { anio } = cursor.mes
  return {
    titulo: String(anio),
    celdas: celdasMes.value,
    columnas: 4,
    cabeceras: undefined,
    umbrales: UMBRALES.mes,
    total: `${anio}: ${horasMinutos(celdasMes.value.reduce((a, c) => a + c.valor, 0))}`,
    puedeSiguiente: anio < hoy.getFullYear(),
  }
})

function mover(delta: number) {
  if (pestania.value === 'dia') {
    const d = new Date(cursor.dia.anio, cursor.dia.mes + delta, 1)
    cursor.dia = { anio: d.getFullYear(), mes: d.getMonth() }
  } else if (pestania.value === 'semana') {
    const t = cursor.semana.anio * 4 + cursor.semana.trimestre + delta
    cursor.semana = { anio: Math.floor(t / 4), trimestre: t % 4 }
  } else {
    cursor.mes = { anio: cursor.mes.anio + delta }
  }
  const disponibles = mapa.value.celdas.filter(c => !c.futuro && !c.fuera)
  const actual = disponibles.find(c => c.id === seleccion[pestania.value])
  if (!actual) {
    const conDatos = disponibles.filter(c => c.valor > 0)
    const elegida = conDatos.at(-1) ?? disponibles.at(-1)
    if (elegida) seleccion[pestania.value] = elegida.id
  }
}

function seleccionar(id: string) {
  seleccion[pestania.value] = id
  if (pestania.value === 'dia') {
    const d = desdeClave(id)
    if (d.getMonth() !== cursor.dia.mes) cursor.dia = { anio: d.getFullYear(), mes: d.getMonth() }
  }
}

const detalle = computed(() => {
  if (pestania.value === 'semana') {
    const lunes = desdeClave(seleccion.semana)
    const domingo = sumarDias(lunes, 6)
    return {
      tipo: 'semana' as const,
      titulo: `Lun ${fechaCorta(lunes)} – Dom ${fechaCorta(domingo)}`,
      dias: rangoDias(lunes, 7),
      anteriores: rangoDias(sumarDias(lunes, -7), 7),
    }
  }
  const [anio, mes] = seleccion.mes.split('-').map(Number)
  const previo = new Date(anio, mes - 2, 1)
  return {
    tipo: 'mes' as const,
    titulo: `${capitalizar(MESES[mes - 1])} ${anio}`,
    dias: diasDelMes(anio, mes - 1),
    anteriores: diasDelMes(previo.getFullYear(), previo.getMonth()),
  }
})
</script>

<template>
  <section class="stats" aria-labelledby="stats-title">
    <header class="cabecera">
      <h2 id="stats-title">Estadísticas</h2>
      <button type="button" class="btn" @click="navegar('registros')">
        <ListChecks :size="16" aria-hidden="true" /> Registros
      </button>
    </header>

    <div v-if="store.sesiones.length === 0" class="tarjeta vacio">
      <span class="icono" aria-hidden="true"><ChartNoAxesColumnIncreasing :size="28" /></span>
      <h3>Todavía no hay sesiones</h3>
      <p>Cuando finalices un Pomodoro o un cronómetro, tu tiempo de foco aparece acá al instante.</p>
      <div class="acciones">
        <button type="button" class="btn btn-primario" @click="navegar('timer')">
          <Timer :size="16" aria-hidden="true" /> Empezar a estudiar
        </button>
        <button type="button" class="btn" @click="store.restaurarDemo()">
          <RotateCcw :size="16" aria-hidden="true" /> Cargar datos de demo
        </button>
      </div>
    </div>

    <template v-else>
      <div class="pildoras" role="tablist" aria-label="Agrupar por">
        <button
          v-for="p in PESTANIAS"
          :key="p.id"
          type="button"
          role="tab"
          class="pildora"
          :class="{ activa: pestania === p.id }"
          :aria-selected="pestania === p.id"
          @click="pestania = p.id"
        >
          {{ p.nombre }}
        </button>
      </div>

      <Transition name="vista" mode="out-in">
        <div :key="pestania" class="contenido" role="tabpanel">
          <MapaCalor
            :titulo="mapa.titulo"
            :celdas="mapa.celdas"
            :columnas="mapa.columnas"
            :cabeceras="mapa.cabeceras"
            :seleccion="seleccion[pestania]"
            :umbrales="mapa.umbrales"
            :total="mapa.total"
            :puede-siguiente="mapa.puedeSiguiente"
            :compacta="pestania === 'dia'"
            @seleccionar="seleccionar"
            @anterior="mover(-1)"
            @siguiente="mover(1)"
          />
          <Transition name="detalle" mode="out-in">
            <DetalleDia v-if="pestania === 'dia'" :key="seleccion.dia" :fecha="seleccion.dia" />
            <DetallePeriodo
              v-else
              :key="seleccion[pestania]"
              :tipo="detalle.tipo"
              :titulo="detalle.titulo"
              :dias="detalle.dias"
              :anteriores="detalle.anteriores"
            />
          </Transition>
        </div>
      </Transition>
    </template>
  </section>
</template>

<style scoped>
.stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 760px;
  margin: 0 auto;
}

.cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.cabecera h2 {
  margin: 0;
  font-size: 1.6rem;
  color: var(--text-h);
}

.contenido {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2.5rem 1.5rem;
  text-align: center;
}

.vacio .icono {
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: var(--calor-1);
  color: var(--accent-text);
}

.vacio h3 {
  margin: 0.5rem 0 0;
  color: var(--text-h);
}

.vacio p {
  max-width: 26rem;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  text-wrap: pretty;
}

.vacio .acciones {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.vista-enter-active,
.vista-leave-active,
.detalle-enter-active,
.detalle-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.vista-enter-from,
.detalle-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.vista-leave-to,
.detalle-leave-to {
  opacity: 0;
}
</style>
