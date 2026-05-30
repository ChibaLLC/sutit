<script setup lang="ts">
  import { ref, computed } from "vue";
  import { toast } from "vue-sonner";
  import type { FormSchema } from "~~/shared/types";

  import { authHeaders } from "~/lib/auth-client";

  definePageMeta({
    middleware: ["auth"],
  });

  const route = useRoute();
  const isSubmitting = ref(false);
  const initialHasEvent = computed(() => route.query.event === "true");

  const handleCreate = async (form: FormSchema) => {
    if (isSubmitting.value) return;
    isSubmitting.value = true;

    try {
      await $fetch("/api/forms", {
        method: "POST",
        body: form,
        headers: { ...(await authHeaders()) },
      });

      toast.success("Form created successfully");
      await navigateTo("/forms");
    } catch (error: any) {
      const status = error?.statusCode ?? error?.status;
      const msg = error?.data?.message || error?.message || "Something went wrong";

      if (status === 422 && error?.data?.errors) {
        const errors = error.data.errors.slice(0, 3);
        toast.error("Validation failed", {
          description: errors.map((e: any) => `${e.field}: ${e.message}`).join("\n"),
        });
      } else if (status === 409) {
        toast.error("Slug already taken", {
          description: "Please choose a different form name",
        });
      } else if (status === 401) {
        toast.error("Session expired");
        await navigateTo("/auth/login");
      } else {
        toast.error("Failed to create form", { description: msg });
      }
    } finally {
      isSubmitting.value = false;
    }
  };
</script>

<template>
  <CreateFormWizard :is-submitting="isSubmitting" :initial-has-event="initialHasEvent" @submit="handleCreate" />
</template>
