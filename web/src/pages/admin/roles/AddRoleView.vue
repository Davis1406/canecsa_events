<template>
  <div class="flex-1 flex flex-col max-w-7xl w-full mx-auto overflow-hidden">
    <!-- Admin Bar -->
    <AdminBar title="Add Role">
      <a href="#" class="text-sm text-blue-600 hover:underline">Roles</a>
      <span class="mx-2 text-sm text-gray-500">/</span>
      <span class="text-sm text-gray-700">Add</span>
    </AdminBar>

    <!-- Page Title -->
    <div class="px-6 pt-4 pb-2">
      <h1 class="text-xl font-bold text-gray-800">Add Role</h1>
    </div>

    <!-- Add Role Form -->
    <main class="px-6 pb-6">
      <div class="w-full bg-white shadow rounded-lg p-6">
        <form @submit.prevent="submitRole" class="space-y-4" novalidate>
          <!-- Role Field -->
          <div class="mb-4 w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              v-model="newRole.role"
              type="text"
              required
              autofocus
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
            />
            <p v-if="submitted && !newRole.role" class="text-sm text-red-500 mt-1">Role is required.</p>
          </div>

          <!-- Description Field -->
          <div class="mb-6 w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              v-model="newRole.description"
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
            ></textarea>
          </div>

          <!-- Buttons -->
          <div class="flex space-x-4 w-full md:w-1/2">
            <LoadingButton
              :loading="isSubmitting"
              :loadingLabel="'Saving...'"
              @click="submitRole"
            >
              Save Role
            </LoadingButton>

            <router-link
              :to="{ name: 'Roles' }"
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
const newRole = ref({
  role: '',
  description: ''
})

const isSubmitting = ref(false)
const submitted = ref(false)

const submitRole = async () => {
  submitted.value = true

  if (!newRole.value.role) {
    return
  }

  try {
    isSubmitting.value = true
    await api.post('/roles/', newRole.value)
    router.push({ name: 'Roles' })
  } catch (error) {
    console.error('Failed to create role:', error.response?.data || error.message)
  } finally {
    isSubmitting.value = false
  }
}
</script>
