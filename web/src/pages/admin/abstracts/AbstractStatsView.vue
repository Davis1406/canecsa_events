<template>
  <div class="space-y-6">

    <!-- KPI cards — no Eswatini card, that's shown as text in the country chart -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <div v-for="kpi in kpis" :key="kpi.label"
        class="bg-gray-50 rounded-2xl p-4 flex flex-col gap-1"
        :style="`border-top: 3px solid ${kpi.accent}`">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">{{ kpi.label }}</p>
        <p class="text-3xl font-bold" :style="`color:${kpi.accent}`">{{ kpi.value }}</p>
        <p v-if="kpi.sub" class="text-xs text-gray-400">{{ kpi.sub }}</p>
      </div>
    </div>

    <!-- Row 1: Status bars + Type donut -->
    <div class="grid lg:grid-cols-2 gap-6">

      <!-- By Status -->
      <div class="bg-gray-50 rounded-2xl p-5">
        <h3 class="font-semibold text-gray-700 mb-4 text-sm">By Status</h3>
        <div class="space-y-2.5">
          <div v-for="s in statusBars" :key="s.label" class="flex items-center gap-3">
            <span class="w-28 text-xs text-gray-500 text-right flex-shrink-0 capitalize">{{ s.label }}</span>
            <div class="flex-1 bg-white rounded-full h-5 overflow-hidden">
              <div class="h-5 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                :style="{ width: s.pct + '%', backgroundColor: s.color, minWidth: s.count ? '2rem' : '0' }">
                <span class="text-white text-xs font-bold leading-none">{{ s.count }}</span>
              </div>
            </div>
            <span class="w-8 text-xs text-gray-400 flex-shrink-0 text-right">{{ s.pct }}%</span>
          </div>
        </div>
      </div>

      <!-- Presentation type donut -->
      <div class="bg-gray-50 rounded-2xl p-5 flex flex-col">
        <h3 class="font-semibold text-gray-700 mb-4 text-sm">Presentation Type</h3>
        <div class="flex items-center justify-center gap-10 flex-1">
          <svg :viewBox="`0 0 ${D} ${D}`" class="w-36 h-36 -rotate-90">
            <circle :cx="D/2" :cy="D/2" :r="R" fill="none" stroke="#e5e7eb" :stroke-width="W" />
            <circle v-for="seg in donutSegs" :key="seg.label"
              :cx="D/2" :cy="D/2" :r="R" fill="none"
              :stroke="seg.color" :stroke-width="W"
              :stroke-dasharray="`${seg.dash} ${circumference - seg.dash}`"
              :stroke-dashoffset="-seg.offset"
              stroke-linecap="round" />
          </svg>
          <div class="space-y-3">
            <div v-for="seg in donutSegs" :key="seg.label" class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: seg.color }"></span>
              <div>
                <p class="text-sm font-bold text-gray-800">{{ seg.count }}</p>
                <p class="text-xs text-gray-400 capitalize">{{ seg.label }}</p>
              </div>
            </div>
            <div v-if="unspecifiedCount" class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-gray-300 flex-shrink-0"></span>
              <div>
                <p class="text-sm font-bold text-gray-800">{{ unspecifiedCount }}</p>
                <p class="text-xs text-gray-400">Unspecified</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Countries -->
    <div class="bg-gray-50 rounded-2xl p-5">
      <div class="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h3 class="font-semibold text-gray-700 text-sm">By Country</h3>
        <span v-if="eswatiniRow" class="text-xs px-2 py-1 rounded-full font-semibold"
          style="background:#d1fae5;color:#065f46;">
          Eswatini: {{ eswatiniRow.accepted }} accepted / {{ eswatiniRow.total }} total
        </span>
      </div>
      <div class="space-y-2 mt-3">
        <div v-for="c in visibleCountries" :key="c.country" class="flex items-center gap-3">
          <div class="w-32 sm:w-40 flex-shrink-0 flex items-center gap-1.5">
            <span v-if="isEswatini(c.country)" class="text-xs font-bold px-1.5 py-0.5 rounded"
              style="background:#d1fae5;color:#065f46;">ESW</span>
            <span class="text-xs text-gray-600 truncate">{{ c.country }}</span>
          </div>
          <div class="flex-1 flex rounded-full overflow-hidden h-4 bg-white">
            <div class="h-4 transition-all duration-500"
              :style="{ width: (c.accepted / maxCountryTotal * 100) + '%', backgroundColor: '#1a1d56', minWidth: c.accepted ? '1.2rem' : '0' }">
            </div>
            <div class="h-4 transition-all duration-500"
              :style="{ width: ((c.total - c.accepted) / maxCountryTotal * 100) + '%', backgroundColor: '#bae6fd' }">
            </div>
          </div>
          <span class="w-8 text-xs text-gray-400 flex-shrink-0 text-right">{{ c.total }}</span>
        </div>
      </div>
      <div class="mt-2 flex items-center gap-4 text-xs text-gray-400">
        <span class="flex items-center gap-1.5"><span class="w-3 h-2 rounded-sm inline-block" style="background:#1a1d56"></span>Accepted</span>
        <span class="flex items-center gap-1.5"><span class="w-3 h-2 rounded-sm inline-block" style="background:#bae6fd"></span>Other</span>
      </div>
      <button v-if="countryRows.length > 15" @click="showAll = !showAll"
        class="mt-2 text-xs font-medium hover:underline" style="color:#1a1d56;">
        {{ showAll ? 'Show less ▲' : `Show all ${countryRows.length} countries ▼` }}
      </button>
    </div>

    <!-- By Track -->
    <div v-if="trackBars.length" class="bg-gray-50 rounded-2xl p-5">
      <h3 class="font-semibold text-gray-700 mb-4 text-sm">By Track</h3>
      <div class="space-y-2">
        <div v-for="t in trackBars" :key="t.track" class="flex items-center gap-3">
          <span class="w-48 text-xs text-gray-500 truncate flex-shrink-0" :title="t.track">{{ t.track }}</span>
          <div class="flex-1 flex rounded-full overflow-hidden h-4 bg-white">
            <div class="h-4 transition-all duration-500"
              :style="{ width: (t.accepted / t.total * 100) + '%', backgroundColor: '#1a1d56', minWidth: t.accepted ? '1.2rem' : '0' }">
            </div>
            <div class="h-4 transition-all duration-500"
              :style="{ width: ((t.total - t.accepted) / t.total * 100) + '%', backgroundColor: '#e0f2fe' }">
            </div>
          </div>
          <span class="w-8 text-xs text-gray-400 flex-shrink-0 text-right">{{ t.total }}</span>
        </div>
      </div>
      <div class="mt-2 flex items-center gap-4 text-xs text-gray-400">
        <span class="flex items-center gap-1.5"><span class="w-3 h-2 rounded-sm inline-block" style="background:#1a1d56"></span>Accepted</span>
        <span class="flex items-center gap-1.5"><span class="w-3 h-2 rounded-sm inline-block" style="background:#e0f2fe"></span>Other</span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import api from '@/plugins/axios'

const props = defineProps({ eventId: { type: Number, default: null } })

const stats   = ref({ total: 0, total_accepted: 0, eswatini_accepted: 0, reviewer_rejected: 0, by_status: [], by_type: [], by_track: [], by_country: [] })
const showAll = ref(false)

const D = 140, W = 20, R = (D - W) / 2
const circumference = computed(() => 2 * Math.PI * R)

const STATUS_COLORS = {
  accepted: '#1a1d56', submitted: '#3b82f6',
  under_review: '#f59e0b', rejected: '#ef4444', revision_required: '#f97316',
}
const TYPE_COLORS = { oral: '#1B3F6E', poster: '#f59d08' }

const kpis = computed(() => {
  const s = stats.value
  const pct = s.total ? Math.round((s.total_accepted / s.total) * 100) : 0
  const oral   = s.by_type?.find(t => t.type === 'oral')?.count   || 0
  const poster = s.by_type?.find(t => t.type === 'poster')?.count || 0
  return [
    { label: 'Total',              value: s.total,             accent: '#6b7280' },
    { label: 'Accepted',           value: s.total_accepted,    accent: '#1a1d56', sub: `${pct}% acceptance rate` },
    { label: 'Reviewer Rejected',  value: s.reviewer_rejected, accent: '#ef4444', sub: '≥2 reviewers recommended reject' },
    { label: 'Oral',               value: oral,                accent: '#1B3F6E' },
    { label: 'Poster',             value: poster,              accent: '#f59d08' },
  ]
})

const statusBars = computed(() => {
  const total = stats.value.total || 1
  return (stats.value.by_status || [])
    .sort((a, b) => b.count - a.count)
    .map(s => ({
      label: s.status.replace('_', ' '),
      count: s.count,
      pct:   Math.round(s.count / total * 100),
      color: STATUS_COLORS[s.status] || '#9ca3af',
    }))
})

const donutSegs = computed(() => {
  const circ = circumference.value
  const types = (stats.value.by_type || []).filter(t => t.type !== 'unspecified')
  const total = types.reduce((s, t) => s + t.count, 0) || 1
  let offset = 0
  return types.map(t => {
    const dash = (t.count / total) * circ
    const seg = { label: t.type, count: t.count, color: TYPE_COLORS[t.type] || '#9ca3af', dash, offset }
    offset += dash
    return seg
  })
})
const unspecifiedCount = computed(() =>
  (stats.value.by_type || []).find(t => t.type === 'unspecified')?.count || 0
)

const countryRows     = computed(() => (stats.value.by_country || []).filter(c => c.country))
const maxCountryTotal = computed(() => Math.max(...countryRows.value.map(c => c.total), 1))
const visibleCountries = computed(() => showAll.value ? countryRows.value : countryRows.value.slice(0, 15))
const isEswatini = c => ['eswatini', 'swaziland'].includes((c || '').trim().toLowerCase())
const eswatiniRow = computed(() => countryRows.value.find(c => isEswatini(c.country)) || null)

const trackBars = computed(() => (stats.value.by_track || []).filter(t => t.track !== 'Untracked'))

async function fetchStats() {
  try {
    const params = props.eventId ? `?event_id=${props.eventId}` : ''
    const res = await api.get(`/abstracts/stats${params}`)
    stats.value = res.data
  } catch (e) {
    console.error('Failed to load stats', e)
  }
}

watch(() => props.eventId, fetchStats, { immediate: true })
</script>
