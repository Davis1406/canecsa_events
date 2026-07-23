<template>
  <div class="flex-1 flex flex-col max-w-7xl w-full mx-auto overflow-hidden">
    <!-- Admin Bar -->
    <AdminBar title="Edit User">
      <router-link :to="{ name: 'Users' }" class="text-sm text-blue-600 hover:underline">Users</router-link>
      <span class="mx-2 text-sm text-gray-500">/</span>
      <span class="text-sm text-gray-700">Edit</span>
    </AdminBar>

    <!-- Page Title -->
    <div class="px-6 pt-4 pb-2">
      <h1 class="text-xl font-bold text-gray-800">Edit User</h1>
    </div>

    <!-- Edit User Form -->
    <main class="px-6 pb-6">
      <div class="w-full bg-white shadow rounded-lg p-6">
        <form @submit.prevent="submitForm" class="space-y-4" novalidate>
          <!-- Firstname -->
          <div class="mb-4 w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              v-model="user.firstname"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
              required
            />
          </div>

          <!-- Lastname -->
          <div class="mb-4 w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              v-model="user.lastname"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
              required
            />
          </div>

          <!-- Phone -->
          <div class="mb-4 w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              v-model="user.phone"
              type="tel"
              placeholder="+123456789"
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
              required
            />
          </div>

          <!-- Email -->
          <div class="mb-6 w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="user.email"
              type="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
              required
            />
          </div>

          <!-- Error message -->
          <div v-if="errorMsg" class="w-full md:w-1/2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {{ errorMsg }}
          </div>

          <!-- Buttons -->
          <div class="flex space-x-4 w-full md:w-1/2">
            <LoadingButton
              :loading="isSubmitting"
              :loadingLabel="'Updating...'"
              @click="submitForm"
            >
              Update User
            </LoadingButton>

            <router-link
              :to="{ name: 'Users' }"
              class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-xl transition"
            >
              Cancel
            </router-link>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminBar from '@/components/common/AdminBar.vue'
import LoadingButton from '@/components/common/LoadingButton.vue'
import api from '@/plugins/axios'

const route = useRoute()
const router = useRouter()
const userId = route.params.id

const user = ref({
  firstname: '',
  lastname: '',
  phone: '',
  email: ''
})

const isSubmitting = ref(false)
const errorMsg = ref('')

const fetchUser = async () => {
  try {
    const response = await api.get(`/users/${userId}`)
    user.value = response.data.user
  } catch (error) {
    console.error('Failed to fetch user:', error.response?.data || error.message)
  }
}

const submitForm = async () => {
  errorMsg.value = ''
  try {
    isSubmitting.value = true
    await api.put(`/users/${userId}`, user.value)
    router.push({ name: 'Users' })
  } catch (error) {
    errorMsg.value = error.response?.data?.detail || 'Failed to update user. Please try again.'
    console.error('Failed to update user:', error.response?.data || error.message)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchUser()
})
</script>
