<template>
  <div class="flex-1 flex flex-col max-w-7xl w-full mx-auto overflow-hidden">
    <AdminBar title="User Perspective">
      <router-link :to="{ name: 'Users' }" class="text-sm text-blue-600 hover:underline">Users</router-link>
      <span class="mx-2 text-sm text-gray-500">/</span>
      <span class="text-sm text-gray-700">View as User</span>
    </AdminBar>

    <div class="px-4 pt-4 pb-10 space-y-6 overflow-y-auto flex-1">

      <div v-if="loading" class="flex justify-center py-16">
        <DataLoadingSpinner />
      </div>

      <template v-else>

        <!-- ── Profile card ─────────────────────────────────────────────── -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row gap-5">
          <div class="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
            style="background:#1a1d56;">
            {{ initials }}
          </div>
          <div class="flex-1 min-w-0 space-y-0.5">
            <h2 class="text-lg font-bold text-gray-900">{{ user?.firstname }} {{ user?.lastname }}</h2>
            <p class="text-sm text-gray-500">{{ user?.email }}</p>
            <p v-if="profile?.organisation" class="text-sm text-gray-600">{{ profile.organisation }}</p>
            <p v-if="profile?.country" class="text-sm text-gray-400">{{ profile.country }}</p>
          </div>
          <div class="flex flex-col items-end gap-3">
            <!-- Role badges -->
            <div class="flex flex-wrap gap-1.5 justify-end">
              <span v-for="r in user?.roles" :key="r.id"
                class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                {{ r.role }}
              </span>
            </div>
            <!-- Impersonate button -->
            <button
              @click="impersonate"
              :disabled="impersonating"
              class="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              style="background:#1a1d56;"
            >
              <svg v-if="impersonating" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              {{ impersonating ? 'Loading…' : 'Enter as this User' }}
            </button>
            <p v-if="impersonateError" class="text-xs text-red-500 text-right">{{ impersonateError }}</p>
          </div>
        </div>

        <!-- ── Profile details ──────────────────────────────────────────── -->
        <div v-if="profile" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Profile Details</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div v-if="profile.title"><span class="text-gray-400 block text-xs">Title</span>{{ profile.title }}</div>
            <div v-if="profile.gender"><span class="text-gray-400 block text-xs">Gender</span>{{ profile.gender }}</div>
            <div v-if="profile.position"><span class="text-gray-400 block text-xs">Position</span>{{ profile.position }}</div>
            <div v-if="profile.profession"><span class="text-gray-400 block text-xs">Profession</span>{{ profile.profession }}</div>
            <div v-if="profile.middle_name"><span class="text-gray-400 block text-xs">Middle Name</span>{{ profile.middle_name }}</div>
          </div>
        </div>

        <!-- ── Events ───────────────────────────────────────────────────── -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Registered Events
            <span class="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">{{ events.length }}</span>
          </h3>
          <p v-if="!events.length" class="text-sm text-gray-400 italic">Not registered for any events.</p>
          <div v-else class="space-y-2">
            <div v-for="e in events" :key="e.id"
              class="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 gap-3 flex-wrap">
              <div>
                <p class="font-semibold text-sm text-gray-800">{{ e.event }}</p>
                <p class="text-xs text-gray-400">{{ e.country }} · {{ formatDate(e.start_date) }}</p>
              </div>
              <span v-if="e.paid" class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">✅ Paid</span>
              <span v-else class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">⏳ Unpaid</span>
            </div>
          </div>
        </div>

        <!-- ── Abstracts ─────────────────────────────────────────────────── -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Submitted Abstracts
            <span class="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">{{ abstracts.length }}</span>
          </h3>
          <p v-if="loadingAbstracts" class="text-sm text-gray-400">Loading…</p>
          <p v-else-if="!abstracts.length" class="text-sm text-gray-400 italic">No abstracts submitted.</p>
          <div v-else class="space-y-2">
            <div v-for="a in abstracts" :key="a.id"
              class="flex items-start justify-between px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 gap-3 flex-wrap">
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm text-gray-800 truncate">{{ a.title }}</p>
                <p class="text-xs text-gray-400 mt-0.5">{{ a.event?.event || '—' }} · {{ a.presentation_type || 'unspecified' }}</p>
                <p v-if="a.track" class="text-xs text-gray-400">Track: {{ a.track }}</p>
              </div>
              <span :class="statusClass(a.status)" class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize flex-shrink-0">
                {{ a.status?.replace('_', ' ') }}
              </span>
            </div>
          </div>
        </div>

        <!-- ── Reviews ───────────────────────────────────────────────────── -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Review Assignments
            <span class="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">{{ reviews.length }}</span>
          </h3>
          <p v-if="loadingReviews" class="text-sm text-gray-400">Loading…</p>
          <p v-else-if="!reviews.length" class="text-sm text-gray-400 italic">No review assignments.</p>
          <div v-else class="space-y-2">
            <div v-for="r in reviews" :key="r.assignment_id"
              class="flex items-start justify-between px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 gap-3 flex-wrap">
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm text-gray-800 truncate">{{ r.abstract?.title }}</p>
                <p class="text-xs text-gray-400 mt-0.5">Assigned {{ formatDate(r.assigned_at) }}</p>
                <template v-if="r.review">
                  <p class="text-xs text-gray-500 mt-1">
                    Recommendation: <span class="font-semibold capitalize">{{ r.review.recommendation }}</span>
                    · Overall score: <span class="font-semibold">{{ r.review.overall_score }}</span>
                  </p>
                </template>
              </div>
              <span v-if="r.completed" class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Reviewed</span>
              <span v-else class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Pending</span>
            </div>
          </div>
        </div>

      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminBar from '@/components/common/AdminBar.vue'
import DataLoadingSpinner from '@/components/common/DataLoadingSpinner.vue'
import api from '@/plugins/axios'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const userId = Number(route.params.id)

const loading = ref(true)
const loadingAbstracts = ref(true)
const loadingReviews = ref(true)
const impersonating = ref(false)
const impersonateError = ref('')

const user = ref(null)
const profile = ref(null)
const events = ref([])
const abstracts = ref([])
const reviews = ref([])

const initials = computed(() => {
  const f = user.value?.firstname?.[0] || ''
  const l = user.value?.lastname?.[0] || ''
  return (f + l).toUpperCase()
})

const STATUS_COLORS = {
  accepted: 'bg-green-100 text-green-700',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
  revision_required: 'bg-orange-100 text-orange-700',
}
const statusClass = s => STATUS_COLORS[s] || 'bg-gray-100 text-gray-600'

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function impersonate() {
  impersonating.value = true
  impersonateError.value = ''
  try {
    const res = await api.post(`/auth/impersonate/${userId}`)
    auth.startImpersonation({
      user: res.data.user,
      token: res.data.access_token,
      permissions: res.data.permissions,
    })
    router.push({ name: 'MyDashboard' })
  } catch (err) {
    impersonateError.value = err?.response?.data?.detail || 'Failed to start impersonation.'
    impersonating.value = false
  }
}

onMounted(async () => {
  try {
    const res = await api.get(`/users/${userId}`)
    user.value = res.data.user
    profile.value = res.data.profile
    events.value = res.data.events || []
  } catch (e) {
    console.error('Failed to load user', e)
  } finally {
    loading.value = false
  }

  try {
    const res = await api.get(`/abstracts/submissions-for/${userId}`)
    abstracts.value = res.data
  } catch (e) {
    console.error('Failed to load abstracts', e)
  } finally {
    loadingAbstracts.value = false
  }

  try {
    const res = await api.get(`/abstracts/reviews-for/${userId}`)
    reviews.value = res.data
  } catch (e) {
    console.error('Failed to load reviews', e)
  } finally {
    loadingReviews.value = false
  }
})
</script>
