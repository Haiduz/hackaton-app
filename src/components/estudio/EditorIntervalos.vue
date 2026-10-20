<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { ConfigPomodoro } from '../../utils/estudio'
import Modal from './Modal.vue'

const props = defineProps<{ config: ConfigPomodoro }>()
const emit = defineEmits<{ guardar: [config: ConfigPomodoro] }>()
const abierto = defineModel<boolean>('abierto', { default: false })

const PREDETERMINADO: ConfigPomodoro = { foco: 25, corto: 5, largo: 15, ciclos: 4 }
const PRESETS: { nombre: string; config: ConfigPomodoro }[] = [
  { nombre: 'Clásico 25/5', config: PREDETERMINADO },
  { nombre: 'Profundo 50/10', config: { foco: 50, corto: 10, largo: 30, ciclos: 3 } },
  { nombre: 'Corto 15/3', config: { foco: 15, corto: 3, largo: 10, ciclos: 4 } },
]

const borrador = reactive<ConfigPomodoro>({ ...props.config })
watch(abierto, v => v && Object.assign(borrador, props.config))

const CAMPOS = [
  { id: 'foco', etiqueta: 'Foco', unidad: 'min', max: 180 },
  { id: 'corto', etiqueta: 'Descanso corto', unidad: 'min', max: 60 },
  { id: 'largo', etiqueta: 'Descanso largo', unidad: 'min', max: 90 },
  { id: 'ciclos', etiqueta: 'Ciclos hasta el descanso largo', unidad: 'ciclos', max: 10 },
] as const

function guardar() {
  const limpio = Object.fromEntries(
    CAMPOS.map(c => [c.id, Math.min(c.max, Math.max(1, Math.round(Number(borrador[c.id]) || 1)))]),
  ) as unknown as ConfigPomodoro
  emit('guardar', limpio)
  abierto.value = false
}
</script>

<template>
  <Modal v-model:abierto="abierto" titulo="Intervalos del Pomodoro" descripcion="Los descansos se muestran en el reloj, pero no se registran.">
    <div class="pildoras" aria-label="Presets">
      <button
        v-for="p in PRESETS"
        :key="p.nombre"
        type="button"
        class="pildora"
        :class="{ activa: p.config.foco === borrador.foco && p.config.corto === borrador.corto && p.config.largo === borrador.largo && p.config.ciclos === borrador.ciclos }"
        @click="Object.assign(borrador, p.config)"
      >
        {{ p.nombre }}
      </button>
    </div>
    <form id="form-intervalos" class="grilla" @submit.prevent="guardar">
      <label v-for="c in CAMPOS" :key="c.id" class="campo">
        {{ c.etiqueta }}
        <span class="entrada">
          <input v-model.number="borrador[c.id]" type="number" min="1" :max="c.max" inputmode="numeric" required />
          <span class="unidad">{{ c.unidad }}</span>
        </span>
      </label>
    </form>
    <template #acciones>
      <button type="button" class="btn" @click="abierto = false">Cancelar</button>
      <button type="submit" form="form-intervalos" class="btn btn-primario">Guardar</button>
    </template>
  </Modal>
</template>

<style scoped>
.grilla {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.grilla .campo:last-child {
  grid-column: 1 / -1;
}

.entrada {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.entrada input {
  flex: 1;
  min-width: 0;
}

.unidad {
  font-weight: 400;
  color: var(--text);
}
</style>
