<script setup lang="ts">
import { ref } from "vue";
import { toast } from "vue-sonner";
import { authHeaders } from "~/lib/auth-client";
import type { FormSchema } from "~~/shared/types";

definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const isSubmitting = ref(false);

const { data: form, pending, error } = await useFetch(`/api/forms/${route.params.id}`, {
  headers: { ...(await authHeaders()) },
});

const handleSubmit = async (formData: FormSchema) => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    await $fetch(`/api/forms/${route.params.id}`, {
      method: "PUT",
      body: formData,
      headers: { ...(await authHeaders()) },
    });

    toast.success("Form updated successfully");
    await navigateTo("/forms");
  } catch (err: any) {
    const status = err?.statusCode ?? err?.status;
    const msg = err?.data?.message || err?.message || "Something went wrong";

    if (status === 404) {
      toast.error("Form not found");
      await navigateTo("/forms");
    } else if (status === 401) {
      toast.error("Session expired");
      await navigateTo("/auth/login");
    } else {
      toast.error("Failed to update form", { description: msg });
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div v-if="pending" class="flex items-center justify-center min-h-screen">
    <div class="flex flex-col items-center gap-3">
      <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p class="text-sm text-muted-foreground">Loading form...</p>
    </div>
  </div>

  <div v-else-if="error" class="flex items-center justify-center min-h-screen p-4">
    <Card class="max-w-sm w-full">
      <CardContent class="pt-6 text-center space-y-4">
        <p class="text-sm text-muted-foreground">{{ error.message || "Form not found" }}</p>
        <Button @click="navigateTo('/forms')">Back to Forms</Button>
      </CardContent>
    </Card>
  </div>

  <CreateFormWizard
    v-else-if="form"
    :is-submitting="isSubmitting"
    :initial-form="form as FormSchema"
    @submit="handleSubmit"
  />
</template>
