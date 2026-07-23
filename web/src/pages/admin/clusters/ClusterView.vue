<template>
  <div class="flex-1 flex flex-col max-w-7xl w-full mx-auto overflow-hidden">
    <!-- Admin Bar -->
    <AdminBar title="View Cluster">
      <router-link
        :to="{ name: 'Clusters' }"
        class="text-sm text-blue-600 hover:underline"
      >
        Clusters
      </router-link>
      <span class="mx-2 text-sm text-gray-500">/</span>
      <span class="text-sm text-gray-700">View</span>
    </AdminBar>

    <!-- Page Title -->
    <div class="px-4 pt-4 pb-2">
      <h1 class="text-xl font-bold text-gray-800">Cluster Details</h1>
    </div>

    <!-- Cluster Details -->
    <main class="px-4 pb-6">
      <div
      v-if="loading"
      class="bg-white shadow-lg rounded-2xl p-8 flex justify-center items-center"
    >
      <DataLoadingSpinner />
    </div>

      <div v-else-if="error" class="bg-red-100 text-red-700 p-6 rounded-lg">
        Error loading cluster: {{ error }}
      </div>

      <div v-else class="bg-white shadow-lg rounded-2xl p-8 space-y-8">
        <section>
          <h2 class="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">
            Name
          </h2>
          <p class="text-lg font-semibold text-gray-900">{{ cluster.name }}</p>
        </section>

        <section>
          <h2 class="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">
            Type
          </h2>
          <p class="text-md font-semibold text-indigo-600">{{ cluster.type }}</p>
        </section>

        <section>
          <h2 class="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">
            Description
          </h2>
          <p class="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {{ cluster.description }}
          </p>
        </section>

        <div class="flex space-x-4 pt-4">
          <button
            @click="goBack"
            class="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-xl transition"
          >
            Back
          </button>
          <button
            @click="editCluster"
            class="bg-[#1a1d56] hover:bg-[#007B97] text-white py-2 px-6 rounded-xl transition"
          >
            Edit
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminBar from '@/components/common/AdminBar.vue'
import DataLoadingSpinner from '@/components/common/DataLoadingSpinner.vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/plugins/axios'

const router = useRouter()
const route = useRoute()

const cluster = ref(null)
const loading = ref(true)
const error = ref(null)

const clusterId = route.params.id

const fetchCluster = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await api.get(`/org_units/${clusterId}`)
    cluster.value = response.data
  } catch (err) {
    error.value = err.response?.data?.detail || err.message || 'Failed to fetch cluster'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCluster()
})

function goBack() {
  router.back()
}

function editCluster() {
  router.push({ name: 'EditCluster', params: { id: clusterId } })
}
</script>
