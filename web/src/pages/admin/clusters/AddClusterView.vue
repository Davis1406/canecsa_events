<template>
  <div class="flex-1 flex flex-col max-w-7xl w-full mx-auto overflow-hidden">
    <AdminBar title="Add Cluster">
      <a href="#" class="text-sm text-blue-600 hover:underline">Clusters</a>
      <span class="mx-2 text-sm text-gray-500">/</span>
      <span class="text-sm text-gray-700">Add</span>
    </AdminBar>

    <div class="px-6 pt-4 pb-2">
      <h1 class="text-xl font-bold text-gray-800">Add Cluster</h1>
    </div>

    <main class="px-6 pb-6">
      <div class="w-full bg-white shadow rounded-lg p-6">
        <form @submit.prevent="submitCluster" class="space-y-4" novalidate>
          <!-- Name -->
          <div class="w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input v-model="newCluster.name" type="text" required autofocus
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]" />
            <p v-if="submitted && !newCluster.name" class="text-sm text-red-500 mt-1">Name is required.</p>
          </div>

          <!-- Type -->
          <div class="w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select v-model="newCluster.type" required
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]">
              <option disabled value="">Select a type</option>
              <option v-for="type in clusterTypes" :key="type" :value="type.toLowerCase()">{{ type }}</option>
            </select>
            <p v-if="submitted && !newCluster.type" class="text-sm text-red-500 mt-1">Type is required.</p>
          </div>

          <!-- Description -->
          <div class="w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea v-model="newCluster.description" rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"></textarea>
          </div>

          <!-- Brand Colors -->
          <div class="w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Brand Colors</label>
            <div class="flex gap-6 items-center">
              <div>
                <label class="block text-xs text-gray-500 mb-1">Primary Color</label>
                <div class="flex items-center gap-2">
                  <input type="color" v-model="newCluster.primary_color" class="h-10 w-14 rounded cursor-pointer border border-gray-300" />
                  <span class="text-sm text-gray-600 font-mono">{{ newCluster.primary_color }}</span>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">Secondary Color</label>
                <div class="flex items-center gap-2">
                  <input type="color" v-model="newCluster.secondary_color" class="h-10 w-14 rounded cursor-pointer border border-gray-300" />
                  <span class="text-sm text-gray-600 font-mono">{{ newCluster.secondary_color }}</span>
                </div>
              </div>
            </div>
            <!-- Color Preview -->
            <div class="mt-3 h-10 rounded-xl flex overflow-hidden">
              <div class="flex-1" :style="{ backgroundColor: newCluster.primary_color }"></div>
              <div class="flex-1" :style="{ backgroundColor: newCluster.secondary_color }"></div>
            </div>
          </div>

          <!-- Logo Upload -->
          <div class="w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Logo</label>
            <input type="file" accept="image/*" @change="onLogoChange" class="w-full text-sm text-gray-600 border border-gray-300 rounded-xl px-3 py-2" />
            <div v-if="logoPreview" class="mt-3">
              <img :src="logoPreview" alt="Logo preview" class="h-20 object-contain rounded border border-gray-200" />
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex space-x-4 w-full md:w-1/2">
            <LoadingButton :loading="isSubmitting" :loadingLabel="'Saving...'" @click="submitCluster">
              Save Cluster
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminBar from '@/components/common/AdminBar.vue'
import LoadingButton from '@/components/common/LoadingButton.vue'
import api from '@/plugins/axios'

const router = useRouter()
const newCluster = ref({
  name: '',
  type: '',
  description: '',
  primary_color: '#1a1d56',
  secondary_color: '#f59d08',
  logo: null,
})

const clusterTypes = ['Secretariat', 'College', 'Project', 'Programme', 'Directorate', 'Department']
const isSubmitting = ref(false)
const submitted = ref(false)
const logoFile = ref(null)
const logoPreview = ref(null)

const onLogoChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  logoFile.value = file
  logoPreview.value = URL.createObjectURL(file)
}

const submitCluster = async () => {
  submitted.value = true
  if (!newCluster.value.name || !newCluster.value.type) return

  try {
    isSubmitting.value = true
    const res = await api.post('/org_units/', {
      name: newCluster.value.name,
      type: newCluster.value.type,
      description: newCluster.value.description,
      primary_color: newCluster.value.primary_color,
      secondary_color: newCluster.value.secondary_color,
    })

    // Upload logo if selected
    if (logoFile.value) {
      const clusterId = res.data?.id
      if (clusterId) {
        const formData = new FormData()
        formData.append('file', logoFile.value)
        await api.post(`/org_units/upload_logo/${clusterId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
    }

    router.push({ name: 'Clusters' })
  } catch (error) {
    console.error('Failed to create cluster:', error.response?.data || error.message)
  } finally {
    isSubmitting.value = false
  }
}
</script>
