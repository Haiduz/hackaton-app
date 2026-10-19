// src/stores/materias.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { calcularPlan, materiasLCC, type EstadoBase, type MateriaPlan } from '../data/correlativas'

export interface Materia {
  id: number
  career_id: number
  name: string
  code: string | null
  year: number | null
  term: number | null
  kind: string | null
}

export interface Comision {
  id: number
  subject_id: number
  semester: string | null
  weekday: number
  start_time: string | null
  end_time: string | null
  rooms: string[]
  campus: string | null
  campus_id: number | null
  mode: string | null
  notes: string | null
}

export interface Correlativa {
  id: number
  code: string | null
  name: string
  requirement: string | null
}

export interface MateriaOverview extends Materia {
  description: string | null
  syllabus_pdf_url: string | null
  campus_url: string | null
  website_url: string | null
  area: string | null
  area_id: number | null
  sessions: Comision[]
  exam_count: number
  solution_count: number
  material_count: number
  prerequisites: Correlativa[]
}

interface Page<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

// "r123" -> año 1, cuatrimestre 2. Solo aplica a códigos con formato rXXX.
function derivarAnioYCuatrimestre(code: string | null): { year: number; term: number } | null {
  const match = code?.trim().toLowerCase().match(/^r(\d)(\d)\d$/)
  if (!match) return null
  return { year: Number(match[1]), term: Number(match[2]) }
}

function apiUrl(): string | null {
  return (import.meta.env.VITE_API_URL as string | undefined) ?? null
}

export const useMateriasStore = defineStore('materias', () => {
  const disponibles = ref<Materia[]>([])
  const seleccionadas = ref<Materia[]>([])
  const cargando = ref(false)
  const error = ref<string | null>(null)
  // Estado base por id de materia. Las que no están acá son "libre".
  // Mock mientras Perfil no cargue los estados reales.
  const estados = ref<Record<number, EstadoBase>>({
    111: 'aprobada',
    112: 'aprobada',
    113: 'aprobada',
    121: 'aprobada',
    122: 'aprobada',
    123: 'aprobada',
    211: 'aprobada',
    212: 'aprobada',
    314: 'aprobada',
    213: 'regular',
    221: 'regular',
    222: 'regular',
    223: 'regular',
  });

  const plan = computed<MateriaPlan[]>(() => calcularPlan(materiasLCC, estados.value));

  async function cargarDisponibles() {
    const BASE_URL = import.meta.env.VITE_API_URL as string | undefined
    if (!BASE_URL) {
      error.value = 'Falta la variable VITE_API_URL en el archivo .env'
      return
    }

    cargando.value = true
    error.value = null
    try {
      const url = `${BASE_URL}/subjects?career_id=1&kind=obligatoria`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: Page<Materia> = await res.json()

      disponibles.value = data.items.map(m => {
        const derivado = derivarAnioYCuatrimestre(m.code)
        return derivado ? { ...m, year: derivado.year, term: derivado.term } : m
      })
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar materias'
      disponibles.value = []
    } finally {
      cargando.value = false
    }
  }

  const overviews = ref<Record<number, MateriaOverview>>({})
  const overviewsCargando = ref<Record<number, boolean>>({})
  const overviewsError = ref<Record<number, string | null>>({})

  async function cargarOverview(id: number) {
    if (overviews.value[id] || overviewsCargando.value[id]) return

    const BASE_URL = apiUrl()
    if (!BASE_URL) {
      overviewsError.value[id] = 'Falta la variable VITE_API_URL en el archivo .env'
      return
    }

    overviewsCargando.value[id] = true
    overviewsError.value[id] = null
    try {
      const res = await fetch(`${BASE_URL}/subjects/${id}/overview`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      overviews.value[id] = (await res.json()) as MateriaOverview
    } catch (e) {
      overviewsError.value[id] = e instanceof Error ? e.message : 'Error al cargar la materia'
    } finally {
      overviewsCargando.value[id] = false
    }
  }

  function toggleMateria(materia: Materia) {
    const idx = seleccionadas.value.findIndex(m => m.id === materia.id)
    if (idx >= 0) seleccionadas.value.splice(idx, 1)
    else seleccionadas.value.push(materia)
  }

  function setEstado(id: number, estado: EstadoBase) {
    estados.value = { ...estados.value, [id]: estado }
  }

  return {
    disponibles,
    seleccionadas,
    cargando,
    error,
    estados,
    plan,
    overviews,
    overviewsCargando,
    overviewsError,
    cargarDisponibles,
    cargarOverview,
    toggleMateria,
    setEstado,
  }
})
