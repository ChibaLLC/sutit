<script setup lang="ts">
import { toast } from "vue-sonner";
import { authHeaders } from "~/lib/auth-client";
import type { FormSchema } from "~~/shared/types";

const route = useRoute();
const isLoading = ref(false);
const { data: form } = await useFetch(`/api/forms/${route.params.id}`);
const submitForm = async (formData: FormSchema) => {
  isLoading.value = true;

  try {
    const { data, message } = await $fetch(`/api/forms/${route.params.id}`, {
      method: "PUT",
      body: formData,
      headers: {
        ...(await authHeaders()),
      },
    });

    if (data) {
      toast.success(message || "Form updated successfully!");
      await navigateTo("/forms");
    }
  } catch (error: any) {
    console.error("Error updating form:", error);

    // Handle specific error messages
    const errorMessage =
      error.data?.message || error.message || "Failed to update form";
    toast.error(errorMessage);
  } finally {
    isLoading.value = false;
  }
};
</script>
<template>
  <div v-if="form">
    <BuilderFormBuilder
      :form="form"
      @publish="submitForm"
      @go-back="() => $router.push('/dashboard')"
    />
  </div>
  <div v-else>not found</div>
</template>
