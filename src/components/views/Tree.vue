<script setup lang="ts">
import CorrelativasGraph from '../correlativas/CorrelativasGraph.vue'
import { useMateriasStore } from '../../stores/materias'

const store = useMateriasStore()
</script>

<template>
  <CorrelativasGraph :materias="store.plan" />
</template>
