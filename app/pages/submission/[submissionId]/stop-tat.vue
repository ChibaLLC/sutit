<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  CheckCircle,
  Play,
  Clock,
  Loader,
  AlertTriangle,
} from "lucide-vue-next";
import { toast } from "vue-sonner";
import { formatCountdown, formatSecondsToDetailedTime } from "~/lib/utils";
import { NuxtLink } from "#components";
import { ArrowLeft } from "lucide-vue-next";

const route = useRoute();
const submissionId = route.params.submissionId as string;
const authStore = useAuthStore();
const token = route.query.token as string;

const { data, error, pending, refresh } = await useFetch(
  `/api/submissions/${submissionId}`,
);

const submission = computed(() => data.value?.data);
const loading = computed(() => pending.value);
const errorMessage = computed(() => error.value?.message || null);

const stopLoading = ref(false);
const countdown = ref<string>("");

let countdownInterval: NodeJS.Timeout | null = null;

const updateCountdown = (): void => {
  if (!submission.value?.submittedAt) return;

  // Clear existing interval
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  const updateTimer = (): void => {
    countdown.value = formatCountdown(submission.value?.submittedAt);
  };

  updateTimer();
  countdownInterval = setInterval(updateTimer, 1000);
};

const stopTat = async () => {
  stopLoading.value = true;
  try {
    const requestBody: any = {};

    // Add token to request if user is not authenticated
    if (!authStore.isAuthenticated && token) {
      requestBody.token = token;
    }

    await $fetch(`/api/submissions/${submissionId}/stop-tat`, {
      method: "POST",
      body: requestBody,
    });
    toast.success("TAT stopped successfully");
    await refresh();
  } catch (err: any) {
    console.error("Failed to stop TAT:", err);
    toast.error(err.data?.statusMessage || "Failed to stop TAT");
  } finally {
    stopLoading.value = false;
  }
};

const formattedTat = computed(() => {
  if (!submission.value?.tat) return "N/A";
  return formatSecondsToDetailedTime(submission.value.tat).formatted;
});

const isCompleted = computed(() => !!submission.value?.completedAt);

watch(
  submission,
  (newSubmission) => {
    if (newSubmission && !newSubmission.completedAt) {
      updateCountdown();
    } else if (newSubmission?.completedAt && countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  },
  { immediate: true },
);

// Initialize countdown when component mounts
onMounted(() => {
  if (submission.value && !submission.value.completedAt) {
    updateCountdown();
  }
});

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval);
});
</script>

<template>
  <div
    v-if="loading"
    class="min-h-screen bg-background flex items-center justify-center"
  >
    <div class="flex items-center gap-3">
      <Loader class="w-6 h-6 animate-spin" />
      <p>Loading...</p>
    </div>
  </div>

  <div
    v-else-if="errorMessage"
    class="min-h-screen bg-background flex items-center justify-center p-4"
  >
    <Card class="max-w-md w-full">
      <CardContent class="pt-6">
        <div class="flex flex-col items-center text-center space-y-4">
          <div
            class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center"
          >
            <AlertTriangle class="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h2 class="text-xl font-bold">Error</h2>
            <p class="text-sm text-muted-foreground mt-2">{{ errorMessage }}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <div
    v-else
    class="min-h-screen bg-background flex items-center justify-center p-4"
  >
    <div class="w-full max-w-lg space-y-6">
      <!-- Back Button -->
      <div class="flex items-center">
        <Button
          :as="NuxtLink"
          variant="ghost"
          size="sm"
          class="gap-2"
          :to="`/forms/${submission?.formId}`"
          v-if="submission?.formId && authStore.isAuthenticated"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Back to Form Submissions</span>
        </Button>
      </div>

      <!-- Header -->
      <div class="text-center space-y-4">
        <div
          v-if="isCompleted"
          class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
        >
          <CheckCircle class="w-8 h-8 text-green-600" />
        </div>
        <div
          v-else
          class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center"
        >
          <Clock class="w-8 h-8 text-blue-600" />
        </div>

        <div class="space-y-2">
          <h1 class="text-2xl font-bold">
            {{ isCompleted ? "TAT Completed" : "Stop TAT" }}
          </h1>
          <p class="text-muted-foreground">
            {{ submission?.form?.title }}
          </p>
        </div>

        <!-- Token access notice for unauthenticated users -->
        <div
          v-if="!authStore.isAuthenticated && token"
          class="bg-blue-50 border border-blue-200 rounded-lg p-3"
        >
          <p class="text-sm text-blue-700">
            <strong>Phone Access:</strong> You have access via the secure link
            sent to your phone number.
          </p>
        </div>
      </div>

      <!-- Submission Info Card -->
      <Card>
        <CardHeader>
          <CardTitle>Submission Information</CardTitle>
          <CardDescription>
            Submitted by {{ submission?.submitter?.name || "Anonymous" }}
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <p class="text-sm text-muted-foreground mb-1">Submission ID</p>
            <p class="text-sm font-mono bg-muted px-2 py-1 rounded">
              {{ submission?.id?.slice(0, 8) }}...
            </p>
          </div>

          <div>
            <p class="text-sm text-muted-foreground mb-1">Submitted At</p>
            <p class="text-sm">
              {{ new Date(submission?.submittedAt).toLocaleString() }}
            </p>
          </div>

          <Separator />

          <div>
            <p class="text-sm text-muted-foreground mb-1">Elapsed Time</p>
            <p class="text-2xl font-bold">{{ countdown || "0s" }}</p>
          </div>

          <div>
            <p class="text-sm text-muted-foreground mb-1">Status</p>
            <Badge
              :class="
                isCompleted
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              "
            >
              {{ isCompleted ? "Completed" : "In Progress" }}
            </Badge>
          </div>

          <div v-if="isCompleted">
            <p class="text-sm text-muted-foreground mb-1">Final TAT</p>
            <p class="text-lg font-semibold text-primary">
              {{ formattedTat }}
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Action Card -->
      <Card v-if="!isCompleted">
        <CardContent class="pt-6">
          <div class="space-y-4">
            <p class="text-sm text-center text-muted-foreground">
              Click the button below to stop the TAT timer for this submission
            </p>
            <Button
              class="w-full gap-2"
              size="lg"
              :disabled="stopLoading"
              @click="stopTat"
            >
              <Loader v-if="stopLoading" class="w-5 h-5 animate-spin" />
              <Play v-else class="w-5 h-5" />
              <span>Stop TAT</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Completed Card -->
      <Card v-else>
        <CardContent class="pt-6">
          <div class="text-center space-y-3">
            <div class="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle class="w-5 h-5" />
              <span class="font-medium">TAT has been stopped</span>
            </div>
            <p class="text-sm text-muted-foreground">
              The final turnaround time was {{ formattedTat }}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
