<script setup lang="ts">
import { toast } from "vue-sonner";
import { authHeaders } from "~/lib/auth-client";

const route = useRoute();

const { data } = await useFetch(`/api/forms/${route.params.id}`);

const submit = async (form: object) => {
  try {
    const { data, message } = await $fetch(
      `/api/forms/${route.params.id}/submit`,
      {
        method: "post",
        body: form,
        headers: {
          ...(await authHeaders()),
        },
      },
    );
    if (data) {
      toast.success(message);
      await navigateTo("/forms");
    }
  } catch (e) {}
};
</script>
<template>
  <BuilderRendererFormRenderer :form="data" @submit="submit" />
</template>
