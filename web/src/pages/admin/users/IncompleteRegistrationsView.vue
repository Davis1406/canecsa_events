<template>
  <div class="flex-1 flex flex-col w-full max-w-7xl mx-auto p-6 space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-semibold text-gray-800">Incomplete Registrations</h1>
        <p class="text-sm text-gray-400 mt-0.5">
          Users who created accounts but never completed registration
        </p>
      </div>
      <div class="flex items-center gap-2">
        <select v-model="days" @change="load"
          class="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option :value="30">Last 30 days</option>
          <option :value="60">Last 60 days</option>
          <option :value="90">Last 90 days</option>
          <option :value="180">Last 180 days</option>
        </select>
        <button @click="load" :disabled="loading"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50">
          <svg class="w-4 h-4" :class="loading ? 'animate-spin' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style="background:#e6f7fb;">
          <svg class="w-5 h-5" style="color:#1a1d56;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-800">{{ total }}</p>
          <p class="text-xs text-gray-400 mt-0.5">Incomplete accounts</p>
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-50">
          <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-800">{{ remindersSent }}</p>
          <p class="text-xs text-gray-400 mt-0.5">Reminders sent this session</p>
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-50">
          <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-800">{{ total - remindersSent }}</p>
          <p class="text-xs text-gray-400 mt-0.5">Not yet reminded</p>
        </div>
      </div>
    </div>

    <!-- Info notice -->
    <div class="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-800 flex items-start gap-3">
      <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>
        These users created portal accounts but did not complete registration.
        Their accounts and credentials exist — they just need to log in and complete registration.
        Admins and users with roles are excluded from this list.
      </span>
    </div>

    <!-- Search -->
    <div class="relative">
      <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <input v-model="search" type="text" placeholder="Search by name, email, country or organisation…"
        class="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400" />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <DataLoadingSpinner />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm">
      {{ error }}
    </div>

    <!-- Empty -->
    <div v-else-if="filtered.length === 0" class="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-400 text-sm">
      <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      {{ search ? 'No users match your search.' : 'No incomplete registrations found for this period.' }}
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-2xl shadow-sm overflow-auto">
      <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Country</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Organisation</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Created</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="(u, idx) in filtered" :key="u.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 text-gray-400 text-xs">{{ idx + 1 }}</td>
            <td class="px-4 py-3 font-medium text-gray-800">
              <router-link :to="{ name: 'AdminUserPerspective', params: { id: u.id } }"
                class="hover:underline hover:text-[#1a1d56] transition-colors">
                {{ u.firstname }} {{ u.lastname }}
              </router-link>
            </td>
            <td class="px-4 py-3 text-gray-600">{{ u.email }}</td>
            <td class="px-4 py-3 text-gray-600">{{ u.country || '—' }}</td>
            <td class="px-4 py-3 text-gray-600 max-w-[200px] truncate">{{ u.organisation || '—' }}</td>
            <td class="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{{ formatDate(u.created_at) }}</td>
            <td class="px-4 py-3">
              <button @click="sendReminder(u)"
                :disabled="u._sending || u._sent"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                :class="u._sent
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'">
                <svg v-if="u._sending" class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                <svg v-else-if="u._sent" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <svg v-else class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                {{ u._sending ? 'Sending…' : u._sent ? 'Sent' : 'Send Reminder' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/plugins/axios'
import DataLoadingSpinner from '@/components/common/DataLoadingSpinner.vue'

const days = ref(90)
const loading = ref(false)
const error = ref(null)
const users = ref([])
const total = ref(0)
const search = ref('')
const remindersSent = ref(0)

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return users.value
  return users.value.filter(u =>
    `${u.firstname} ${u.lastname} ${u.email} ${u.country || ''} ${u.organisation || ''}`.toLowerCase().includes(q)
  )
})

const formatDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const load = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await api.get('/users/incomplete-registrations', { params: { days: days.value } })
    users.value = (res.data.users || []).map(u => ({ ...u, _sending: false, _sent: false }))
    total.value = res.data.total || 0
    remindersSent.value = 0
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to load data'
  } finally {
    loading.value = false
  }
}

const sendReminder = async (user) => {
  user._sending = true
  try {
    await api.post(`/users/send-incomplete-reminder/${user.id}`)
    user._sent = true
    remindersSent.value++
  } catch (err) {
    alert(err.response?.data?.detail || 'Failed to send reminder')
  } finally {
    user._sending = false
  }
}

onMounted(load)
</script>
