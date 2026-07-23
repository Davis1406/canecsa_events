<template>
  <div class="space-y-8 flex-1">
    <!-- Title -->
    <h1 class="text-2xl text-black">
      Welcome back, <span class="font-semibold text-black">{{ user.name }}</span>!
    </h1>

    <!-- Error message -->
    <p v-if="error" class="text-red-600">{{ error }}</p>

    <!-- Loading -->
    <p v-if="loading" class="text-gray-600">Loading user data...</p>

    <!-- Profile Summary -->
    <div
      v-if="!loading && !error"
      class="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row gap-6 items-start"
    >
      <img
        :src="user.pictureUrl || defaultAvatar"
        alt="Profile Picture"
        class="w-28 h-28 rounded-full object-cover border border-gray-300"
        @error="$event.target.src = defaultAvatar"
      />
      <div>
        <h2 class="text-xl font-semibold text-black mb-2">{{ user.name }}</h2>
        <p class="text-gray-700">📧 {{ user.email }}</p>
        <p class="text-gray-700">📱 {{ user.phone }}</p>
      </div>
    </div>
  </div>
  </template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/plugins/axios'
import { useAuthStore } from '@/stores/auth'
import defaultAvatarImg from '@/assets/default-avatar.svg'

const auth = useAuthStore()

const user = ref({
  name: '',
  email: '',
  phone: '',
  pictureUrl: '',
})

const loading = ref(false)
const error = ref(null)
const defaultAvatar = defaultAvatarImg
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const fetchUser = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await api.get(`/users/${auth.user?.id}`)
    const data = res.data

    user.value = {
      name: `${data.user.firstname} ${data.user.lastname}`,
      email: data.user.email,
      phone: data.user.phone,
      pictureUrl: data.profile_picture?.profile_picture
        ? `${apiBaseUrl}/${data.profile_picture.profile_picture}`
        : defaultAvatar,
    }
  } catch (err) {
    error.value = 'Failed to load user details.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUser()
})
</script>

<style scoped>
/* Optional styling */
</style>
