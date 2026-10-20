import type { Materia } from '../stores/materias'

export interface GrupoCuatrimestre {
  term: number | null
  materias: Materia[]
}

export interface GrupoAnio {
  anio: number | null
  cuatrimestres: GrupoCuatrimestre[]
}

function porValorNullAlFinal(a: number | null, b: number | null) {
  if (a === b) return 0
  if (a === null) return 1
  if (b === null) return -1
  return a - b
}

export function agruparPorAnioYCuatrimestre(materias: Materia[]): GrupoAnio[] {
  const anios = new Map<number | null, Map<number | null, Materia[]>>()

  for (const m of materias) {
    const cuatrimestres = anios.get(m.year) ?? new Map<number | null, Materia[]>()
    const lista = cuatrimestres.get(m.term) ?? []
    lista.push(m)
    cuatrimestres.set(m.term, lista)
    anios.set(m.year, cuatrimestres)
  }

  return [...anios.entries()]
    .sort(([a], [b]) => porValorNullAlFinal(a, b))
    .map(([anio, cuatrimestres]) => ({
      anio,
      cuatrimestres: [...cuatrimestres.entries()]
        .sort(([a], [b]) => porValorNullAlFinal(a, b))
        .map(([term, lista]) => ({
          term,
          materias: [...lista].sort((a, b) => a.name.localeCompare(b.name)),
        })),
    }))
}

export function tituloAnio(anio: number | null) {
  return anio !== null ? `${anio}º año` : 'Sin año asignado'
}

export function tituloCuatrimestre(term: number | null) {
  return term !== null ? `${term}º cuatrimestre` : 'Sin cuatrimestre asignado'
}
