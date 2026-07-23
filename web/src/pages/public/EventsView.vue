<template>
  <div class="p-4 max-w-7xl mx-auto">
    <!-- Page Title -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Discover Upcoming Events</h1>
      <p class="text-sm text-gray-600 mt-1">
        Join impactful events from CANECSA and its diverse ecosystem of colleges, clusters, projects, and programmes
      </p>
    </div>

    <!-- Filters (show only if more than one event) -->
    <div
      v-if="filteredEvents.length > 1"
      class="bg-white sm:rounded-2xl rounded-xl shadow-md p-4 mb-6 flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0"
    >
      <div class="flex-1">
        <div class="relative">
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search events..."
            class="w-full border border-gray-300 rounded-xl p-3 py-2 pl-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-bondi-blue focus:border-transparent transition"
          />
          <svg class="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
        </div>
      </div>
      <div class="flex-1">
        <input
          v-model="filters.title"
          type="text"
          placeholder="Event title..."
          class="w-full border border-gray-300 rounded-xl p-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-bondi-blue focus:border-transparent transition"
        />
      </div>
      <div class="flex-1">
        <input
          v-model="filters.organizer"
          type="text"
          placeholder="Organizer name..."
          class="w-full border border-gray-300 rounded-xl p-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-bondi-blue focus:border-transparent transition"
        />
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="isLoading" class="text-center my-10">
      <DataLoadingSpinner />
    </div>

    <!-- No Events Found -->
    <div v-else-if="filteredEvents.length === 0" class="text-center text-gray-500 my-10">
      No events found.
    </div>

    <!-- Events List -->
    <div v-else class="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <router-link
        v-for="event in paginatedEvents"
        :key="event.id"
        :to="{ name: 'Event', params: { id: event.id } }"
        class="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-md p-6 hover:shadow-xl hover:scale-[1.02] transition-transform cursor-pointer flex flex-col"
      >
        <h3 class="text-xl font-extrabold text-bondi-blue mb-2 truncate" :title="event.event">{{ event.event }}</h3>

        <p class="flex items-center text-gray-600 text-sm mb-1">
          <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path d="M3 7v4a4 4 0 004 4h8a4 4 0 004-4V7" />
            <path d="M7 10l5 5 5-5" />
          </svg>
          Organized by: <span class="ml-1 font-medium">{{ event.org_unit.name }}</span>
        </p>

        <p class="flex items-center text-gray-600 text-sm mb-1">
          <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <strong>Date:</strong> <span class="ml-1">{{ formatDate(event.start_date) }}</span>
        </p>

        <p class="flex items-center text-gray-600 text-sm mb-2">
          <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path d="M12 21l-8-9 8-9 8 9-8 9z" />
          </svg>
          <strong>Location:</strong> <span class="ml-1">{{ event.location }}</span>
        </p>

        <p
          class="text-gray-700 text-sm mt-auto line-clamp-3"
          :title="event.theme"
        >
          {{ event.theme || 'No theme provided' }}
        </p>
      </router-link>
    </div>

    <!-- Pagination (only if more than one event) -->
    <div
      v-if="filteredEvents.length > 1"
      class="mt-8 flex justify-center items-center space-x-2"
    >
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="px-4 py-2 border rounded-xl text-sm hover:bg-gray-100 disabled:opacity-50"
      >
        Previous
      </button>
      <span class="text-sm">Page {{ currentPage }}</span>
      <button
        @click="nextPage"
        :disabled="(filteredEvents?.length || 0) <= endIndex"
        class="px-4 py-2 border rounded-xl text-sm hover:bg-gray-100 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/plugins/axios';
import DataLoadingSpinner from '@/components/common/DataLoadingSpinner.vue';
import { debounce } from 'lodash';

export default {
  name: 'EventsView',
  components: { DataLoadingSpinner },
  setup() {
    const events = ref([]);
    const isLoading = ref(false);
    const currentPage = ref(1);
    const perPage = ref(6);
    const filters = ref({
      search: '',
      title: '',
      organizer: '',
    });

    const fetchEvents = async () => {
      isLoading.value = true;
      try {
        const response = await api.get('/events/', {
          params: {
            skip: (currentPage.value - 1) * perPage.value,
            limit: perPage.value,
          },
        });
        events.value = response.data.data || [];
      } catch (error) {
        console.error('Error fetching events:', error.response?.data || error.message);
      } finally {
        isLoading.value = false;
      }
    };

    const filteredEvents = computed(() => {
      return events.value.filter((event) => {
        const searchText = filters.value.search.toLowerCase();
        const titleText = filters.value.title.toLowerCase();
        const organizerText = filters.value.organizer.toLowerCase();

        const matchesSearch =
          searchText === '' ||
          event.event.toLowerCase().includes(searchText) ||
          event.description.toLowerCase().includes(searchText) ||
          event.location.toLowerCase().includes(searchText);

        const matchesTitle =
          titleText === '' || event.event.toLowerCase().includes(titleText);

        const matchesOrganizer =
          organizerText === '' || ('' + event.org_unit_id).includes(organizerText);

        return matchesSearch && matchesTitle && matchesOrganizer;
      });
    });

    const paginatedEvents = computed(() => {
      const start = (currentPage.value - 1) * perPage.value;
      return filteredEvents.value.slice(start, start + perPage.value);
    });

    const endIndex = computed(() => currentPage.value * perPage.value);

    const nextPage = () => {
      if (endIndex.value < filteredEvents.value.length) {
        currentPage.value++;
      }
    };

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    const formatDate = (dateStr) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString(undefined, options);
    };

    onMounted(() => {
      fetchEvents();
    });

    watch(filters, debounce(fetchEvents, 500), { deep: true });

    return {
      events,
      filters,
      isLoading,
      currentPage,
      perPage,
      filteredEvents,
      paginatedEvents,
      endIndex,
      nextPage,
      prevPage,
      formatDate,
    };
  },
};
</script>

<style scoped>
/* Add line-clamp styles if not using Tailwind plugin */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
