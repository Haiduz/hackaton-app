import type { Comision } from '../stores/materias'

// La API devuelve weekday con 1 = lunes ... 7 = domingo.
export const DIAS: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo',
}

export function nombreDia(weekday: number): string {
  return DIAS[weekday] ?? `Día ${weekday}`
}

const SEMESTRE_CONCRETO = /^\d{4}-\d/

// La API repite una misma clase como "última publicación" y como semestre concreto
// (ej. "2026-2S"); nos quedamos con una sola por día y horario, priorizando el semestre concreto.
export function comisionesUnicas(comisiones: Comision[]): Comision[] {
  const porHorario = new Map<string, Comision>()
  for (const c of comisiones) {
    const clave = `${c.weekday}|${c.start_time}|${c.end_time}`
    const actual = porHorario.get(clave)
    const esConcreta = SEMESTRE_CONCRETO.test(c.semester ?? '')
    const actualEsConcreta = SEMESTRE_CONCRETO.test(actual?.semester ?? '')
    if (!actual || (esConcreta && (!actualEsConcreta || (c.semester ?? '') > (actual.semester ?? '')))) {
      porHorario.set(clave, c)
    }
  }
  return [...porHorario.values()]
}

export function ordenarComisiones(comisiones: Comision[]): Comision[] {
  return comisionesUnicas(comisiones).sort(
    (a, b) => a.weekday - b.weekday || (a.start_time ?? '').localeCompare(b.start_time ?? ''),
  )
}

export function textoAula(c: Comision): string | null {
  const aulas = c.rooms.filter(Boolean).join(', ')
  if (!aulas) return null
  return c.campus ? `${aulas} (${c.campus})` : aulas
}
