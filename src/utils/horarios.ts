import type { Comision } from '../stores/materias'
import { aMinutos } from './calendario'

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

function esSemestreConcreto(c: Comision): boolean {
  return SEMESTRE_CONCRETO.test(c.semester ?? '')
}

// Un duplicado exacto (mismo día, inicio y fin) se descarta; sesiones distintas se conservan.
function sinRepetidas(sesiones: Comision[]): Comision[] {
  const vistas = new Map<string, Comision>()
  for (const c of sesiones) {
    const clave = `${c.subject_id}|${c.weekday}|${c.start_time}|${c.end_time}`
    if (!vistas.has(clave)) vistas.set(clave, c)
  }
  return [...vistas.values()]
}

// Algunas sesiones del semestre vigente llegan sin hora de fin; se toma la de la publicación
// anterior del mismo día cuyo inicio esté más cerca. Si no hay ninguna, queda en null.
function completarFin(sesion: Comision, publicacionAnterior: Comision[]): Comision {
  if (sesion.end_time) return sesion
  const inicio = aMinutos(sesion.start_time)
  const candidata = publicacionAnterior
    .filter(c => c.weekday === sesion.weekday && c.end_time && aMinutos(c.end_time) > inicio)
    .sort((a, b) => Math.abs(aMinutos(a.start_time) - inicio) - Math.abs(aMinutos(b.start_time) - inicio))[0]
  return candidata ? { ...sesion, end_time: candidata.end_time } : sesion
}

// La API publica cada clase dos veces: como "última publicación" (copia vieja) y como semestre
// concreto (ej. "2026-2S"), con horarios que difieren levemente. Si hay semestre concreto se usa
// solo el más reciente; la "última publicación" queda de respaldo para las materias que no lo tienen.
export function sesionesVigentes(sesiones: Comision[]): Comision[] {
  const concretas = sesiones.filter(esSemestreConcreto)
  if (!concretas.length) return sinRepetidas(sesiones)

  const vigente = concretas.reduce((max, c) => ((c.semester ?? '') > max ? (c.semester ?? '') : max), '')
  const publicacionAnterior = sesiones.filter(c => !esSemestreConcreto(c))
  return sinRepetidas(
    concretas.filter(c => c.semester === vigente).map(c => completarFin(c, publicacionAnterior)),
  )
}

export function ordenarComisiones(comisiones: Comision[]): Comision[] {
  return sesionesVigentes(comisiones).sort(
    (a, b) => a.weekday - b.weekday || (a.start_time ?? '').localeCompare(b.start_time ?? ''),
  )
}

export function textoAula(c: Comision): string | null {
  const aulas = c.rooms.filter(Boolean).join(', ')
  if (!aulas) return null
  return c.campus ? `${aulas} (${c.campus})` : aulas
}
