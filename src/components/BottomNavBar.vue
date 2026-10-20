<script setup lang="ts">
import { ref } from "vue";

const activeTab = ref("inicio");

const tabs = [
  { id: "inicio", label: "Inicio", icon: "home" },
  { id: "timer", label: "Pomodoro", icon: "timer" },
  { id: "tree", label: "Arbol", icon: "tree" },
  { id: "stats", label: "Stats", icon: "stats" },
  { id: "calendar", label: "Calendario", icon: "calendar" },
  { id: "profile", label: "Perfil", icon: "profile" },
];

function selectTab(id: string) {
  activeTab.value = id;
}

import {
  ChartNoAxesColumnIncreasing,
  Timer,
  House,
  CalendarDays,
  UserRound,
  Network
} from "lucide-vue-next";
</script>

<template>
  <nav class="bottom-navigation" aria-label="Navegación principal">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="nav-item"
      :class="{ active: activeTab === tab.id }"
      :aria-label="tab.label"
      :aria-current="activeTab === tab.id ? 'page' : undefined"
      @click="selectTab(tab.id)"
    >
      <!-- Inicio -->
      <House v-if="tab.icon === 'home'"
      :size="24"
      :stroke-width="1.8"
      ></House>

      <!-- Pomodoro -->
      <Timer
        v-else-if="tab.icon === 'timer'"
        :size="24"
        :stroke-width="1.8"
      ></Timer>

      <!-- Árbol de materias -->
      <Network
        v-else-if="tab.icon === 'tree'"
        :size="24"
        :stroke-width="1.8"
      ></Network>

      <!-- Calendario -->
      <CalendarDays
        v-else-if="tab.icon === 'calendar'"
        :size="24"
        :stroke-width="1.8"
      ></CalendarDays>
      
      <!-- Estadísticas -->
      <ChartNoAxesColumnIncreasing
        v-else-if="tab.icon === 'stats'"
        :size="24"
        :stroke-width="1.8"
      ></ChartNoAxesColumnIncreasing>
      
      <!-- Perfil -->
      <UserRound
        v-else-if="tab.icon === 'profile'"
        :size="24"
        :stroke-width="1.8"
      ></UserRound>

      <span>{{ tab.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.bottom-navigation {
  position: sticky;
  bottom: 0;
  margin-top: auto;
  z-index: 1000;

  display: flex;
  justify-content: space-around;
  align-items: center;

  flex-shrink: 0;
  box-sizing: border-box;
  height: 64px;
  padding-bottom: env(safe-area-inset-bottom);

  background: #fff;
  border-top: 1px solid #e5e5e5;
}

.nav-item {
  flex: 1;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;

  border: none;
  background: transparent;
  color: #737373;

  font-size: 10px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.nav-item svg {
  width: 24px;
  height: 24px;

  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.nav-item.active {
  color: #000;
  font-weight: 600;
}

.nav-item:focus-visible {
  outline: 2px solid #0095f6;
  outline-offset: -4px;
  border-radius: 8px;
}
</style>
