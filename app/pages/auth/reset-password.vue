<script setup lang="ts">
import { toast } from "vue-sonner";
import { authClient } from "~/lib/auth-client";

definePageMeta({
  middleware: ["guest"],
});

const route = useRoute();
const token = route.query.token as string;

const form = ref({
  password: "",
  confirmPassword: "",
});

const isLoading = ref(false);
const isSuccess = ref(false);
const authStore = useAuthStore();

const resetPassword = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  if (form.value.password.length < 8) {
    toast.error("Password must be at least 8 characters");
    return;
  }

  isLoading.value = true;
  try {
    const { data, error } = await authClient.resetPassword({
      newPassword: form.value.password,
      token: token,
    });

    if (error && error.message) {
      toast.error(error.message);
      return;
    }

    if (data) {
      isSuccess.value = true;
      toast.success("Password reset successfully");

      setTimeout(() => {
        navigateTo("/auth/login");
      }, 2000);
    }
  } catch (error) {
    console.error("Password reset failed:", error);
    toast.error("Something went wrong. Please try again.");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (!token) {
    toast.error("Invalid or expired reset link");
    navigateTo("/auth/forgot-password");
  }
});
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
                {{ isSuccess ? "Password reset" : "Set new password" }}
              </h1>
              <p class="text-muted-foreground">
                {{
                  isSuccess
                    ? "Your password has been reset successfully"
                    : "Your new password must be different from previously used passwords"
                }}
              </p>
            </div>

            <div v-if="!isSuccess">
              <form @submit.prevent="resetPassword" class="space-y-4">
                <div class="space-y-2">
                  <Label for="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                    v-model="form.password"
                    required
                  />
                  <p class="text-xs text-muted-foreground">
                    Must be at least 8 characters
                  </p>
                </div>

                <div class="space-y-2">
                  <Label for="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    v-model="form.confirmPassword"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  class="w-full group"
                  :disabled="isLoading || !token"
                >
                  <span v-if="!isLoading">Reset Password</span>
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
                    Resetting...
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
                <p class="text-sm text-muted-foreground">
                  Redirecting you to login page...
                </p>
              </div>
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
