<script setup lang="ts">
import type { Stores, Forms, FormStoreData } from "@chiballc/nuxt-form-builder";
import { RealTime } from "#imports";

type ServerForm = {
  forms: Omit<Drizzle.Form.select, 'pages'> & {
    pages: Forms
  },
  stores: Omit<Drizzle.Store.select, 'store'> & {
    store: Stores
  }
}

const loading = ref(false)
const ulid = useRoute().params?.formUlid
const rerender = ref(false)
const complete = ref(false)

const res = await useFetch<APIResponse<ServerForm>>(`/api/v1/forms/${ulid}`, {
  onResponseError({ response }) {
    console.log(response)
  }
}).catch(console.error)

const data = res?.data.value?.body || {} as ServerForm
const paymentModal = ref(false)
const payment_details = ref({
  phone: ''
})

function hasPrice(form: Omit<Drizzle.Form.select, 'pages'> & { pages: Forms }): boolean {
  return form.price > 0
}

function hasPhone() {
  return payment_details.value.phone.length >= 10
}

async function processForm() {
  loading.value = true
  paymentModal.value = false
  if (
    hasPrice(data.forms) &&
    !hasPhone()
  ) {
    paymentModal.value = true
  } else if (hasPrice(data.forms) && hasPhone()) {
    console.log("Submitting form", data)
    await submit()
  } else if (!hasPrice(data.forms)) {
    console.log("Submitting form", data)
    await submit()
  }
}

const realtime = ref<RealTime | null>(null)
onUnmounted(() => {
  realtime.value?.close()
  realtime.value = null
})

onMounted(() => {
  realtime.value = new RealTime()
})

async function submit() {
  loading.value = true
  await $fetch(`/api/v1/forms/submit/${ulid}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAuthToken()}`
    },
    body: {
      forms: data.forms,
      stores: data.stores,
      phone: payment_details.value.phone
    },
    onResponse({ response }): Promise<void> | void {
      if (response._data.statusCode <= 299) {
        if (!hasPrice(data.forms)) {
          loading.value = true
          rerender.value = false
          alert('Form submitted successfully')
          setTimeout(() => {
            navigateTo(`/`)
          })
          return
        }

        const channelName = createChannelName(response._data.body.checkoutRequestID, response._data.body.merchantRequestID)
        alert('Form submitted for processing.' + hasPrice(data.forms) ? 'Please complete payment via the pop up on your phone' : '')
        realtime.value!.subscribe(channelName)
        realtime.value!.on('error', (error) => {
          debugger
          console.error(error)
        })

        realtime.value!.on("data", (_data: any) => {
          const data = parseData(_data)
          if (data.channel !== channelName) return console.warn('Invalid channel', data)
          switch (data?.type) {
            case TYPE.SUCCESS:
              loading.value = true
              rerender.value = false
              alert('Form submitted successfully')
              setTimeout(() => {
                navigateTo(`/`)
              }, 1000)
              break
            case TYPE.ERROR:
              switch (data.statusCode) {
                case Status.badRequest:
                  log.error(data.body)
                  rerender.value = true
                  loading.value = false
                  complete.value = false
                  break
                case Status.internalServerError:
                  rerender.value = true
                  loading.value = false
                  complete.value = false
                  break
                case Status.unprocessableEntity:
                  alert(data.body)
                  rerender.value = true
                  loading.value = false
                  complete.value = false
                  break
              }
            default:
              rerender.value = true
              loading.value = false
              complete.value = false
          }
        })
      } else {
        alert('Form submission failed: ' + response._data.body)
        rerender.value = true
      }
    },
    onResponseError({ response }) {
      log.error(response)
    }
  })
}

function addCharge(amount: number) {
  if (data.forms.price) {
    data.forms.price += amount
  } else {
    data.forms.price = amount
  }
}

const formStoreData = computed(() => {
  return {
    forms: data.forms.pages,
    stores: data.stores.store
  } satisfies FormStoreData
})

function goBack() {
  loading.value = false
  rerender.value = true
  complete.value = false
}

function goBack2(){
  if (data?.forms?.allowGroups && group.chosen){
    group.chosen = false
  } else {
    window.history.back()
  }
}

function completeForm() {
  complete.value = true
}

const group = reactive({
  chosen: false,
  self: false
})


function chooseSelfOrGroup(e: Event) {
  if ((e.target as HTMLElement).id === "for_me") {
    group.self = true
  } else {
    group.self = false
  }
  group.chosen = true
}

function isEmail(val: string) {
  return val.includes("@")
}

function isPhone(val: string) {
  const regex = /^\+?\d{1,3}([ -]?\d{2,4}){2,4}$/
  const exp = new RegExp(regex)
  return exp.test(val)
}

const inviteTexts = ref('')
class Invite<T extends { email: string } | { phone: string } = any> extends Set<T> {
  override has(value: T | string) {
    return !!this.get(value)
  }

  get(value: T | string) {
    let email: string | undefined = undefined;
    let phone: string | undefined = undefined;

    if (typeof value === "string") {
      if (isEmail(value) || !isPhone(value)) {
        email = value.trim()
        if (!email.includes('@')) {
          email = `${email}@gmail.com`
        }
      } else {
        phone = value.trim()
      }
    } else {
      email = (value as { email?: string })?.email
      phone = (value as { phone?: string })?.phone
    }

    for (const item of this) {
      if ((item as { email?: string }).email === email || (item as { phone?: string }).phone === phone) return item
    }

    return undefined
  }

  override delete(value: T | string): boolean {
    const item = this.get(value);
    if (item) {
      return super.delete(item);
    }

    return false;
  }
}

const invites = ref<Invite>(new Invite())

function copyInviteLink() {
  loading.value = true
  $fetch("/api/auth/onboard/invite/link", {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`
    },
    method: "POST",
    async onResponse({ response }) {
      loading.value = false
      if (!response.ok) return

      const { link } = response._data
      navigator.clipboard.writeText(link)
      navigator.share?.({ title: 'Invite Link', text: link, url: link })
    }
  })
}

function addPhoneOrEmail() {
  const parts = inviteTexts.value.split(',')
  for (const part of parts) {
    let text = part.trim()
    if (!text) continue
    if (isEmail(text) || !isPhone(text)) {
      if (!text.includes('@')) {
        text = `${text}@gmail.com`
      }
      invites.value.add({ email: text })
    } else if (isPhone(text)) {
      invites.value.add({ phone: text })
    } else {
      console.warn("Illegal Text Input Found: ", text)
    }
  }

  clearText()
}


const invitesInput = ref()
const hidePlaceholder = ref(false)
function clearText() {
  const element = invitesInput.value
  if (!element) return console.warn("No input element found")
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && node.nodeValue?.includes(inviteTexts.value)) {
      node.remove()
    }
  }
}

function getText() {
  const element = invitesInput.value
  if (!element) return ''
  let textAcc = ''
  for (let i = 0; i < element.childNodes.length; i++) {
    const node = element.childNodes[i]
    if (node.nodeType === Node.TEXT_NODE) {
      textAcc += node.textContent
    }
  }
  return textAcc.trim()
}

function showPlaceholder() {
  hidePlaceholder.value = !!getText() || invites.value.size > 0
}

function addText() {
  inviteTexts.value = getText()
}
</script>

<template>
  <Title>Form | {{ data.forms.formName }}</Title>
  <div class="flex min-h-screen">
    <div class="flex flex-col p-2 w-full max-w-[820px] ml-auto mr-auto shadow-2xl h-fit mt-4 rounded-md">
      <div class="header">
        <h1 class="text-2xl p-2 font-bold flex items-center content-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8">
            <path d="M17 6.1H3"></path>
            <path d="M21 12.1H3"></path>
            <path d="M15.1 18H3"></path>
          </svg>
          <span class="ml-2">{{ data.forms.formName }}</span>
        </h1>
        <p class="bg-slate-700 w-full px-4 py-2 pl-12 rounded" v-if="data.forms.formDescription">
          {{ data.forms.formDescription }}
        </p>
      </div>
      <form class="pb-4 mt-2 min-h-max" @submit.prevent v-if="!data?.forms?.allowGroups || group.self">
        <LazyFormViewer :data="formStoreData" @submit="completeForm" :re-render="rerender" @price="addCharge" @back="goBack2"
          :show-spinner="loading" />
        <div class="flex w-full px-4 ml-0.5 relative justify-between flex-wrap gap-2 mt-2">
          <small class="text-gray-500 w-fit" v-if="data.forms.price > 0">
            This form requires payment for submission of <br>
            <span class="text-red-400">Amount Due: {{ data.forms.price }}</span> KES
          </small>
          <div>
            <button v-if="complete" @click="goBack" class="bg-slate-700 text-white rounded px-4 py-2 mr-2">
              Back
            </button>
            <button v-if="complete" @click="processForm" class="bg-emerald-700 text-white rounded px-4 py-2">
              Submit
            </button>
          </div>
        </div>
      </form>
      <form @submit.prevent v-if="data?.forms?.allowGroups && !group.chosen" class="w-full grid place-items-center">
        <div class="flex flex-wrap">
          <label for="for_me" class="flex text-xl font-bold items-center m-2 gap-2 px-4 py-2 hover:bg-gray-200 cursor-pointer rounded">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
              <path
                d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z">
              </path>
            </svg>
            Continue For Me
            <input type="radio" id="for_me" name="fill_for" class="hidden" @change="chooseSelfOrGroup" />
          </label>
          <label for="for_group"
            class="flex text-xl font-bold items-center m-2 gap-2 px-4 py-2 hover:bg-gray-200 rounded cursor-pointer">
            <input type="radio" id="for_group" name="fill_for" class="hidden" @change="chooseSelfOrGroup" />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
              <path
                d="M2 22C2 17.5817 5.58172 14 10 14C14.4183 14 18 17.5817 18 22H16C16 18.6863 13.3137 16 10 16C6.68629 16 4 18.6863 4 22H2ZM10 13C6.685 13 4 10.315 4 7C4 3.685 6.685 1 10 1C13.315 1 16 3.685 16 7C16 10.315 13.315 13 10 13ZM10 11C12.21 11 14 9.21 14 7C14 4.79 12.21 3 10 3C7.79 3 6 4.79 6 7C6 9.21 7.79 11 10 11ZM18.2837 14.7028C21.0644 15.9561 23 18.752 23 22H21C21 19.564 19.5483 17.4671 17.4628 16.5271L18.2837 14.7028ZM17.5962 3.41321C19.5944 4.23703 21 6.20361 21 8.5C21 11.3702 18.8042 13.7252 16 13.9776V11.9646C17.6967 11.7222 19 10.264 19 8.5C19 7.11935 18.2016 5.92603 17.041 5.35635L17.5962 3.41321Z">
              </path>
            </svg>
            Continue For Group
          </label>
        </div>
      </form>
      <form @submit.prevent v-if="group.chosen && !group.self" class="mt-2">
        <label for="members" class="mt-4">Add the phone numbers or emails for your members.</label>
        <div class="relative">
          <div @keydown.enter.prevent="addPhoneOrEmail" contenteditable="true" @keyup.,.prevent="addPhoneOrEmail"
            id="members"
            class="block w-full text-sm text-gray-900 bg-gray-50 rounded border border-gray-300 focus:outline-none focus:ring-navy focus:border-navy textarea has-placeholder"
            ref="invitesInput" @focusin="hidePlaceholder = true" @focusout="showPlaceholder" @input="addText">
            <span class="placeholder" v-if="!hidePlaceholder">
              Example: allan@gmail.com, 0712345678, +254712345678, boni@mail.com, etc.
            </span>
            <br v-if="invites.size > 0">
            <div v-for="invite in invites" class="bg-navy text-white rounded p-0.5 invite mt-1" :key="invite.email">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"
                v-if="invite?.email">
                <path
                  d="M21.7267 2.95694L16.2734 22.0432C16.1225 22.5716 15.7979 22.5956 15.5563 22.1126L11 13L1.9229 9.36919C1.41322 9.16532 1.41953 8.86022 1.95695 8.68108L21.0432 2.31901C21.5716 2.14285 21.8747 2.43866 21.7267 2.95694ZM19.0353 5.09647L6.81221 9.17085L12.4488 11.4255L15.4895 17.5068L19.0353 5.09647Z">
                </path>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" v-else class="h-4 w-4">
                <path
                  d="M6.45455 19L2 22.5V4C2 3.44772 2.44772 3 3 3H21C21.5523 3 22 3.44772 22 4V18C22 18.5523 21.5523 19 21 19H6.45455ZM5.76282 17H20V5H4V18.3851L5.76282 17ZM11 10H13V12H11V10ZM7 10H9V12H7V10ZM15 10H17V12H15V10Z">
                </path>
              </svg>
              <p class="mx-0.5">
                {{ invite.email || invite.phone }}
              </p>
              <button type="button" @click="invites.delete(invite)" class="hover:text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3">
                  <path
                    d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z">
                  </path>
                </svg>
              </button>
            </div>
          </div>
          <small class="help has-text-grey">Press <code>Enter</code> or <code>,</code> to add an email</small>
        </div>
        <div class="mt-2">
          <button type="button" @click="group.chosen = false" class="px-4 py-2 bg-gray-200 rounded">Back</button>
        </div>
      </form>
      <Modal :show="paymentModal" name="Please provide your MPESA phone number" @confirm="processForm"
        @cancel="payment_details = { phone: '' }; paymentModal = false; loading = false">
        <div class="flex flex-col">
          <input type="tel" class="input" placeholder="MPESA Phone Number" v-model="payment_details.phone" />
        </div>
      </Modal>
    </div>
  </div>
</template>

<style scoped>
code {
  background-color: rgba(255, 0, 0, 0.1);
  border-radius: 4px;
  padding: 2px 4px;
  font-size: smaller;
  color: rgb(54, 0, 0);
}

.header {
  @apply bg-slate-600;
  @apply rounded-md;
  @apply text-white;
}

.input {
  @apply w-full;
  @apply h-10;
  @apply px-3;
  @apply py-2;
  @apply text-sm;
  @apply rounded-md;
  @apply border;
  @apply mb-4;
}

.has-placeholder {
  --padding: calc(.75em - 1px);
}

.textarea {
  height: fit-content;
  min-height: 100px;
  font-size: 0.9rem;
  padding: var(--padding);
}

.has-placeholder .placeholder {
  position: absolute;
  font-size: 0.9rem;
  color: #A0AEC0;
  pointer-events: none;
  top: 0;
  padding-top: var(--padding);
}

.invite {
  display: flex;
  width: fit-content;
  max-width: 100%;
  justify-content: start;
  align-items: center;
  cursor: pointer;
  font-size: medium;
}

.invite p {
  max-width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.invite button {
  margin-top: 2px;
}

.invite p:hover {
  max-width: unset;
  overflow: visible;
  white-space: normal;
}

.invite:has(p:hover) {
  max-width: unset;
  width: fit-content;
}
</style>