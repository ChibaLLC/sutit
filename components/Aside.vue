<script setup lang="ts">

</script>

<template>
  <div class="hidden border-r border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800 xl:block w-[300px]">
    <div class="flex h-full flex-col mt-3 ml-5">
      <div class="flex-1 overflow-auto p-2">
        <div class="grid gap-2">
          <NuxtLink to="/"
                    class="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                    >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                 class="h-4 w-4">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Home
          </NuxtLink>
          <NuxtLink to="/dashboard"
                    class="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-50 bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                 class="h-4 w-4">
              <rect width="20" height="12" x="2" y="6" rx="2"></rect>
              <path d="M12 12h.01"></path>
              <path d="M17 12h.01"></path>
              <path d="M7 12h.01"></path>
            </svg>
            Forms
          </NuxtLink>
          <NuxtLink to="/submissions"
                    class="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                 class="h-4 w-4">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Submissions
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.router-link-active {
  @apply dark:text-gray-50;
  @apply bg-gray-800;
}
</style>