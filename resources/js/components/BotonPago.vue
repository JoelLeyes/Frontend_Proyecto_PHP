<template>
  <div>
    <div v-if="cargando" class="paypal-cargando">Cargando PayPal...</div>
    <div v-if="errorMsg" class="alerta alerta--error" style="margin-bottom:.75rem">{{ errorMsg }}</div>
    <div ref="contenedor" :id="contenedorId"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'

const props = defineProps({
  tipo:      { type: String, required: true }, // 'reserva' | 'paquete'
  entidadId: { type: Number, required: true },
})

const emit = defineEmits(['pagado', 'error'])

const contenedor   = ref(null)
const contenedorId = `paypal-btn-${props.tipo}-${props.entidadId}`
const cargando     = ref(true)
const errorMsg     = ref('')

let scriptEl = null

onMounted(() => {
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test'
  const src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`

  scriptEl = document.createElement('script')
  scriptEl.src = src
  scriptEl.onload  = inicializarBotones
  scriptEl.onerror = () => { errorMsg.value = 'No se pudo cargar el SDK de PayPal.'; cargando.value = false }
  document.head.appendChild(scriptEl)
})

onBeforeUnmount(() => {
  if (scriptEl && document.head.contains(scriptEl)) {
    document.head.removeChild(scriptEl)
  }
})

async function inicializarBotones() {
  cargando.value = false

  window.paypal.Buttons({
    style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' },

    async createOrder() {
      errorMsg.value = ''
      try {
        const { data } = await axios.post('/api/pagos/iniciar', {
          tipo: props.tipo,
          id:   props.entidadId,
        })
        return data.paypal_order_id
      } catch (e) {
        errorMsg.value = e.response?.data?.error || 'No se pudo iniciar el pago.'
        throw e
      }
    },

    async onApprove(data) {
      try {
        await axios.post('/api/pagos/capturar', { paypal_order_id: data.orderID })
        emit('pagado')
      } catch (e) {
        errorMsg.value = e.response?.data?.error || 'El pago fue aprobado pero hubo un error al confirmarlo.'
        emit('error', errorMsg.value)
      }
    },

    onError(err) {
      errorMsg.value = 'Ocurrió un error en el proceso de pago.'
      emit('error', errorMsg.value)
      console.error('PayPal error:', err)
    },

    onCancel() {
      errorMsg.value = 'Cancelaste el pago. Podés intentarlo de nuevo.'
    },

  }).render(`#${contenedorId}`)
}
</script>

