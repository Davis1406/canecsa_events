<template>
  <div class="flex-1 flex flex-col max-w-7xl w-full mx-auto overflow-hidden">
    <AdminBar title="Edit Cluster">
      <router-link :to="{ name: 'Clusters' }" class="text-sm text-blue-600 hover:underline">Clusters</router-link>
      <span class="mx-2 text-sm text-gray-500">/</span>
      <span class="text-sm text-gray-700">Edit</span>
    </AdminBar>

    <div class="px-6 pt-4 pb-2">
      <h1 class="text-xl font-bold text-gray-800">Edit Cluster</h1>
    </div>

    <main class="px-6 pb-6">
      <div class="w-full bg-white shadow rounded-lg p-6">
        <form @submit.prevent="updateCluster" class="space-y-4">
          <!-- Name -->
          <div class="w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input v-model="cluster.name" type="text" required
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]" />
          </div>

          <!-- Type -->
          <div class="w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select v-model="cluster.type" required
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]">
              <option disabled value="">Select a type</option>
              <option value="secretariat">Secretariat</option>
              <option value="college">College</option>
              <option value="project">Project</option>
              <option value="programme">Programme</option>
              <option value="directorate">Directorate</option>
              <option value="department">Department</option>
            </select>
          </div>

          <!-- Description -->
          <div class="w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea v-model="cluster.description" rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"></textarea>
          </div>

          <!-- Brand Colors -->
          <div class="w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Brand Colors</label>
            <div class="flex gap-6 items-center">
              <div>
                <label class="block text-xs text-gray-500 mb-1">Primary Color</label>
                <div class="flex items-center gap-2">
                  <input type="color" v-model="cluster.primary_color" class="h-10 w-14 rounded cursor-pointer border border-gray-300" />
                  <span class="text-sm text-gray-600 font-mono">{{ cluster.primary_color }}</span>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">Secondary Color</label>
                <div class="flex items-center gap-2">
                  <input type="color" v-model="cluster.secondary_color" class="h-10 w-14 rounded cursor-pointer border border-gray-300" />
                  <span class="text-sm text-gray-600 font-mono">{{ cluster.secondary_color }}</span>
                </div>
              </div>
            </div>
            <div class="mt-3 h-10 rounded-xl flex overflow-hidden">
              <div class="flex-1" :style="{ backgroundColor: cluster.primary_color }"></div>
              <div class="flex-1" :style="{ backgroundColor: cluster.secondary_color }"></div>
            </div>
          </div>

          <!-- Logo Upload -->
          <div class="w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Logo</label>
            <div v-if="existingLogo" class="mb-2">
              <img :src="`${baseUrl}/${existingLogo}`" alt="Current logo" class="h-16 object-contain rounded border border-gray-200" />
              <p class="text-xs text-gray-400 mt-1">Current logo — upload a new one to replace it</p>
            </div>
            <input type="file" accept="image/*" @change="onLogoChange"
              class="w-full text-sm text-gray-600 border border-gray-300 rounded-xl px-3 py-2" />
            <div v-if="logoPreview" class="mt-3">
              <img :src="logoPreview" alt="Logo preview" class="h-20 object-contain rounded border border-gray-200" />
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex space-x-4 w-full md:w-1/2">
            <LoadingButton :loading="isSubmitting" :loadingLabel="'Updating...'" @click="updateCluster">
              Update Cluster
            </LoadingButton>
            <router-link :to="{ name: 'Clusters' }" class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-xl transition">
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

const baseUrl = import.meta.env.VITE_API_BASE_URL
const route = useRoute()
const router = useRouter()
const clusterId = route.params.id

const cluster = ref({ name: '', type: '', description: '', primary_color: '#1a1d56', secondary_color: '#f59d08' })
const existingLogo = ref(null)
const logoFile = ref(null)
const logoPreview = ref(null)
const isSubmitting = ref(false)

const onLogoChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  logoFile.value = file
  logoPreview.value = URL.createObjectURL(file)
}

const fetchCluster = async () => {
  try {
    const response = await api.get(`/org_units/${clusterId}`)
    cluster.value = {
      ...response.data,
      type: response.data.type?.toLowerCase() || '',
      primary_color: response.data.primary_color || '#1a1d56',
      secondary_color: response.data.secondary_color || '#f59d08',
    }
    existingLogo.value = response.data.logo || null
  } catch (error) {
    console.error('Error fetching cluster:', error.response?.data || error.message)
  }
}

const updateCluster = async () => {
  try {
    isSubmitting.value = true
    await api.put(`/org_units/${clusterId}`, {
      name: cluster.value.name,
      type: cluster.value.type.toLowerCase(),
      description: cluster.value.description,
      primary_color: cluster.value.primary_color,
      secondary_color: cluster.value.secondary_color,
    })

    if (logoFile.value) {
      const formData = new FormData()
      formData.append('file', logoFile.value)
      await api.post(`/org_units/upload_logo/${clusterId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }

    router.push({ name: 'Clusters' })
  } catch (error) {
    console.error('Error updating cluster:', error.response?.data || error.message)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(fetchCluster)
</script>
