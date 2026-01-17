<script setup lang="ts">
import { toast } from "vue-sonner";
import { authClient } from "~/lib/auth-client";

definePageMeta({
  middleware: ["guest"],
});

const form = ref({
  email: "",
});

const isLoading = ref(false);
const isSuccess = ref(false);
const authStore = useAuthStore();

const requestPasswordReset = async () => {
  isLoading.value = true;
  try {
    const { data, error } = await authClient.requestPasswordReset({
      email: form.value.email,
      redirectTo: `/auth/reset-password`,
    });
    if (error && error.message) {
      toast.error(error.message);
      return;
    }
    if (data) {
      isSuccess.value = true;
      toast.success("Password reset link sent to your email");
    }
  } catch (error) {
    console.error("Password reset request failed:", error);
    toast.error("Something went wrong. Please try again.");
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <section class="relative overflow-hidden">
      <div
        class="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none"
      ></div>
      <div class="container mx-auto px-4 py-20 lg:py-32">
        <div class="max-w-md mx-auto">
          <Card class="p-8">
            <div class="text-center mb-8">
              <div class="flex items-center justify-center gap-2 mb-6">
                <div
                  class="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg"
                >
                  <NuxtImg
                    src="/logo.jpeg"
                    class="flex h-full w-full items-center justify-center rounded-md"
                  />
                </div>
                <span class="text-2xl font-bold">SUTIT</span>
              </div>

              <h1 class="text-2xl font-bold text-foreground mb-2">
                {{ isSuccess ? "Check your email" : "Forgot your password?" }}
              </h1>
              <p class="text-muted-foreground">
                {{
                  isSuccess
                    ? "We sent you a link to reset your password"
                    : "Enter your email and we'll send you a link to reset your password"
                }}
              </p>
            </div>

            <div v-if="!isSuccess">
              <form @submit.prevent="requestPasswordReset" class="space-y-4">
                <div class="space-y-2">
                  <Label for="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    v-model="form.email"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  class="w-full group"
                  :disabled="isLoading"
                >
                  <span v-if="!isLoading">Send reset link</span>
                  <span v-else class="flex items-center">
                    <svg
                      class="animate-spin -ml-1 mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </span>
                </Button>
              </form>
            </div>

            <div v-else class="text-center">
              <div class="mb-6">
                <div
                  class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
                >
                  <svg
                    class="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <p class="text-sm text-muted-foreground mb-4">
                  We've sent a password reset link to
                  <strong>{{ form.email }}</strong>
                </p>
                <p class="text-sm text-muted-foreground">
                  Click the link in the email to reset your password. If you
                  don't see it, check your spam folder.
                </p>
              </div>
              <Button
                variant="outline"
                size="lg"
                class="w-full"
                @click="isSuccess = false"
              >
                Send to a different email
              </Button>
            </div>

            <div class="text-center mt-6 pt-6 border-t border-border">
              <p class="text-sm text-muted-foreground">
                Remember your password?
                <NuxtLink
                  href="/auth/login"
                  class="text-primary hover:underline font-medium"
                >
                  Sign in
                </NuxtLink>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  </div>
</template>
