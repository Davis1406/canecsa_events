<template>
  <div class="space-y-8 flex-1">
    <h1 class="text-2xl font-semibold text-black">Abstract Presentation</h1>

    <div v-if="loading" class="text-gray-500">Loading...</div>

    <!-- 🔒 Nothing eligible yet -->
    <div v-else-if="items.length === 0" class="bg-white rounded-2xl shadow p-8 text-center text-gray-400">
      <p class="text-lg">No accepted, paid abstracts yet.</p>
      <p class="text-sm mt-2">Once an abstract is accepted and your registration payment is confirmed, its presentation template and upload area will appear here.</p>
    </div>

    <div v-else class="space-y-6">
      <div v-for="item in items" :key="item.abstract_id" class="bg-white rounded-2xl shadow p-6 space-y-5">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div class="flex-1">
            <h2 class="font-semibold text-gray-800 text-lg">{{ item.title }}</h2>
            <p class="text-gray-500 text-sm mt-1">{{ item.event_name }}</p>
          </div>
          <span class="px-3 py-1 rounded-full text-sm font-semibold capitalize flex-shrink-0"
            style="background:#e6f7fb;color:#006f87;">
            {{ item.presentation_type || 'Either' }}
          </span>
        </div>

        <!-- Instructional note -->
        <div v-if="item.presentation_type === 'oral'" class="rounded-xl p-4 text-sm leading-relaxed"
          style="background:#fffbeb;border:1px solid #fde68a;color:#92400e;">
          Please note that each presentation is strictly limited to <strong>10 minutes per presenter</strong>.
          After populating the template below, please upload your presentation so that the secretariat can have it.
        </div>
        <div v-else-if="item.presentation_type === 'poster'" class="rounded-xl p-4 text-sm leading-relaxed"
          style="background:#fffbeb;border:1px solid #fde68a;color:#92400e;">
          Please prepare your poster (PDF or image) using the guidance below, and upload it so the secretariat has a copy ahead of the event.
        </div>

        <!-- Admin template -->
        <div v-if="item.templates.length" class="border-t pt-4">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Template / Guidance</p>
          <div v-for="t in item.templates" :key="t.id" class="mb-4">
            <div class="flex items-center justify-between gap-3 mb-2">
              <p class="text-sm font-medium text-gray-700">{{ t.name }}</p>
              <a :href="fileUrl(t.url)" target="_blank"
                class="text-xs font-medium px-2 py-1 rounded-lg border flex-shrink-0"
                style="color:#1a1d56; border-color:#b3e4f0; background:#e6f7fb;">
                Download
              </a>
            </div>

            <img v-if="isImage(t.url)" :src="fileUrl(t.url)" class="max-w-full max-h-[50vh] object-contain rounded-lg border" />
            <div v-else-if="isPdf(t.url)" style="height:50vh;" class="rounded-lg border overflow-hidden">
              <iframe :src="fileUrl(t.url)" class="w-full h-full" frameborder="0"></iframe>
            </div>
            <div v-else-if="isOffice(t.url)" style="height:50vh;" class="rounded-lg border overflow-hidden">
              <iframe :src="officeViewerUrl(t.url)" class="w-full h-full" frameborder="0"></iframe>
            </div>
            <p v-else class="text-xs text-gray-400">Preview not available for this file type — use Download.</p>
          </div>
        </div>
        <p v-else class="text-sm text-gray-400 border-t pt-4">No template has been uploaded for this event yet.</p>

        <!-- Own submission -->
        <div class="border-t pt-4">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Your Submission</p>

          <div v-if="item.submission">
            <img v-if="isImage(item.submission.url)" :src="fileUrl(item.submission.url)" class="max-w-full max-h-[50vh] object-contain rounded-lg border" />
            <div v-else-if="isPdf(item.submission.url)" style="height:50vh;" class="rounded-lg border overflow-hidden">
              <iframe :src="fileUrl(item.submission.url)" class="w-full h-full" frameborder="0"></iframe>
            </div>
            <div v-else-if="isOffice(item.submission.url)" style="height:50vh;" class="rounded-lg border overflow-hidden">
              <iframe :src="officeViewerUrl(item.submission.url)" class="w-full h-full" frameborder="0"></iframe>
            </div>
            <p v-else class="text-xs text-gray-400">Preview not available for this file type — use Download.</p>

            <div class="flex items-center gap-2 mt-3">
              <a :href="fileUrl(item.submission.url)" target="_blank"
                class="text-xs font-medium px-3 py-1.5 rounded-lg border"
                style="color:#1a1d56; border-color:#b3e4f0; background:#e6f7fb;">
                Download
              </a>
              <label class="cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-lg border text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100">
                {{ uploading[item.abstract_id] ? 'Uploading…' : 'Replace' }}
                <input type="file" class="hidden" :accept="acceptFor(item.presentation_type)"
                  :disabled="uploading[item.abstract_id]"
                  @change="onUpload(item, $event)" />
              </label>
              <button @click="onDelete(item)" :disabled="deleting[item.abstract_id]"
                class="text-xs font-semibold px-3 py-1.5 rounded-lg border text-red-600 bg-red-50 border-red-200 hover:bg-red-100 disabled:opacity-50">
                {{ deleting[item.abstract_id] ? 'Deleting…' : 'Delete' }}
              </button>
            </div>
          </div>

          <div v-else>
            <label class="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition hover:opacity-90"
              style="background-color:#1a1d56;">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              {{ uploading[item.abstract_id] ? 'Uploading…' : `Upload ${item.presentation_type === 'poster' ? 'Poster' : 'Presentation'}` }}
              <input type="file" class="hidden" :accept="acceptFor(item.presentation_type)"
                :disabled="uploading[item.abstract_id]"
                @change="onUpload(item, $event)" />
            </label>
            <p class="text-xs text-gray-400 mt-2">
              {{ item.presentation_type === 'poster' ? 'PDF or image (JPG, PNG, WEBP)' : 'PPTX, PPT or PDF' }}
            </p>
          </div>

          <p v-if="errors[item.abstract_id]" class="text-red-500 text-xs mt-2">{{ errors[item.abstract_id] }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/plugins/axios'
import { fileUrl, isImage, isPdf, isOffice, officeViewerUrl } from '@/utils/filePreview'

const items = ref([])
const loading = ref(true)
const uploading = ref({})
const deleting = ref({})
const errors = ref({})

const load = async () => {
  loading.value = true
  try {
    const res = await api.get('/abstracts/my-presentations')
    items.value = res.data
  } catch (e) {
    console.error('Failed to load presentations', e)
  } finally {
    loading.value = false
  }
}

onMounted(load)

const acceptFor = (ptype) =>
  ptype === 'poster' ? '.pdf,image/*' : '.pptx,.ppt,.pdf'

const onUpload = async (item, e) => {
  const file = e.target.files?.[0]
  if (!file) return
  uploading.value = { ...uploading.value, [item.abstract_id]: true }
  errors.value = { ...errors.value, [item.abstract_id]: '' }
  try {
    const fd = new FormData()
    fd.append('file', file)
    await api.post(`/abstracts/${item.abstract_id}/presentation`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    await load()
  } catch (err) {
    errors.value = { ...errors.value, [item.abstract_id]: err.response?.data?.detail || 'Upload failed' }
  } finally {
    uploading.value = { ...uploading.value, [item.abstract_id]: false }
    e.target.value = ''
  }
}

const onDelete = async (item) => {
  if (!confirm('Delete your uploaded presentation?')) return
  deleting.value = { ...deleting.value, [item.abstract_id]: true }
  try {
    await api.delete(`/abstracts/${item.abstract_id}/presentation`)
    await load()
  } catch (err) {
    errors.value = { ...errors.value, [item.abstract_id]: err.response?.data?.detail || 'Delete failed' }
  } finally {
    deleting.value = { ...deleting.value, [item.abstract_id]: false }
  }
}
</script>
