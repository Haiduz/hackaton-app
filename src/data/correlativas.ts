export type EstadoMateria = 'pendiente' | 'regular' | 'aprobada' | 'libre'

export interface MateriaPlan {
  id: number
  name: string
  code: string
  year: number
  term: number
  estado: EstadoMateria
  correlativas: number[]
}

export const ESTADOS: Record<EstadoMateria, { label: string; descripcion: string }> = {
  aprobada: { label: 'Aprobada', descripcion: 'Final aprobado' },
  regular: { label: 'Regular', descripcion: 'Cursada aprobada, falta el final' },
  libre: { label: 'Libre', descripcion: 'Se rinde sin regularidad' },
  pendiente: { label: 'Pendiente', descripcion: 'Todavía sin cursar' },
}

export function estaHabilitada(materia: MateriaPlan, porId: Map<number, MateriaPlan>): boolean {
  return materia.correlativas.every((id) => porId.get(id)?.estado === 'aprobada')
}

// Datos mock del plan de LCC mientras se integra el backend.
export const materiasLCC: MateriaPlan[] = [
  { id: 1, name: 'Análisis Matemático I', code: 'AM1', year: 1, term: 1, estado: 'aprobada', correlativas: [] },
  { id: 2, name: 'Álgebra y Geometría Analítica I', code: 'AGA1', year: 1, term: 1, estado: 'aprobada', correlativas: [] },
  { id: 3, name: 'Programación I', code: 'PRO1', year: 1, term: 1, estado: 'aprobada', correlativas: [] },
  { id: 4, name: 'Elementos de Lógica y Matemática Discreta', code: 'ELMD', year: 1, term: 2, estado: 'aprobada', correlativas: [] },
  { id: 5, name: 'Análisis Matemático II', code: 'AM2', year: 1, term: 2, estado: 'aprobada', correlativas: [1] },
  { id: 6, name: 'Programación II', code: 'PRO2', year: 1, term: 2, estado: 'aprobada', correlativas: [3] },
  { id: 7, name: 'Álgebra y Geometría Analítica II', code: 'AGA2', year: 2, term: 1, estado: 'regular', correlativas: [2] },
  { id: 8, name: 'Estructuras de Datos y Algoritmos I', code: 'EDA1', year: 2, term: 1, estado: 'aprobada', correlativas: [4, 6] },
  { id: 9, name: 'Arquitectura del Computador', code: 'ARQ', year: 2, term: 1, estado: 'aprobada', correlativas: [3] },
  { id: 10, name: 'Probabilidad y Estadística', code: 'PYE', year: 2, term: 1, estado: 'libre', correlativas: [5] },
  { id: 11, name: 'Estructuras de Datos y Algoritmos II', code: 'EDA2', year: 2, term: 2, estado: 'regular', correlativas: [8] },
  { id: 12, name: 'Lenguajes Formales y Computabilidad', code: 'LFC', year: 2, term: 2, estado: 'aprobada', correlativas: [4] },
  { id: 13, name: 'Métodos Numéricos', code: 'MN', year: 2, term: 2, estado: 'pendiente', correlativas: [5, 7] },
  { id: 14, name: 'Sistemas Operativos I', code: 'SO1', year: 3, term: 1, estado: 'pendiente', correlativas: [8, 9] },
  { id: 15, name: 'Ingeniería de Software I', code: 'IS1', year: 3, term: 1, estado: 'pendiente', correlativas: [8] },
  { id: 16, name: 'Comunicación de Datos', code: 'CD', year: 3, term: 1, estado: 'pendiente', correlativas: [9] },
  { id: 17, name: 'Bases de Datos', code: 'BD', year: 3, term: 1, estado: 'pendiente', correlativas: [11] },
  { id: 18, name: 'Sistemas Operativos II', code: 'SO2', year: 3, term: 2, estado: 'pendiente', correlativas: [14] },
  { id: 19, name: 'Ingeniería de Software II', code: 'IS2', year: 3, term: 2, estado: 'pendiente', correlativas: [15] },
  { id: 20, name: 'Análisis de Lenguajes de Programación', code: 'ALP', year: 3, term: 2, estado: 'pendiente', correlativas: [11, 12] },
  { id: 21, name: 'Redes de Computadoras', code: 'RED', year: 3, term: 2, estado: 'pendiente', correlativas: [16] },
  { id: 22, name: 'Compiladores', code: 'COM', year: 4, term: 1, estado: 'pendiente', correlativas: [20] },
  { id: 23, name: 'Complejidad Computacional', code: 'CC', year: 4, term: 1, estado: 'pendiente', correlativas: [11, 12] },
  { id: 24, name: 'Inteligencia Artificial', code: 'IA', year: 4, term: 1, estado: 'pendiente', correlativas: [10, 11] },
  { id: 25, name: 'Sistemas Distribuidos', code: 'SD', year: 4, term: 2, estado: 'pendiente', correlativas: [18, 21] },
  { id: 26, name: 'Ingeniería de Software III', code: 'IS3', year: 4, term: 2, estado: 'pendiente', correlativas: [17, 19] },
  { id: 27, name: 'Seguridad Informática', code: 'SEG', year: 4, term: 2, estado: 'pendiente', correlativas: [21] },
  { id: 28, name: 'Modelos y Simulación', code: 'MYS', year: 5, term: 1, estado: 'pendiente', correlativas: [10, 13] },
  { id: 29, name: 'Tesina de Grado', code: 'TES', year: 5, term: 2, estado: 'pendiente', correlativas: [22, 25, 26] },
]
