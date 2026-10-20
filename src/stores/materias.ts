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

export interface Examen {
  id: number
  titulo: string
  fecha: string // YYYY-MM-DD
  hora: string // HH:mm
}

export type Condicion = 'no_cursable' | 'regular' | 'libre' | 'aprobada'

export const CONDICIONES: { valor: Condicion; etiqueta: string }[] = [
  { valor: 'no_cursable', etiqueta: 'No cursable' },
  { valor: 'regular', etiqueta: 'Regular' },
  { valor: 'libre', etiqueta: 'Libre' },
  { valor: 'aprobada', etiqueta: 'Aprobada' },
]

// Condición inicial de toda materia, salvo las que estén en CUATRIMESTRE_INICIAL.
export const CONDICION_POR_DEFECTO: Condicion = 'no_cursable'

// Materias que arrancan con otra condición (por defecto: 1º año, 1º cuatrimestre).
export const CUATRIMESTRE_INICIAL = { year: 1, term: 1 }
export const CONDICION_CUATRIMESTRE_INICIAL: Condicion = 'regular'

const CONDICIONES_SELECCIONABLES: Condicion[] = ['regular', 'libre']

export function etiquetaCondicion(condicion: Condicion) {
  return CONDICIONES.find(c => c.valor === condicion)?.etiqueta ?? condicion
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

  const condiciones = ref<Record<number, Condicion>>({})

  async function cargarOverviews(ids: number[]) {
    await Promise.all(ids.map(cargarOverview))
  }

  function prerequisitosDe(id: number): number[] {
    return overviews.value[id]?.prerequisites.map(p => p.id) ?? []
  }

  function condicionInicial(id: number): Condicion {
    const materia = disponibles.value.find(m => m.id === id)
    const esInicial =
      materia?.year === CUATRIMESTRE_INICIAL.year && materia?.term === CUATRIMESTRE_INICIAL.term
    return esInicial ? CONDICION_CUATRIMESTRE_INICIAL : CONDICION_POR_DEFECTO
  }

  function condicionElegida(id: number): Condicion {
    return condiciones.value[id] ?? condicionInicial(id)
  }

  // Una materia queda "No cursable" si alguna de sus correlativas directas está en condición Libre.
  function bloqueadaPorLibre(id: number) {
    if (condicionElegida(id) === 'aprobada') return false
    return prerequisitosDe(id).some(p => condicionElegida(p) === 'libre')
  }

  function condicionDe(id: number): Condicion {
    return bloqueadaPorLibre(id) ? 'no_cursable' : condicionElegida(id)
  }

  function esSeleccionable(id: number) {
    return CONDICIONES_SELECCIONABLES.includes(condicionDe(id))
  }

  function setCondicion(id: number, condicion: Condicion) {
    condiciones.value[id] = condicion
    seleccionadas.value = seleccionadas.value.filter(m => esSeleccionable(m.id))
  }

  function toggleMateria(materia: Materia) {
    const idx = seleccionadas.value.findIndex(m => m.id === materia.id)
    if (idx >= 0) seleccionadas.value.splice(idx, 1)
    else if (esSeleccionable(materia.id)) seleccionadas.value.push(materia)
  }

  const examenes = ref<Record<number, Examen[]>>({})
  let siguienteExamenId = 1

  function examenesDe(materiaId: number): Examen[] {
    return examenes.value[materiaId] ?? []
  }

  function agregarExamen(materiaId: number, datos: Omit<Examen, 'id'>) {
    const lista = [...examenesDe(materiaId), { ...datos, id: siguienteExamenId++ }]
    lista.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora))
    examenes.value[materiaId] = lista
  }

  function quitarExamen(materiaId: number, examenId: number) {
    examenes.value[materiaId] = examenesDe(materiaId).filter(e => e.id !== examenId)
  }

  return {
    examenes,
    examenesDe,
    agregarExamen,
    quitarExamen,
    disponibles,
    seleccionadas,
    condiciones,
    condicionDe,
    condicionElegida,
    bloqueadaPorLibre,
    prerequisitosDe,
    esSeleccionable,
    setCondicion,
    cargarOverviews,
    cargando,
    error,
    overviews,
    overviewsCargando,
    overviewsError,
    cargarDisponibles,
    cargarOverview,
    toggleMateria,
  }
})
