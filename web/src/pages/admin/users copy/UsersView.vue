<template>
  <div class="flex-1 flex flex-col max-w-7xl w-full mx-auto overflow-hidden">
    <!-- Admin Bar -->
    <AdminBar title="Roles">
      <a href="#" class="text-sm text-blue-600 hover:underline">Roles</a>
    </AdminBar>

    <!-- Page Title -->
    <div class="px-6 pt-4 pb-2">
      <h1 class="text-xl font-bold text-gray-800">Roles</h1>
    </div>

    <!-- Search & Add -->
    <div class="px-6 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <input
        v-model="search"
        type="text"
        placeholder="Search roles..."
        class="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
      />
      <router-link
        :to="{ name: 'AddRole' }"
        v-if="canAddRole"
        class="bg-[#1a1d56] hover:bg-[#007B97] text-white px-6 py-2 rounded-xl transition"
      >
        + Add Role
      </router-link>
    </div>

    <!-- Roles List -->
    <main class="px-6 pb-6">
      <div class="w-full overflow-hidden bg-white shadow rounded-lg">
        <table class="w-full table-auto text-sm text-gray-800 rounded-lg overflow-hidden">
          <thead class="bg-gray-100 text-left uppercase text-xs text-gray-800 hidden md:table-header-group">
            <tr>
              <th class="px-6 py-4">Role</th>
              <th class="px-6 py-4">Description</th>
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
              v-for="role in filteredRoles"
              :key="role.id"
              class="block md:table-row border-t md:border-0 md:hover:bg-gray-50 even:bg-gray-50 odd:bg-white"
              v-else
            >
              <td class="px-6 py-4 block md:table-cell">
                <span class="block md:hidden font-semibold text-gray-500 mb-1">Role:</span>
                {{ role.role }}
              </td>
              <td class="px-6 py-4 block md:table-cell">
                <span class="block md:hidden font-semibold text-gray-500 mb-1">Description:</span>
                {{ role.description }}
              </td>
              <td class="px-6 py-4 block md:table-cell text-left md:text-right">
                <span class="block md:hidden font-semibold text-gray-500 mb-1">Actions:</span>
                <div class="flex items-center space-x-3 justify-start md:justify-end">
                  <router-link
                    v-if="canViewRole"
                    :to="{ name: 'Role', params: { id: role.id } }"
                    class="text-gray-500 hover:text-blue-600"
                    title="View"
                  >
                    <EyeIcon class="w-6 h-6" />
                  </router-link>
                  <router-link
                    v-if="canEditRole"
                    :to="{ name: 'EditRole', params: { id: role.id } }"
                    class="text-gray-500 hover:text-blue-600"
                    title="Edit"
                  >
                    <PencilSquareIcon class="w-6 h-6" />
                  </router-link>
                  <ActionIcon
                    :can="canDeleteRole"
                    :icon="TrashIcon"
                    label="Delete"
                    colorClass="text-gray-500 hover:text-blue-600"
                    @click="confirmDelete(role)"
                  />
                </div>
              </td>
            </tr>

            <tr v-if="!isLoading && filteredRoles.length === 0">
              <td colspan="3" class="text-center px-6 py-4 text-gray-400">No roles found.</td>
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
        :itemName="selectedRole?.Role"
        :loading="deleting"
        @cancel="showDeleteModal = false"
        @confirm="deleteRole"
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
const roles = ref([]);
const isLoading = ref(false);
const deleting = ref(false);
const showDeleteModal = ref(false);
const selectedRole = ref(null);

// Debounce search input
const updateDebouncedSearch = debounce((val) => {
  debouncedSearch.value = val;
  currentPage.value = 1;
}, 300);
watch(search, updateDebouncedSearch);
watch(perPage, () => (currentPage.value = 1));

// Fetch roles data
const fetchRoles = async () => {
  isLoading.value = true;
  try {
    const page = Number(currentPage.value);
    const limit = Number(perPage.value);
    const skip = (page - 1) * limit;
    const response = await api.get("/roles/", {
      params: { skip, limit, search: debouncedSearch.value },
    });
    roles.value = response.data.data;
    totalPages.value = response.data.pages;
  } catch (error) {
    console.error("Error fetching roles:", error.response?.data || error.message);
  } finally {
    isLoading.value = false;
  }
};

const confirmDelete = (role) => {
  selectedRole.value = role;
  showDeleteModal.value = true;
};

const deleteRole = async () => {
  deleting.value = true;
  try {
    await api.delete(`/roles/${selectedRole.value.id}`);
    showDeleteModal.value = false;
    selectedRole.value = null;
    fetchRoles();
  } catch (error) {
    console.error("Error deleting role:", error.response?.data || error.message);
  } finally {
    deleting.value = false;
  }
};

watch([currentPage, perPage, debouncedSearch], fetchRoles);
onMounted(fetchRoles);

const filteredRoles = computed(() => roles.value);
const canAddRole = computed(() => auth.hasPermission("ADD_ROLE"));
const canViewRole = computed(() => auth.hasPermission("VIEW_ROLE"));
const canEditRole = computed(() => auth.hasPermission("UPDATE_ROLE"));
const canDeleteRole = computed(() => auth.hasPermission("DELETE_ROLE"));
</script>
