<script setup lang="ts">
import { ref } from "vue";
import { toast } from "vue-sonner";
import { authHeaders } from "~/lib/auth-client";
import type { FormSchema } from "~~/shared/types";

definePageMeta({
  middleware: ["auth"],
});

const isSubmitting = ref(false);

const submitForm = async (form: FormSchema) => {
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
      toast.success("Form created successfully!", {
        description: "Redirecting to your forms...",
      });
      await navigateTo("/forms");
    }
  } catch (error: any) {
    console.error("Form creation error:", error);

    // Handle different types of errors from the server
    const errorData = error?.data;
    const statusCode = error?.statusCode || error?.status;

    if (errorData?.type === "validation_error" && errorData?.errors) {
      // Validation errors - show detailed field errors
      const errorCount = errorData.errors.length;
      const firstErrors = errorData.errors.slice(0, 3);

      toast.error(`Validation failed: ${errorCount} issue${errorCount > 1 ? 's' : ''}`, {
        description: firstErrors
          .map((e: any) => `• ${e.field}: ${e.message}`)
          .join("\n"),
        duration: 10000,
      });
    } else if (errorData?.type === "slug_conflict") {
      // Slug conflict error
      toast.error("Form slug already exists", {
        description: errorData?.suggestion || "Please choose a different URL slug",
        duration: 8000,
      });
    } else if (statusCode === 401) {
      // Authentication error
      toast.error("Session expired", {
        description: "Please log in again to continue",
      });
      await navigateTo("/auth/login");
    } else {
      // Generic error
      toast.error("Failed to create form", {
        description:
          errorData?.message ||
          error?.message ||
          "An unexpected error occurred. Please try again.",
        duration: 8000,
      });
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>
<template>
  <BuilderFormBuilder
    @publish="submitForm"
    @go-back="() => $router.push('/dashboard')"
  />
</template>
