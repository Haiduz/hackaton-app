// src/stores/materias.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Materia {
  id: number,
  name: string,
  code:string,
  year:number,
  term:number,
}

const CARRERA_ID = 1

// La API puede devolver el id de carrera plano o anidado
function obtenerCarreraId(item: any): number | undefined {
  const valor = item.career_id;
  return valor === undefined || valor === null ? undefined : Number(valor)
}

export const useMateriasStore = defineStore('materias', () => {
  const disponibles = ref<Materia[]>([]);
  const seleccionadas = ref<Materia[]>([]);

  const cargando = ref(false);
  const error = ref<string | null>(null);

  async function cargarDisponibles() {
    const url = import.meta.env.VITE_API_URL as string | undefined;

    if(!url) return;

    cargando.value = true;
    error.value = null;
    try {
      const res = await fetch(`${url}/subjects?career_id=1&kind=obligatoria`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const lista: any[] = Array.isArray(data) ? data : (data?.data ?? []);
      disponibles.value = lista
        .filter(item => obtenerCarreraId(item) === CARRERA_ID);
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
