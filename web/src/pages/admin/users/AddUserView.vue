<template>
  <div class="flex-1 flex flex-col max-w-7xl w-full mx-auto overflow-hidden">
    <!-- Admin Bar -->
    <AdminBar title="Add User">
      <a href="#" class="text-sm text-blue-600 hover:underline">Users</a>
      <span class="mx-2 text-sm text-gray-500">/</span>
      <span class="text-sm text-gray-700">Add</span>
    </AdminBar>

    <!-- Page Title -->
    <div class="px-6 pt-4 pb-2">
      <h1 class="text-xl font-bold text-gray-800">Add User</h1>
    </div>

    <!-- Add User Form -->
    <main class="px-6 pb-6">
      <div class="w-full bg-white shadow rounded-lg p-6">
        <form @submit.prevent="submitUser" class="space-y-4" novalidate>
          <!-- First Name -->
          <div class="mb-4 w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              v-model="newUser.firstname"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
            />
            <p v-if="submitted && !newUser.firstname" class="text-sm text-red-500 mt-1">First name is required.</p>
          </div>

          <!-- Last Name -->
          <div class="mb-4 w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              v-model="newUser.lastname"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
            />
            <p v-if="submitted && !newUser.lastname" class="text-sm text-red-500 mt-1">Last name is required.</p>
          </div>

          <!-- Phone -->
          <div class="mb-4 w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              v-model="newUser.phone"
              type="tel"
              required
              placeholder="+1234567890"
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
            />
            <p v-if="submitted && !newUser.phone" class="text-sm text-red-500 mt-1">Phone number is required.</p>
          </div>

          <!-- Email -->
          <div class="mb-6 w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              v-model="newUser.email"
              type="email"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
            />
            <p v-if="submitted && !newUser.email" class="text-sm text-red-500 mt-1">Valid email is required.</p>
          </div>

          <!-- Buttons -->
          <div class="flex space-x-4 w-full md:w-1/2">
            <LoadingButton
              :loading="isSubmitting"
              :loadingLabel="'Saving...'"
              @click="submitUser"
            >
              Save User
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminBar from '@/components/common/AdminBar.vue'
import LoadingButton from '@/components/common/LoadingButton.vue'
import api from '@/plugins/axios'

const router = useRouter()
const newUser = ref({
  firstname: '',
  lastname: '',
  phone: '',
  email: ''
})

const isSubmitting = ref(false)
const submitted = ref(false)

const submitUser = async () => {
  submitted.value = true

  if (!newUser.value.firstname || !newUser.value.lastname || !newUser.value.phone || !newUser.value.email) {
    return
  }

  try {
    isSubmitting.value = true
    await api.post('/users/', newUser.value)
    router.push({ name: 'Users' })
  } catch (error) {
    console.error('Failed to create user:', error.response?.data || error.message)
  } finally {
    isSubmitting.value = false
  }
}
</script>
