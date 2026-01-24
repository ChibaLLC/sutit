<script setup lang="ts">
import { ref, computed } from "vue";
import { ArrowLeft, Play, Clock, CheckCircle, AlertTriangle, XCircle, Loader } from "lucide-vue-next";
import { authHeaders } from "~/lib/auth-client";
import { toast } from "vue-sonner";
import { formatSecondsToDetailedTime, getTatStatus, getTatStatusColor } from "~/lib/utils";

definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const formId = route.params.id as string;

const { data: form } = await useFetch(`/api/forms/${route.params.id}`, {
  headers: {
    ...(await authHeaders()),
  },
});

const { data: submissions, refresh } = await useFetch(`/api/forms/${formId}/submissions`, {
  headers: {
    ...(await authHeaders()),
  },
});

const tatSubmissions = computed(() => {
  if (!form.value?.calculateTat) return [];
  return submissions.value?.data?.filter((s) => s.status !== "completed") || [];
});

const processedSubmissions = computed(() => {
  return submissions.value?.data?.filter((s) => s.status === "completed") || [];
});

const stopTatLoading = ref<string | null>(null);

const stopTat = async (submissionId: string) => {
  stopTatLoading.value = submissionId;
  try {
    await $fetch(`/api/forms/${formId}/submissions/${submissionId}/stop-tat`, {
      method: "POST",
      headers: {
        ...(await authHeaders()),
      },
    });
    toast.success("TAT stopped successfully");
    await refresh();
  } catch (error: any) {
    toast.error(error.data?.statusMessage || "Failed to stop TAT");
  } finally {
    stopTatLoading.value = null;
  }
};

const getElapsedTime = (submittedAt: string): string => {
  const start = new Date(submittedAt);
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
  return formatSecondsToDetailedTime(diff).formatted;
};

const getTatForSubmission = (submission): string => {
  if (submission.tat) {
    return formatSecondsToDetailedTime(submission.tat).formatted;
  }
  return getElapsedTime(submission.submittedAt);
};
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="p-6 lg:p-8 max-w-7xl mx-auto">
      <div class="mb-8">
        <NuxtLink
          :to="`/forms/${formId}/submissions`"
          class="inline-flex items-center gap-2 mb-6 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft class="w-4 h-4" />
          Back to Submissions
        </NuxtLink>

        <div>
          <h1 class="text-3xl font-bold text-foreground">
            TAT Management
          </h1>
          <p class="text-sm text-muted-foreground mt-2">
            Manage turnaround times for {{ form?.title }}
          </p>
        </div>
      </div>

      <div v-if="!form?.calculateTat" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div class="flex items-start gap-3">
          <AlertTriangle class="w-6 h-6 text-yellow-600 mt-0.5" />
          <div>
            <h3 class="font-semibold text-yellow-800">TAT Not Enabled</h3>
            <p class="text-sm text-yellow-700 mt-1">
              TAT calculation is not enabled for this form. Please enable it in form settings.
            </p>
            <NuxtLink
              :to="`/forms/${formId}`"
              class="inline-flex items-center gap-2 mt-3 text-sm font-medium text-yellow-800 hover:text-yellow-900"
            >
              Go to Form Settings
              <ArrowLeft class="w-4 h-4 rotate-180" />
            </NuxtLink>
          </div>
        </div>
      </div>

      <div v-else class="space-y-6">
        <div class="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Clock class="w-5 h-5 text-blue-600" />
                Active TAT ({{ tatSubmissions.length }})
              </CardTitle>
              <CardDescription>
                Submissions currently being tracked for turnaround time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="tatSubmissions.length === 0" class="text-center py-8 text-muted-foreground">
                No active TAT submissions
              </div>
              <div v-else class="space-y-4">
                <div
                  v-for="submission in tatSubmissions"
                  :key="submission.id"
                  class="p-4 border rounded-lg bg-card"
                >
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                      <p class="font-medium text-foreground mb-1">
                        {{ submission.submitter?.name || "Anonymous" }}
                      </p>
                      <p class="text-xs text-muted-foreground">
                        ID: {{ submission.id.slice(0, 8) }}...
                      </p>
                    </div>
                    <Badge class="bg-blue-100 text-blue-800">In Progress</Badge>
                  </div>

                  <div class="flex items-center gap-2 text-sm mb-3">
                    <Clock class="w-4 h-4 text-muted-foreground" />
                    <span class="font-medium">{{ getElapsedTime(submission.submittedAt) }}</span>
                    <span class="text-muted-foreground">elapsed</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    class="w-full gap-2"
                    :disabled="stopTatLoading === submission.id"
                    @click="stopTat(submission.id)"
                  >
                    <Loader v-if="stopTatLoading === submission.id" class="w-4 h-4 animate-spin" />
                    <Play v-else class="w-4 h-4" />
                    <span>Stop TAT</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <CheckCircle class="w-5 h-5 text-green-600" />
                Completed ({{ processedSubmissions.length }})
              </CardTitle>
              <CardDescription>
                Submissions with completed TAT tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="processedSubmissions.length === 0" class="text-center py-8 text-muted-foreground">
                No completed submissions
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="submission in processedSubmissions.slice(0, 10)"
                  :key="submission.id"
                  class="flex items-center justify-between p-3 border rounded-lg bg-secondary/20"
                >
                  <div>
                    <p class="text-sm font-medium">
                      {{ submission.submitter?.name || "Anonymous" }}
                    </p>
                    <p class="text-xs text-muted-foreground">
                      {{ getTatForSubmission(submission) }}
                    </p>
                  </div>
                  <Badge class="bg-green-100 text-green-800">
                    Done
                  </Badge>
                </div>
                <div v-if="processedSubmissions.length > 10" class="text-center pt-2">
                  <p class="text-xs text-muted-foreground">
                    +{{ processedSubmissions.length - 10 }} more
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>