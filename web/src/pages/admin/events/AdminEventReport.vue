<template>
  <div class="flex-1 flex flex-col max-w-7xl w-full mx-auto">
    <AdminBar title="Event Report">
      <router-link :to="{ name: 'Events' }" class="text-sm text-blue-600 hover:underline">Events</router-link>
      <span class="mx-2 text-sm text-gray-500">/</span>
      <router-link :to="{ name: 'AdminEvent', params: { id: eventId } }" class="text-sm text-blue-600 hover:underline">View Event</router-link>
      <span class="mx-2 text-sm text-gray-500">/</span>
      <span class="text-sm text-gray-700">Report</span>
    </AdminBar>

    <!-- Back button -->
    <div class="px-4 pt-4">
      <router-link :to="{ name: 'AdminEvent', params: { id: eventId } }"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition font-medium">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Back to Participant List
      </router-link>
    </div>

    <div class="px-4 pt-4 pb-10 space-y-6">

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20"><DataLoadingSpinner /></div>

      <template v-else>
        <!-- Event title -->
        <div>
          <h1 class="text-2xl font-bold text-gray-800">{{ event?.event }}</h1>
          <p class="text-sm text-gray-500 mt-1">
            {{ formatDate(event?.start_date) }} – {{ formatDate(event?.end_date) }} &middot; {{ event?.location }}, {{ event?.country }}
          </p>
        </div>

        <!-- ── Filters ─────────────────────────────────────────── -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 flex flex-wrap gap-4 items-end">
          <div class="flex-1 min-w-[160px]">
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Payment Status</label>
            <select v-model="filterPaid" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1d56]">
              <option value="all">All</option>
              <option value="paid">Paid only</option>
              <option value="unpaid">Unpaid only</option>
              <option value="proof">Proof uploaded</option>
            </select>
          </div>
          <div class="flex-1 min-w-[160px]">
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Country</label>
            <select v-model="filterCountry" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1d56]">
              <option value="">All Countries</option>
              <option v-for="c in allCountries" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div class="flex-1 min-w-[160px]">
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Role</label>
            <select v-model="filterRole" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1d56]">
              <option value="">All Roles</option>
              <option v-for="r in allRoles" :key="r" :value="r">{{ r.replace(/_/g, ' ') }}</option>
            </select>
          </div>
          <div class="flex-1 min-w-[160px]">
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Payment Method</label>
            <select v-model="filterMethod" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1d56]">
              <option value="">All Methods</option>
              <option v-for="m in allMethods" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
          <button @click="resetFilters" class="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
            Reset Filters
          </button>
        </div>

        <!-- ── Summary cards ───────────────────────────────────── -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex flex-col gap-1">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total (filtered)</p>
            <p class="text-3xl font-bold text-gray-700">{{ filtered.length }}</p>
            <p class="text-xs text-gray-400">of {{ participants.length }} total</p>
          </div>
          <div class="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex flex-col gap-1">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Paid</p>
            <p class="text-3xl font-bold" style="color:#1a1d56">{{ filtered.filter(p => p.paid).length }}</p>
            <div class="w-full bg-gray-100 rounded-full h-1.5 mt-1">
              <div class="h-1.5 rounded-full transition-all" style="background:#1a1d56"
                :style="{ width: paidPct + '%' }"></div>
            </div>
            <p class="text-xs text-gray-400">{{ paidPct }}%</p>
          </div>
          <div class="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex flex-col gap-1">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Unpaid</p>
            <p class="text-3xl font-bold text-orange-500">{{ filtered.filter(p => !p.paid).length }}</p>
            <div class="w-full bg-gray-100 rounded-full h-1.5 mt-1">
              <div class="h-1.5 rounded-full bg-orange-400 transition-all"
                :style="{ width: (100 - paidPct) + '%' }"></div>
            </div>
          </div>
          <div class="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex flex-col gap-1">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Proof Uploaded</p>
            <p class="text-3xl font-bold text-amber-500">{{ filtered.filter(p => p.payment_proof).length }}</p>
            <p class="text-xs text-gray-400">awaiting verification</p>
          </div>
        </div>

        <!-- ── Breakdowns ──────────────────────────────────────── -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

          <!-- By Country -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:col-span-1">
            <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">By Country</h2>
            <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
              <div v-for="[country, count] in countryCounts" :key="country" class="flex items-center gap-2">
                <span class="text-sm text-gray-700 flex-1 truncate">{{ country || 'Unknown' }}</span>
                <div class="w-24 bg-gray-100 rounded-full h-1.5 flex-shrink-0">
                  <div class="h-1.5 rounded-full" style="background:#1a1d56"
                    :style="{ width: (count / filtered.length * 100) + '%' }"></div>
                </div>
                <span class="text-xs font-semibold text-gray-500 w-8 text-right flex-shrink-0">{{ count }}</span>
              </div>
            </div>
          </div>

          <!-- By Role -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">By Role</h2>
            <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
              <div v-for="[role, count] in roleCounts" :key="role" class="flex items-center gap-2">
                <span class="text-sm text-gray-700 flex-1 truncate capitalize">{{ role.replace(/_/g, ' ') }}</span>
                <div class="w-24 bg-gray-100 rounded-full h-1.5 flex-shrink-0">
                  <div class="h-1.5 rounded-full bg-indigo-500"
                    :style="{ width: (count / filtered.length * 100) + '%' }"></div>
                </div>
                <span class="text-xs font-semibold text-gray-500 w-8 text-right flex-shrink-0">{{ count }}</span>
              </div>
            </div>
          </div>

          <!-- By Payment Method -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">By Payment Method</h2>
            <div v-if="methodCounts.length === 0" class="text-sm text-gray-400 italic">No payment data yet.</div>
            <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
              <div v-for="[method, count] in methodCounts" :key="method" class="flex items-center gap-2">
                <span class="text-sm text-gray-700 flex-1 truncate">{{ method }}</span>
                <div class="w-24 bg-gray-100 rounded-full h-1.5 flex-shrink-0">
                  <div class="h-1.5 rounded-full bg-green-500"
                    :style="{ width: (count / filtered.filter(p=>p.payment_method).length * 100) + '%' }"></div>
                </div>
                <span class="text-xs font-semibold text-gray-500 w-8 text-right flex-shrink-0">{{ count }}</span>
              </div>
            </div>
            <div v-if="totalAmount > 0" class="mt-4 pt-3 border-t border-gray-100">
              <p class="text-xs text-gray-400 uppercase tracking-wide font-semibold">Total Amount Collected</p>
              <p class="text-2xl font-bold text-green-600 mt-1">${{ totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</p>
            </div>
          </div>
        </div>

        <!-- ── Participant list ────────────────────────────────── -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wide">Participant Details</h2>
            <span class="text-xs text-gray-400">{{ filtered.length }} record(s)</span>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-100 text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">#</th>
                  <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">Name</th>
                  <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">Country</th>
                  <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">Organisation</th>
                  <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">Role</th>
                  <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">Payment</th>
                  <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">Method</th>
                  <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">Amount (USD)</th>
                  <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">Proof</th>
                  <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">Registered</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-if="filtered.length === 0">
                  <td colspan="10" class="text-center py-8 text-gray-400 italic">No participants match the selected filters.</td>
                </tr>
                <tr v-for="(p, idx) in filtered" :key="p.id" class="hover:bg-gray-50">
                  <td class="px-4 py-2.5 text-xs text-gray-400">{{ idx + 1 }}</td>
                  <td class="px-4 py-2.5 font-medium text-gray-800">{{ p.firstname }} {{ p.lastname }}</td>
                  <td class="px-4 py-2.5 text-gray-600">{{ p.country || '—' }}</td>
                  <td class="px-4 py-2.5 text-gray-600 text-xs">{{ p.organisation || '—' }}</td>
                  <td class="px-4 py-2.5 text-gray-600 capitalize text-xs">{{ (p.participation_role || '—').replace(/_/g, ' ') }}</td>
                  <td class="px-4 py-2.5">
                    <span v-if="p.paid" class="inline-block px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full font-semibold">✅ Paid</span>
                    <span v-else-if="p.payment_proof" class="inline-block px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full font-semibold">⏳ Proof</span>
                    <span v-else class="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">Unpaid</span>
                  </td>
                  <td class="px-4 py-2.5 text-gray-600 text-xs">{{ p.payment_method || '—' }}</td>
                  <td class="px-4 py-2.5 text-gray-600 text-xs">
                    {{ p.payment_amount != null ? '$' + Number(p.payment_amount).toFixed(2) : '—' }}
                  </td>
                  <td class="px-4 py-2.5">
                    <a v-if="p.payment_proof" :href="proofUrl(p.payment_proof)" target="_blank"
                      class="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                      <DocumentTextIcon class="w-3.5 h-3.5" /> View
                    </a>
                    <span v-else class="text-xs text-gray-300">—</span>
                  </td>
                  <td class="px-4 py-2.5 text-xs text-gray-500">{{ p.registered_at ? formatDate(p.registered_at) : '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { DocumentTextIcon } from '@heroicons/vue/24/outline'
import AdminBar from '@/components/common/AdminBar.vue'
import DataLoadingSpinner from '@/components/common/DataLoadingSpinner.vue'
import api from '@/plugins/axios'

const baseUrl = import.meta.env.VITE_API_BASE_URL
const route = useRoute()
const eventId = Number(route.params.id)

const event = ref(null)
const participants = ref([])
const loading = ref(true)

// Filters
const filterPaid = ref('all')
const filterCountry = ref('')
const filterRole = ref('')
const filterMethod = ref('')

function resetFilters() {
  filterPaid.value = 'all'
  filterCountry.value = ''
  filterRole.value = ''
  filterMethod.value = ''
}

const filtered = computed(() => {
  return participants.value.filter(p => {
    if (filterPaid.value === 'paid' && !p.paid) return false
    if (filterPaid.value === 'unpaid' && p.paid) return false
    if (filterPaid.value === 'proof' && !p.payment_proof) return false
    if (filterCountry.value && p.country !== filterCountry.value) return false
    if (filterRole.value && p.participation_role !== filterRole.value) return false
    if (filterMethod.value && p.payment_method !== filterMethod.value) return false
    return true
  })
})

const paidPct = computed(() => {
  if (!filtered.value.length) return 0
  return Math.round(filtered.value.filter(p => p.paid).length / filtered.value.length * 100)
})

const allCountries = computed(() => {
  const set = new Set(participants.value.map(p => p.country).filter(Boolean))
  return [...set].sort()
})

const allRoles = computed(() => {
  const set = new Set(participants.value.map(p => p.participation_role).filter(Boolean))
  return [...set].sort()
})

const allMethods = computed(() => {
  const set = new Set(participants.value.map(p => p.payment_method).filter(Boolean))
  return [...set].sort()
})

const countryCounts = computed(() => {
  const counts = {}
  for (const p of filtered.value) {
    const k = p.country || 'Unknown'
    counts[k] = (counts[k] || 0) + 1
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
})

const roleCounts = computed(() => {
  const counts = {}
  for (const p of filtered.value) {
    const k = p.participation_role || 'unknown'
    counts[k] = (counts[k] || 0) + 1
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
})

const methodCounts = computed(() => {
  const counts = {}
  for (const p of filtered.value) {
    if (p.payment_method) {
      counts[p.payment_method] = (counts[p.payment_method] || 0) + 1
    }
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
})

const totalAmount = computed(() => {
  return filtered.value.reduce((sum, p) => sum + (p.payment_amount || 0), 0)
})

function proofUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${baseUrl}/${path}`
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(async () => {
  try {
    const res = await api.get(`/events/${eventId}`)
    event.value = res.data.event
    participants.value = res.data.participants || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
