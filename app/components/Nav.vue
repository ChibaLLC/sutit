<template>
  <div class="w-full flex justify-center items-center relative text-dark z-10">
    <nav
      class="flex w-10/12 max-sm:w-11/12 justify-between items-center border-sky border text-lg px-3 max-sm:px-2 py-1 mt-4 bg-white rounded isolate relative navbar">
      <div>
        <svg class="h-12 max-sm:h-9" viewBox="0 0 65 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 5C0 2.23858 2.23858 0 5 0H35C51.5685 0 65 13.4315 65 30C65 46.5685 51.5685 60 35 60H5C2.23858 60 0 57.7614 0 55V5Z"
            fill="#3D5A80" />
        </svg>
      </div>
      <ul class="flex justify-center w-full font-serif gap-x-20 items-center text-xl -z-10 absolute max-sm:flex-col">
        <li class="dropdown-item max-sm:hidden">
          <NuxtLink to="/">Home</NuxtLink>
        </li>
        <li class="dropdown-item max-sm:hidden">
          <NuxtLink to="/about">About</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/">
            <span class="uppercase text-3xl">sutit.</span>
          </NuxtLink>
        </li>
        <li class="dropdown-item max-sm:hidden">
          <NuxtLink to="/pricing">Pricing</NuxtLink>
        </li>
        <li class="dropdown-item max-sm:hidden">
          <NuxtLink to="/contact">Contact</NuxtLink>
        </li>
      </ul>
      <div class="isolate">
        <div>
          <div v-if="!userIsAuthenticated()">
            <NuxtLink
              class="bg-navy px-8 max-sm:px-5 py-2 max-sm:py-1.5 rounded-sm text-white font-bold max-sm:hidden dropdown-item"
              to="/auth/login">
              <span>Login</span>
            </NuxtLink>
            <div class="sm:hidden bg-navy p-2 rounded text-white cursor-pointer" @click="toggleDropdown">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-5">
                <path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z"></path>
              </svg>
            </div>
          </div>
          <div
            class="rounded-xl max-sm:rounded-lg p-[6px] text-white font-bold bg-white border-2 border-navy relative overflow-hidden cursor-pointer"
            v-else @click="toggleDropdown">
            <img :src="pp" alt="Profile Picture"
              class="object-cover h-8 max-sm:h-6 w-10 max-sm:w-8 aspect-square opacity-80 grayscale" />
            <div class="absolute w-full h-full bg-navy/15 top-0 left-0 hover:bg-transparent transition-colors">
            </div>
          </div>
        </div>
        <ul ref="dropdown"
          class="absolute border px-10 py-1 dropdown text-white bg-navy/80 mt-1 -mr-0.5 rounded-b-md backdrop-blur-lg">
          <li class="hover:text-sky w-full transition-colors py-1 initial" @click="toggleDropdown">
            <button @click="logout" v-if="userIsAuthenticated()">Log Out</button>
          </li>
        </ul>
      </div>
    </nav>
  </div>
</template>
<script setup lang="ts">
const dropdown = ref<HTMLDivElement | null>(null);
let collectedDropdownItems = false;
const pp = '/images/profile.png'

function handleWindowSize() {
  if (window.innerWidth <= 768 && !collectedDropdownItems) {
    const dropdownItems = Array.from(document.querySelectorAll('.dropdown-item'))
      .map((item) => {
        item = item.cloneNode(true) as HTMLElement;
        item.classList.remove(...item.classList);
        const outies = ['A', 'BUTTON'];
        if (outies.includes(item.tagName)) return item.outerHTML
        return item.innerHTML;
      })
      .map((item) => {
        const li = document.createElement('li');
        li.classList.add('hover:bg-sky/20', 'w-full', 'transition-colors', 'py-1');
        li.innerHTML = item;
        li.addEventListener("click", () => {
          toggleDropdown()
        })
        return li;
      });
    dropdown.value?.prepend(...dropdownItems);
    collectedDropdownItems = true;
  } else if (window.innerWidth > 768 && collectedDropdownItems) {
    dropdown.value?.querySelectorAll('li').forEach((li) => {
      if (li.classList.contains('initial')) return
      li.remove();
    });
    collectedDropdownItems = false;
  }
}

function toggleDropdown() {
  if (!dropdown.value) return console.warn('Dropdown not found');
  dropdown.value.classList.toggle('active');
}

onMounted(() => {
  handleWindowSize();
  window.matchMedia('(max-width: 768px)').addEventListener('change', handleWindowSize);
})
</script>
<style scoped lang="scss">
.navbar {
  filter: drop-shadow(0px 10px 10px rgba(90, 169, 230, 0.1));
  height: 65px;

  @media screen and (max-width: 768px) {
    height: 50px;
  }
}

.dropdown {
  transform: translateY(-100%);
  right: 0;
  top: 3.8rem;
  opacity: 0;
  transition: transform 0.3s, opacity 0.3s;
  pointer-events: none;

  @media screen and (max-width: 768px) {
    top: 2.8rem !important;
  }

  &.active {
    transform: translateY(0);
    opacity: 1;
    pointer-events: all;
  }
}
</style>