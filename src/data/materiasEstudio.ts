import type { MateriaEstudio } from '../utils/estudio'

// Paleta Okabe-Ito: distinguible con daltonismo. Dentro de un mismo año no se repite ningún tono.
// Plan completo de la LCC sin las optativas (512, 521 y 522), Práctica Profesional, Taller de Tesina, Tesina ni Examen de Inglés.
const AZUL = '#0072B2'
const NARANJA = '#E69F00'
const VERDE = '#009E73'
const ROSA = '#CC79A7'
const GRIS = '#4A4A4A'
const CELESTE = '#56B4E9'
const BERMELLON = '#D55E00'
const OCRE = '#8C6D1F'

export const MATERIAS_ESTUDIO: MateriaEstudio[] = [
  { id: 111, nombre: 'Álgebra y Geometría Analítica I', corto: 'AGA I', anio: 1, color: AZUL },
  { id: 112, nombre: 'Análisis Matemático I', corto: 'AM I', anio: 1, color: NARANJA },
  { id: 113, nombre: 'Programación I', corto: 'Prog I', anio: 1, color: VERDE },
  { id: 121, nombre: 'Álgebra y Geometría Analítica II', corto: 'AGA II', anio: 1, color: ROSA },
  { id: 122, nombre: 'Análisis Matemático II', corto: 'AM II', anio: 1, color: GRIS },
  { id: 123, nombre: 'Programación II', corto: 'Prog II', anio: 1, color: CELESTE },

  { id: 211, nombre: 'Álgebra Lineal', corto: 'Álg. Lineal', anio: 2, color: BERMELLON },
  { id: 212, nombre: 'Estructura de Datos y Algoritmos I', corto: 'EDyA I', anio: 2, color: AZUL },
  { id: 213, nombre: 'Lenguajes Formales y Computabilidad', corto: 'LFyC', anio: 2, color: OCRE },
  { id: 221, nombre: 'Complementos de Matemática I', corto: 'CM I', anio: 2, color: NARANJA },
  { id: 222, nombre: 'Arquitectura del Computador', corto: 'Arquitectura', anio: 2, color: VERDE },
  { id: 223, nombre: 'Lógica', corto: 'Lógica', anio: 2, color: ROSA },
  { id: 224, nombre: 'Métodos Numéricos', corto: 'Métodos', anio: 2, color: GRIS },

  { id: 311, nombre: 'Probabilidad y Estadística', corto: 'PyE', anio: 3, color: CELESTE },
  { id: 312, nombre: 'Estructuras de Datos y Algoritmos II', corto: 'EDyA II', anio: 3, color: BERMELLON },
  { id: 313, nombre: 'Análisis de Lenguajes de Programación', corto: 'ALP', anio: 3, color: OCRE },
  { id: 321, nombre: 'Modelos Físicos', corto: 'Mod. Físicos', anio: 3, color: AZUL },
  { id: 322, nombre: 'Sistemas Operativos I', corto: 'SO I', anio: 3, color: NARANJA },
  { id: 323, nombre: 'Comunicaciones', corto: 'Comunic.', anio: 3, color: VERDE },
  { id: 324, nombre: 'Teoría de Bases de Datos', corto: 'TBD', anio: 3, color: ROSA },

  { id: 411, nombre: 'Ingeniería de Software I', corto: 'IS I', anio: 4, color: AZUL },
  { id: 412, nombre: 'Sistemas Operativos II', corto: 'SO II', anio: 4, color: NARANJA },
  { id: 413, nombre: 'Introducción a la Inteligencia Artificial', corto: 'IIA', anio: 4, color: VERDE },
  { id: 421, nombre: 'Ingeniería del Software II', corto: 'IS II', anio: 4, color: ROSA },
  { id: 422, nombre: 'Compiladores', corto: 'Compiladores', anio: 4, color: CELESTE },
  { id: 423, nombre: 'Complementos de Matemática II', corto: 'CM II', anio: 4, color: BERMELLON },

  { id: 511, nombre: 'Seguridad Informática', corto: 'Seguridad', anio: 5, color: AZUL },
]
