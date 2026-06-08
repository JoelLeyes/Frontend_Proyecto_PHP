import { reactive } from 'vue'

const estado = reactive({
    visible: false,
    mensaje: '',
    resolve: null,
})

export function useConfirm() {
    function confirmar(mensaje) {
        estado.mensaje = mensaje
        estado.visible = true
        return new Promise((resolve) => {
            estado.resolve = resolve
        })
    }

    function aceptar() {
        estado.visible = false
        estado.resolve?.(true)
    }

    function cancelar() {
        estado.visible = false
        estado.resolve?.(false)
    }

    return { estado, confirmar, aceptar, cancelar }
}
