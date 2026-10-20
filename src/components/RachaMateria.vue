<script setup lang="ts">
import { computed } from 'vue'
import { idEstudioDeCodigoPlan } from '../data/planLCC2024'
import { useEstudioStore } from '../stores/estudio'
import type { Materia } from '../stores/materias'
import { agruparPorDia, calcularRacha } from '../utils/estudio'

const props = defineProps<{ materia: Materia }>()

const estudio = useEstudioStore()
const hoy = new Date()

const racha = computed(() => {
  const idEstudio = idEstudioDeCodigoPlan(props.materia.code)
  const sesiones = idEstudio === null ? [] : estudio.sesiones.filter(s => s.materiaId === idEstudio)
  return calcularRacha(agruparPorDia(sesiones), hoy)
})

const descripcion = computed(() => {
  const { actual, hoyActivo } = racha.value
  if (actual === 0) return 'Sin racha en esta materia'
  const dias = `${actual} ${actual === 1 ? 'día seguido' : 'días seguidos'}`
  return hoyActivo ? `Racha de ${dias}` : `Racha de ${dias}. Estudiá hoy para no perderla`
})
</script>

<template>
  <span
    class="racha-materia"
    :class="{ viva: racha.actual > 0, pendiente: racha.actual > 0 && !racha.hoyActivo }"
    :title="descripcion"
  >
    <svg class="llama" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2c.6 3.2-1 5-2.6 6.8C7.8 10.6 6 12.4 6 15.2 6 18.6 8.6 22 12 22s6-3.1 6-6.6c0-2.2-1-3.9-2.2-5.2-.3 1.2-.9 2-1.8 2.5.5-3.7-.3-7.9-2-10.7Z"
        fill="currentColor"
      />
    </svg>
    <span class="numero" aria-hidden="true">{{ racha.actual }}</span>
    <span class="sr-only">{{ descripcion }}</span>
  </span>
</template>

<style scoped>
.racha-materia {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.2rem;
  color: var(--text);
}

.llama {
  width: 1.1rem;
  height: 1.1rem;
  opacity: 0.35;
}

.numero {
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  color: var(--text-h);
}

.racha-materia.viva .llama {
  color: var(--accent);
  opacity: 1;
}

.racha-materia.pendiente .llama {
  opacity: 0.55;
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
