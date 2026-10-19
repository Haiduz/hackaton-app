// src/stores/materias.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Materia {
  id: number
  nombre: string
}

// Se usa mientras no esté definida VITE_MATERIAS_API_URL
const MATERIAS_DE_EJEMPLO: Materia[] = [
  { id: 1, nombre: 'Análisis Matemático I' },
  { id: 2, nombre: 'Álgebra y Geometría Analítica' },
  { id: 3, nombre: 'Algoritmos y Estructuras de Datos' },
  { id: 4, nombre: 'Física I' },
  { id: 5, nombre: 'Programación I' },
]

export const useMateriasStore = defineStore('materias', () => {
  const disponibles = ref<Materia[]>([]);
  const seleccionadas = ref<Materia[]>([]);

  const cargando = ref(false);
  const error = ref<string | null>(null);

  async function cargarDisponibles() {
    const url = import.meta.env.VITE_MATERIAS_API_URL as string | undefined;

    if (!url) {
      disponibles.value = MATERIAS_DE_EJEMPLO;
      return;
    }

    cargando.value = true;
    error.value = null;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      disponibles.value = await res.json();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar materias';
      disponibles.value = [];
    } finally {
      cargando.value = false;
    }
  }

  function toggleMateria(materia: Materia) {
    const idx = seleccionadas.value.findIndex(m => m.id === materia.id);
    if (idx >= 0) seleccionadas.value.splice(idx, 1);
    else seleccionadas.value.push(materia);
  }

  return { disponibles, seleccionadas, cargando, error, cargarDisponibles, toggleMateria };
})
