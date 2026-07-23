<template>
  <div class="flex-1 flex flex-col w-full max-w-7xl mx-auto p-6 space-y-6 overflow-x-hidden">

    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-semibold text-black">Abstract Reviewers</h1>
        <p v-if="!isLoading" class="text-sm text-gray-400 mt-0.5">
          {{ filteredReviewers.length }} reviewer{{ filteredReviewers.length !== 1 ? 's' : '' }}
        </p>
      </div>
      <button @click="showNewReviewer = true"
        class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
        style="background-color: #1a1d56;">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        New Reviewer
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow p-4 flex flex-wrap gap-3">
      <input v-model="search" type="text" placeholder="Search by name or email..."
        class="input flex-1 min-w-[200px]" />
      <select v-model="selectedEventId" class="input w-44" @change="fetchReviewers">
        <option :value="null">All Events</option>
        <option v-for="e in events" :key="e.id" :value="e.id">{{ e.event }}</option>
      </select>
    </div>

    <!-- Reviewer cards -->
    <div v-if="isLoading" class="p-8 text-center text-gray-500">Loading reviewers...</div>
    <div v-else-if="filteredReviewers.length === 0" class="bg-white rounded-2xl shadow p-10 text-center text-gray-400">
      No reviewers found.
    </div>

    <div v-for="reviewer in filteredReviewers" :key="reviewer.reviewer_id"
      class="bg-white rounded-2xl shadow overflow-hidden">

      <!-- Reviewer header row -->
      <div class="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition"
        @click="toggle(reviewer.reviewer_id)">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-[#1a1d56] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {{ initials(reviewer.name) }}
          </div>
          <div>
            <p class="font-semibold text-gray-800">{{ reviewer.name }}</p>
            <p class="text-xs text-gray-400">{{ reviewer.email }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-right hidden sm:block">
            <p class="text-sm font-medium text-gray-700">{{ reviewer.total }} abstract{{ reviewer.total !== 1 ? 's' : '' }}</p>
            <p class="text-xs text-gray-400">{{ reviewer.completed }} reviewed</p>
          </div>
          <span class="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {{ reviewer.total - reviewer.completed }} pending
          </span>
          <span class="px-2 py-0.5 text-xs rounded-full bg-green-50 text-green-700 border border-green-200">
            {{ reviewer.completed }} done
          </span>
          <!-- Assign button — stops click from toggling collapse -->
          <button @click.stop="openAssign(reviewer)"
            class="px-3 py-1 rounded-lg text-xs font-semibold border border-[#1a1d56] text-[#1a1d56] hover:bg-[#1a1d56]/10 transition">
            Assign
          </button>
          <ChevronDownIcon class="w-5 h-5 text-gray-400 transition-transform"
            :class="expanded.has(reviewer.reviewer_id) ? 'rotate-180' : ''" />
        </div>
      </div>

      <!-- Assignment rows -->
      <div v-if="expanded.has(reviewer.reviewer_id)" class="border-t divide-y">
        <div v-if="reviewer.assignments.length === 0" class="px-6 py-4 text-sm text-gray-400">
          No abstracts assigned yet.
        </div>
        <div v-for="a in reviewer.assignments" :key="a.assignment_id"
          class="flex items-center justify-between px-6 py-3 hover:bg-gray-50">
          <div class="flex-1 min-w-0 mr-4">
            <p class="text-sm font-medium text-gray-700 truncate">{{ a.abstract_title }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ a.event || '—' }} · Assigned {{ formatDate(a.assigned_at) }}</p>
          </div>
          <div class="flex items-center gap-3 flex-shrink-0">
            <span :class="a.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
              class="px-2 py-0.5 rounded-full text-xs font-semibold">
              {{ a.completed ? 'Reviewed' : 'Pending' }}
            </span>
            <router-link :to="{ name: 'AdminAbstract', params: { id: a.abstract_id } }"
              class="text-xs text-blue-600 hover:underline">View</router-link>
            <button @click="removeAssignment(reviewer.reviewer_id, a.abstract_id)"
              class="text-xs text-red-400 hover:text-red-600">Remove</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── New Reviewer Modal ─────────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showNewReviewer" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-800">New Reviewer</h2>
            <button @click="closeNewReviewer" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <p class="text-sm text-gray-500">A login account will be created and credentials emailed to the reviewer.</p>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input v-model="newReviewer.firstname" type="text" class="input w-full" placeholder="Jane" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input v-model="newReviewer.lastname" type="text" class="input w-full" placeholder="Doe" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input v-model="newReviewer.email" type="email" class="input w-full" placeholder="jane.doe@example.com" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone <span class="text-gray-400 font-normal">(optional)</span></label>
            <input v-model="newReviewer.phone" type="text" class="input w-full" placeholder="+1 555 000 0000" />
          </div>

          <p v-if="newReviewerErr" class="text-sm text-red-500">{{ newReviewerErr }}</p>
          <p v-if="newReviewerSuccess" class="text-sm text-green-600">{{ newReviewerSuccess }}</p>

          <div class="flex justify-end gap-3 pt-2">
            <button @click="closeNewReviewer" class="px-4 py-2 rounded-xl text-sm border text-gray-600 hover:bg-gray-50">Cancel</button>
            <button @click="createReviewer" :disabled="creatingReviewer"
              class="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              style="background-color: #1a1d56;">
              {{ creatingReviewer ? 'Creating…' : 'Create & Send Invite' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── Assign to Abstract Modal ──────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="assignModal.show" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-800">
              Assign <span class="text-[#1a1d56]">{{ assignModal.reviewer?.name }}</span> to Abstract
            </h2>
            <button @click="assignModal.show = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div>
            <input v-model="abstractSearch" @input="searchAbstracts" type="text"
              placeholder="Search abstracts by title…" class="input w-full" />
            <div v-if="abstractResults.length" class="mt-1 border border-gray-200 rounded-xl overflow-hidden shadow">
              <div v-for="abs in abstractResults" :key="abs.id"
                @click="selectAbstract(abs)"
                class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-0">
                <p class="text-sm font-medium text-gray-800 truncate">{{ abs.title }}</p>
                <p class="text-xs text-gray-400 mt-0.5">{{ abs.event }} · {{ abs.status?.replace('_', ' ') }}</p>
              </div>
            </div>
          </div>

          <div v-if="assignModal.selectedAbstract" class="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm">
            <p class="font-medium text-blue-800 truncate">{{ assignModal.selectedAbstract.title }}</p>
            <p class="text-blue-500 text-xs mt-0.5">{{ assignModal.selectedAbstract.event }}</p>
          </div>

          <p v-if="assignModal.err" class="text-sm text-red-500">{{ assignModal.err }}</p>
          <p v-if="assignModal.success" class="text-sm text-green-600">{{ assignModal.success }}</p>

          <div class="flex justify-end gap-3 pt-2">
            <button @click="assignModal.show = false" class="px-4 py-2 rounded-xl text-sm border text-gray-600 hover:bg-gray-50">Cancel</button>
            <button @click="confirmAssign" :disabled="!assignModal.selectedAbstract || assignModal.loading"
              class="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              style="background-color: #1a1d56;">
              {{ assignModal.loading ? 'Assigning…' : 'Assign Reviewer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import api from '@/plugins/axios'

// ── State ──────────────────────────────────────────────────────────────────
const reviewers = ref([])
const events = ref([])
const selectedEventId = ref(null)
const search = ref('')
const isLoading = ref(false)
const expanded = ref(new Set())

// New reviewer modal
const showNewReviewer = ref(false)
const newReviewer = ref({ firstname: '', lastname: '', email: '', phone: '' })
const newReviewerErr = ref('')
const newReviewerSuccess = ref('')
const creatingReviewer = ref(false)

// Assign to abstract modal
const assignModal = ref({
  show: false,
  reviewer: null,
  selectedAbstract: null,
  loading: false,
  err: '',
  success: '',
})
const abstractSearch = ref('')
const abstractResults = ref([])
let abstractSearchTimer = null

// ── Computed ───────────────────────────────────────────────────────────────
const filteredReviewers = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return reviewers.value
  return reviewers.value.filter(
    r => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
  )
})

// ── Data loading ───────────────────────────────────────────────────────────
const fetchEvents = async () => {
  try {
    const res = await api.get('/events/?limit=200')
    events.value = res.data?.data || []
  } catch (e) { console.error('Failed to load events', e) }
}

const fetchReviewers = async () => {
  isLoading.value = true
  try {
    const params = {}
    if (selectedEventId.value) params.event_id = selectedEventId.value
    const res = await api.get('/abstracts/reviewers', { params })
    reviewers.value = res.data
  } catch (e) { console.error('Failed to load reviewers', e) }
  finally { isLoading.value = false }
}

onMounted(() => { fetchEvents(); fetchReviewers() })

// ── UI helpers ─────────────────────────────────────────────────────────────
const toggle = (id) => {
  const s = new Set(expanded.value)
  s.has(id) ? s.delete(id) : s.add(id)
  expanded.value = s
}

const initials = (name) =>
  name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

// ── Remove assignment ──────────────────────────────────────────────────────
const removeAssignment = async (reviewerId, abstractId) => {
  if (!confirm('Remove this reviewer from the abstract?')) return
  try {
    await api.delete(`/abstracts/${abstractId}/reviewers/${reviewerId}`)
    await fetchReviewers()
  } catch (e) { console.error('Failed to remove assignment', e) }
}

// ── Create reviewer ────────────────────────────────────────────────────────
const closeNewReviewer = () => {
  showNewReviewer.value = false
  newReviewer.value = { firstname: '', lastname: '', email: '', phone: '' }
  newReviewerErr.value = ''
  newReviewerSuccess.value = ''
}

const createReviewer = async () => {
  newReviewerErr.value = ''
  newReviewerSuccess.value = ''
  const { firstname, lastname, email } = newReviewer.value
  if (!firstname || !lastname || !email) {
    newReviewerErr.value = 'First name, last name and email are required.'
    return
  }
  creatingReviewer.value = true
  try {
    const res = await api.post('/abstracts/reviewers/create', newReviewer.value)
    newReviewerSuccess.value = `Account created for ${res.data.firstname} ${res.data.lastname}. Credentials will be emailed when they are assigned to their first abstract.`
    await fetchReviewers()
    newReviewer.value = { firstname: '', lastname: '', email: '', phone: '' }
  } catch (e) {
    newReviewerErr.value = e.response?.data?.detail || 'Failed to create reviewer'
  } finally {
    creatingReviewer.value = false
  }
}

// ── Assign to abstract ─────────────────────────────────────────────────────
const openAssign = (reviewer) => {
  assignModal.value = { show: true, reviewer, selectedAbstract: null, loading: false, err: '', success: '' }
  abstractSearch.value = ''
  abstractResults.value = []
}

const searchAbstracts = () => {
  clearTimeout(abstractSearchTimer)
  assignModal.value.selectedAbstract = null
  if (!abstractSearch.value.trim()) { abstractResults.value = []; return }
  abstractSearchTimer = setTimeout(async () => {
    try {
      const res = await api.get('/abstracts/', { params: { limit: 50 } })
      const q = abstractSearch.value.toLowerCase()
      abstractResults.value = res.data.filter(a => a.title.toLowerCase().includes(q)).slice(0, 8)
    } catch (e) { console.error(e) }
  }, 300)
}

const selectAbstract = (abs) => {
  assignModal.value.selectedAbstract = abs
  abstractSearch.value = abs.title
  abstractResults.value = []
}

const confirmAssign = async () => {
  assignModal.value.err = ''
  assignModal.value.success = ''
  assignModal.value.loading = true
  try {
    await api.post(`/abstracts/${assignModal.value.selectedAbstract.id}/assign-reviewer`, {
      reviewer_id: assignModal.value.reviewer.reviewer_id,
    })
    assignModal.value.success = `${assignModal.value.reviewer.name} assigned successfully!`
    await fetchReviewers()
    setTimeout(() => { assignModal.value.show = false }, 1500)
  } catch (e) {
    assignModal.value.err = e.response?.data?.detail || 'Failed to assign reviewer'
  } finally {
    assignModal.value.loading = false
  }
}
</script>
