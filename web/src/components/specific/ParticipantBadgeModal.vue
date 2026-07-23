<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3"
    @click.self="close"
  >
    <div class="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" style="max-height:95vh;">

      <!-- Header bar -->
      <div class="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Badge Preview</span>
        <button class="text-gray-400 hover:text-black transition" @click="close">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Badge (A6 = 105×148mm, same aspect ratio as A4) -->
      <div class="flex-1 flex items-center justify-center p-2 bg-gray-50">
        <div
          ref="badgeRef"
          class="relative w-full"
          :style="{
            aspectRatio: '105/148',
            containerType: 'inline-size',
            backgroundImage: `url(${badgeBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            fontFamily: '\'Roboto Condensed\', Roboto, Arial, sans-serif',
          }"
        >

          <!-- ── Logos ─────────────────────────────────────────────────── -->
          <!-- Left: Eswatini MoH  5–32 mm | Right: ECSA-HC  58–98 mm      -->
          <!-- Enlarged to 13% height for better visibility                 -->
          <div class="absolute flex justify-between items-center"
               style="top:1.5%;left:3%;right:1.5%;height:13%;">
            <img src="@/assets/moh_sz.png"         class="h-full w-auto object-contain" style="max-width:48%;" alt="Kingdom of Eswatini Ministry of Health" />
            <img src="@/assets/ecsa_hc_banner.png" class="h-full w-auto object-contain" style="max-width:48%;" alt="ECSA-HC" />
          </div>

          <!-- ── Title 1 (orange) baseline at y≈22% of badge height ────── -->
          <div class="absolute w-full text-center leading-tight px-2"
               style="top:22%;transform:translateY(-50%);color:#f59d08;font-size:7.1cqw;font-weight:900;font-family:'Roboto Condensed',Roboto,sans-serif;">
            {{ title1 }}
          </div>

          <!-- ── Title 2 (dark/near-black) baseline at y≈28% ──────────── -->
          <div class="absolute w-full text-center leading-tight px-2"
               style="top:28%;transform:translateY(-50%);color:#111111;font-size:6.1cqw;font-weight:900;font-family:'Roboto Condensed',Roboto,sans-serif;">
            {{ title2 }}
          </div>

          <!-- ── Dates & location at y≈33.5% ──────────────────────────── -->
          <div class="absolute w-full text-center px-3"
               style="top:33.5%;transform:translateY(-50%);color:#222;font-size:2.6cqw;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            {{ dateStr }}
          </div>

          <!-- ── THEME box ─────────────────────────────────────────────── -->
          <div class="absolute flex items-center justify-center"
               style="top:38%;left:9.4%;width:17.3%;height:3.7%;background:#00AEEF;color:#fff;font-size:3.5cqw;font-weight:900;">
            THEME:
          </div>
          <!-- Theme text -->
          <div class="absolute leading-snug"
               style="top:42.5%;left:9.7%;right:3%;color:#111;font-size:3.2cqw;font-weight:700;">
            {{ theme }}
          </div>

          <!-- ── Role banner  top=52%, height=8.3%, left=7.4%, right=6.9% ─ -->
          <div
            class="absolute flex items-center justify-center"
            :style="{
              top: '52%',
              left: '7.4%',
              right: '6.9%',
              height: '8.3%',
              background: roleColor,
              color: roleBannerTextColor,
              fontSize: roleFontSize,
              fontWeight: 900,
              fontFamily: '\'Roboto Condensed\', Roboto, sans-serif',
              letterSpacing: '0.06em',
            }"
          >
            {{ roleLabel }}
          </div>

          <!-- ── Info rows (Name / Designation / Organization) ──────────── -->
          <template v-for="(row, i) in infoRows" :key="i">
            <div class="absolute flex overflow-hidden"
                 :style="{ top: rowTops[i], left:'7.4%', right:'6.9%', height:'4.5%' }">
              <!-- Label -->
              <div
                class="flex items-center justify-center shrink-0 text-center"
                :style="{ width: row.labelPct, background:'#00AEEF', color:'#fff', fontSize:'3.7cqw', fontWeight:700 }"
              >
                {{ row.label }}
              </div>
              <!-- Value -->
              <div
                class="flex items-center flex-1 px-1 truncate"
                :style="{ background: roleLightColor, color:'#111', fontSize:'3.4cqw', fontWeight:600 }"
              >
                {{ row.value }}
              </div>
            </div>
          </template>

          <!-- ── QR code  top=79%, width=15% centred ─────────────────── -->
          <div class="absolute flex flex-col items-center"
               style="top:79%;left:50%;transform:translateX(-50%);width:15%;">
            <img :src="qrUrl" alt="QR" class="w-full h-auto" />
            <span class="text-center mt-0.5" style="font-size:1.4cqw;color:#666;white-space:nowrap;">
              Scan to confirm attendance
            </span>
          </div>

          <!-- ── Flag strip  top=93%, single row ─────────────────────── -->
          <div class="absolute flex justify-center items-center"
               style="top:93%;left:4%;right:4%;height:5%;gap:0.4cqw;overflow:hidden;">
            <img v-for="code in flagCodes" :key="code"
                 :src="`https://flagcdn.com/40x30/${code}.png`"
                 :alt="code" style="height:100%;width:auto;object-fit:contain;flex-shrink:1;min-width:0;" />
          </div>

        </div>
      </div>

      <!-- Download button -->
      <div class="flex-shrink-0 px-4 py-3 border-t border-gray-100 flex justify-center bg-white">
        <button
          @click="downloadPDF"
          class="bg-[#1a1d56] hover:bg-[#007a95] text-white px-6 py-2 rounded-full text-sm font-semibold transition"
        >
          Download Badge PDF
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import api from '@/plugins/axios'
import badgeBg from '@/assets/badge_bg.jpg'

const props = defineProps({
  visible: Boolean,
  user:    Object,   // participant from event participants list
  event:   Object,   // full event object
})

const emit = defineEmits(['close'])
const close = () => emit('close')

const badgeRef = ref(null)

// ── Role colour map ──────────────────────────────────────────────────────────
const ROLE_COLORS = {
  media:        '#FFD700',
  moderator:    '#f59d08',
  secretariat:  '#00AEEF',
  speaker:      '#C8102E',
  presenter:    '#C8102E',
  delegate:     '#009639',
  moh:          '#009639',
  member_state: '#009639',
  other_africa: '#009639',
  world:        '#009639',
  student:      '#009639',
  participant:  '#009639',
  exhibitor:    '#f59d08',
  sponsor:      '#f59d08',
}
const ROLE_LABELS = {
  media:        'MEDIA',
  moderator:    'MODERATOR',
  secretariat:  'SECRETARIAT',
  speaker:      'SPEAKER',
  presenter:    'PRESENTER',
  delegate:     'DELEGATE',
  moh:          'DELEGATE',
  member_state: 'DELEGATE',
  other_africa: 'DELEGATE',
  world:        'DELEGATE',
  student:      'STUDENT',
  participant:  'PARTICIPANT',
  exhibitor:    'EXHIBITOR',
  sponsor:      'SPONSOR',
}

const roleKey = computed(() => {
  const r = props.user?.participation_role
  if (!r) return 'delegate'
  return (typeof r === 'object' ? r.name : String(r)).toLowerCase()
})

const roleColor           = computed(() => ROLE_COLORS[roleKey.value] || '#1a1d56')
const roleLabel           = computed(() => ROLE_LABELS[roleKey.value] || roleKey.value.toUpperCase())
const roleBannerTextColor = computed(() => roleColor.value === '#FFD700' ? '#000' : '#fff')
const roleLightColor      = computed(() => {
  const hex = roleColor.value.replace('#', '')
  const r   = parseInt(hex.slice(0,2), 16) / 255
  const g   = parseInt(hex.slice(2,4), 16) / 255
  const b   = parseInt(hex.slice(4,6), 16) / 255
  return `rgb(${Math.round((0.80+r*0.20)*255)},${Math.round((0.80+g*0.20)*255)},${Math.round((0.80+b*0.20)*255)})`
})

// Banner font size: matches Python formula max(22,min(42,330//len)) converted to cqw
// 1pt = 0.353mm; container = 105mm → 1cqw = 1.05mm → 1pt ≈ 0.336cqw
const roleFontSize = computed(() => {
  const fsize = Math.max(22, Math.min(42, Math.floor(330 / Math.max(roleLabel.value.length, 1))))
  return `${(fsize * 0.336).toFixed(2)}cqw`
})

// ── Event title split ────────────────────────────────────────────────────────
const normalizedName = computed(() => {
  const name = props.event?.event || ''
  return name
    .replace(/ᵗʰ/g,'th').replace(/ˢᵗ/g,'st').replace(/ⁿᵈ/g,'nd').replace(/ʳᵈ/g,'rd')
})
const title1 = computed(() => {
  const parts = normalizedName.value.split(' & ')
  if (parts.length >= 2) return parts[0].trim()
  const words = normalizedName.value.split(' ')
  return words.slice(0, Math.ceil(words.length / 2)).join(' ')
})
const title2 = computed(() => {
  const parts = normalizedName.value.split(' & ')
  if (parts.length >= 2) return '& ' + parts.slice(1).join(' & ').trim()
  const words = normalizedName.value.split(' ')
  return words.slice(Math.ceil(words.length / 2)).join(' ')
})

// ── Dates ────────────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })
}
const dateStr = computed(() => {
  const s   = fmtDate(props.event?.start_date)
  const e   = fmtDate(props.event?.end_date)
  const loc = props.event?.location || ''
  const range = s && e ? `${s} – ${e}` : (s || e)
  return [range, loc].filter(Boolean).join('  |  ')
})

const theme = computed(() => props.event?.theme || '')

// ── Info rows with variable label widths matching official template ────────────
// Official (105mm page): Name=20.3%, Designation=32.1%, Organization=32.5%
const infoRows = computed(() => [
  {
    label:    'Name',
    value:    [props.user?.firstname, props.user?.lastname].filter(Boolean).join(' '),
    labelPct: '20.3%',
  },
  {
    label:    'Designation',
    value:    props.user?.position || '',
    labelPct: '32.1%',
  },
  {
    label:    'Organization',
    value:    props.user?.organisation || '',
    labelPct: '32.5%',
  },
])

// Row top positions — shifted slightly to match enlarged logo area
const rowTops = ['62%', '68%', '74%']

// ── QR code ──────────────────────────────────────────────────────────────────
const apiOrigin = 'https://events.ecsahc.org'
const qrUrl = computed(() => {
  const data = `${apiOrigin}/event-attendance/${props.event?.id}?reg=${props.user?.id}`
  return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(data)}`
})

// ── ECSA member-state flags ───────────────────────────────────────────────────
const flagCodes = ['sz', 'ke', 'ls', 'mw', 'mu', 'mz', 'st', 'tz', 'ug', 'zm', 'zw']

// ── PDF download — calls the backend which generates a proper A6 PDF ─────────
async function downloadPDF() {
  const eventId = props.event?.id
  const userId  = props.user?.user_id   // registration.user_id from the event participants list
  if (!eventId || !userId) {
    console.warn('Badge download: missing eventId or userId', { eventId, userId, user: props.user })
    alert('Cannot determine participant — please refresh and try again.')
    return
  }
  try {
    const url = `/events/${eventId}/participants/badges?paid=all&user_id=${userId}`
    const response = await api.get(url, { responseType: 'blob' })
    const name = [props.user?.firstname, props.user?.lastname].filter(Boolean).join('_') || 'badge'
    const blob     = new Blob([response.data], { type: 'application/pdf' })
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = `badge_${name}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(objectUrl)
  } catch (err) {
    console.error('Badge download failed:', err?.response?.status, err?.response?.data || err)
    alert(`Failed to download badge PDF (${err?.response?.status || 'network error'}).`)
  }
}
</script>
