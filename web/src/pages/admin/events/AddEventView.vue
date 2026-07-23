<template>
  <div class="flex-1 flex flex-col max-w-7xl w-full mx-auto overflow-hidden">
    <!-- Admin Bar -->
    <AdminBar title="Add Event">
      <router-link :to="{ name: 'AdminEvents' }" class="text-sm text-blue-600 hover:underline">Events</router-link>
      <span class="mx-2 text-sm text-gray-500">/</span>
      <span class="text-sm text-gray-700">Add</span>
    </AdminBar>

    <!-- Page Title -->
    <div class="px-6 pt-4 pb-2">
      <h1 class="text-xl font-bold text-gray-800">Add Event</h1>
    </div>

    <!-- Add Event Form -->
    <main class="px-6 pb-6">
      <div class="w-full bg-white shadow rounded-lg p-6">
        <form @submit.prevent="submitEvent" class="space-y-4" novalidate>

          <!-- Event Name -->
          <div class="w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
            <input
              v-model="newEvent.event"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
            />
            <p v-if="submitted && !newEvent.event" class="text-sm text-red-500 mt-1">Event name is required.</p>
          </div>

          <!-- Theme -->
          <div class="w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Theme</label>
            <input
              v-model="newEvent.theme"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
            />
          </div>

          <!-- Description -->
          <div class="w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              v-model="newEvent.description"
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
            ></textarea>
          </div>

          <!-- Organizers -->
          <div class="w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Organizers</label>
            <textarea
              v-model="newEvent.organizers"
              rows="3"
              placeholder="e.g. ECSA-HC Secretariat, Ministry of Health Kenya..."
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
            ></textarea>
          </div>

          <!-- ── Optional Event Info Sections ──────────────────────────── -->
          <div class="w-full md:w-1/2 pt-2">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Additional Information (optional)</p>

            <!-- Participation Categories & Conference Fees -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Participation Categories &amp; Conference Fees</label>
              <textarea
                v-model="newEvent.participation_info"
                rows="5"
                placeholder="e.g. Delegates – USD 800, Students – USD 400, Online – USD 200..."
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56] text-sm"
              ></textarea>
            </div>

            <!-- Logistics Information -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Logistics Information</label>
              <textarea
                v-model="newEvent.logistics_info"
                rows="5"
                placeholder="e.g. Venue address, recommended hotels, visa requirements, transport options..."
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56] text-sm"
              ></textarea>
            </div>

            <!-- Sponsors & Exhibitors -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Sponsors &amp; Exhibitors Opportunities</label>
              <textarea
                v-model="newEvent.sponsors_info"
                rows="5"
                placeholder="e.g. Gold Package – USD 10,000, Exhibition booth – USD 3,000..."
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56] text-sm"
              ></textarea>
            </div>
          </div>

          <!-- Start Date -->
          <div class="w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              v-model="newEvent.start_date"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
            />
          </div>

          <!-- End Date -->
          <div class="w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              v-model="newEvent.end_date"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
            />
          </div>

          <!-- Location -->
          <div class="w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              v-model="newEvent.location"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
            />
          </div>

          <!-- Org Unit -->
          <div class="w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Organizational Unit</label>
            <select
              v-model="newEvent.org_unit_id"
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
            >
              <option disabled value="0">Select Org Unit</option>
              <option v-for="unit in orgUnits" :key="unit.id" :value="unit.id">
                {{ unit.name }}
              </option>
            </select>
          </div>

          <!-- Country -->
          <div class="w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <select
              v-model="newEvent.country_id"
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"
            >
              <option disabled value="0">Select Country</option>
              <option v-for="country in countries" :key="country.id" :value="country.id">
                {{ country.country }}
              </option>
            </select>
          </div>

          <!-- Banner / Poster Image -->
          <div class="w-full md:w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Banner / Poster Image</label>
            <input
              type="file"
              accept="image/*"
              @change="onBannerChange"
              class="w-full text-sm text-gray-600 border border-gray-300 rounded-xl px-3 py-2"
            />
            <div v-if="bannerPreview" class="mt-3">
              <img :src="bannerPreview" alt="Banner preview" class="w-full max-h-48 object-cover rounded-xl border border-gray-200" />
            </div>
          </div>

          <!-- Error message -->
          <p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>

          <!-- Buttons -->
          <div class="flex space-x-4 w-full md:w-1/2">
            <LoadingButton
              :loading="isSubmitting"
              :loadingLabel="'Saving...'"
              @click="submitEvent"
            >
              Save Event
            </LoadingButton>

            <router-link
              :to="{ name: 'AdminEvents' }"
              class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-xl transition"
            >
              Cancel
            </router-link>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/plugins/axios'
import AdminBar from '@/components/common/AdminBar.vue'
import LoadingButton from '@/components/common/LoadingButton.vue'

const router = useRouter()

// Form state
const newEvent = ref({
  event: '',
  theme: '',
  description: '',
  organizers: '',
  start_date: '',
  end_date: '',
  location: '',
  org_unit_id: 0,
  country_id: 0,
  participation_info: '',
  logistics_info: '',
  sponsors_info: '',
})

const bannerFile = ref(null)
const bannerPreview = ref(null)
const orgUnits = ref([])
const countries = ref([])
const isSubmitting = ref(false)
const submitted = ref(false)
const errorMsg = ref('')

const onBannerChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  bannerFile.value = file
  bannerPreview.value = URL.createObjectURL(file)
}

// Submit handler
const submitEvent = async () => {
  submitted.value = true
  errorMsg.value = ''

  if (!newEvent.value.event || newEvent.value.org_unit_id === 0 || newEvent.value.country_id === 0) {
    return
  }

  try {
    isSubmitting.value = true

    // Step 1: Create the event
    const res = await api.post('/events/', newEvent.value)
    const eventId = res.data.id

    // Step 2: Upload banner if selected
    if (bannerFile.value && eventId) {
      const formData = new FormData()
      formData.append('file', bannerFile.value)
      await api.post(`/events/upload_banner/${eventId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    router.push({ name: 'AdminEvents' })
  } catch (error) {
    console.error('Failed to create event:', error.response?.data || error.message)
    errorMsg.value = error.response?.data?.detail || 'Failed to save event. Please check the details and try again.'
  } finally {
    isSubmitting.value = false
  }
}

// Fetch org units and countries
const fetchOrgUnits = async () => {
  try {
    const response = await api.get('/org_units/', { params: { skip: 0, limit: 100 } })
    orgUnits.value = response.data.data
  } catch (err) {
    console.error('Failed to fetch org units:', err)
  }
}

const fetchCountries = async () => {
  try {
    const response = await api.get('/countries/', { params: { skip: 0, limit: 100 } })
    countries.value = response.data.data
  } catch (err) {
    console.error('Failed to fetch countries:', err)
  }
}

onMounted(() => {
  fetchOrgUnits()
  fetchCountries()
})
</script>
