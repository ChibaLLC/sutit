<script setup lang="ts">
  import {
    ArrowLeft,
    Play,
    Clock,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Loader,
  } from "lucide-vue-next";
  import { ref, computed } from "vue";
  import { toast } from "vue-sonner";

  import { authHeaders } from "~/lib/auth-client";
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
  <div class="bg-background min-h-screen">
    <div class="mx-auto max-w-7xl p-6 lg:p-8">
      <div class="mb-8">
        <NuxtLink
          :to="`/forms/${formId}/submissions`"
          class="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft class="h-4 w-4" />
          Back to Submissions
        </NuxtLink>

        <div>
          <h1 class="text-foreground text-3xl font-bold">TAT Management</h1>
          <p class="text-muted-foreground mt-2 text-sm">
            Manage turnaround times for {{ form?.title }}
          </p>
        </div>
      </div>

      <div v-if="!form?.calculateTat" class="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
        <div class="flex items-start gap-3">
          <AlertTriangle class="mt-0.5 h-6 w-6 text-yellow-600" />
          <div>
            <h3 class="font-semibold text-yellow-800">TAT Not Enabled</h3>
            <p class="mt-1 text-sm text-yellow-700">
              TAT calculation is not enabled for this form. Please enable it in form settings.
            </p>
            <NuxtLink
              :to="`/forms/${formId}`"
              class="mt-3 inline-flex items-center gap-2 text-sm font-medium text-yellow-800 hover:text-yellow-900"
            >
              Go to Form Settings
              <ArrowLeft class="h-4 w-4 rotate-180" />
            </NuxtLink>
          </div>
        </div>
      </div>

      <div v-else class="space-y-6">
        <div class="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Clock class="h-5 w-5 text-blue-600" />
                Active TAT ({{ tatSubmissions.length }})
              </CardTitle>
              <CardDescription>
                Submissions currently being tracked for turnaround time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                v-if="tatSubmissions.length === 0"
                class="text-muted-foreground py-8 text-center"
              >
                No active TAT submissions
              </div>
              <div v-else class="space-y-4">
                <div
                  v-for="submission in tatSubmissions"
                  :key="submission.id"
                  class="bg-card rounded-lg border p-4"
                >
                  <div class="mb-3 flex items-start justify-between">
                    <div class="flex-1">
                      <p class="text-foreground mb-1 font-medium">
                        {{ submission.submitter?.name || "Anonymous" }}
                      </p>
                      <p class="text-muted-foreground text-xs">
                        ID: {{ submission.id.slice(0, 8) }}...
                      </p>
                    </div>
                    <Badge class="bg-blue-100 text-blue-800">In Progress</Badge>
                  </div>

                  <div class="mb-3 flex items-center gap-2 text-sm">
                    <Clock class="text-muted-foreground h-4 w-4" />
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
                    <Loader v-if="stopTatLoading === submission.id" class="h-4 w-4 animate-spin" />
                    <Play v-else class="h-4 w-4" />
                    <span>Stop TAT</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <CheckCircle class="h-5 w-5 text-green-600" />
                Completed ({{ processedSubmissions.length }})
              </CardTitle>
              <CardDescription> Submissions with completed TAT tracking </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                v-if="processedSubmissions.length === 0"
                class="text-muted-foreground py-8 text-center"
              >
                No completed submissions
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="submission in processedSubmissions.slice(0, 10)"
                  :key="submission.id"
                  class="bg-secondary/20 flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p class="text-sm font-medium">
                      {{ submission.submitter?.name || "Anonymous" }}
                    </p>
                    <p class="text-muted-foreground text-xs">
                      {{ getTatForSubmission(submission) }}
                    </p>
                  </div>
                  <Badge class="bg-green-100 text-green-800"> Done </Badge>
                </div>
                <div v-if="processedSubmissions.length > 10" class="pt-2 text-center">
                  <p class="text-muted-foreground text-xs">
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
