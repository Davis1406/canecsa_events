<!-- src/components/common/MyAccountSidebar.vue -->
<template>
  <aside class="p-4 md:p-6 w-full md:w-64 bg-white rounded-2xl shadow-md flex flex-col">
    <!-- Title -->
    <h2 class="text-2xl font-semibold text-black mb-8 flex items-center gap-2">
      <UserIcon class="w-6 h-6 text-bondi-blue" />
      My Account
    </h2>

    <!-- Nav Links -->
    <nav class="space-y-2 text-sm font-medium mb-10">
      <router-link
        :to="{ name: 'MyDashboard' }"
        class="flex items-center gap-3 px-4 py-2 rounded-xl transition hover:bg-gray-100"
        active-class="bg-gray-100 text-bondi-blue font-semibold"
      >
        <LayoutDashboardIcon class="w-5 h-5" />
        Dashboard
      </router-link>

      <router-link
        :to="{ name: 'MyAbstracts' }"
        class="flex items-center gap-3 px-4 py-2 rounded-xl transition hover:bg-gray-100"
        active-class="bg-gray-100 text-bondi-blue font-semibold"
      >
        <FileTextIcon class="w-5 h-5" />
        Abstracts
      </router-link>

      <router-link
        :to="{ name: 'MyAbstractPresentation' }"
        class="flex items-center gap-3 px-4 py-2 rounded-xl transition hover:bg-gray-100"
        active-class="bg-gray-100 text-bondi-blue font-semibold"
      >
        <PresentationIcon class="w-5 h-5" />
        Abstract Presentation
      </router-link>

      <router-link
        :to="{ name: 'MyReviews' }"
        class="flex items-center gap-3 px-4 py-2 rounded-xl transition hover:bg-gray-100"
        active-class="bg-gray-100 text-bondi-blue font-semibold"
      >
        <ClipboardListIcon class="w-5 h-5" />
        Reviews
      </router-link>

      <router-link
        :to="{ name: 'MyProfile' }"
        class="flex items-center gap-3 px-4 py-2 rounded-xl transition hover:bg-gray-100"
        active-class="bg-gray-100 text-bondi-blue font-semibold"
      >
        <UserCircleIcon class="w-5 h-5" />
        My Profile
      </router-link>

      <router-link
        :to="{ name: 'AdminDashboard' }"
        v-if="canViewAdminDashboard"
        class="flex items-center gap-3 px-4 py-2 rounded-xl
               bg-blue-100 border-2 border-blue-400 text-blue-700 font-semibold
               hover:bg-blue-200 hover:border-blue-500 shadow-md transition"
        active-class="bg-blue-300 text-blue-900 font-bold shadow-lg"
      >
        <ShieldIcon class="w-5 h-5 text-blue-600" />
        Events Admin
      </router-link>
    </nav>

    <!-- Logout -->
    <div class="mt-4 border-t pt-2 text-sm">
      <button
        @click="logout"
        class="flex items-center gap-2 text-red-600 hover:underline rounded-xl px-3 py-2 transition"
      >
        <LogOutIcon class="w-5 h-5" />
        <span class="hidden sm:inline">Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import {
  UserIcon,
  LayoutDashboardIcon,
  UserCircleIcon,
  LogOutIcon,
  ShieldIcon,
  FileTextIcon,
  ClipboardListIcon,
  PresentationIcon,
} from 'lucide-vue-next'
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from 'vue-router'

const auth = useAuthStore();
const router = useRouter()

function logout() {
  auth.logout()
  router.push({ name: 'Login' })
}

const canViewAdminDashboard = computed(() =>
  auth.hasPermission("ADMIN_DASHBOARD") ||
  auth.hasPermission("VIEW_STATS") ||
  auth.hasPermission("VIEW_ABSTRACTS") ||
  auth.hasPermission("VIEW_REGISTRATIONS") ||
  auth.hasPermission("MANAGE_REVIEWERS") ||
  auth.hasPermission("VERIFY_PAYMENT")
);
</script>
