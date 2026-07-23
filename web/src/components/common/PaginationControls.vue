<template>
    <div class="flex items-center justify-between mt-4 gap-4 text-sm text-gray-600">
      <div class="flex items-center space-x-2">
        <label for="perPage" class="text-sm">Show</label>
        <select
          id="perPage"
          v-model.number="localPerPage"
          @change="updatePerPage"
          class="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#1a1d56]"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="15">15</option>
        </select>
      </div>
  
      <div class="text-center flex-1 md:flex-none">
        Page {{ currentPage }} of {{ totalPages }}
      </div>
  
      <div class="flex justify-end items-center space-x-2">
        <button
          :disabled="currentPage === 1"
          @click="$emit('update:page', currentPage - 1)"
          class="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          :disabled="currentPage === totalPages"
          @click="$emit('update:page', currentPage + 1)"
          class="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, toRefs } from "vue";
  
  const props = defineProps({
    currentPage: Number,
    perPage: Number,
    totalPages: Number,
  });
  
  const emit = defineEmits(["update:page", "update:perPage"]);
  
  const { perPage } = toRefs(props);
  const localPerPage = ref(perPage.value);
  
  watch(perPage, (val) => (localPerPage.value = val));
  
  function updatePerPage() {
    emit("update:perPage", localPerPage.value);
  }
  </script>
  