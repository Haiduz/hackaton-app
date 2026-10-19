// src/stores/materias.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { materiasLCC, type EstadoMateria, type MateriaPlan } from '../data/correlativas'

export interface Materia {
  id: number
  nombre: string
}

export const useMateriasStore = defineStore('materias', () => {
  const disponibles = ref<Materia[]>([]);
  const seleccionadas = ref<Materia[]>([]);
  const estados = ref<Record<number, EstadoMateria>>({});

  const plan = computed<MateriaPlan[]>(() =>
    materiasLCC.map((m) => ({ ...m, estado: estados.value[m.id] ?? 'pendiente' })),
  );

  async function cargarDisponibles() {
    // Acá va tu llamada a la base de datos
    const res = await fetch('');
    disponibles.value = await res.json();
  }

  function toggleMateria(materia: Materia) {
    const idx = seleccionadas.value.findIndex(m => m.id === materia.id);
    if (idx >= 0) seleccionadas.value.splice(idx, 1);
    else seleccionadas.value.push(materia);
  }

  function setEstado(id: number, estado: EstadoMateria) {
    estados.value = { ...estados.value, [id]: estado };
  }

  return { disponibles, seleccionadas, estados, plan, cargarDisponibles, toggleMateria, setEstado };
})
