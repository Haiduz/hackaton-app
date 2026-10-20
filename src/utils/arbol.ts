import type { Materia } from '../stores/materias'
import type { GrupoAnio } from './agrupar'

export const NODO_ANCHO = 208
export const NODO_ALTO = 92
const GAP_X = 96
const GAP_Y = 14
const ALTO_ENCABEZADO_ANIO = 48
const ALTO_ENCABEZADO_TERM = 34
const GAP_TERM = 12
const PADDING = 8

export interface NodoPos {
  materia: Materia
  x: number
  y: number
}

export interface EncabezadoAnio {
  key: string
  anio: number | null
  x: number
  materias: Materia[]
}

export interface EncabezadoTerm {
  key: string
  term: number | null
  x: number
  y: number
  materias: Materia[]
}

export interface LayoutArbol {
  nodos: NodoPos[]
  anios: EncabezadoAnio[]
  terminos: EncabezadoTerm[]
  ancho: number
  alto: number
}

export function calcularLayout(grupos: GrupoAnio[]): LayoutArbol {
  const nodos: NodoPos[] = []
  const anios: EncabezadoAnio[] = []
  const terminos: EncabezadoTerm[] = []
  let altoMax = 0

  grupos.forEach((grupo, i) => {
    const x = PADDING + i * (NODO_ANCHO + GAP_X)
    let y = ALTO_ENCABEZADO_ANIO

    anios.push({
      key: String(grupo.anio),
      anio: grupo.anio,
      x,
      materias: grupo.cuatrimestres.flatMap(c => c.materias),
    })

    for (const cuatri of grupo.cuatrimestres) {
      terminos.push({
        key: `${grupo.anio}-${cuatri.term}`,
        term: cuatri.term,
        x,
        y,
        materias: cuatri.materias,
      })
      y += ALTO_ENCABEZADO_TERM

      for (const materia of cuatri.materias) {
        nodos.push({ materia, x, y })
        y += NODO_ALTO + GAP_Y
      }
      y += GAP_TERM
    }

    altoMax = Math.max(altoMax, y)
  })

  return {
    nodos,
    anios,
    terminos,
    ancho: PADDING * 2 + grupos.length * NODO_ANCHO + Math.max(grupos.length - 1, 0) * GAP_X,
    alto: altoMax + PADDING,
  }
}

export interface Arista {
  key: string
  desde: number
  hasta: number
  d: string
}

// Une cada correlativa (origen) con la materia que la requiere (destino).
export function calcularAristas(
  nodos: NodoPos[],
  prerequisitosDe: (id: number) => number[],
): Arista[] {
  const porId = new Map(nodos.map(n => [n.materia.id, n]))
  const aristas: Arista[] = []

  for (const destino of nodos) {
    for (const origenId of prerequisitosDe(destino.materia.id)) {
      const origen = porId.get(origenId)
      if (!origen) continue

      const yO = origen.y + NODO_ALTO / 2
      const yD = destino.y + NODO_ALTO / 2
      let d: string

      if (origen.x === destino.x) {
        const xBorde = origen.x
        const curva = 34
        d = `M ${xBorde} ${yO} C ${xBorde - curva} ${yO}, ${xBorde - curva} ${yD}, ${xBorde} ${yD}`
      } else if (origen.x < destino.x) {
        const x1 = origen.x + NODO_ANCHO
        const x2 = destino.x
        const mitad = (x2 - x1) / 2
        d = `M ${x1} ${yO} C ${x1 + mitad} ${yO}, ${x2 - mitad} ${yD}, ${x2} ${yD}`
      } else {
        const x1 = origen.x
        const x2 = destino.x + NODO_ANCHO
        const mitad = (x1 - x2) / 2
        d = `M ${x1} ${yO} C ${x1 - mitad} ${yO}, ${x2 + mitad} ${yD}, ${x2} ${yD}`
      }

      aristas.push({ key: `${origenId}-${destino.materia.id}`, desde: origenId, hasta: destino.materia.id, d })
    }
  }

  return aristas
}
