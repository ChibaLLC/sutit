<script setup lang="ts">
import { ref } from "vue";
import { toast } from "vue-sonner";
import { authHeaders } from "~/lib/auth-client";
import type { FormSchema } from "~~/shared/types";

definePageMeta({
  middleware: ["auth"],
});

const isSubmitting = ref(false);

const handleCreate = async (form: FormSchema) => {
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    const response = await $fetch("/api/forms", {
      method: "POST",
      body: form,
      headers: {
        ...(await authHeaders()),
      },
    });

    if (response.data) {
      toast.success("Form created!", {
        description: "Opening the builder...",
      });
      await navigateTo("/forms");
    }
  } catch (error: any) {
    const errorData = error?.data;
    const statusCode = error?.statusCode || error?.status;

    if (errorData?.type === "validation_error" && errorData?.errors) {
      const firstErrors = errorData.errors.slice(0, 3);
      toast.error("Validation failed", {
        description: firstErrors
          .map((e: any) => `• ${e.field}: ${e.message}`)
          .join("\n"),
        duration: 10000,
      });
    } else if (errorData?.type === "slug_conflict") {
      toast.error("Slug already taken", {
        description:
          errorData?.suggestion || "Please choose a different form name",
        duration: 8000,
      });
    } else if (statusCode === 401) {
      toast.error("Session expired", {
        description: "Please log in again",
      });
      await navigateTo("/auth/login");
    } else {
      toast.error("Failed to create form", {
        description:
          errorData?.message ||
          error?.message ||
          "Something went wrong. Please try again.",
        duration: 8000,
      });
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <CreateFormWizard :is-submitting="isSubmitting" @create="handleCreate" />
</template>
