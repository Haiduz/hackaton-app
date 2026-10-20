import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { generarSesionesMock, MATERIAS_ESTUDIO } from '../data/sesionesMock'
import { agruparPorDia, type MateriaEstudio, type Sesion } from '../utils/estudio'

export type DatosSesion = Omit<Sesion, 'id'>

// Prototipo: las sesiones viven en memoria y se pierden al recargar.
export const useEstudioStore = defineStore('estudio', () => {
  const materias: MateriaEstudio[] = MATERIAS_ESTUDIO
  const sesiones = ref<Sesion[]>(generarSesionesMock())
  const resaltada = ref<number | null>(null)
  let siguienteId = sesiones.value.length + 1

  const materiaPorId = computed(() => new Map(materias.map(m => [m.id, m])))
  const porDia = computed(() => agruparPorDia(sesiones.value))
  const ordenadas = computed(() =>
    [...sesiones.value].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.inicio - a.inicio),
  )

  function materia(id: number): MateriaEstudio | undefined {
    return materiaPorId.value.get(id)
  }

  function agregar(datos: DatosSesion): Sesion {
    const sesion = { ...datos, id: siguienteId++ }
    sesiones.value = [...sesiones.value, sesion]
    resaltada.value = sesion.id
    return sesion
  }

  function actualizar(id: number, datos: Partial<DatosSesion>) {
    sesiones.value = sesiones.value.map(s => (s.id === id ? { ...s, ...datos } : s))
    resaltada.value = id
  }

  function eliminar(id: number) {
    sesiones.value = sesiones.value.filter(s => s.id !== id)
  }

  function vaciar() {
    sesiones.value = []
  }

  function restaurarDemo() {
    sesiones.value = generarSesionesMock()
    siguienteId = sesiones.value.length + 1
  }

  return {
    materias,
    sesiones,
    resaltada,
    porDia,
    ordenadas,
    materia,
    agregar,
    actualizar,
    eliminar,
    vaciar,
    restaurarDemo,
  }
})
