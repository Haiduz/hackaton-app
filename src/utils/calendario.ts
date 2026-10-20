import type { Comision } from '../stores/materias'
import { aIsoLocal } from './fechas'

export interface EventoCalendario {
  id: number
  materiaId: number
  materia: string
  weekday: number
  inicio: number
  fin: number
  hue: number
  comision: Comision
}

export interface EventoPosicionado extends EventoCalendario {
  columna: number
  columnas: number
}

export interface Conflicto {
  weekday: number
  inicio: number
  fin: number
  a: EventoCalendario
  b: EventoCalendario
}

export function aMinutos(hora: string | null | undefined): number {
  if (!hora) return 0
  const [h, m] = hora.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export function formatearMinutos(minutos: number): string {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function weekdayDe(fecha: Date): number {
  return ((fecha.getDay() + 6) % 7) + 1
}

export function sumarDias(fecha: Date, dias: number): Date {
  const copia = new Date(fecha)
  copia.setDate(copia.getDate() + dias)
  return copia
}

export function inicioSemana(fecha: Date): Date {
  const copia = new Date(fecha)
  copia.setHours(0, 0, 0, 0)
  return sumarDias(copia, -(weekdayDe(copia) - 1))
}

export interface ExamenCalendario {
  id: number
  materiaId: number
  materia: string
  titulo: string
  clave: string // YYYY-MM-DD
  hora: string
  hue: number
}

export interface DiaMes {
  fecha: Date
  weekday: number
  clave: string
  delMes: boolean
}

export function claveFecha(fecha: Date): string {
  return aIsoLocal(fecha)
}

// Siempre devuelve el día 1, así evita desbordes (31 de enero + 1 mes).
export function sumarMeses(fecha: Date, meses: number): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth() + meses, 1)
}

// Semanas completas (lunes a domingo) que cubren el mes de `fecha`.
export function diasDelMes(fecha: Date): DiaMes[] {
  const primero = new Date(fecha.getFullYear(), fecha.getMonth(), 1)
  const diasEnMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate()
  const desfase = weekdayDe(primero) - 1
  const semanas = Math.ceil((desfase + diasEnMes) / 7)
  const inicio = sumarDias(primero, -desfase)
  return Array.from({ length: semanas * 7 }, (_, i) => {
    const dia = sumarDias(inicio, i)
    return {
      fecha: dia,
      weekday: (i % 7) + 1,
      clave: claveFecha(dia),
      delMes: dia.getMonth() === fecha.getMonth(),
    }
  })
}

export function mismoDia(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

// Reparte en columnas los eventos que se pisan dentro de un mismo día, como Google Calendar.
export function posicionar(eventos: EventoCalendario[]): EventoPosicionado[] {
  const orden = [...eventos].sort((a, b) => a.inicio - b.inicio || b.fin - a.fin)
  const resultado: EventoPosicionado[] = []
  let grupo: { evento: EventoCalendario; columna: number }[] = []
  let finColumnas: number[] = []
  let finGrupo = 0

  const cerrarGrupo = () => {
    const columnas = finColumnas.length
    for (const g of grupo) resultado.push({ ...g.evento, columna: g.columna, columnas })
    grupo = []
    finColumnas = []
  }

  for (const evento of orden) {
    if (grupo.length && evento.inicio >= finGrupo) cerrarGrupo()
    let columna = finColumnas.findIndex(fin => fin <= evento.inicio)
    if (columna === -1) {
      columna = finColumnas.length
      finColumnas.push(evento.fin)
    } else {
      finColumnas[columna] = evento.fin
    }
    grupo.push({ evento, columna })
    finGrupo = grupo.length === 1 ? evento.fin : Math.max(finGrupo, evento.fin)
  }
  cerrarGrupo()
  return resultado
}

// Solo cuenta superposiciones entre materias distintas.
export function detectarConflictos(eventos: EventoCalendario[]): Conflicto[] {
  const conflictos: Conflicto[] = []
  for (let i = 0; i < eventos.length; i++) {
    for (let j = i + 1; j < eventos.length; j++) {
      const a = eventos[i]
      const b = eventos[j]
      if (a.materiaId === b.materiaId || a.weekday !== b.weekday) continue
      const inicio = Math.max(a.inicio, b.inicio)
      const fin = Math.min(a.fin, b.fin)
      if (inicio < fin) conflictos.push({ weekday: a.weekday, inicio, fin, a, b })
    }
  }
  return conflictos.sort((x, y) => x.weekday - y.weekday || x.inicio - y.inicio)
}
