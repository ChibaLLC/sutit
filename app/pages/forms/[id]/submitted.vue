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
    AlertCircle,
    RefreshCw,
  } from "lucide-vue-next";
  import { toast } from "vue-sonner";
  import type { FormSchema } from "~~/shared/types";

  import { buttonVariants } from "~/components/ui/button";
  import { Button } from "~/components/ui/button";
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
  import { Input } from "~/components/ui/input";
  import { Label } from "~/components/ui/label";
  import { Separator } from "~/components/ui/separator";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "~/components/ui/dialog";

  const route = useRoute();
  const router = useRouter();
  const { data: form } = useNuxtData<FormSchema>(`form-${route.params.id}`);

  const submissionId = computed(() => route.query.submissionId as string);
  const checkoutId = computed(() => route.query.checkoutId as string);

  const { data: submissionData } = await useFetch(`/api/submissions/${submissionId.value}`, {
    key: `submission-${submissionId.value}`,
    server: false,
  });

  const previousPhoneNumber = computed(() => {
    if (submissionData.value?.data?.metadata?.paymentData?.phoneNumber) {
      return submissionData.value.data.metadata.paymentData.phoneNumber;
    }
    return "";
  });

  const hasTat = computed(() => form.value?.calculateTat === true);

  const { data: paymentData, refresh: refreshPayment, status: paymentStatus } = await useFetch("/api/payments/" + checkoutId.value, {
    query: { checkoutId: checkoutId.value },
    key: `payment-${checkoutId.value}`,
    server: false,
  });

  const paymentStatusValue = computed(() => paymentData.value?.data?.status as string | undefined);

  const isCompleted = computed(() => paymentStatusValue.value === "completed");
  const isPending = computed(() => paymentStatusValue.value === "pending");
  const isFailed = computed(() => paymentStatusValue.value === "failed");
  const isChecking = computed(() => paymentStatus.value === "pending");

  const showRetryDialog = ref(false);
  const retryingPayment = ref(false);
  const retryPhoneNumber = ref("");

  const checkPayment = async (checkoutId: string, maxRetries = 10, interval = 3000) => {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        const res = await $fetch(`/api/payments/${checkoutId}`);
        if (res.success && res.data && (res.data.status == "completed" || res.data.status == "failed")) {
          return res;
        }
      } catch (err) {
        console.error("Check payment error:", err);
      }
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    return null;
  };

  const retryPayment = async () => {
    if (!submissionId.value) return;
    retryingPayment.value = true;
    try {
      const result = await $fetch(`/api/forms/${route.params.id}/retry-payment`, {
        method: "post",
        body: { 
          submissionId: submissionId.value,
          phoneNumber: retryPhoneNumber.value || undefined
        },
      });
      toast.success(result.message || "Payment initiated. Please complete on your phone.");
      showRetryDialog.value = false;
      
      try {
        const checkResult = await checkPayment(result.data.payment.checkoutId, 15);
        if (checkResult?.data?.status === "completed") {
          toast.success("Payment completed!");
        } else if (checkResult?.data?.status === "failed") {
          toast.error("Payment failed. Please try again.");
        }
      } catch (e) {
        // Let the user check manually
      }
      
      await refreshPayment();
    } catch (e: any) {
      toast.error(e.data?.message || "Failed to retry payment");
    } finally {
      retryingPayment.value = false;
    }
  };

  const openRetryDialog = () => {
    retryPhoneNumber.value = previousPhoneNumber.value;
    showRetryDialog.value = true;
  };

  const stopTatUrl = computed(() => {
    if (!submissionId.value || !hasTat.value || !isCompleted.value) return null;
    return `${window.location.origin}/submission/${submissionId.value}/stop-tat`;
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
  };
</script>

<template>
  <div class="bg-background flex min-h-screen items-center justify-center p-4">
    <div class="w-full max-w-2xl space-y-8">
      <!-- Success Header -->
      <div class="space-y-4 text-center">
        <!-- Success State -->
        <div
          v-if="isCompleted"
          class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20"
        >
          <CheckCircle class="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <!-- Pending State -->
        <div
          v-else-if="isPending"
          class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20"
        >
          <Clock class="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
        </div>
        <!-- Failed State -->
        <div
          v-else-if="isFailed"
          class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20"
        >
          <AlertCircle class="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <!-- Unknown/Loading State -->
        <div v-else class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900/20">
          <Clock class="h-8 w-8 text-gray-600 dark:text-gray-400" />
        </div>

        <div class="space-y-2">
          <h1 v-if="isCompleted" class="text-foreground text-3xl font-bold tracking-tight">
            Successfully Submitted!
          </h1>
          <h1 v-else-if="isPending" class="text-foreground text-3xl font-bold tracking-tight">
            Payment Pending
          </h1>
          <h1 v-else-if="isFailed" class="text-foreground text-3xl font-bold tracking-tight">
            Payment Failed
          </h1>
          <h1 v-else class="text-foreground text-3xl font-bold tracking-tight">
            Checking Payment...
          </h1>

          <p v-if="isCompleted" class="text-muted-foreground text-lg">Your response has been recorded</p>
          <p v-else-if="isPending" class="text-muted-foreground text-lg">
            Please complete the payment on your phone
          </p>
          <p v-else-if="isFailed" class="text-muted-foreground text-lg">
            Your payment was not completed. Please try again.
          </p>
          <p v-else class="text-muted-foreground text-lg">Verifying payment status...</p>
        </div>
      </div>

      <!-- Payment Status Card (for pending/failed states) -->
      <Card v-if="checkoutId && !isCompleted">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Clock class="h-5 w-5" />
            Payment Status
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between rounded-lg bg-muted p-4">
            <div class="flex items-center gap-3">
              <div
                v-if="isPending"
                class="h-3 w-3 animate-pulse rounded-full bg-yellow-500"
              ></div>
              <div v-else-if="isFailed" class="h-3 w-3 rounded-full bg-red-500"></div>
              <div v-else class="h-3 w-3 rounded-full bg-gray-500"></div>
              <span class="font-medium capitalize">{{ paymentStatusValue || "loading..." }}</span>
            </div>
            <Button variant="outline" size="sm" :disabled="isChecking" @click="refreshPayment">
              <RefreshCw :class="{ 'animate-spin': isChecking }" class="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <p v-if="isPending" class="text-muted-foreground text-sm">
            Check your phone for the STK push message and enter your PIN to complete payment.
          </p>

          <!-- Retry Button for Failed Payments -->
          <div v-if="isFailed" class="pt-2">
            <Dialog v-model:open="showRetryDialog">
              <DialogTrigger as-child>
                <Button class="w-full" @click="openRetryDialog">
                  <RefreshCw class="mr-2 h-4 w-4" />
                  Retry Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Retry Payment</DialogTitle>
                  <DialogDescription>
                    Enter your phone number to receive the STK push. A new payment request will be sent to your phone.
                  </DialogDescription>
                </DialogHeader>
                <div class="space-y-4 py-4">
                  <div class="space-y-2">
                    <Label for="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      v-model="retryPhoneNumber"
                      placeholder="e.g. 712345678"
                      type="tel"
                    />
                    <p v-if="previousPhoneNumber" class="text-muted-foreground text-xs">
                      Previous: {{ previousPhoneNumber }}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" @click="showRetryDialog = false">Cancel</Button>
                  <Button :disabled="retryingPayment" @click="retryPayment">
                    <RefreshCw v-if="retryingPayment" class="mr-2 h-4 w-4 animate-spin" />
                    {{ retryingPayment ? "Sending..." : "Send STK Push" }}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <!-- Submission Details Card (only show for completed payments) -->
      <Card v-if="isCompleted">
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

      <!-- Stop TAT Card (only show for forms with TAT enabled and completed payments) -->
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