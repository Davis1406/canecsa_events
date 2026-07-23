<template>
    <button
      :type="type"
      :disabled="loading || disabled"
      @click="handleClick"
      :class="[
        baseClasses,
        loading ? 'opacity-70 cursor-not-allowed' : '',
        customClass
      ]"
    >
      <span v-if="loading" class="flex items-center justify-center space-x-2">
        <svg
          class="w-5 h-5 animate-spin text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          ></path>
        </svg>
        <span>{{ loadingLabel }}</span>
      </span>
      <span v-else>
        <slot />
      </span>
    </button>
  </template>
  
  <script setup>
  import { defineProps, defineEmits, computed } from 'vue'
  
  const props = defineProps({
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    type: { type: String, default: 'button' },
    loadingLabel: { type: String, default: 'Loading...' },
    customClass: { type: String, default: '' }
  })
  
  const emit = defineEmits(['click'])
  
  const handleClick = (e) => {
    if (!props.loading && !props.disabled) {
      emit('click', e)
    }
  }
  
  const baseClasses = computed(() =>
    'px-6 py-2 rounded-xl transition bg-[#1a1d56] hover:bg-[#007B97] text-white'
  )
  </script>
  