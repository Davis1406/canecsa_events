<template>
  <div class="flex flex-1 items-center justify-center bg-gray-100">
    <div class="w-full max-w-xl bg-white rounded-3xl shadow-md p-8 space-y-6">
      <h2 class="text-2xl font-bold text-center text-bondi-blue">Sign In to Your Account</h2>

      <!-- Error Alert -->
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md text-sm text-center">
        {{ error }}
      </div>

      <form @submit.prevent="login" class="space-y-4">
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
          <input
            v-model="email"
            type="email"
            id="email"
            required
            class="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-bondi-blue focus:border-transparent"
          />
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              id="password"
              required
              class="w-full border border-gray-300 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-bondi-blue focus:border-transparent"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              <!-- Eye (show) -->
              <svg v-if="!showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              <!-- Eye-off (hide) -->
              <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 012.42-4.042M9.88 9.88a3 3 0 104.243 4.243M3 3l18 18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Forgot Password -->
        <div class="text-right">
          <router-link :to="{ name: 'PasswordResetLink'}" class="text-sm text-bondi-blue hover:underline">
            Forgot password?
          </router-link>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="w-full bg-bondi-blue text-white py-3 rounded-2xl font-semibold hover:bg-bondi-blue/90 transition"
        >
          Login
        </button>
      </form>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/plugins/axios'

const router = useRouter()
const auth = useAuthStore()

onMounted(() => {
  if (auth.isAuthenticated) {
    const isAdmin = auth.hasPermission('ADMIN_DASHBOARD')
    const isFinanceOfficer = !isAdmin && auth.hasPermission('VERIFY_PAYMENT')
    if (isAdmin) {
      router.replace({ name: 'AdminDashboard' })
    } else if (isFinanceOfficer) {
      router.replace({ name: 'AdminEvents' })
    } else {
      router.replace({ name: 'MyDashboard' })
    }
  }
})

const email = ref('')
const password = ref('')
const error = ref('')
const showPassword = ref(false)

const login = async () => {
  error.value = ''

  const form = new URLSearchParams()
  form.append('grant_type', 'password')
  form.append('username', email.value)
  form.append('password', password.value)
  form.append('client_id', 'string')
  form.append('client_secret', 'string')

  try {
    const { data } = await api.post('/auth/login', form)

    auth.setAuth({
      user: data.user,
      token: data.access_token,
      permissions: data.permissions,
    })

    const isAdmin = data.permissions.some(p => p.permission_code === 'ADMIN_DASHBOARD')
    const isFinanceOfficer = !isAdmin && data.permissions.some(p => p.permission_code === 'VERIFY_PAYMENT')
    if (isAdmin) {
      router.push({ name: 'AdminDashboard' })
    } else if (isFinanceOfficer) {
      router.push({ name: 'AdminEvents' })
    } else {
      router.push({ name: 'MyDashboard' })
    }
  } catch (err) {
    if (err.response?.status === 401) {
      error.value = 'Invalid email or password.'
    } else {
      error.value = 'Something went wrong. Please try again later.'
    }
  }
}
</script>
