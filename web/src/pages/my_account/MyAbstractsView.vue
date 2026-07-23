<template>
  <div class="space-y-8 flex-1">
    <h1 class="text-2xl font-semibold text-black">My Abstract Submissions</h1>

    <div v-if="loading" class="text-gray-500">Loading...</div>
    <div v-else-if="abstracts.length === 0" class="bg-white rounded-2xl shadow p-8 text-center text-gray-400">
      <p class="text-lg">No abstracts submitted yet.</p>
      <router-link :to="{ name: 'AbstractSubmission' }" class="mt-3 inline-block text-bondi-blue underline text-sm">Submit an abstract</router-link>
    </div>

    <div v-else class="space-y-4">
      <div v-for="abs in abstracts" :key="abs.id" class="bg-white rounded-2xl shadow p-6">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div class="flex-1">
            <h2 class="font-semibold text-gray-800 text-lg">{{ abs.title }}</h2>
            <p class="text-gray-500 text-sm mt-1">{{ abs.event }} &bull; {{ abs.track || 'No sub-theme' }}</p>
            <p class="text-gray-400 text-xs mt-1">{{ abs.word_count }} words &bull; Submitted {{ formatDate(abs.created_at) }}</p>
          </div>
          <span :class="statusClass(abs.status)" class="px-3 py-1 rounded-full text-sm font-semibold capitalize flex-shrink-0">
            {{ abs.status?.replace('_', ' ') }}
          </span>
        </div>

        <!-- Authors -->
        <div class="mt-4 flex flex-wrap gap-2">
          <span v-for="(au, i) in abs.authors" :key="au.id"
            class="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            <span class="font-medium">{{ au.firstname }} {{ au.lastname }}</span>
            <span v-if="au.is_presenting" class="bg-bondi-blue text-white text-xs px-1 rounded">Presenting</span>
            <span v-if="au.affiliation" class="text-gray-400">· {{ au.affiliation }}</span>
          </span>
        </div>

        <!-- Expandable abstract text -->
        <div class="mt-4">
          <button @click="abs._expanded = !abs._expanded" class="text-bondi-blue text-sm hover:underline">
            {{ abs._expanded ? 'Hide abstract ▲' : 'Show abstract ▼' }}
          </button>
          <div v-if="abs._expanded" class="mt-3 text-gray-700 text-sm leading-relaxed border-t pt-3 whitespace-pre-wrap">
            {{ abs.abstract_text }}
            <p v-if="abs.keywords" class="mt-3 text-xs text-gray-400"><strong>Keywords:</strong> {{ abs.keywords }}</p>
          </div>
        </div>

        <!-- Template download (accepted + paid) -->
        <div v-if="abs.status === 'accepted' && templatesForAbstract(abs).length" class="mt-4 border-t pt-4">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Presentation Templates</p>
          <div class="flex flex-wrap gap-2">
            <a v-for="t in templatesForAbstract(abs)" :key="t.id"
              :href="t.url" target="_blank"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
              style="background-color:#1a1d56;">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              {{ t.name }}
            </a>
          </div>
        </div>

        <!-- Reviewer comments (visible when accepted) -->
        <div v-if="abs.status === 'accepted' && reviewComments(abs).length" class="mt-4 border-t pt-4">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Reviewer Feedback</p>
          <div v-for="(r, i) in reviewComments(abs)" :key="i"
            class="mb-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <div class="flex items-center gap-3 mb-2 flex-wrap">
              <span class="text-xs font-semibold text-gray-600">Reviewer {{ i + 1 }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                :class="{
                  'bg-green-100 text-green-700': r.recommendation === 'accept',
                  'bg-yellow-100 text-yellow-700': r.recommendation === 'revision_required',
                  'bg-red-100 text-red-700': r.recommendation === 'reject',
                }">
                {{ r.recommendation?.replace('_', ' ') }}
              </span>
              <div class="flex gap-2 ml-auto flex-wrap">
                <span v-for="s in scoreFields" :key="s.key"
                  class="text-xs text-gray-400">
                  {{ s.label }}: <strong class="text-gray-700">{{ r[s.key] }}/5</strong>
                </span>
              </div>
            </div>
            <p class="text-sm text-gray-700 leading-relaxed">{{ r.comments }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/plugins/axios'

const abstracts  = ref([])
const templates  = ref([])
const loading    = ref(true)

onMounted(async () => {
  try {
    const [absRes, tmplRes] = await Promise.all([
      api.get('/abstracts/my-submissions'),
      api.get('/events/templates/for-me').catch(() => ({ data: [] })),
    ])
    abstracts.value = absRes.data.map(a => ({ ...a, _expanded: false }))
    templates.value = tmplRes.data
  } catch (e) {
    console.error('Failed to load abstracts', e)
  } finally {
    loading.value = false
  }
})

const templatesForAbstract = (abs) =>
  templates.value.filter(t =>
    (!t.event_id || t.event_id === abs.event_id) &&
    (!t.presentation_type || t.presentation_type === abs.presentation_type)
  )

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '—'
const statusClass = (s) => ({ submitted:'bg-blue-100 text-blue-700', under_review:'bg-yellow-100 text-yellow-700', accepted:'bg-green-100 text-green-700', rejected:'bg-red-100 text-red-700', revision_required:'bg-orange-100 text-orange-700' }[s] || 'bg-gray-100 text-gray-600')

const scoreFields = [
  { key: 'relevance_score',    label: 'Relevance' },
  { key: 'methodology_score',  label: 'Methodology' },
  { key: 'originality_score',  label: 'Originality' },
  { key: 'overall_score',      label: 'Overall' },
]

const reviewComments = (abs) =>
  (abs.reviewer_assignments || [])
    .map(ra => ra.review)
    .filter(r => r && r.comments)
</script>
