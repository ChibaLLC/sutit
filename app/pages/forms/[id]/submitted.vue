<script setup lang="ts">
  import {
    CheckCircle,
    Shield,
    Plus,
    Eye,
    BarChart3,
    Share2,
    Download,
    Copy,
    Clock,
  } from "lucide-vue-next";
  import { toast } from "vue-sonner";
  import type { FormSchema } from "~~/shared/types";

  import { buttonVariants } from "~/components/ui/button";
  import { Button } from "~/components/ui/button";
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
  import { Input } from "~/components/ui/input";
  import { Label } from "~/components/ui/label";
  import { Separator } from "~/components/ui/separator";

  const route = useRoute();
  const { data: form } = useNuxtData<FormSchema>(`form-${route.params.id}`);

  const stopTatUrl = computed(() => {
    const submissionId = route.query.submissionId;
    if (!submissionId) return null;
    return `${window.location.origin}/submission/${submissionId}/stop-tat`;
  });

  const copyStopTatUrl = () => {
    if (!stopTatUrl.value) return;
    navigator.clipboard.writeText(stopTatUrl.value);
    toast.success("Link copied to clipboard");
  };

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
  <div class="bg-background flex min-h-screen items-center justify-center p-4">
    <div class="w-full max-w-2xl space-y-8">
      <!-- Success Header -->
      <div class="space-y-4 text-center">
        <div
          class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20"
        >
          <CheckCircle class="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <div class="space-y-2">
          <h1 class="text-foreground text-3xl font-bold tracking-tight">Successfully Submitted!</h1>
          <p class="text-muted-foreground text-lg">Your response has been recorded</p>
        </div>
      </div>

      <!-- Submission Details Card -->
      <Card>
        <CardHeader>
          <CardTitle class="text-xl">Submission Details</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="col-span-full space-y-1">
              <Label class="text-muted-foreground text-sm font-medium">Submitted At</Label>
              <p class="bg-muted rounded-md px-3 py-2 text-sm">
                {{ new Date() }}
              </p>
            </div>
          </div>
          <Separator />
          <div class="text-muted-foreground flex items-center space-x-2 text-sm">
            <Shield class="h-4 w-4" />
            <span>Your data is securely stored and encrypted</span>
          </div>
        </CardContent>
      </Card>

      <!-- Stop TAT Card -->
      <Card v-if="stopTatUrl">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Clock class="h-5 w-5" />
            Stop TAT
          </CardTitle>
          <CardDescription>
            Use this link to stop the turnaround time timer for your submission
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex flex-col gap-3 sm:flex-row">
            <div class="flex-1">
              <Input :model-value="stopTatUrl" readonly class="font-mono text-xs" />
            </div>
            <Button variant="outline" @click="copyStopTatUrl">
              <Copy class="mr-2 h-4 w-4" />
              Copy
            </Button>
          </div>
          <p class="text-muted-foreground text-xs">
            This link has also been sent to your email. Keep it safe to stop your TAT timer when
            needed.
          </p>
        </CardContent>
      </Card>

      <!-- Action Buttons -->
      <Card>
        <CardContent class="p-6">
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">What's next?</h3>
            <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
              <NuxtLink :class="buttonVariants()" class="w-full" to="/forms/new">
                <Plus class="mr-2 h-4 w-4" />
                Create New Form
              </NuxtLink>

              <NuxtLink :class="buttonVariants({ variant: 'outline' })" class="w-full" to="/forms">
                <Eye class="mr-2 h-4 w-4" />
                View All Forms
              </NuxtLink>

              <NuxtLink
                :class="buttonVariants({ variant: 'outline' })"
                class="w-full"
                href="/dashboard"
              >
                <BarChart3 class="mr-2 h-4 w-4" />
                Dashboard
              </NuxtLink>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Additional Actions -->
      <div class="flex flex-col justify-center gap-3 sm:flex-row">
        <Button variant="ghost" size="sm" @click="toggleShareModal()">
          <Share2 class="mr-2 h-4 w-4" />
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
