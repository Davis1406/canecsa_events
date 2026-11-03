<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import api from '@/plugins/axios'

const props = defineProps({
  modelValue: { type: [Number, String], default: null },
  error: { type: Boolean, default: false },
  placeholder: { type: String, default: 'Search and select country...' },
})

const emit = defineEmits(['update:modelValue'])

const countries = ref([])
const search = ref('')
const open = ref(false)
const container = ref(null)

const LABELS = {
  ecsa_member: 'CANECSA Member States',
  african: 'Other African Countries',
  non_african: 'Non-African Countries',
}

const ORDER = ['ecsa_member', 'african', 'non_african']

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return countries.value.filter(c =>
    c.country.toLowerCase().includes(q) ||
    c.short_code.toLowerCase().includes(q)
  )
})

const grouped = computed(() => {
  const map = {}
  for (const c of filtered.value) {
    if (!map[c.category]) map[c.category] = []
    map[c.category].push(c)
  }
  return ORDER.filter(k => map[k]).map(k => ({ key: k, label: LABELS[k], items: map[k] }))
})

const selected = computed(() =>
  countries.value.find(c => c.id === props.modelValue) || null
)

function select(country) {
  emit('update:modelValue', country.id)
  search.value = ''
  open.value = false
}

function clear() {
  emit('update:modelValue', null)
  search.value = ''
}

function handleClickOutside(e) {
  if (container.value && !container.value.contains(e.target)) {
    open.value = false
    search.value = ''
  }
}

onMounted(async () => {
  document.addEventListener('mousedown', handleClickOutside)
  try {
    const res = await api.get('/countries', { params: { limit: 300 } })
    countries.value = res.data.data
  } catch (e) {
    console.error('Failed to load countries', e)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<template>
  <div ref="container" class="relative">
    <!-- Trigger button -->
    <button
      type="button"
      @click="open = !open"
      class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-sm text-left transition"
      :class="[
        error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white',
        'focus:outline-none focus:ring-2 focus:ring-blue-500'
      ]"
    >
      <span v-if="selected" class="flex items-center gap-2 text-gray-800">
        <span class="text-xs px-1.5 py-0.5 rounded font-medium"
          :class="{
            'bg-blue-100 text-blue-700': selected.category === 'ecsa_member',
            'bg-green-100 text-green-700': selected.category === 'african',
            'bg-gray-100 text-gray-600': selected.category === 'non_african',
          }">
          {{ selected.short_code }}
        </span>
        {{ selected.country }}
      </span>
      <span v-else class="text-gray-400">{{ placeholder }}</span>
      <svg class="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform" :class="{ 'rotate-180': open }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
    </button>

    <!-- Dropdown -->
    <div
      v-if="open"
      class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
    >
      <!-- Search input -->
      <div class="p-2 border-b border-gray-100">
        <div class="relative">
          <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
          </svg>
          <input
            v-model="search"
            type="text"
            placeholder="Search country..."
            class="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @click.stop
            autofocus
          />
        </div>
      </div>

      <!-- Grouped list -->
      <div class="max-h-64 overflow-y-auto">
        <div v-if="grouped.length === 0" class="px-4 py-6 text-center text-sm text-gray-400">
          No countries found
        </div>

        <template v-for="group in grouped" :key="group.key">
          <!-- Group header -->
          <div class="sticky top-0 px-3 py-1.5 text-xs font-bold uppercase tracking-wide flex items-center gap-2 z-10"
            :class="{
              'bg-blue-50 text-blue-700': group.key === 'ecsa_member',
              'bg-green-50 text-green-700': group.key === 'african',
              'bg-gray-50 text-gray-500': group.key === 'non_african',
            }">
            <span v-if="group.key === 'ecsa_member'">🌍</span>
            <span v-else-if="group.key === 'african'">🌐</span>
            <span v-else>🌎</span>
            {{ group.label }}
            <span class="ml-auto font-normal normal-case opacity-60">{{ group.items.length }}</span>
          </div>

          <!-- Countries -->
          <button
            v-for="c in group.items"
            :key="c.id"
            type="button"
            @click="select(c)"
            class="w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-gray-50 transition"
            :class="{ 'bg-blue-50': c.id === modelValue }"
          >
            <span class="text-xs w-8 text-center px-1 py-0.5 rounded font-mono font-medium shrink-0"
              :class="{
                'bg-blue-100 text-blue-700': c.category === 'ecsa_member',
                'bg-green-100 text-green-700': c.category === 'african',
                'bg-gray-100 text-gray-500': c.category === 'non_african',
              }">
              {{ c.short_code }}
            </span>
            <span class="text-gray-800">{{ c.country }}</span>
            <svg v-if="c.id === modelValue" class="ml-auto w-4 h-4 text-blue-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          </button>
        </template>
      </div>

      <!-- Clear -->
      <div v-if="modelValue" class="border-t border-gray-100 p-1.5">
        <button type="button" @click="clear"
          class="w-full text-xs text-center text-red-400 hover:text-red-600 py-1 transition">
          Clear selection
        </button>
      </div>
    </div>
  </div>
</template>
