import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

// Los gráficos se dibujan en píxeles reales para que el texto no se deforme al escalar.
export function useAncho(elemento: Ref<HTMLElement | null>, inicial = 320) {
  const ancho = ref(inicial)
  let observador: ResizeObserver | null = null

  onMounted(() => {
    observador = new ResizeObserver(([entrada]) => {
      const w = entrada.contentRect.width
      if (w > 0) ancho.value = Math.round(w)
    })
    if (elemento.value) observador.observe(elemento.value)
  })
  onBeforeUnmount(() => observador?.disconnect())

  return ancho
}
