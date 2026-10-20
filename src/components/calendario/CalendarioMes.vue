<script setup lang="ts">
import { computed } from 'vue'
import {
  claveFecha,
  diasDelMes,
  formatearMinutos,
  type EventoCalendario,
  type ExamenCalendario,
} from '../../utils/calendario'
import { nombreDia } from '../../utils/horarios'

const MAX_ITEMS = 3

const props = defineProps<{
  fecha: Date
  eventos: EventoCalendario[]
  examenes: ExamenCalendario[]
  ahora: Date
}>()

const emit = defineEmits<{ 'abrir-dia': [fecha: Date] }>()

const formatoDia = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long' })

const celdas = computed(() => {
  const hoy = claveFecha(props.ahora)
  return diasDelMes(props.fecha).map(dia => {
    const examenes = props.examenes
      .filter(e => e.clave === dia.clave)
      .sort((a, b) => a.hora.localeCompare(b.hora))
    const clases = props.eventos
      .filter(e => e.weekday === dia.weekday)
      .sort((a, b) => a.inicio - b.inicio)
    const lugares = Math.max(0, MAX_ITEMS - examenes.length)
    return {
      ...dia,
      esHoy: dia.clave === hoy,
      examenes,
      clases: clases.slice(0, lugares),
      ocultas: Math.max(0, clases.length - lugares),
      etiqueta:
        formatoDia.format(dia.fecha) +
        (examenes.length
          ? `, ${examenes.length} ${examenes.length === 1 ? 'examen' : 'exámenes'}`
          : ''),
    }
  })
})

const semanas = computed(() => celdas.value.length / 7)
</script>

<template>
  <div class="mes" role="group" aria-label="Calendario mensual">
    <div class="cabecera" aria-hidden="true">
      <span v-for="d in 7" :key="d" class="cab-dia">{{ nombreDia(d).slice(0, 3) }}</span>
    </div>

    <div class="celdas" :style="{ '--semanas': semanas }">
      <div
        v-for="c in celdas"
        :key="c.clave"
        class="celda"
        :class="{ fuera: !c.delMes, hoy: c.esHoy }"
        @click="emit('abrir-dia', c.fecha)"
      >
        <button
          type="button"
          class="numero"
          :aria-label="`Ver ${c.etiqueta}`"
          @click.stop="emit('abrir-dia', c.fecha)"
        >
          {{ c.fecha.getDate() }}
        </button>

        <ul class="items">
          <li
            v-for="e in c.examenes"
            :key="`ex-${e.id}`"
            class="chip examen"
            :style="{ '--hue': e.hue }"
            :title="`${e.titulo} - ${e.materia}, ${e.hora}`"
          >
            <span class="sr-only">Examen: </span>
            <span class="chip-texto">{{ e.titulo }} · {{ e.materia }}</span>
          </li>
          <li
            v-for="e in c.clases"
            :key="`cl-${e.id}`"
            class="chip clase"
            :style="{ '--hue': e.hue }"
            :title="`${e.materia}, ${formatearMinutos(e.inicio)} a ${formatearMinutos(e.fin)}`"
          >
            <span class="punto" aria-hidden="true" />
            <span class="chip-texto">{{ formatearMinutos(e.inicio) }} {{ e.materia }}</span>
          </li>
          <li v-if="c.ocultas" class="mas">+{{ c.ocultas }} más</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mes {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg);
  overflow: hidden;
}

.cabecera,
.celdas {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.cabecera {
  border-bottom: 1px solid var(--border);
}

.cab-dia {
  padding: 0.5rem 0;
  text-align: center;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text);
}

.celdas {
  grid-template-rows: repeat(var(--semanas), minmax(6.5rem, 1fr));
}

.celda {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 2px;
  min-width: 0;
  padding: 4px;
  border-left: 1px solid var(--border);
  border-top: 1px solid var(--border);
  cursor: pointer;
}

.celda:nth-child(7n + 1) {
  border-left: 0;
}

.celda:nth-child(-n + 7) {
  border-top: 0;
}

.celda:hover {
  background: var(--code-bg);
}

.celda.fuera {
  opacity: 0.55;
}

.numero {
  align-self: center;
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border: 0;
  border-radius: 50%;
  background: none;
  color: var(--text-h);
  font: inherit;
  font-size: 13px;
  letter-spacing: 0;
  cursor: pointer;
}

.celda.hoy .numero {
  background: var(--accent);
  color: #fff;
  font-weight: 600;
}

.numero:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.items {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
  min-width: 0;
}

.chip {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 11px;
  line-height: 1.5;
  letter-spacing: 0;
  text-align: left;
}

.chip-texto {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip.examen {
  background: hsl(var(--hue) 55% 40%);
  color: #fff;
  font-weight: 600;
}

.chip.clase {
  color: var(--text-h);
}

.punto {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: hsl(var(--hue) 55% 50%);
}

.mas {
  padding: 0 5px;
  font-size: 11px;
  color: var(--text);
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

@media (max-width: 639px) {
  .celdas {
    grid-template-rows: repeat(var(--semanas), minmax(4.5rem, 1fr));
  }

  .items {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }

  .chip {
    padding: 0;
  }

  .chip-texto,
  .mas {
    display: none;
  }

  .chip.examen {
    width: 10px;
    height: 10px;
    border-radius: 3px;
  }
}
</style>
