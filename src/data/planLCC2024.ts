// Correlatividades de la Licenciatura en Ciencias de la Computación (Plan 2024).
// El código T es un identificador interno: no se muestra en el árbol.

export interface MateriaDelPlan {
  anio: number
  cuatri: number // 1 a 10, consecutivo en toda la carrera
  requiere: string[]
  // Exige además el Examen de Suficiencia de Inglés aprobado.
  ingles?: boolean
}

export const CODIGO_INGLES = 'T1031'

export const PLAN_LCC_2024: Record<string, MateriaDelPlan> = {
  T1001: { anio: 1, cuatri: 1, requiere: [] },
  T1002: { anio: 1, cuatri: 1, requiere: [] },
  T1003: { anio: 1, cuatri: 1, requiere: [] },
  T1004: { anio: 1, cuatri: 2, requiere: ['T1001'] },
  T1005: { anio: 1, cuatri: 2, requiere: ['T1002'] },
  T1006: { anio: 1, cuatri: 2, requiere: ['T1003'] },
  T1007: { anio: 2, cuatri: 3, requiere: ['T1004'] },
  T1008: { anio: 2, cuatri: 3, requiere: ['T1006'] },
  T1009: { anio: 2, cuatri: 3, requiere: ['T1006'] },
  T1010: { anio: 2, cuatri: 4, requiere: ['T1007', 'T1008'] },
  T1011: { anio: 2, cuatri: 4, requiere: ['T1008'] },
  T1012: { anio: 2, cuatri: 4, requiere: ['T1006'] },
  T1013: { anio: 2, cuatri: 4, requiere: ['T1005', 'T1007'] },
  T1014: { anio: 3, cuatri: 5, requiere: ['T1005'] },
  T1015: { anio: 3, cuatri: 5, requiere: ['T1010'] },
  T1018: { anio: 3, cuatri: 5, requiere: ['T1012'] },
  T1016: { anio: 3, cuatri: 6, requiere: ['T1012', 'T1015'] },
  T1017: { anio: 3, cuatri: 6, requiere: ['T1014'] },
  T1019: { anio: 3, cuatri: 6, requiere: ['T1011'] },
  T1020: { anio: 3, cuatri: 6, requiere: ['T1012', 'T1015'] },
  T1031: { anio: 3, cuatri: 5, requiere: [] },
  T1021: { anio: 4, cuatri: 7, requiere: ['T1012', 'T1015'], ingles: true },
  T1022: { anio: 4, cuatri: 7, requiere: ['T1011', 'T1018'], ingles: true },
  T1023: { anio: 4, cuatri: 7, requiere: ['T1020'], ingles: true },
  T1024: { anio: 4, cuatri: 8, requiere: ['T1021'], ingles: true },
  T1025: { anio: 4, cuatri: 8, requiere: ['T1009', 'T1016'], ingles: true },
  T1026: { anio: 4, cuatri: 8, requiere: ['T1005', 'T1007', 'T1012'], ingles: true },
  T1027: { anio: 5, cuatri: 9, requiere: ['T1015'], ingles: true },
  T1029: { anio: 5, cuatri: 9, requiere: [], ingles: true },
  T1030: { anio: 5, cuatri: 9, requiere: [], ingles: true },
  T1032: { anio: 5, cuatri: 10, requiere: [] },
}

// La API todavía publica los códigos del plan anterior (rXXX).
export const CODIGO_PLAN_POR_CODIGO_API: Record<string, string> = {
  r111: 'T1001',
  r112: 'T1002',
  r113: 'T1003',
  r121: 'T1004',
  r122: 'T1005',
  r123: 'T1006',
  r211: 'T1007',
  r212: 'T1008',
  r213: 'T1009',
  r221: 'T1010',
  r222: 'T1011',
  r223: 'T1012',
  r224: 'T1013',
  r311: 'T1014',
  r312: 'T1015',
  r322: 'T1018',
  r313: 'T1016',
  r321: 'T1017',
  r323: 'T1019',
  r324: 'T1020',
  r314: 'T1031',
  r411: 'T1021',
  r412: 'T1022',
  r413: 'T1023',
  r421: 'T1024',
  r422: 'T1025',
  r423: 'T1026',
  r511: 'T1027',
  r513: 'T1029',
  r514: 'T1030',
  r523: 'T1032',
}

// Las sesiones de estudio se registran con el id numérico del plan anterior (r112 -> 112).
const ID_ESTUDIO_POR_CODIGO_PLAN: Record<string, number> = Object.fromEntries(
  Object.entries(CODIGO_PLAN_POR_CODIGO_API).map(([codigoApi, codigoPlan]) => [
    codigoPlan,
    Number(codigoApi.slice(1)),
  ]),
)

export function idEstudioDeCodigoPlan(codigo: string | null | undefined): number | null {
  return codigo ? (ID_ESTUDIO_POR_CODIGO_PLAN[codigo] ?? null) : null
}

export function requisitosDelPlan(codigo: string): string[] | null {
  const materia = PLAN_LCC_2024[codigo]
  if (!materia) return null
  return materia.ingles ? [...materia.requiere, CODIGO_INGLES] : materia.requiere
}
