<template>
  <div class="bg-gray-50 text-gray-800 font-sans min-h-screen">

    <!-- ─── Hero Banner ──────────────────────────────────────────────────────── -->
    <section class="relative w-full overflow-hidden" style="min-height: 340px;">
      <div class="absolute inset-0 bg-center bg-cover" :style="heroBgStyle"></div>
      <div class="absolute inset-0" :style="heroOverlayStyle"></div>

      <div class="relative z-10 max-w-4xl mx-auto px-6 py-14 sm:py-20 text-white text-center">
        <div v-if="event?.org_unit" class="mb-3 text-sm font-semibold text-white/80">
          Organised by {{ event.org_unit }}
        </div>
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-3 drop-shadow-md">
          {{ event?.event }}
        </h1>
        <p class="text-base text-white/90 mb-6">
          {{ formatDate(event?.start_date) }} – {{ formatDate(event?.end_date) }}
          &middot; {{ event?.location }}
        </p>
        <router-link
          v-if="isRegistrationOpen"
          :to="{ name: 'Register', params: { id: event?.id } }"
          class="inline-block font-semibold px-7 py-2.5 rounded-full shadow transition hover:opacity-90"
          :style="{ backgroundColor: event?.org_unit_secondary_color || '#f59d08', color: '#fff' }"
        >
          Register Now
        </router-link>
        <button
          v-else
          @click="showClosedMessage"
          class="inline-block bg-white/20 text-white/60 font-semibold px-7 py-2.5 rounded-full cursor-not-allowed"
        >
          Registration Closed
        </button>
      </div>
    </section>

    <!-- ─── Main Content ─────────────────────────────────────────────────────── -->
    <section class="max-w-5xl mx-auto px-6 py-10 space-y-10">
      <div v-if="loading" class="text-center py-10"><DataLoadingSpinner /></div>
      <div v-else-if="error" class="text-center text-red-600 py-10">{{ error }}</div>
      <div v-else class="space-y-8">

        <!-- ── Event Details ──────────────────────────────────────────────────── -->
        <section class="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div class="px-6 py-4 flex items-center gap-3 border-b border-gray-100">
            <div class="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: primaryColor }">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 class="text-xl font-bold" :style="{ color: primaryColor }">Event Details</h2>
          </div>
          <div class="px-6 py-5">
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                <div class="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" :style="{ backgroundColor: primaryColor + '20' }">
                  <svg class="w-4 h-4" :style="{ color: primaryColor }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <div>
                  <dt class="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Theme</dt>
                  <dd class="text-gray-800 font-medium text-sm leading-snug">{{ event?.theme || '—' }}</dd>
                </div>
              </div>
              <div class="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                <div class="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" :style="{ backgroundColor: secondaryColor + '25' }">
                  <svg class="w-4 h-4" :style="{ color: secondaryColor }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <dt class="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Location</dt>
                  <dd class="text-gray-800 font-medium text-sm">{{ event?.location || '—' }}</dd>
                </div>
              </div>
              <div class="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                <div class="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" :style="{ backgroundColor: primaryColor + '20' }">
                  <svg class="w-4 h-4" :style="{ color: primaryColor }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <dt class="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Start Date</dt>
                  <dd class="text-gray-800 font-medium text-sm">{{ formatDate(event?.start_date) }}</dd>
                </div>
              </div>
              <div class="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                <div class="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" :style="{ backgroundColor: secondaryColor + '25' }">
                  <svg class="w-4 h-4" :style="{ color: secondaryColor }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <dt class="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">End Date</dt>
                  <dd class="text-gray-800 font-medium text-sm">{{ formatDate(event?.end_date) }}</dd>
                </div>
              </div>
              <div class="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                <div class="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" :style="{ backgroundColor: primaryColor + '20' }">
                  <svg class="w-4 h-4" :style="{ color: primaryColor }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <dt class="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Organised By</dt>
                  <dd class="font-semibold text-sm" :style="{ color: primaryColor }">{{ event?.org_unit || '—' }}</dd>
                </div>
              </div>
              <div v-if="event?.country" class="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                <div class="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" :style="{ backgroundColor: secondaryColor + '25' }">
                  <svg class="w-4 h-4" :style="{ color: secondaryColor }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                </div>
                <div>
                  <dt class="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Country</dt>
                  <dd class="text-gray-800 font-medium text-sm">{{ event.country }}</dd>
                </div>
              </div>
            </dl>
          </div>
        </section>

        <!-- ── Organizers ─────────────────────────────────────────────────────── -->
        <section v-if="event?.organizers" class="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div class="px-6 py-4 flex items-center gap-3 border-b border-gray-100">
            <div class="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: primaryColor }">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 class="text-xl font-bold" :style="{ color: primaryColor }">Organizers</h2>
          </div>
          <div class="px-6 py-5">
            <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ event.organizers }}</p>
          </div>
        </section>

        <!-- ── Description ────────────────────────────────────────────────────── -->
        <section v-if="event?.description" class="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div class="px-6 py-4 flex items-center gap-3 border-b border-gray-100">
            <div class="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: primaryColor }">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 class="text-xl font-bold" :style="{ color: primaryColor }">About This Event</h2>
          </div>
          <div class="px-6 py-5">
            <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ event.description }}</p>
          </div>
        </section>

        <!-- ══════════════════════════════════════════════════════════════════════
             PARTICIPATION CATEGORIES & CONFERENCE FEES
             Cards layout matching events.ecsahc.org
        ═══════════════════════════════════════════════════════════════════════ -->
        <section v-if="participationData.categories.length">
          <!-- Section header -->
          <div
            class="px-6 py-4 flex items-center gap-3"
            :style="{ backgroundColor: primaryColor }"
          >
            <svg class="w-6 h-6 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <h2 class="text-xl font-bold text-white">Participation Categories &amp; Conference Fees</h2>
          </div>

          <!-- Category cards grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-px bg-gray-200">
            <div
              v-for="cat in participationData.categories"
              :key="cat.name"
              class="flex flex-col items-center justify-between p-6 text-center"
              :style="{ backgroundColor: primaryColor }"
            >
              <!-- Icon -->
              <div class="h-12 w-12 rounded-full bg-white/15 flex items-center justify-center mb-3">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <!-- Category name -->
              <h3 class="text-white font-bold text-base leading-snug mb-4 min-h-[2.5rem] flex items-center">
                {{ cat.name }}
              </h3>
              <!-- Fee badge -->
              <span
                class="inline-block px-5 py-2 font-bold text-sm rounded-sm shadow"
                :style="{ backgroundColor: '#ffffff', color: primaryColor }"
              >
                {{ cat.fee }}
              </span>
            </div>
          </div>

          <!-- Discount note -->
          <div
            v-if="participationData.note"
            class="flex items-center gap-2 px-5 py-3 text-sm font-medium text-white"
            :style="{ backgroundColor: secondaryColor }"
          >
            <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            {{ participationData.note }}
          </div>
        </section>

        <!-- ══════════════════════════════════════════════════════════════════════
             LOGISTICS INFORMATION — Accordion
        ═══════════════════════════════════════════════════════════════════════ -->
        <section v-if="logisticsSections.length">
          <!-- Section header -->
          <div
            class="px-6 py-4 flex items-center gap-3"
            :style="{ backgroundColor: primaryColor }"
          >
            <svg class="w-6 h-6 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <h2 class="text-xl font-bold text-white">Logistics Information</h2>
          </div>

          <!-- Accordion items -->
          <div class="border border-t-0 border-gray-200 divide-y divide-gray-200 bg-white">
            <div v-for="(sec, i) in logisticsSections" :key="i">
              <!-- Accordion header button -->
              <button
                @click="toggleLogistics(i)"
                class="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-base transition-colors"
                :style="openLogistics === i
                  ? { backgroundColor: secondaryColor, color: '#ffffff' }
                  : { backgroundColor: '#f8fafc', color: '#1e3a5f' }"
              >
                <span>{{ sec.title }}</span>
                <svg
                  class="w-5 h-5 flex-shrink-0 transition-transform duration-200"
                  :class="openLogistics === i ? 'rotate-180' : ''"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <!-- Accordion content -->
              <div v-show="openLogistics === i" class="px-6 py-5 bg-white text-gray-700 text-sm leading-relaxed whitespace-pre-line border-t border-gray-100">
                {{ sec.content }}
              </div>
            </div>
          </div>
        </section>

        <!-- ══════════════════════════════════════════════════════════════════════
             SPONSORS & EXHIBITORS — Tier cards
        ═══════════════════════════════════════════════════════════════════════ -->
        <section v-if="sponsorTiers.length">
          <!-- Section header -->
          <div
            class="px-6 py-4 flex items-center gap-3"
            :style="{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }"
          >
            <svg class="w-6 h-6 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <h2 class="text-xl font-bold text-white">Sponsors &amp; Exhibitors Opportunities</h2>
          </div>

          <!-- Tier cards grid -->
          <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 pt-5 bg-gray-50 px-0">
            <div
              v-for="(tier, i) in sponsorTiers"
              :key="tier.name"
              class="flex flex-col rounded-xl overflow-hidden shadow-md border-2"
              :style="{ borderColor: tierBorderColor(i) }"
            >
              <!-- Card header -->
              <div
                class="px-5 py-5 text-center"
                :style="{ background: tierHeaderBg(i) }"
              >
                <!-- Tier icon -->
                <div class="text-3xl mb-2">{{ tierEmoji(i) }}</div>
                <!-- Tier name -->
                <h3 class="font-black text-lg text-white leading-tight">{{ tier.name }}</h3>
                <!-- Price -->
                <div
                  class="mt-3 inline-block px-4 py-1.5 rounded-sm font-black text-xl"
                  style="background-color: rgba(255,255,255,0.2); color: #fff;"
                >
                  {{ tier.fee }}
                </div>
              </div>

              <!-- Benefits list -->
              <div class="flex-1 bg-white px-5 py-4 space-y-2">
                <div
                  v-for="benefit in tier.benefits"
                  :key="benefit"
                  class="flex items-start gap-2 text-sm text-gray-700"
                >
                  <svg
                    class="w-4 h-4 mt-0.5 flex-shrink-0"
                    :style="{ color: tierBorderColor(i) }"
                    fill="currentColor" viewBox="0 0 20 20"
                  >
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>{{ benefit }}</span>
                </div>
              </div>

              <!-- Contact CTA -->
              <div class="bg-white px-5 pb-4">
                <a
                  href="mailto:regsec@ecsahc.org"
                  class="block text-center text-xs font-semibold py-2 rounded-full transition hover:opacity-80"
                  :style="{ backgroundColor: tierBorderColor(i), color: '#fff' }"
                >
                  Enquire →
                </a>
              </div>
            </div>
          </div>

          <!-- Contact note -->
          <p class="text-center text-sm text-gray-500 mt-4 pb-2">
            For sponsorship enquiries contact
            <a href="mailto:regsec@ecsahc.org" class="font-semibold underline" :style="{ color: primaryColor }">regsec@ecsahc.org</a>
          </p>
        </section>

        <!-- ── Downloads ──────────────────────────────────────────────────────── -->
        <section class="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div class="px-6 py-4 flex items-center gap-3 border-b border-gray-100">
            <div class="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: primaryColor }">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h2 class="text-xl font-bold" :style="{ color: primaryColor }">Downloads</h2>
          </div>
          <div class="px-6 py-5">

            <!-- ✅ Paid — show files -->
            <div v-if="userAccess === 'paid' && documents.length">
              <ul class="space-y-2">
                <li v-for="file in documents" :key="file.id"
                  class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
                  <div class="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: primaryColor }">
                    <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                  <a :href="`${baseUrl}/${file.path}`" target="_blank"
                    class="text-sm font-semibold hover:underline" :style="{ color: primaryColor }">
                    {{ file.name }}
                  </a>
                </li>
              </ul>
            </div>

            <!-- ✅ Paid but no files yet -->
            <div v-else-if="userAccess === 'paid' && !documents.length"
              class="text-sm text-gray-400 italic">
              No downloads available yet.
            </div>

            <!-- 🔒 Logged in but unpaid -->
            <div v-else-if="userAccess === 'unpaid'"
              class="flex items-start gap-4 rounded-xl p-4 border-2"
              :style="{ borderColor: primaryColor + '40', backgroundColor: primaryColor + '08' }">
              <div class="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" :style="{ backgroundColor: primaryColor }">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p class="font-semibold text-gray-800 text-sm">Payment Required</p>
                <p class="text-gray-500 text-sm mt-0.5">
                  Documents are available to registered participants who have completed payment.
                  Please register and pay to access these files.
                </p>
                <router-link
                  :to="{ name: 'Register', params: { id: event?.id } }"
                  class="inline-block mt-3 px-4 py-2 rounded-full text-xs font-bold text-white transition hover:opacity-90"
                  :style="{ backgroundColor: primaryColor }"
                >
                  Register &amp; Pay →
                </router-link>
              </div>
            </div>

            <!-- 🔒 Not logged in -->
            <div v-else
              class="flex items-start gap-4 rounded-xl p-4 border-2 border-gray-200 bg-gray-50">
              <div class="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-gray-300">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p class="font-semibold text-gray-700 text-sm">Members Only</p>
                <p class="text-gray-500 text-sm mt-0.5">
                  Downloads are available to paid participants only.
                  Please <router-link to="/login" class="underline font-semibold" :style="{ color: primaryColor }">log in</router-link>
                  and ensure your registration payment is complete.
                </p>
              </div>
            </div>

          </div>
        </section>

        <!-- ── Useful Links ───────────────────────────────────────────────────── -->
        <section class="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div class="px-6 py-4 flex items-center gap-3 border-b border-gray-100">
            <div class="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: secondaryColor }">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h2 class="text-xl font-bold" :style="{ color: secondaryColor }">Useful Links</h2>
          </div>
          <div class="px-6 py-5">

            <!-- ✅ Paid — show links -->
            <div v-if="userAccess === 'paid' && links.length">
              <ul class="space-y-2">
                <li v-for="link in links" :key="link.id"
                  class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
                  <div class="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: secondaryColor }">
                    <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                  <a :href="link.link" target="_blank"
                    class="text-sm font-semibold hover:underline" :style="{ color: secondaryColor }">
                    {{ link.name }}
                  </a>
                </li>
              </ul>
            </div>

            <!-- ✅ Paid but no links yet -->
            <div v-else-if="userAccess === 'paid' && !links.length"
              class="text-sm text-gray-400 italic">
              No links available yet.
            </div>

            <!-- 🔒 Logged in but unpaid -->
            <div v-else-if="userAccess === 'unpaid'"
              class="flex items-start gap-4 rounded-xl p-4 border-2"
              :style="{ borderColor: secondaryColor + '40', backgroundColor: secondaryColor + '08' }">
              <div class="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" :style="{ backgroundColor: secondaryColor }">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p class="font-semibold text-gray-800 text-sm">Payment Required</p>
                <p class="text-gray-500 text-sm mt-0.5">
                  Resource links are available to registered participants who have completed payment.
                </p>
                <router-link
                  :to="{ name: 'Register', params: { id: event?.id } }"
                  class="inline-block mt-3 px-4 py-2 rounded-full text-xs font-bold text-white transition hover:opacity-90"
                  :style="{ backgroundColor: secondaryColor }"
                >
                  Register &amp; Pay →
                </router-link>
              </div>
            </div>

            <!-- 🔒 Not logged in -->
            <div v-else
              class="flex items-start gap-4 rounded-xl p-4 border-2 border-gray-200 bg-gray-50">
              <div class="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-gray-300">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p class="font-semibold text-gray-700 text-sm">Members Only</p>
                <p class="text-gray-500 text-sm mt-0.5">
                  Useful links are available to paid participants only.
                  Please <router-link to="/login" class="underline font-semibold" :style="{ color: primaryColor }">log in</router-link>
                  and ensure your registration payment is complete.
                </p>
              </div>
            </div>

          </div>
        </section>

      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/plugins/axios'
import DataLoadingSpinner from '@/components/common/DataLoadingSpinner.vue'
const baseUrl = import.meta.env.VITE_API_BASE_URL
const route = useRoute()
const eventId = Number(route.params.id)

const event = ref(null)
const documents = ref([])
const links = ref([])
const loading = ref(true)
const error = ref(null)

// "none" | "unpaid" | "paid"  — returned by the backend based on the JWT
const userAccess = ref('none')

// ─── Accordion state ──────────────────────────────────────────────────────
const openLogistics = ref(0) // first section open by default

function toggleLogistics(i) {
  openLogistics.value = openLogistics.value === i ? -1 : i
}

// ─── Dynamic colors ───────────────────────────────────────────────────────
const primaryColor = computed(() => event.value?.org_unit_primary_color || '#1a1d56')
const secondaryColor = computed(() => event.value?.org_unit_secondary_color || '#f59d08')

const heroBgStyle = computed(() => {
  if (!event.value) return {}
  const banner = event.value.banner_image
  if (banner) return { backgroundImage: `url('${baseUrl}/${banner}')` }
  return { background: `linear-gradient(135deg, ${primaryColor.value} 0%, ${secondaryColor.value} 100%)` }
})

const heroOverlayStyle = computed(() => {
  if (!event.value) return {}
  const opacity = event.value.banner_image ? '0.50' : '0.25'
  return { backgroundColor: `rgba(0,0,0,${opacity})` }
})

// ─── Parsers ──────────────────────────────────────────────────────────────

// participation_info format: "Category Name|Fee\n---\nNote text"
const participationData = computed(() => {
  const raw = event.value?.participation_info || ''
  if (!raw) return { categories: [], note: '' }
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
  const categories = []
  let note = ''
  let noteMode = false
  for (const line of lines) {
    if (line === '---') { noteMode = true; continue }
    if (noteMode) { note += (note ? ' ' : '') + line; continue }
    const parts = line.split('|')
    if (parts.length >= 2) {
      categories.push({ name: parts[0].trim(), fee: parts[1].trim() })
    }
  }
  return { categories, note }
})

// logistics_info format: "## Section Title\nContent text\n\n## Next Section\n..."
const logisticsSections = computed(() => {
  const raw = event.value?.logistics_info || ''
  if (!raw) return []
  return raw
    .split(/\n##\s+/)
    .filter(Boolean)
    .map(block => {
      const nl = block.indexOf('\n')
      if (nl === -1) return { title: block.replace(/^##\s*/, '').trim(), content: '' }
      return {
        title: block.slice(0, nl).replace(/^##\s*/, '').trim(),
        content: block.slice(nl + 1).trim()
      }
    })
    .filter(s => s.title)
})

// sponsors_info format: "Tier Name|Price|Benefit 1;Benefit 2;Benefit 3"
const sponsorTiers = computed(() => {
  const raw = event.value?.sponsors_info || ''
  if (!raw) return []
  return raw
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.includes('|'))
    .map(line => {
      const parts = line.split('|')
      return {
        name: parts[0]?.trim() || '',
        fee: parts[1]?.trim() || '',
        benefits: (parts[2] || '').split(';').map(b => b.trim()).filter(Boolean)
      }
    })
})

// ─── Sponsor tier styling helpers ─────────────────────────────────────────
const TIER_STYLES = [
  { bg: 'linear-gradient(135deg, #B8860B, #8B6914)', border: '#B8860B', emoji: '🥇' }, // Platinum
  { bg: 'linear-gradient(135deg, #4A90C4, #1B5E8C)', border: '#4A90C4', emoji: '💎' }, // Diamond
  { bg: 'linear-gradient(135deg, #D4A017, #A87800)', border: '#D4A017', emoji: '🥈' }, // Gold
  { bg: 'linear-gradient(135deg, #7B9EA6, #4A6E78)', border: '#7B9EA6', emoji: '🥉' }, // Silver
  { bg: 'linear-gradient(135deg, #1a1d56, #171a4d)', border: '#1a1d56', emoji: '🏢' }, // Exhibitor
]

function tierHeaderBg(i) {
  return (TIER_STYLES[i] || TIER_STYLES[TIER_STYLES.length - 1]).bg
}
function tierBorderColor(i) {
  return (TIER_STYLES[i] || TIER_STYLES[TIER_STYLES.length - 1]).border
}
function tierEmoji(i) {
  return (TIER_STYLES[i] || TIER_STYLES[TIER_STYLES.length - 1]).emoji
}

// ─── Data loading ─────────────────────────────────────────────────────────
async function loadEventData() {
  loading.value = true
  error.value = null
  try {
    const res = await api.get(`/events/${eventId}`)
    event.value = res.data.event
    documents.value = res.data.documents || []
    links.value = res.data.links || []
    // Backend computes access level based on the Bearer token sent automatically
    userAccess.value = res.data.event?.user_access || 'none'
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to load event'
  } finally {
    loading.value = false
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────
const isRegistrationOpen = computed(() => {
  if (!event.value?.start_date) return false
  const diffDays = (new Date(event.value.start_date) - new Date()) / (1000 * 60 * 60 * 24)
  return diffDays >= 7
})

function showClosedMessage() {
  alert('Registration is closed. It\'s less than 7 days to the event.')
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

onMounted(loadEventData)
</script>
