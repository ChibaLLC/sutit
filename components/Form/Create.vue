<script setup lang="ts">
import {h, render} from 'vue'
import {FieldEnum, type APIResponse, type FormField, type Select, type Textarea} from "~/types";
import {v4} from "uuid";

const svgs = {
  text: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
             stroke-linejoin="round" class="h-4 w-4">
          <path d="M17 6.1H3"></path>
          <path d="M21 12.1H3"></path>
          <path d="M15.1 18H3"></path>
        </svg>`,
  checkbox: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                 stroke-linejoin="round" class="h-4 w-4">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>`,
  date: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
             stroke-linejoin="round" class="h-4 w-4">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
          <line x1="16" x2="16" y1="2" y2="6"></line>
          <line x1="8" x2="8" y1="2" y2="6"></line>
          <line x1="3" x2="21" y1="10" y2="10"></line>
        </svg>`
}
const FormFieldComponent = resolveComponent('FormField')
const preview = ref(false)
const formFields = ref<Set<FormField>>(new Set())
const payment = ref(false)

const payment_details = ref({
  amount: 0
})

async function submit() {
  const payload: {
    name: string,
    payment: {
      amount: number,
    },
    fields: FormField[]
  } = {
    name: v4(),
    payment: {
      amount: payment_details.value.amount,
    },
    fields: Array.from(formFields.value)
  }

  const res = await unFetch<APIResponse>('/api/v1/forms/create', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${getAuthToken()}`
    }
  });
  if (res.statusCode === 200) {
    alert('Form created successfully');
    navigateTo('/forms');
  } else {
    alert('Form creation failed');
    console.error(res);
  }
}


function createFormField(name: string | null) {
  if (!name) return console.error('Name not found')
  switch (name as FieldEnum) {
    case FieldEnum.TEXTAREA:
      return {
        name: '',
        type: name as FieldEnum,
        required: false,
        placeholder: 'Add a label',
        rows: 3
      } satisfies Textarea
    case FieldEnum.SELECT:
      return {
        name: '',
        type: name as FieldEnum,
        required: false,
        placeholder: 'Add a label',
        options: []
      } satisfies Select
    default:
      return {
        name: '',
        type: name as FieldEnum,
        required: false,
        placeholder: 'Add a label',
      } satisfies FormField
  }
}

onMounted(() => {
  const dropZone = document.getElementById('drop-zone')
  const container = document.querySelector('#drop-zone .container')
  const draggables = document.querySelectorAll('[draggable=true]')
  const hint = document.querySelector('#drop-zone .hint')
  if (!container) return console.error('Container not found')

  let currentDraggable: Element | null = null

  draggables?.forEach(draggable => {
    draggable.addEventListener('dragstart', () => {
      if (currentDraggable === draggable) return
      draggable.classList.add('dragging')
      currentDraggable = draggable
    })
    draggable.addEventListener('dragend', () => {
      draggable.classList.remove('dragging')
    })
  })

  dropZone?.addEventListener('dragover', (e) => {
    e.preventDefault()
    if (dropZone.classList.contains('hovered')) return
    dropZone.classList.add('hovered')
  })
  dropZone?.addEventListener('dragleave', () => {
    dropZone.classList.remove('hovered')
  })
  dropZone?.addEventListener('drop', (e) => {
    e.preventDefault()
    dropZone.classList.remove('hovered')
    dropZone.querySelector('.container')?.classList.remove('border-dashed')

    if (hint) hint.remove()
    const draggable = currentDraggable
    if (!draggable) return console.error('Draggable not found')
    const anchor = document.createElement('div')
    const field = createFormField(draggable.getAttribute('data-name'))
    render(h(FormFieldComponent, {
      field: field,
      preview: preview,
      onForm: (value: FormField) => {
        formFields.value.add(value)
      }
    }), anchor)
    container.appendChild(anchor)
  })
})
</script>

<template>
  <Title>Forms</Title>

  <div class="flex-1 flex min-h-screen">
    <Aside/>
    <main class="flex-1 flex flex-col p-4 gap-4 md:p-6 md:gap-6">
      <section class="flex flex-col gap-4">
        <div class="grid gap-4">
          <div class="rounded-lg border bg-card text-card-foreground shadow-sm" data-v0-t="card">
            <div class="flex flex-col space-y-1.5 p-6">
              <h3
                  class="text-2xl font-semibold whitespace-nowrap leading-none tracking-tight">Form Fields</h3>
              <p class="text-sm text-muted-foreground">
                Drag and drop fields to add them to your form
              </p></div>
            <div class="p-0">
              <div class="grid gap-4 p-4 boxes">
                <FormFieldChoice :display-name="`Text`" :demo="true" :svg="svgs.text" :data-name="FieldEnum.TEXT"/>
                <FormFieldChoice :display-name="`Checkbox`" :demo="true" :svg="svgs.checkbox"
                                 :data-name="FieldEnum.CHECKBOX"/>
                <FormFieldChoice :display-name="`Date`" :demo="true" :svg="svgs.date"
                                 :data-name="FieldEnum.DATE"/>
              </div>
            </div>
          </div>
          <div class="rounded-lg border bg-card text-card-foreground shadow-sm" data-v0-t="card">
            <div class="flex flex-col space-y-1.5 p-6">
              <div class="flex">
                <h3 class="text-2xl font-semibold whitespace-nowrap leading-none tracking-tight">Form
                  Preview</h3>
                <div class="ml-auto">
                  <button
                      type="button"
                      class="bg-primary/90 text-white dark:bg-slate-900 px-4 py-2 rounded shadow-sm hover:bg-primary transition-colors"
                      @click="preview = !preview"
                  >
                    Preview
                  </button>
                </div>
              </div>
              <p class="text-sm text-muted-foreground">
                Drop the fields here to build the form
              </p></div>
            <div class="p-6" id="drop-zone">
              <div
                  class="h-[400px] border-dashed border-2 border-gray-200 rounded-lg dark:border-gray-800 container p-2 pt-4 overflow-y-scroll">
                <div class="flex items-center justify-center h-full text-2xl text-gray-500 dark:text-gray-400 hint">
                  Form Preview
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="flex w-full justify-center">
        <button
            type="button"
            class="justify-self-end bg-emerald-500 text-emerald-50 px-4 py-2 rounded-lg shadow-sm hover:bg-emerald-600 transition-colors"
            @click="preview = true; submit()"
        >
          Save Form
        </button>
        <button
            type="button"
            @click="payment = true"
            class="justify-self-end bg-red-400 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-primary/90 transition-colors ml-4"
        >Require Payment
        </button>
        <Modal :open="payment" @close="payment = false;" @cancel="payment = false"
               title="Add Payment">
          <div class="p-4">
            <div class="form-group">
              <label for="amount" class="text-white dark:text-slate-900 font-semibold mb-2">Amount in KES</label>
              <input type="number" id="amount" class="input" v-model="payment_details.amount"/>
            </div>
          </div>
        </Modal>
      </section>
    </main>
  </div>
</template>

<style scoped>
#drop-zone.hovered {
  border-color: #2563eb;
  background-color: rgba(37, 99, 235, 0.1);
  transition: background-color 0.3s;
}

.boxes {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.input {
  @apply w-full;
  @apply h-10;
  @apply px-3;
  @apply py-2;
  @apply text-sm;
  @apply rounded-md;
  @apply border;
}

</style>