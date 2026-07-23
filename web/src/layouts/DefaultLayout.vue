<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <Header v-if="route.name !== 'AbstractSubmission'" />

    <!-- Main Content -->
    <main class="flex flex-col flex-1 p-4 sm:p-6 lg:p-8">
      <div class="max-w-7xl flex flex-col flex-1 mx-auto w-full">
        <router-view />
      </div>
    </main>

    <!-- Footer — hidden on the Contact page -->
    <Footer v-if="route.name !== 'Contact' && route.name !== 'AbstractSubmission'" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import Header from '@/components/common/Header.vue'
import Footer from '@/components/common/Footer.vue'

const route = useRoute()
</script>
