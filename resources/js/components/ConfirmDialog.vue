<template>
  <Teleport to="body">
    <div v-if="estado.visible" class="modal-overlay" @click.self="cancelar">
      <div class="modal modal--confirm">
        <div class="modal__cuerpo">
          <p style="font-size:.9375rem; line-height:1.5; margin:0">{{ estado.mensaje }}</p>
        </div>
        <div class="modal__pie">
          <button class="boton-secundario" @click="cancelar">Cancelar</button>
          <button class="boton-principal" @click="aceptar">Aceptar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useConfirm } from '@/composables/useConfirm.js'

const { estado, aceptar, cancelar } = useConfirm()
</script>
