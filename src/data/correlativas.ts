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
  // Requisito que no se puede expresar como una lista corta de materias.
  nota?: string
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

// Licenciatura en Ciencias de la Computación, Plan 2010 (Res. C.S. nº 246/10).
// El id de cada materia es su código oficial sin el prefijo "R-" (R-111 -> 111).
// El estado base de cada materia (libre, regular, aprobada) lo carga el usuario desde Perfil.
export const materiasLCC: MateriaBase[] = [
  // Primer año, 1º cuatrimestre
  { id: 111, code: 'R-111', name: 'Álgebra y Geometría Analítica I', year: 1, term: 1, correlativas: [] },
  { id: 112, code: 'R-112', name: 'Análisis Matemático I', year: 1, term: 1, correlativas: [] },
  { id: 113, code: 'R-113', name: 'Programación I', year: 1, term: 1, correlativas: [] },
  // Primer año, 2º cuatrimestre
  { id: 121, code: 'R-121', name: 'Álgebra y Geometría Analítica II', year: 1, term: 2, correlativas: [111] },
  { id: 122, code: 'R-122', name: 'Análisis Matemático II', year: 1, term: 2, correlativas: [112] },
  { id: 123, code: 'R-123', name: 'Programación II', year: 1, term: 2, correlativas: [113] },

  // Segundo año, 1º cuatrimestre
  { id: 211, code: 'R-211', name: 'Álgebra Lineal', year: 2, term: 1, correlativas: [121] },
  { id: 212, code: 'R-212', name: 'Estructura de Datos y Algoritmos I', year: 2, term: 1, correlativas: [123] },
  { id: 213, code: 'R-213', name: 'Lenguajes Formales y Computabilidad', year: 2, term: 1, correlativas: [123] },
  // Segundo año, 2º cuatrimestre
  { id: 221, code: 'R-221', name: 'Complementos de Matemática I', year: 2, term: 2, correlativas: [211, 212] },
  { id: 222, code: 'R-222', name: 'Arquitectura del Computador', year: 2, term: 2, correlativas: [212] },
  { id: 223, code: 'R-223', name: 'Lógica', year: 2, term: 2, correlativas: [123] },
  { id: 224, code: 'R-224', name: 'Métodos Numéricos', year: 2, term: 2, correlativas: [122, 211] },

  // Tercer año, 1º cuatrimestre
  { id: 311, code: 'R-311', name: 'Probabilidad y Estadística', year: 3, term: 1, correlativas: [122] },
  { id: 312, code: 'R-312', name: 'Estructuras de Datos y Algoritmos II', year: 3, term: 1, correlativas: [212, 221] },
  { id: 313, code: 'R-313', name: 'Análisis de Lenguajes de Programación', year: 3, term: 1, correlativas: [223] },
  { id: 314, code: 'R-314', name: 'Examen de Suficiencia de Inglés', year: 3, term: 1, correlativas: [] },
  // Tercer año, 2º cuatrimestre
  { id: 321, code: 'R-321', name: 'Modelos Físicos', year: 3, term: 2, correlativas: [311] },
  { id: 322, code: 'R-322', name: 'Sistemas Operativos I', year: 3, term: 2, correlativas: [223, 312, 313] },
  { id: 323, code: 'R-323', name: 'Comunicaciones', year: 3, term: 2, correlativas: [222] },
  { id: 324, code: 'R-324', name: 'Teoría de Bases de Datos', year: 3, term: 2, correlativas: [312, 223] },

  // Cuarto año, 1º cuatrimestre
  { id: 411, code: 'R-411', name: 'Ingeniería de Software I', year: 4, term: 1, correlativas: [223, 312, 314] },
  { id: 412, code: 'R-412', name: 'Sistemas Operativos II', year: 4, term: 1, correlativas: [222, 314, 322] },
  { id: 413, code: 'R-413', name: 'Introducción a la Inteligencia Artificial', year: 4, term: 1, correlativas: [223, 312, 314, 324] },
  // Cuarto año, 2º cuatrimestre
  { id: 421, code: 'R-421', name: 'Ingeniería del Software II', year: 4, term: 2, correlativas: [411] },
  { id: 422, code: 'R-422', name: 'Compiladores', year: 4, term: 2, correlativas: [213, 312, 313, 314] },
  { id: 423, code: 'R-423', name: 'Complementos de Matemática II', year: 4, term: 2, correlativas: [122, 211, 223, 314] },

  // Quinto año, 1º cuatrimestre
  { id: 511, code: 'R-511', name: 'Seguridad Informática', year: 5, term: 1, correlativas: [411] },
  {
    id: 512,
    code: 'R-512',
    name: 'Optativa I',
    year: 5,
    term: 1,
    correlativas: [],
    nota: 'Las correlativas dependen de la optativa elegida.',
  },
  {
    id: 513,
    code: 'R-513',
    name: 'Práctica Profesional',
    year: 5,
    term: 1,
    // Requiere todas las materias hasta el 7º cuatrimestre (4º año, 1º cuatrimestre) aprobadas o regularizadas.
    // Se listan solo las que no son correlativas de otra del mismo tramo; el resto queda cubierto en cadena.
    correlativas: [213, 224, 321, 323, 411, 412, 413],
    nota: 'Requiere todas las materias hasta el 7º cuatrimestre (4º año, 1º cuatrimestre) aprobadas o regularizadas.',
  },
  { id: 514, code: 'R-514', name: 'Taller de Tesina', year: 5, term: 1, correlativas: [] },
  // Quinto año, 2º cuatrimestre
  {
    id: 521,
    code: 'R-521',
    name: 'Optativa II',
    year: 5,
    term: 2,
    correlativas: [],
    nota: 'Las correlativas dependen de la optativa elegida.',
  },
  {
    id: 522,
    code: 'R-522',
    name: 'Optativa III',
    year: 5,
    term: 2,
    correlativas: [],
    nota: 'Las correlativas dependen de la optativa elegida.',
  },
  {
    id: 523,
    code: 'R-523',
    name: 'Tesina',
    year: 5,
    term: 2,
    // Requiere aprobadas todas las restantes materias; se listan las terminales del plan.
    correlativas: [421, 422, 423, 511, 512, 513, 514, 521, 522],
    nota: 'Requiere todas las restantes materias aprobadas.',
  },
]
