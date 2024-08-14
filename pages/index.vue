<template>
  <Title>Home</Title>
  <main class="-mt-3">
    <div class="relative pt-16 pb-32 flex content-center items-center justify-center overflow-hidden"
      style="min-height: 75vh;">
      <div class="absolute top-0 w-full h-full">
        <img src="/images/langing.png" alt="landing" class="absolute object-contain h-full" />
        <div id="doodle" class="w-full h-full absolute">
          <div v-for="i in 100" :key="i"></div>
        </div>
      </div>
      <div>
        <div class="items-center flex flex-wrap">
          <div class="w-full lg:w-8/12 px-4 ml-auto mr-auto text-center">
            <div class="p-8 rounded-md faze">
              <h1 class="font-semibold text-5xl text-slate-900">
                Your success story starts with us.
              </h1>
              <p class="mt-4 text-lg mb-3">
                Supply Chain end to end efficiency
                Automate Marketing/Sales, Purchase/Orders, Payments till Receipt/Order Fulfillment😋
              </p>
              <NuxtLink to="/forms"
                class="bg-white text-gray-800 active:bg-gray-100 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 mt-5 hover:bg-slate-300 transition-all duration-500 ease-in-out">
                Get Started
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
      <div class="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden"
        style="height: 70px;">
        <svg class="absolute bottom-0 overflow-hidden" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
          version="1.1" viewBox="0 0 2560 100" x="0" y="0">
          <polygon class="text-gray-300 fill-current" points="2560 0 2560 100 0 100"></polygon>
        </svg>
      </div>
    </div>
    <section class="pb-20 bg-gray-300 -mt-24">
      <div class="container mx-auto px-4">
        <div class="flex flex-wrap">
          <div class="lg:pt-12 pt-6 w-full md:w-4/12 px-4 text-center">
            <div class="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg">
              <div class="px-4 py-5 flex-auto">
                <div
                  class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-red-400">
                  <i class="fas fa-award"></i>
                </div>
                <h6 class="text-xl font-semibold">How It Started</h6>
                <p class="mt-2 mb-4 text-gray-600">
                  Revolutionizing Supply chains by Transforming complexity into simplicity.
                </p>
              </div>
            </div>
          </div>
          <div class="w-full md:w-4/12 px-4 text-center">
            <div class="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg">
              <div class="px-4 py-5 flex-auto">
                <div
                  class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-blue-400">
                  <i class="fas fa-retweet"></i>
                </div>
                <h6 class="text-xl font-semibold">How It's Going</h6>
                <p class="mt-2 mb-4 text-gray-600">
                  Innovation, collaboration, sustainability and Business Intelligence at its core.
                  All Inclusive, seamless and easy to use.
                </p>
              </div>
            </div>
          </div>
          <div class="pt-6 w-full md:w-4/12 px-4 text-center">
            <div class="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg">
              <div class="px-4 py-5 flex-auto">
                <div
                  class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-green-400">
                  <i class="fas fa-fingerprint"></i>
                </div>
                <h6 class="text-xl font-semibold">The Vision</h6>
                <p class="mt-2 mb-4 text-gray-600">
                  Futuristic ubiquitous unified platform where supply chains operate with unparalleled efficiency
                  through the use of cutting-edge technology
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-wrap items-center mt-32">
          <div class="w-full md:w-5/12 px-4 mr-auto ml-auto">
            <div
              class="text-gray-600 p-3 text-center inline-flex items-center justify-center w-16 h-16 mb-6 shadow-lg rounded-full bg-gray-100">
              <i class="fas fa-user-friends text-xl"></i>
            </div>t
            <h3 class="text-3xl mb-2 font-semibold leading-normal">
              Working with us is a pleasure
            </h3>
            <p class="text-lg font-light leading-relaxed mt-4 mb-4 text-gray-700">
              We are here to Co-elevate
              We are a team of dedicated and passionate individuals who are ready to learn and work together for a
              competitive edge to our businesses.
              Ultimate goal is to eliminate inefficiencies, lower costs, and enhance overall supply chain performance.
            </p>
          </div>
          <div class="w-full md:w-4/12 px-4 mr-auto ml-auto">
            <div class="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-pink-600">
              <img alt="..."
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=crop&amp;w=1051&amp;q=80"
                class="w-full align-middle rounded-t-lg" />
              <blockquote class="relative p-8 mb-4">
                <svg preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 583 95"
                  class="absolute left-0 w-full block" style="height: 95px; top: -94px;">
                  <polygon points="-30,95 583,95 583,65" class="text-pink-600 fill-current"></polygon>
                </svg>
                <h4 class="text-xl font-bold text-white">
                  Top Notch Services
                </h4>
                <p class="text-md font-light mt-2 text-white">
                  The Arctic Ocean freezes every winter and much of the sea-ice then thaws every summer, and that
                  process will continue whatever happens.
                </p>
                <p class="text-md font-light mt-0 text-white">
                  We are inevitable, just like the seasons. Robust Business Intelligence (BI) platform
                </p>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="relative py-20">
      <div class="bottom-auto top-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden -mt-20"
        style="height: 80px;">
        <svg class="absolute bottom-0 overflow-hidden" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
          version="1.1" viewBox="0 0 2560 100" x="0" y="0">
          <polygon class="text-white fill-current" points="2560 0 2560 100 0 100"></polygon>
        </svg>
      </div>
      <div class="container mx-auto px-4">
        <div class="items-center flex flex-wrap">
          <div class="w-full md:w-4/12 ml-auto mr-auto px-4">
            <img alt="..." class="max-w-full rounded-lg shadow-lg"
              src="https://images.unsplash.com/photo-1555212697-194d092e3b8f?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=crop&amp;w=634&amp;q=80" />
          </div>
          <div class="w-full md:w-5/12 ml-auto mr-auto px-4">
            <div class="md:pr-12">
              <div
                class="text-pink-600 p-3 text-center inline-flex items-center justify-center w-16 h-16 mb-6 shadow-lg rounded-full bg-pink-300">
                <i class="fas fa-rocket text-xl"></i>
              </div>
              <h3 class="text-3xl font-semibold">A growing company</h3>
              <p class="mt-4 text-lg leading-relaxed text-gray-600">
                We are currently working on a lot of capabilities and functionalities stay tuned!
              </p>
              <ul class="list-none mt-6">

                <li class="py-2">
                  <div class="flex items-center">
                    <div>
                      <span
                        class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-pink-600 bg-pink-200 mr-3"><i
                          class="fab fa-html5"></i></span>
                    </div>
                    <div>
                      <h4 class="text-gray-600">
                        WhatsApp Business Integration ❎
                      </h4>
                    </div>
                  </div>
                </li>
                <li class="py-2">
                  <div class="flex items-center">
                    <div>
                      <span
                        class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-pink-600 bg-pink-200 mr-3"><i
                          class="far fa-paper-plane"></i></span>
                    </div>
                    <div>
                      <h4 class="text-gray-600">
                        Mpesa Paybill/Till Number Integration ❎
                      </h4>
                    </div>
                  </div>
                </li>

                <li class="py-2">
                  <div class="flex items-center">
                    <div>
                      <span
                        class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-pink-600 bg-pink-200 mr-3"><i
                          class="far fa-paper-plane"></i></span>
                    </div>
                    <div>
                      <h4 class="text-gray-600">
                        Tracking turn around time after payment
                      </h4>
                    </div>
                  </div>
                </li>
                <li class="py-2">
                  <div class="flex items-center">
                    <div>
                      <span
                        class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-pink-600 bg-pink-200 mr-3"><i
                          class="fas fa-fingerprint"></i></span>
                    </div>
                    <div>
                      <h4 class="text-gray-600">
                        Mpesa Paybill Automated Reconciliations ✅
                      </h4>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="pt-20 pb-48">
      <div class="container mx-auto px-4">
        <div class="flex flex-wrap justify-center text-center mb-24">
          <div class="w-full lg:w-6/12 px-4">
            <h2 class="text-4xl font-semibold">This is some of us</h2>
            <p class="text-lg leading-relaxed m-4 text-gray-600">
              sutit.org
            </p>
          </div>
        </div>
        <div class="flex flex-wrap">
          <div class="w-full md:w-6/12 lg:w-3/12 lg:mb-0 mb-12 px-4">
            <div class="px-6">
              <img alt="..." src="/images/profile_placeholder.webp" class="shadow-lg rounded-full max-w-full mx-auto"
                style="max-width: 120px;" />
              <div class="pt-6 text-center">
                <h5 class="text-xl font-bold">Saxo Munene</h5>
                <p class="mt-1 text-sm text-gray-500 uppercase font-semibold">
                  Supply Chain Acquisition Specialist
                </p>
                <div class="mt-6">
                  <button class="bg-blue-400 text-white w-8 h-8 rounded-full outline-none focus:outline-none mr-1 mb-1"
                    type="button">
                    <i class="fab fa-twitter"></i></button>
                  <button class="bg-blue-600 text-white w-8 h-8 rounded-full outline-none focus:outline-none mr-1 mb-1"
                    type="button">
                    <i class="fab fa-facebook-f"></i></button>
                  <button class="bg-pink-500 text-white w-8 h-8 rounded-full outline-none focus:outline-none mr-1 mb-1"
                    type="button">
                    <i class="fab fa-dribbble"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="w-full md:w-6/12 lg:w-3/12 lg:mb-0 mb-12 px-4">
            <div class="px-6">
              <img alt="..." src="/images/profile_placeholder.webp" class="shadow-lg rounded-full max-w-full mx-auto"
                style="max-width: 120px;" />
              <div class="pt-6 text-center">
                <h5 class="text-xl font-bold">Allen</h5>
                <p class="mt-1 text-sm text-gray-500 uppercase font-semibold">
                  Compliance Specialist
                </p>
                <div class="mt-6">
                  <button class="bg-red-600 text-white w-8 h-8 rounded-full outline-none focus:outline-none mr-1 mb-1"
                    type="button">
                    <i class="fab fa-google"></i></button>
                  <button class="bg-blue-600 text-white w-8 h-8 rounded-full outline-none focus:outline-none mr-1 mb-1"
                    type="button">
                    <i class="fab fa-facebook-f"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="w-full md:w-6/12 lg:w-3/12 lg:mb-0 mb-12 px-4">
            <div class="px-6">
              <img alt="..." src="/images/profile_placeholder.webp" class="shadow-lg rounded-full max-w-full mx-auto"
                style="max-width: 120px;" />
              <div class="pt-6 text-center">
                <h5 class="text-xl font-bold">Bosire Allan</h5>
                <p class="mt-1 text-sm text-gray-500 uppercase font-semibold">
                  Founding Partner
                </p>
                <div class="mt-6">
                  <button class="bg-red-600 text-white w-8 h-8 rounded-full outline-none focus:outline-none mr-1 mb-1"
                    type="button">
                    <i class="fab fa-google"></i></button>
                  <button class="bg-blue-400 text-white w-8 h-8 rounded-full outline-none focus:outline-none mr-1 mb-1"
                    type="button">
                    <i class="fab fa-twitter"></i></button>
                  <button class="bg-gray-800 text-white w-8 h-8 rounded-full outline-none focus:outline-none mr-1 mb-1"
                    type="button">
                    <i class="fab fa-instagram"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="w-full md:w-6/12 lg:w-3/12 lg:mb-0 mb-12 px-4">
            <div class="px-6">
              <img alt="..." src="/images/profile_placeholder.webp" class="shadow-lg rounded-full max-w-full mx-auto"
                style="max-width: 120px;" />
              <div class="pt-6 text-center">
                <h5 class="text-xl font-bold">Antoney Sydney</h5>
                <p class="mt-1 text-sm text-gray-500 uppercase font-semibold">
                  Founding Partner
                </p>
                <div class="mt-6">
                  <button class="bg-pink-500 text-white w-8 h-8 rounded-full outline-none focus:outline-none mr-1 mb-1"
                    type="button">
                    <i class="fab fa-dribbble"></i></button>
                  <button class="bg-red-600 text-white w-8 h-8 rounded-full outline-none focus:outline-none mr-1 mb-1"
                    type="button">
                    <i class="fab fa-google"></i></button>
                  <button class="bg-blue-400 text-white w-8 h-8 rounded-full outline-none focus:outline-none mr-1 mb-1"
                    type="button">
                    <i class="fab fa-twitter"></i></button>
                  <button class="bg-gray-800 text-white w-8 h-8 rounded-full outline-none focus:outline-none mr-1 mb-1"
                    type="button">
                    <i class="fab fa-instagram"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="pb-20 relative block bg-gray-900">
      <div class="bottom-auto top-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden -mt-20"
        style="height: 80px;">
        <svg class="absolute bottom-0 overflow-hidden" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
          version="1.1" viewBox="0 0 2560 100" x="0" y="0">
          <polygon class="text-gray-900 fill-current" points="2560 0 2560 100 0 100"></polygon>
        </svg>
      </div>
      <div class="container mx-auto px-4 lg:pt-24 lg:pb-64">
        <div class="flex flex-wrap justify-center">
          <div class="w-full lg:w-6/12 px-4">
            <h2 class="text-4xl font-semibold text-white">Build something</h2>
            <p class="text-lg leading-relaxed mt-4 mb-4 text-gray-500 text-balance">
              Be among the first and get early access to our platform.
              <br>
              Use our API to integrate payments into your platform.
              <br>
              Use our Forms to collect payments from your clients.
              <br>
              Use our WhatsApp Business Integration to collect payments from your clients.
              <br>
              Use our Dashboard to view and manage your transactions, trends and reports.
            </p>
          </div>
        </div>
      </div>
    </section>
    <section class="relative block py-24 lg:pt-0 bg-gray-900">
      <div class="container mx-auto px-4">
        <div class="flex flex-wrap justify-center lg:-mt-64 -mt-32">
          <div class="w-full lg:w-6/12 px-4">
            <div class="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-gray-300">
              <div class="flex-auto p-5 lg:p-10">
                <h4 class="text-2xl font-semibold">Want to work with us?</h4>
                <p class="leading-relaxed mt-1 mb-4 text-gray-600">
                  Complete this form and we will get back to you in 24 hours.
                </p>
                <div class="relative w-full mb-3 mt-8">
                  <label class="block uppercase text-gray-700 text-xs font-bold mb-2" for="full-name">Full
                    Name</label><input type="text"
                    class="border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    placeholder="Full Name" style="transition: all 0.15s ease 0s;" />
                </div>
                <div class="relative w-full mb-3">
                  <label class="block uppercase text-gray-700 text-xs font-bold mb-2" for="email">Email</label><input
                    type="email"
                    class="border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    placeholder="Email" style="transition: all 0.15s ease 0s;" />
                </div>
                <div class="relative w-full mb-3">
                  <label class="block uppercase text-gray-700 text-xs font-bold mb-2" for="message">About
                    you</label><textarea rows="4" cols="80"
                    class="border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    placeholder="..."></textarea>
                </div>
                <div class="text-center mt-6">
                  <button
                    class="bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                    type="button" style="transition: all 0.15s ease 0s;">
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
<style scoped>
.faze {
  @apply bg-slate-100/60;
  @apply backdrop-blur-2xl;
}

#doodle {
  @apply grid;
  @apply grid-cols-10;
  @apply grid-rows-10;
  cursor: none;
}

#doodle div {
  @apply bg-slate-500/50;
  @apply opacity-70;
  @apply w-full;
  @apply h-full;
}

#doodle div:hover {
  @apply bg-slate-500/100;
  @apply animate-pulse;
}
</style>
<script setup lang="ts">
definePageMeta({
  middleware: 'dash'
})
</script>