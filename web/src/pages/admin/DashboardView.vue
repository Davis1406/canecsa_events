<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminBar from '@/components/common/AdminBar.vue'
import { useAuthStore } from '@/stores/auth'
import {
  UserIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/vue/24/outline'
import api from '@/plugins/axios'

const auth = useAuthStore()
const isFullAdmin = computed(() => auth.hasPermission('VIEW_USER'))

const totalUsers = ref(0)
const upcomingEventsCount = ref(0)
const completedEventsCount = ref(0)
const totalAbstracts = ref(0)
const totalRegistrations = ref(0)
const recentEvents = ref([])
const eventStats = ref([])

const loading = ref(false)
const error = ref(null)

const submissionOpen = ref(false)
const submissionDeadline = ref(null)
const togglingSubmission = ref(false)
const deadlineInput = ref('')
const savingDeadline = ref(false)
const deadlineMsg = ref('')

async function loadDashboard() {
  loading.value = true
  error.value = null
  try {
    const res = await api.get('/dashboard')
    totalUsers.value = res.data.total_users
    upcomingEventsCount.value = res.data.upcoming_events_count
    completedEventsCount.value = res.data.completed_events_count
    totalAbstracts.value = res.data.total_abstracts
    totalRegistrations.value = res.data.total_registrations
    recentEvents.value = res.data.recent_events
    eventStats.value = res.data.event_stats

    // Load first event for submission controls
    const evRes = await api.get('/events/?skip=0&limit=200')
    const events = evRes.data.data || []
    if (events.length > 0) {
      const eventId = events[0].id
      firstEventId.value = eventId
      const statusRes = await api.get(`/abstracts/submission-status/${eventId}`)
      submissionOpen.value = statusRes.data.abstract_submissions_open
      submissionDeadline.value = statusRes.data.deadline
      if (statusRes.data.deadline) {
        deadlineInput.value = new Date(statusRes.data.deadline).toISOString().slice(0, 16)
      }
    }
  } catch (err) {
    error.value = err.response?.data?.detail || err.message || 'Failed to load dashboard data'
  } finally {
    loading.value = false
  }
}

const firstEventId = ref(null)

async function toggleSubmission() {
  if (!firstEventId.value) return
  togglingSubmission.value = true
  try {
    const res = await api.post(`/abstracts/submission-status/${firstEventId.value}?open_submissions=${!submissionOpen.value}`)
    submissionOpen.value = res.data.abstract_submissions_open
  } catch (e) {
    // ignore
  } finally {
    togglingSubmission.value = false
  }
}

async function saveDeadline() {
  if (!firstEventId.value || !deadlineInput.value) return
  savingDeadline.value = true
  deadlineMsg.value = ''
  try {
    const res = await api.put(`/abstracts/submission-deadline/${firstEventId.value}?deadline=${encodeURIComponent(deadlineInput.value)}`)
    submissionDeadline.value = deadlineInput.value
    submissionOpen.value = res.data.abstract_submissions_open
    deadlineMsg.value = 'Saved'
    setTimeout(() => { deadlineMsg.value = '' }, 3000)
  } catch (e) {
    deadlineMsg.value = 'Failed to save'
  } finally {
    savingDeadline.value = false
  }
}

onMounted(loadDashboard)
</script>

<template>
  <div class="flex-1 flex flex-col max-w-7xl w-full mx-auto overflow-hidden">
    <AdminBar title="Dashboard">
      <a href="#" class="text-sm text-blue-600 hover:underline">Dashboard</a>
    </AdminBar>

    <div class="px-6 pt-4 pb-2">
      <h1 class="text-xl font-bold text-gray-800">
        {{ isFullAdmin ? 'Admin Overview' : 'Statistics Overview' }}
      </h1>
    </div>

    <main class="p-6 space-y-6">
      <div v-if="loading" class="text-center text-gray-500 py-10">Loading…</div>
      <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
      <div v-else class="space-y-6">

        <!-- Full admin top cards -->
        <div v-if="isFullAdmin" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <router-link :to="{ name: 'Users' }"
            class="bg-white rounded-2xl shadow p-5 flex items-center gap-5 transition hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
            <div class="bg-blue-100 text-blue-600 rounded-full p-3">
              <UserIcon class="h-7 w-7" />
            </div>
            <div>
              <h3 class="text-sm text-gray-500">Total Users</h3>
              <p class="text-2xl font-extrabold">{{ totalUsers }}</p>
            </div>
          </router-link>
          <router-link :to="{ name: 'AdminAbstracts' }"
            class="bg-white rounded-2xl shadow p-5 flex items-center gap-5 transition hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
            <div class="bg-indigo-100 text-indigo-600 rounded-full p-3">
              <DocumentTextIcon class="h-7 w-7" />
            </div>
            <div>
              <h3 class="text-sm text-gray-500">Total Abstracts</h3>
              <p class="text-2xl font-extrabold">{{ totalAbstracts }}</p>
            </div>
          </router-link>
        </div>

        <!-- Stats-only summary cards (always shown) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <router-link :to="{ name: 'AdminAbstracts' }"
            class="bg-white rounded-2xl shadow p-6 flex items-center gap-5 transition hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
            <div class="bg-[#0062ad]/10 text-[#0062ad] rounded-full p-4">
              <DocumentTextIcon class="h-8 w-8" />
            </div>
            <div>
              <h3 class="text-sm text-gray-500">Total Abstracts Submitted</h3>
              <p class="text-3xl font-extrabold text-gray-800">{{ totalAbstracts }}</p>
            </div>
          </router-link>
          <router-link v-if="firstEventId" :to="{ name: 'AdminEvent', params: { id: firstEventId } }"
            class="bg-white rounded-2xl shadow p-6 flex items-center gap-5 transition hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
            <div class="bg-green-100 text-green-600 rounded-full p-4">
              <ClipboardDocumentCheckIcon class="h-8 w-8" />
            </div>
            <div>
              <h3 class="text-sm text-gray-500">Total Registrations</h3>
              <p class="text-3xl font-extrabold text-gray-800">{{ totalRegistrations }}</p>
            </div>
          </router-link>
        </div>

        <!-- Abstract Submission Window Control -->
        <div v-if="isFullAdmin && firstEventId" class="bg-white rounded-2xl shadow p-6 space-y-4">
          <h3 class="text-lg font-bold text-gray-800">Abstract Submission Window</h3>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Status:</span>
            <button @click="toggleSubmission" :disabled="togglingSubmission"
              class="relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none"
              :class="submissionOpen ? 'bg-green-500' : 'bg-gray-300'">
              <span class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200"
                :class="submissionOpen ? 'translate-x-7' : 'translate-x-1'" />
            </button>
            <span class="text-sm font-semibold" :class="submissionOpen ? 'text-green-600' : 'text-gray-500'">
              {{ submissionOpen ? 'Open' : 'Closed' }}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <input v-model="deadlineInput" type="datetime-local"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0062ad]" />
            <button @click="saveDeadline" :disabled="savingDeadline || !deadlineInput"
              class="px-4 py-2 bg-[#0062ad] text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50">
              {{ savingDeadline ? 'Saving…' : 'Save Deadline' }}
            </button>
          </div>
          <p v-if="deadlineMsg" class="text-xs font-semibold" :class="deadlineMsg === 'Saved' ? 'text-green-600' : 'text-red-600'">
            {{ deadlineMsg }}
          </p>
        </div>

      </div>
    </main>
  </div>
</template>
