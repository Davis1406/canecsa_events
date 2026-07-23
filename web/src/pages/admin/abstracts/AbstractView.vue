<template>
  <!-- height:100vh is self-contained — does NOT depend on parent layout -->
  <div class="flex flex-col w-full max-w-7xl mx-auto px-6 pb-6 pt-6 overflow-hidden" style="height:100vh;">

    <!-- Header — fixed height, never scrolls -->
    <div class="flex items-center gap-4 mb-5 flex-shrink-0">
      <button @click="goBackToList" class="text-gray-400 hover:text-gray-700 flex-shrink-0">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1 class="text-xl font-semibold text-black flex-1 truncate">{{ abstract?.title }}</h1>
      <span v-if="abstract" :class="statusClass(abstract.status)"
        class="px-3 py-1 rounded-full text-sm font-semibold capitalize flex-shrink-0">
        {{ abstract.status?.replace('_', ' ') }}
      </span>
      <button v-if="abstract" @click="openEdit"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition flex-shrink-0"
        style="color:#1a1d56; border-color:#b3e4f0; background-color:#e6f7fb;">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
        Edit
      </button>
      <button v-if="abstract" @click="deleteAbstract"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition flex-shrink-0">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
        Delete
      </button>
    </div>

    <div v-if="loading" class="text-gray-500 text-center py-20 flex-1">Loading...</div>

    <!-- flex-1 min-h-0 fills remaining height inside the 100vh outer div -->
    <div v-else-if="abstract"
      class="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-3 gap-6 overflow-hidden">

      <!-- ────────────────────────────────────────────────────────────────────
           LEFT — Management panel (1/3) — scrolls independently
      ─────────────────────────────────────────────────────────────────────── -->
      <div class="xl:col-span-1 overflow-y-auto space-y-5 order-2 xl:order-1 pb-4" style="min-height:0;">

        <!-- Update Status -->
        <div class="bg-white rounded-2xl shadow p-5">
          <h2 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Update Status</h2>
          <select v-model="newStatus" class="input w-full mb-3">
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="revision_required">Revision Required</option>
          </select>
          <button @click="updateStatus"
            class="w-full px-4 py-2 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition"
            style="background-color:#1a1d56;">
            Save Status
          </button>
          <p v-if="statusMsg" class="mt-2 text-green-600 text-xs text-center">{{ statusMsg }}</p>
        </div>

        <!-- Reviewers panel -->
        <div class="bg-white rounded-2xl shadow p-5">
          <h2 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            Reviewers
            <span v-if="abstract.reviewer_assignments.length"
              class="text-xs px-2 py-0.5 rounded-full font-semibold"
              style="background-color:#e6f7fb; color:#1a1d56;">
              {{ abstract.reviewer_assignments.length }}
            </span>
          </h2>

          <!-- Currently assigned -->
          <div v-if="abstract.reviewer_assignments.length" class="mb-4 space-y-2">
            <div v-for="ra in abstract.reviewer_assignments" :key="ra.id"
              class="flex items-start justify-between px-3 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-100">
              <div class="min-w-0 flex-1">
                <p class="font-medium text-gray-800 truncate">{{ ra.reviewer_name }}</p>
                <p class="text-gray-400 text-xs truncate">{{ ra.reviewer_email }}</p>
              </div>
              <div class="flex flex-col items-end gap-1.5 ml-2 flex-shrink-0">
                <span :class="ra.completed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'"
                  class="px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">
                  {{ ra.completed ? '✓ Reviewed' : '⏳ Pending' }}
                </span>
                <button @click="removeReviewer(ra.reviewer_id)"
                  class="text-red-400 hover:text-red-600 text-xs font-medium">Remove</button>
              </div>
            </div>
          </div>
          <p v-else class="text-xs text-gray-400 italic mb-4">No reviewers assigned yet.</p>

          <!-- ── Reviewer dropdown (loaded from all users, not free-text) ── -->
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Add Reviewer
          </label>

          <!-- Custom dropdown trigger -->
          <div class="relative" ref="dropdownWrap">
            <button type="button" @click="toggleDropdown"
              class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm text-left transition-colors"
              :class="dropdownOpen
                ? 'border-[#1a1d56] ring-2 ring-[#1a1d56]/20'
                : 'border-gray-200 hover:border-[#1a1d56]/40'">
              <span v-if="selectedReviewer" class="font-medium text-gray-800 truncate">
                {{ selectedReviewer.firstname }} {{ selectedReviewer.lastname }}
              </span>
              <span v-else class="text-gray-400">Select a reviewer…</span>
              <svg class="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ml-2"
                :class="dropdownOpen ? 'rotate-180' : ''"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            <!-- Dropdown panel -->
            <div v-if="dropdownOpen"
              class="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 flex flex-col"
              style="max-height:220px;">
              <!-- Filter input -->
              <div class="flex items-center gap-2 px-3 py-2 border-b border-gray-100 flex-shrink-0">
                <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/>
                </svg>
                <input v-model="reviewerFilter" ref="filterInputRef" type="text"
                  placeholder="Filter by name or email…"
                  class="flex-1 text-sm outline-none bg-transparent placeholder-gray-400" />
                <button v-if="reviewerFilter" @click="reviewerFilter = ''"
                  class="text-gray-300 hover:text-gray-500">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <!-- List -->
              <div class="overflow-y-auto flex-1">
                <div v-if="usersLoading" class="px-4 py-3 text-xs text-gray-400 text-center">Loading users…</div>
                <div v-else-if="filteredUsers.length === 0"
                  class="px-4 py-3 text-xs text-gray-400 text-center">No users found</div>
                <div v-for="u in filteredUsers" :key="u.id"
                  @click="selectReviewer(u)"
                  class="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors text-sm"
                  :class="selectedReviewer?.id === u.id
                    ? 'bg-[#e6f7fb]'
                    : 'hover:bg-gray-50'">
                  <!-- Avatar initials -->
                  <div class="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style="background-color:#1a1d56;">
                    {{ u.firstname?.[0]?.toUpperCase() }}{{ u.lastname?.[0]?.toUpperCase() }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-medium text-gray-800 truncate">{{ u.firstname }} {{ u.lastname }}</p>
                    <p class="text-xs text-gray-400 truncate">{{ u.email }}</p>
                  </div>
                  <svg v-if="selectedReviewer?.id === u.id"
                    class="w-4 h-4 flex-shrink-0" style="color:#1a1d56;"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Selected chip -->
          <div v-if="selectedReviewer"
            class="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl border text-sm"
            style="background-color:#e6f7fb; border-color:#b3e4f0;">
            <span class="font-semibold flex-1 truncate" style="color:#006f87;">
              {{ selectedReviewer.firstname }} {{ selectedReviewer.lastname }}
            </span>
            <span class="text-xs truncate" style="color:#1a1d56;">{{ selectedReviewer.email }}</span>
            <button @click="selectedReviewer = null"
              class="flex-shrink-0 hover:text-red-400 transition-colors" style="color:#1a1d56;">✕</button>
          </div>

          <button @click="assignReviewer" :disabled="!selectedReviewer || assigning"
            class="mt-3 w-full px-4 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
            style="background-color:#1a1d56;">
            <svg v-if="assigning" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            {{ assigning ? 'Assigning…' : 'Assign Reviewer' }}
          </button>
          <p v-if="assignMsg" class="mt-2 text-green-600 text-xs text-center">{{ assignMsg }}</p>
          <p v-if="assignErr" class="mt-2 text-red-500 text-xs text-center">{{ assignErr }}</p>
        </div>

      </div>

      <!-- ────────────────────────────────────────────────────────────────────
           RIGHT — Abstract content (2/3) — scrolls independently
      ─────────────────────────────────────────────────────────────────────── -->
      <div class="xl:col-span-2 overflow-y-auto space-y-5 order-1 xl:order-2 pr-1 pb-4" style="min-height:0;">

        <!-- Meta row -->
        <div class="bg-white rounded-2xl shadow p-6 grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span class="text-gray-400 text-xs uppercase tracking-wide">Event</span>
            <p class="font-medium mt-1">{{ abstract.event }}</p>
          </div>
          <div class="sm:col-span-3">
            <span class="text-gray-400 text-xs uppercase tracking-wide">Track</span>
            <div class="mt-1">
              <span v-if="abstract.track_code"
                class="inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full border mr-2"
                style="background-color:#e6f7fb; color:#006f87; border-color:#b3e4f0;">
                {{ abstract.track_code }}
              </span>
              <span class="font-medium text-sm">{{ abstract.track_title || abstract.track || '—' }}</span>
              <p v-if="abstract.track_theme" class="text-xs text-gray-400 mt-0.5 italic">{{ abstract.track_theme }}</p>
            </div>
          </div>
          <div>
            <span class="text-gray-400 text-xs uppercase tracking-wide">Presentation Type</span>
            <p class="font-medium capitalize mt-1">{{ abstract.presentation_type }}</p>
          </div>
          <div>
            <span class="text-gray-400 text-xs uppercase tracking-wide">Words</span>
            <p class="font-medium mt-1">{{ abstract.word_count }}</p>
          </div>
          <div>
            <span class="text-gray-400 text-xs uppercase tracking-wide">Submitted by</span>
            <p class="font-medium mt-1">{{ abstract.submitter_name }}</p>
          </div>
          <div>
            <span class="text-gray-400 text-xs uppercase tracking-wide">Submitted on</span>
            <p class="font-medium mt-1">{{ formatDate(abstract.created_at) }}</p>
          </div>
        </div>

        <!-- Authors -->
        <div class="bg-white rounded-2xl shadow p-6">
          <h2 class="font-semibold text-gray-800 mb-4">Authors & Co-Authors</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th class="px-3 py-2 text-left">#</th>
                  <th class="px-3 py-2 text-left">Name</th>
                  <th class="px-3 py-2 text-left hidden md:table-cell">Email</th>
                  <th class="px-3 py-2 text-left hidden lg:table-cell">Affiliation</th>
                  <th class="px-3 py-2 text-left hidden md:table-cell">Country</th>
                  <th class="px-3 py-2 text-left">Presenting</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(au, i) in abstract.authors" :key="au.id">
                  <td class="px-3 py-2 text-gray-400">{{ i + 1 }}</td>
                  <td class="px-3 py-2 font-medium">{{ au.firstname }} {{ au.lastname }}</td>
                  <td class="px-3 py-2 text-gray-500 hidden md:table-cell">{{ au.email || '—' }}</td>
                  <td class="px-3 py-2 text-gray-500 hidden lg:table-cell">{{ au.affiliation || '—' }}</td>
                  <td class="px-3 py-2 text-gray-500 hidden md:table-cell">{{ au.country || '—' }}</td>
                  <td class="px-3 py-2">
                    <span v-if="au.is_presenting"
                      class="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">Yes</span>
                    <span v-else class="text-gray-300 text-xs">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Abstract Text -->
        <div class="bg-white rounded-2xl shadow p-6">
          <h2 class="font-semibold text-gray-800 mb-3">Abstract</h2>
          <p class="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">{{ abstract.abstract_text }}</p>
          <div v-if="abstract.keywords" class="mt-4 text-xs text-gray-500">
            <strong class="text-gray-700">Keywords:</strong> {{ abstract.keywords }}
          </div>
        </div>

        <!-- Completed reviews -->
        <div v-if="completedReviews.length" class="bg-white rounded-2xl shadow p-6">
          <h2 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            Reviews
            <span class="text-xs px-2 py-0.5 rounded-full font-medium"
              style="background-color:#e6f7fb; color:#1a1d56;">
              {{ completedReviews.length }}
            </span>
          </h2>
          <div class="space-y-4">
            <div v-for="ra in completedReviews" :key="ra.id" class="border border-gray-100 rounded-xl p-4">
              <div class="flex items-center justify-between mb-3">
                <p class="font-medium text-sm">{{ ra.reviewer_name }}</p>
                <span :class="recClass(ra.review.recommendation)"
                  class="px-2 py-0.5 rounded-full text-xs font-semibold capitalize">
                  {{ ra.review.recommendation?.replace('_', ' ') }}
                </span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <div class="bg-gray-50 rounded-lg p-2 text-center">
                  <p class="text-xs text-gray-400">Relevance</p>
                  <p class="text-lg font-bold" style="color:#1a1d56;">{{ ra.review.relevance_score }}<span class="text-xs text-gray-400">/5</span></p>
                </div>
                <div class="bg-gray-50 rounded-lg p-2 text-center">
                  <p class="text-xs text-gray-400">Methodology</p>
                  <p class="text-lg font-bold" style="color:#1a1d56;">{{ ra.review.methodology_score }}<span class="text-xs text-gray-400">/5</span></p>
                </div>
                <div class="bg-gray-50 rounded-lg p-2 text-center">
                  <p class="text-xs text-gray-400">Originality</p>
                  <p class="text-lg font-bold" style="color:#1a1d56;">{{ ra.review.originality_score }}<span class="text-xs text-gray-400">/5</span></p>
                </div>
                <div class="bg-gray-50 rounded-lg p-2 text-center">
                  <p class="text-xs text-gray-400">Overall</p>
                  <p class="text-lg font-bold" style="color:#1a1d56;">{{ ra.review.overall_score }}<span class="text-xs text-gray-400">/5</span></p>
                </div>
              </div>
              <p class="text-sm text-gray-700 leading-relaxed">{{ ra.review.comments }}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- ── Edit Abstract Modal ────────────────────────────────────────────── -->
  <div v-if="editModal.open"
    class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    @click.self="editModal.open = false">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh]">

      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
        <h2 class="font-bold text-gray-800">Edit Abstract</h2>
        <button @click="editModal.open = false" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="overflow-y-auto flex-1 px-6 py-5 space-y-5">

        <!-- Title -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Title <span class="text-red-500">*</span></label>
          <input v-model="editForm.title" type="text" required
            class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1d56]" />
        </div>

        <!-- Track -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Scientific Track</label>
          <select v-model.number="editForm.track_id"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1d56]">
            <option :value="null">— No track —</option>
            <option v-for="t in allTracks" :key="t.id" :value="t.id">{{ t.code }}: {{ t.title }}</option>
          </select>
        </div>

        <!-- Presentation type -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Presentation Type</label>
          <div class="flex gap-4 flex-wrap">
            <label v-for="opt in ['oral','poster','either']" :key="opt"
              class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer capitalize">
              <input type="radio" v-model="editForm.presentation_type" :value="opt" class="accent-[#1a1d56]" />
              {{ opt }}
            </label>
          </div>
        </div>

        <!-- Abstract text -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Abstract Body <span class="text-red-500">*</span>
            <span class="ml-1 font-normal text-gray-400 normal-case">(max 300 words)</span>
          </label>
          <textarea v-model="editForm.abstract_text" rows="8" required
            class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1d56] resize-y"></textarea>
          <p :class="editWordCount > 300 ? 'text-red-500' : 'text-gray-400'" class="text-xs mt-1 text-right">
            {{ editWordCount }} / 300 words<span v-if="editWordCount > 300" class="ml-1 font-semibold"> — over limit!</span>
          </p>
        </div>

        <!-- Keywords -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Keywords <span class="text-gray-400 font-normal normal-case">(comma-separated)</span></label>
          <input v-model="editForm.keywords" type="text"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1d56]" />
        </div>

        <!-- Authors -->
        <div class="border border-gray-200 rounded-xl p-4 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-gray-800 text-sm">Authors & Co-Authors</h3>
            <button type="button" @click="addEditAuthor"
              class="text-sm text-white px-3 py-1.5 rounded-lg font-medium hover:opacity-90"
              style="background-color:#1a1d56;">+ Add Co-Author</button>
          </div>
          <div v-for="(author, idx) in editForm.authors" :key="idx"
            class="bg-gray-50 rounded-xl p-4 space-y-3">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {{ idx === 0 ? 'First Author' : `Co-Author ${idx}` }}
              </span>
              <button v-if="idx > 0" type="button" @click="editForm.authors.splice(idx, 1)"
                class="text-red-400 hover:text-red-600 text-xs font-medium">Remove</button>
            </div>
            <div class="grid gap-3 sm:grid-cols-2">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">First Name <span class="text-red-500">*</span></label>
                <input v-model="author.firstname" type="text" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1d56]" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Last Name <span class="text-red-500">*</span></label>
                <input v-model="author.lastname" type="text" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1d56]" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input v-model="author.email" type="email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1d56]" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Institution / Affiliation</label>
                <input v-model="author.affiliation" type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1d56]" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Country</label>
                <input v-model="author.country" type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1d56]" />
              </div>
              <div class="flex items-center gap-2 pt-4">
                <input type="checkbox" :id="`edit-presenting-${idx}`" v-model="author.is_presenting"
                  class="accent-[#1a1d56] w-4 h-4 cursor-pointer" />
                <label :for="`edit-presenting-${idx}`" class="text-sm text-gray-600 cursor-pointer">Presenting author</label>
              </div>
            </div>
          </div>
        </div>

        <p v-if="editModal.error" class="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {{ editModal.error }}
        </p>
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-3 px-6 py-4 border-t flex-shrink-0">
        <button @click="editModal.open = false"
          class="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">
          Cancel
        </button>
        <button @click="saveEdit" :disabled="editModal.saving || editWordCount > 300"
          class="inline-flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50 hover:opacity-90 transition"
          style="background-color:#1a1d56;">
          <svg v-if="editModal.saving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          {{ editModal.saving ? 'Saving…' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/plugins/axios'

const route  = useRoute()
const router = useRouter()

function goBackToList() {
  if (window.history.state?.back) {
    router.back()
  } else {
    router.push({ name: 'AdminAbstracts' })
  }
}

const abstract         = ref(null)
const loading          = ref(true)
const newStatus        = ref('')
const statusMsg        = ref('')

// ── Edit modal ────────────────────────────────────────────────────────────────
const allTracks = ref([])
const editModal = ref({ open: false, saving: false, error: '' })
const editForm  = ref({ title: '', abstract_text: '', keywords: '', track_id: null, presentation_type: '', authors: [] })

const editWordCount = computed(() =>
  editForm.value.abstract_text.trim() ? editForm.value.abstract_text.trim().split(/\s+/).length : 0
)

const openEdit = async () => {
  const a = abstract.value
  editForm.value = {
    title: a.title || '',
    abstract_text: a.abstract_text || '',
    keywords: a.keywords || '',
    track_id: a.track_id ?? null,
    presentation_type: a.presentation_type || 'oral',
    authors: (a.authors || []).map(au => ({
      firstname: au.firstname || '',
      lastname: au.lastname || '',
      email: au.email || '',
      affiliation: au.affiliation || '',
      country: au.country || '',
      is_presenting: !!au.is_presenting,
    })),
  }
  editModal.value = { open: true, saving: false, error: '' }
  if (!allTracks.value.length && a.event_id) {
    try {
      const res = await api.get('/abstracts/tracks/list', { params: { event_id: a.event_id } })
      allTracks.value = res.data || []
    } catch (_) {}
  }
}

const addEditAuthor = () => {
  editForm.value.authors.push({ firstname: '', lastname: '', email: '', affiliation: '', country: '', is_presenting: false })
}

const saveEdit = async () => {
  editModal.value.error = ''
  if (!editForm.value.title.trim() || !editForm.value.abstract_text.trim()) {
    editModal.value.error = 'Title and abstract body are required.'
    return
  }
  if (editWordCount.value > 300) {
    editModal.value.error = 'Abstract is over 300 words. Please shorten it.'
    return
  }
  editModal.value.saving = true
  try {
    await api.put(`/abstracts/${route.params.id}`, editForm.value)
    await fetchAbstract()
    editModal.value.open = false
  } catch (e) {
    editModal.value.error = e.response?.data?.detail || 'Failed to save changes.'
  } finally {
    editModal.value.saving = false
  }
}

// Reviewer selection
const allUsers         = ref([])
const usersLoading     = ref(false)
const selectedReviewer = ref(null)
const reviewerFilter   = ref('')
const dropdownOpen     = ref(false)
const dropdownWrap     = ref(null)
const filterInputRef   = ref(null)
const assigning        = ref(false)
const assignMsg        = ref('')
const assignErr        = ref('')

// ── Load users once on mount ─────────────────────────────────────────────────
onMounted(async () => {
  await fetchAbstract()
  loading.value = false
  loadAllUsers()
})

const loadAllUsers = async () => {
  usersLoading.value = true
  try {
    const res = await api.get('/abstracts/reviewers/candidates')
    allUsers.value = res.data || []
  } catch (_) {}
  finally { usersLoading.value = false }
}

// ── Abstract data ─────────────────────────────────────────────────────────────
const fetchAbstract = async () => {
  const res = await api.get(`/abstracts/${route.params.id}`)
  abstract.value = res.data
  newStatus.value = res.data.status
}

const completedReviews = computed(() =>
  (abstract.value?.reviewer_assignments || []).filter(ra => ra.review)
)

// ── Filtered dropdown list (excludes already assigned) ───────────────────────
const alreadyAssignedIds = computed(() =>
  new Set((abstract.value?.reviewer_assignments || []).map(ra => ra.reviewer_id))
)

const filteredUsers = computed(() => {
  const q = reviewerFilter.value.toLowerCase().trim()
  return allUsers.value
    .filter(u => !alreadyAssignedIds.value.has(u.id))
    .filter(u => !q || `${u.firstname} ${u.lastname} ${u.email}`.toLowerCase().includes(q))
})

// ── Dropdown open/close ───────────────────────────────────────────────────────
const toggleDropdown = async () => {
  dropdownOpen.value = !dropdownOpen.value
  if (dropdownOpen.value) {
    reviewerFilter.value = ''
    await nextTick()
    filterInputRef.value?.focus()
  }
}

const closeDropdown = (e) => {
  if (dropdownWrap.value && !dropdownWrap.value.contains(e.target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', closeDropdown))
onBeforeUnmount(() => document.removeEventListener('mousedown', closeDropdown))

const selectReviewer = (u) => {
  selectedReviewer.value = u
  dropdownOpen.value = false
  reviewerFilter.value = ''
}

// ── Status update ─────────────────────────────────────────────────────────────
const updateStatus = async () => {
  await api.put(`/abstracts/${route.params.id}/status`, { status: newStatus.value })
  abstract.value.status = newStatus.value
  statusMsg.value = 'Status updated!'
  setTimeout(() => statusMsg.value = '', 3000)
}

// ── Assign / remove reviewer ─────────────────────────────────────────────────
const assignReviewer = async () => {
  if (!selectedReviewer.value) return
  assigning.value = true
  assignMsg.value = ''
  assignErr.value = ''
  try {
    await api.post(`/abstracts/${route.params.id}/assign-reviewer`, {
      reviewer_id: selectedReviewer.value.id,
    })
    assignMsg.value = `${selectedReviewer.value.firstname} ${selectedReviewer.value.lastname} assigned!`
    selectedReviewer.value = null
    await fetchAbstract()
    setTimeout(() => assignMsg.value = '', 3000)
  } catch (e) {
    assignErr.value = e.response?.data?.detail || 'Failed to assign reviewer'
  } finally {
    assigning.value = false
  }
}

const removeReviewer = async (reviewerId) => {
  if (!confirm('Remove this reviewer?')) return
  await api.delete(`/abstracts/${route.params.id}/reviewers/${reviewerId}`)
  await fetchAbstract()
}

const deleteAbstract = async () => {
  if (!confirm(`Delete "${abstract.value.title}"? This cannot be undone.`)) return
  try {
    await api.delete(`/abstracts/${route.params.id}`)
    router.push({ name: 'AdminAbstracts' })
  } catch (e) {
    alert(e.response?.data?.detail || 'Failed to delete abstract')
  }
}

const formatDate  = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '—'
const statusClass = (s) => ({ submitted:'bg-blue-100 text-blue-700', under_review:'bg-yellow-100 text-yellow-700', accepted:'bg-green-100 text-green-700', rejected:'bg-red-100 text-red-700', revision_required:'bg-orange-100 text-orange-700' }[s] || 'bg-gray-100 text-gray-600')
const recClass    = (r) => ({ accept:'bg-green-100 text-green-700', reject:'bg-red-100 text-red-700', revision_required:'bg-orange-100 text-orange-700' }[r] || 'bg-gray-100 text-gray-600')
</script>
