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
      <router-link
        :to="{ name: 'AddCluster' }"
        v-if="canAddCluster"
        class="bg-[#1a1d56] hover:bg-[#007B97] text-white px-6 py-2 rounded-xl transition"
      >
        + Add Cluster
      </router-link>
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
            <tr v-if="isLoading">
              <td colspan="3" class="py-8">
                <div class="flex justify-center items-center">
                  <DataLoadingSpinner />
                </div>
              </td>
            </tr>

            <tr
              v-for="cluster in filteredClusters"
              :key="cluster.id"
              class="block md:table-row border-t md:border-0 md:hover:bg-gray-50 even:bg-gray-50 odd:bg-white"
              v-else
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
                  <router-link
                    v-if="canViewCluster"
                    :to="{ name: 'Cluster', params: { id: cluster.id } }"
                    class="text-gray-500 hover:text-blue-600"
                    title="View"
                  >
                    <EyeIcon class="w-6 h-6" />
                  </router-link>
                  <router-link
                    v-if="canEditCluster"
                    :to="{ name: 'EditCluster', params: { id: cluster.id } }"
                    class="text-gray-500 hover:text-blue-600"
                    title="Edit"
                  >
                    <PencilSquareIcon class="w-6 h-6" />
                  </router-link>
                  <ActionIcon
                    :can="canDeleteCluster"
                    :icon="TrashIcon"
                    label="Delete"
                    colorClass="text-gray-500 hover:text-blue-600"
                    @click="confirmDelete(cluster)"
                  />
                </div>
              </td>
            </tr>

            <tr v-if="!isLoading && filteredClusters.length === 0">
              <td colspan="3" class="text-center px-6 py-4 text-gray-400">No clusters found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex flex-col md:flex-row md:items-center justify-between mt-4 gap-4 text-sm text-gray-600">
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

        <div class="text-center flex-1 md:flex-none">
          Page {{ currentPage }} of {{ totalPages }}
        </div>

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

      <DeleteConfirmationModal
        :show="showDeleteModal"
        :itemName="selectedCluster?.name"
        :loading="deleting"
        @cancel="showDeleteModal = false"
        @confirm="deleteCluster"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { EyeIcon, PencilSquareIcon, TrashIcon } from "@heroicons/vue/24/outline";
import AdminBar from "@/components/common/AdminBar.vue";
import api from "@/plugins/axios";
import ActionIcon from '@/components/common/ActionIcon.vue';
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal.vue';
import { debounce } from 'lodash';
import DataLoadingSpinner from '@/components/common/DataLoadingSpinner.vue'

const auth = useAuthStore();
const search = ref('');
const debouncedSearch = ref('');
const currentPage = ref(1);
const perPage = ref(5);
const totalPages = ref(1);
const clusters = ref([]);
const isLoading = ref(false);
const deleting = ref(false);
const showDeleteModal = ref(false);
const selectedCluster = ref(null);

// Debounce search input
const updateDebouncedSearch = debounce((val) => {
  debouncedSearch.value = val;
  currentPage.value = 1;
}, 300);
watch(search, updateDebouncedSearch);
watch(perPage, () => (currentPage.value = 1));

// Fetch clusters data
const fetchClusters = async () => {
  isLoading.value = true;
  try {
    const page = Number(currentPage.value);
    const limit = Number(perPage.value);
    const skip = (page - 1) * limit;
    const response = await api.get("/org_units/", {
      params: { skip, limit, search: debouncedSearch.value },
    });
    clusters.value = response.data.data;
    totalPages.value = response.data.pages;
  } catch (error) {
    console.error("Error fetching clusters:", error.response?.data || error.message);
  } finally {
    isLoading.value = false;
  }
};

const confirmDelete = (cluster) => {
  selectedCluster.value = cluster;
  showDeleteModal.value = true;
};

const deleteCluster = async () => {
  deleting.value = true;
  try {
    await api.delete(`/org_units/${selectedCluster.value.id}`);
    showDeleteModal.value = false;
    selectedCluster.value = null;
    fetchClusters();
  } catch (error) {
    console.error("Error deleting cluster:", error.response?.data || error.message);
  } finally {
    deleting.value = false;
  }
};

watch([currentPage, perPage, debouncedSearch], fetchClusters);
onMounted(fetchClusters);

const filteredClusters = computed(() => clusters.value);
const canAddCluster = computed(() => auth.hasPermission("ADD_ORG_UNIT"));
const canViewCluster = computed(() => auth.hasPermission("VIEW_ORG_UNIT"));
const canEditCluster = computed(() => auth.hasPermission("UPDATE_ORG_UNIT"));
const canDeleteCluster = computed(() => auth.hasPermission("DELETE_ORG_UNIT"));
</script>
