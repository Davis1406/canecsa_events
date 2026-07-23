<template>
  <header class="bg-white text-gray-800 p-4 shadow font-roboto">
    <div class="mx-auto max-w-7xl flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
      <!-- Logo + Title -->
      <div class="flex items-center gap-4">
        <router-link :to="{ name: 'Home' }" class="flex items-center space-x-3">
          <img src="@/assets/canecsa-logo.png" alt="CANECSA Logo" class="h-auto w-14 object-contain" />
          <span class="font-title font-black text-2xl text-bondi-blue bg-clip-text">
            CANECSA <span class="text-lg font-bold text-gray-500">- Abstracts</span>
          </span>
        </router-link>
      </div>

      <!-- Mobile Menu Toggle -->
      <button
        class="md:hidden text-3xl"
        @click="isMenuOpen = !isMenuOpen"
        aria-label="Toggle navigation"
      >
        ☰
      </button>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex items-center space-x-6">
        <router-link
          :to="{ name: 'AbstractSubmission' }"
          class="pb-0.5 hover:text-bondi-blue transition-colors"
          active-class="text-bondi-blue font-semibold border-b-2 border-bondi-blue"
        >Abstract Submission</router-link>

        <router-link
          :to="{ name: 'Contact' }"
          class="pb-0.5 hover:text-bondi-blue transition-colors"
          active-class="text-bondi-blue font-semibold border-b-2 border-bondi-blue"
        >Contact Us</router-link>

        <template v-if="auth.isAuthenticated">
          <router-link
            :to="{ name: 'MyDashboard' }"
            class="font-semibold px-4 py-2 rounded-full border-2 transition"
            :class="isMyAccountActive
              ? 'bg-bondi-blue text-white border-bondi-blue'
              : 'text-bondi-blue border-bondi-blue hover:bg-bondi-blue/10'"
          >
            {{ auth.user?.first_name || 'My Account' }}
          </router-link>
        </template>
        <template v-else>
        <router-link
          :to="{ name: 'Login' }"
          class="bg-white text-bondi-blue font-semibold px-4 py-2 rounded-full border-2 border-bondi-blue hover:bg-bondi-blue/10 transition"
        >
          Login
        </router-link>
      </template>
    </nav>
  </div>

  <!-- Mobile Navigation -->
  <div v-if="isMenuOpen" class="md:hidden mt-4 space-y-4 text-center">
    <router-link
      :to="{ name: 'AbstractSubmission' }"
      class="block hover:text-bondi-blue transition-colors py-1"
      active-class="text-bondi-blue font-semibold"
    >Abstract Submission</router-link>

    <router-link
      :to="{ name: 'Contact' }"
      class="block hover:text-bondi-blue transition-colors py-1"
      active-class="text-bondi-blue font-semibold"
    >Contact Us</router-link>

    <template v-if="auth.isAuthenticated">
      <router-link
        :to="{ name: 'MyDashboard' }"
        class="inline-block font-semibold px-4 py-2 rounded-full border-2 transition"
        :class="isMyAccountActive
          ? 'bg-bondi-blue text-white border-bondi-blue'
          : 'text-bondi-blue border-bondi-blue hover:bg-bondi-blue/10'"
      >
        {{ auth.user?.first_name || 'My Account' }}
      </router-link>
    </template>
    <template v-else>
      <router-link
        :to="{ name: 'Login' }"
        class="inline-block bg-white text-bondi-blue font-semibold px-4 py-2 rounded-full border-2 border-bondi-blue hover:bg-bondi-blue/10 transition"
      >
        Login
      </router-link>
    </template>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const isMenuOpen = ref(false)
const auth = useAuthStore()
const route = useRoute()

// "My Account" button stays filled/active on any /my-account sub-page
const isMyAccountActive = computed(() =>
  String(route.path).startsWith('/my-account')
)

onMounted(() => {
  auth.loadFromStorage()
})
</script>
