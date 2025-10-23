<script setup lang="ts">
import {
  Menu,
  X,
  User,
  Sun,
  Moon,
  UserCircle,
  Settings,
  CreditCard,
  HelpCircle,
  LogOut,
} from "lucide-vue-next";
import { useDark, useToggle } from "@vueuse/core";

const mobileMenuOpen = ref(false);
const userMenuOpen = ref(false);
const authStore = useAuthStore();

const isDark = useDark();
const toggleDark = useToggle(isDark);

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Forms", href: "/forms" },
];
const navs = [
  { label: "Market Place", href: "/marketplace" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const logout = async () => {
  userMenuOpen.value = false;
  await authStore.logout();
};
</script>
<template>
  <nav
    class="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
  >
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <!-- Logo Section -->
        <div class="flex items-center gap-6">
          <NuxtLink to="/" class="flex items-center space-x-3 group">
            <div class="relative">
              <!-- Animated glow effect -->
              <div
                class="absolute inset-0 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 blur-xl transition-all duration-500 group-hover:blur-2xl group-hover:from-primary/40 group-hover:to-primary/40 animate-pulse"
              ></div>
              <div
                class="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-primary/30 group-hover:shadow-xl"
              >
                <NuxtImg
                  src="/logo.jpeg"
                  class="flex h-full w-full items-center justify-center text-white font-bold text-lg rounded-lg"
                />
                <!-- Inner shine effect -->
                <div
                  class="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                ></div>
              </div>
            </div>
            <div class="flex flex-col">
              <span
                class="text-xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent"
              >
                SUTIT
              </span>
            </div>
          </NuxtLink>

          <!-- Desktop Navigation -->
          <nav class="hidden lg:flex items-center space-x-1">
            <NuxtLink
              to="/"
              class="relative px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-primary group rounded-lg"
            >
              <span class="relative z-10">Home</span>
              <!-- Hover background with slide effect -->
              <span
                class="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 scale-95 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
              ></span>
              <!-- Active indicator -->
              <span
                class="absolute bottom-0 left-1/2 h-0.5 w-0 bg-gradient-to-r from-primary to-primary/60 transition-all duration-300 group-hover:w-full group-hover:-translate-x-1/2 rounded-full"
              ></span>
            </NuxtLink>
            <NuxtLink
              v-if="authStore.isAuthenticated"
              v-for="item in navItems"
              :key="item.href"
              :to="item.href"
              class="relative px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-primary group rounded-lg"
            >
              <span class="relative z-10">{{ item.label }}</span>
              <!-- Hover background with slide effect -->
              <span
                class="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 scale-95 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
              ></span>
              <!-- Active indicator -->
              <span
                class="absolute bottom-0 left-1/2 h-0.5 w-0 bg-gradient-to-r from-primary to-primary/60 transition-all duration-300 group-hover:w-full group-hover:-translate-x-1/2 rounded-full"
              ></span>
            </NuxtLink>
            <NuxtLink
              v-for="item in navs"
              :key="item.href"
              :to="item.href"
              class="relative px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-primary group rounded-lg"
            >
              <span class="relative z-10">{{ item.label }}</span>
              <!-- Hover background with slide effect -->
              <span
                class="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 scale-95 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
              ></span>
              <!-- Active indicator -->
              <span
                class="absolute bottom-0 left-1/2 h-0.5 w-0 bg-gradient-to-r from-primary to-primary/60 transition-all duration-300 group-hover:w-full group-hover:-translate-x-1/2 rounded-full"
              ></span>
            </NuxtLink>
          </nav>
        </div>

        <!-- Right Section -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Theme Toggle with enhanced animation -->
          <button
            @click="toggleDark()"
            class="relative h-10 w-10 rounded-xl border border-input/50 bg-background/50 hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-105 active:scale-95 hover:border-primary/20 group overflow-hidden"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <!-- Background glow -->
            <div
              class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            ></div>

            <Sun
              class="h-4 w-4 rotate-0 scale-100 transition-all duration-500 dark:-rotate-180 dark:scale-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-500"
            />
            <Moon
              class="h-4 w-4 rotate-180 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400"
            />
            <span class="sr-only">Toggle theme</span>
          </button>

          <!-- Auth Section -->
          <div
            v-if="!authStore.isAuthenticated"
            class="flex items-center gap-2"
          >
            <!-- Login Button -->
            <NuxtLink
              to="/auth/login"
              class="hidden sm:inline-flex h-10 px-4 py-2 items-center justify-center rounded-xl text-sm font-medium transition-all duration-300 hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95 border border-transparent hover:border-primary/20"
            >
              Log in
            </NuxtLink>

            <!-- Enhanced Sign Up Button -->
            <NuxtLink
              to="/auth/register"
              class="relative inline-flex h-10 px-4 sm:px-6 py-2 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-medium transition-all duration-300 hover:from-primary/90 hover:to-primary/70 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl hover:shadow-primary/25 overflow-hidden group"
            >
              <!-- Shine effect -->
              <div
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
              ></div>
              <span class="relative hidden sm:inline">Sign up</span>
              <span class="relative sm:hidden">Join</span>
            </NuxtLink>
          </div>

          <!-- Enhanced User Menu -->
          <div v-else class="relative">
            <button
              @click="userMenuOpen = !userMenuOpen"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground transition-all duration-300 hover:from-primary/80 hover:to-primary/60 hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl hover:shadow-primary/30 group relative overflow-hidden"
              :class="{
                'ring-2 ring-primary/30 ring-offset-2 ring-offset-background scale-105':
                  userMenuOpen,
              }"
            >
              <!-- Pulse effect when active -->
              <div
                v-if="userMenuOpen"
                class="absolute inset-0 rounded-full bg-primary animate-ping opacity-20"
              ></div>
              <User
                class="h-4 w-4 relative z-10 transition-transform duration-300 group-hover:scale-110"
              />
            </button>

            <!-- Enhanced Dropdown -->
            <Transition
              enter-active-class="transition ease-out duration-300"
              enter-from-class="transform opacity-0 scale-90 -translate-y-4"
              enter-to-class="transform opacity-100 scale-100 translate-y-0"
              leave-active-class="transition ease-in duration-200"
              leave-from-class="transform opacity-100 scale-100 translate-y-0"
              leave-to-class="transform opacity-0 scale-90 -translate-y-4"
            >
              <div
                v-if="userMenuOpen"
                @click.outside="userMenuOpen = false"
                class="absolute right-0 mt-3 w-64 rounded-2xl bg-popover/95 backdrop-blur-xl text-popover-foreground shadow-2xl ring-1 ring-border/20 border border-border/30 overflow-hidden"
              >
                <!-- Enhanced User Info Header -->
                <div
                  class="px-4 py-4 border-b border-border/30 bg-gradient-to-r from-primary/5 to-transparent"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold"
                    >
                      {{ authStore.user?.name?.charAt(0) || "U" }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold truncate">
                        {{ authStore.user?.name }}
                      </p>
                      <p class="text-xs text-muted-foreground truncate">
                        {{ authStore.user?.email }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="py-2">
                  <a
                    href="#"
                    class="flex items-center px-4 py-3 text-sm hover:bg-accent/50 hover:text-accent-foreground transition-all duration-200 group"
                  >
                    <UserCircle
                      class="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors"
                    />
                    <span class="font-medium">Profile</span>
                  </a>
                  <NuxtLink
                    href="/settings"
                    class="flex items-center px-4 py-3 text-sm hover:bg-accent/50 hover:text-accent-foreground transition-all duration-200 group"
                  >
                    <Settings
                      class="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors"
                    />
                    <span class="font-medium">Settings</span>
                  </NuxtLink>
                  <a
                    href="#"
                    class="flex items-center px-4 py-3 text-sm hover:bg-accent/50 hover:text-accent-foreground transition-all duration-200 group"
                  >
                    <CreditCard
                      class="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors"
                    />
                    <span class="font-medium">Billing</span>
                  </a>
                  <a
                    href="#"
                    class="flex items-center px-4 py-3 text-sm hover:bg-accent/50 hover:text-accent-foreground transition-all duration-200 group"
                  >
                    <HelpCircle
                      class="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors"
                    />
                    <span class="font-medium">Support</span>
                  </a>

                  <hr class="my-2 border-border/30" />

                  <button
                    @click="logout"
                    class="w-full flex items-center px-4 py-3 text-sm hover:bg-destructive/10 hover:text-destructive transition-all duration-200 group text-left"
                  >
                    <LogOut
                      class="h-4 w-4 mr-3 text-muted-foreground group-hover:text-destructive transition-colors"
                    />
                    <span class="font-medium">Sign out</span>
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Enhanced Mobile Menu Button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="lg:hidden h-10 w-10 rounded-xl border border-input/50 bg-background/50 hover:bg-accent hover:text-accent-foreground transition-all duration-300 flex items-center justify-center hover:scale-105 active:scale-95 hover:border-primary/20 group"
            :class="{
              'bg-accent text-accent-foreground border-primary/30 scale-105':
                mobileMenuOpen,
            }"
          >
            <div class="relative">
              <Menu
                v-if="!mobileMenuOpen"
                class="h-4 w-4 transition-all duration-300 group-hover:scale-110"
              />
              <X
                v-else
                class="h-4 w-4 transition-all duration-300 rotate-90 group-hover:rotate-180"
              />
            </div>
            <span class="sr-only">Toggle menu</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Enhanced Mobile Navigation -->
    <Transition
      enter-active-class="transition ease-out duration-400"
      enter-from-class="transform -translate-y-full opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-300"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-full opacity-0"
    >
      <div
        v-if="mobileMenuOpen"
        class="lg:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl shadow-2xl"
      >
        <div class="container mx-auto px-4 sm:px-6 py-6">
          <!-- Mobile Public Navigation -->
          <div class="pb-6 mb-6 border-b border-border/30">
            <div class="space-y-2">
              <NuxtLink
                to="/about"
                @click="mobileMenuOpen = false"
                class="flex items-center px-4 py-3 rounded-xl text-sm font-medium hover:bg-accent/50 hover:text-accent-foreground transition-all duration-300 group"
              >
                <span class="relative">
                  About
                  <span
                    class="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full rounded-full"
                  ></span>
                </span>
              </NuxtLink>
              <NuxtLink
                to="/contact"
                @click="mobileMenuOpen = false"
                class="flex items-center px-4 py-3 rounded-xl text-sm font-medium hover:bg-accent/50 hover:text-accent-foreground transition-all duration-300 group"
              >
                <span class="relative">
                  Contact
                  <span
                    class="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full rounded-full"
                  ></span>
                </span>
              </NuxtLink>
            </div>
          </div>

          <!-- Mobile Auth Section -->
          <div
            v-if="!authStore.isAuthenticated"
            class="pb-6 mb-6 border-b border-border/30"
          >
            <div class="flex flex-col gap-3">
              <NuxtLink
                to="/auth/login"
                @click="mobileMenuOpen = false"
                class="flex h-12 w-full items-center justify-center rounded-xl text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-300 border border-input/50 hover:border-primary/30"
              >
                Log in
              </NuxtLink>
              <NuxtLink
                to="/auth/register"
                @click="mobileMenuOpen = false"
                class="relative flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-medium transition-all duration-300 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl overflow-hidden group"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                ></div>
                <span class="relative">Sign up</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Mobile Authenticated Navigation -->
          <div
            v-if="authStore.isAuthenticated"
            class="space-y-2 pb-6 mb-6 border-b border-border/30"
          >
            <NuxtLink
              v-for="item in navItems"
              :key="item.href"
              :to="item.href"
              @click="mobileMenuOpen = false"
              class="flex items-center px-4 py-3 rounded-xl text-sm font-medium hover:bg-accent/50 hover:text-accent-foreground transition-all duration-300 group"
            >
              <span class="relative">
                {{ item.label }}
                <span
                  class="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full rounded-full"
                ></span>
              </span>
            </NuxtLink>
          </div>

          <!-- Mobile User Section -->
          <div v-if="authStore.isAuthenticated" class="space-y-2">
            <div
              class="px-4 py-3 rounded-xl bg-gradient-to-r from-primary/5 to-transparent"
            >
              <div class="flex items-center gap-3">
                <div
                  class="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold"
                >
                  {{ authStore.user?.name?.charAt(0) || "U" }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold truncate">
                    {{ authStore.user?.name }}
                  </p>
                  <p class="text-xs text-muted-foreground truncate">
                    {{ authStore.user?.email }}
                  </p>
                </div>
              </div>
            </div>

            <a
              href="#"
              @click="mobileMenuOpen = false"
              class="flex items-center px-4 py-3 rounded-xl text-sm hover:bg-accent/50 hover:text-accent-foreground transition-all duration-300 group"
            >
              <UserCircle
                class="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors"
              />
              <span class="font-medium">Profile</span>
            </a>
            <a
              href="#"
              @click="mobileMenuOpen = false"
              class="flex items-center px-4 py-3 rounded-xl text-sm hover:bg-accent/50 hover:text-accent-foreground transition-all duration-300 group"
            >
              <Settings
                class="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors"
              />
              <span class="font-medium">Settings</span>
            </a>
            <a
              href="#"
              @click="mobileMenuOpen = false"
              class="flex items-center px-4 py-3 rounded-xl text-sm hover:bg-accent/50 hover:text-accent-foreground transition-all duration-300 group"
            >
              <CreditCard
                class="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors"
              />
              <span class="font-medium">Billing</span>
            </a>
            <a
              href="#"
              @click="mobileMenuOpen = false"
              class="flex items-center px-4 py-3 rounded-xl text-sm hover:bg-accent/50 hover:text-accent-foreground transition-all duration-300 group"
            >
              <HelpCircle
                class="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors"
              />
              <span class="font-medium">Support</span>
            </a>

            <button
              @click="
                logout();
                mobileMenuOpen = false;
              "
              class="w-full flex items-center px-4 py-3 rounded-xl text-sm hover:bg-destructive/10 hover:text-destructive transition-all duration-300 group text-left"
            >
              <LogOut
                class="h-4 w-4 mr-3 text-muted-foreground group-hover:text-destructive transition-colors"
              />
              <span class="font-medium">Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </nav>
</template>
