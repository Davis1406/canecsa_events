<template>
  <div class="flex-1 flex flex-col max-w-7xl w-full mx-auto overflow-hidden">
    <!-- Admin Bar -->
    <AdminBar title="Users">
      <a href="#" class="text-sm text-blue-600 hover:underline">Users</a>
    </AdminBar>

    <!-- Page Title -->
    <div class="px-6 pt-4 pb-2">
      <h1 class="text-xl font-bold text-gray-800">Users</h1>
    </div>

    <!-- Search & Add -->
    <div class="px-6 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <input
        v-model="search"
        type="text"
        placeholder="Search users..."
        class="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
      />
      <router-link
        :to="{ name: 'AddUser' }"
        v-if="canAddUser"
        class="bg-[#1a1d56] hover:bg-[#007B97] text-white px-6 py-2 rounded-xl transition"
      >
        + Add User
      </router-link>
    </div>

    <!-- Users List -->
    <main class="px-6 pb-6">
      <div class="w-full overflow-hidden bg-white shadow rounded-lg">
        <table class="w-full table-auto text-sm text-gray-800 rounded-lg overflow-hidden">
          <thead class="bg-gray-100 text-left uppercase text-xs text-gray-800 hidden md:table-header-group">
            <tr>
              <th class="px-6 py-4 w-10">#</th>
              <th class="px-6 py-4">Name</th>
              <th class="px-6 py-4">Email/Username</th>
              <th class="px-6 py-4">Phone</th>
              <th class="px-6 py-4">Role</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="6" class="py-8">
                <div class="flex justify-center items-center">
                  <DataLoadingSpinner />
                </div>
              </td>
            </tr>

            <tr
              v-for="(user, index) in filteredUsers"
              :key="user.id"
              class="block md:table-row border-t md:border-0 md:hover:bg-gray-50 even:bg-gray-50 odd:bg-white"
              v-else
            >
              <td class="px-6 py-4 block md:table-cell text-gray-400 text-xs font-mono">{{ (currentPage - 1) * perPage + index + 1 }}</td>
              <td class="px-6 py-4 block md:table-cell font-medium">{{ user.firstname }} {{ user.lastname }}</td>
              <td class="px-6 py-4 block md:table-cell">{{ user.email }}</td>
              <td class="px-6 py-4 block md:table-cell">{{ user.phone }}</td>
              <td class="px-6 py-4 block md:table-cell">
                <span class="inline-block px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full border border-blue-200">{{ user.role }}</span>
              </td>
              <td class="px-6 py-4 block md:table-cell text-left md:text-right">
                <div class="flex items-center space-x-3 justify-start md:justify-end">
                  <router-link
                    v-if="canViewUser"
                    :to="{ name: 'AdminUserPerspective', params: { id: user.id } }"
                    class="text-gray-500 hover:text-[#1a1d56]"
                    title="View as user"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </router-link>
                  <router-link
                    v-if="canViewUser"
                    :to="{ name: 'User', params: { id: user.id } }"
                    class="text-gray-500 hover:text-blue-600"
                    title="View admin details"
                  >
                    <EyeIcon class="w-6 h-6" />
                  </router-link>
                  <router-link
                    v-if="canEditUser"
                    :to="{ name: 'EditUser', params: { id: user.id } }"
                    class="text-gray-500 hover:text-blue-600"
                    title="Edit"
                  >
                    <PencilSquareIcon class="w-6 h-6" />
                  </router-link>
                  <ActionIcon
                    :can="canDeleteUser"
                    :icon="TrashIcon"
                    label="Delete"
                    colorClass="text-gray-500 hover:text-blue-600"
                    @click="confirmDelete(user)"
                  />
                </div>
              </td>
            </tr>

            <tr v-if="!isLoading && filteredUsers.length === 0">
              <td colspan="6" class="text-center px-6 py-4 text-gray-400">No users found.</td>
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
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
        </div>
        <div class="text-center flex-1 md:flex-none">Page {{ currentPage }} of {{ totalPages }}</div>
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

      <!-- Delete Modal -->
      <DeleteConfirmationModal
        :show="showDeleteModal"
        :itemName="selectedUser?.firstname + ' ' + selectedUser?.lastname"
        :loading="deleting"
        @cancel="showDeleteModal = false"
        @confirm="deleteUser"
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
import ActionIcon from "@/components/common/ActionIcon.vue";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal.vue";
import { debounce } from "lodash";
import DataLoadingSpinner from "@/components/common/DataLoadingSpinner.vue";

const auth = useAuthStore();
const search = ref('');
const debouncedSearch = ref('');
const currentPage = ref(1);
const perPage = ref(10);
const totalPages = ref(1);
const users = ref([]);
const isLoading = ref(false);
const deleting = ref(false);
const showDeleteModal = ref(false);
const selectedUser = ref(null);

const updateDebouncedSearch = debounce((val) => {
  debouncedSearch.value = val.trim();
  currentPage.value = 1;
}, 300);

watch(search, updateDebouncedSearch);
watch(perPage, () => (currentPage.value = 1));

const fetchUsers = async () => {
  isLoading.value = true;
  try {
    const page = currentPage.value;
    const limit = perPage.value;
    const skip = (page - 1) * limit;
    const response = await api.get("/users/", {
      params: { skip, limit, search: debouncedSearch.value },
    });
    users.value = response.data.data;
    totalPages.value = response.data.pages;
  } catch (error) {
    console.error("Error fetching users:", error.response?.data || error.message);
  } finally {
    isLoading.value = false;
  }
};

const confirmDelete = (user) => {
  selectedUser.value = user;
  showDeleteModal.value = true;
};

const deleteUser = async () => {
  deleting.value = true;
  try {
    await api.delete(`/users/${selectedUser.value.id}`);
    showDeleteModal.value = false;
    selectedUser.value = null;
    fetchUsers();
  } catch (error) {
    console.error("Error deleting user:", error.response?.data || error.message);
  } finally {
    deleting.value = false;
  }
};

watch([currentPage, perPage, debouncedSearch], fetchUsers);
onMounted(fetchUsers);

const filteredUsers = computed(() => users.value);

const canAddUser = computed(() => auth.hasPermission("ADD_USER"));
const canViewUser = computed(() => auth.hasPermission("VIEW_USER"));
const canEditUser = computed(() => auth.hasPermission("UPDATE_USER"));
const canDeleteUser = computed(() => auth.hasPermission("DELETE_USER"));
</script>
