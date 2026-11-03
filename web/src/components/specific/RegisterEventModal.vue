<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center"
  >
    <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
      <h2 class="text-lg font-semibold mb-4">Register for {{ event?.name }}</h2>

      <label class="block mb-2 text-sm font-medium text-gray-700">Participation Role</label>
      <select
        v-model="participationRole"
        class="w-full p-2 border rounded-md focus:outline-none focus:ring"
      >
              <option disabled value="">Select category</option>
              <option value="secretariat">CANECSA secretariat</option>
              <option value="moh">Country delegate (from Ministry of Health)</option>
              <option value="member_state">Participant from CANECSA Member States</option>
              <option value="other_africa">Participant from other African countries</option>
              <option value="world">Participant from the Rest of the World</option>
              <option value="student">Student</option>
              <option value="exibitor">Sponsor/Exhibitor</option>
      </select>

      <div class="mt-6 flex justify-end gap-3">
        <button @click="close" class="text-gray-500 hover:underline">Cancel</button>
        <button
          @click="register"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          :disabled="!participationRole"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  visible: Boolean,
  event: Object,
  userId: Number
})

const emit = defineEmits(['close', 'registered'])
const router = useRouter()
const participationRole = ref('')

function close() {
  participationRole.value = ''
  emit('close')
}

function register() {
  if (!props.event || !props.userId || !participationRole.value) return

  // Store pending data in sessionStorage — registration DB record is only created
  // once the user uploads proof of payment on the payment page.
  sessionStorage.setItem(`pending_reg_${props.event.id}`, JSON.stringify({
    user_id: props.userId,
    participation_role: participationRole.value,
  }))
  close()
  router.push(`/payment/${props.event.id}`)
}
</script>
