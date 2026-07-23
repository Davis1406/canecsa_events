<template>
  <nav
    :class="[minimized ? 'w-16' : 'w-52', 'bg-catskill-white text-gray-600 flex flex-col min-h-screen transition-all duration-300 overflow-hidden']"
  >
    <!-- Logo -->
    <router-link :to="{ name: 'AdminDashboard' }" class="flex flex-col items-center justify-center py-4">
      <img v-if="!minimized" src="@/assets/canecsa-logo.png" alt="Logo" class="h-14 mb-1" />
      <img v-else src="@/assets/canecsa-logo.png" alt="Logo Icon" class="h-10" />
      <span
        v-if="!minimized"
        class="font-title font-black text-lg text-bondi-blue bg-clip-text"
      >
        CANECSA
      </span>
    </router-link>

    <!-- Navigation -->
    <div class="flex-1 px-2 space-y-6">
      <!-- General -->
      <div>
        <h3 v-if="!minimized" class="text-xs font-semibold text-gray-400 lowercase tracking-wide mb-2 px-3 select-none">
          general
        </h3>
        <ul>
          <li class="mb-1">
            <router-link
              :to="{ name: 'AdminDashboard' }"
              class="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded-2xl transition-colors"
              exact-active-class="bg-gray-300 text-gray-900 rounded-2xl"
            >
              <HomeIcon class="w-5 h-5" />
              <span v-if="!minimized" class="ml-3">Home</span>
            </router-link>
          </li>
        </ul>
      </div>

      <!-- Events -->
      <div>
        <h3 v-if="!minimized" class="text-xs font-semibold text-gray-400 lowercase tracking-wide mb-2 px-3 select-none">
          events
        </h3>
        <ul>
          <li v-if="auth.hasPermission('VIEW_ABSTRACTS')" class="mb-1">
            <router-link
              :to="{ name: 'AdminAbstracts' }"
              class="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded-2xl transition-colors"
              :class="isAbstractsActive ? 'bg-gray-300 text-gray-900 rounded-2xl' : ''"
            >
              <DocumentTextIcon class="w-5 h-5" />
              <span v-if="!minimized" class="ml-3">Abstracts</span>
            </router-link>
          </li>
          <li v-if="auth.hasPermission('MANAGE_REVIEWERS')" class="mb-1">
            <router-link
              :to="{ name: 'AdminReviewers' }"
              class="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded-2xl transition-colors"
              :class="isReviewersActive ? 'bg-gray-300 text-gray-900 rounded-2xl' : ''"
            >
              <UserGroupIcon class="w-5 h-5" />
              <span v-if="!minimized" class="ml-3">Reviewers</span>
            </router-link>
          </li>
          <li v-if="auth.hasPermission('VIEW_ABSTRACTS')" class="mb-1">
            <router-link
              :to="{ name: 'AdminTracks' }"
              class="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded-2xl transition-colors"
              :class="isTracksActive ? 'bg-gray-300 text-gray-900 rounded-2xl' : ''"
            >
              <TagIcon class="w-5 h-5" />
              <span v-if="!minimized" class="ml-3">Sub-Themes</span>
            </router-link>
          </li>
        </ul>
      </div>

      <!-- Settings (collapsible) -->
      <div>
        <!-- Section toggle -->
        <button @click="settingsOpen = !settingsOpen"
          class="w-full flex items-center px-3 py-1.5 mb-1 rounded-xl hover:bg-gray-100 transition-colors group">
          <AdjustmentsHorizontalIcon class="w-5 h-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
          <span v-if="!minimized" class="ml-3 text-xs font-semibold text-gray-400 lowercase tracking-wide flex-1 text-left group-hover:text-gray-600">
            settings
          </span>
          <svg v-if="!minimized" class="w-4 h-4 text-gray-400 transition-transform flex-shrink-0"
            :class="settingsOpen ? 'rotate-180' : ''"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>

        <ul v-show="settingsOpen || minimized">
          <li v-if="auth.hasPermission('VIEW_USER')" class="mb-1">
            <router-link
              :to="{ name: 'Users' }"
              class="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded-2xl transition-colors"
              :class="isUsersActive ? 'bg-gray-300 text-gray-900 rounded-2xl' : ''"
            >
              <UsersIcon class="w-5 h-5" />
              <span v-if="!minimized" class="ml-3">User Management</span>
            </router-link>
          </li>
          <li v-if="auth.hasPermission('VIEW_USER')" class="mb-1">
            <router-link
              :to="{ name: 'AdminActivity' }"
              class="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded-2xl transition-colors"
              :class="isActivityActive ? 'bg-gray-300 text-gray-900 rounded-2xl' : ''"
            >
              <ClockIcon class="w-5 h-5" />
              <span v-if="!minimized" class="ml-3">Activity Log</span>
            </router-link>
          </li>
          <li v-if="auth.hasPermission('VIEW_USER')" class="mb-1">
            <router-link
              :to="{ name: 'AdminEmailLogs' }"
              class="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded-2xl transition-colors"
              :class="isEmailLogsActive ? 'bg-gray-300 text-gray-900 rounded-2xl' : ''"
            >
              <EnvelopeIcon class="w-5 h-5" />
              <span v-if="!minimized" class="ml-3">Email Logs</span>
            </router-link>
          </li>
          <li v-if="auth.hasPermission('VIEW_USER')" class="mb-1">
            <router-link
              :to="{ name: 'IncompleteRegistrations' }"
              class="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded-2xl transition-colors"
              :class="route.name === 'IncompleteRegistrations' ? 'bg-gray-300 text-gray-900 rounded-2xl' : ''"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span v-if="!minimized" class="ml-3">Incomplete Reg.</span>
            </router-link>
          </li>
          <li v-if="auth.hasPermission('VIEW_ROLE')" class="mb-1">
            <router-link
              :to="{ name: 'Roles' }"
              class="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded-2xl transition-colors"
              :class="isRolesActive ? 'bg-gray-300 text-gray-900 rounded-2xl' : ''"
            >
              <ShieldCheckIcon class="w-5 h-5" />
              <span v-if="!minimized" class="ml-3">Access Roles</span>
            </router-link>
          </li>

        </ul>
      </div>

      <div>
        <!-- My Account Section Title -->
        <h3 v-if="!minimized" class="text-xs font-semibold text-gray-400 lowercase tracking-wide mb-2 px-3 select-none">
          pop into Your Account
        </h3>

        <!-- My Account Link -->
        <ul>
          <li class="mb-1">
            <router-link
              :to="{ name: 'MyDashboard' }"
              class="flex items-center px-3 py-2 rounded-2xl transition-colors
                     bg-blue-100 border-2 border-blue-400 text-blue-700 font-semibold
                     hover:bg-blue-200 hover:border-blue-500 shadow-md"
            >
              <UserCircleIcon class="w-5 h-5 text-blue-600" />
              <span v-if="!minimized" class="ml-3">My Account</span>
            </router-link>
          </li>
        </ul>

        <!-- Username Display -->
        <div v-if="!minimized && username" class="px-4 text-sm text-blue-800 font-medium mt-4">
          {{ username }}
        </div>

        <!-- Logout Button -->
        <ul>
          <li class="mb-1">
            <button
              @click="logout"
              :title="minimized ? 'Logout' : ''"
              class="flex items-center px-3 py-2 w-full text-red-600 hover:bg-red-100 hover:text-red-700 rounded-2xl transition-colors font-semibold"
            >
              <ArrowLeftOnRectangleIcon class="w-5 h-5" />
              <span v-if="!minimized" class="ml-3 hidden sm:inline">Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import {
  HomeIcon,
  UserCircleIcon,
  DocumentTextIcon,
  UsersIcon,
  ShieldCheckIcon,
  ArrowLeftOnRectangleIcon,
  UserGroupIcon,
  AdjustmentsHorizontalIcon,
  TagIcon,
  ClockIcon,
  EnvelopeIcon,
} from '@heroicons/vue/24/outline'

import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'

const props = defineProps({
  minimized: {
    type: Boolean,
    default: false,
  },
})

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const username = computed(() => auth.user?.firstname || 'User')

// Keep "Abstracts" highlighted for abstracts pages
const isAbstractsActive = computed(() =>
  ['AdminAbstracts', 'AdminAbstract'].includes(String(route.name))
)

const isTracksActive   = computed(() => route.name === 'AdminTracks')
const isActivityActive   = computed(() => route.name === 'AdminActivity')
const isEmailLogsActive  = computed(() => route.name === 'AdminEmailLogs')
const settingsOpen   = ref(false)

const isReviewersActive = computed(() => route.name === 'AdminReviewers')

// Keep "User Management" highlighted for list, view, add, and edit pages
const isUsersActive = computed(() =>
  ['Users', 'User', 'AddUser', 'EditUser'].includes(String(route.name))
)

// Keep "Access Roles" highlighted for list, view, add, and edit pages
const isRolesActive = computed(() =>
  ['Roles', 'Role', 'AddRole', 'EditRole'].includes(String(route.name))
)

// Auto-open settings section when any settings sub-route is active
const isSettingsRoute = computed(() =>
  isUsersActive.value || isActivityActive.value || isRolesActive.value || isEmailLogsActive.value
)
watch(isSettingsRoute, (active) => { if (active) settingsOpen.value = true }, { immediate: true })

const logout = () => {
  auth.logout()
  router.push({ name: 'Login' })
}
</script>
