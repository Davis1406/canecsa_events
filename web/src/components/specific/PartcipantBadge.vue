<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center"
  >
    <!-- Modal View -->
    <div class="bg-white rounded-xl shadow-xl p-4 w-full max-w-sm relative">
      <button class="absolute top-2 right-3 text-gray-400 hover:text-black" @click="close">✕</button>

      <!-- Visible Badge -->
      <div class="p-3 border border-dashed border-gray-300 text-center flex flex-col items-center">
        <!-- Logos -->
        <div class="w-full flex justify-between items-center mb-2">
          <img src="@/assets/moh_sz.png" alt="Kingdom of Eswatini MoH" class="h-16 w-auto" />
          <img src="@/assets/canecsa-logo.png" alt="CANECSA" class="h-16 w-auto" />
        </div>

        <!-- Badge Content -->
        <div v-if="loading" class="text-gray-500 text-sm">Loading badge...</div>
        <div v-else-if="error" class="text-red-500 text-sm">{{ error }}</div>
        <div v-else class="flex flex-col items-center space-y-1 w-full">
          <img
            :src="badge.profile_picture"
            alt="Profile Picture"
            class="h-28 w-auto rounded-2xl border border-gray-300 object-cover mb-1"
          />
          <h2 class="text-xl font-semibold">
            {{ badge.title }} {{ badge.firstname }} {{ badge.middlename }} {{ badge.lastname }}
          </h2>
          <p class="text-md font-semibold text-gray-700">{{ badge.position }}</p>
          <p class="text-md font-semibold text-gray-700">{{ badge.organisation }}</p>
          <p class="text-md text-gray-600">{{ badge.country }}</p>
          <p class="text-md text-gray-600 font-medium">Participant ID #: {{ badge.user_id }}</p>
          <p
            class="text-md font-bold uppercase px-3 py-1 rounded-full"
            :class="roleClass(badge.event_participation_role)"
          >
            {{ badge.event_participation_role }}
          </p>
          <p class="text-md text-gray-400 italic">
            ({{ badge.event_country }} - {{ badge.event_location }})
          </p>
          <p class="text-sm text-gray-700 font-semibold">{{ badge.event_name }}</p>
          <div class="mt-2">
            <img :src="badge.qr_code_url" alt="QR Code" class="w-20 h-20" />
          </div>
        </div>
      </div>

      <!-- Download Button -->
      <div class="mt-4 text-center">
        <button
          @click="downloadBadgePDF"
          class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Download PDF
        </button>
      </div>
    </div>
  </div>

  <!-- Hidden PDF Render -->
  <div class="hidden">
    <div
      ref="wrapperRef"
      class="w-[8.27in] h-[11.69in] flex items-center justify-center bg-white"
    >
      <div
        ref="badgeRef"
        class="w-[4in] h-[4.5in] relative border border-dashed border-gray-300 p-3 flex flex-col justify-start items-center text-center"
      >
        <!-- Crop Marks -->
        <div class="absolute inset-0 pointer-events-none z-10">
          <div class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-black" />
          <div class="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-black" />
          <div class="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-black" />
          <div class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-black" />
        </div>

        <!-- Logos -->
        <div class="w-[3.6in] flex justify-between items-center mb-2">
          <img src="@/assets/moh_sz.png" alt="Kingdom of Eswatini MoH" class="h-16 w-auto" />
          <img src="@/assets/canecsa-logo.png" alt="CANECSA" class="h-16 w-auto" />
        </div>

        <!-- Badge Content (PDF) -->
        <div class="flex flex-col items-center space-y-1 w-[4.6in]">
          <img
            :src="badge.profile_picture"
            alt="Profile Picture"
            class="w-auto h-20 rounded-xl border border-gray-300 object-cover mb-1"
          />
          <h2 class="text-lg font-semibold">
            {{ badge.title }} {{ badge.firstname }} {{ badge.middlename }} {{ badge.lastname }}
          </h2>
          <p class="text-sm font-semibold text-gray-700">{{ badge.position }}</p>
          <p class="text-sm font-semibold text-gray-700">{{ badge.organisation }}</p>
          <p class="text-xs text-gray-600">{{ badge.country }}</p>
          <p class="text-xs text-gray-600 font-medium">ID #: {{ badge.user_id }}</p>
          <p
            class="text-sm font-bold uppercase px-3 py-1 rounded-full"
            :class="roleClass(badge.event_participation_role)"
          >
            {{ badge.event_participation_role }}
          </p>
          <p class="text-xs text-gray-400 italic">
            ({{ badge.event_country }} - {{ badge.event_location }})
          </p>
          <p class="text-md text-gray-700 font-semibold">{{ badge.event_name }}</p>
          <div class="mt-2">
            <img :src="badge.qr_code_url" alt="QR Code" class="w-20 h-20" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import html2pdf from 'html2pdf.js'
import api from '@/plugins/axios'
import defaultAvatarImg from '@/assets/default-avatar.svg'

const props = defineProps({
  visible: Boolean,
  userId: Number,
  eventId: Number
})

const emit = defineEmits(['close'])

const badge = ref({})
const loading = ref(false)
const error = ref(null)

const badgeRef = ref(null)
const wrapperRef = ref(null)

const close = () => emit('close')

watch(
  () => props.visible,
  async (newVal) => {
    if (!newVal) return
    loading.value = true
    error.value = null

    try {
      const [userRes, eventRes] = await Promise.all([
        api.get(`/users/${props.userId}`),
        api.get(`/events/${props.eventId}`)
      ])

      const user = userRes.data.user
      const profile = userRes.data.profile
      const event = eventRes.data.event

      badge.value = {
        profile_picture:
          userRes.data.profile_picture?.profile_picture
            ? `${import.meta.env.VITE_API_BASE_URL}/${userRes.data.profile_picture.profile_picture}`
            : defaultAvatarImg,
        title: profile.title || '',
        firstname: user.firstname,
        middlename: profile.middle_name || '',
        lastname: user.lastname,
        user_id: `BPF -${user.id}`,
        position: profile.position || 'Unknown position',
        organisation: profile.organisation || 'Unknown organisation',
        country: profile.country || 'Unknown country',
        event_name: event.event || 'Unknown Event',
        event_participation_role: (event.participation_role || 'Unknown').toUpperCase(),
        event_location: event.location || 'Unknown',
        event_country: event.country || 'Unknown',
        qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?data=U-${user.id}&size=100x100`
      }
    } catch (err) {
      error.value = 'Failed to load badge details.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }
)

function roleClass(role) {
  const styles = {
    SECRETARIAT: 'text-purple-700',
    DELEGATE: 'text-blue-700',
    PRESENTER: 'text-yellow-600',
    SPEAKER: 'text-indigo-700',
    SPONSOR: 'text-green-600',
    MODERATOR: 'text-red-600',
    PARTICIPANT: 'text-gray-700',
  }
  const key = role?.toUpperCase() || 'PARTICIPANT'
  return styles[key] || 'text-gray-700'
}

function downloadBadgePDF() {
  const element = wrapperRef.value
  const opt = {
    margin: 0,
    filename: `badge-${badge.value.user_id}.pdf`,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 4 },
    jsPDF: {
      unit: 'in',
      format: 'a4',
      orientation: 'portrait'
    }
  }

  html2pdf().set(opt).from(element).save()
}
</script>
