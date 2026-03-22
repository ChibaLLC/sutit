<script setup lang="ts">
import { toast } from "vue-sonner";
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
import { authHeaders } from "~/lib/auth-client";
import { useFormSEO } from "~/composables/seo/useFormSeo";
import type { FormSchema } from "~~/shared/types";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const { start, finish } = useLoadingIndicator();

// Get password from query if provided
const queryPassword = route.query.password as string | undefined;

// State for password input
const enteredPassword = ref("");
const showPasswordForm = ref(false);

// Fetch form with password if provided
const { data: form, error } = await useFetch<FormSchema>(
  `/api/forms/${route.params.id}`,
  {
    key: `form-${route.params.id}`,
    query: queryPassword ? { password: queryPassword } : {},
  },
);

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

const showGroupSelection = computed(
  () => form.value?.allowGroups && !hasToken.value,
);
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
    const { data: submitData, message } = await $fetch(
      `/api/forms/${route.params.id}/submit`,
      {
        method: "post",
        body: formData,
        headers: {
          ...(await authHeaders()),
        },
        onResponse({}) {
          loading.value = false;
          finish();
        },
        onResponseError(e) {
          toast.error(
            e.response._data.message ??
              e.response._data.statusMessage ??
              "An error occurred ",
          );
        },
      },
    );
    if (submitData) {
      toast.success(message);
      if (!submitData.payment) {
        await navigateTo(`/forms/${route.params.id}/submitted`);
        return;
      }
      try {
        const result = await checkPayment(submitData.payment.checkoutId, 15);
        toast.success("Payment completed!");
        await router.push(`/forms/${route.params.id}/submitted`);
      } catch (e: any) {
        toast.error(e.message ?? "An error occurred");
      }
    }
  } catch (e) {
  } finally {
    // loading.value = false;
    // finish();
  }
};

const checkPayment = async (
  checkoutId: string,
  maxRetries = 10,
  interval = 3000,
) => {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      const res = await $fetch(`/api/payments/${checkoutId}`);
      if (res.success && res.data && res.data.status == "completed") {
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
      class="min-h-screen bg-background flex items-center justify-center p-4"
    >
      <div class="text-center">
        <h1 class="text-6xl font-bold text-muted-foreground mb-4">404</h1>
        <h2 class="text-2xl font-semibold text-foreground mb-2">
          Form Not Found
        </h2>
        <p class="text-muted-foreground">
          The form you're looking for doesn't exist or has been removed.
        </p>
      </div>
    </div>

    <!-- Not Public -->
    <div
      v-else-if="errorCode === 'NOT_PUBLIC'"
      class="min-h-screen bg-background flex items-center justify-center p-4"
    >
      <div class="text-center">
        <EyeOff class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 class="text-2xl font-semibold text-foreground mb-2">
          Private Form
        </h2>
        <p class="text-muted-foreground">
          This form is private and not accessible to the public.
        </p>
      </div>
    </div>

    <!-- Form Expired -->
    <div
      v-else-if="errorCode === 'EXPIRED'"
      class="min-h-screen bg-background flex items-center justify-center p-4"
    >
      <div class="text-center">
        <AlertCircle class="w-16 h-16 text-destructive mx-auto mb-4" />
        <h2 class="text-2xl font-semibold text-foreground mb-2">
          Form Expired
        </h2>
        <p class="text-muted-foreground">
          This form has expired and is no longer accepting responses.
        </p>
      </div>
    </div>

    <!-- Wrong Password -->
    <div
      v-else-if="errorCode === 'WRONG_PASSWORD'"
      class="min-h-screen bg-background flex items-center justify-center p-4"
    >
      <div class="w-full max-w-md">
        <Card>
          <CardContent class="p-8 text-center">
            <Lock class="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 class="text-xl font-semibold text-foreground mb-2">
              Incorrect Password
            </h2>
            <p class="text-muted-foreground mb-6">
              The password you entered is incorrect.
            </p>
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
      class="min-h-screen bg-background flex items-center justify-center p-4"
    >
      <div class="w-full max-w-md">
        <Card>
          <CardContent class="p-8">
            <div class="text-center mb-6">
              <Lock class="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 class="text-xl font-semibold text-foreground mb-2">
                Password Required
              </h2>
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
              <Button @click="submitPassword" class="w-full">
                Access Form
              </Button>
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
        class="min-h-screen bg-background flex items-center justify-center p-4"
      >
        <div class="w-full max-w-4xl mx-auto">
          <!-- Header -->
          <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-foreground mb-4">
              {{ form.title }}
            </h1>
            <p
              v-if="form.description"
              class="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              {{ form.description }}
            </p>
          </div>

          <!-- Selection Cards -->
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Individual Registration Card -->
            <Card
              class="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
            >
              <CardContent class="p-8">
                <div class="flex items-center gap-4 mb-6">
                  <div class="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                    <User class="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 class="text-xl font-semibold text-foreground">
                      Fill for Yourself
                    </h3>
                    <p class="text-sm text-muted-foreground">
                      Individual registration
                    </p>
                  </div>
                </div>

                <div class="space-y-4 mb-8">
                  <div
                    class="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <Clock class="w-4 h-4" />
                    <span>Quick and simple process</span>
                  </div>
                  <div
                    class="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <DollarSign class="w-4 h-4" />
                    <span
                      >Pay:
                      {{
                        form.price
                          ? `Kes ${form.price.toLocaleString()}`
                          : "Free"
                      }}</span
                    >
                  </div>
                </div>

                <Button
                  @click="handleIndividualFill"
                  class="w-full group"
                  size="lg"
                >
                  <span>Start Registration</span>
                  <ArrowRight
                    class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                  />
                </Button>
              </CardContent>
            </Card>

            <!-- Group Registration Card -->
            <Card
              class="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
            >
              <CardContent class="p-8">
                <div class="flex items-center gap-4 mb-6">
                  <div class="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                    <Users class="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 class="text-xl font-semibold text-foreground">
                      Create Group
                    </h3>
                    <p class="text-sm text-muted-foreground">
                      Register multiple people
                    </p>
                  </div>
                </div>

                <div class="space-y-4 mb-8">
                  <div
                    class="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <Users class="w-4 h-4" />
                    <span
                      >Up to
                      {{ form.groupMemberLimit || "unlimited" }} members</span
                    >
                  </div>
                  <div
                    class="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <DollarSign class="w-4 h-4" />
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
                  class="w-full group border-2"
                  size="lg"
                >
                  <span>Create Group</span>
                  <ArrowRight
                    class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                  />
                </Button>
              </CardContent>
            </Card>
          </div>

          <!-- Additional Info -->
          <div class="mt-12 text-center">
            <div
              class="flex items-center justify-center gap-8 text-sm text-muted-foreground flex-wrap"
            >
              <div v-if="form.submissionLimit" class="flex items-center gap-2">
                <Clock class="w-4 h-4" />
                <span>Limited to {{ form.submissionLimit }} submissions</span>
              </div>
              <div v-if="form.requiresLogin" class="flex items-center gap-2">
                <User class="w-4 h-4" />
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
          class="bg-blue-50 dark:bg-blue-950/20 border-b border-blue-200 dark:border-blue-800"
        >
          <div class="container mx-auto px-4 py-3">
            <div class="flex items-center justify-between">
              <div
                class="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300"
              >
                <User class="w-4 h-4" />
                <span class="font-medium">Individual Registration</span>
                <span class="text-blue-600 dark:text-blue-400">
                  •
                  {{
                    hasToken ? "Filling for yourself" : "Personal registration"
                  }}
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
