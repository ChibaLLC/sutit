<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: 'Modal'
  },
  open: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="flex justify-center items-center h-screen absolute">
    <div v-if="open">
      <!-- Modal Overlay -->
      <transition name="fade">
        <div v-show="open" class="fixed inset-0 px-2 z-10 overflow-hidden flex items-center justify-center">
          <div v-show="open" class="absolute inset-0 bg-gray-500 bg-opacity-75"></div>
          <!-- Modal Content -->
          <transition name="modal">
            <div v-show="open"
                 class="bg-white rounded-md shadow-xl overflow-hidden max-w-md w-full sm:w-96 md:w-1/2 lg:w-2/3 xl:w-1/3 z-50">
              <!-- Modal Header -->
              <div class="bg-indigo-500 text-white px-4 py-2 flex justify-between">
                <h2 class="text-lg font-semibold">{{title}}</h2>
              </div>
              <!-- Modal Body -->
              <div class="p-4">
                <slot/>
              </div>
              <!-- Modal Footer -->
              <div class="border-t px-4 py-2 flex justify-end">
                <button class="px-3 py-1 bg-indigo-500 text-white  rounded-md w-full sm:w-auto" @click="$emit('close')">
                  Done
                </button>
                <button class="px-3 py-1 bg-indigo-500 text-white ml-2 rounded-md w-full sm:w-auto" @click="$emit('cancel')">
                  Cancel
                </button>
              </div>
            </div>
          </transition>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.modal-enter-active, .modal-leave-active {
  transition: transform 0.3s;
}

.modal-enter, .modal-leave-to {
  transform: scale(0.75);
}
</style>