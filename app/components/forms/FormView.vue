<script setup lang="ts">
  import {
    Users,
    User,
    ArrowRight,
    Clock,
    DollarSign,
    Lock,
    EyeOff,
    AlertCircle,
  } from "lucide-vue-next";
  import { toast } from "vue-sonner";
  import type { FormSchema } from "~~/shared/types";

  import { useFormSEO } from "~/composables/seo/useFormSeo";
  import { authHeaders } from "~/lib/auth-client";

  const route = useRoute();
  const router = useRouter();
  const loading = ref(false);
  const { start, finish } = useLoadingIndicator();

  // Get password from query if provided
  const queryPassword = route.query.password as string | undefined;

  // State for password input
  const enteredPassword = ref("");
  const showPasswordForm = ref(false);

  const queryToken = route.query.token as string | undefined;

  // Fetch form with password/token if provided
  const { data: form, error } = await useFetch<FormSchema>(`/api/forms/${route.params.id}`, {
    key: `form-${route.params.id}`,
    query: {
      ...(queryPassword ? { password: queryPassword } : {}),
      ...(queryToken ? { token: queryToken } : {}),
    },
    transform: (dt) => {
      return {
        ...dt,
        price: queryToken ? 0 : dt.price,
      };
    },
  });

  // Handle different error states
  const errorCode = computed(() => {
    if (error.value?.statusCode == 404) return "NOT_FOUND";
    if (error.value?.statusCode == 403) {
      const msg = error.value.data.message || "";
      if (msg.includes("expired")) return "EXPIRED";
      if (msg.includes("public")) return "NOT_PUBLIC";
      if (msg.includes("password")) return "WRONG_PASSWORD";
    }
    if (error.value?.statusCode === 401) return "PASSWORD_REQUIRED";
    return null;
  });

  // Check if we need to show password form
  if (errorCode.value === "PASSWORD_REQUIRED") {
    showPasswordForm.value = true;
  }

  // SEO
  const { generateSEO } = useFormSEO(form.value);
  generateSEO();

  const hasToken = computed(() => !!route.query.token);

  const showGroupSelection = computed(() => form.value?.allowGroups && !hasToken.value);
  const showSelection = ref(showGroupSelection.value);

  const submitPassword = async () => {
    if (!enteredPassword.value) {
      toast.error("Please enter a password");
      return;
    }

    // Reload page with password in query
    await navigateTo({
      path: route.path,
      query: { ...route.query, password: enteredPassword.value },
    });
  };

  const submit = async (formData: object) => {
    loading.value = true;
    start();
    if (!form.value?.acceptResponses) {
      toast.error("This form does not accept responses");
      return;
    }
    try {
      const submitUrl = queryToken
        ? `/api/forms/${route.params.id}/submit?token=${queryToken}`
        : `/api/forms/${route.params.id}/submit`;
      const { data: submitData, message } = await $fetch(submitUrl, {
        method: "post",
        body: formData,
        headers: {
          ...(await authHeaders()),
        },
        onResponse() {
          loading.value = false;
          finish();
        },
        onResponseError(e) {
          toast.error(
            e.response._data.message ?? e.response._data.statusMessage ?? "An error occurred ",
          );
        },
      });
      if (submitData) {
        toast.success(message);
        if (!submitData.payment) {
          await navigateTo(
            `/forms/${route.params.id}/submitted?submissionId=${submitData.submissionId}`,
          );
          return;
        }
        try {
          const result = await checkPayment(submitData.payment.checkoutId, 15);
          toast.success("Payment completed!");
          await router.push(
            `/forms/${route.params.id}/submitted?submissionId=${submitData.submissionId}&checkoutId=${submitData.payment.checkoutId}`,
          );
        } catch (e: any) {
          // Payment check timed out - navigate to submitted page with the info
          await router.push(
            `/forms/${route.params.id}/submitted?submissionId=${submitData.submissionId}&checkoutId=${submitData.payment.checkoutId}`,
          );
        }
      }
    } catch (e) {
    } finally {
      // loading.value = false;
      // finish();
    }
  };

  const checkPayment = async (checkoutId: string, maxRetries = 10, interval = 3000) => {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        const res = await $fetch(`/api/payments/${checkoutId}`);
        if (
          res.success &&
          res.data &&
          (res.data.status == "completed" || res.data.status == "failed")
        ) {
          return res;
        }
      } catch (err) {
        console.error("Check payment error:", err);
      }
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    throw new Error("Payment not completed in time. Please try again later.");
  };

  const handleGroupInvite = () => {
    navigateTo(`/forms/${route.params.id}/group/invite`);
  };

  const handleIndividualFill = () => {
    showSelection.value = false;
  };
</script>

<template>
  <div>
    <!-- 404 Not Found -->
    <div
      v-if="errorCode === 'NOT_FOUND'"
      class="bg-background flex min-h-screen items-center justify-center p-4"
    >
      <div class="text-center">
        <h1 class="text-muted-foreground mb-4 text-6xl font-bold">404</h1>
        <h2 class="text-foreground mb-2 text-2xl font-semibold">Form Not Found</h2>
        <p class="text-muted-foreground">
          The form you're looking for doesn't exist or has been removed.
        </p>
      </div>
    </div>

    <!-- Not Public -->
    <div
      v-else-if="errorCode === 'NOT_PUBLIC'"
      class="bg-background flex min-h-screen items-center justify-center p-4"
    >
      <div class="text-center">
        <EyeOff class="text-muted-foreground mx-auto mb-4 h-16 w-16" />
        <h2 class="text-foreground mb-2 text-2xl font-semibold">Private Form</h2>
        <p class="text-muted-foreground">This form is private and not accessible to the public.</p>
      </div>
    </div>

    <!-- Form Expired -->
    <div
      v-else-if="errorCode === 'EXPIRED'"
      class="bg-background flex min-h-screen items-center justify-center p-4"
    >
      <div class="text-center">
        <AlertCircle class="text-destructive mx-auto mb-4 h-16 w-16" />
        <h2 class="text-foreground mb-2 text-2xl font-semibold">Form Expired</h2>
        <p class="text-muted-foreground">
          This form has expired and is no longer accepting responses.
        </p>
      </div>
    </div>

    <!-- Wrong Password -->
    <div
      v-else-if="errorCode === 'WRONG_PASSWORD'"
      class="bg-background flex min-h-screen items-center justify-center p-4"
    >
      <div class="w-full max-w-md">
        <Card>
          <CardContent class="p-8 text-center">
            <Lock class="text-destructive mx-auto mb-4 h-12 w-12" />
            <h2 class="text-foreground mb-2 text-xl font-semibold">Incorrect Password</h2>
            <p class="text-muted-foreground mb-6">The password you entered is incorrect.</p>
            <Button
              @click="
                () => {
                  showPasswordForm = true;
                }
              "
              class="w-full"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Password Required -->
    <div
      v-else-if="showPasswordForm || errorCode === 'PASSWORD_REQUIRED'"
      class="bg-background flex min-h-screen items-center justify-center p-4"
    >
      <div class="w-full max-w-md">
        <Card>
          <CardContent class="p-8">
            <div class="mb-6 text-center">
              <Lock class="text-primary mx-auto mb-4 h-12 w-12" />
              <h2 class="text-foreground mb-2 text-xl font-semibold">Password Required</h2>
              <p class="text-muted-foreground">
                This form is protected. Please enter the password to continue.
              </p>
            </div>

            <div class="space-y-4">
              <Input
                v-model="enteredPassword"
                type="password"
                placeholder="Enter password"
                @keyup.enter="submitPassword"
              />
              <Button @click="submitPassword" class="w-full"> Access Form </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Form Content -->
    <div v-else-if="form">
      <!-- Group Selection Interface -->
      <div
        v-if="showSelection"
        class="bg-background flex min-h-screen items-center justify-center p-4"
      >
        <div class="mx-auto w-full max-w-4xl">
          <!-- Header -->
          <div class="mb-12 text-center">
            <h1 class="text-foreground mb-4 text-4xl font-bold">
              {{ form.title }}
            </h1>
            <p v-if="form.description" class="text-muted-foreground mx-auto max-w-2xl text-lg">
              {{ form.description }}
            </p>
          </div>

          <!-- Selection Cards -->
          <div class="grid gap-6 md:grid-cols-2">
            <!-- Individual Registration Card -->
            <Card
              class="hover:border-primary/20 relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg"
            >
              <CardContent class="p-8">
                <div class="mb-6 flex items-center gap-4">
                  <div class="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/20">
                    <User class="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 class="text-foreground text-xl font-semibold">Fill for Yourself</h3>
                    <p class="text-muted-foreground text-sm">Individual registration</p>
                  </div>
                </div>

                <div class="mb-8 space-y-4">
                  <div class="text-muted-foreground flex items-center gap-3 text-sm">
                    <Clock class="h-4 w-4" />
                    <span>Quick and simple process</span>
                  </div>
                  <div class="text-muted-foreground flex items-center gap-3 text-sm">
                    <DollarSign class="h-4 w-4" />
                    <span
                      >Pay: {{ form.price ? `Kes ${form.price.toLocaleString()}` : "Free" }}</span
                    >
                  </div>
                </div>

                <Button @click="handleIndividualFill" class="group w-full" size="lg">
                  <span>Start Registration</span>
                  <ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>

            <!-- Group Registration Card -->
            <Card
              class="hover:border-primary/20 relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg"
            >
              <CardContent class="p-8">
                <div class="mb-6 flex items-center gap-4">
                  <div class="rounded-xl bg-green-100 p-3 dark:bg-green-900/20">
                    <Users class="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 class="text-foreground text-xl font-semibold">Create Group</h3>
                    <p class="text-muted-foreground text-sm">Register multiple people</p>
                  </div>
                </div>

                <div class="mb-8 space-y-4">
                  <div class="text-muted-foreground flex items-center gap-3 text-sm">
                    <Users class="h-4 w-4" />
                    <span>Up to {{ form.groupMemberLimit || "unlimited" }} members</span>
                  </div>
                  <div class="text-muted-foreground flex items-center gap-3 text-sm">
                    <DollarSign class="h-4 w-4" />
                    <span>
                      Group rate:
                      {{
                        form.groupAmountPayable
                          ? `Kes ${form.groupAmountPayable.toLocaleString()}`
                          : "Contact us"
                      }}
                    </span>
                  </div>
                </div>

                <Button
                  @click="handleGroupInvite"
                  variant="outline"
                  class="group w-full border-2"
                  size="lg"
                >
                  <span>Create Group</span>
                  <ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <!-- Additional Info -->
          <div class="mt-12 text-center">
            <div
              class="text-muted-foreground flex flex-wrap items-center justify-center gap-8 text-sm"
            >
              <div v-if="form.submissionLimit" class="flex items-center gap-2">
                <Clock class="h-4 w-4" />
                <span>Limited to {{ form.submissionLimit }} submissions</span>
              </div>
              <div v-if="form.requiresLogin" class="flex items-center gap-2">
                <User class="h-4 w-4" />
                <span>Login required</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Regular Form Renderer -->
      <div v-else>
        <!-- Show indicator for individual registration (both token and manual selection) -->
        <div
          v-if="hasToken"
          class="border-b border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20"
        >
          <div class="container mx-auto px-4 py-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <User class="h-4 w-4" />
                <span class="font-medium">Individual Registration</span>
                <span class="text-blue-600 dark:text-blue-400">
                  •
                  {{ hasToken ? "Filling for yourself" : "Personal registration" }}
                </span>
              </div>
              <!-- Back button for manual selection (not for token users) -->
              <Button
                v-if="!hasToken && form.allowGroups"
                @click="showSelection = true"
                variant="ghost"
                size="sm"
                class="text-blue-700 dark:text-blue-300"
              >
                ← Back to options
              </Button>
            </div>
          </div>
        </div>

        <BuilderRendererFormRenderer :form="form" @submit="submit" :loading />
      </div>
    </div>
  </div>
</template>
