<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowRight, Check, Lock, X } from 'lucide-vue-next'
import type { MateriaPlan } from '../../data/correlativas'
import { ESTADOS, estaHabilitada } from '../../data/correlativas'

const props = defineProps<{
  materia: MateriaPlan | null
  materias: MateriaPlan[]
}>()

const emit = defineEmits<{ close: [] }>()

const dialogRef = ref<HTMLDialogElement | null>(null)

const porId = computed(() => new Map(props.materias.map((m) => [m.id, m])))

const correlativas = computed(() =>
  (props.materia?.correlativas ?? []).map((id) => porId.value.get(id)).filter((m): m is MateriaPlan => !!m),
)

const habilita = computed(() =>
  props.materia ? props.materias.filter((m) => m.correlativas.includes(props.materia!.id)) : [],
)

const habilitada = computed(() => (props.materia ? estaHabilitada(props.materia, porId.value) : false))

watch(
  () => props.materia,
  (materia) => {
    const dialog = dialogRef.value
    if (!dialog) return
    if (materia && !dialog.open) dialog.showModal()
    if (!materia && dialog.open) dialog.close()
  },
  { flush: 'post' },
)

function onBackdropClick(event: MouseEvent) {
  if (event.target === dialogRef.value) emit('close')
}
</script>

<template>
  <dialog
    ref="dialogRef"
    class="materia-dialog"
    aria-labelledby="materia-dialog-titulo"
    @close="emit('close')"
    @click="onBackdropClick"
  >
    <div v-if="materia" class="contenido" :class="`estado-${materia.estado}`">
      <header class="encabezado">
        <div class="titulos">
          <span class="meta">{{ materia.code }} · {{ materia.year }}º año, {{ materia.term }}º cuatrimestre</span>
          <h2 id="materia-dialog-titulo">{{ materia.name }}</h2>
        </div>
        <button class="cerrar" type="button" aria-label="Cerrar" @click="emit('close')">
          <X :size="20" aria-hidden="true" />
        </button>
      </header>

      <div class="estado-fila">
        <span class="estado-badge">{{ ESTADOS[materia.estado].label }}</span>
        <span class="estado-desc">{{ ESTADOS[materia.estado].descripcion }}</span>
      </div>

      <p v-if="materia.estado === 'pendiente'" class="aviso" :class="{ ok: habilitada }">
        <Check v-if="habilitada" :size="16" aria-hidden="true" />
        <Lock v-else :size="16" aria-hidden="true" />
        {{ habilitada ? 'Tenés todas las correlativas aprobadas. Podés cursarla.' : 'Te faltan correlativas para cursarla.' }}
      </p>

      <section class="bloque">
        <h3>Correlativas necesarias</h3>
        <p v-if="!correlativas.length" class="vacio">No requiere correlativas.</p>
        <ul v-else>
          <li v-for="c in correlativas" :key="c.id" :class="`estado-${c.estado}`">
            <span class="punto" aria-hidden="true" />
            <span class="item-nombre">{{ c.name }}</span>
            <span class="item-estado">{{ ESTADOS[c.estado].label }}</span>
          </li>
        </ul>
      </section>

      <section class="bloque">
        <h3>Habilita</h3>
        <p v-if="!habilita.length" class="vacio">No es correlativa de otra materia.</p>
        <ul v-else>
          <li v-for="h in habilita" :key="h.id" :class="`estado-${h.estado}`">
            <ArrowRight :size="14" class="flecha" aria-hidden="true" />
            <span class="item-nombre">{{ h.name }}</span>
            <span class="item-estado">{{ h.code }}</span>
          </li>
        </ul>
      </section>
    </div>
  </dialog>
</template>

<style scoped>
.materia-dialog {
  width: min(440px, calc(100vw - 24px));
  max-height: calc(100svh - 48px);
  padding: 0;
  border: 1px solid var(--c-borde);
  border-radius: 16px;
  background: var(--c-superficie);
  color: var(--c-tinta);
  box-shadow: 0 24px 48px rgba(20, 33, 61, 0.22);
  text-align: left;
}

.materia-dialog::backdrop {
  background: rgba(20, 33, 61, 0.45);
}

@media (max-width: 560px) {
  .materia-dialog {
    margin: auto 0 0;
    width: 100%;
    max-width: 100%;
    border-radius: 16px 16px 0 0;
    padding-bottom: env(safe-area-inset-bottom);
  }
}

.contenido {
  --tono: var(--c-pendiente);
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px;
}

.estado-aprobada { --tono: var(--c-aprobada); }
.estado-regular { --tono: var(--c-regular); }
.estado-libre { --tono: var(--c-libre); }

.encabezado {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.titulos {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--c-tinta-suave);
}

h2 {
  margin: 0;
  font-size: 20px;
  line-height: 1.25;
  color: var(--c-tinta);
  text-wrap: balance;
}

.cerrar {
  display: inline-flex;
  padding: 6px;
  border: 1px solid var(--c-borde);
  border-radius: 8px;
  background: transparent;
  color: var(--c-tinta);
  cursor: pointer;
}

.cerrar:focus-visible {
  outline: 2px solid var(--c-tinta);
  outline-offset: 2px;
}

.estado-fila {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.estado-badge {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: var(--tono);
  background: color-mix(in srgb, var(--tono) 14%, transparent);
}

.estado-desc {
  font-size: 14px;
  color: var(--c-tinta-suave);
}

.aviso {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.4;
  background: var(--c-fondo);
  color: var(--c-tinta-suave);
}

.aviso.ok {
  color: var(--c-aprobada);
  background: color-mix(in srgb, var(--c-aprobada) 10%, transparent);
}

.bloque {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

h3 {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--c-tinta-suave);
}

ul {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

li {
  --tono: var(--c-pendiente);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid var(--c-borde);
  border-radius: 8px;
  font-size: 14px;
}

.punto {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--tono);
}

.flecha {
  flex-shrink: 0;
  color: var(--c-tinta-suave);
}

.item-nombre {
  flex: 1;
  color: var(--c-tinta);
}

.item-estado {
  font-size: 12px;
  font-weight: 600;
  color: var(--tono);
}

.vacio {
  margin: 0;
  font-size: 14px;
  color: var(--c-tinta-suave);
}
</style>
