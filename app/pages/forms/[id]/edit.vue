<script setup lang="ts">
  import { ref } from "vue";
  import { toast } from "vue-sonner";
  import type { FormSchema } from "~~/shared/types";

  import { authHeaders } from "~/lib/auth-client";

  definePageMeta({
    middleware: ["auth"],
  });

  const route = useRoute();
  const isSubmitting = ref(false);

  const {
    data: form,
    pending,
    error,
  } = await useFetch(`/api/forms/${route.params.id}`, {
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
  <div v-if="pending" class="flex min-h-screen items-center justify-center">
    <div class="flex flex-col items-center gap-3">
      <div class="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
      <p class="text-muted-foreground text-sm">Loading form...</p>
    </div>
  </div>

  <div v-else-if="error" class="flex min-h-screen items-center justify-center p-4">
    <Card class="w-full max-w-sm">
      <CardContent class="space-y-4 pt-6 text-center">
        <p class="text-muted-foreground text-sm">{{ error.message || "Form not found" }}</p>
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
