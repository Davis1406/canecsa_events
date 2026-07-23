<template>
  <div class="flex-1 flex flex-col w-full max-w-7xl mx-auto p-6 space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-semibold text-black">Activity History</h1>
        <p class="text-sm text-gray-400 mt-0.5">
          Real-time log of user actions on the platform
        </p>
      </div>
      <div class="flex items-center gap-2">
        <!-- Auto-refresh indicator -->
        <div class="flex items-center gap-1.5 text-xs text-gray-400">
          <span class="w-2 h-2 rounded-full animate-pulse" style="background-color:#1a1d56;"></span>
          Live · refreshes every 30s
        </div>
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

    <!-- Stats cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style="background-color:#e6f7fb;">
          <svg class="w-5 h-5" style="color:#1a1d56;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-800">{{ stats.total }}</p>
          <p class="text-xs text-gray-400 mt-0.5">Total actions</p>
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-50">
          <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
          </svg>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-800">{{ stats.logins }}</p>
          <p class="text-xs text-gray-400 mt-0.5">Logins</p>
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-purple-50">
          <svg class="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-800">{{ stats.unique_users }}</p>
          <p class="text-xs text-gray-400 mt-0.5">Active users</p>
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-50">
          <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
          </svg>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-800">{{ stats.registrations }}</p>
          <p class="text-xs text-gray-400 mt-0.5">New accounts</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow-sm p-4 flex flex-wrap gap-3 items-center">

      <!-- Time range chips -->
      <div class="flex items-center gap-1 flex-shrink-0">
        <button v-for="opt in timeOptions" :key="opt.value"
          @click="hours = opt.value; load()"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          :class="hours === opt.value
            ? 'text-white'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
          :style="hours === opt.value ? 'background-color:#1a1d56;' : ''">
          {{ opt.label }}
        </button>
      </div>

      <div class="w-px h-6 bg-gray-200 flex-shrink-0"></div>

      <!-- Action type filter -->
      <select v-model="filterAction" @change="applyFilters"
        class="input text-sm w-52 flex-shrink-0">
        <option value="">All action types</option>
        <option v-for="a in actionTypes" :key="a" :value="a">{{ formatAction(a) }}</option>
      </select>

      <!-- Search -->
      <div class="flex-1 min-w-[180px] relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/>
        </svg>
        <input v-model="searchText" @input="debouncedSearch" type="text"
          placeholder="Search by user name or email…"
          class="input w-full pl-9 text-sm" />
      </div>

      <!-- Results count -->
      <span class="text-xs text-gray-400 flex-shrink-0">
        {{ filtered.length }} {{ filtered.length === 1 ? 'entry' : 'entries' }}
      </span>
    </div>

    <!-- Activity table -->
    <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div v-if="loading" class="p-10 text-center text-gray-400 text-sm">Loading activity…</div>
      <div v-else-if="filtered.length === 0" class="p-10 text-center text-gray-400 text-sm">
        No activity found for the selected period.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <th class="px-5 py-3 text-left w-40">Time</th>
              <th class="px-5 py-3 text-left">User</th>
              <th class="px-5 py-3 text-left w-52">Action</th>
              <th class="px-5 py-3 text-left hidden md:table-cell">Detail</th>
              <th class="px-5 py-3 text-left hidden lg:table-cell w-36">IP Address</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="log in paginated" :key="log.id"
              class="hover:bg-gray-50 transition-colors">

              <!-- Time -->
              <td class="px-5 py-3 whitespace-nowrap">
                <p class="text-xs font-semibold text-gray-700">{{ relativeTime(log.created_at) }}</p>
                <p class="text-xs text-gray-400 mt-0.5">{{ formatTime(log.created_at) }}</p>
              </td>

              <!-- User -->
              <td class="px-5 py-3">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 uppercase"
                    :style="{ backgroundColor: avatarColor(log.user_name) }">
                    {{ initials(log.user_name) }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium text-gray-800 truncate">{{ log.user_name }}</p>
                    <p v-if="log.user_email" class="text-xs text-gray-400 truncate">{{ log.user_email }}</p>
                  </div>
                </div>
              </td>

              <!-- Action badge -->
              <td class="px-5 py-3 whitespace-nowrap">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="actionClass(log.action)">
                  <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="actionDot(log.action)"></span>
                  {{ formatAction(log.action) }}
                </span>
              </td>

              <!-- Detail -->
              <td class="px-5 py-3 hidden md:table-cell">
                <span class="text-xs text-gray-500 truncate max-w-[220px] block">
                  {{ log.target || '—' }}
                </span>
              </td>

              <!-- IP -->
              <td class="px-5 py-3 hidden lg:table-cell">
                <span class="text-xs font-mono text-gray-400">{{ log.ip_address || '—' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1"
        class="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
        <span>Page {{ page }} of {{ totalPages }}</span>
        <div class="flex gap-1">
          <button @click="page = Math.max(1, page - 1)" :disabled="page === 1"
            class="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition">← Prev</button>
          <button @click="page = Math.min(totalPages, page + 1)" :disabled="page === totalPages"
            class="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition">Next →</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '@/plugins/axios'

const logs        = ref([])
const actionTypes = ref([])
const loading     = ref(true)
const hours       = ref(24)
const filterAction = ref('')
const searchText  = ref('')
const page        = ref(1)
const pageSize    = 50
let refreshTimer  = null
let searchTimer   = null

const stats = ref({ total: 0, logins: 0, registrations: 0, unique_users: 0 })

const timeOptions = [
  { label: 'Last 1h',  value: 1  },
  { label: 'Last 6h',  value: 6  },
  { label: 'Last 24h', value: 24 },
  { label: 'Last 7d',  value: 168 },
]

async function load() {
  loading.value = true
  try {
    const params = new URLSearchParams({ hours: hours.value, limit: 300 })
    if (filterAction.value) params.set('action', filterAction.value)
    if (searchText.value.trim()) params.set('search', searchText.value.trim())

    const [actRes, actionsRes] = await Promise.all([
      api.get(`/activity/?${params}`),
      actionTypes.value.length ? Promise.resolve(null) : api.get('/activity/actions'),
    ])
    logs.value  = actRes.data.logs  || []
    stats.value = actRes.data.stats || {}
    if (actionsRes) actionTypes.value = actionsRes.data || []
    page.value = 1
  } catch (e) {
    console.error('Failed to load activity', e)
  } finally {
    loading.value = false
  }
}

function applyFilters() { page.value = 1; load() }

function debouncedSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => load(), 350)
}

// Client-side filter is just for instant text search feedback (server also filters)
const filtered = computed(() => logs.value)

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const paginated  = computed(() =>
  filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize)
)

// ── Formatting helpers ────────────────────────────────────────────────────────

function formatAction(action) {
  return action
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
}

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    + ' · ' + d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function relativeTime(iso) {
  if (!iso) return ''
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)  return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function initials(name) {
  if (!name || name === 'System') return '?'
  const parts = name.trim().split(' ')
  return (parts[0]?.[0] || '') + (parts[1]?.[0] || '')
}

const AVATAR_COLORS = ['#1a1d56','#27ae60','#8e44ad','#e67e22','#c0392b','#171a4d','#f59d08']
function avatarColor(name) {
  let hash = 0
  for (const ch of (name || '')) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function actionClass(action) {
  if (action === 'USER_LOGIN')          return 'bg-green-100 text-green-700'
  if (action === 'USER_REGISTER')       return 'bg-blue-100 text-blue-700'
  if (action === 'USER_RESET_PASSWORD') return 'bg-purple-100 text-purple-700'
  if (action === 'SUBMIT_ABSTRACT')     return 'bg-cyan-100 text-cyan-700'
  if (action.startsWith('ADD_'))        return 'bg-teal-100 text-teal-700'
  if (action.startsWith('UPDATE_'))     return 'bg-amber-100 text-amber-700'
  if (action.includes('DEREGISTER') || action.includes('DELETE')) return 'bg-red-100 text-red-700'
  if (action.startsWith('DOWNLOAD_'))   return 'bg-indigo-100 text-indigo-700'
  if (action.startsWith('VERIFY_'))     return 'bg-lime-100 text-lime-700'
  return 'bg-gray-100 text-gray-600'
}

function actionDot(action) {
  if (action === 'USER_LOGIN')          return 'bg-green-500'
  if (action === 'USER_REGISTER')       return 'bg-blue-500'
  if (action === 'USER_RESET_PASSWORD') return 'bg-purple-500'
  if (action === 'SUBMIT_ABSTRACT')     return 'bg-cyan-500'
  if (action.startsWith('ADD_'))        return 'bg-teal-500'
  if (action.startsWith('UPDATE_'))     return 'bg-amber-500'
  if (action.includes('DEREGISTER') || action.includes('DELETE')) return 'bg-red-500'
  if (action.startsWith('DOWNLOAD_'))   return 'bg-indigo-500'
  if (action.startsWith('VERIFY_'))     return 'bg-lime-500'
  return 'bg-gray-400'
}

onMounted(() => {
  load()
  // Auto-refresh every 30 seconds
  refreshTimer = setInterval(load, 30000)
})

onUnmounted(() => {
  clearInterval(refreshTimer)
  clearTimeout(searchTimer)
})
</script>
