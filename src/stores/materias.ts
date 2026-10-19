// src/stores/materias.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Materia {
  id: number
  career_id: number
  name: string
  code: string | null
  year: number | null
  term: number | null
  kind: string | null
}

interface Page<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}


export const useMateriasStore = defineStore('materias', () => {
  const disponibles = ref<Materia[]>([])
  const seleccionadas = ref<Materia[]>([])
  const cargando = ref(false)
  const error = ref<string | null>(null)

  async function cargarDisponibles() {
    const BASE_URL = import.meta.env.VITE_API_URL as string | undefined
    if (!BASE_URL) {
      error.value = 'Falta la variable VITE_API_URL en el archivo .env'
      return
    }

    cargando.value = true
    error.value = null
    try {
      const url = `${BASE_URL}/subjects?career_id=1&kind=obligatoria`;
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: Page<Materia> = await res.json()
      disponibles.value = data.items
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar materias'
      disponibles.value = []
    } finally {
      cargando.value = false
    }
  }

  function toggleMateria(materia: Materia) {
    const idx = seleccionadas.value.findIndex(m => m.id === materia.id)
    if (idx >= 0) seleccionadas.value.splice(idx, 1)
    else seleccionadas.value.push(materia)
  }

  return { disponibles, seleccionadas, cargando, error, cargarDisponibles, toggleMateria }
})