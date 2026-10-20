type Nota = { frecuencia: number; inicio: number; duracion: number }

let contexto: AudioContext | null = null

function obtenerContexto(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!contexto) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    contexto = new Ctor()
  }
  return contexto
}

// Browsers only allow audio after a user gesture, so this must run from a click handler.
export function habilitarSonido() {
  const ctx = obtenerContexto()
  if (ctx && ctx.state === 'suspended') void ctx.resume()
}

function tocar(notas: Nota[], volumen = 0.25) {
  const ctx = obtenerContexto()
  if (!ctx) return
  if (ctx.state === 'suspended') void ctx.resume()
  const base = ctx.currentTime + 0.02
  for (const { frecuencia, inicio, duracion } of notas) {
    const osc = ctx.createOscillator()
    const ganancia = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = frecuencia
    const t0 = base + inicio
    ganancia.gain.setValueAtTime(0, t0)
    ganancia.gain.linearRampToValueAtTime(volumen, t0 + 0.02)
    ganancia.gain.exponentialRampToValueAtTime(0.0001, t0 + duracion)
    osc.connect(ganancia).connect(ctx.destination)
    osc.start(t0)
    osc.stop(t0 + duracion + 0.05)
  }
}

export function sonidoFinFoco() {
  tocar([
    { frecuencia: 659.25, inicio: 0, duracion: 0.9 },
    { frecuencia: 523.25, inicio: 0.35, duracion: 1.4 },
  ])
}

export function sonidoFinDescanso() {
  tocar(
    [
      { frecuencia: 880, inicio: 0, duracion: 0.25 },
      { frecuencia: 880, inicio: 0.3, duracion: 0.25 },
      { frecuencia: 1174.66, inicio: 0.6, duracion: 0.6 },
    ],
    0.22,
  )
}
