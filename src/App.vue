<script setup lang="ts">
import { computed, ref, type Component } from "vue"
import bottomNavigation from "./components/BottomNavBar.vue"
import Home from "./components/views/Home.vue"
import Timer from "./components/views/Timer.vue"
import Tree from "./components/views/Tree.vue"
import Stats from "./components/views/Stats.vue"
import Calendar from "./components/views/Calendar.vue"
import Profile from "./components/views/Profile.vue"

const views: Record<string, Component> = {
  inicio: Home,
  timer: Timer,
  tree: Tree,
  stats: Stats,
  calendar: Calendar,
  profile: Profile,
}

const activeTab = ref("inicio")
const activeView = computed(() => views[activeTab.value] ?? Home)
</script>

<template>
  <div style="text-align: left;">
    <h2 style="margin-left: 1rem;">Hackaton App</h2>
    <hr>
  </div>
  <main class="view-container">
    <KeepAlive>
      <component :is="activeView" :key="activeTab" />
    </KeepAlive>
  </main>
  <bottomNavigation v-model="activeTab"></bottomNavigation>
</template>

<style scoped>
.view-container {
  padding: 1rem 1rem calc(64px + 1rem + env(safe-area-inset-bottom));
  text-align: left;
}
</style>
