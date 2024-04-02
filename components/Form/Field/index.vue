<script setup lang="ts">
import {FieldEnum, type FormField} from "~/types";
import type {Ref} from "vue";

const props = defineProps({
  field: {
    type: Object as PropType<FormField>,
    required: false,
    default: null,
  },
  preview: {
    type: Object as PropType<Ref>,
    required: false,
  }
})

const form_field = ref(props.field)
const value = ref()

const emit = defineEmits(['form', 'value'])

const tag = props.field?.type || FieldEnum.TEXT
const view = props.preview ?? false

watch(form_field.value, (value) => {
  emit('form', value)
})

watch(value, () => {
  emit('value', value.value)
})
</script>

<template>
  <div class="form-group">
    <div class="flex flex-col" v-if="!view">
      <label
          class="text-white label dark:text-slate-900 font-semibold mb-0.5 text-md ml-1"
          style="width: fit-content">
        Name
      </label>
      <input
          class="text-white input label dark:text-slate-900 font-semibold mb-1.5"
          style="width: fit-content"
          required
          type="text"
          placeholder="Add a label"
          v-model="form_field['name']"/>
    </div>
    <div class="flex flex-col mt-1" v-if="!view">
      <label
          class="text-white label dark:text-slate-900 font-semibold mb-0.5 text-md ml-1"
          style="width: fit-content"
      >Description</label>
      <textarea
          class="text-gray-700 dark:text-slate-800 text-sm mb-2 input"
          placeholder="(Optional) add a description"
          v-model="form_field['description']"
      ></textarea>
    </div>

    <label v-if="view" class="ml-1 text-white dark:text-slate-900 font-semibold mb-1.5 text-lg capitalize">
      {{ form_field['name'] }}
    </label>
    <p v-if="view" class="ml-2 text-gray-400 dark:text-gray-500 text-sm mb-2">{{ form_field['description'] }}</p>

    <template
        v-if="view && (tag === FieldEnum.TEXT || tag === FieldEnum.TEL || tag === FieldEnum.EMAIL || tag === FieldEnum.NUMBER || tag === FieldEnum.PASSWORD || tag === FieldEnum.FILE || tag === FieldEnum.DATE || tag === FieldEnum.TIME || tag === FieldEnum.CHECKBOX)">
      <input :type="tag" v-model="value" class="input"/>
    </template>

    <template v-else-if="tag === FieldEnum.SELECT">
      <select v-model="value" class="select">
        <option v-for="option in field['options']" :value="option" :key="option">{{ option }}</option>
      </select>
    </template>

    <template v-else-if="tag === FieldEnum.TEXTAREA" class="textarea">
      <textarea v-model="value"/>
    </template>
  </div>
</template>

<style scoped>
.form-group {
  @apply mb-4;
  @apply flex flex-col;
  @apply pl-4 pr-4 mb-4;
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

.input[type="checkbox"] {
  @apply h-5;
  @apply w-5;
  @apply border-0;
  @apply rounded-md;
  @apply bg-gray-200;
  @apply dark:bg-gray-800;
  @apply text-gray-600;
  @apply dark:text-gray-400;
  @apply cursor-pointer;
  @apply ml-2;
}

.input[type="checkbox"]:checked {
  @apply bg-blue-500;
  @apply dark:bg-blue-400;
  @apply text-white;
  @apply dark:text-white;
}

.input[type="radio"] {
  @apply h-5;
  @apply w-5;
  @apply border-0;
  @apply rounded-full;
  @apply bg-gray-200;
  @apply dark:bg-gray-800;
  @apply text-gray-600;
  @apply dark:text-gray-400;
  @apply cursor-pointer;
}

.input[type="radio"]:checked {
  @apply bg-blue-500;
  @apply dark:bg-blue-400;
  @apply text-white;
  @apply dark:text-white;
}

.input:focus {
  @apply ring-2;
  @apply ring-offset-2;
  @apply ring-blue-500;
  @apply dark:ring-blue-400;
  @apply outline-none;
}

.input::placeholder {
  @apply text-gray-400;
  @apply dark:text-gray-500;
}

.select {
  @apply w-full;
  @apply h-10;
  @apply px-3;
  @apply py-2;
  @apply text-sm;
  @apply rounded-md;
  @apply border;
  @apply appearance-none;
  @apply cursor-pointer;
  @apply bg-white;
  @apply dark:bg-gray-800;
  @apply text-gray-700;
  @apply dark:text-gray-300;
  @apply border-gray-300;
  @apply dark:border-gray-700;
}

.select:focus {
  @apply ring-2;
  @apply ring-offset-2;
  @apply ring-blue-500;
  @apply dark:ring-blue-400;
  @apply outline-none;
}

.select option {
  @apply bg-white;
  @apply dark:bg-gray-800;
  @apply text-gray-700;
  @apply dark:text-gray-300;
}

.textarea {
  @apply w-full;
  @apply px-3;
  @apply py-2;
  @apply text-sm;
  @apply rounded-md;
  @apply border;
  @apply appearance-none;
  @apply cursor-text;
  @apply bg-white;
  @apply dark:bg-gray-800;
  @apply text-gray-700;
  @apply dark:text-gray-300;
  @apply border-gray-300;
  @apply dark:border-gray-700;
}

.textarea:focus {
  @apply ring-2;
  @apply ring-offset-2;
  @apply ring-blue-500;
  @apply dark:ring-blue-400;
  @apply outline-none;
}

.textarea::placeholder {
  @apply text-gray-400;
  @apply dark:text-gray-500;
}

textarea .input {
  @apply border-0;
  @apply bg-transparent;
  @apply text-white;
  @apply dark:text-slate-900;
  @apply font-semibold;
  @apply mb-2;
}
</style>