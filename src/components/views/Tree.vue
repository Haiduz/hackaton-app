<script setup lang="ts">
import CorrelativasGraph from '../correlativas/CorrelativasGraph.vue'
import { materiasLCC } from '../../data/correlativas'
</script>

<template>
  <CorrelativasGraph :materias="materiasLCC" />
</template>
