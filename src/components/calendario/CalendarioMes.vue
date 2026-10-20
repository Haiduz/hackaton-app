<script setup lang="ts">
import { computed } from 'vue'
import {
  claveFecha,
  ETIQUETA_TIPO,
  INICIAL_TIPO,
  mismoDia,
  semanasDelMes,
  type ExamenCalendario,
} from '../../utils/calendario'
import ListaExamenes from './ListaExamenes.vue'

const props = defineProps<{
  fecha: Date
  examenes: ExamenCalendario[]
  ahora: Date
}>()

const MAX_CHIPS = 2
const DIAS = [
  { corto: 'L', largo: 'lunes' },
  { corto: 'M', largo: 'martes' },
  { corto: 'M', largo: 'miércoles' },
  { corto: 'J', largo: 'jueves' },
  { corto: 'V', largo: 'viernes' },
  { corto: 'S', largo: 'sábado' },
  { corto: 'D', largo: 'domingo' },
]

const porFecha = computed(() => {
  const mapa = new Map<string, ExamenCalendario[]>()
  for (const e of props.examenes) mapa.set(e.fecha, [...(mapa.get(e.fecha) ?? []), e])
  return mapa
})

const semanas = computed(() =>
  semanasDelMes(props.fecha).map(semana =>
    semana.map(dia => {
      const examenes = porFecha.value.get(claveFecha(dia)) ?? []
      return {
        fecha: dia,
        fuera: dia.getMonth() !== props.fecha.getMonth(),
        hoy: mismoDia(dia, props.ahora),
        visibles: examenes.slice(0, MAX_CHIPS),
        resto: Math.max(0, examenes.length - MAX_CHIPS),
        etiqueta: examenes.length
          ? `${dia.getDate()}: ${examenes.map(e => `${ETIQUETA_TIPO[e.tipo]} de ${e.materia}`).join(', ')}`
          : String(dia.getDate()),
      }
    }),
  ),
)

const delMes = computed(() =>
  props.examenes.filter(e => {
    const [y, m] = e.fecha.split('-').map(Number)
    return y === props.fecha.getFullYear() && m - 1 === props.fecha.getMonth()
  }),
)
</script>

<template>
  <div class="mes">
    <div class="cuadricula" role="group" aria-label="Calendario mensual">
      <div class="semana cabecera" aria-hidden="true">
        <span v-for="(d, i) in DIAS" :key="i" :title="d.largo">{{ d.corto }}</span>
      </div>
      <div v-for="(semana, i) in semanas" :key="i" class="semana">
        <div
          v-for="dia in semana"
          :key="dia.fecha.getTime()"
          class="celda"
          :class="{ fuera: dia.fuera, hoy: dia.hoy }"
          role="text"
          :aria-label="dia.etiqueta"
        >
          <span class="numero">{{ dia.fecha.getDate() }}</span>
          <span
            v-for="e in dia.visibles"
            :key="e.id"
            class="chip"
            :style="{ '--hue': e.hue }"
            aria-hidden="true"
          >
            {{ INICIAL_TIPO[e.tipo] }}
          </span>
          <span v-if="dia.resto" class="mas" aria-hidden="true">+{{ dia.resto }}</span>
        </div>
      </div>
    </div>

    <ListaExamenes
      :examenes="delMes"
      titulo="Exámenes del mes"
      vacio="No hay exámenes este mes. Podés cargarlos en Inicio, dentro de cada materia."
    />
  </div>
</template>

<style scoped>
.mes {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cuadricula {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg);
  overflow: hidden;
}

.semana {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.semana + .semana {
  border-top: 1px solid var(--border);
}

.cabecera {
  padding: 0.4rem 0;
  background: var(--code-bg);
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  color: var(--text);
}

.celda {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-height: 4.25rem;
  padding: 4px 2px;
  box-sizing: border-box;
}

.celda + .celda {
  border-left: 1px solid var(--border);
}

.celda.fuera {
  opacity: 0.4;
}

.numero {
  display: grid;
  place-items: center;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  font-size: 13px;
  letter-spacing: 0;
  color: var(--text-h);
}

.celda.hoy .numero {
  background: var(--accent);
  color: #fff;
  font-weight: 600;
}

.chip {
  box-sizing: border-box;
  width: 100%;
  max-width: 2.25rem;
  border-radius: 4px;
  background: hsl(var(--hue) 55% 40%);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.35;
  text-align: center;
}

.mas {
  font-size: 11px;
  line-height: 1;
  color: var(--text);
}

@media (min-width: 640px) {
  .celda {
    min-height: 5.5rem;
  }
}
</style>
