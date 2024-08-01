<script setup lang="ts">
import {Status} from "~/types";

const url = useRoute()
const redirect = url.query?.redirect
const loading = ref(false)
const details = reactive({
  email: '',
  password1: '',
  password2: ''
})

const errors = ref(new Set())

watch(details, () => {
  if (details.password2 !== '' && details.password1 !== details.password2) {
    errors.value.add('Passwords do not match')
  } else {
    errors.value.clear()
  }
})

async function submit() {
  if (errors.value.size > 0) return alert('Please fix the errors in the form.')
  loading.value = true

  await unFetch('/api/v1/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: details.email,
      password: details.password1
    }),
    async onResponse({response}) {
      const res = response._data
      loading.value = false

      switch (res.statusCode) {
        case Status.success:
          setAuthCookie(res.body)
          useUser().value!.token = res.body
          if (redirect) {
            if (typeof redirect !== 'string') throw new Error("Redirect Error")
            await navigateTo(redirect)
          } else {
            await navigateTo('/')
          }
          break
        case Status.conflict:
          errors.value.add("A user with that very email, already exists.")
          break
        default:
          errors.value.add(res?.body?.error || res?.body?.message || res?.body || "An unknown error occurred. Please try again. Later.")
      }
    }
  })
}

</script>

<template>
  <Title>Sign Up</Title>
  <section class="relative w-full" style="margin-top: 100px">
    <div class="container mx-auto px-4 h-full">
      <div class="flex content-center items-center justify-center h-full">
        <div class="w-full lg:w-4/12 px-4">
          <div
              class="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-gray-300 border-0"
          >
            <div class="rounded-t mb-0 px-6 py-6">
              <div class="text-center mb-3">
                <h6 class="text-gray-600 text-sm font-bold">
                  Sign up with
                </h6>
              </div>
              <div class="btn-wrapper text-center">
                <button
                    class="bg-white active:bg-gray-100 text-gray-800 px-4 py-2 rounded outline-none focus:outline-none mr-2 mb-1 uppercase shadow hover:shadow-md inline-flex items-center font-bold text-xs"
                    type="button"
                    style="transition: all 0.15s ease 0s;"
                >
                  <img
                      alt="..."
                      class="w-5 mr-1"
                      src="/images/svg/github.svg"
                  />Github
                </button
                >
                <button
                    class="bg-white active:bg-gray-100 text-gray-800 px-4 py-2 rounded outline-none focus:outline-none mr-1 mb-1 uppercase shadow hover:shadow-md inline-flex items-center font-bold text-xs"
                    type="button"
                    style="transition: all 0.15s ease 0s;"
                >
                  <img
                      alt="..."
                      class="w-5 mr-1"
                      src="/images/svg/google.svg"
                  />Google
                </button>
              </div>
              <hr class="mt-6 border-b-1 border-gray-400"/>
            </div>
            <div class="flex-auto px-4 lg:px-10 py-10 pt-0">
              <div class="text-gray-500 text-center mb-3 font-bold">
                <small>Or sign up with credentials</small>
              </div>
              <form @submit.prevent="submit">
                <div class="relative w-full mb-3">
                  <label
                      class="block uppercase text-gray-700 text-xs font-bold mb-2"
                      for="grid-password"
                  >Email</label
                  ><input
                    type="email"
                    v-model="details.email"
                    autocomplete="email"
                    class="border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    placeholder="Email"
                    style="transition: all 0.15s ease 0s;"
                />
                </div>
                <div class="relative w-full mb-3">
                  <label
                      class="block uppercase text-gray-700 text-xs font-bold mb-2"
                      for="grid-password"
                  >Password</label
                  ><input
                    type="password"
                    v-model="details.password1"
                    autocomplete="new-password"
                    class="border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    placeholder="Password"
                    style="transition: all 0.15s ease 0s;"
                />
                </div>
                <div class="relative w-full mb-3">
                  <label
                      class="block uppercase text-gray-700 text-xs font-bold mb-2"
                      for="grid-password"
                  >Password Again</label
                  ><input
                    type="password"
                    autocomplete="new-password"
                    v-model="details.password2"
                    class="border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    placeholder="Password"
                    style="transition: all 0.15s ease 0s;"
                />
                </div>
                <div class="text-red-500" v-if="errors.size > 0">
                  <ul>
                    <li v-for="error in errors" :key="String(error)"><small>{{ error }}</small></li>
                  </ul>
                </div>
                <div class="text-center mt-6">
                  <button
                      class="bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full"
                      type="button"
                      @click="submit"
                      style="transition: all 0.15s ease 0s;"
                  >
                    <span v-if="!loading">Sign In</span>
                    <span :class="{'loading': loading}" class="w-full grid place-items-center" v-else>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path
                          d="M18.364 5.63604L16.9497 7.05025C15.683 5.7835 13.933 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12H21C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C14.4853 3 16.7353 4.00736 18.364 5.63604Z"></path></svg>
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div class="flex flex-wrap mt-6">
            <div class="w-full text-right">
              <NuxtLink class="text-slate-900" to="/auth/login"
              ><small>Already Have an Account?</small></NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.loading {
  @apply animate-spin;
}
</style>