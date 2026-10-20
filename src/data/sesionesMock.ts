import { clave, diaSemana, sumarDias, type MateriaEstudio, type Sesion } from '../utils/estudio'

// Paleta Okabe-Ito: distinguible con daltonismo. Dentro de un mismo año no se repite ningún tono.
export const MATERIAS_ESTUDIO: MateriaEstudio[] = [
  { id: 212, nombre: 'Estructura de Datos y Algoritmos I', corto: 'EDyA I', anio: 2, color: '#0072B2' },
  { id: 221, nombre: 'Complementos de Matemática I', corto: 'CM I', anio: 2, color: '#E69F00' },
  { id: 222, nombre: 'Arquitectura del Computador', corto: 'Arquitectura', anio: 2, color: '#009E73' },
  { id: 223, nombre: 'Lógica', corto: 'Lógica', anio: 2, color: '#CC79A7' },
  { id: 224, nombre: 'Métodos Numéricos', corto: 'Métodos', anio: 2, color: '#4A4A4A' },
  { id: 311, nombre: 'Probabilidad y Estadística', corto: 'PyE', anio: 3, color: '#56B4E9' },
  { id: 312, nombre: 'Estructuras de Datos y Algoritmos II', corto: 'EDyA II', anio: 3, color: '#D55E00' },
  { id: 313, nombre: 'Análisis de Lenguajes de Programación', corto: 'ALP', anio: 3, color: '#8C6D1F' },
]

// Primer cuatrimestre + mesas de julio, y luego el segundo cuatrimestre.
const MATERIAS_PRIMER_CUATRI = [312, 212, 311, 313, 223]
const MATERIAS_SEGUNDO_CUATRI = [224, 221, 222, 313, 223]

function mulberry32(semilla: number) {
  let a = semilla
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generarSesionesMock(hoy = new Date(), dias = 140): Sesion[] {
  const r = mulberry32(20260619)
  const hoy0 = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const sesiones: Sesion[] = []
  let id = 1
  let factorSemana = 1

  for (let d = sumarDias(hoy0, -dias); d <= hoy0; d = sumarDias(d, 1)) {
    const dow = diaSemana(d)
    if (dow === 0 || sesiones.length === 0) {
      const x = r()
      factorSemana = x < 0.18 ? 0.35 : x < 0.38 ? 1.35 : 1
    }

    const pBlanco = dow === 6 ? 0.35 : 0.13
    if (r() < pBlanco) continue

    const tipo = r()
    let horas = tipo < 0.14 ? 9 + r() * 3 : tipo < 0.55 ? 4 + r() * 3 : 0.8 + r() * 2.7
    horas = Math.min(horas * factorSemana, 12.5)
    if (horas < 0.4) continue

    const materias = d.getMonth() < 7 ? MATERIAS_PRIMER_CUATRI : MATERIAS_SEGUNDO_CUATRI
    const franja = r()
    let t =
      horas > 8 ? 7 * 60 + Math.floor(r() * 80)
      : franja < 0.5 ? 8 * 60 + Math.floor(r() * 150)
      : franja < 0.8 ? 14 * 60 + Math.floor(r() * 120)
      : 19 * 60 + Math.floor(r() * 90)

    const esHoy = d.getTime() === hoy0.getTime()
    const limite = esHoy ? hoy.getHours() * 60 + hoy.getMinutes() - 5 : 23 * 60 + 50
    let restante = horas * 60

    while (restante > 15) {
      const bloque = Math.min(restante, 45 + Math.floor(r() * 165))
      const pomodoro = r() < 0.55
      const span = pomodoro ? Math.round((bloque * 30) / 25) : Math.round(bloque)
      if (t + span > limite) break
      sesiones.push({
        id: id++,
        materiaId: materias[Math.floor(r() ** 1.3 * materias.length)],
        fecha: clave(d),
        inicio: t,
        fin: t + span,
        foco: Math.round(bloque * 60),
        modo: pomodoro ? 'pomodoro' : 'cronometro',
      })
      restante -= bloque
      t += span + 20 + Math.floor(r() * 70)
    }
  }
  return sesiones
}
