<template>
  <div class="min-h-screen bg-gradient-to-b from-background to-muted/20">
    <!-- Shared Navigation -->
    <LayoutAppHeader />

    <!-- Login Section -->
    <section class="relative overflow-hidden">
      <div
        class="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none"
      ></div>
      <div class="container mx-auto px-4 py-20 lg:py-32">
        <div class="max-w-md mx-auto">
          <!-- Login Card -->
          <Card class="p-8">
            <div class="text-center mb-8">
              <div class="flex items-center justify-center gap-2 mb-6">
                <div
                  class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center"
                >
                  <span class="text-white font-bold text-lg">S</span>
                </div>
                <span class="text-2xl font-bold">SUTIT Forms</span>
              </div>

              <h1 class="text-2xl font-bold text-foreground mb-2">
                Welcome Back
              </h1>
              <p class="text-muted-foreground">
                Sign in to your account to continue building amazing forms
              </p>
            </div>

            <!-- Google Sign In Button -->
            <Button
              variant="outline"
              size="lg"
              class="w-full mb-6 group hover:shadow-md transition-all duration-200"
              @click="signInWithGoogle"
            >
              <svg class="mr-3 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <!-- Divider -->
            <div class="relative mb-6">
              <div class="absolute inset-0 flex items-center">
                <span class="w-full border-t border-border" />
              </div>
              <div class="relative flex justify-center text-xs uppercase">
                <span class="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            <!-- Email/Password Form -->
            <form @submit.prevent="signInWithEmail" class="space-y-4">
              <div class="space-y-2">
                <Label for="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  v-model="email"
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  v-model="password"
                  required
                />
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <Checkbox id="remember" v-model="rememberMe" />
                  <Label
                    for="remember"
                    class="text-sm font-normal cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>
                <a href="#" class="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                size="lg"
                class="w-full group"
                :disabled="isLoading"
              >
                <span v-if="!isLoading">Sign In</span>
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
                  Signing in...
                </span>
              </Button>
            </form>

            <!-- Sign Up Link -->
            <div class="text-center mt-6 pt-6 border-t border-border">
              <p class="text-sm text-muted-foreground">
                Don't have an account?
                <a href="#" class="text-primary hover:underline font-medium">
                  Sign up for free
                </a>
              </p>
            </div>
          </Card>

          <!-- Trust Indicators -->
          <div class="mt-8 text-center">
            <div
              class="flex items-center justify-center gap-6 text-xs text-muted-foreground"
            >
              <div class="flex items-center gap-1">
                <Shield class="w-4 h-4" />
                <span>Secure Login</span>
              </div>
              <div class="w-px h-4 bg-border"></div>
              <div class="flex items-center gap-1">
                <Lock class="w-4 h-4" />
                <span>256-bit SSL</span>
              </div>
              <div class="w-px h-4 bg-border"></div>
              <div class="flex items-center gap-1">
                <CheckCircle class="w-4 h-4" />
                <span>GDPR Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-8 bg-muted/30 border-t">
      <div class="container mx-auto px-4">
        <div class="text-center text-sm text-muted-foreground">
          <p>&copy; 2025 SUTIT Forms. All rights reserved.</p>
          <div class="flex justify-center gap-6 mt-2">
            <a href="#" class="hover:text-primary transition-colors"
              >Privacy Policy</a
            >
            <a href="#" class="hover:text-primary transition-colors"
              >Terms of Service</a
            >
            <a href="#" class="hover:text-primary transition-colors"
              >Help Center</a
            >
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Shield, Lock, CheckCircle } from "lucide-vue-next";

// Form state
const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const isLoading = ref(false);

// Methods
const signInWithGoogle = async () => {
  isLoading.value = true;
  try {
    // Integrate with your Google OAuth implementation
    console.log("Signing in with Google...");
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Redirect to dashboard or handle success
  } catch (error) {
    console.error("Google sign-in failed:", error);
  } finally {
    isLoading.value = false;
  }
};

const signInWithEmail = async () => {
  isLoading.value = true;
  try {
    // Integrate with your email/password authentication
    console.log("Signing in with email:", email.value);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Redirect to dashboard or handle success
  } catch (error) {
    console.error("Email sign-in failed:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>
