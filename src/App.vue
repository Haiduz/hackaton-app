<script setup lang="ts">
import { ref } from "vue"
import bottomNavigation from "./components/BottomNavBar.vue"
import Tree from "./components/views/Tree.vue"

const activeTab = ref("tree")
</script>



<template>
  <div style="text-align: left;">
    <h2 style="margin-left: 1rem;">Hackaton App</h2>
    <hr>
  </div>
  <Tree v-if="activeTab === 'tree'" />
  <bottomNavigation v-model="activeTab"></bottomNavigation>
</template>
