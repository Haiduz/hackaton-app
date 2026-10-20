import { onScopeDispose, ref } from 'vue'

function dosDigitos(n: number) {
  return String(n).padStart(2, '0')
}

// Formato YYYY-MM-DD en hora local, el que espera <input type="date">.
export function aIsoLocal(fecha: Date): string {
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`
}

// Fecha en formato dd/mm/aaaa: el input nativo de tipo date usa el formato del navegador y no se puede forzar.
export function enmascararFecha(texto: string): string {
  const digitos = texto.replace(/\D/g, '').slice(0, 8)
  if (digitos.length <= 2) return digitos
  if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`
}

// Devuelve YYYY-MM-DD, o null si el texto no es una fecha real (p. ej. 31/02/2026).
export function fechaLatinaAIso(texto: string): string | null {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto)
  if (!partes) return null
  const dia = Number(partes[1])
  const mes = Number(partes[2])
  const anio = Number(partes[3])
  const fecha = new Date(anio, mes - 1, dia)
  const valida = fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia
  return valida ? `${anio}-${dosDigitos(mes)}-${dosDigitos(dia)}` : null
}

export function isoAFechaLatina(iso: string): string {
  const [anio, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${anio}`
}

export type Urgencia = 'lejos' | 'medio' | 'cerca' | 'urgente'

// Verde lejos, amarillo a mitad de camino, naranja y rojo cuando se acerca.
export function urgenciaPorDias(dias: number): Urgencia {
  if (dias > 14) return 'lejos'
  if (dias >= 7) return 'medio'
  if (dias >= 3) return 'cerca'
  return 'urgente'
}

export function limitesFechaExamen(hoy = new Date()) {
  const dentroDeUnAnio = new Date(hoy)
  dentroDeUnAnio.setFullYear(hoy.getFullYear() + 1)
  return { min: aIsoLocal(hoy), max: aIsoLocal(dentroDeUnAnio) }
}

export function combinarFechaHora(fecha: string, hora: string): Date {
  const [anio, mes, dia] = fecha.split('-').map(Number)
  const [h, m] = (hora || '00:00').split(':').map(Number)
  return new Date(anio, mes - 1, dia, h, m)
}

export function validarFechaExamen(fecha: string, hora: string, ahora = new Date()): string | null {
  if (!fecha) return 'Elegí una fecha.'
  const { min, max } = limitesFechaExamen(ahora)
  if (fecha < min) return 'La fecha no puede ser anterior a hoy.'
  if (fecha > max) return 'La fecha no puede superar un año desde hoy.'
  if (combinarFechaHora(fecha, hora).getTime() <= ahora.getTime()) {
    return 'El horario ya pasó.'
  }
  return null
}

export interface Restante {
  dias: number
  horas: number
  minutos: number
  segundos: number
}

export function calcularRestante(objetivo: Date, ahora: Date): Restante | null {
  const ms = objetivo.getTime() - ahora.getTime()
  if (ms <= 0) return null
  const total = Math.floor(ms / 1000)
  return {
    dias: Math.floor(total / 86400),
    horas: Math.floor((total % 86400) / 3600),
    minutos: Math.floor((total % 3600) / 60),
    segundos: total % 60,
  }
}

export function restanteCorto(r: Restante): string {
  if (r.dias > 0) return `Faltan ${r.dias}d ${r.horas}h`
  if (r.horas > 0) return `Faltan ${r.horas}h ${r.minutos}m`
  return `Faltan ${r.minutos}m ${r.segundos}s`
}

// Un único intervalo compartido por todos los relojes de la app.
const ahora = ref(new Date())
let suscriptores = 0
let intervalo: ReturnType<typeof setInterval> | null = null

export function useAhora() {
  suscriptores++
  if (!intervalo) {
    ahora.value = new Date()
    intervalo = setInterval(() => (ahora.value = new Date()), 1000)
  }
  onScopeDispose(() => {
    suscriptores--
    if (suscriptores === 0 && intervalo) {
      clearInterval(intervalo)
      intervalo = null
    }
  })
  return ahora
}
