<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { X } from 'lucide-vue-next'

defineProps<{ titulo: string; descripcion?: string }>()
const abierto = defineModel<boolean>('abierto', { default: false })
const dialogo = ref<HTMLDialogElement | null>(null)

function sincronizar(valor: boolean) {
  const d = dialogo.value
  if (!d) return
  if (valor && !d.open) d.showModal()
  else if (!valor && d.open) d.close()
}

watch(abierto, sincronizar)
onMounted(() => sincronizar(abierto.value))
</script>

<template>
  <dialog
    ref="dialogo"
    class="modal"
    :aria-label="titulo"
    @close="abierto = false"
    @click.self="abierto = false"
  >
    <div class="contenido">
      <header class="cabecera">
        <h3>{{ titulo }}</h3>
        <button type="button" class="btn btn-icono btn-fantasma" aria-label="Cerrar" @click="abierto = false">
          <X :size="18" aria-hidden="true" />
        </button>
      </header>
      <p v-if="descripcion" class="descripcion">{{ descripcion }}</p>
      <slot />
      <footer v-if="$slots.acciones" class="acciones">
        <slot name="acciones" />
      </footer>
    </div>
  </dialog>
</template>

<style scoped>
.modal {
  width: min(440px, calc(100% - 2rem));
  max-height: calc(100svh - 3rem);
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: var(--bg);
  color: var(--text);
  box-shadow: var(--shadow);
  text-align: left;
}

.modal[open] {
  animation: entrar 0.18s ease-out;
}

.modal::backdrop {
  background: rgba(8, 6, 13, 0.45);
}

@keyframes entrar {
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
}

.contenido {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
}

.cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.cabecera h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-h);
}

.descripcion {
  margin: -0.5rem 0 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

.acciones {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
