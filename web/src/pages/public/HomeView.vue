<template>
  <div class="min-h-screen bg-gray-50">

    <!-- ─── HERO: Featured Event ─────────────────────────────────────────────── -->
    <section v-if="featuredEvent" class="relative w-full overflow-hidden" style="min-height: 480px;">

      <!-- Background: banner image or gradient from org unit colors -->
      <div
        class="absolute inset-0 bg-center bg-cover"
        :style="heroBgStyle"
      ></div>
      <!-- Dark overlay for readability -->
      <div class="absolute inset-0" :style="heroOverlayStyle"></div>

      <!-- Content -->
      <div class="relative z-10 max-w-5xl mx-auto px-6 py-16 sm:py-24 text-white text-center">

        <!-- Org Unit Badge -->
        <div v-if="featuredEvent.org_unit" class="mb-4 inline-flex items-center gap-2">
          <img
            v-if="featuredEvent.org_unit.logo"
            :src="`${baseUrl}/${featuredEvent.org_unit.logo}`"
            class="h-8 w-8 object-contain rounded-full bg-white/20 p-0.5"
            alt="org logo"
          />
          <span
            class="text-sm font-semibold px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm"
          >
            {{ featuredEvent.org_unit.name }}
          </span>
        </div>

        <!-- Event Name -->
        <h1 class="text-3xl sm:text-5xl font-black leading-tight mb-4 drop-shadow-lg"
          v-html="formatOrdinals(featuredEvent.event)">
        </h1>

        <!-- Theme -->
        <p class="text-base sm:text-xl text-white/90 font-medium mb-6 max-w-2xl mx-auto">
          {{ featuredEvent.theme }}
        </p>

        <!-- Date & Location row -->
        <div class="flex flex-wrap justify-center gap-4 text-sm sm:text-base text-white/90 mb-8">
          <div class="flex items-center gap-2">
            <svg class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{{ formatDate(featuredEvent.start_date) }} – {{ formatDate(featuredEvent.end_date) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5 8a5 5 0 1110 0c0 3-5 9-5 9S5 11 5 8zm5-2a2 2 0 100 4 2 2 0 000-4z" clip-rule="evenodd" />
            </svg>
            <span>{{ featuredEvent.location }}</span>
          </div>
        </div>

        <!-- CTA Buttons -->
        <div class="flex flex-wrap justify-center gap-3">
          <router-link
            v-if="isRegistrationOpen"
            :to="{ name: 'Register', params: { id: featuredEvent.id } }"
            class="inline-block px-8 py-3 rounded-full font-semibold text-sm sm:text-base shadow-lg transition hover:opacity-90 hover:-translate-y-0.5"
            :style="{ backgroundColor: featuredEvent.org_unit?.secondary_color || '#f59d08', color: '#fff' }"
          >
            Register for conference →
          </router-link>
          <button
            v-else
            @click="showClosedMessage"
            class="inline-block px-8 py-3 rounded-full font-semibold text-sm sm:text-base bg-white/20 text-white/60 cursor-not-allowed"
          >
            Registration Closed
          </button>

          <router-link
            :to="{ name: 'AbstractSubmission' }"
            class="inline-block px-8 py-3 rounded-full font-semibold text-sm sm:text-base shadow-lg transition hover:opacity-90 hover:-translate-y-0.5 border-2 border-white text-white hover:bg-white hover:text-gray-800"
          >
            Submit Abstract
          </router-link>
        </div>

        <!-- View Details link -->
        <div class="mt-4">
          <router-link
            :to="{ name: 'Event', params: { id: featuredEvent.id } }"
            class="text-sm text-white/80 underline hover:text-white"
          >
            View event details
          </router-link>
        </div>
      </div>
    </section>

    <!-- ─── ALL UPCOMING EVENTS ───────────────────────────────────────────────── -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 py-12">

      <h2 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-8">
        {{ events.length > 0 ? 'Upcoming Events' : '' }}
      </h2>

      <DataLoadingSpinner v-if="isLoading" />

      <div v-else-if="events.length > 0" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="event in paginatedEvents"
          :key="event.id"
          class="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <!-- Colored top accent bar -->
          <div
            class="h-2 w-full"
            :style="{ backgroundColor: event.org_unit?.primary_color || '#1a1d56' }"
          ></div>

          <!-- Banner thumbnail (if available) -->
          <div
            v-if="event.banner_image"
            class="h-40 w-full bg-center bg-cover"
            :style="{ backgroundImage: `url('${baseUrl}/${event.banner_image}')` }"
          ></div>
          <!-- Fallback colored header strip when no banner -->
          <div
            v-else
            class="h-20 w-full flex items-center justify-center"
            :style="{
              background: `linear-gradient(135deg, ${event.org_unit?.primary_color || '#1a1d56'}, ${event.org_unit?.secondary_color || '#f59d08'})`
            }"
          >
            <span class="text-white font-bold text-lg opacity-70">
              {{ event.org_unit?.name || '' }}
            </span>
          </div>

          <!-- Card body -->
          <div class="p-5 space-y-3">
            <!-- Org unit badge -->
            <div class="flex items-center gap-2">
              <img
                v-if="event.org_unit?.logo"
                :src="`${baseUrl}/${event.org_unit.logo}`"
                class="h-5 w-5 object-contain rounded-full"
                alt=""
              />
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                :style="{ backgroundColor: event.org_unit?.primary_color || '#1a1d56' }"
              >
                {{ event.org_unit?.name }}
              </span>
            </div>

            <!-- Event name -->
            <h3 class="text-lg font-bold text-gray-800 leading-snug">{{ event.event }}</h3>

            <!-- Theme -->
            <p v-if="event.theme" class="text-sm text-gray-500 italic line-clamp-2">{{ event.theme }}</p>

            <!-- Date -->
            <div class="flex items-center gap-2 text-gray-600 text-sm">
              <svg class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{{ formatDate(event.start_date) }}</span>
            </div>

            <!-- Location -->
            <div class="flex items-center gap-2 text-gray-600 text-sm">
              <svg class="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 8a5 5 0 1110 0c0 3-5 9-5 9S5 11 5 8zm5-2a2 2 0 100 4 2 2 0 000-4z" clip-rule="evenodd" />
              </svg>
              <span>{{ event.location }}</span>
            </div>

            <!-- View Details button -->
            <router-link
              :to="{ name: 'Event', params: { id: event.id } }"
              class="mt-3 inline-block text-sm font-semibold px-4 py-2 rounded-full border-2 transition hover:text-white"
              :style="{
                borderColor: event.org_unit?.primary_color || '#1a1d56',
                color: event.org_unit?.primary_color || '#1a1d56',
              }"
              @mouseenter="(e) => { e.currentTarget.style.backgroundColor = event.org_unit?.primary_color || '#1a1d56' }"
              @mouseleave="(e) => { e.currentTarget.style.backgroundColor = 'transparent' }"
            >
              View Details
            </router-link>
          </div>
        </div>
      </div>

      <!-- No events -->
      <div v-else-if="!isLoading" class="text-center py-20 text-gray-400">
        <svg class="mx-auto h-12 w-12 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="text-lg font-medium">No upcoming events at the moment.</p>
        <p class="text-sm mt-1">Check back soon!</p>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-10 flex justify-center items-center gap-2">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition"
        >
          ← Prev
        </button>

        <button
          v-for="page in totalPages"
          :key="page"
          @click="goToPage(page)"
          class="px-4 py-2 rounded-xl border transition font-medium"
          :class="currentPage === page
            ? 'bg-[#1a1d56] text-white border-[#1a1d56]'
            : 'border-gray-300 text-gray-600 hover:bg-gray-100'"
        >
          {{ page }}
        </button>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition"
        >
          Next →
        </button>
      </div>
    </section>
    <!-- ─── CONTACT CTA STRIP ──────────────────────────────────────────────── -->
    <section class="mt-12" style="background: linear-gradient(135deg, #1a1d56 0%, #171a4d 100%);">
      <div class="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-white">
        <div>
          <h2 class="text-xl sm:text-2xl font-bold mb-1">Have a question about an event?</h2>
          <p class="text-white/75 text-sm">Reach out to the CANECSA Secretariat — Arusha, Tanzania · info@canecsa.org</p>
        </div>
        <router-link
          :to="{ name: 'Contact' }"
          class="flex-shrink-0 px-7 py-3 rounded-full font-semibold text-sm transition hover:opacity-90 shadow-lg"
          style="background-color: #f59d08; color: #fff;"
        >
          Contact Us →
        </router-link>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/plugins/axios'
import DataLoadingSpinner from '@/components/common/DataLoadingSpinner.vue'

const baseUrl = import.meta.env.VITE_API_BASE_URL

const isLoading = ref(false)
const events = ref([])
const featuredEvent = ref(null)
const currentPage = ref(1)
const perPage = ref(6)

const fetchEvents = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/events/', { params: { skip: 0, limit: 100 } })
    const allEvents = response.data.data || []
    const sorted = [...allEvents].sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    featuredEvent.value = sorted[0] || null
    events.value = sorted.slice(1)
  } catch (error) {
    console.error('Error fetching events:', error.response?.data || error.message)
  } finally {
    isLoading.value = false
  }
}

// ─── Hero background: banner image OR gradient ─────────────────────────────
const heroBgStyle = computed(() => {
  if (!featuredEvent.value) return {}
  const banner = featuredEvent.value.banner_image
  if (banner) {
    return { backgroundImage: `url('${baseUrl}/${banner}')` }
  }
  const p = featuredEvent.value.org_unit?.primary_color || '#1a1d56'
  const s = featuredEvent.value.org_unit?.secondary_color || '#f59d08'
  return { background: `linear-gradient(135deg, ${p} 0%, ${s} 100%)` }
})

const heroOverlayStyle = computed(() => {
  if (!featuredEvent.value) return {}
  // Darker overlay when there's a photo, lighter when using gradient
  const opacity = featuredEvent.value.banner_image ? '0.55' : '0.30'
  return { backgroundColor: `rgba(0,0,0,${opacity})` }
})

// ─── Pagination ─────────────────────────────────────────────────────────────
const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return events.value.slice(start, start + perPage.value)
})

const totalPages = computed(() => Math.max(1, Math.ceil(events.value.length / perPage.value)))

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
}

// ─── Utilities ───────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

const isRegistrationOpen = computed(() => {
  if (!featuredEvent.value?.start_date) return false
  const diffInDays = (new Date(featuredEvent.value.start_date) - new Date()) / (1000 * 60 * 60 * 24)
  return diffInDays >= 7
})

const showClosedMessage = () => {
  alert('Registration is closed for this event.')
}

const formatOrdinals = (text) => {
  if (!text) return ''
  // Normalize Unicode superscript ordinals back to ASCII first
  const normalized = text
    .replace(/ᵗʰ/g, 'th')
    .replace(/ˢᵗ/g, 'st')
    .replace(/ⁿᵈ/g, 'nd')
    .replace(/ʳᵈ/g, 'rd')
  return normalized.replace(/(\d+)(st|nd|rd|th)\b/gi, (_, num, suffix) =>
    `${num}<sup style="font-size:0.55em;vertical-align:super;">${suffix}</sup>`
  )
}

onMounted(fetchEvents)
</script>
