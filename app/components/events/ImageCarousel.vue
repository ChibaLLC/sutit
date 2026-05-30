<script setup lang="ts">
  import { ChevronLeft, ChevronRight } from "lucide-vue-next";

  const props = defineProps<{
    images: string[];
    alt?: string;
  }>();
  let intervalId: ReturnType<typeof setInterval>;

  const currentIndex = ref(0);

  const prev = () => {
    currentIndex.value =
      currentIndex.value === 0 ? props.images.length - 1 : currentIndex.value - 1;
  };

  const next = () => {
    currentIndex.value =
      currentIndex.value === props.images.length - 1 ? 0 : currentIndex.value + 1;
  };

  const goTo = (i: number) => {
    currentIndex.value = i;
  };
  onMounted(() => {
    intervalId = setInterval(() => {
      next();
    }, 5000);
  });
  onUnmounted(() => {
    clearInterval(intervalId);
  });
</script>

<template>
  <div
    v-if="images.length === 0"
    class="bg-muted flex aspect-video items-center justify-center rounded-xl"
  >
    <slot name="fallback" />
  </div>

  <div v-else class="group relative">
    <!-- Main image -->
    <div class="bg-muted relative aspect-video overflow-hidden rounded-xl">
      <Transition
        mode="out-in"
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <img
          :key="currentIndex"
          :src="images[currentIndex]"
          :alt="alt || `Image ${currentIndex + 1}`"
          class="h-full w-full object-cover"
        />
      </Transition>

      <!-- Nav arrows (only if multiple images) -->
      <template v-if="images.length > 1">
        <button
          @click="prev"
          class="absolute top-1/2 left-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/60"
        >
          <ChevronLeft class="h-5 w-5" />
        </button>
        <button
          @click="next"
          class="absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/60"
        >
          <ChevronRight class="h-5 w-5" />
        </button>
      </template>
    </div>

    <!-- Dots -->
    <div v-if="images.length > 1" class="mt-3 flex items-center justify-center gap-1.5">
      <button
        v-for="(_, i) in images"
        :key="i"
        @click="goTo(i)"
        class="h-2 rounded-full transition-all duration-200"
        :class="
          i === currentIndex
            ? 'bg-primary w-6'
            : 'bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2'
        "
      />
    </div>
  </div>
</template>
