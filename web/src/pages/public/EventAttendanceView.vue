<template>
  <div class="bg-gray-50 min-h-screen font-sans">
    <!-- Dynamic Banner -->
    <section
      class="py-12 px-6 text-center text-white"
      :style="{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }"
    >
      <div class="max-w-2xl mx-auto space-y-3">
        <h1 class="text-4xl font-bold tracking-tight">{{ event?.event || 'Event Attendance' }}</h1>
        <p class="text-lg opacity-90">
          {{ formatDate(event?.start_date) }} – {{ formatDate(event?.end_date) }}
          <span v-if="event?.location"> &middot; {{ event.location }}</span>
        </p>
        <p class="text-sm text-white/80">
          Scan the QR on your badge or enter your Registration ID to mark attendance.
        </p>
      </div>
    </section>

    <section class="max-w-md mx-auto px-6 py-10">
      <!-- Success State -->
      <div
        v-if="successMessage"
        class="bg-white rounded-2xl shadow p-8 text-center space-y-4"
      >
        <div class="text-6xl">✅</div>
        <h2 class="text-xl font-bold text-gray-800">Attendance Recorded!</h2>
        <p class="text-green-600 text-sm font-semibold">{{ successMessage }}</p>
        <button
          @click="reset"
          class="mt-2 px-6 py-2 rounded-full text-white text-sm font-semibold transition hover:opacity-90"
          :style="{ backgroundColor: primaryColor }"
        >
          Mark Another
        </button>
      </div>

      <!-- Already recorded (soft warning, not an error) -->
      <div
        v-else-if="alreadyRecorded"
        class="bg-white rounded-2xl shadow p-8 text-center space-y-4"
      >
        <div class="text-6xl">📋</div>
        <h2 class="text-xl font-bold text-gray-800">Already Checked In</h2>
        <p class="text-amber-600 text-sm font-semibold">Your attendance has already been recorded for today.</p>
        <button
          @click="reset"
          class="mt-2 px-6 py-2 rounded-full text-white text-sm font-semibold transition hover:opacity-90"
          :style="{ backgroundColor: primaryColor }"
        >
          Mark Another
        </button>
      </div>

      <!-- Form State -->
      <div v-else-if="!alreadyRecorded" class="bg-white p-6 rounded-2xl shadow space-y-4">
        <div>
          <label for="participantId" class="block text-sm font-semibold text-gray-700 mb-1">
            Registration ID
          </label>
          <input
            v-model="participantId"
            type="number"
            id="participantId"
            placeholder="e.g. 36"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 transition"
            @keyup.enter="markAttendance"
          />
          <p v-if="autoFilled" class="text-xs text-gray-500 italic mt-1">
            ✓ Registration ID auto-filled from QR code.
          </p>
        </div>

        <button
          @click="markAttendance"
          :disabled="!participantId || loading"
          class="w-full text-white font-semibold py-3 px-4 rounded-xl transition disabled:opacity-50 hover:opacity-90"
          :style="{ backgroundColor: loading ? '#9ca3af' : primaryColor }"
        >
          {{ loading ? 'Marking attendance…' : 'Mark Attendance' }}
        </button>

        <p v-if="errorMessage" class="text-red-600 text-sm text-center">{{ errorMessage }}</p>
      </div>

      <!-- Auto-submitting indicator -->
      <div v-if="autoSubmitting && !successMessage && !errorMessage" class="mt-4 text-center text-sm text-gray-500 animate-pulse">
        ⏳ Auto-submitting from QR scan…
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/plugins/axios'

const route = useRoute()
const eventId = Number(route.params.id)

const primaryColor = ref('#1a1d56')
const secondaryColor = ref('#f59d08')
const event = ref(null)

const participantId = ref('')
const autoFilled = ref(false)
const autoSubmitting = ref(false)
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const alreadyRecorded = ref(false)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function reset() {
  successMessage.value = ''
  errorMessage.value = ''
  alreadyRecorded.value = false
  participantId.value = ''
  autoFilled.value = false
  autoSubmitting.value = false
}

async function loadEvent() {
  try {
    const res = await api.get(`/events/${eventId}/basic`)
    event.value = res.data.event
    if (res.data.event?.org_unit_primary_color) {
      primaryColor.value = res.data.event.org_unit_primary_color
    }
    if (res.data.event?.org_unit_secondary_color) {
      secondaryColor.value = res.data.event.org_unit_secondary_color
    }
  } catch (error) {
    console.error('Failed to load event:', error)
  }
}

async function markAttendance() {
  loading.value = true
  errorMessage.value = ''
  const regId = parseInt(participantId.value, 10)

  if (isNaN(regId)) {
    errorMessage.value = 'Please enter a valid Registration ID.'
    loading.value = false
    return
  }

  try {
    const res = await api.post(`/event_attendance/events/${eventId}/attendance`, {
      registration_id: regId,
    })
    successMessage.value = res.data.message || 'Attendance marked successfully!'
  } catch (err) {
    const detail = err.response?.data?.detail || ''
    if (detail.toLowerCase().includes('already')) {
      alreadyRecorded.value = true
    } else {
      errorMessage.value = detail || 'Failed to mark attendance. Please try again.'
    }
  } finally {
    loading.value = false
    autoSubmitting.value = false
  }
}

onMounted(async () => {
  await loadEvent()
  const regParam = route.query.reg
  if (regParam) {
    participantId.value = String(regParam)
    autoFilled.value = true
    autoSubmitting.value = true
    setTimeout(() => markAttendance(), 800)
  }
})
</script>
