import { ref, watch, type Ref } from 'vue'

const PREFIJO = 'caso_base:'

function leer<T>(clave: string): T | undefined {
  try {
    const guardado = localStorage.getItem(PREFIJO + clave)
    return guardado === null ? undefined : (JSON.parse(guardado) as T)
  } catch {
    return undefined
  }
}

function escribir(clave: string, valor: unknown) {
  try {
    localStorage.setItem(PREFIJO + clave, JSON.stringify(valor))
  } catch {
    // Storage lleno o deshabilitado (p. ej. modo privado): la app sigue funcionando en memoria.
  }
}

// Ref que se restaura desde localStorage al crearse y se guarda en cada cambio.
export function refPersistido<T>(clave: string, inicial: () => T): Ref<T> {
  const guardado = leer<T>(clave)
  const estado = ref(guardado === undefined ? inicial() : guardado) as Ref<T>
  watch(estado, valor => escribir(clave, valor), { deep: true, immediate: true })
  return estado
}

export function siguienteId(items: { id: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1
}
