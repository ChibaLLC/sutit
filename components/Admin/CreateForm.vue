<script setup lang="ts">
import {
  FieldEnum,
  type FormField,
} from "~/types";
import Modal from "~/components/Modal.vue";

const fields = shallowRef<Array<FormField>>([])
const field = reactive<FormField>({} as FormField)
const modal = ref(false)

function add() {
  fields.value.push(field)

  field.name = ''
  field.description = ''
  field.required = false
  field.type = FieldEnum.TEXT
}

function submit() {
  const response = useAuthFetch('/api/v1/forms/create', {
    method: 'POST',
    body: JSON.stringify(fields.value)
  })
}
</script>
<template>
  <form @submit.prevent="submit">
    <div v-for="field in fields" :key="field.name">
      <FormField :field="field"/>
    </div>
    <Modal title="Add Field" :open="modal" @close="modal = false; add" @cancel="modal = false">
      <div>
        <label for="name">Name</label>
        <input v-model="field.name" type="text" id="title"/>
      </div>
      <div>
        <label for="description">Description</label>
        <input v-model="field.description" type="text" id="description"/>
      </div>
      <div>
        <label for="required">Required</label>
        <input v-model="field.required" type="checkbox" id="required"/>
      </div>
      <div>
        <label for="type">Type</label>
        <select v-model="field.type" id="type">
          <option v-for="type in Object.values(FieldEnum)" :key="type">{{ type }}</option>
        </select>
      </div>
    </Modal>
    <div>
      <button @click="modal = true">Add Field</button>
      <button type="submit">Submit</button>
    </div>
  </form>
</template>