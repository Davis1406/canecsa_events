<template>
  <div class="flex-1 flex flex-col w-full max-w-7xl mx-auto p-6 space-y-6 overflow-x-hidden">

    <!-- Page header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-semibold text-black">Abstract Submissions</h1>
        <p v-if="!loading" class="text-sm text-gray-400 mt-0.5">
          {{ total }} {{ total === 1 ? 'abstract' : 'abstracts' }}
          <span v-if="filterEvent || filterStatus || filterTracks.length || filterType || search"> (filtered)</span>
        </p>
      </div>
      <div class="flex items-center gap-2">
        <!-- Abstract Reports -->
        <button @click="openReports"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition hover:opacity-90"
          style="background-color:#fff; color:#1B3F6E; border:1.5px solid #1B3F6E;">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          Reports
        </button>

        <!-- Templates -->
        <button @click="openTemplates"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition hover:opacity-90"
          style="background-color:#fff; color:#065f46; border:1.5px solid #6ee7b7;">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Templates
        </button>

        <!-- All Presentations -->
        <button @click="openPresentations"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition hover:opacity-90"
          style="background-color:#fff; color:#1a1d56; border:1.5px solid #b3e4f0;">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 6a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm4 14h8"/>
          </svg>
          All Presentations
        </button>

        <!-- Notifications dropdown -->
        <div class="relative" ref="notifDropdownRef">
          <button type="button" @click="notifDropdownOpen = !notifDropdownOpen"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition hover:opacity-90"
            style="background-color:#f5f3ff; color:#5b21b6; border:1.5px solid #c4b5fd;">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            Notifications
            <svg class="w-4 h-4 flex-shrink-0 transition-transform" :class="notifDropdownOpen ? 'rotate-180' : ''"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <div v-if="notifDropdownOpen"
            class="absolute left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-30 py-1.5 overflow-hidden">
            <button @click="notifDropdownOpen = false; notifyModal.singleAbstract = null; notifyModal.done = false; notifyModal.error = ''; notifyModal.open = true"
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition">
              <div class="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style="background-color:#d1fae5;">
                <svg class="w-4 h-4" style="color:#065f46;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <span class="font-medium text-gray-700">Notify Accepted Authors</span>
            </button>
            <button @click="notifDropdownOpen = false; openRegReminder()"
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition">
              <div class="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style="background-color:#fffbeb;">
                <svg class="w-4 h-4" style="color:#92400e;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
              </div>
              <span class="font-medium text-gray-700">Registration Reminder</span>
            </button>
            <button @click="notifDropdownOpen = false; openRejectNotify()"
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition">
              <div class="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style="background-color:#fef2f2;">
                <svg class="w-4 h-4" style="color:#b91c1c;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
              <span class="font-medium text-gray-700">Notify Rejected Authors</span>
            </button>
          </div>
        </div>

        <!-- PDF Book of Abstracts -->
        <button @click="exportPdf" :disabled="exportingPdf || loading || total === 0"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
          style="background-color:#fff; color:#1a1d56; border:1.5px solid #1a1d56;">
          <svg v-if="!exportingPdf" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
          </svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          {{ exportingPdf ? 'Generating…' : 'Book of Abstracts PDF' }}
        </button>

        <!-- Excel export -->
        <button @click="exportExcel" :disabled="exporting || loading || total === 0"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          style="background-color:#1a1d56;">
          <svg v-if="!exporting" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          {{ exporting ? 'Exporting…' : `Export${total > 0 ? ' ' + total : ''} to Excel` }}
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow p-4 flex flex-wrap gap-3">
      <input v-model="search" type="text" placeholder="Search by title or author name / email…"
        class="input flex-1 min-w-[180px]" />
      <select v-model="filterEvent" class="input w-44">
        <option value="">All Events</option>
        <option v-for="e in events" :key="e.id" :value="e.id">{{ e.event }}</option>
      </select>
      <select v-model="filterStatus" class="input w-40">
        <option value="">All Statuses</option>
        <option value="submitted">Submitted</option>
        <option value="under_review">Under Review</option>
        <option value="accepted">Accepted</option>
        <option value="rejected">Rejected</option>
        <option value="revision_required">Revision Required</option>
      </select>
      <!-- Multi-track picker -->
      <div class="relative" ref="trackPickerRef">
        <button type="button" @click="trackPickerOpen = !trackPickerOpen"
          class="input w-52 flex items-center justify-between gap-2 text-left"
          :class="filterTracks.length ? 'border-[#1a1d56] bg-[#e6f7fb] text-[#006f87]' : 'text-gray-500'">
          <span class="truncate text-sm">
            {{ filterTracks.length === 0 ? 'All Sub-Themes'
               : filterTracks.length === 1 ? tracks.find(t => t.id === filterTracks[0])?.code || '1 sub-theme'
               : `${filterTracks.length} sub-themes` }}
          </span>
          <svg class="w-4 h-4 flex-shrink-0 transition-transform" :class="trackPickerOpen ? 'rotate-180' : ''"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        <div v-if="trackPickerOpen"
          class="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg w-64 max-h-72 overflow-y-auto">
          <div class="flex items-center justify-between px-3 py-2 border-b border-gray-100">
            <span class="text-xs font-semibold text-gray-500 uppercase">Sub-Themes</span>
            <button v-if="filterTracks.length" @click="filterTracks = []"
              class="text-xs text-red-400 hover:text-red-600 font-medium">Clear</button>
          </div>
          <label v-for="t in tracks" :key="t.id"
            class="flex items-center gap-2.5 px-3 py-2 hover:bg-[#e6f7fb] cursor-pointer text-sm"
            :class="filterTracks.includes(t.id) ? 'bg-[#e6f7fb]' : ''">
            <input type="checkbox" :value="t.id" v-model="filterTracks"
              class="w-4 h-4 rounded" style="accent-color:#1a1d56;" />
            <span class="font-medium" style="color:#006f87;">{{ t.code }}</span>
            <span class="text-gray-400 text-xs truncate flex-1">{{ t.title }}</span>
          </label>
        </div>
      </div>
      <select v-model="filterType" class="input w-40">
        <option value="">All Types</option>
        <option value="oral">Oral</option>
        <option value="poster">Poster</option>
      </select>
    </div>

    <!-- Active track filter badges -->
    <div v-if="filterTracks.length" class="flex items-center gap-2 flex-wrap">
      <span v-for="tid in filterTracks" :key="tid"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm border font-medium"
        style="background-color:#e6f7fb; border-color:#b3e4f0; color:#006f87;">
        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z"/>
        </svg>
        {{ tracks.find(t => t.id === tid)?.code || tid }}
        <button @click="filterTracks = filterTracks.filter(id => id !== tid)"
          class="text-gray-400 hover:text-red-500 transition leading-none">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </span>
      <button v-if="filterTracks.length > 1" @click="filterTracks = []"
        class="text-xs text-red-400 hover:text-red-600 font-medium underline">Clear all</button>
    </div>

    <!-- ── Floating bulk-action bar (appears when rows selected) ──────────── -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2">
      <div v-if="selectedIds.size > 0"
        class="sticky top-4 z-30 mx-auto w-full text-white rounded-2xl shadow-xl px-5 py-3 flex items-center gap-4 flex-wrap"
        style="background-color:#006f87;">
        <div class="flex items-center gap-2 flex-1">
          <input type="checkbox" class="w-4 h-4 accent-white cursor-pointer"
            :checked="selectedIds.size === paginated.length"
            :indeterminate="selectedIds.size > 0 && selectedIds.size < paginated.length"
            @change="toggleSelectAll" />
          <span class="font-semibold text-sm">
            {{ selectedIds.size }} abstract{{ selectedIds.size !== 1 ? 's' : '' }} selected
          </span>
          <button @click="selectedItems = new Map()"
            class="text-white/60 hover:text-white text-xs underline ml-1">Clear</button>
        </div>
        <button @click="openBulkModal"
          class="inline-flex items-center gap-2 px-4 py-2 bg-white font-semibold text-sm rounded-xl hover:bg-gray-50 transition flex-shrink-0"
          style="color:#1a1d56;">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
          </svg>
          Assign Reviewers to Selected
        </button>
        <button @click="openBulkStatusModal"
          class="inline-flex items-center gap-2 px-4 py-2 bg-white font-semibold text-sm rounded-xl hover:bg-gray-50 transition flex-shrink-0"
          style="color:#1a1d56;">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Change Status of Selected
        </button>
      </div>
    </transition>

    <!-- ── Bulk Status Change Modal ─────────────────────────────────────────── -->
    <div v-if="bulkStatusModal.open"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="bulkStatusModal.open = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div class="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
          <p class="font-bold text-gray-800 text-sm">Change Status of Selected Abstracts</p>
          <button @click="bulkStatusModal.open = false" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="p-5 overflow-y-auto flex-1 space-y-4">
          <div v-if="!bulkStatusModal.done">
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
              New status for {{ selectedIds.size }} abstract{{ selectedIds.size !== 1 ? 's' : '' }}
            </label>
            <select v-model="bulkStatusModal.status" class="input w-full" :disabled="bulkStatusModal.updating">
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="revision_required">Revision Required</option>
            </select>
          </div>

          <div v-if="bulkStatusModal.updating" class="space-y-2">
            <div class="flex justify-between text-xs text-gray-500">
              <span>Updating… {{ bulkStatusModal.progress }} / {{ bulkStatusModal.total }}</span>
              <span>{{ Math.round(bulkStatusModal.progress / bulkStatusModal.total * 100) }}%</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div class="h-2 rounded-full transition-all" style="background-color:#1a1d56;"
                :style="{ width: `${Math.round(bulkStatusModal.progress / bulkStatusModal.total * 100)}%` }"></div>
            </div>
          </div>

          <div v-if="bulkStatusModal.done" class="text-center py-4">
            <p class="text-3xl mb-2">✅</p>
            <p class="font-bold text-green-700 text-base mb-1">Status updated</p>
            <p class="text-sm text-gray-500">
              {{ bulkStatusModal.results_log.filter(r => r.ok).length }} succeeded,
              {{ bulkStatusModal.results_log.filter(r => !r.ok).length }} failed.
            </p>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 px-5 py-4 border-t flex-shrink-0">
          <button @click="bulkStatusModal.open = false"
            class="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition font-medium">
            {{ bulkStatusModal.done ? 'Close' : 'Cancel' }}
          </button>
          <button v-if="!bulkStatusModal.done" @click="runBulkStatusChange"
            :disabled="bulkStatusModal.updating"
            class="inline-flex items-center gap-2 px-5 py-2 text-sm text-white rounded-xl font-semibold transition disabled:opacity-50"
            style="background-color:#1a1d56;">
            {{ bulkStatusModal.updating ? 'Updating…' : 'Update Status' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-gray-500">Loading abstracts...</div>
      <div v-else-if="abstracts.length === 0" class="p-8 text-center text-gray-400">No abstracts found.</div>

      <table v-else class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-600 text-xs uppercase">
          <tr>
            <!-- Select-all checkbox -->
            <th class="px-3 py-3 w-8">
              <input type="checkbox" class="w-4 h-4 cursor-pointer"
                style="accent-color:#1a1d56;"
                :checked="paginated.length > 0 && selectedIds.size === paginated.length"
                :indeterminate="selectedIds.size > 0 && selectedIds.size < paginated.length"
                @change="toggleSelectAll" />
            </th>
            <th class="px-4 py-3 text-left">Title</th>
            <th class="px-4 py-3 text-left hidden lg:table-cell" title="Hover a sub-theme badge to see full title">Sub-Theme</th>
            <th class="px-4 py-3 text-left hidden md:table-cell">First Author</th>
            <th class="px-4 py-3 text-left hidden lg:table-cell">Type</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-left hidden lg:table-cell">Reviewers</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="abs in paginated" :key="abs.id"
            class="hover:bg-gray-50 transition"
            :class="selectedIds.has(abs.id) ? 'bg-[#e6f7fb]' : ''">
            <!-- Row checkbox -->
            <td class="px-3 py-3">
              <input type="checkbox" class="w-4 h-4 cursor-pointer"
                style="accent-color:#1a1d56;"
                :checked="selectedIds.has(abs.id)"
                @change="toggleRow(abs)" />
            </td>
            <td class="px-4 py-3 font-medium text-gray-800 max-w-[200px] truncate">{{ abs.title }}</td>
            <td class="px-4 py-3 hidden lg:table-cell">
              <router-link v-if="abs.track_code"
                :to="{ name: 'AdminTracks', query: { event_id: abs.event_id } }"
                class="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full border transition-opacity hover:opacity-75"
                style="background-color:#e6f7fb; color:#006f87; border-color:#b3e4f0;"
                :title="abs.track_title ? abs.track_code + ': ' + abs.track_title : abs.track_code">
                {{ abs.track_code }}
              </router-link>
              <span v-else class="text-gray-300 text-xs">—</span>
            </td>
            <td class="px-4 py-3 text-gray-600 hidden md:table-cell">
              {{ abs.authors?.[0] ? `${abs.authors[0].firstname} ${abs.authors[0].lastname}` : '—' }}
            </td>
            <td class="px-4 py-3 text-gray-500 capitalize hidden lg:table-cell">{{ abs.presentation_type }}</td>
            <td class="px-4 py-3">
              <span :class="statusClass(abs.status)" class="px-2 py-1 rounded-full text-xs font-semibold capitalize">
                {{ abs.status?.replace('_', ' ') }}
              </span>
            </td>
            <!-- Reviewer count pill with hover tooltip -->
            <td class="px-4 py-3 hidden lg:table-cell">
              <div v-if="abs.reviewer_assignments?.length" class="relative inline-block group">
                <span class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border cursor-default"
                  style="color:#1a1d56; background-color:#e6f7fb; border-color:#b3e4f0;">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  {{ abs.reviewer_assignments.length }}
                </span>
                <!-- Hover tooltip listing reviewer names -->
                <div class="absolute z-50 left-0 top-full mt-1 hidden group-hover:block
                            bg-white border border-gray-200 rounded-xl shadow-lg py-2 min-w-[180px]">
                  <p class="text-xs font-semibold text-gray-400 uppercase px-3 pb-1">Reviewers</p>
                  <div v-for="ra in abs.reviewer_assignments" :key="ra.id"
                       class="px-3 py-1 text-xs text-gray-700 hover:bg-gray-50">
                    {{ ra.reviewer_name }}
                    <span class="block text-gray-400 truncate">{{ ra.reviewer_email }}</span>
                  </div>
                </div>
              </div>
              <span v-else class="text-gray-300 text-xs">—</span>
            </td>
            <!-- Actions -->
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-2">
                <button @click.stop="openQuickAssign(abs)"
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg border transition"
                  :class="abs.reviewer_assignments?.length
                    ? 'border-gray-200 hover:bg-[#e6f7fb]'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'"
                  :style="abs.reviewer_assignments?.length ? 'color:#1a1d56;' : ''"
                  title="Assign reviewer">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                  </svg>
                  Assign
                </button>
                <button v-if="abs.status === 'accepted'"
                  @click.stop="!abs.acceptance_notified_at && openNotifySingle(abs)"
                  :disabled="!!abs.acceptance_notified_at"
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg border transition"
                  :class="abs.acceptance_notified_at
                    ? 'cursor-not-allowed opacity-50 border-gray-200 text-gray-400 bg-gray-50'
                    : 'border-green-200 bg-green-50'"
                  :style="abs.acceptance_notified_at ? '' : 'color:#059669;'"
                  :title="abs.acceptance_notified_at ? 'Notified on ' + formatDate(abs.acceptance_notified_at) : 'Send acceptance notification'">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  {{ abs.acceptance_notified_at ? 'Notified' : 'Notify' }}
                </button>
                <router-link :to="{ name: 'AdminAbstract', params: { id: abs.id } }"
                  class="text-bondi-blue hover:underline text-xs font-medium">View</router-link>
                <button @click="deleteAbstract(abs)"
                  class="text-red-400 hover:text-red-600 text-xs font-medium">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="total > pageSize"
        class="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-500 flex-wrap gap-2">
        <span>{{ ((page - 1) * pageSize) + 1 }}–{{ Math.min(page * pageSize, total) }} of {{ total }}</span>
        <div class="flex items-center gap-1">
          <button @click="goToPage(1)" :disabled="page === 1"
            class="px-2 py-1 rounded border disabled:opacity-40 text-xs">«</button>
          <button @click="goToPage(page - 1)" :disabled="page === 1"
            class="px-3 py-1 rounded border disabled:opacity-40">Prev</button>
          <template v-for="p in pageNumbers" :key="p">
            <span v-if="p === '...'" class="px-2 py-1 text-gray-400">…</span>
            <button v-else @click="goToPage(p)"
              class="px-3 py-1 rounded border transition"
              :class="p === page ? 'text-white border-[#1a1d56]' : 'hover:bg-gray-50'"
              :style="p === page ? 'background-color:#1a1d56;' : ''">
              {{ p }}
            </button>
          </template>
          <button @click="goToPage(page + 1)" :disabled="page === totalPages"
            class="px-3 py-1 rounded border disabled:opacity-40">Next</button>
          <button @click="goToPage(totalPages)" :disabled="page === totalPages"
            class="px-2 py-1 rounded border disabled:opacity-40 text-xs">»</button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════
         QUICK ASSIGN MODAL  (single abstract, multiple reviewers one-by-one)
    ════════════════════════════════════════════════════════════════════════ -->
    <div v-if="quickModal.open"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="quickModal.open = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">

        <div class="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
          <div>
            <p class="font-bold text-gray-800 text-sm">Assign Reviewer</p>
            <p class="text-xs text-gray-400 mt-0.5 max-w-[300px] truncate">{{ quickModal.abstract?.title }}</p>
          </div>
          <button @click="quickModal.open = false" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="p-5 space-y-4 overflow-y-auto flex-1">
          <!-- Current reviewers -->
          <div v-if="quickModal.abstract?.reviewer_assignments?.length">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Currently Assigned</p>
            <div class="space-y-1.5">
              <div v-for="ra in quickModal.abstract.reviewer_assignments" :key="ra.id"
                class="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-sm">
                <div>
                  <span class="font-medium">{{ ra.reviewer_name }}</span>
                  <span class="text-gray-400 text-xs ml-2">{{ ra.reviewer_email }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span :class="ra.completed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'"
                    class="px-2 py-0.5 rounded-full text-xs font-semibold">
                    {{ ra.completed ? '✓ Done' : '⏳ Pending' }}
                  </span>
                  <button @click="quickRemove(ra.reviewer_id)" class="text-red-400 hover:text-red-600 text-xs">✕</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Reviewer picker -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
              Add Reviewer
            </label>
            <!-- Search input -->
            <div class="relative flex items-center border rounded-xl overflow-hidden transition-colors focus-within:ring-2 focus-within:ring-[#1a1d56] mb-1"
              :class="quickModal.search ? 'border-[#1a1d56]' : 'border-gray-300'">
              <div class="pl-3 flex-shrink-0">
                <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/>
                </svg>
              </div>
              <input v-model="quickModal.search" type="text"
                placeholder="Filter reviewers…"
                class="flex-1 bg-transparent text-sm px-3 py-2.5 outline-none placeholder-gray-400"
                ref="quickSearchRef" />
              <button v-if="quickModal.search" @click="quickModal.search = ''; quickModal.selected = null"
                class="pr-3 flex-shrink-0 text-gray-300 hover:text-gray-500">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Reviewer list (always visible) -->
            <div class="border border-gray-200 rounded-xl overflow-hidden">
              <div v-if="loadingReviewers" class="px-4 py-4 text-sm text-gray-400 text-center">
                Loading reviewers…
              </div>
              <div v-else-if="quickFilteredReviewers.length === 0" class="px-4 py-4 text-sm text-gray-400 text-center">
                {{ quickModal.search ? 'No reviewers match' : 'No reviewers available' }}
              </div>
              <div v-else class="max-h-44 overflow-y-auto divide-y divide-gray-50">
                <div v-for="u in quickFilteredReviewers" :key="u.id"
                  @click="quickSelect(u)"
                  class="px-4 py-2.5 text-sm flex items-center gap-3 cursor-pointer transition-colors"
                  :class="quickModal.selected?.id === u.id ? 'bg-[#e6f7fb]' : 'hover:bg-[#e6f7fb]'">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 uppercase"
                    style="background-color:#1a1d56;">
                    {{ u.firstname?.[0] }}{{ u.lastname?.[0] }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-800 truncate">{{ u.firstname }} {{ u.lastname }}</p>
                    <p class="text-xs text-gray-400 truncate">{{ u.email }}</p>
                  </div>
                  <span v-if="quickModal.selected?.id === u.id"
                    class="text-xs font-bold flex-shrink-0" style="color:#1a1d56;">✓</span>
                </div>
              </div>
            </div>
          </div>

          <p v-if="quickModal.successMsg" class="text-green-600 text-sm text-center">✅ {{ quickModal.successMsg }}</p>
          <p v-if="quickModal.errorMsg" class="text-red-500 text-sm text-center">❌ {{ quickModal.errorMsg }}</p>
        </div>

        <div class="flex justify-end gap-3 px-5 py-4 border-t flex-shrink-0">
          <button @click="quickModal.open = false"
            class="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">
            Close
          </button>
          <button @click="quickAssign" :disabled="!quickModal.selected || quickModal.assigning"
            class="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50 transition hover:opacity-90"
            style="background-color:#1a1d56;">
            <svg v-if="quickModal.assigning" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            {{ quickModal.assigning ? 'Assigning…' : 'Assign' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════
         BULK ASSIGN MODAL  (multiple abstracts × multiple reviewers)
    ════════════════════════════════════════════════════════════════════════ -->
    <div v-if="bulkModal.open"
      class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      @click.self="bulkModal.open = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-[92vh]">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style="background-color:#e6f7fb;">
              <svg class="w-5 h-5" style="color:#1a1d56;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div>
              <p class="font-bold text-gray-800 text-sm">Bulk Assign Reviewers</p>
              <p class="text-xs text-gray-400 mt-0.5">
                {{ selectedIds.size }} abstract{{ selectedIds.size !== 1 ? 's' : '' }} selected
              </p>
            </div>
          </div>
          <button @click="bulkModal.open = false" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="p-5 space-y-5 overflow-y-auto flex-1">

          <!-- Selected abstracts summary -->
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Abstracts to assign</p>
            <div class="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              <div v-for="abs in selectedAbstracts" :key="abs.id"
                class="flex items-start gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs">
                <span class="text-gray-400 flex-shrink-0 font-mono">#{{ abs.id }}</span>
                <span class="font-medium text-gray-700 truncate flex-1">{{ abs.title }}</span>
                <span v-if="abs.reviewer_assignments?.length"
                  class="flex-shrink-0 text-xs font-medium" style="color:#1a1d56;">
                  {{ abs.reviewer_assignments.length }} reviewer{{ abs.reviewer_assignments.length !== 1 ? 's' : '' }}
                </span>
                <button @click="selectedItems = new Map([...selectedItems].filter(([k]) => k !== abs.id))"
                  class="text-gray-300 hover:text-red-400 flex-shrink-0">✕</button>
              </div>
            </div>
          </div>

          <!-- Reviewer search (multi-select as chips) -->
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Reviewers to assign
              <span v-if="bulkModal.reviewers.length"
                class="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
                style="background-color:#e6f7fb; color:#1a1d56;">
                {{ bulkModal.reviewers.length }}
              </span>
            </p>

            <!-- Chips of selected reviewers -->
            <div v-if="bulkModal.reviewers.length" class="flex flex-wrap gap-2 mb-3">
              <span v-for="r in bulkModal.reviewers" :key="r.id"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                style="background-color:#e6f7fb; color:#006f87; border-color:#b3e4f0;">
                {{ r.firstname }} {{ r.lastname }}
                <button @click="removeBulkReviewer(r.id)"
                  class="leading-none hover:text-red-500 transition-colors" style="color:#1a1d56;">✕</button>
              </span>
            </div>

            <!-- Search input -->
            <div class="relative flex items-center border rounded-xl overflow-hidden transition-colors focus-within:ring-2 focus-within:ring-[#1a1d56] mb-1"
              :class="bulkModal.search ? 'border-[#1a1d56]' : 'border-gray-300'">
              <div class="pl-3 flex-shrink-0">
                <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/>
                </svg>
              </div>
              <input v-model="bulkModal.search" type="text"
                placeholder="Filter reviewers…"
                class="flex-1 bg-transparent text-sm px-3 py-2.5 outline-none placeholder-gray-400 text-gray-700" />
              <button v-if="bulkModal.search" @click="bulkModal.search = ''"
                class="pr-3 flex-shrink-0 text-gray-300 hover:text-gray-500">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Reviewer list (always visible) -->
            <div class="border border-gray-200 rounded-xl overflow-hidden mb-2">
              <div v-if="loadingReviewers" class="px-4 py-4 text-sm text-gray-400 text-center">
                Loading reviewers…
              </div>
              <div v-else-if="bulkFilteredReviewers.length === 0" class="px-4 py-4 text-sm text-gray-400 text-center">
                {{ bulkModal.search ? 'No reviewers match' : 'No reviewers available' }}
              </div>
              <div v-else class="max-h-48 overflow-y-auto divide-y divide-gray-50">
                <div v-for="u in bulkFilteredReviewers" :key="u.id"
                  @click="addBulkReviewer(u)"
                  class="px-4 py-2.5 text-sm flex items-center gap-3 transition-colors"
                  :class="bulkModal.reviewers.find(r => r.id === u.id)
                    ? 'bg-[#e6f7fb] cursor-default'
                    : 'hover:bg-[#e6f7fb] cursor-pointer'">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 uppercase"
                    style="background-color:#1a1d56;">
                    {{ u.firstname?.[0] }}{{ u.lastname?.[0] }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-800 truncate">{{ u.firstname }} {{ u.lastname }}</p>
                    <p class="text-xs text-gray-400 truncate">{{ u.email }}</p>
                  </div>
                  <span v-if="bulkModal.reviewers.find(r => r.id === u.id)"
                    class="text-xs font-bold flex-shrink-0" style="color:#1a1d56;">✓ Added</span>
                  <span v-else class="text-xs text-gray-300 flex-shrink-0">+ Add</span>
                </div>
              </div>
            </div>
            <p class="text-xs text-gray-400">Click to add reviewers — all selected will be assigned to every chosen abstract.</p>
          </div>

          <!-- Progress / results -->
          <div v-if="bulkModal.done">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Results</p>
            <div class="space-y-1 max-h-44 overflow-y-auto">
              <div v-for="r in bulkModal.results_log" :key="r.key"
                class="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg"
                :class="r.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'">
                {{ r.ok ? '✅' : '❌' }} {{ r.msg }}
              </div>
            </div>
          </div>

          <!-- Progress bar while assigning -->
          <div v-if="bulkModal.assigning" class="space-y-2">
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>Assigning… {{ bulkModal.progress }} / {{ bulkModal.total }}</span>
              <span>{{ Math.round(bulkModal.progress / bulkModal.total * 100) }}%</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div class="h-2 rounded-full transition-all duration-300"
                style="background-color:#1a1d56;"
                :style="{ width: `${Math.round(bulkModal.progress / bulkModal.total * 100)}%` }">
              </div>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 px-5 py-4 border-t flex-shrink-0">
          <button @click="bulkModal.open = false"
            class="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">
            {{ bulkModal.done ? 'Close' : 'Cancel' }}
          </button>
          <button v-if="!bulkModal.done"
            @click="runBulkAssign"
            :disabled="bulkModal.assigning || bulkModal.reviewers.length === 0 || selectedIds.size === 0"
            class="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50 transition hover:opacity-90"
            style="background-color:#1a1d56;">
            <svg v-if="bulkModal.assigning" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            <span v-if="bulkModal.assigning">Assigning…</span>
            <span v-else>
              Assign {{ bulkModal.reviewers.length }} reviewer{{ bulkModal.reviewers.length !== 1 ? 's' : '' }}
              to {{ selectedIds.size }} abstract{{ selectedIds.size !== 1 ? 's' : '' }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════
         REPORTS SLIDE-OVER
    ════════════════════════════════════════════════════════════════════════ -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div v-if="reportsOpen" class="fixed inset-0 bg-black/50 z-50" @click.self="reportsOpen = false">
        <div class="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl flex flex-col
                    transition-transform duration-300"
          :class="reportsOpen ? 'translate-x-0' : 'translate-x-full'">

          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5" style="color:#1B3F6E;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <h2 class="font-bold text-gray-800">Abstract Reports</h2>
            </div>
            <div class="flex items-center gap-3">
              <select v-model.number="reportsEventId" class="input text-sm w-48">
                <option :value="null">All Events</option>
                <option v-for="e in events" :key="e.id" :value="e.id">{{ e.event }}</option>
              </select>
              <button @click="reportsOpen = false" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Scrollable content -->
          <div class="flex-1 overflow-y-auto px-6 py-5">
            <AbstractStatsPanel :event-id="reportsEventId" />
          </div>
        </div>
      </div>
    </transition>

    <!-- ═══════════════════════════════════════════════════════════════════════
         TEMPLATES MODAL
    ════════════════════════════════════════════════════════════════════════ -->
    <div v-if="tmplModal.open"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="tmplModal.open = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

        <div class="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
          <div>
            <p class="font-bold text-gray-800 text-sm">Presentation Templates</p>
            <p class="text-xs text-gray-400 mt-0.5">Templates available to accepted &amp; paid authors</p>
          </div>
          <button @click="tmplModal.open = false" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="p-5 space-y-4 overflow-y-auto flex-1">

          <!-- Upload form -->
          <div class="bg-gray-50 rounded-xl p-4 space-y-3">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-widest">Upload New Template</p>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Template Name <span class="text-red-500">*</span></label>
              <input v-model="tmplModal.name" type="text" class="input w-full" placeholder="e.g. ECSA-HC PowerPoint Template 2026" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-500 mb-1">Event (optional)</label>
                <select v-model.number="tmplModal.eventId" class="input w-full">
                  <option :value="null">All Events</option>
                  <option v-for="e in events" :key="e.id" :value="e.id">{{ e.event }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">Type (optional)</label>
                <select v-model="tmplModal.ptype" class="input w-full">
                  <option value="">All Types</option>
                  <option value="oral">Oral</option>
                  <option value="poster">Poster</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">File <span class="text-red-500">*</span></label>
              <input type="file" @change="tmplModal.file = $event.target.files[0]"
                accept=".pptx,.ppt,.pdf,.potx"
                class="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#e6f7fb] file:text-[#006f87] hover:file:opacity-80" />
            </div>
            <p v-if="tmplModal.error" class="text-red-500 text-xs">{{ tmplModal.error }}</p>
            <button @click="uploadTemplate" :disabled="tmplModal.uploading || !tmplModal.file || !tmplModal.name"
              class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50 transition hover:opacity-90"
              style="background-color:#1a1d56;">
              <svg v-if="tmplModal.uploading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              {{ tmplModal.uploading ? 'Uploading…' : 'Upload Template' }}
            </button>
          </div>

          <!-- Existing templates -->
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Uploaded Templates</p>
            <div v-if="tmplModal.loading" class="text-xs text-gray-400 py-4 text-center">Loading…</div>
            <div v-else-if="tmplModal.templates.length === 0" class="text-xs text-gray-400 py-4 text-center">No templates uploaded yet.</div>
            <div v-else class="space-y-2">
              <div v-for="t in tmplModal.templates" :key="t.id" class="bg-gray-50 rounded-xl">

                <!-- Edit mode -->
                <div v-if="editTemplate.id === t.id" class="p-3 space-y-2">
                  <input v-model="editTemplate.name" type="text" class="input w-full" placeholder="Template name" />
                  <div class="grid grid-cols-2 gap-2">
                    <select v-model.number="editTemplate.eventId" class="input w-full">
                      <option :value="null">All Events</option>
                      <option v-for="e in events" :key="e.id" :value="e.id">{{ e.event }}</option>
                    </select>
                    <select v-model="editTemplate.ptype" class="input w-full">
                      <option value="">All Types</option>
                      <option value="oral">Oral</option>
                      <option value="poster">Poster</option>
                    </select>
                  </div>
                  <p v-if="editTemplate.error" class="text-red-500 text-xs">{{ editTemplate.error }}</p>
                  <div class="flex items-center gap-2">
                    <button @click="saveTemplateEdit" :disabled="editTemplate.saving"
                      class="text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50"
                      style="background-color:#1a1d56;">
                      {{ editTemplate.saving ? 'Saving…' : 'Save' }}
                    </button>
                    <button @click="editTemplate.id = null" class="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500">
                      Cancel
                    </button>
                  </div>
                </div>

                <!-- Display mode -->
                <div v-else class="flex items-center gap-3 px-3 py-2.5">
                  <svg class="w-5 h-5 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-700 truncate">{{ t.name }}</p>
                    <p class="text-xs text-gray-400">
                      {{ t.event_id ? events.find(e => e.id === t.event_id)?.event || 'Unknown event' : 'All events' }}
                      <span v-if="t.presentation_type"> · {{ t.presentation_type }}</span>
                    </p>
                  </div>
                  <button @click="openTemplateEdit(t)" class="text-gray-400 hover:text-gray-600 flex-shrink-0" title="Edit">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button @click="openNotifyTemplate(t)"
                    class="text-xs font-medium px-2 py-1 rounded-lg border transition flex-shrink-0"
                    style="color:#5b21b6; border-color:#c4b5fd; background:#f5f3ff;">
                    Notify
                  </button>
                  <a :href="t.url" target="_blank"
                    class="text-xs font-medium px-2 py-1 rounded-lg border transition flex-shrink-0"
                    style="color:#1a1d56; border-color:#b3e4f0; background:#e6f7fb;">
                    Download
                  </a>
                  <button @click="deleteTemplate(t)" class="text-red-400 hover:text-red-600 flex-shrink-0">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════
         ALL PRESENTATIONS MODAL
    ════════════════════════════════════════════════════════════════════════ -->
    <div v-if="presentationsModal.open"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="presentationsModal.open = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">

        <div class="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
          <div>
            <p class="font-bold text-gray-800 text-sm">All Presentations</p>
            <p class="text-xs text-gray-400 mt-0.5">Every presenter-uploaded slide or poster</p>
          </div>
          <button @click="presentationsModal.open = false" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="px-5 pt-4 flex-shrink-0">
          <select v-model.number="presentationsModal.eventId" @change="loadPresentations" class="input w-full">
            <option :value="null">All Events</option>
            <option v-for="e in events" :key="e.id" :value="e.id">{{ e.event }}</option>
          </select>
        </div>

        <div class="p-5 space-y-2 overflow-y-auto flex-1">
          <div v-if="presentationsModal.loading" class="text-xs text-gray-400 py-4 text-center">Loading…</div>
          <div v-else-if="presentationsModal.items.length === 0" class="text-xs text-gray-400 py-4 text-center">No presentations uploaded yet.</div>

          <div v-else v-for="p in presentationsModal.items" :key="p.id" class="rounded-xl border border-gray-100 overflow-hidden">
            <div @click="p._expanded = !p._expanded" class="w-full flex items-center gap-3 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-left cursor-pointer">
              <svg class="w-5 h-5 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-700 truncate">{{ p.abstract_title }}</p>
                <p class="text-xs text-gray-400 truncate">
                  {{ p.uploader_name || 'Unknown' }} · {{ p.event_name }}
                  <span v-if="p.presentation_type"> · {{ p.presentation_type }}</span>
                </p>
              </div>
              <a :href="fileUrl(p.url)" target="_blank" @click.stop
                class="text-xs font-medium px-2 py-1 rounded-lg border transition flex-shrink-0"
                style="color:#1a1d56; border-color:#b3e4f0; background:#e6f7fb;">
                Download
              </a>
            </div>
            <div v-if="p._expanded" class="p-3 border-t border-gray-100">
              <img v-if="isImage(p.url)" :src="fileUrl(p.url)" class="max-w-full max-h-[40vh] object-contain rounded-lg border" />
              <div v-else-if="isPdf(p.url)" style="height:40vh;" class="rounded-lg border overflow-hidden">
                <iframe :src="fileUrl(p.url)" class="w-full h-full" frameborder="0"></iframe>
              </div>
              <div v-else-if="isOffice(p.url)" style="height:40vh;" class="rounded-lg border overflow-hidden">
                <iframe :src="officeViewerUrl(p.url)" class="w-full h-full" frameborder="0"></iframe>
              </div>
              <p v-else class="text-xs text-gray-400">Preview not available for this file type — use Download.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════
         NOTIFY TEMPLATE (per-template dispatch) MODAL
    ════════════════════════════════════════════════════════════════════════ -->
    <div v-if="notifyTemplateModal.open"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="notifyTemplateModal.open = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

        <div class="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
          <div>
            <p class="font-bold text-gray-800 text-sm">Notify Presenters</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ notifyTemplateModal.template?.name }}</p>
          </div>
          <button @click="notifyTemplateModal.open = false" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="p-5 space-y-4 overflow-y-auto flex-1">
          <div v-if="notifyTemplateModal.loading" class="text-xs text-gray-400 py-4 text-center">Loading…</div>

          <template v-else-if="notifyTemplateModal.preview">
            <div v-if="notifyTemplateModal.preview.needs_event" class="space-y-3">
              <p class="text-amber-700 text-sm bg-amber-50 border border-amber-200 rounded-xl p-3">
                This template applies to all events — choose which event's presenters to notify.
              </p>
              <select v-model.number="notifyTemplateModal.eventId" class="input w-full">
                <option :value="null" disabled>Select an event…</option>
                <option v-for="e in notifyTemplateModal.preview.events" :key="e.id" :value="e.id">{{ e.event }}</option>
              </select>
              <button @click="loadNotifyTemplatePreview" :disabled="!notifyTemplateModal.eventId"
                class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-50 transition hover:opacity-90"
                style="background-color:#5b21b6;">
                Preview Recipients
              </button>
            </div>
            <template v-else>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs px-2 py-1 rounded-full font-semibold" style="background:#f5f3ff;color:#5b21b6;">
                  {{ notifyTemplateModal.preview.to_send.length }} to notify
                </span>
                <span v-if="notifyTemplateModal.preview.already_notified.length" class="text-xs px-2 py-1 rounded-full font-semibold bg-gray-100 text-gray-500">
                  {{ notifyTemplateModal.preview.already_notified.length }} already notified
                </span>
              </div>

              <div v-if="notifyTemplateModal.preview.to_send.length" class="rounded-xl border border-gray-200 overflow-hidden">
                <div class="max-h-80 overflow-y-auto divide-y divide-gray-100">
                  <div v-for="r in notifyTemplateModal.preview.to_send" :key="r.email" class="px-4 py-2.5">
                    <div class="flex items-center gap-2 flex-wrap">
                      <p class="text-sm font-medium text-gray-800">{{ r.firstname }}</p>
                      <span class="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-green-100 text-green-700">
                        {{ r.status === 'accepted' ? 'Accepted' : r.status }}
                      </span>
                      <span class="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                        :class="r.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'">
                        {{ r.payment_status === 'paid' ? 'Paid' : 'Proof Uploaded' }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-400">{{ r.email }}</p>
                    <ul class="mt-1 space-y-0.5" v-if="r.abstract_titles?.length">
                      <li v-for="(t, idx) in r.abstract_titles" :key="idx" class="text-xs text-gray-600 leading-snug">
                        📄 {{ t }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <p v-else class="text-xs text-gray-400 text-center py-3">Everyone eligible has already been notified.</p>
            </template>
          </template>

          <p v-if="notifyTemplateModal.error" class="text-red-500 text-xs">{{ notifyTemplateModal.error }}</p>

          <button v-if="notifyTemplateModal.preview && !notifyTemplateModal.preview.needs_event && notifyTemplateModal.preview.to_send.length"
            @click="sendNotifyTemplate" :disabled="notifyTemplateModal.sending"
            class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-50 transition hover:opacity-90"
            style="background-color:#5b21b6;">
            {{ notifyTemplateModal.sending ? 'Sending…' : `Send to ${notifyTemplateModal.preview.to_send.length} Presenter${notifyTemplateModal.preview.to_send.length === 1 ? '' : 's'}` }}
          </button>

          <p v-if="notifyTemplateModal.done" class="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl p-3 text-center">
            Notification queued.
          </p>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════
         NOTIFY ACCEPTED AUTHORS MODAL
    ════════════════════════════════════════════════════════════════════════ -->
    <div v-if="notifyModal.open"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="notifyModal.open = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh]">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0" style="background-color:#d1fae5;">
              <svg class="w-5 h-5" style="color:#065f46;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <p class="font-bold text-gray-800 text-sm">
                {{ notifyModal.singleAbstract ? 'Notify Author' : 'Notify Accepted Authors' }}
              </p>
              <p class="text-xs text-gray-400 mt-0.5">
                {{ notifyModal.singleAbstract ? 'Send acceptance notification to this author' : 'Send acceptance notification emails to all accepted abstract authors' }}
              </p>
            </div>
          </div>
          <button @click="notifyModal.open = false" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="p-5 space-y-4 overflow-y-auto flex-1">

          <!-- Single-author banner -->
          <div v-if="notifyModal.singleAbstract"
            class="flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
            style="background:#e6f7fb; border:1px solid #b3e4f0;">
            <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color:#1a1d56;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <div class="min-w-0">
              <p class="font-semibold text-gray-800 truncate">{{ notifyModal.singleAbstract.title }}</p>
              <p class="text-xs text-gray-500 mt-0.5 capitalize">
                {{ notifyModal.singleAbstract.presentation_type || 'oral' }} ·
                {{ notifyModal.singleAbstract.authors?.[0] ? notifyModal.singleAbstract.authors[0].firstname + ' ' + notifyModal.singleAbstract.authors[0].lastname : '—' }}
              </p>
            </div>
          </div>

          <!-- Event filter (bulk only) -->
          <div v-if="!notifyModal.singleAbstract">
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Event (optional)</label>
            <select v-model.number="notifyModal.eventId" class="input w-full">
              <option :value="null">All Events</option>
              <option v-for="e in events" :key="e.id" :value="e.id">{{ e.event }}</option>
            </select>
            <p class="text-xs text-gray-400 mt-1">Leave blank to notify accepted authors across all events.</p>
          </div>

          <!-- Portal URL -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Portal URL</label>
            <input v-model="notifyModal.portalUrl" type="url" class="input w-full" placeholder="https://events.ecsahc.org" />
          </div>

          <!-- Skip already notified (bulk only) -->
          <div v-if="!notifyModal.singleAbstract" class="flex items-start gap-3">
            <input type="checkbox" id="skipNotified" v-model="notifyModal.skipNotified"
              class="mt-0.5 w-4 h-4 cursor-pointer rounded" style="accent-color:#1a1d56;" />
            <label for="skipNotified" class="text-sm text-gray-700 cursor-pointer">
              Skip already notified
              <span class="block text-xs text-gray-400 mt-0.5">Only send to accepted authors who haven't received this email yet.</span>
            </label>
          </div>

          <!-- Test email -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Test Email (optional)</label>
            <input v-model="notifyModal.testEmail" type="email" class="input w-full" placeholder="Leave blank to send to real authors" />
            <p class="text-xs text-gray-400 mt-1">If set, ALL emails are sent to this address instead of the actual authors.</p>
          </div>

          <!-- Results -->
          <div v-if="notifyModal.done" class="bg-green-50 border border-green-200 rounded-xl p-4">
            <p class="font-semibold text-green-700 text-sm mb-1">
              ✅ {{ notifyModal.result.sent }} email{{ notifyModal.result.sent !== 1 ? 's' : '' }} queued
            </p>
            <p class="text-xs text-gray-500 mt-1">Sending in the background — check Email Logs to confirm delivery.</p>
          </div>

          <p v-if="notifyModal.error" class="text-red-500 text-sm">{{ notifyModal.error }}</p>

        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 px-5 py-4 border-t flex-shrink-0">
          <button @click="notifyModal.open = false"
            class="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">
            {{ notifyModal.done ? 'Close' : 'Cancel' }}
          </button>
          <button v-if="!notifyModal.done"
            @click="runNotifyAccepted"
            :disabled="notifyModal.sending"
            class="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50 transition hover:opacity-90"
            style="background-color:#059669;">
            <svg v-if="notifyModal.sending" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            {{ notifyModal.sending ? 'Sending…' : (notifyModal.testEmail ? 'Send Test Email' : (notifyModal.singleAbstract ? 'Send Notification' : 'Send All Notifications')) }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════════
         REGISTRATION REMINDER MODAL
    ════════════════════════════════════════════════════════════════════════ -->
    <div v-if="regReminderModal.open"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="regReminderModal.open = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-[92vh]">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0" style="background-color:#fffbeb;">
              <svg class="w-5 h-5" style="color:#f59d08;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </div>
            <div>
              <p class="font-bold text-gray-800 text-sm">Send Registration Reminder</p>
              <p class="text-xs text-gray-400 mt-0.5">
                {{ regReminderModal.step === 'select' ? 'Email presenting authors who haven\'t registered or paid' : regReminderModal.step === 'preview' ? `Preview for: ${regReminderModal.preview.event_name}` : 'Reminders sent' }}
              </p>
            </div>
          </div>
          <button @click="regReminderModal.open = false" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="p-5 overflow-y-auto flex-1">

          <!-- Step 1: Select event -->
          <div v-if="regReminderModal.step === 'select'" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Event <span class="text-red-500">*</span></label>
              <select v-model.number="regReminderModal.eventId" class="input w-full">
                <option :value="null">— Select an event —</option>
                <option v-for="e in events" :key="e.id" :value="e.id">{{ e.event }}</option>
              </select>
              <p class="text-xs text-gray-400 mt-1">Only accepted, presenting abstract authors for this event will receive the email.</p>
            </div>
            <div class="flex items-start gap-3 px-4 py-3 rounded-xl text-sm" style="background:#fffbeb; border:1px solid #fcd34d;">
              <svg class="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-amber-800 text-xs leading-relaxed">
                Presenting authors who haven't registered get a <strong>register &amp; pay</strong> reminder; those who registered but haven't paid get a <strong>complete your payment</strong> reminder. Only authors who are registered <strong>and paid</strong> are skipped.
              </p>
            </div>
            <p v-if="regReminderModal.error" class="text-red-500 text-sm">{{ regReminderModal.error }}</p>
          </div>

          <!-- Step 2: Preview -->
          <div v-if="regReminderModal.step === 'preview'" class="space-y-4">
            <!-- Summary badges -->
            <div class="grid grid-cols-3 gap-3">
              <div class="rounded-xl p-3 text-center" style="background:#eef7fc; border:1px solid #b3e4f0;">
                <p class="text-2xl font-bold" style="color:#1a1d56;">{{ regReminderModal.preview.total_authors }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Total Authors</p>
              </div>
              <div class="rounded-xl p-3 text-center" style="background:#fffbeb; border:1px solid #fcd34d;">
                <p class="text-2xl font-bold text-amber-600">{{ regReminderModal.preview.to_send.length }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Will Receive</p>
              </div>
              <div class="rounded-xl p-3 text-center" style="background:#f0fdf4; border:1px solid #bbf7d0;">
                <p class="text-2xl font-bold text-green-600">{{ regReminderModal.preview.already_registered.length }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Already Registered</p>
              </div>
            </div>

            <!-- Will receive list -->
            <div v-if="regReminderModal.preview.to_send.length > 0">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Will Receive Reminder ({{ regReminderModal.preview.to_send.length }})
              </p>
              <div class="rounded-xl border border-amber-200 overflow-hidden">
                <div class="max-h-52 overflow-y-auto divide-y divide-gray-100">
                  <div v-for="a in regReminderModal.preview.to_send" :key="a.email"
                    class="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50">
                    <div class="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style="background:#fffbeb;color:#92400e;">
                      {{ (a.firstname?.[0] || '') + (a.lastname?.[0] || '') }}
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-medium text-gray-800 truncate">{{ a.firstname }} {{ a.lastname }}</p>
                      <p class="text-xs text-gray-400 truncate">{{ a.email }}</p>
                    </div>
                    <span class="ml-auto text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                      :style="a.status === 'unpaid' ? 'background:#fef2f2;color:#b91c1c;' : 'background:#fffbeb;color:#92400e;'">
                      {{ a.status === 'unpaid' ? 'Payment pending' : 'Not registered' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="rounded-xl border border-gray-200 p-4 text-center text-gray-400 text-sm">
              No authors to remind — all accepted presenting authors have registered and paid.
            </div>

            <!-- Already registered list -->
            <div v-if="regReminderModal.preview.already_registered.length > 0">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Registered &amp; Paid – Will Be Skipped ({{ regReminderModal.preview.already_registered.length }})
              </p>
              <div class="rounded-xl border border-green-200 overflow-hidden">
                <div class="max-h-40 overflow-y-auto divide-y divide-gray-100">
                  <div v-for="a in regReminderModal.preview.already_registered" :key="a.email"
                    class="flex items-center gap-3 px-4 py-2.5 hover:bg-green-50">
                    <div class="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style="background:#f0fdf4;color:#15803d;">
                      {{ (a.firstname?.[0] || '') + (a.lastname?.[0] || '') }}
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-medium text-gray-800 truncate">{{ a.firstname }} {{ a.lastname }}</p>
                      <p class="text-xs text-gray-400 truncate">{{ a.email }}</p>
                    </div>
                    <span class="ml-auto text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0" style="background:#f0fdf4;color:#15803d;">✓ Registered</span>
                  </div>
                </div>
              </div>
            </div>

            <p v-if="regReminderModal.error" class="text-red-500 text-sm">{{ regReminderModal.error }}</p>
          </div>

          <!-- Step 3: Done -->
          <div v-if="regReminderModal.step === 'done'" class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
              <p class="text-3xl mb-2">✅</p>
              <p class="font-bold text-green-700 text-base mb-1">
                {{ regReminderModal.result.sent }} reminder{{ regReminderModal.result.sent !== 1 ? 's' : '' }} queued
              </p>
              <p class="text-sm text-gray-500">
                {{ regReminderModal.result.already_registered }} author(s) already registered were skipped.
                Sending in the background — check Email Logs to confirm delivery.
              </p>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between gap-3 px-5 py-4 border-t flex-shrink-0">
          <button v-if="regReminderModal.step === 'preview'" @click="regReminderModal.step = 'select'"
            class="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">
            ← Back
          </button>
          <div v-else></div>

          <div class="flex gap-3">
            <button @click="regReminderModal.open = false"
              class="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">
              {{ regReminderModal.step === 'done' ? 'Close' : 'Cancel' }}
            </button>
            <!-- Select step: Preview button -->
            <button v-if="regReminderModal.step === 'select'"
              @click="loadRegReminderPreview"
              :disabled="regReminderModal.loading || !regReminderModal.eventId"
              class="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50 transition hover:opacity-90"
              style="background-color:#1a1d56;">
              <svg v-if="regReminderModal.loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              {{ regReminderModal.loading ? 'Loading…' : 'Preview Recipients →' }}
            </button>
            <!-- Preview step: Send button -->
            <button v-if="regReminderModal.step === 'preview'"
              @click="runRegReminder"
              :disabled="regReminderModal.sending || regReminderModal.preview.to_send.length === 0"
              class="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50 transition hover:opacity-90"
              style="background-color:#f59d08;">
              <svg v-if="regReminderModal.sending" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              {{ regReminderModal.sending ? 'Sending…' : `Send to ${regReminderModal.preview.to_send.length} Author${regReminderModal.preview.to_send.length !== 1 ? 's' : ''}` }}
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════════
         NOTIFY REJECTED AUTHORS MODAL
    ════════════════════════════════════════════════════════════════════════ -->
    <div v-if="rejectNotifyModal.open"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="rejectNotifyModal.open = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-[92vh]">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0" style="background-color:#fef2f2;">
              <svg class="w-5 h-5" style="color:#b91c1c;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </div>
            <div>
              <p class="font-bold text-gray-800 text-sm">Notify Rejected Authors</p>
              <p class="text-xs text-gray-400 mt-0.5">
                {{ rejectNotifyModal.step === 'select' ? 'Email authors of rejected abstracts' : rejectNotifyModal.step === 'preview' ? `Preview for: ${rejectNotifyModal.preview.event_name}` : 'Notifications sent' }}
              </p>
            </div>
          </div>
          <button @click="rejectNotifyModal.open = false" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="p-5 overflow-y-auto flex-1">

          <!-- Step 1: Select event -->
          <div v-if="rejectNotifyModal.step === 'select'" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Event <span class="text-red-500">*</span></label>
              <select v-model.number="rejectNotifyModal.eventId" class="input w-full">
                <option :value="null">— Select an event —</option>
                <option v-for="e in events" :key="e.id" :value="e.id">{{ e.event }}</option>
              </select>
              <p class="text-xs text-gray-400 mt-1">One email per author — someone with multiple rejected abstracts is emailed once.</p>
            </div>
            <div class="flex items-start gap-3 px-4 py-3 rounded-xl text-sm" style="background:#eef7fc; border:1px solid #b3e4f0;">
              <svg class="w-4 h-4 flex-shrink-0 mt-0.5" style="color:#1a1d56;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-xs leading-relaxed" style="color:#006f87;">
                Sent from <strong>ECSA Events &lt;admission@cosecsa.org&gt;</strong>, cc'd to <strong>smyeni@ecsahc.org</strong>.
                Authors already notified for a given abstract are skipped automatically.
              </p>
            </div>
            <p v-if="rejectNotifyModal.error" class="text-red-500 text-sm">{{ rejectNotifyModal.error }}</p>
          </div>

          <!-- Step 2: Preview -->
          <div v-if="rejectNotifyModal.step === 'preview'" class="space-y-4">
            <!-- Summary badges -->
            <div class="grid grid-cols-3 gap-3">
              <div class="rounded-xl p-3 text-center" style="background:#eef7fc; border:1px solid #b3e4f0;">
                <p class="text-2xl font-bold" style="color:#1a1d56;">{{ rejectNotifyModal.preview.total_rejected_abstracts }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Rejected Abstracts</p>
              </div>
              <div class="rounded-xl p-3 text-center" style="background:#fef2f2; border:1px solid #fca5a5;">
                <p class="text-2xl font-bold" style="color:#b91c1c;">{{ rejectNotifyModal.preview.to_send.length }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Will Receive</p>
              </div>
              <div class="rounded-xl p-3 text-center" style="background:#f0fdf4; border:1px solid #bbf7d0;">
                <p class="text-2xl font-bold text-green-600">{{ rejectNotifyModal.preview.already_notified.length }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Already Notified</p>
              </div>
            </div>

            <!-- Will receive list -->
            <div v-if="rejectNotifyModal.preview.to_send.length > 0">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Will Receive Notification ({{ rejectNotifyModal.preview.to_send.length }})
              </p>
              <div class="rounded-xl border border-red-200 overflow-hidden">
                <div class="max-h-80 overflow-y-auto divide-y divide-gray-100">
                  <div v-for="a in rejectNotifyModal.preview.to_send" :key="a.email"
                    class="flex items-start gap-3 px-4 py-3 hover:bg-red-50">
                    <div class="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5" style="background:#fef2f2;color:#b91c1c;">
                      {{ (a.firstname?.[0] || '') }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2">
                        <p class="text-sm font-medium text-gray-800 truncate">{{ a.firstname }}</p>
                        <span v-if="a.abstract_titles.length > 1" class="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0" style="background:#fef2f2;color:#b91c1c;">
                          {{ a.abstract_titles.length }} abstracts
                        </span>
                      </div>
                      <p class="text-xs text-gray-400 truncate">{{ a.email }}</p>
                      <ul class="mt-1 space-y-0.5" v-if="a.abstract_titles.length">
                        <li v-for="(t, idx) in a.abstract_titles" :key="idx" class="text-xs text-gray-600 leading-snug">
                          📄 {{ t }}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="rounded-xl border border-gray-200 p-4 text-center text-gray-400 text-sm">
              No authors to notify — every rejected abstract's author has already been emailed.
            </div>

            <p v-if="rejectNotifyModal.error" class="text-red-500 text-sm">{{ rejectNotifyModal.error }}</p>
          </div>

          <!-- Step 3: Done -->
          <div v-if="rejectNotifyModal.step === 'done'" class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
              <p class="text-3xl mb-2">✅</p>
              <p class="font-bold text-green-700 text-base mb-1">
                {{ rejectNotifyModal.result.sent }} notification{{ rejectNotifyModal.result.sent !== 1 ? 's' : '' }} queued
              </p>
              <p class="text-sm text-gray-500">
                Sending in the background — check Email Logs to confirm delivery.
              </p>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between gap-3 px-5 py-4 border-t flex-shrink-0">
          <button v-if="rejectNotifyModal.step === 'preview'" @click="rejectNotifyModal.step = 'select'"
            class="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">
            ← Back
          </button>
          <div v-else></div>

          <div class="flex gap-3">
            <button @click="rejectNotifyModal.open = false"
              class="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">
              {{ rejectNotifyModal.step === 'done' ? 'Close' : 'Cancel' }}
            </button>
            <!-- Select step: Preview button -->
            <button v-if="rejectNotifyModal.step === 'select'"
              @click="loadRejectNotifyPreview"
              :disabled="rejectNotifyModal.loading || !rejectNotifyModal.eventId"
              class="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50 transition hover:opacity-90"
              style="background-color:#1a1d56;">
              <svg v-if="rejectNotifyModal.loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              {{ rejectNotifyModal.loading ? 'Loading…' : 'Preview Recipients →' }}
            </button>
            <!-- Preview step: Send button -->
            <button v-if="rejectNotifyModal.step === 'preview'"
              @click="runRejectNotify"
              :disabled="rejectNotifyModal.sending || rejectNotifyModal.preview.to_send.length === 0"
              class="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50 transition hover:opacity-90"
              style="background-color:#b91c1c;">
              <svg v-if="rejectNotifyModal.sending" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              {{ rejectNotifyModal.sending ? 'Sending…' : `Send to ${rejectNotifyModal.preview.to_send.length} Author${rejectNotifyModal.preview.to_send.length !== 1 ? 's' : ''}` }}
            </button>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AbstractStatsPanel from './AbstractStatsView.vue'
import api from '@/plugins/axios'
import { debounce } from 'lodash'
import { fileUrl, isImage, isPdf, isOffice, officeViewerUrl } from '@/utils/filePreview'

const route        = useRoute()
const router        = useRouter()

const abstracts    = ref([])   // current page only
const total        = ref(0)    // total matching records from server
const events       = ref([])
const tracks       = ref([])
const loading      = ref(true)
const exporting    = ref(false)
const exportingPdf = ref(false)
const search        = ref('')
const filterEvent   = ref('')
const filterStatus  = ref('')
const filterTracks  = ref([])
const filterType    = ref('')
const page          = ref(1)
const pageSize      = 50
const trackPickerOpen = ref(false)
const trackPickerRef  = ref(null)
const notifDropdownOpen = ref(false)
const notifDropdownRef  = ref(null)

// Cross-page selection: Map<id, abstractObj>
const selectedItems = ref(new Map())
const selectedIds   = computed(() => new Set(selectedItems.value.keys()))

const quickSearchRef = ref(null)

// ── Shared reviewer pool (loaded once for quick + bulk modals) ───────────────
const allReviewers      = ref([])
const loadingReviewers  = ref(false)

async function loadAllReviewers() {
  if (allReviewers.value.length > 0) return // already cached
  loadingReviewers.value = true
  try {
    const res = await api.get('/abstracts/reviewers/candidates')
    allReviewers.value = res.data || []
  } catch (e) {
    console.error('Failed to load reviewers', e)
  } finally {
    loadingReviewers.value = false
  }
}

// ── Quick-assign modal (single abstract) ────────────────────────────────────
const quickModal = ref({
  open: false, abstract: null,
  search: '', selected: null,
  assigning: false, successMsg: '', errorMsg: '',
})

// Reviewers filtered for quick-assign: exclude already-assigned + match search
const quickFilteredReviewers = computed(() => {
  const q = (quickModal.value.search || '').toLowerCase().trim()
  const assignedIds = new Set(
    (quickModal.value.abstract?.reviewer_assignments || []).map(ra => ra.reviewer_id)
  )
  return allReviewers.value
    .filter(u => !assignedIds.has(u.id))
    .filter(u => {
      if (!q) return true
      return `${u.firstname || ''} ${u.lastname || ''} ${u.email || ''}`.toLowerCase().includes(q)
    })
})

function openQuickAssign(abs) {
  quickModal.value = {
    open: true, abstract: abs,
    search: '', selected: null,
    assigning: false, successMsg: '', errorMsg: '',
  }
  loadAllReviewers()
  nextTick(() => quickSearchRef.value?.focus())
}

function quickSelect(u) {
  quickModal.value.selected = u
}

async function quickAssign() {
  if (!quickModal.value.selected) return
  quickModal.value.assigning  = true
  quickModal.value.successMsg = ''
  quickModal.value.errorMsg   = ''
  try {
    await api.post(`/abstracts/${quickModal.value.abstract.id}/assign-reviewer`, {
      reviewer_id: quickModal.value.selected.id,
    })
    quickModal.value.successMsg = `${quickModal.value.selected.firstname} ${quickModal.value.selected.lastname} assigned.`
    quickModal.value.selected   = null
    quickModal.value.search     = ''
    // Refresh abstract in list
    const fresh = await api.get(`/abstracts/${quickModal.value.abstract.id}`)
    const idx = abstracts.value.findIndex(a => a.id === quickModal.value.abstract.id)
    if (idx !== -1) { abstracts.value[idx] = fresh.data; quickModal.value.abstract = fresh.data }
  } catch (e) {
    quickModal.value.errorMsg = e.response?.data?.detail || 'Failed to assign reviewer.'
  } finally {
    quickModal.value.assigning = false
  }
}

async function quickRemove(reviewerId) {
  if (!confirm('Remove this reviewer?')) return
  await api.delete(`/abstracts/${quickModal.value.abstract.id}/reviewers/${reviewerId}`)
  const fresh = await api.get(`/abstracts/${quickModal.value.abstract.id}`)
  const idx = abstracts.value.findIndex(a => a.id === quickModal.value.abstract.id)
  if (idx !== -1) { abstracts.value[idx] = fresh.data; quickModal.value.abstract = fresh.data }
}

// ── Bulk-assign modal (multiple abstracts × multiple reviewers) ──────────────
const bulkModal = ref({
  open: false,
  search: '', reviewers: [],
  assigning: false, done: false,
  progress: 0, total: 0, results_log: [],
})
const bulkDropdownOpen = ref(false)

const bulkStatusModal = ref({
  open: false, status: 'accepted',
  updating: false, done: false,
  progress: 0, total: 0, results_log: [],
})

function openBulkStatusModal() {
  bulkStatusModal.value = {
    open: true, status: 'accepted',
    updating: false, done: false,
    progress: 0, total: 0, results_log: [],
  }
}

async function runBulkStatusChange() {
  const abstractIds = [...selectedIds.value]
  const newStatus = bulkStatusModal.value.status
  if (!abstractIds.length) return

  bulkStatusModal.value.updating = true
  bulkStatusModal.value.done = false
  bulkStatusModal.value.progress = 0
  bulkStatusModal.value.total = abstractIds.length
  bulkStatusModal.value.results_log = []

  for (const id of abstractIds) {
    try {
      await api.put(`/abstracts/${id}/status`, { status: newStatus })
      bulkStatusModal.value.results_log.push({ key: id, ok: true })
    } catch (e) {
      bulkStatusModal.value.results_log.push({ key: id, ok: false, msg: e.response?.data?.detail || 'failed' })
    }
    bulkStatusModal.value.progress++
  }

  bulkStatusModal.value.updating = false
  bulkStatusModal.value.done = true
  selectedItems.value = new Map()
  fetchAbstracts()
}

const selectedAbstracts = computed(() => [...selectedItems.value.values()])

// Reviewers filtered for bulk-assign: match search + not already chip-selected
const bulkFilteredReviewers = computed(() => {
  const q = (bulkModal.value.search || '').toLowerCase().trim()
  return allReviewers.value.filter(u => {
    if (!q) return true
    return `${u.firstname || ''} ${u.lastname || ''} ${u.email || ''}`.toLowerCase().includes(q)
  })
})

function openBulkModal() {
  bulkModal.value = {
    open: true,
    search: '', reviewers: [],
    assigning: false, done: false,
    progress: 0, total: 0, results_log: [],
  }
  bulkDropdownOpen.value = false
  loadAllReviewers()
}

function addBulkReviewer(u) {
  if (bulkModal.value.reviewers.find(r => r.id === u.id)) return
  bulkModal.value.reviewers.push(u)
  bulkModal.value.search = ''
}

function removeBulkReviewer(id) {
  bulkModal.value.reviewers = bulkModal.value.reviewers.filter(r => r.id !== id)
}

async function runBulkAssign() {
  const abstractIds = [...selectedIds.value]  // selectedIds is now a computed Set
  const reviewers   = bulkModal.value.reviewers
  if (!abstractIds.length || !reviewers.length) return

  bulkModal.value.assigning   = true
  bulkModal.value.done        = false
  bulkModal.value.progress    = 0
  bulkModal.value.total       = reviewers.length
  bulkModal.value.results_log = []

  // One request per reviewer — backend sends a single consolidated email per reviewer
  for (const r of reviewers) {
    try {
      const res = await api.post('/abstracts/bulk-assign-reviewer', {
        reviewer_id:  r.id,
        abstract_ids: abstractIds,
      })
      const { assigned, skipped } = res.data
      bulkModal.value.results_log.push({
        key: r.id, ok: true,
        msg: `${r.firstname} ${r.lastname}: ${assigned} assigned${skipped.length ? `, ${skipped.length} skipped` : ''} — 1 email sent`,
      })
    } catch (e) {
      bulkModal.value.results_log.push({
        key: r.id, ok: false,
        msg: `${r.firstname} ${r.lastname}: ${e.response?.data?.detail || 'failed'}`,
      })
    }
    bulkModal.value.progress++
  }

  bulkModal.value.assigning = false
  bulkModal.value.done      = true
  selectedItems.value = new Map()
  fetchAbstracts()
}

// ── Row/page selection helpers ───────────────────────────────────────────────
function toggleRow(abs) {
  const m = new Map(selectedItems.value)
  m.has(abs.id) ? m.delete(abs.id) : m.set(abs.id, abs)
  selectedItems.value = m
}

function toggleSelectAll() {
  const m = new Map(selectedItems.value)
  const allOnPage = abstracts.value.every(a => m.has(a.id))
  if (allOnPage) {
    abstracts.value.forEach(a => m.delete(a.id))
  } else {
    abstracts.value.forEach(a => m.set(a.id, a))
  }
  selectedItems.value = m
}

function goToPage(p) {
  if (p < 1 || p > totalPages.value || p === page.value) return
  page.value = p
}

// ── Data / filters ───────────────────────────────────────────────────────────
async function fetchAbstracts() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    params.set('skip',  String((page.value - 1) * pageSize))
    params.set('limit', String(pageSize))
    if (filterEvent.value)   params.set('event_id',          filterEvent.value)
    if (filterStatus.value)  params.set('status',            filterStatus.value)
    filterTracks.value.forEach(id => params.append('track_id', id))
    if (filterType.value)    params.set('presentation_type', filterType.value)
    if (debouncedSearch.value.trim()) params.set('search',   debouncedSearch.value.trim())
    const res = await api.get(`/abstracts/?${params}`)
    abstracts.value = res.data.data  || []
    total.value     = res.data.total ?? 0
  } finally {
    loading.value = false
  }
}

// ── Persist filters/pagination in the URL so returning to this page (e.g. via
// back navigation from an abstract's detail page) restores the same view ──
let restoringFromUrl = false

function syncFiltersToUrl() {
  if (restoringFromUrl) return
  const query = {}
  if (debouncedSearch.value.trim()) query.search = debouncedSearch.value.trim()
  if (filterEvent.value)      query.event_id = String(filterEvent.value)
  if (filterStatus.value)     query.status = filterStatus.value
  if (filterTracks.value.length) query.track_id = filterTracks.value.map(String)
  if (filterType.value)       query.presentation_type = filterType.value
  if (page.value > 1)         query.page = String(page.value)
  router.replace({ query })
}

// Reset to page 1 and refetch when any filter changes
function applyFilterChange() {
  if (restoringFromUrl) return
  page.value = 1
  syncFiltersToUrl()
  fetchAbstracts()
}

// Dropdown filters react immediately…
watch([filterEvent, filterStatus, filterTracks, filterType], applyFilterChange)

// …but free-text search waits until typing settles, so we don't refetch on every keystroke.
// (A separate settled ref, rather than debouncing the watch callback itself, matches the
// working pattern on the Registrations page.)
const debouncedSearch = ref('')
const updateDebouncedSearch = debounce((val) => { debouncedSearch.value = val }, 300)
watch(search, updateDebouncedSearch)
watch(debouncedSearch, applyFilterChange)

watch(page, () => {
  if (restoringFromUrl) return
  syncFiltersToUrl()
  fetchAbstracts()
})

onMounted(async () => {
  restoringFromUrl = true
  if (route.query.search)             { search.value = route.query.search; debouncedSearch.value = route.query.search }
  if (route.query.event_id)           filterEvent.value = Number(route.query.event_id)
  if (route.query.status)             filterStatus.value = route.query.status
  if (route.query.track_id)           filterTracks.value = (Array.isArray(route.query.track_id) ? route.query.track_id : [route.query.track_id]).map(Number)
  if (route.query.presentation_type)  filterType.value = route.query.presentation_type
  if (route.query.page)               page.value = Number(route.query.page) || 1
  await nextTick()
  restoringFromUrl = false

  try {
    const [evRes, trackRes] = await Promise.all([
      api.get('/events/?skip=0&limit=200'),
      api.get('/abstracts/tracks/list'),
    ])
    events.value = evRes.data.data || []
    tracks.value = trackRes.data   || []
  } catch (_) {}

  await fetchAbstracts()
})

const exportExcel = async () => {
  exporting.value = true
  try {
    const params = new URLSearchParams()
    if (filterEvent.value)   params.append('event_id',          filterEvent.value)
    if (filterStatus.value)  params.append('status',            filterStatus.value)
    filterTracks.value.forEach(id => params.append('track_id', id))
    if (filterType.value)    params.append('presentation_type', filterType.value)
    if (search.value.trim()) params.append('search',            search.value.trim())
    const res = await api.get(`/abstracts/export?${params.toString()}`, { responseType: 'blob' })
    const parts = ['abstracts']
    if (filterStatus.value) parts.push(filterStatus.value.replace('_', '-'))
    if (filterTracks.value.length) {
      const codes = filterTracks.value.map(id => tracks.value.find(t => t.id === id)?.code || id)
      parts.push(codes.join('+').replace(/\s+/g, '-'))
    }
    if (filterType.value) parts.push(filterType.value)
    if (search.value.trim()) parts.push(search.value.trim().slice(0, 20).replace(/\s+/g, '-'))
    parts.push(new Date().toISOString().slice(0, 10))
    const url = URL.createObjectURL(new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }))
    const a = document.createElement('a')
    a.href = url; a.download = `${parts.join('_')}.xlsx`; a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    alert('Export failed. Please try again.')
  } finally {
    exporting.value = false
  }
}

const exportPdf = async () => {
  exportingPdf.value = true
  try {
    const params = new URLSearchParams()
    if (filterEvent.value)  params.append('event_id', filterEvent.value)
    if (filterStatus.value) params.append('status',   filterStatus.value)
    const res = await api.get(`/abstracts/export/pdf?${params.toString()}`, { responseType: 'blob' })
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `book_of_abstracts_${new Date().toISOString().slice(0, 10)}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    alert('PDF export failed. Please try again.')
  } finally {
    exportingPdf.value = false
  }
}

const deleteAbstract = async (abs) => {
  if (!confirm(`Delete "${abs.title}"? This cannot be undone.`)) return
  try {
    await api.delete(`/abstracts/${abs.id}`)
    abstracts.value = abstracts.value.filter(a => a.id !== abs.id)
    total.value = Math.max(0, total.value - 1)
    const m = new Map(selectedItems.value); m.delete(abs.id); selectedItems.value = m
  } catch (e) {
    alert(e.response?.data?.detail || 'Failed to delete abstract')
  }
}

// Server already filters — paginated is just the current page from the API
const paginated  = computed(() => abstracts.value)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

// Smart page number list: 1 … 4 5 6 … 12
const pageNumbers = computed(() => {
  const tp = totalPages.value
  const p  = page.value
  if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1)
  const pages = new Set([1, tp, p, p - 1, p + 1].filter(n => n >= 1 && n <= tp))
  const sorted = [...pages].sort((a, b) => a - b)
  const result = []
  let prev = 0
  for (const n of sorted) {
    if (n - prev > 1) result.push('...')
    result.push(n)
    prev = n
  }
  return result
})

// Close track picker on outside click
function handleOutsideClick(e) {
  if (trackPickerRef.value && !trackPickerRef.value.contains(e.target)) {
    trackPickerOpen.value = false
  }
  if (notifDropdownRef.value && !notifDropdownRef.value.contains(e.target)) {
    notifDropdownOpen.value = false
  }
}
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
onMounted(() => document.addEventListener('click', handleOutsideClick))

const statusClass = (s) => ({
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  revision_required: 'bg-orange-100 text-orange-700',
}[s] || 'bg-gray-100 text-gray-600')

// ── Templates modal ──────────────────────────────────────────────────────────
const tmplModal = ref({
  open: false, loading: false, uploading: false,
  name: '', eventId: null, ptype: '', file: null, error: '',
  templates: [],
})

const openTemplates = async () => {
  tmplModal.value.open = true
  tmplModal.value.loading = true
  tmplModal.value.error = ''
  try {
    const res = await api.get('/events/templates')
    tmplModal.value.templates = res.data
  } catch (e) {
    tmplModal.value.error = e.response?.data?.detail || 'Failed to load templates'
  }
  finally { tmplModal.value.loading = false }
}

const uploadTemplate = async () => {
  const m = tmplModal.value
  m.error = ''
  m.uploading = true
  try {
    const fd = new FormData()
    fd.append('file', m.file)
    fd.append('name', m.name)
    if (m.eventId) fd.append('event_id', m.eventId)
    if (m.ptype)   fd.append('presentation_type', m.ptype)
    const res = await api.post('/events/templates/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    m.templates.unshift(res.data)
    m.name = ''; m.file = null; m.ptype = ''; m.eventId = null
  } catch (e) {
    m.error = e.response?.data?.detail || 'Upload failed'
  } finally { m.uploading = false }
}

const deleteTemplate = async (t) => {
  if (!confirm(`Delete "${t.name}"?`)) return
  try {
    await api.delete(`/events/templates/${t.id}`)
    tmplModal.value.templates = tmplModal.value.templates.filter(x => x.id !== t.id)
  } catch (_) {}
}

// ── Edit template (name/event/type) ──────────────────────────────────────────
const editTemplate = ref({ id: null, name: '', eventId: null, ptype: '', saving: false, error: '' })

const openTemplateEdit = (t) => {
  editTemplate.value = {
    id: t.id, name: t.name, eventId: t.event_id || null, ptype: t.presentation_type || '',
    saving: false, error: '',
  }
}

const saveTemplateEdit = async () => {
  const e = editTemplate.value
  e.saving = true
  e.error = ''
  try {
    const res = await api.patch(`/events/templates/${e.id}`, {
      name: e.name, event_id: e.eventId || 0, presentation_type: e.ptype || '',
    })
    const idx = tmplModal.value.templates.findIndex(x => x.id === e.id)
    if (idx !== -1) tmplModal.value.templates[idx] = res.data
    editTemplate.value.id = null
  } catch (err) {
    e.error = err.response?.data?.detail || 'Failed to save'
  } finally {
    e.saving = false
  }
}

// ── All Presentations modal ──────────────────────────────────────────────────
const presentationsModal = ref({
  open: false, loading: false, eventId: null, items: [],
})

const openPresentations = async () => {
  presentationsModal.value.open = true
  await loadPresentations()
}

const loadPresentations = async () => {
  presentationsModal.value.loading = true
  try {
    const params = presentationsModal.value.eventId ? { event_id: presentationsModal.value.eventId } : {}
    const res = await api.get('/abstracts/presentations', { params })
    presentationsModal.value.items = res.data.map(p => ({ ...p, _expanded: false }))
  } catch (_) {
    presentationsModal.value.items = []
  } finally {
    presentationsModal.value.loading = false
  }
}

// ── Notify Template (per-template dispatch) modal ───────────────────────────
const notifyTemplateModal = ref({
  open: false, loading: false, sending: false, done: false, error: '',
  template: null, preview: null, eventId: null,
})

const openNotifyTemplate = async (t) => {
  notifyTemplateModal.value = {
    open: true, loading: true, sending: false, done: false, error: '',
    template: t, preview: null, eventId: t.event_id || null,
  }
  await loadNotifyTemplatePreview()
}

const loadNotifyTemplatePreview = async () => {
  const m = notifyTemplateModal.value
  m.loading = true
  m.error = ''
  try {
    const params = m.eventId ? { event_id: m.eventId } : {}
    const res = await api.get(`/events/templates/${m.template.id}/notify-preview`, { params })
    m.preview = res.data
    if (res.data.needs_event) m.eventId = null
  } catch (e) {
    m.error = e.response?.data?.detail || 'Failed to load recipients'
  } finally {
    m.loading = false
  }
}

const sendNotifyTemplate = async () => {
  const m = notifyTemplateModal.value
  m.sending = true
  m.error = ''
  try {
    await api.post(`/events/templates/${m.template.id}/notify`, m.eventId ? { event_id: m.eventId } : {})
    m.done = true
    m.preview.already_notified = [...m.preview.already_notified, ...m.preview.to_send]
    m.preview.to_send = []
  } catch (e) {
    m.error = e.response?.data?.detail || 'Failed to send notifications'
  } finally {
    m.sending = false
  }
}

// ── Reports slide-over ───────────────────────────────────────────────────────
const reportsOpen    = ref(false)
const reportsEventId = ref(null)

const openReports = () => {
  reportsEventId.value = filterEvent.value ? Number(filterEvent.value) : null
  reportsOpen.value = true
}

// ── Notify Accepted Authors ──────────────────────────────────────────────────
const notifyModal = ref({
  open: false,
  singleAbstract: null,
  eventId: null,
  portalUrl: 'https://events.ecsahc.org',
  skipNotified: true,
  testEmail: '',
  sending: false,
  done: false,
  result: { sent: 0, failed: 0 },
  error: '',
})

const openNotifySingle = (abs) => {
  const m = notifyModal.value
  m.singleAbstract = abs
  m.eventId = null
  m.testEmail = ''
  m.done = false
  m.error = ''
  m.result = { sent: 0, failed: 0 }
  m.open = true
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

// ── Registration Reminder (for accepted abstract authors who haven't registered) ─
const regReminderModal = ref({
  open: false,
  step: 'select',   // 'select' | 'preview' | 'done'
  eventId: null,
  loading: false,
  sending: false,
  preview: { event_name: '', to_send: [], already_registered: [], total_authors: 0 },
  result: { sent: 0, total_authors: 0, already_registered: 0 },
  error: '',
})

const openRegReminder = () => {
  const m = regReminderModal.value
  m.step = 'select'
  m.eventId = filterEvent.value ? Number(filterEvent.value) : null
  m.loading = false
  m.sending = false
  m.preview = { event_name: '', to_send: [], already_registered: [], total_authors: 0 }
  m.result = { sent: 0, total_authors: 0, already_registered: 0 }
  m.error = ''
  m.open = true
}

const loadRegReminderPreview = async () => {
  const m = regReminderModal.value
  if (!m.eventId) { m.error = 'Please select an event.'; return }
  m.loading = true
  m.error = ''
  try {
    const res = await api.get(`/abstracts/registration-reminder-preview?event_id=${m.eventId}`)
    m.preview = res.data
    m.step = 'preview'
  } catch (e) {
    m.error = e.response?.data?.detail || 'Failed to load preview. Please try again.'
  } finally {
    m.loading = false
  }
}

const runRegReminder = async () => {
  const m = regReminderModal.value
  m.sending = true
  m.error = ''
  try {
    const res = await api.post(`/abstracts/send-registration-reminders?event_id=${m.eventId}`)
    m.result = { sent: res.data.sent, total_authors: res.data.total_authors, already_registered: res.data.already_registered }
    m.step = 'done'
  } catch (e) {
    m.error = e.response?.data?.detail || 'Failed to send reminders. Please try again.'
  } finally {
    m.sending = false
  }
}

// ── Notify Rejected Authors ──────────────────────────────────────────────────
const rejectNotifyModal = ref({
  open: false,
  step: 'select',   // 'select' | 'preview' | 'done'
  eventId: null,
  loading: false,
  sending: false,
  preview: { event_name: '', to_send: [], already_notified: [], total_rejected_abstracts: 0, total_recipients: 0 },
  result: { sent: 0 },
  error: '',
})

const openRejectNotify = () => {
  const m = rejectNotifyModal.value
  m.step = 'select'
  m.eventId = filterEvent.value ? Number(filterEvent.value) : null
  m.loading = false
  m.sending = false
  m.preview = { event_name: '', to_send: [], already_notified: [], total_rejected_abstracts: 0, total_recipients: 0 }
  m.result = { sent: 0 }
  m.error = ''
  m.open = true
}

const loadRejectNotifyPreview = async () => {
  const m = rejectNotifyModal.value
  if (!m.eventId) { m.error = 'Please select an event.'; return }
  m.loading = true
  m.error = ''
  try {
    const res = await api.get(`/abstracts/rejection-notify-preview?event_id=${m.eventId}`)
    m.preview = res.data
    m.step = 'preview'
  } catch (e) {
    m.error = e.response?.data?.detail || 'Failed to load preview. Please try again.'
  } finally {
    m.loading = false
  }
}

const runRejectNotify = async () => {
  const m = rejectNotifyModal.value
  m.sending = true
  m.error = ''
  try {
    const res = await api.post('/abstracts/notify-rejection', { event_id: m.eventId })
    m.result = { sent: res.data.sent }
    m.step = 'done'
  } catch (e) {
    m.error = e.response?.data?.detail || 'Failed to send notifications. Please try again.'
  } finally {
    m.sending = false
  }
}

const runNotifyAccepted = async () => {
  const m = notifyModal.value
  m.sending = true
  m.error = ''
  try {
    const payload = { portal_url: m.portalUrl }
    if (m.singleAbstract) {
      payload.abstract_ids = [m.singleAbstract.id]
    } else {
      if (m.eventId) payload.event_id = m.eventId
      payload.skip_notified = m.skipNotified
    }
    if (m.testEmail) payload.test_email = m.testEmail
    const res = await api.post('/abstracts/notify-acceptance', payload)
    m.result = { sent: res.data.sent, failed: res.data.failed }
    m.done = true
    // Disable the notify button immediately for the notified abstract
    if (m.singleAbstract && !m.testEmail) {
      m.singleAbstract.acceptance_notified_at = new Date().toISOString()
    }
  } catch (e) {
    m.error = e.response?.data?.detail || 'Failed to send notifications. Please try again.'
  } finally {
    m.sending = false
  }
}
</script>
