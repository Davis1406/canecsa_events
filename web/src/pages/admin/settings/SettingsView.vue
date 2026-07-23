<template>
  <div class="flex-1 flex flex-col max-w-7xl w-full mx-auto overflow-hidden">
    <!-- Admin Bar -->
    <AdminBar title="Clusters">
      <a href="#" class="text-sm text-blue-600 hover:underline">Clusters</a>
    </AdminBar>

    <!-- Page Title -->
    <div class="px-6 pt-4 pb-2">
      <h1 class="text-xl font-bold text-gray-800">Clusters</h1>
    </div>

    <!-- Search & Add -->
    <div class="px-6 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <input
        v-model="search"
        type="text"
        placeholder="Search clusters..."
        class="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
      />
      <button class="bg-[#1a1d56] hover:bg-[#007B97] text-white px-6 py-2 rounded-xl transition">
        + Add Cluster
      </button>
    </div>

    <!-- Cluster List -->
    <main class="px-6 pb-6">
      <div class="w-full overflow-hidden bg-white shadow rounded-lg">
        <table class="w-full table-auto text-sm text-gray-800 rounded-lg overflow-hidden">
          <thead class="bg-gray-100 text-left uppercase text-xs text-gray-800 hidden md:table-header-group">
            <tr>
              <th class="px-6 py-4">Cluster</th>
              <th class="px-6 py-4">Type</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(cluster, index) in paginatedClusters"
              :key="cluster.id"
              class="block md:table-row border-t md:border-0 md:hover:bg-gray-50 even:bg-gray-50 odd:bg-white"
            >
              <td class="px-6 py-4 block md:table-cell">
                <span class="block md:hidden font-semibold text-gray-500 mb-1">Cluster:</span>
                {{ cluster.name }}
              </td>
              <td class="px-6 py-4 block md:table-cell">
                <span class="block md:hidden font-semibold text-gray-500 mb-1">Type:</span>
                {{ cluster.type }}
              </td>
              <td class="px-6 py-4 block md:table-cell text-left md:text-right">
                <span class="block md:hidden font-semibold text-gray-500 mb-1">Actions:</span>
                <div class="flex items-center space-x-3 justify-start md:justify-end">
                  <!-- View -->
                  <div class="relative group">
                    <EyeIcon class="w-5 h-5 text-gray-500 hover:text-blue-600 cursor-pointer" />
                    <span class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50">
                      View
                    </span>
                  </div>

                  <!-- Edit -->
                  <div class="relative group">
                    <PencilSquareIcon class="w-5 h-5 text-gray-500 hover:text-green-600 cursor-pointer" />
                    <span class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50">
                      Edit
                    </span>
                  </div>

                  <!-- Delete -->
                  <div class="relative group">
                    <TrashIcon class="w-5 h-5 text-gray-500 hover:text-red-600 cursor-pointer" />
                    <span class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50">
                      Delete
                    </span>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="filteredClusters.length === 0">
              <td colspan="3" class="text-center px-6 py-4 text-gray-400">No clusters found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex flex-col md:flex-row md:items-center justify-between mt-4 gap-4 text-sm text-gray-600">
        <!-- Items per page -->
        <div class="flex items-center space-x-2">
          <label for="perPage" class="text-sm">Show</label>
          <select
            id="perPage"
            v-model="perPage"
            class="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#1a1d56]"
          >
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="15">15</option>
          </select>
        </div>

        <!-- Page info -->
        <div class="text-center flex-1 md:flex-none">
          Page {{ currentPage }} of {{ totalPages }}
        </div>

        <!-- Prev/Next buttons -->
        <div class="flex justify-end items-center space-x-2">
          <button
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            class="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { EyeIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'
import AdminBar from '@/components/common/AdminBar.vue'

const search = ref('')
const currentPage = ref(1)
const perPage = ref(5)

const clusters = ref([
  { id: 1, name: 'Cluster A', type: 'Health' },
  { id: 2, name: 'Cluster B', type: 'Education' },
  { id: 3, name: 'Cluster C', type: 'Logistics' },
  { id: 4, name: 'Cluster D', type: 'Protection' },
  { id: 5, name: 'Cluster E', type: 'WASH' },
  { id: 6, name: 'Cluster F', type: 'Nutrition' },
  { id: 7, name: 'Cluster G', type: 'Shelter' },
])

const filteredClusters = computed(() => {
  return clusters.value.filter((c) =>
    c.name.toLowerCase().includes(search.value.toLowerCase())
  )
})

const paginatedClusters = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredClusters.value.slice(start, start + perPage.value)
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredClusters.value.length / perPage.value))
})
</script>
