<script setup lang="ts">
import { computed, ref, type Component } from "vue";
import { UserRound } from "lucide-vue-next";
import bottomNavigation from "./components/BottomNavBar.vue";
import Home from "./components/views/Home.vue";
import Timer from "./components/views/Timer.vue";
import Tree from "./components/views/Tree.vue";
import Stats from "./components/views/Stats.vue";
import Calendar from "./components/views/Calendar.vue";
import Subjects from "./components/views/Subjects.vue";

const views: Record<string, Component> = {
  inicio: Home,
  timer: Timer,
  tree: Tree,
  stats: Stats,
  calendar: Calendar,
  subjects: Subjects,
}

const activeTab = ref("inicio")
const activeView = computed(() => views[activeTab.value] ?? Home)
</script>

<template>
  <header class="app-header">
    <h2 class="app-title">Hackaton App</h2>
    <button
      type="button"
      class="subjects-button"
      :class="{ active: activeTab === 'subjects' }"
      aria-label="Perfil"
      :aria-current="activeTab === 'subjects' ? 'page' : undefined"
      @click="activeTab = 'subjects'"
    >
      <UserRound :size="20" :stroke-width="1.8" aria-hidden="true" />
      <span>Perfil</span>
    </button>
  </header>
  <main class="view-container">
    <KeepAlive>
      <component :is="activeView" :key="activeTab" />
    </KeepAlive>
  </main>
  <bottomNavigation v-model="activeTab"></bottomNavigation>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e5e5;
}

.app-title {
  margin: 0;
}

.subjects-button {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border: 1px solid #e5e5e5;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.subjects-button:hover {
  border-color: currentColor;
}

.subjects-button.active {
  background: #000;
  border-color: #000;
  color: #fff;
}
.view-container {
  padding: 1rem 1rem calc(64px + 1rem + env(safe-area-inset-bottom));
  text-align: left;
}
</style>
