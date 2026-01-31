<script setup lang="ts">
import { ref } from "vue";
import { FileText } from "lucide-vue-next";
import { toast } from "vue-sonner";
import { authHeaders } from "~/lib/auth-client";
import type { FormSchema } from "~~/shared/types";

const route = useRoute();
const isLoading = ref(false);
const isSubmitting = ref(false);

const { data: form, pending } = await useFetch(`/api/forms/${route.params.id}`, {
  headers: {
    ...(await authHeaders()),
  },
});

const submitForm = async (formData: FormSchema) => {
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    const response = await $fetch(`/api/forms/${route.params.id}`, {
      method: "PUT",
      body: formData,
      headers: {
        ...(await authHeaders()),
      },
    });

    if (response.data) {
      toast.success("Form updated successfully!", {
        description: "Your changes have been saved.",
      });
      await navigateTo("/forms");
    }
  } catch (error: any) {
    console.error("Form update error:", error);

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
    } else if (statusCode === 404) {
      // Form not found
      toast.error("Form not found", {
        description: "The form you're trying to edit no longer exists.",
      });
      await navigateTo("/forms");
    } else if (statusCode === 401) {
      // Authentication error
      toast.error("Session expired", {
        description: "Please log in again to continue",
      });
      await navigateTo("/auth/login");
    } else {
      // Generic error
      toast.error("Failed to update form", {
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
  <div v-if="pending" class="flex items-center justify-center min-h-screen">
    <div class="flex flex-col items-center gap-4">
      <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p class="text-muted-foreground">Loading form...</p>
    </div>
  </div>
  
  <div v-else-if="form" class="min-h-screen bg-background">
    <BuilderFormBuilder
      :form="form"
      @publish="submitForm"
      @go-back="() => $router.push('/forms')"
    />
  </div>
  
  <div v-else class="flex items-center justify-center min-h-screen p-4">
    <Card class="max-w-md w-full">
      <CardContent class="pt-6">
        <div class="flex flex-col items-center text-center space-y-4">
          <div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <FileText class="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h2 class="text-xl font-bold">Form Not Found</h2>
            <p class="text-sm text-muted-foreground mt-2">
              The form you're looking for doesn't exist or you don't have permission to view it.
            </p>
          </div>
          <Button @click="$router.push('/forms')">
            Back to Forms
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
