// src/stores/materias.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Materia {
  id: number
  nombre: string
}

export const useMateriasStore = defineStore('materias', () => {
  const disponibles = ref<Materia[]>([]);
  const seleccionadas = ref<Materia[]>([]);

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

  return { disponibles, seleccionadas, cargarDisponibles, toggleMateria };
})