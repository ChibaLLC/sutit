<template>
  <nav class="relative flex flex-wrap items-center justify-between px-2 py-3 mb-3 bg-[#262626] text-white">
    <div class="container px-4 mx-auto flex flex-wrap items-center justify-between">
      <div class="w-full relative flex justify-between lg:w-auto  px-4 lg:static lg:block lg:justify-start">
        <NuxtLink
            class="text-sm font-bold leading-relaxed inline-block mr-4 py-2 whitespace-nowrap uppercase"
            to="/">
          Sutit
        </NuxtLink>
        <button
            class="text-white cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none"
            type="button" v-on:click="toggleNavbar()">
          <span class="h-1 w-6 bg-white my-1 block"></span>
          <span class="h-1 w-6 bg-white my-1 block"></span>
          <span class="h-1 w-6 bg-white my-1 block"></span>
        </button>
      </div>
      <div v-bind:class="{'hidden': !showMenu, 'flex': showMenu}" class="lg:flex lg:flex-grow items-center">
        <ul class="flex flex-col lg:flex-row list-none ml-auto gap-2">
          <li class="nav-item" v-if="!userIsAuthenticated()">
            <NuxtLink
                class="btn sign-up px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75"
                to="/signup?redirect=/forms">
              Sign Up
            </NuxtLink>
          </li>
          <li class="nav-item" v-if="!userIsAuthenticated()">
            <NuxtLink
                class="btn log-in px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug hover:opacity-75"
                to="/login?redirect=/forms">
              Log In
            </NuxtLink>
          </li>
          <li class="nav-item" v-if="userIsAuthenticated()">
            <button
                class="btn log-out px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug hover:opacity-75"
                @click="logout">
              Log Out
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">

const showMenu = ref(false);
const toggleNavbar = () => {
  showMenu.value = !showMenu.value;
};

onMounted(() => {
  document.body.classList.remove('dark')
})
</script>

<style scoped>
.router-link-active {
  @apply text-amber-400;
}

.btn {
  @apply rounded;
}

.btn.sign-up {
  @apply bg-emerald-500;
}

.btn.log-in {
  @apply bg-slate-500;
}
</style>