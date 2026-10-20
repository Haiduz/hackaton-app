<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMateriasStore, type TipoExamen } from '../../stores/materias'
import { claveFecha, desdeClave, ETIQUETA_TIPO } from '../../utils/calendario'

const props = defineProps<{ materiaId: number }>()

const store = useMateriasStore()

const tipo = ref<TipoExamen>('parcial')
const fecha = ref('')
const mensaje = ref('')

const lista = computed(() => store.examenesDe(props.materiaId))
const hoy = claveFecha(new Date())
const formato = new Intl.DateTimeFormat('es-AR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

function texto(clave: string): string {
  return formato.format(desdeClave(clave)).replace(/\./g, '')
}

function agregar() {
  if (!fecha.value) {
    mensaje.value = 'Elegí una fecha.'
    return
  }
  if (!store.agregarExamen(props.materiaId, tipo.value, fecha.value)) {
    mensaje.value = 'Ese examen ya está cargado.'
    return
  }
  mensaje.value = ''
  fecha.value = ''
}
</script>

<template>
  <div class="examenes">
    <ul v-if="lista.length" class="lista">
      <li v-for="e in lista" :key="e.id" class="fila" :class="{ pasado: e.fecha < hoy }">
        <span class="tipo">{{ ETIQUETA_TIPO[e.tipo] }}</span>
        <span class="fecha">{{ texto(e.fecha) }}</span>
        <button
          type="button"
          class="quitar"
          :aria-label="`Quitar ${ETIQUETA_TIPO[e.tipo].toLowerCase()} del ${texto(e.fecha)}`"
          @click="store.quitarExamen(e.id)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
      </li>
    </ul>
    <p v-else class="vacio">Todavía no cargaste fechas de parciales ni finales.</p>

    <form class="formulario" @submit.prevent="agregar">
      <label class="campo">
        <span class="etiqueta">Tipo</span>
        <select v-model="tipo">
          <option v-for="(nombre, clave) in ETIQUETA_TIPO" :key="clave" :value="clave">
            {{ nombre }}
          </option>
        </select>
      </label>
      <label class="campo">
        <span class="etiqueta">Fecha</span>
        <input v-model="fecha" type="date" required @input="mensaje = ''" />
      </label>
      <button type="submit" class="agregar">Agregar</button>
    </form>
    <p v-if="mensaje" class="mensaje" role="alert">{{ mensaje }}</p>
  </div>
</template>

<style scoped>
.examenes {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.lista {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.fila {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.25rem 0.25rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-h);
}

.fila.pasado {
  opacity: 0.55;
}

.tipo {
  flex: none;
  font-weight: 600;
}

.fecha {
  flex: 1;
  min-width: 0;
  text-transform: capitalize;
  color: var(--text);
}

.quitar {
  flex: none;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: none;
  color: var(--text-h);
  cursor: pointer;
}

.quitar:hover {
  background: var(--code-bg);
}

.quitar svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
}

.vacio,
.mensaje {
  margin: 0;
  font-size: 14px;
}

.mensaje {
  color: #e5484d;
}

.formulario {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.5rem;
}

.campo {
  display: flex;
  flex: 1 1 8rem;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.etiqueta {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

select,
input {
  box-sizing: border-box;
  width: 100%;
  min-height: 40px;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text-h);
  font: inherit;
  font-size: 14px;
  letter-spacing: 0;
}

.agregar {
  flex: 1 1 100%;
  min-height: 40px;
  padding: 0.4rem 1rem;
  border: 1px solid var(--accent-border);
  border-radius: 999px;
  background: var(--accent-bg);
  color: var(--accent);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0;
  cursor: pointer;
}

.agregar:hover {
  background: var(--accent-border);
}

select:focus-visible,
input:focus-visible,
.agregar:focus-visible,
.quitar:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
