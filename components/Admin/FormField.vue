<script setup lang="ts">
import type {PropType} from 'vue';
import {FieldEnum, type FormField} from "~/types";

const props = defineProps({
  field: {
    type: Object as PropType<FormField>,
    required: true,
  }
})

if (!props.field.label) props.field.label = useCapitalize(props.field.name)

const emits = defineEmits([
  'input',
  'change',
  'blur',
  'focus',
  'click',
  'keyup',
  'keydown',
  'keypress',
  'submit',
  'reset',
  'select',
  'change',
  'input',
  'update:modelValue',
  'update:value'
])

const tag = props.field.type || FieldEnum.TEXT
</script>

<template>
  <label :for="field.id || field.name">{{ field.label }}</label>
  <p v-if="field['description'] && field['description'] !== ''">{{ field.description }}</p>
  <template v-if="tag === FieldEnum.TEXT || tag === FieldEnum.TEL || tag === FieldEnum.EMAIL || tag === FieldEnum.NUMBER">
    <input v-bind="field" v-on="emits" :type="field.type"/>
  </template>
  <template v-else-if="tag === FieldEnum.SELECT">
    <select v-bind="field" v-on="emits">
      <option v-for="option in field['options']" :value="option" :key="option">{{ option }}</option>
    </select>
  </template>
  <template v-else-if="tag === FieldEnum.TEXTAREA">
    <textarea v-bind="field" v-on="emits"/>
  </template>
</template>

<style scoped>
</style>