<template>
  <div class="flex-1 flex flex-col max-w-7xl w-full mx-auto overflow-hidden">
    <AdminBar title="View User">
      <router-link :to="{ name: 'Users' }" class="text-sm text-blue-600 hover:underline">
        Users
      </router-link>
      <span class="mx-2 text-sm text-gray-500">/</span>
      <span class="text-sm text-gray-700">View</span>
    </AdminBar>

    <div class="px-4 pt-4 pb-2">
      <h1 class="text-xl font-bold text-gray-800">User Details</h1>
    </div>

    <main class="px-4 pb-6">
      <div v-if="loading" class="bg-white shadow-lg rounded-2xl p-8 flex justify-center items-center">
        <DataLoadingSpinner />
      </div>

      <div v-else-if="error" class="bg-red-100 text-red-700 p-6 rounded-lg">
        Error loading user: {{ error }}
      </div>

      <div v-else class="bg-white shadow-lg rounded-2xl p-4 sm:p-8 space-y-8">
        <!-- User Basic Info -->
        <section>
          <h2 class="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">Name</h2>
          <p class="text-lg font-semibold text-gray-900">{{ user.firstname }} {{ user.lastname }}</p>
        </section>

        <section>
          <h2 class="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">Email</h2>
          <p class="text-sm text-gray-800 leading-relaxed">{{ user.email }}</p>
        </section>

        <section>
          <h2 class="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Phone</h2>
          <p class="text-sm text-gray-800 leading-relaxed">{{ user.phone }}</p>
        </section>

        <!-- Roles -->
        <section>
          <h2 class="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Roles</h2>

          <div v-if="loadingRoles" class="py-4 flex justify-center">
            <DataLoadingSpinner />
          </div>

          <div v-else class="overflow-x-auto rounded-lg shadow">
            <table class="w-full table-auto text-sm text-gray-800">
              <thead class="bg-gray-100 uppercase text-xs text-gray-800 text-left">
                <tr>
                  <th class="px-4 py-3 text-center">Assign</th>
                  <th class="px-6 py-3">Role Name</th>
                  <th class="px-6 py-3">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="role in allRoles" :key="role.id" class="border-b last:border-b-0">
                  <td class="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      :disabled="loadingAssignRemove"
                      :checked="hasRole(role)"
                      @change="onRoleCheckboxChange(role, $event.target.checked)"
                    />
                  </td>
                  <td class="px-6 py-3 break-words">{{ role.role }}</td>
                  <td class="px-6 py-3 break-words">{{ role.description }}</td>
                </tr>
                <tr v-if="allRoles.length === 0">
                  <td colspan="3" class="text-center py-8 text-gray-500">No roles found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div class="flex flex-wrap gap-3 pt-4">
          <button
            @click="goBack"
            class="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-xl transition"
          >
            Back
          </button>
          <button
            @click="editUser"
            class="bg-[#1a1d56] hover:bg-[#007B97] text-white py-2 px-6 rounded-xl transition"
          >
            Edit
          </button>
          <button
            v-if="canResetPassword"
            @click="showResetModal = true"
            class="bg-amber-500 hover:bg-amber-600 text-white py-2 px-6 rounded-xl transition flex items-center gap-2"
          >
            <KeyIcon class="w-4 h-4" />
            Reset Password
          </button>
        </div>
      </div>
    </main>

    <!-- Reset Password Confirmation Modal -->
    <div
      v-if="showResetModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
    >
      <div class="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full space-y-4">
        <h3 class="text-lg font-semibold text-gray-800">Reset Password</h3>
        <p class="text-sm text-gray-600">
          A new random password will be generated and emailed to
          <strong>{{ user?.email }}</strong>. The user will need to use it to log in.
        </p>
        <div v-if="resetError" class="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">
          {{ resetError }}
        </div>
        <div v-if="resetSuccess" class="text-sm text-green-700 bg-green-50 rounded-lg px-4 py-2">
          {{ resetSuccess }}
        </div>
        <div class="flex gap-3 justify-end">
          <button
            @click="showResetModal = false; resetError = ''; resetSuccess = ''"
            :disabled="resetting"
            class="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm"
          >
            Cancel
          </button>
          <button
            @click="resetPassword"
            :disabled="resetting || !!resetSuccess"
            class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white transition text-sm flex items-center gap-2"
          >
            <span v-if="resetting">Resetting…</span>
            <span v-else>Confirm Reset</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { KeyIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import AdminBar from '@/components/common/AdminBar.vue'
import DataLoadingSpinner from '@/components/common/DataLoadingSpinner.vue'
import api from '@/plugins/axios'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const userId = route.params.id
const user = ref(null)
const loading = ref(true)
const error = ref(null)

const allRoles = ref([])
const loadingRoles = ref(true)
const loadingAssignRemove = ref(false)

const showResetModal = ref(false)
const resetting = ref(false)
const resetError = ref('')
const resetSuccess = ref('')

const canResetPassword = computed(() => auth.hasPermission('UPDATE_USER'))

const fetchUser = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await api.get(`/users/${userId}`)
    // Expect user data to be inside res.data.user or just res.data
    user.value = res.data.user || res.data
  } catch (err) {
    error.value = err.response?.data?.detail || err.message || 'Failed to fetch user'
  } finally {
    loading.value = false
  }
}

const fetchAllRoles = async () => {
  loadingRoles.value = true
  try {
    const res = await api.get('/roles/', { params: { limit: 1000 } })
    allRoles.value = res.data.data || res.data || []
  } catch (err) {
    console.error('Failed to fetch roles', err)
  } finally {
    loadingRoles.value = false
  }
}

const hasRole = (role) => {
  if (!user.value?.roles) return false
  return user.value.roles.some((r) => r.id === role.id)
}

const onRoleCheckboxChange = async (role, checked) => {
  if (loadingAssignRemove.value) return
  loadingAssignRemove.value = true
  try {
    if (checked) {
      // Assign role
      await api.post('/users/roles/', {
        user_id: userId,
        role_id: role.id,
      })
    } else {
      // Remove role - adjust to your API needs
      await api.delete('/users/roles/', {
        data: {
          user_id: userId,
          role_id: role.id,
        },
      })
    }
    // Refresh user data (to update roles)
    await fetchUser()
  } catch (err) {
    alert(err.response?.data?.detail || 'Failed to update roles')
  } finally {
    loadingAssignRemove.value = false
  }
}

const resetPassword = async () => {
  resetting.value = true
  resetError.value = ''
  resetSuccess.value = ''
  try {
    await api.post(`/users/${userId}/reset-password`)
    resetSuccess.value = 'Password reset successfully. New credentials sent to user\'s email.'
  } catch (err) {
    resetError.value = err.response?.data?.detail || 'Failed to reset password'
  } finally {
    resetting.value = false
  }
}

const goBack = () => router.back()
const editUser = () => router.push({ name: 'EditUser', params: { id: userId } })

onMounted(() => {
  fetchUser()
  fetchAllRoles()
})
</script>
