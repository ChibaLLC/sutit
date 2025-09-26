<script setup lang="ts">
import {
  CheckCircle,
  Shield,
  Plus,
  Eye,
  BarChart3,
  Share2,
  Download,
} from "lucide-vue-next";
import { buttonVariants } from "~/components/ui/button";
import type { FormSchema } from "~~/shared/types";
const route = useRoute();
const { data: form } = useNuxtData<FormSchema>(`form-${route.params.id}`);

const shareModalOpen = ref(false);
const toggleShareModal = () => {
  shareModalOpen.value = !shareModalOpen.value;
};

const downloadResponse = () => {
  console.log("Downloading response...");
  // Download response data
};
</script>
<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="w-full max-w-2xl space-y-8">
      <!-- Success Header -->
      <div class="text-center space-y-4">
        <div
          class="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center"
        >
          <CheckCircle class="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <div class="space-y-2">
          <h1 class="text-3xl font-bold tracking-tight text-foreground">
            Successfully Submitted!
          </h1>
          <p class="text-lg text-muted-foreground">
            Your response has been recorded
          </p>
        </div>
      </div>

      <!-- Submission Details Card -->
      <Card>
        <CardHeader>
          <CardTitle class="text-xl">Submission Details</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="col-span-full space-y-1">
              <Label class="text-sm font-medium text-muted-foreground"
                >Submitted At</Label
              >
              <p class="text-sm bg-muted px-3 py-2 rounded-md">
                {{ new Date() }}
              </p>
            </div>
          </div>
          <Separator />
          <div
            class="flex items-center space-x-2 text-sm text-muted-foreground"
          >
            <Shield class="w-4 h-4" />
            <span>Your data is securely stored and encrypted</span>
          </div>
        </CardContent>
      </Card>

      <!-- Action Buttons -->
      <Card>
        <CardContent class="p-6">
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">What's next?</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <NuxtLink
                :class="buttonVariants()"
                class="w-full"
                to="/forms/new"
              >
                <Plus class="w-4 h-4 mr-2" />
                Create New Form
              </NuxtLink>

              <NuxtLink
                :class="buttonVariants({ variant: 'outline' })"
                class="w-full"
                to="/forms"
              >
                <Eye class="w-4 h-4 mr-2" />
                View All Forms
              </NuxtLink>

              <NuxtLink
                :class="buttonVariants({ variant: 'outline' })"
                class="w-full"
                href="/dashboard"
              >
                <BarChart3 class="w-4 h-4 mr-2" />
                Dashboard
              </NuxtLink>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Additional Actions -->
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="ghost" size="sm" @click="toggleShareModal()">
          <Share2 class="w-4 h-4 mr-2" />
          Share This Form
        </Button>

        <!-- <Button variant="ghost" size="sm" @click="downloadResponse"> -->
        <!--   <Download class="w-4 h-4 mr-2" /> -->
        <!--   Download Response -->
        <!-- </Button> -->
      </div>
    </div>
    <LazyFormsShareCard
      v-if="form"
      :form="form"
      :isOpen="shareModalOpen"
      @close="toggleShareModal()"
    />
  </div>
</template>
