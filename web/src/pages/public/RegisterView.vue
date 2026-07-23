<template>
  <div class="min-h-screen bg-gray-50">

    <!-- ─── Hero Banner ──────────────────────────────────────────────────────── -->
    <section v-if="event" class="relative overflow-hidden text-white" style="background: linear-gradient(135deg, #1a1d56 0%, #171a4d 60%, #131540 100%);">
      <div class="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10" style="background:#f59d08;"></div>
      <div class="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-10" style="background:#f59d08;"></div>
      <div class="relative z-10 max-w-4xl mx-auto px-6 py-12 text-center">
        <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium mb-4">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          Conference Registration
        </div>
        <router-link :to="{ name: 'Event', params: { id: event.id } }"
          class="text-2xl sm:text-3xl font-black drop-shadow-sm hover:underline leading-snug block mb-3"
          v-html="formatOrdinals(event.event)">
        </router-link>
        <div class="flex flex-wrap justify-center gap-4 text-sm text-white/80">
          <span class="flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            {{ formatDate(event.start_date) }} – {{ formatDate(event.end_date) }}
          </span>
          <span class="flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5 8a5 5 0 1110 0c0 3-5 9-5 9S5 11 5 8zm5-2a2 2 0 100 4 2 2 0 000-4z" clip-rule="evenodd"/>
            </svg>
            {{ event.location }}
          </span>
        </div>
      </div>
    </section>

    <!-- Loading / Error -->
    <section v-else class="text-center py-20">
      <DataLoadingSpinner v-if="loading" />
      <p v-else class="text-red-500 font-medium">{{ error }}</p>
    </section>

    <!-- ─── Form ─────────────────────────────────────────────────────────────── -->
    <section v-if="event" class="max-w-4xl mx-auto px-4 py-10">

      <!-- Step indicator -->
      <div class="flex items-center justify-center mb-10">
        <div v-for="(step, i) in steps" :key="i" class="flex items-center">
          <div class="flex flex-col items-center">
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
              :class="currentStep > i ? 'text-white shadow-md' : currentStep === i ? 'text-white shadow-lg' : 'bg-gray-200 text-gray-400'"
              :style="currentStep >= i ? { backgroundColor: '#1a1d56' } : {}"
            >
              <svg v-if="currentStep > i" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
              </svg>
              <span v-else>{{ i + 1 }}</span>
            </div>
            <span class="text-xs mt-1.5 font-medium hidden sm:block"
              :class="currentStep >= i ? 'text-[#1a1d56]' : 'text-gray-400'">
              {{ step }}
            </span>
          </div>
          <div v-if="i < steps.length - 1"
            class="w-16 sm:w-20 h-0.5 mb-5 mx-1 transition-all duration-500"
            :style="{ backgroundColor: currentStep > i ? '#1a1d56' : '#e5e7eb' }">
          </div>
        </div>
      </div>

      <!-- Error alert -->
      <div v-if="registrationError"
        class="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm">
        <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        {{ registrationError }}
      </div>

      <form @submit.prevent>

        <!-- ── Step 0: Personal Details ──────────────────────────────────────── -->
        <transition name="slide-fade" mode="out-in">
        <div v-if="currentStep === 0" key="step0" class="bg-white rounded-2xl shadow-sm p-7 space-y-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="h-9 w-9 rounded-xl flex items-center justify-center" style="background-color:#1a1d56;">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-gray-800">Personal Details</h3>
              <p class="text-xs text-gray-400">Your name and basic information</p>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="field-label">Title <span class="text-red-400">*</span></label>
              <select v-model="title" class="field-input" :class="{ 'border-red-300 bg-red-50': touched.title && !title }" @blur="touched.title = true">
                <option value="" disabled>Select title</option>
                <option>Mr</option><option>Mrs</option><option>Ms</option><option>Dr</option><option>Prof</option>
              </select>
              <p v-if="touched.title && !title" class="field-error">Please select a title</p>
            </div>
            <div>
              <label class="field-label">Gender <span class="text-red-400">*</span></label>
              <select v-model="gender" class="field-input" :class="{ 'border-red-300 bg-red-50': touched.gender && !gender }" @blur="touched.gender = true">
                <option value="" disabled>Select gender</option>
                <option>Male</option><option>Female</option>
              </select>
              <p v-if="touched.gender && !gender" class="field-error">Please select gender</p>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="field-label">First Name <span class="text-red-400">*</span></label>
              <input v-model="firstName" type="text" placeholder="Jane" class="field-input"
                :class="{ 'border-red-300 bg-red-50': touched.firstName && !firstName }"
                @blur="touched.firstName = true" />
              <p v-if="touched.firstName && !firstName" class="field-error">First name is required</p>
            </div>
            <div>
              <label class="field-label">Middle Name</label>
              <input v-model="middleName" type="text" placeholder="Optional" class="field-input" />
            </div>
          </div>

          <div>
            <label class="field-label">Last Name <span class="text-red-400">*</span></label>
            <input v-model="lastName" type="text" placeholder="Doe" class="field-input"
              :class="{ 'border-red-300 bg-red-50': touched.lastName && !lastName }"
              @blur="touched.lastName = true" />
            <p v-if="touched.lastName && !lastName" class="field-error">Last name is required</p>
          </div>

          <div class="flex justify-end pt-2">
            <button type="button" @click="nextStep" class="btn-primary">
              Continue
              <svg class="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
        </transition>

        <!-- ── Step 1: Contact Details ────────────────────────────────────────── -->
        <transition name="slide-fade" mode="out-in">
        <div v-if="currentStep === 1" key="step1" class="bg-white rounded-2xl shadow-sm p-7 space-y-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="h-9 w-9 rounded-xl flex items-center justify-center" style="background-color:#f59d08;">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-gray-800">Contact Details</h3>
              <p class="text-xs text-gray-400">How we'll reach you</p>
            </div>
          </div>

          <div>
            <label class="field-label">Email Address <span class="text-red-400">*</span></label>
            <div class="relative">
              <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <input v-model="email" type="email" placeholder="jane@example.org" class="field-input-icon"
                :class="{ 'border-red-300 bg-red-50': touched.email && !email }"
                @blur="touched.email = true" />
            </div>
            <p v-if="touched.email && !email" class="field-error">Email is required</p>
          </div>

          <div>
            <label class="field-label">Phone Number <span class="text-red-400">*</span></label>
            <div class="relative">
              <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              <input v-model="phone" type="tel" placeholder="+255 700 000 000" class="field-input-icon"
                :class="{ 'border-red-300 bg-red-50': touched.phone && !phone }"
                @blur="touched.phone = true" />
            </div>
            <p v-if="touched.phone && !phone" class="field-error">Phone number is required</p>
          </div>

          <div>
            <label class="field-label">Country <span class="text-red-400">*</span></label>
            <CountrySelect
              v-model="country_id"
              :error="touched.country_id && !country_id"
              @blur="touched.country_id = true"
            />
            <p v-if="touched.country_id && !country_id" class="field-error">Please select your country</p>
          </div>

          <div class="flex justify-between pt-2">
            <button type="button" @click="currentStep--" class="btn-secondary">
              <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              Back
            </button>
            <button type="button" @click="nextStep" class="btn-primary">
              Continue
              <svg class="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
        </transition>

        <!-- ── Step 2: Professional Info ──────────────────────────────────────── -->
        <transition name="slide-fade" mode="out-in">
        <div v-if="currentStep === 2" key="step2" class="bg-white rounded-2xl shadow-sm p-7 space-y-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="h-9 w-9 rounded-xl flex items-center justify-center" style="background-color:#1a1d56;">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-gray-800">Professional Information</h3>
              <p class="text-xs text-gray-400">Your organisation and role</p>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="field-label">Profession <span class="text-red-400">*</span></label>
              <input v-model="profession" type="text" placeholder="e.g. Medical Officer" class="field-input"
                :class="{ 'border-red-300 bg-red-50': touched.profession && !profession }"
                @blur="touched.profession = true" />
              <p v-if="touched.profession && !profession" class="field-error">Profession is required</p>
            </div>
            <div>
              <label class="field-label">Position / Job Title</label>
              <input v-model="position" type="text" placeholder="e.g. Director" class="field-input" />
            </div>
          </div>

          <div>
            <label class="field-label">Organisation <span class="text-red-400">*</span></label>
            <input v-model="organisation" type="text" placeholder="e.g. Ministry of Health, Tanzania" class="field-input"
              :class="{ 'border-red-300 bg-red-50': touched.organisation && !organisation }"
              @blur="touched.organisation = true" />
            <p v-if="touched.organisation && !organisation" class="field-error">Organisation is required</p>
          </div>

          <div>
            <label class="field-label">Participation Category <span class="text-red-400">*</span></label>
            <div class="grid gap-2 sm:grid-cols-2">
              <label v-for="opt in participationOptions" :key="opt.value"
                class="flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all"
                :class="participation_role === opt.value ? 'border-[#1a1d56] bg-blue-50/40' : 'border-gray-200 hover:border-gray-300'">
                <input type="radio" v-model="participation_role" :value="opt.value" class="mt-0.5 accent-[#1a1d56] flex-shrink-0" />
                <p class="text-sm font-medium text-gray-800 leading-snug">{{ opt.label }}</p>
              </label>
            </div>
            <p v-if="touched.participation_role && !participation_role" class="field-error mt-1">Please select a category</p>
          </div>

          <div class="flex justify-between pt-2">
            <button type="button" @click="currentStep--" class="btn-secondary">
              <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              Back
            </button>
            <button type="button" @click="nextStep" class="btn-primary">
              Review
              <svg class="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
        </transition>

        <!-- ── Step 3: Confirm & Submit ──────────────────────────────────────── -->
        <transition name="slide-fade" mode="out-in">
        <div v-if="currentStep === 3 && !registrationDone" key="step3" class="space-y-5">
          <div class="bg-white rounded-2xl shadow-sm p-7">
            <div class="flex items-center gap-3 mb-5">
              <div class="h-9 w-9 rounded-xl flex items-center justify-center" style="background-color:#f59d08;">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-gray-800">Review Your Details</h3>
                <p class="text-xs text-gray-400">Confirm before submitting</p>
              </div>
            </div>

            <div class="space-y-4">
              <div class="rounded-xl bg-gray-50 p-4 text-sm">
                <div class="flex items-center justify-between mb-2">
                  <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Personal</p>
                  <button type="button" @click="currentStep = 0" class="text-xs text-[#1a1d56] hover:underline">Edit</button>
                </div>
                <div class="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <span class="text-gray-500">Name</span>
                  <span class="font-medium text-gray-800">{{ title }} {{ firstName }} {{ middleName }} {{ lastName }}</span>
                  <span class="text-gray-500">Gender</span>
                  <span class="font-medium text-gray-800">{{ gender }}</span>
                </div>
              </div>
              <div class="rounded-xl bg-gray-50 p-4 text-sm">
                <div class="flex items-center justify-between mb-2">
                  <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Contact</p>
                  <button type="button" @click="currentStep = 1" class="text-xs text-[#1a1d56] hover:underline">Edit</button>
                </div>
                <div class="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <span class="text-gray-500">Email</span>
                  <span class="font-medium text-gray-800 break-all">{{ email }}</span>
                  <span class="text-gray-500">Phone</span>
                  <span class="font-medium text-gray-800">{{ phone }}</span>
                  <span class="text-gray-500">Country</span>
                  <span class="font-medium text-gray-800">{{ countryName }}</span>
                </div>
              </div>
              <div class="rounded-xl bg-gray-50 p-4 text-sm">
                <div class="flex items-center justify-between mb-2">
                  <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Professional</p>
                  <button type="button" @click="currentStep = 2" class="text-xs text-[#1a1d56] hover:underline">Edit</button>
                </div>
                <div class="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <span class="text-gray-500">Profession</span>
                  <span class="font-medium text-gray-800">{{ profession }}</span>
                  <span class="text-gray-500">Position</span>
                  <span class="font-medium text-gray-800">{{ position || '—' }}</span>
                  <span class="text-gray-500">Organisation</span>
                  <span class="font-medium text-gray-800">{{ organisation }}</span>
                  <span class="text-gray-500">Category</span>
                  <span class="font-medium text-gray-800">{{ participationLabel }}</span>
                </div>
              </div>
            </div>

            <!-- Payment notice -->
            <div class="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p class="font-semibold mb-1">Payment required to secure your slot</p>
              <p class="text-xs leading-relaxed">
                Registration must be completed with payment. You will be redirected to the
                payment portal immediately after registering.
                Access to event materials and sessions is available to paid participants only.
              </p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row justify-between gap-3">
            <button type="button" @click="currentStep--" class="btn-secondary">
              <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              Back
            </button>
            <div class="flex flex-col sm:flex-row gap-3">
              <!-- Pay now (only option) -->
              <button type="button" :disabled="isSubmitting" @click="handleRegister(true)"
                class="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-white text-sm shadow-lg transition hover:opacity-90 disabled:opacity-60"
                style="background-color:#1a1d56;">
                <svg v-if="isSubmitting && payNow" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
                {{ isSubmitting && payNow ? 'Registering…' : 'Register & Make Payment' }}
              </button>
            </div>
          </div>
        </div>
        </transition>

        <!-- ── Success screen ────────────────────────────────────────────────── -->
        <transition name="slide-fade" mode="out-in">
        <div v-if="registrationDone" key="success" class="bg-white rounded-2xl shadow-sm p-10 text-center space-y-5">
          <div class="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mx-auto">
            <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-800">Registration Successful!</h2>
          <p class="text-gray-500 text-sm max-w-md mx-auto">
            Your registration has been received. Login credentials have been sent to
            <strong class="text-gray-700">{{ email }}</strong>.
          </p>

          <!-- Temporary credentials notice -->
          <div class="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 text-left max-w-md mx-auto">
            <p class="font-semibold mb-1 flex items-center gap-2">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Temporary Credentials
            </p>
            <p class="text-xs leading-relaxed">
              The password in your email is <strong>temporary</strong>. You will be prompted to set your
              own password the first time you log in.
            </p>
          </div>

          <!-- Payment popup notice -->
          <div class="rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-800 text-left max-w-md mx-auto">
            <p class="font-semibold mb-2 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
              Payment window opened
            </p>
            <p class="text-xs leading-relaxed">
              Complete your payment in the popup window. Once done, you will be automatically
              brought back here to confirm your details.<br/><br/>
              If the popup was blocked,
              <a :href="paymentUrl" target="_blank" rel="noopener"
                class="font-semibold underline" style="color:#1a1d56;">click here to open it</a>.
            </p>
          </div>

          <!-- Also update profile notice -->
          <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 text-left max-w-md mx-auto">
            <p class="font-semibold mb-1">📋 Complete Your Profile</p>
            <p class="text-xs leading-relaxed">
              After logging in, please update your profile details and upload any required
              verification documents on the portal to finalise your registration.
            </p>
          </div>

          <router-link to="/login"
            class="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-white text-sm shadow-lg transition hover:opacity-90 mt-2"
            style="background-color:#1a1d56;">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
            Go to Login
          </router-link>
        </div>
        </transition>

      </form>

      <!-- Login link -->
      <p class="text-center text-sm text-gray-500 mt-8">
        Already have an account?
        <router-link to="/login" class="font-semibold hover:underline" style="color:#1a1d56;">Sign in</router-link>
      </p>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/plugins/axios'
import DataLoadingSpinner from '@/components/common/DataLoadingSpinner.vue'
import CountrySelect from '@/components/common/CountrySelect.vue'

const route = useRoute()
const router = useRouter()
const eventId = route.params.id

const currentStep = ref(0)
const steps = ['Personal', 'Contact', 'Professional', 'Confirm']
const registrationError = ref(null)
const isSubmitting = ref(false)
const registrationDone = ref(false)
const payNow = ref(false)
const paymentUrl = ref('https://ecsahc.org/payment/')
const loading = ref(true)
const error = ref(null)

const touched = ref({
  title: false, firstName: false, lastName: false, gender: false,
  email: false, phone: false, country_id: false,
  profession: false, organisation: false, participation_role: false,
})

const event = ref(null)

const user_id = ref('')
const title = ref('')
const firstName = ref('')
const middleName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const organisation = ref('')
const position = ref('')
const profession = ref('')
const gender = ref('')
const country_id = ref('')
const participation_role = ref('')

const participationOptions = [
  { value: 'secretariat', label: 'ECSA-HC Secretariat' },
  { value: 'moh', label: 'Country Delegate (Ministry of Health)' },
  { value: 'member_state', label: 'ECSA Member State Participant' },
  { value: 'other_africa', label: 'Other African Countries' },
  { value: 'world', label: 'Rest of the World' },
  { value: 'student', label: 'Student' },
  { value: 'exibitor', label: 'Sponsor / Exhibitor' },
]

const countries = ref([])

const countryName = computed(() => {
  const c = countries.value.find(c => c.id === country_id.value)
  return c ? c.country : '—'
})

const participationLabel = computed(() => {
  const opt = participationOptions.find(o => o.value === participation_role.value)
  return opt ? opt.label : '—'
})

const stepValid = computed(() => [
  !!(title.value && firstName.value && lastName.value && gender.value),
  !!(email.value && phone.value && country_id.value),
  !!(profession.value && organisation.value && participation_role.value),
  true,
])

const nextStep = () => {
  if (currentStep.value === 0) {
    touched.value.title = touched.value.firstName = touched.value.lastName = touched.value.gender = true
  } else if (currentStep.value === 1) {
    touched.value.email = touched.value.phone = touched.value.country_id = true
  } else if (currentStep.value === 2) {
    touched.value.profession = touched.value.organisation = touched.value.participation_role = true
  }
  if (stepValid.value[currentStep.value]) currentStep.value++
}

const formatOrdinals = (text) => {
  if (!text) return ''
  const normalized = text
    .replace(/ᵗʰ/g, 'th').replace(/ˢᵗ/g, 'st')
    .replace(/ⁿᵈ/g, 'nd').replace(/ʳᵈ/g, 'rd')
  return normalized.replace(/(\d+)(st|nd|rd|th)\b/gi, (_, num, suffix) =>
    `${num}<sup style="font-size:0.55em;vertical-align:super;">${suffix}</sup>`
  )
}

const loadEventData = async () => {
  try {
    const res = await api.get(`/events/${eventId}`)
    event.value = res.data.event
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to load event'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

const handleRegister = (proceedToPayment) => {
  payNow.value = proceedToPayment
  registrationError.value = null

  // Store all user data — account is created only after proof of payment is uploaded
  sessionStorage.setItem(`pending_reg_${eventId}`, JSON.stringify({
    is_new_user: true,
    firstname: firstName.value,
    lastname: lastName.value,
    email: email.value,
    phone: phone.value,
    event_name: event.value?.event || null,
    abstract_id: route.query.abstract_id ? parseInt(route.query.abstract_id) : null,
    title: title.value,
    middle_name: middleName.value,
    country_id: country_id.value,
    profession: profession.value,
    gender: gender.value,
    organisation: organisation.value,
    position: position.value,
    participation_role: participation_role.value,
  }))
  router.push(`/payment/${eventId}`)
}

onMounted(async () => {
  loadEventData()
  try {
    const res = await api.get('/countries', { params: { limit: 300 } })
    countries.value = res.data.data
  } catch {}

  // Pre-fill from abstract submission redirect
  if (route.query.firstname) firstName.value = route.query.firstname
  if (route.query.lastname) lastName.value = route.query.lastname
  if (route.query.email) email.value = route.query.email
})
</script>

<style scoped>
.field-label {
  @apply block text-sm font-medium text-gray-700 mb-1.5;
}
.field-input {
  @apply w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white transition focus:outline-none focus:ring-2 focus:ring-[#1a1d56] focus:border-transparent;
}
.field-input-icon {
  @apply w-full border border-gray-200 rounded-xl py-2.5 text-sm bg-white transition focus:outline-none focus:ring-2 focus:ring-[#1a1d56] focus:border-transparent;
  padding-left: 2.75rem;
  padding-right: 1rem;
}
.field-error {
  @apply text-xs text-red-500 mt-1;
}
.btn-primary {
  @apply flex items-center px-6 py-2.5 rounded-full font-semibold text-white text-sm shadow transition hover:opacity-90;
  background-color: #1a1d56;
}
.btn-secondary {
  @apply flex items-center px-6 py-2.5 rounded-full font-semibold text-sm border-2 border-gray-200 text-gray-600 transition hover:border-gray-300 hover:bg-gray-50;
}
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
