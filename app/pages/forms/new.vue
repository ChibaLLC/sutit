<script setup lang="ts">
import { toast } from "vue-sonner";
import { authHeaders } from "~/lib/auth-client";
import type { FormSchema } from "~~/shared/types";

definePageMeta({
  middleware: ["auth"],
});

const submitForm = async (form: FormSchema) => {
  try {
    const { data, message } = await $fetch("/api/forms", {
      method: "POST",
      body: form,
      headers: {
        ...(await authHeaders()),
      },
    });
    if (data) {
      await navigateTo("/forms");
    }
  } catch (e) {}
};
</script>
<template>
  <BuilderFormBuilder
    @publish="submitForm"
    @go-back="() => $router.push('/dashboard')"
  />
</template>
