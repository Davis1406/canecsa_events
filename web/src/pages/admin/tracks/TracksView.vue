<template>
  <div class="flex-1 flex flex-col w-full max-w-5xl mx-auto p-6 space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-semibold text-black">Sub-Themes</h1>
        <p v-if="!loading" class="text-sm text-gray-400 mt-0.5">
          {{ tracks.length }} sub-theme{{ tracks.length !== 1 ? 's' : '' }}
        </p>
      </div>
      <button @click="showAdd = !showAdd"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition hover:opacity-90"
        style="background-color:#1a1d56;">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        {{ showAdd ? 'Cancel' : 'Add Sub-Theme' }}
      </button>
    </div>

    <!-- Add Sub-Theme form -->
    <div v-if="showAdd" class="bg-white rounded-2xl shadow p-6 space-y-4">
      <h2 class="font-semibold text-gray-800 text-sm">New Sub-Theme</h2>

      <!-- Quick-add from predefined list -->
      <div>
        <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Quick add from CANECSA 2026 sub-themes</label>
        <div class="flex flex-wrap gap-2">
          <button v-for="preset in presetSubthemes" :key="preset.code" @click="applyPreset(preset)"
            :disabled="alreadyAdded(preset.code)"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition disabled:opacity-40 disabled:cursor-not-allowed"
            :class="alreadyAdded(preset.code)
              ? 'border-gray-200 text-gray-300 bg-gray-50'
              : 'border-[#b3e4f0] text-[#006f87] bg-[#e6f7fb] hover:bg-[#d0f0f9]'">
            <svg v-if="!alreadyAdded(preset.code)" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <svg v-else class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            {{ preset.code }}: {{ preset.title }}
          </button>
        </div>
      </div>

      <div class="border-t border-gray-100 pt-4">
        <p class="text-xs text-gray-400 mb-3">Or create a custom sub-theme:</p>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Code <span class="text-red-500">*</span></label>
            <input v-model="addForm.code" type="text" class="input w-full text-sm" placeholder="e.g. ST-1" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Sort Order</label>
            <input v-model.number="addForm.sort_order" type="number" class="input w-full text-sm" />
          </div>
        </div>
        <div class="mt-3">
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Sub-Theme Title <span class="text-red-500">*</span></label>
          <input v-model="addForm.title" type="text" class="input w-full text-sm" placeholder="Full sub-theme title" />
        </div>
        <div class="mt-3">
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Theme / Group</label>
          <input v-model="addForm.theme" type="text" class="input w-full text-sm"
            placeholder="e.g. 1. Preoperative Assessment and Optimisation" />
        </div>
      </div>
      <p v-if="addError" class="text-xs text-red-500">{{ addError }}</p>
      <div class="flex items-center gap-2 pt-1">
        <button @click="createTrack" :disabled="adding || !addForm.code || !addForm.title"
          class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50 transition hover:opacity-90"
          style="background-color:#1a1d56;">
          <svg v-if="adding" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          {{ adding ? 'Adding…' : 'Add Sub-Theme' }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-2xl shadow p-10 text-center text-gray-400">
      Loading sub-themes…
    </div>

    <!-- Empty state -->
    <div v-else-if="groupedTracks.length === 0" class="bg-white rounded-2xl shadow p-10 text-center text-gray-400">
      No sub-themes found.
    </div>

    <!-- Grouped by theme -->
    <div v-else class="space-y-6">
      <div v-for="group in groupedTracks" :key="group.theme" class="bg-white rounded-2xl shadow overflow-hidden">

        <!-- Theme header -->
        <div class="px-5 py-3 border-b flex items-center gap-3" style="background-color:#e6f7fb;">
          <div class="w-2 h-2 rounded-full flex-shrink-0" style="background-color:#1a1d56;"></div>
          <p class="font-semibold text-sm" style="color:#006f87;">{{ group.theme }}</p>
          <span class="ml-auto text-xs font-medium px-2 py-0.5 rounded-full border"
            style="background-color:#fff; color:#1a1d56; border-color:#b3e4f0;">
            {{ group.tracks.length }} sub-theme{{ group.tracks.length !== 1 ? 's' : '' }}
          </span>
        </div>

        <!-- Sub-themes list -->
        <div class="divide-y divide-gray-50">
          <div v-for="track in group.tracks" :key="track.id" class="px-5 py-4">

            <!-- View mode -->
            <div v-if="editingId !== track.id" class="flex items-start gap-4">
              <span class="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 mt-0.5"
                style="background-color:#e6f7fb; color:#006f87; border-color:#b3e4f0;">
                {{ track.code }}
              </span>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-800 text-sm leading-snug">{{ track.title }}</p>
                <div class="flex items-center gap-3 mt-1.5">
                  <router-link :to="{ name: 'AdminAbstracts', query: { track_id: track.id } }"
                    class="inline-flex items-center gap-1 text-xs font-medium transition-colors hover:underline"
                    style="color:#1a1d56;">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    {{ track.abstract_count }} abstract{{ track.abstract_count !== 1 ? 's' : '' }}
                  </router-link>
                </div>
              </div>
              <button @click="startEdit(track)"
                class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50 transition flex-shrink-0">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Edit
              </button>
            </div>

            <!-- Edit mode (inline form) -->
            <div v-else class="space-y-3">
              <div class="flex items-center gap-2 mb-1">
                <span class="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border"
                  style="background-color:#e6f7fb; color:#006f87; border-color:#b3e4f0;">
                  {{ track.code }}
                </span>
                <span class="text-xs text-gray-400">Editing…</span>
              </div>

              <div class="grid sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Code</label>
                  <input v-model="editForm.code" type="text" class="input w-full text-sm"
                    placeholder="e.g. ST-1" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Sort Order</label>
                  <input v-model.number="editForm.sort_order" type="number" class="input w-full text-sm" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Sub-Theme Title</label>
                <input v-model="editForm.title" type="text" class="input w-full text-sm"
                  placeholder="Full sub-theme title" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Theme / Group</label>
                <input v-model="editForm.theme" type="text" class="input w-full text-sm"
                  placeholder="e.g. 1. Preoperative Assessment and Optimisation" />
              </div>

              <p v-if="editError" class="text-xs text-red-500">{{ editError }}</p>
              <p v-if="editSuccess" class="text-xs text-green-600">{{ editSuccess }}</p>

              <div class="flex items-center gap-2 pt-1">
                <button @click="saveEdit(track.id)" :disabled="saving"
                  class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50 transition hover:opacity-90"
                  style="background-color:#1a1d56;">
                  <svg v-if="saving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  {{ saving ? 'Saving…' : 'Save Changes' }}
                </button>
                <button @click="cancelEdit"
                  class="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">
                  Cancel
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/plugins/axios'

const tracks      = ref([])
const loading     = ref(true)

const showAdd     = ref(false)
const addForm     = ref({ code: '', title: '', theme: '', sort_order: 0 })
const adding      = ref(false)
const addError    = ref('')

const editingId   = ref(null)
const editForm    = ref({ code: '', title: '', theme: '', sort_order: 0 })
const saving      = ref(false)
const editError   = ref('')
const editSuccess = ref('')

const presetSubthemes = [
  { code: 'ST-1', title: 'Preoperative Assessment and Optimisation', theme: 'Preoperative Assessment and Optimisation' },
  { code: 'ST-2', title: 'Safe Intraoperative Care and Crisis Management', theme: 'Safe Intraoperative Care and Crisis Management' },
  { code: 'ST-3', title: 'Postoperative Recovery and Critical Care', theme: 'Postoperative Recovery and Critical Care' },
  { code: 'ST-4', title: 'Patient Safety, Quality Improvement and Systems Strengthening', theme: 'Patient Safety, Quality Improvement and Systems Strengthening' },
  { code: 'ST-5', title: 'AI, Digital Health and Innovation', theme: 'AI, Digital Health and Innovation' },
]

const alreadyAdded = (code) => tracks.value.some(t => t.code === code)

const applyPreset = (preset) => {
  addForm.value = { code: preset.code, title: preset.title, theme: preset.theme, sort_order: tracks.value.length }
}

onMounted(async () => {
  await loadTracks()
  loading.value = false
})

const loadTracks = async () => {
  const res = await api.get('/abstracts/tracks/list')
  tracks.value = res.data
}

const createTrack = async () => {
  adding.value  = true
  addError.value = ''
  try {
    const res = await api.post('/abstracts/tracks/', addForm.value)
    tracks.value.push(res.data)
    tracks.value.sort((a, b) => a.sort_order - b.sort_order || a.code.localeCompare(b.code))
    addForm.value = { code: '', title: '', theme: '', sort_order: 0 }
    showAdd.value = false
  } catch (e) {
    addError.value = e.response?.data?.detail || 'Failed to create sub-theme'
  } finally {
    adding.value = false
  }
}

// Group sub-themes by theme
const groupedTracks = computed(() => {
  const map = {}
  for (const t of tracks.value) {
    const key = t.theme || 'Ungrouped'
    if (!map[key]) map[key] = { theme: key, tracks: [] }
    map[key].tracks.push(t)
  }
  return Object.values(map)
})

const startEdit = (track) => {
  editingId.value = track.id
  editForm.value  = { code: track.code, title: track.title, theme: track.theme || '', sort_order: track.sort_order }
  editError.value   = ''
  editSuccess.value = ''
}

const cancelEdit = () => {
  editingId.value = null
  editError.value = ''
  editSuccess.value = ''
}

const saveEdit = async (trackId) => {
  saving.value    = true
  editError.value = ''
  editSuccess.value = ''
  try {
    const res = await api.put(`/abstracts/tracks/${trackId}`, editForm.value)
    const idx = tracks.value.findIndex(t => t.id === trackId)
    if (idx !== -1) tracks.value[idx] = res.data
    editSuccess.value = 'Saved!'
    setTimeout(() => { editingId.value = null; editSuccess.value = '' }, 1200)
  } catch (e) {
    editError.value = e.response?.data?.detail || 'Failed to save'
  } finally {
    saving.value = false
  }
}
</script>
