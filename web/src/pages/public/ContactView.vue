<template>
  <div class="min-h-screen bg-gray-50">

    <!-- ─── Hero ─────────────────────────────────────────────────────────────── -->
    <section class="relative overflow-hidden text-white" style="background: linear-gradient(135deg, #1a1d56 0%, #171a4d 60%, #131540 100%);">
      <!-- Decorative rings -->
      <div class="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10" style="background: #f59d08;"></div>
      <div class="absolute -bottom-12 -left-12 w-56 h-56 rounded-full opacity-10" style="background: #f59d08;"></div>

      <div class="relative z-10 max-w-5xl mx-auto px-6 py-16 sm:py-24 text-center">
        <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          CANECSA Secretariat
        </div>
        <h1 class="text-4xl sm:text-5xl font-black mb-4 drop-shadow-sm">Get In Touch</h1>
        <p class="text-lg text-white/80 max-w-xl mx-auto leading-relaxed">
          Reach out to the CANECSA Secretariat for enquiries about events, registration, sponsorship, or any other information.
        </p>
      </div>
    </section>

    <!-- ─── Contact Cards ────────────────────────────────────────────────────── -->
    <section class="max-w-5xl mx-auto px-6 -mt-8 relative z-10">
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

        <!-- Address -->
        <div class="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow">
          <div class="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0" style="background-color: #1a1d56;">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-gray-800 text-sm uppercase tracking-wide mb-2" style="color: #1a1d56;">Address</h3>
            <p class="text-gray-600 text-sm leading-relaxed">
              157 Olorien, Njiro Road<br />
              P.O. Box 1009<br />
              Arusha, Tanzania
            </p>
          </div>
        </div>

        <!-- Phone -->
        <div class="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow">
          <div class="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0" style="background-color: #f59d08;">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-sm uppercase tracking-wide mb-2" style="color: #f59d08;">Phone</h3>
            <a href="tel:+255272973677" class="text-gray-600 text-sm hover:underline block">+255-27-2973677</a>
            <a href="tel:+255272973678" class="text-gray-600 text-sm hover:underline block">+255-27-2973678</a>
            <p class="text-gray-400 text-xs mt-2">Mon – Fri · 08:00 – 17:00 (EAT)</p>
          </div>
        </div>

        <!-- Email -->
        <div class="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow">
          <div class="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0" style="background-color: #1a1d56;">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-sm uppercase tracking-wide mb-2" style="color: #1a1d56;">Email</h3>
            <a href="mailto:info@canecsa.org" class="text-gray-600 text-sm hover:underline break-all block">
              info@canecsa.org
            </a>
            <a href="mailto:info@canecsa.org" class="text-gray-600 text-sm hover:underline break-all block mt-1">
              info@canecsa.org
            </a>
          </div>
        </div>

        <!-- Website -->
        <div class="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow">
          <div class="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0" style="background-color: #f59d08;">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-sm uppercase tracking-wide mb-2" style="color: #f59d08;">Website</h3>
            <a href="https://canecsa.org" target="_blank" class="text-gray-600 text-sm hover:underline block">
              canecsa.org
            </a>
            <a href="https://canecsa.org" target="_blank" class="text-gray-600 text-sm hover:underline block mt-1">
              canecsa.org
            </a>
          </div>
        </div>

      </div>
    </section>

    <!-- ─── Map + About ──────────────────────────────────────────────────────── -->
    <section class="max-w-5xl mx-auto px-6 py-12 grid gap-8 md:grid-cols-5">

      <!-- Map (wider) -->
      <div class="md:col-span-3 rounded-2xl overflow-hidden shadow-md border border-gray-200">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3985.1!2d36.6875!3d-3.3731!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x183709e3c2c6e11d%3A0x8e45d7b0e8c6a0d2!2sNjiro%20Rd%2C%20Arusha%2C%20Tanzania!5e0!3m2!1sen!2stz!4v1"
          width="100%"
          height="340"
          style="border:0;"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          title="CANECSA Secretariat — Arusha, Tanzania"
        ></iframe>
      </div>

      <!-- About the Secretariat -->
      <div class="md:col-span-2 bg-white rounded-2xl shadow-md p-7 flex flex-col justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-800 mb-4" style="color: #1a1d56;">About CANECSA</h2>
          <p class="text-gray-600 text-sm leading-relaxed mb-4">
            The College of Anaesthesiologists of East, Central and Southern Africa (CANECSA) is an intergovernmental health organisation serving 14 Member States.
          </p>
          <p class="text-gray-600 text-sm leading-relaxed mb-4">
            The Secretariat, based in Arusha, Tanzania, coordinates regional health programmes, hosts ministerial conferences, and facilitates technical collaboration across the region.
          </p>
          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex items-center gap-2">
              <span class="h-1.5 w-1.5 rounded-full flex-shrink-0" style="background-color: #1a1d56;"></span>
              14 Member States
            </div>
            <div class="flex items-center gap-2">
              <span class="h-1.5 w-1.5 rounded-full flex-shrink-0" style="background-color: #f59d08;"></span>
              Founded 1974
            </div>
            <div class="flex items-center gap-2">
              <span class="h-1.5 w-1.5 rounded-full flex-shrink-0" style="background-color: #1a1d56;"></span>
              Headquarters: Arusha, Tanzania
            </div>
          </div>
        </div>
        <a
          href="https://canecsa.org"
          target="_blank"
          class="mt-6 inline-block text-center text-sm font-semibold px-5 py-2.5 rounded-full text-white transition hover:opacity-90"
          style="background-color: #1a1d56;"
        >
          Visit CANECSA Website →
        </a>
      </div>

    </section>

    <!-- ─── Contact Form ─────────────────────────────────────────────────────── -->
    <section class="max-w-5xl mx-auto px-6 pb-16">
      <div class="bg-white rounded-2xl shadow-md p-8">
        <div class="max-w-2xl mx-auto">
          <h2 class="text-2xl font-bold text-gray-800 mb-1">Send Us a Message</h2>
          <p class="text-gray-500 text-sm mb-6">Fill in the form below and the Secretariat will get back to you within 2 business days.</p>

          <form @submit.prevent="sendMessage" class="space-y-4">
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input v-model="form.name" type="text" required placeholder="Jane Doe"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1d56]" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input v-model="form.email" type="email" required placeholder="jane@example.org"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1d56]" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Organisation</label>
              <input v-model="form.organisation" type="text" placeholder="Ministry of Health, Kenya"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1d56]" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select v-model="form.subject"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1d56]">
                <option disabled value="">Select a subject</option>
                <option>Event Registration Enquiry</option>
                <option>Sponsorship & Exhibition</option>
                <option>Logistics & Accommodation</option>
                <option>Technical Programme</option>
                <option>General Enquiry</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea v-model="form.message" rows="5" required placeholder="Write your message here..."
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1d56]"></textarea>
            </div>

            <!-- Success / error feedback -->
            <div v-if="sent" class="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Thank you! Your message has been sent. The Secretariat will be in touch shortly.
            </div>

            <button
              type="submit"
              :disabled="sending"
              class="w-full sm:w-auto px-8 py-3 rounded-full font-semibold text-white text-sm transition hover:opacity-90 disabled:opacity-60"
              style="background-color: #1a1d56;"
            >
              {{ sending ? 'Sending…' : 'Send Message' }}
            </button>
          </form>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  name: '',
  email: '',
  organisation: '',
  subject: '',
  message: '',
})

const sending = ref(false)
const sent = ref(false)

const sendMessage = async () => {
  sending.value = true
  // Simulate sending — replace with real API call if a contact endpoint is added
  await new Promise(resolve => setTimeout(resolve, 1200))
  sent.value = true
  sending.value = false
  form.value = { name: '', email: '', organisation: '', subject: '', message: '' }
}
</script>
