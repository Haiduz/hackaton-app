// Estado que marca el usuario sobre cada materia.
export type EstadoBase = 'libre' | 'regular' | 'aprobada'

// Estado que se muestra en el árbol. "cursable" y "no_cursable" se derivan de las correlativas.
export type EstadoMateria = 'aprobada' | 'regular' | 'cursable' | 'no_cursable'

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
  regular: { label: 'Regular', descripcion: 'Parciales aprobados, habilita el cursado de las siguientes' },
  cursable: { label: 'Cursable', descripcion: 'Todas sus correlativas están regulares o aprobadas' },
  no_cursable: { label: 'No cursable', descripcion: 'Le faltan correlativas regulares o aprobadas' },
}

export type MateriaBase = Omit<MateriaPlan, 'estado'>

export function calcularPlan(
  materias: MateriaBase[],
  estados: Record<number, EstadoBase | undefined>,
): MateriaPlan[] {
  const base = (id: number): EstadoBase => estados[id] ?? 'libre'
  const habilitaCursado = (id: number) => base(id) === 'regular' || base(id) === 'aprobada'

  return materias.map((m) => {
    const propio = base(m.id)
    const estado: EstadoMateria =
      propio !== 'libre' ? propio : m.correlativas.every(habilitaCursado) ? 'cursable' : 'no_cursable'
    return { ...m, estado }
  })
}

// El estado base de cada materia (libre, regular, aprobada) lo carga el usuario desde Perfil.
export const materiasLCC: MateriaBase[] = [
  { id: 1, name: 'Análisis Matemático I', code: 'AM1', year: 1, term: 1, correlativas: [] },
  { id: 2, name: 'Álgebra y Geometría Analítica I', code: 'AGA1', year: 1, term: 1, correlativas: [] },
  { id: 3, name: 'Programación I', code: 'PRO1', year: 1, term: 1, correlativas: [] },
  { id: 4, name: 'Elementos de Lógica y Matemática Discreta', code: 'ELMD', year: 1, term: 2, correlativas: [] },
  { id: 5, name: 'Análisis Matemático II', code: 'AM2', year: 1, term: 2, correlativas: [1] },
  { id: 6, name: 'Programación II', code: 'PRO2', year: 1, term: 2, correlativas: [3] },
  { id: 7, name: 'Álgebra y Geometría Analítica II', code: 'AGA2', year: 2, term: 1, correlativas: [2] },
  { id: 8, name: 'Estructuras de Datos y Algoritmos I', code: 'EDA1', year: 2, term: 1, correlativas: [4, 6] },
  { id: 9, name: 'Arquitectura del Computador', code: 'ARQ', year: 2, term: 1, correlativas: [3] },
  { id: 10, name: 'Probabilidad y Estadística', code: 'PYE', year: 2, term: 1, correlativas: [5] },
  { id: 11, name: 'Estructuras de Datos y Algoritmos II', code: 'EDA2', year: 2, term: 2, correlativas: [8] },
  { id: 12, name: 'Lenguajes Formales y Computabilidad', code: 'LFC', year: 2, term: 2, correlativas: [4] },
  { id: 13, name: 'Métodos Numéricos', code: 'MN', year: 2, term: 2, correlativas: [5, 7] },
  { id: 14, name: 'Sistemas Operativos I', code: 'SO1', year: 3, term: 1, correlativas: [8, 9] },
  { id: 15, name: 'Ingeniería de Software I', code: 'IS1', year: 3, term: 1, correlativas: [8] },
  { id: 16, name: 'Comunicación de Datos', code: 'CD', year: 3, term: 1, correlativas: [9] },
  { id: 17, name: 'Bases de Datos', code: 'BD', year: 3, term: 1, correlativas: [11] },
  { id: 18, name: 'Sistemas Operativos II', code: 'SO2', year: 3, term: 2, correlativas: [14] },
  { id: 19, name: 'Ingeniería de Software II', code: 'IS2', year: 3, term: 2, correlativas: [15] },
  { id: 20, name: 'Análisis de Lenguajes de Programación', code: 'ALP', year: 3, term: 2, correlativas: [11, 12] },
  { id: 21, name: 'Redes de Computadoras', code: 'RED', year: 3, term: 2, correlativas: [16] },
  { id: 22, name: 'Compiladores', code: 'COM', year: 4, term: 1, correlativas: [20] },
  { id: 23, name: 'Complejidad Computacional', code: 'CC', year: 4, term: 1, correlativas: [11, 12] },
  { id: 24, name: 'Inteligencia Artificial', code: 'IA', year: 4, term: 1, correlativas: [10, 11] },
  { id: 25, name: 'Sistemas Distribuidos', code: 'SD', year: 4, term: 2, correlativas: [18, 21] },
  { id: 26, name: 'Ingeniería de Software III', code: 'IS3', year: 4, term: 2, correlativas: [17, 19] },
  { id: 27, name: 'Seguridad Informática', code: 'SEG', year: 4, term: 2, correlativas: [21] },
  { id: 28, name: 'Modelos y Simulación', code: 'MYS', year: 5, term: 1, correlativas: [10, 13] },
  { id: 29, name: 'Tesina de Grado', code: 'TES', year: 5, term: 2, correlativas: [22, 25, 26] },
]
