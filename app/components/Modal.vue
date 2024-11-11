<script setup lang="ts">
const props = defineProps({
  show: Boolean,
  content: String,
  title: String,
  onConfirm: Function,
  onCancel: Function
})

const emits = defineEmits<{
  cancel: [],
  confirm: []
}>()

function cancel(){
  props.onCancel?.()
}

function confirm(){
  props.onConfirm?.()
}
</script>

<template>
  <div class="z-100 isolate ababwa veil w-full fixed top-0 left-0 h-full backdrop-blur-2xl" v-if="show">
    <div
      class="modal min-w-[500px] max-w-5/6 rounded-lg fixed left-1/2 transform -translate-x-1/2 mt-20 bg-white border-2 border-dark/20">
      <span class="flex px-4 items-center gap-2 border-b border-gray-300 py-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M20.0833 15.1999L21.2854 15.9212C21.5222 16.0633 21.5989 16.3704 21.4569 16.6072C21.4146 16.6776 21.3558 16.7365 21.2854 16.7787L12.5144 22.0412C12.1978 22.2313 11.8021 22.2313 11.4855 22.0412L2.71451 16.7787C2.47772 16.6366 2.40094 16.3295 2.54301 16.0927C2.58524 16.0223 2.64413 15.9634 2.71451 15.9212L3.9166 15.1999L12 20.0499L20.0833 15.1999ZM20.0833 10.4999L21.2854 11.2212C21.5222 11.3633 21.5989 11.6704 21.4569 11.9072C21.4146 11.9776 21.3558 12.0365 21.2854 12.0787L12 17.6499L2.71451 12.0787C2.47772 11.9366 2.40094 11.6295 2.54301 11.3927C2.58524 11.3223 2.64413 11.2634 2.71451 11.2212L3.9166 10.4999L12 15.3499L20.0833 10.4999ZM12.5144 1.30864L21.2854 6.5712C21.5222 6.71327 21.5989 7.0204 21.4569 7.25719C21.4146 7.32757 21.3558 7.38647 21.2854 7.42869L12 12.9999L2.71451 7.42869C2.47772 7.28662 2.40094 6.97949 2.54301 6.7427C2.58524 6.67232 2.64413 6.61343 2.71451 6.5712L11.4855 1.30864C11.8021 1.11864 12.1978 1.11864 12.5144 1.30864ZM12 3.33233L5.88723 6.99995L12 10.6676L18.1127 6.99995L12 3.33233Z"
            fill="#293241" />
        </svg>
        <slot name="title">
          <h1 class="text-2xl font-bold">
            {{ title || "Modal" }}
          </h1>
        </slot>
      </span>
      <p class="px-5 py-4 text-lg min-h-20 font-mono">
        <slot>
          {{ content || "Are you sure you want to proceed?" }}
        </slot>
      </p>
      <div class="flex gap-4 px-4 py-2 justify-between border-t border-gray-300">
        <button @click="cancel" class="bg-dark text-white px-8 py-2 rounded-md">Cancel</button>
        <button @click="confirm" class="bg-peach text-white px-8 py-2 rounded-md">Confirm</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.veil {
  background: radial-gradient(66.53% 131.56% at 70.49% 47.56%, rgba(61, 90, 128, 0.2) 0%, rgba(243, 106, 62, 0.2) 100%);
}

.modal {
  box-shadow: 0 8px 20px #000000;
  backdrop-filter: blur(5px);
  background: radial-gradient(325.39% 325.39% at 2.42% 8.67%, rgba(255, 255, 255, 0.8) 7%, rgba(152, 193, 217, 0.8) 100%)
}
</style>