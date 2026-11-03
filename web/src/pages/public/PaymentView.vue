<template>
  <div class="bg-gray-50 text-gray-800 font-sans min-h-screen">

    <!-- Header -->
    <section v-if="event" class="bg-bondi-blue text-white py-12 px-6 text-center">
      <div class="max-w-4xl mx-auto space-y-2">
        <h1 class="text-3xl font-bold">Payment for {{ event.event }}</h1>
        <p class="text-lg opacity-90">
          {{ formatDate(event.start_date) }} – {{ formatDate(event.end_date) }} · {{ event.location }}
        </p>
      </div>
    </section>

    <!-- Loading -->
    <section v-if="loading" class="text-center py-16">
      <DataLoadingSpinner />
    </section>

    <!-- Error -->
    <section v-if="error" class="text-center py-10 text-red-600">{{ error }}</section>

    <!-- Main content -->
    <section v-if="!loading && !error && event" class="max-w-2xl mx-auto px-4 py-10 space-y-6">

      <!-- Already verified (returning user flow only) -->
      <div v-if="!isNewRegistration && registration?.paid"
        class="bg-blue-50 border border-blue-300 text-blue-800 px-5 py-4 rounded-2xl text-center space-y-2">
        <p class="font-semibold text-lg">Your payment has already been verified ✅</p>
        <p class="text-sm">You are fully registered for this event.</p>
        <router-link to="/login"
          class="inline-block mt-2 px-6 py-2 rounded-full text-white text-sm font-semibold bg-bondi-blue">
          Log In to Your Account
        </router-link>
      </div>

      <!-- Missing session (new flow but sessionStorage gone) -->
      <div v-else-if="isNewRegistration && !pendingData"
        class="bg-red-50 border border-red-300 text-red-800 px-5 py-4 rounded-2xl text-center space-y-3">
        <p class="font-semibold">Your registration session has expired.</p>
        <p class="text-sm">Please go back and complete the registration form again.</p>
        <router-link :to="`/register/${eventId}`"
          class="inline-block mt-2 px-6 py-2 rounded-full text-white text-sm font-semibold bg-bondi-blue">
          Back to Registration
        </router-link>
      </div>

      <!-- Success after proof submission -->
      <div v-else-if="paymentSubmitted" class="bg-white rounded-2xl shadow-sm p-10 text-center space-y-4">
        <div class="text-6xl">✅</div>
        <h2 class="text-2xl font-bold text-green-700">Proof of Payment Uploaded</h2>
        <p class="text-gray-600 leading-relaxed max-w-md mx-auto">
          Your proof of payment has been uploaded and you have been registered for the event.
          <span v-if="newUserFlow"> Your login credentials have been sent to <strong>{{ pendingData?.email }}</strong>.</span>
          The secretariat will verify your payment and then update your payment status.
        </p>
        <router-link to="/login"
          class="inline-block mt-2 px-6 py-2 rounded-full text-white font-semibold bg-bondi-blue hover:bg-bondi-blue/90 transition">
          Log In to Your Account
        </router-link>
      </div>

      <!-- Payment flow: new registration (came from RegisterView, needs to pay first) -->
      <template v-else-if="isNewRegistration && pendingData">

        <!-- Countdown / redirect banner -->
        <div class="bg-amber-50 border border-amber-300 rounded-2xl p-6 text-center space-y-3">
          <template v-if="countdown > 0">
            <p class="text-amber-900 font-semibold text-base leading-relaxed">
              In <span class="text-3xl font-bold text-amber-600">{{ countdown }}</span>
              second{{ countdown !== 1 ? 's' : '' }}, the payment page will open in a new tab.
            </p>
            <p class="text-sm text-amber-700">
              Kindly complete your payment and return to this page to upload your proof of payment.
            </p>
            <div class="w-full bg-amber-200 rounded-full h-2 mt-1">
              <div class="bg-amber-500 h-2 rounded-full transition-all duration-1000"
                :style="{ width: ((15 - countdown) / 15 * 100) + '%' }"></div>
            </div>
            <button @click="openPaymentNow" class="text-sm text-amber-700 underline hover:text-amber-900">
              Open payment page now →
            </button>
          </template>
          <template v-else>
            <p class="text-amber-900 font-semibold">Payment page opened in a new tab.</p>
            <p class="text-sm text-amber-700">Complete your payment there, then come back and fill in your proof details below.</p>
            <a :href="paymentBase" target="_blank" rel="noopener"
              class="text-sm text-amber-700 underline hover:text-amber-900">
              Didn't open? Click here to open it again
            </a>
          </template>
        </div>

        <!-- Proof of payment form (new registration) -->
        <div class="bg-white rounded-2xl shadow-sm p-7 space-y-5">
          <h2 class="text-xl font-bold text-gray-800">Upload Proof of Payment</h2>
          <p class="text-sm text-gray-500">Once you have completed your payment, enter your transaction details below.</p>
          <div v-if="paymentError" class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm">
            {{ paymentError }}
          </div>
          <form @submit.prevent="handlePayment" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Payment Method <span class="text-red-400">*</span></label>
              <select v-model="payment_method" required class="input-style">
                <option disabled value="">Select method</option>
                <option value="Card">Online Payment (Credit/Debit Card)</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Amount Paid (USD) <span class="text-red-400">*</span></label>
              <input v-model="payment_amount" type="number" min="0" step="0.01" required class="input-style" placeholder="0.00" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Proof of Payment <span class="text-red-400">*</span></label>
              <input type="file" accept="image/*,.pdf" required @change="proof_file = $event.target.files[0]"
                class="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-bondi-blue/10 file:text-bondi-blue hover:file:bg-bondi-blue/20 cursor-pointer border border-gray-300 rounded-xl px-3 py-2" />
              <p class="text-xs text-gray-400 mt-1">Upload a photo or screenshot of your payment receipt (JPG, PNG or PDF)</p>
            </div>
            <button type="submit" :disabled="isSubmitting"
              class="w-full bg-bondi-blue text-white py-3 rounded-2xl font-semibold hover:bg-bondi-blue/90 transition disabled:opacity-60">
              <span v-if="isSubmitting">Uploading…</span>
              <span v-else>Upload Proof of Payment</span>
            </button>
          </form>
        </div>
      </template>

      <!-- Existing registration (came from reminder link) -->
      <template v-else-if="!isNewRegistration && registration && !registration.paid">

        <!-- Countdown shown only when ?action=pay was in the link -->
        <div v-if="wantsPay" class="bg-amber-50 border border-amber-300 rounded-2xl p-6 text-center space-y-3">
          <template v-if="countdown > 0">
            <p class="text-amber-900 font-semibold text-base leading-relaxed">
              In <span class="text-3xl font-bold text-amber-600">{{ countdown }}</span>
              second{{ countdown !== 1 ? 's' : '' }}, the payment page will open in a new tab.
            </p>
            <p class="text-sm text-amber-700">
              Kindly complete your payment and return to this page to upload your proof of payment.
            </p>
            <div class="w-full bg-amber-200 rounded-full h-2 mt-1">
              <div class="bg-amber-500 h-2 rounded-full transition-all duration-1000"
                :style="{ width: ((15 - countdown) / 15 * 100) + '%' }"></div>
            </div>
            <button @click="openPaymentNow" class="text-sm text-amber-700 underline hover:text-amber-900">
              Open payment page now →
            </button>
          </template>
          <template v-else>
            <p class="text-amber-900 font-semibold">Payment page opened in a new tab.</p>
            <p class="text-sm text-amber-700">Complete your payment there, then come back and fill in your proof details below.</p>
            <a :href="paymentBase" target="_blank" rel="noopener"
              class="text-sm text-amber-700 underline hover:text-amber-900">
              Didn't open? Click here to open it again
            </a>
          </template>
        </div>

        <!-- Plain info banner when coming directly to upload -->
        <div v-else class="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-1">
          <p class="text-blue-900 font-semibold text-base">Upload your proof of payment</p>
          <p class="text-sm text-blue-700">
            You are registered for <strong>{{ event?.event }}</strong>. Fill in your payment details
            and attach your receipt below to complete your registration.
          </p>
        </div>

        <!-- Proof of payment form (reminder flow) -->
        <div class="bg-white rounded-2xl shadow-sm p-7 space-y-5">
          <h2 class="text-xl font-bold text-gray-800">Payment Details &amp; Proof</h2>
          <p class="text-sm text-gray-500">Select your payment method, enter the amount you paid, and upload your receipt.</p>
          <div v-if="paymentError" class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm">
            {{ paymentError }}
          </div>
          <form @submit.prevent="handlePayment" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Payment Method <span class="text-red-400">*</span></label>
              <select v-model="payment_method" required class="input-style">
                <option disabled value="">Select method</option>
                <option value="Card">Online Payment (Credit/Debit Card)</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Amount Paid (USD) <span class="text-red-400">*</span></label>
              <input v-model="payment_amount" type="number" min="0" step="0.01" required class="input-style" placeholder="0.00" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Proof of Payment <span class="text-red-400">*</span></label>
              <input type="file" accept="image/*,.pdf" required @change="proof_file = $event.target.files[0]"
                class="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-bondi-blue/10 file:text-bondi-blue hover:file:bg-bondi-blue/20 cursor-pointer border border-gray-300 rounded-xl px-3 py-2" />
              <p class="text-xs text-gray-400 mt-1">Upload your bank transfer slip or card payment receipt (JPG, PNG or PDF)</p>
            </div>
            <button type="submit" :disabled="isSubmitting"
              class="w-full bg-bondi-blue text-white py-3 rounded-2xl font-semibold hover:bg-bondi-blue/90 transition disabled:opacity-60">
              <span v-if="isSubmitting">Uploading…</span>
              <span v-else>Submit Proof of Payment</span>
            </button>
          </form>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/plugins/axios'
import DataLoadingSpinner from '@/components/common/DataLoadingSpinner.vue'

const route = useRoute()
const eventId = Number(route.params.event_id)
const registrationId = route.params.registration_id ? Number(route.params.registration_id) : null

// New registration = no registration_id in URL (came from RegisterView)
const isNewRegistration = !registrationId

// ?action=pay means the user clicked "Go to Payment Page" in a reminder email
const wantsPay = route.query.action === 'pay'

// Read pending registration data from sessionStorage (set by RegisterView)
const pendingData = isNewRegistration
  ? JSON.parse(sessionStorage.getItem(`pending_reg_${eventId}`) || 'null')
  : null

// True when the user came from the public registration form (no existing account)
const newUserFlow = pendingData?.is_new_user === true

const event = ref(null)
const registration = ref(null)
const loading = ref(true)
const error = ref(null)
const paymentError = ref(null)
const isSubmitting = ref(false)
const paymentSubmitted = ref(false)
const countdown = ref(15)

const payment_method = ref(route.query.method === 'card' ? 'Card' : '')
const payment_amount = ref('')
const proof_file = ref(null)

const paymentBase = window.location.hostname === 'localhost'
  ? 'http://localhost/payment/'
  : 'https://canecsa.org/payment/'

let countdownTimer = null

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

function openPaymentNow() {
  clearInterval(countdownTimer)
  countdown.value = 0
  window.open(paymentBase, '_blank', 'noopener')
}

function startCountdown() {
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      countdown.value = 0
      window.open(paymentBase, '_blank', 'noopener')
    }
  }, 1000)
}

const loadData = async () => {
  loading.value = true
  try {
    if (isNewRegistration) {
      // Only load event data — no registration exists yet
      const eventRes = await api.get(`/events/${eventId}`)
      event.value = eventRes.data.event
      if (pendingData) startCountdown()
    } else {
      // Load both event and existing registration
      const [eventRes, regRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/events/registration/${registrationId}`)
      ])
      event.value = eventRes.data.event
      registration.value = regRes.data.registration
      // Only start countdown if user clicked "Go to Payment Page" in the reminder email
      if (!registration.value.paid && wantsPay) startCountdown()
    }
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.detail || 'Failed to load data'
  } finally {
    loading.value = false
  }
}

const handlePayment = async () => {
  paymentError.value = null
  if (!proof_file.value) {
    paymentError.value = 'Please attach a photo or screenshot of your payment receipt before submitting.'
    return
  }
  isSubmitting.value = true
  try {
    const fd = new FormData()
    fd.append('payment_method', payment_method.value)
    fd.append('payment_amount', Number(payment_amount.value))
    fd.append('proof_file', proof_file.value)

    if (isNewRegistration) {
      // Create registration + payment together
      fd.append('event_id', eventId)
      fd.append('participation_role', pendingData.participation_role)
      if (newUserFlow) {
        // New user — pass all registration fields; backend creates the account
        fd.append('new_firstname', pendingData.firstname)
        fd.append('new_lastname', pendingData.lastname)
        fd.append('new_email', pendingData.email)
        if (pendingData.phone) fd.append('new_phone', pendingData.phone)
        if (pendingData.title) fd.append('new_title', pendingData.title)
        if (pendingData.middle_name) fd.append('new_middle_name', pendingData.middle_name)
        if (pendingData.country_id) fd.append('new_country_id', pendingData.country_id)
        if (pendingData.profession) fd.append('new_profession', pendingData.profession)
        if (pendingData.gender) fd.append('new_gender', pendingData.gender)
        if (pendingData.organisation) fd.append('new_organisation', pendingData.organisation)
        if (pendingData.position) fd.append('new_position', pendingData.position)
      } else if (pendingData.user_id) {
        // Existing user (via admin modal or old sessionStorage format)
        fd.append('user_id', pendingData.user_id)
      } else {
        paymentError.value = 'Session data is missing. Please go back and register again.'
        isSubmitting.value = false
        return
      }
      await api.post('/events/register-with-payment/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      sessionStorage.removeItem(`pending_reg_${eventId}`)
    } else {
      // Existing registration — just submit payment proof
      fd.append('registration_id', registrationId)
      fd.append('event_id', eventId)
      await api.post('/events/payment/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    paymentSubmitted.value = true
  } catch (err) {
    console.error(err)
    paymentError.value = err.response?.data?.detail || 'Failed to submit. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(loadData)
onUnmounted(() => clearInterval(countdownTimer))
</script>

<style scoped>
.input-style {
  @apply w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-bondi-blue focus:border-transparent;
}
.text-bondi-blue { color: #0095b6; }
.bg-bondi-blue { background-color: #0095b6; }
</style>
