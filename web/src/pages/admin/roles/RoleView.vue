<template>
  <div class="flex-1 flex flex-col max-w-7xl w-full mx-auto overflow-hidden">
    <AdminBar title="View Role">
      <router-link :to="{ name: 'Roles' }" class="text-sm text-blue-600 hover:underline">
        Roles
      </router-link>
      <span class="mx-2 text-sm text-gray-500">/</span>
      <span class="text-sm text-gray-700">View</span>
    </AdminBar>

    <div class="px-4 pt-4 pb-2">
      <h1 class="text-xl font-bold text-gray-800">Role Details</h1>
    </div>

    <main class="px-4 pb-6">
      <div v-if="loading" class="bg-white shadow-lg rounded-2xl p-8 flex justify-center items-center">
        <DataLoadingSpinner />
      </div>

      <div v-else-if="error" class="bg-red-100 text-red-700 p-6 rounded-lg">
        Error loading role: {{ error }}
      </div>

      <div v-else class="bg-white shadow-lg rounded-2xl p-4 sm:p-8 space-y-8">
        <section>
          <h2 class="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">Name</h2>
          <p class="text-lg font-semibold text-gray-900">{{ role.role.role }}</p>
        </section>

        <section>
          <h2 class="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">Description</h2>
          <p class="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {{ role.role.description }}
          </p>
        </section>

        <section>
          <h2 class="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Permissions</h2>
          <div class="overflow-x-auto rounded-lg shadow">
            <table class="w-full table-auto text-sm text-gray-800">
              <thead class="bg-gray-100 uppercase text-xs text-gray-800 text-left">
                <tr>
                  <th class="px-4 py-3 text-center sm:text-left">Assign</th>
                  <th class="px-4 py-3 text-center sm:text-left">Remove</th>
                  <th class="px-6 py-3">Permission</th>
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
                <tr v-for="perm in allPermissions" :key="perm.id" class="border-b last:border-b-0">
                  <td class="px-4 py-3 text-center sm:text-left">
                    <input
                      type="checkbox"
                      :disabled="loadingAssignRemove || getAssignedPermission(perm)"
                      :checked="!!getAssignedPermission(perm)"
                      @change="onAssignCheckboxChange(perm, $event.target.checked)"
                    />
                  </td>
                  <td class="px-4 py-3 text-center sm:text-left">
                    <input
                      type="checkbox"
                      :disabled="loadingAssignRemove || !getAssignedPermission(perm)"
                      :checked="false"
                      @change="onRemoveCheckboxChange(perm)"
                    />
                  </td>
                  <td class="px-6 py-3 break-words">{{ perm.permission }}</td>
                </tr>
                <tr v-if="allPermissions.length === 0">
                  <td colspan="3" class="text-center py-8 text-gray-500">No permissions found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div class="flex space-x-4 pt-4">
          <button @click="goBack" class="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-xl transition">
            Back
          </button>
          <button @click="editRole" class="bg-[#1a1d56] hover:bg-[#007B97] text-white py-2 px-6 rounded-xl transition">
            Edit
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminBar from '@/components/common/AdminBar.vue'
import DataLoadingSpinner from '@/components/common/DataLoadingSpinner.vue'
import api from '@/plugins/axios'

const route = useRoute()
const router = useRouter()

const roleId = route.params.id
const role = ref(null)
const loading = ref(true)
const error = ref(null)

const allPermissions = ref([])
const isLoading = ref(false)
const loadingAssignRemove = ref(false)

const currentPage = ref(1)
const perPage = ref(1000)
const totalPages = ref(1)

const skip = computed(() => (currentPage.value - 1) * perPage.value)

const fetchRole = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await api.get(`/roles/${roleId}`)
    role.value = res.data
  } catch (err) {
    error.value = err.response?.data?.detail || err.message || 'Failed to fetch role'
  } finally {
    loading.value = false
  }
}

const fetchAllPermissions = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/permissions/', {
      params: {
        skip: skip.value,
        limit: perPage.value
      }
    })
    allPermissions.value = res.data.data || res.data || []
    totalPages.value = res.data.pages || 1
  } catch (err) {
    console.error('Failed to fetch permissions', err)
  } finally {
    isLoading.value = false
  }
}

// Returns assigned permission object or undefined
const getAssignedPermission = (perm) => {
  return role.value?.permissions?.find(
    (p) => p.permission === perm.permission || p.permission?.id === perm.id
  )
}

const onAssignCheckboxChange = async (perm, checked) => {
  if (loadingAssignRemove.value || !checked) return
  loadingAssignRemove.value = true
  try {
    await api.post('/roles/permissions/', {
      role_id: parseInt(roleId),
      permission_id: perm.id
    })
    await fetchRole()
  } catch (err) {
    alert(err.response?.data?.detail || 'Failed to assign permission')
  } finally {
    loadingAssignRemove.value = false
  }
}

const onRemoveCheckboxChange = async (perm) => {
  const assigned = getAssignedPermission(perm)
  if (!assigned) return
  loadingAssignRemove.value = true
  try {
    await api.delete(`/roles/permissions/${assigned.id}`)
    await fetchRole()
  } catch (err) {
    alert(err.response?.data?.detail || 'Failed to remove permission')
  } finally {
    loadingAssignRemove.value = false
  }
}

const goBack = () => {
  router.back()
}

const editRole = () => {
  router.push({ name: 'EditRole', params: { id: roleId } })
}

onMounted(() => {
  fetchRole()
  fetchAllPermissions()
})
</script>
