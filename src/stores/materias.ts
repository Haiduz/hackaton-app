// src/stores/materias.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { calcularPlan, materiasLCC, type EstadoBase, type MateriaPlan } from '../data/correlativas'

export interface Materia {
  id: number
  nombre: string
}

export const useMateriasStore = defineStore('materias', () => {
  const disponibles = ref<Materia[]>([]);
  const seleccionadas = ref<Materia[]>([]);
  // Estado base por id de materia. Las que no están acá son "libre".
  // Mock mientras Perfil no cargue los estados reales.
  const estados = ref<Record<number, EstadoBase>>({
    111: 'aprobada',
    112: 'aprobada',
    113: 'aprobada',
    121: 'aprobada',
    122: 'aprobada',
    123: 'aprobada',
    211: 'aprobada',
    212: 'aprobada',
    314: 'aprobada',
    213: 'regular',
    221: 'regular',
    222: 'regular',
    223: 'regular',
  });

  const plan = computed<MateriaPlan[]>(() => calcularPlan(materiasLCC, estados.value));

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

  function setEstado(id: number, estado: EstadoBase) {
    estados.value = { ...estados.value, [id]: estado };
  }

  return { disponibles, seleccionadas, estados, plan, cargarDisponibles, toggleMateria, setEstado };
})
