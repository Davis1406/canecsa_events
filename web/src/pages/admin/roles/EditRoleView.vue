<template>
  <div class="flex-1 flex flex-col max-w-7xl w-full mx-auto overflow-hidden">
    <!-- Admin Bar -->
    <AdminBar title="Edit Role">
      <router-link :to="{ name: 'Roles' }" class="text-sm text-blue-600 hover:underline">Roles</router-link>
      <span class="mx-2 text-sm text-gray-500">/</span>
      <span class="text-sm text-gray-700">Edit</span>
    </AdminBar>

    <!-- Page Title -->
    <div class="px-6 pt-4 pb-2">
      <h1 class="text-xl font-bold text-gray-800">Edit Role</h1>
    </div>

    <!-- Edit Role Form -->
    <main class="px-6 pb-6">
      <div class="w-full bg-white shadow rounded-lg p-6">
        <form @submit.prevent="updateRole" class="space-y-4">
          <!-- Role Name -->
          <div class="mb-4 w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
            <input
              v-model="role.role"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
            />
          </div>

          <!-- Description -->
          <div class="mb-6 w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              v-model="role.description"
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
            ></textarea>
          </div>

          <!-- Buttons -->
          <div class="flex space-x-4 w-full md:w-1/2">
            <LoadingButton
              :loading="isSubmitting"
              :loadingLabel="'Updating...'"
              type="submit"
            >
              Update Role
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminBar from '@/components/common/AdminBar.vue'
import LoadingButton from '@/components/common/LoadingButton.vue'
import api from '@/plugins/axios'

const route = useRoute()
const router = useRouter()
const roleId = route.params.id

const role = ref({
  role: '',
  description: ''
})

const isSubmitting = ref(false)

const fetchRole = async () => {
  try {
    const response = await api.get(`/roles/${roleId}`)
    role.value = {
      role: response.data.role.role,
      description: response.data.role.description
    }
  } catch (error) {
    console.error('Error fetching role:', error.response?.data || error.message)
  }
}

const updateRole = async () => {
  console.log('Updating role:', role.value)
  try {
    isSubmitting.value = true
    await api.put(`/roles/${roleId}`, role.value)
    router.push({ name: 'Roles' })
  } catch (error) {
    console.error('Error updating role:', error.response?.data || error.message)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(fetchRole)
</script>
