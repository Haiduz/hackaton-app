<script setup lang="ts">
import { ref } from "vue"
import bottomNavigation from "./components/BottomNavBar.vue"
import Tree from "./components/views/Tree.vue"
import Profile from "./components/views/Profile.vue"

const activeTab = ref("tree")
</script>



<template>
  <div style="text-align: left;">
    <h2 style="margin-left: 1rem;">Hackaton App</h2>
    <hr>
  </div>
  <Tree v-if="activeTab === 'tree'" />
  <Profile v-else-if="activeTab === 'profile'" />
  <bottomNavigation v-model="activeTab"></bottomNavigation>
</template>
