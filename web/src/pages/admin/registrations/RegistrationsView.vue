<template>
  <div class="flex-1 flex flex-col max-w-7xl w-full mx-auto overflow-hidden">
    <AdminBar title="Registrations">
      <a href="#" class="text-sm text-blue-600 hover:underline">Registrations</a>
    </AdminBar>

    <div class="px-6 pt-4 pb-2">
      <h1 class="text-xl font-bold text-gray-800">Event Registrations</h1>
    </div>

    <!-- Filters -->
    <div class="px-6 pb-4 flex flex-col md:flex-row md:items-center gap-3 flex-wrap">
      <input
        v-model="search"
        type="text"
        placeholder="Search by name, email or phone..."
        class="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
      />
      <select
        v-model="selectedEventId"
        class="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
      >
        <option :value="null">All Events</option>
        <option v-for="e in events" :key="e.id" :value="e.id">{{ e.event }}</option>
      </select>
      <select
        v-model="paidFilter"
        class="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
      >
        <option value="all">All Payment Status</option>
        <option value="true">Paid</option>
        <option value="false">Unpaid</option>
      </select>
      <!-- Proof filter -->
      <select
        v-model="proofFilter"
        class="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
      >
        <option value="all">All Proof Status</option>
        <option value="with_proof">Has Proof</option>
        <option value="no_proof">No Proof</option>
      </select>
      <button
        v-if="canExport"
        @click="exportRegistrations"
        :disabled="exporting"
        class="ml-auto flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl transition text-sm"
      >
        <ArrowDownTrayIcon class="w-4 h-4" />
        {{ exporting ? 'Exporting…' : 'Export Excel' }}
      </button>
    </div>

    <main class="px-6 pb-6">
      <div class="w-full overflow-hidden bg-white shadow rounded-lg">
        <table class="w-full table-auto text-sm text-gray-800 rounded-lg overflow-hidden">
          <thead class="bg-gray-100 text-left uppercase text-xs text-gray-800 hidden md:table-header-group">
            <tr>
              <th class="px-4 py-3">#</th>
              <th class="px-4 py-3">Name</th>
              <th class="px-4 py-3">Email</th>
              <th class="px-4 py-3">Event</th>
              <th class="px-4 py-3">Role</th>
              <th class="px-4 py-3">Payment</th>
              <th class="px-4 py-3">Proof</th>
              <th class="px-4 py-3">Registered</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="9" class="py-8 text-center">
                <DataLoadingSpinner />
              </td>
            </tr>
            <tr
              v-for="(reg, index) in filteredRegistrations"
              :key="reg.id"
              class="border-t hover:bg-gray-50 even:bg-gray-50 odd:bg-white"
              v-else
            >
              <td class="px-4 py-3 text-gray-400 text-xs font-mono">
                {{ (currentPage - 1) * perPage + index + 1 }}
              </td>
              <td class="px-4 py-3 font-medium">
                {{ reg.title ? reg.title + ' ' : '' }}{{ reg.firstname }} {{ reg.lastname }}
                <div class="text-xs text-gray-400">{{ reg.phone }}</div>
                <div v-if="noteEditingId !== reg.id" class="mt-1">
                  <span v-if="reg.notes"
                    @click="startEditNote(reg)"
                    class="inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full cursor-pointer hover:bg-amber-100"
                    title="Click to edit note">
                    📌 {{ reg.notes }}
                  </span>
                  <button v-else @click="startEditNote(reg)"
                    class="text-[10px] text-gray-300 hover:text-gray-500 underline">
                    + note
                  </button>
                </div>
                <div v-else class="mt-1 flex items-center gap-1">
                  <input v-model="noteDraft" type="text" placeholder="e.g. MPA Sponsored"
                    class="text-xs border border-gray-300 rounded-md px-1.5 py-0.5 w-32"
                    @keyup.enter="saveNote(reg)" @keyup.esc="noteEditingId = null" />
                  <button @click="saveNote(reg)" class="text-green-600 hover:text-green-800 text-xs">✓</button>
                  <button @click="noteEditingId = null" class="text-gray-400 hover:text-gray-600 text-xs">✕</button>
                </div>
              </td>
              <td class="px-4 py-3 text-gray-600">{{ reg.email }}</td>
              <td class="px-4 py-3 text-gray-600">{{ reg.event || '—' }}</td>
              <td class="px-4 py-3">
                <span class="inline-block px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full border border-blue-200 capitalize">
                  {{ reg.participation_role?.replace('_', ' ') || '—' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span
                  :class="reg.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                  class="inline-block px-2 py-0.5 text-xs rounded-full font-semibold"
                >
                  {{ reg.paid ? '✅ Paid' : 'Unpaid' }}
                </span>
              </td>
              <!-- Proof column -->
              <td class="px-4 py-3">
                <span v-if="!reg.payment_proof" class="text-xs text-gray-300">—</span>
                <button
                  v-else
                  @click="viewProof(reg)"
                  class="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-semibold transition"
                  :class="reg.paid
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'"
                  :title="reg.paid ? 'View payment proof (verified)' : 'View payment proof (pending)'"
                >
                  <DocumentTextIcon class="w-3 h-3" />
                  {{ reg.paid ? 'Verified' : 'Pending' }}
                </button>
              </td>
              <td class="px-4 py-3 text-gray-500 text-xs">{{ formatDate(reg.registered_at) }}</td>
              <!-- Actions -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-1">
                  <button
                    v-if="reg.payment_proof && !reg.paid"
                    @click="verifyPayment(reg)"
                    class="text-green-600 hover:text-green-800 text-xs font-semibold px-2 py-1 bg-green-50 border border-green-300 rounded-lg transition"
                    title="Verify payment"
                  >
                    ✓ Verify
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!isLoading && filteredRegistrations.length === 0">
              <td colspan="9" class="text-center px-6 py-8 text-gray-400">No registrations found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex flex-col md:flex-row md:items-center justify-between mt-4 gap-4 text-sm text-gray-600">
        <div class="flex items-center space-x-2">
          <label class="text-sm">Show</label>
          <select
            v-model="perPage"
            class="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#1a1d56]"
          >
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
          <span class="text-gray-400">of {{ total }} total</span>
        </div>
        <div class="text-center">Page {{ currentPage }} of {{ totalPages }}</div>
        <div class="flex justify-end items-center space-x-2">
          <button
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
          >Previous</button>
          <button
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            class="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
          >Next</button>
        </div>
      </div>
    </main>

    <!-- ── Payment Proof Modal ────────────────────────────────────────────── -->
    <div
      v-if="showProofModal && proofRegistration"
      class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      @click.self="showProofModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh]">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
              :style="{ backgroundColor: proofRegistration.paid ? '#dcfce7' : '#fef9c3' }">
              <DocumentTextIcon class="w-5 h-5" :class="proofRegistration.paid ? 'text-green-600' : 'text-amber-500'" />
            </div>
            <div>
              <p class="font-bold text-gray-800 text-sm">Payment Proof Document</p>
              <p class="text-xs text-gray-400">
                {{ proofRegistration.firstname }} {{ proofRegistration.lastname }}
                &middot; {{ proofRegistration.email }}
              </p>
            </div>
          </div>
          <button @click="showProofModal = false"
            class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Status bar -->
        <div class="px-5 py-2.5 flex items-center gap-2 text-xs border-b"
          :class="proofRegistration.paid ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'">
          <span v-if="proofRegistration.paid"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
            ✅ Payment Verified
          </span>
          <span v-else
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
            ⏳ Awaiting Verification
          </span>
          <span class="text-gray-400">·</span>
          <span class="text-gray-500">{{ proofRegistration.event || 'N/A' }}</span>
          <span class="text-gray-400">·</span>
          <span class="text-gray-500 capitalize">{{ proofRegistration.participation_role?.replace('_', ' ') || '—' }}</span>
        </div>

        <!-- Document viewer -->
        <div class="flex-1 overflow-auto p-5 min-h-0">

          <!-- Image proof -->
          <div v-if="isImageProof(proofRegistration.payment_proof)"
            class="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center min-h-[300px]">
            <img
              :src="proofUrl(proofRegistration.payment_proof)"
              alt="Payment proof"
              class="max-w-full max-h-[60vh] object-contain"
            />
          </div>

          <!-- PDF proof -->
          <div v-else-if="proofRegistration.payment_proof?.toLowerCase().endsWith('.pdf')"
            class="rounded-xl overflow-hidden border border-gray-200 bg-gray-50" style="height: 60vh;">
            <iframe
              :src="proofUrl(proofRegistration.payment_proof)"
              class="w-full h-full"
              frameborder="0"
            ></iframe>
          </div>

          <!-- Other file type -->
          <div v-else
            class="rounded-xl border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center py-12 gap-3">
            <DocumentTextIcon class="w-12 h-12 text-gray-300" />
            <p class="text-sm text-gray-500">Preview not available for this file type.</p>
            <a :href="proofUrl(proofRegistration.payment_proof)" target="_blank"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
              style="background-color:#1a1d56;">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Download File
            </a>
          </div>
        </div>

        <!-- Footer actions -->
        <div class="flex items-center justify-between px-5 py-4 border-t border-gray-100 flex-shrink-0 gap-3">
          <a :href="proofUrl(proofRegistration.payment_proof)" target="_blank"
            class="inline-flex items-center gap-1.5 text-sm text-[#1a1d56] hover:underline font-medium">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
            Open in new tab
          </a>
          <div class="flex gap-2">
            <button @click="showProofModal = false"
              class="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition font-medium">
              Close
            </button>
            <button
              v-if="!proofRegistration.paid"
              @click="verifyPayment(proofRegistration); showProofModal = false"
              class="inline-flex items-center gap-2 px-5 py-2 text-sm bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Verify Payment
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ArrowDownTrayIcon, DocumentTextIcon } from '@heroicons/vue/24/outline'
import AdminBar from '@/components/common/AdminBar.vue'
import DataLoadingSpinner from '@/components/common/DataLoadingSpinner.vue'
import api from '@/plugins/axios'
import { debounce } from 'lodash'

const auth = useAuthStore()
const baseUrl = import.meta.env.VITE_API_BASE_URL

const search = ref('')
const debouncedSearch = ref('')
const selectedEventId = ref(null)
const paidFilter = ref('all')
const proofFilter = ref('all')
const currentPage = ref(1)
const perPage = ref(10)
const totalPages = ref(1)
const total = ref(0)
const registrations = ref([])
const events = ref([])
const isLoading = ref(false)
const exporting = ref(false)

// Proof modal state
const showProofModal = ref(false)
const proofRegistration = ref(null)

// Inline note editing (e.g. "MPA Sponsored")
const noteEditingId = ref(null)
const noteDraft = ref('')

function startEditNote(reg) {
  noteEditingId.value = reg.id
  noteDraft.value = reg.notes || ''
}

async function saveNote(reg) {
  try {
    const res = await api.put(`/registrations/${reg.id}/notes`, { notes: noteDraft.value })
    reg.notes = res.data.notes
  } catch (e) {
    alert('Failed to save note: ' + (e.response?.data?.detail || e.message))
  } finally {
    noteEditingId.value = null
  }
}

const canExport = computed(() => auth.hasPermission('EXPORT_REGISTRATIONS'))

// Client-side proof filter on top of server-side filters
const filteredRegistrations = computed(() => {
  if (proofFilter.value === 'with_proof') return registrations.value.filter(r => r.payment_proof)
  if (proofFilter.value === 'no_proof') return registrations.value.filter(r => !r.payment_proof)
  return registrations.value
})

const updateDebouncedSearch = debounce((val) => {
  debouncedSearch.value = val
  currentPage.value = 1
}, 300)

watch(search, updateDebouncedSearch)
watch([perPage, selectedEventId, paidFilter], () => (currentPage.value = 1))

const fetchEvents = async () => {
  try {
    const res = await api.get('/events/?limit=200')
    events.value = res.data?.data || []
  } catch (e) {
    console.error('Failed to load events', e)
  }
}

const fetchRegistrations = async () => {
  isLoading.value = true
  try {
    const skip = (currentPage.value - 1) * perPage.value
    const params = {
      skip,
      limit: perPage.value,
      search: debouncedSearch.value,
      paid: paidFilter.value,
    }
    if (selectedEventId.value) params.event_id = selectedEventId.value
    const res = await api.get('/registrations/', { params })
    registrations.value = res.data.data
    totalPages.value = res.data.pages || 1
    total.value = res.data.total || 0
  } catch (e) {
    console.error('Failed to load registrations', e)
  } finally {
    isLoading.value = false
  }
}

const exportRegistrations = async () => {
  exporting.value = true
  try {
    const params = { paid: paidFilter.value, search: debouncedSearch.value }
    if (selectedEventId.value) params.event_id = selectedEventId.value
    const res = await api.get('/registrations/export', {
      params,
      responseType: 'blob',
    })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = 'registrations_export.xlsx'
    a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    console.error('Export failed', e)
  } finally {
    exporting.value = false
  }
}

function proofUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${baseUrl}/${path}`
}

function isImageProof(path) {
  if (!path) return false
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(path)
}

function viewProof(reg) {
  proofRegistration.value = reg
  showProofModal.value = true
}

async function verifyPayment(reg) {
  if (!confirm(`Verify payment for ${reg.firstname} ${reg.lastname}? This will mark them as paid.`)) return
  try {
    await api.put(`/events/verify_payment/${reg.id}`)
    reg.paid = true  // optimistic update in current list
    alert(`Payment verified for ${reg.firstname} ${reg.lastname}.`)
    fetchRegistrations()
  } catch (e) {
    alert('Failed to verify: ' + (e.response?.data?.detail || e.message))
  }
}

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

watch([currentPage, perPage, debouncedSearch, selectedEventId, paidFilter], fetchRegistrations)
onMounted(() => {
  fetchEvents()
  fetchRegistrations()
})
</script>
