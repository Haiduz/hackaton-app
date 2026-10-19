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

export function ordenarComisiones(comisiones: Comision[]): Comision[] {
  return [...comisiones].sort(
    (a, b) => a.weekday - b.weekday || (a.start_time ?? '').localeCompare(b.start_time ?? ''),
  )
}

export function textoAula(c: Comision): string | null {
  const aulas = c.rooms.filter(Boolean).join(', ')
  if (!aulas) return null
  return c.campus ? `${aulas} (${c.campus})` : aulas
}
