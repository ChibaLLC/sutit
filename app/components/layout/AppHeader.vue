<template>
  <nav
    class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
  >
    <div class="container mx-auto px-4">
      <div class="flex h-16 items-center justify-between">
        <!-- Logo Section -->
        <div class="flex items-center gap-6">
          <NuxtLink to="/" class="flex items-center space-x-2 group">
            <div class="relative">
              <div
                class="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 blur-xl transition-all duration-300 group-hover:blur-2xl"
              ></div>
              <div
                class="relative h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-primary/25"
              >
                <div
                  class="flex h-full w-full items-center justify-center text-white font-bold"
                >
                  S
                </div>
              </div>
            </div>
            <span
              class="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
            >
              SUTIT FORMS
            </span>
          </NuxtLink>

          <!-- Desktop Navigation (only show when authenticated) -->
          <nav
            v-if="isAuthenticated"
            class="hidden lg:flex items-center space-x-1"
          >
            <NuxtLink
              v-for="item in navItems"
              :key="item.href"
              :to="item.href"
              class="relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary group"
            >
              <span class="relative z-10">{{ item.label }}</span>
              <span
                class="absolute inset-0 rounded-md bg-primary/5 dark:bg-primary/10 scale-95 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100"
              ></span>
            </NuxtLink>
          </nav>
        </div>

        <!-- Right Section -->
        <div class="flex items-center gap-3">
          <!-- Theme Toggle -->
          <button
            @click="toggleDark()"
            class="relative h-9 w-9 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-105 active:scale-95"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <Sun
              class="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
            <Moon
              class="h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
            <span class="sr-only">Toggle theme</span>
          </button>

          <!-- Auth Section -->
          <div v-if="!isAuthenticated" class="flex items-center gap-2">
            <!-- Login Button -->
            <NuxtLink
              to="/login"
              class="hidden sm:inline-flex h-9 px-4 py-2 items-center justify-center rounded-md text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95"
            >
              Log in
            </NuxtLink>

            <!-- Sign Up Button -->
            <NuxtLink
              to="/signup"
              class="inline-flex h-9 px-4 py-2 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium transition-all duration-200 hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
            >
              <span class="hidden sm:inline">Sign up</span>
              <span class="sm:hidden">Join</span>
            </NuxtLink>
          </div>

          <!-- User Menu (authenticated state) -->
          <div v-else class="relative">
            <button
              @click="userMenuOpen = !userMenuOpen"
              class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground transition-all duration-200 hover:from-primary/90 hover:to-primary/70 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
              :class="{
                'ring-2 ring-primary/20 ring-offset-2 ring-offset-background':
                  userMenuOpen,
              }"
            >
              <User class="h-4 w-4" />
            </button>

            <!-- Dropdown -->
            <transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="transform opacity-0 scale-95 -translate-y-2"
              enter-to-class="transform opacity-100 scale-100 translate-y-0"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="transform opacity-100 scale-100 translate-y-0"
              leave-to-class="transform opacity-0 scale-95 -translate-y-2"
            >
              <div
                v-if="userMenuOpen"
                @click.outside="userMenuOpen = false"
                class="absolute right-0 mt-2 w-56 rounded-lg bg-popover/95 backdrop-blur-md text-popover-foreground shadow-xl ring-1 ring-border/50 border border-border/50"
              >
                <!-- User Info Header -->
                <div class="px-4 py-3 border-b border-border/50">
                  <p class="text-sm font-medium">John Doe</p>
                  <p class="text-xs text-muted-foreground truncate">
                    john.doe@example.com
                  </p>
                </div>

                <div class="py-1">
                  <a
                    href="#"
                    class="flex items-center px-4 py-2 text-sm hover:bg-accent/50 hover:text-accent-foreground transition-colors group"
                  >
                    <UserCircle
                      class="h-4 w-4 mr-3 text-muted-foreground group-hover:text-accent-foreground transition-colors"
                    />
                    Profile
                  </a>
                  <a
                    href="#"
                    class="flex items-center px-4 py-2 text-sm hover:bg-accent/50 hover:text-accent-foreground transition-colors group"
                  >
                    <Settings
                      class="h-4 w-4 mr-3 text-muted-foreground group-hover:text-accent-foreground transition-colors"
                    />
                    Settings
                  </a>
                  <a
                    href="#"
                    class="flex items-center px-4 py-2 text-sm hover:bg-accent/50 hover:text-accent-foreground transition-colors group"
                  >
                    <CreditCard
                      class="h-4 w-4 mr-3 text-muted-foreground group-hover:text-accent-foreground transition-colors"
                    />
                    Billing
                  </a>
                  <a
                    href="#"
                    class="flex items-center px-4 py-2 text-sm hover:bg-accent/50 hover:text-accent-foreground transition-colors group"
                  >
                    <HelpCircle
                      class="h-4 w-4 mr-3 text-muted-foreground group-hover:text-accent-foreground transition-colors"
                    />
                    Support
                  </a>

                  <hr class="my-1 border-border/50" />

                  <button
                    @click="logout"
                    class="w-full flex items-center px-4 py-2 text-sm hover:bg-destructive/10 hover:text-destructive transition-colors group text-left"
                  >
                    <LogOut
                      class="h-4 w-4 mr-3 text-muted-foreground group-hover:text-destructive transition-colors"
                    />
                    Sign out
                  </button>
                </div>
              </div>
            </transition>
          </div>

          <!-- Mobile Menu Button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="lg:hidden h-9 w-9 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95"
            :class="{ 'bg-accent text-accent-foreground': mobileMenuOpen }"
          >
            <Menu v-if="!mobileMenuOpen" class="h-4 w-4" />
            <X v-else class="h-4 w-4" />
            <span class="sr-only">Toggle menu</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform -translate-y-full opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-full opacity-0"
    >
      <div
        v-if="mobileMenuOpen"
        class="md:hidden border-t bg-background/95 backdrop-blur-md shadow-lg"
      >
        <div class="container mx-auto px-4 py-4">
          <!-- Mobile Public Navigation -->
          <div class="pb-4 mb-4 border-b border-border/50">
            <div class="space-y-1">
              <NuxtLink
                to="/about"
                @click="mobileMenuOpen = false"
                class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-accent/50 hover:text-accent-foreground transition-colors"
              >
                About
              </NuxtLink>
              <NuxtLink
                to="/contact"
                @click="mobileMenuOpen = false"
                class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-accent/50 hover:text-accent-foreground transition-colors"
              >
                Contact
              </NuxtLink>
            </div>
          </div>

          <!-- Mobile Auth Section (when not authenticated) -->
          <div
            v-if="!isAuthenticated"
            class="pb-4 mb-4 border-b border-border/50"
          >
            <div class="flex flex-col gap-2">
              <NuxtLink
                to="/login"
                @click="mobileMenuOpen = false"
                class="flex h-10 w-full items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Log in
              </NuxtLink>
              <NuxtLink
                to="/signup"
                @click="mobileMenuOpen = false"
                class="flex h-10 w-full items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90"
              >
                Sign up
              </NuxtLink>
            </div>
          </div>

          <!-- Mobile Navigation Links (when authenticated) -->
          <div
            v-if="isAuthenticated"
            class="space-y-1 pb-4 mb-4 border-b border-border/50"
          >
            <NuxtLink
              v-for="item in navItems"
              :key="item.href"
              :to="item.href"
              @click="mobileMenuOpen = false"
              class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-accent/50 hover:text-accent-foreground transition-colors"
            >
              {{ item.label }}
            </NuxtLink>
          </div>

          <!-- Mobile User Menu (when authenticated) -->
          <div v-if="isAuthenticated" class="space-y-1">
            <div class="px-3 py-2">
              <p class="text-sm font-medium">John Doe</p>
              <p class="text-xs text-muted-foreground">john.doe@example.com</p>
            </div>

            <a
              href="#"
              @click="mobileMenuOpen = false"
              class="flex items-center px-3 py-2 rounded-md text-sm hover:bg-accent/50 hover:text-accent-foreground transition-colors"
            >
              <UserCircle class="h-4 w-4 mr-3 text-muted-foreground" />
              Profile
            </a>
            <a
              href="#"
              @click="mobileMenuOpen = false"
              class="flex items-center px-3 py-2 rounded-md text-sm hover:bg-accent/50 hover:text-accent-foreground transition-colors"
            >
              <Settings class="h-4 w-4 mr-3 text-muted-foreground" />
              Settings
            </a>
            <a
              href="#"
              @click="mobileMenuOpen = false"
              class="flex items-center px-3 py-2 rounded-md text-sm hover:bg-accent/50 hover:text-accent-foreground transition-colors"
            >
              <CreditCard class="h-4 w-4 mr-3 text-muted-foreground" />
              Billing
            </a>
            <a
              href="#"
              @click="mobileMenuOpen = false"
              class="flex items-center px-3 py-2 rounded-md text-sm hover:bg-accent/50 hover:text-accent-foreground transition-colors"
            >
              <HelpCircle class="h-4 w-4 mr-3 text-muted-foreground" />
              Support
            </a>

            <button
              @click="
                logout();
                mobileMenuOpen = false;
              "
              class="w-full flex items-center px-3 py-2 rounded-md text-sm hover:bg-destructive/10 hover:text-destructive transition-colors text-left"
            >
              <LogOut class="h-4 w-4 mr-3 text-muted-foreground" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </transition>
  </nav>
</template>

<script setup lang="ts">
import { ref } from "vue";
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

// Auth state - set this to true to test authenticated state
const isAuthenticated = ref(true); // Change to true to test authenticated state

const isDark = useDark();
const toggleDark = useToggle(isDark);

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Forms", href: "/forms" },
  { label: "Analytics", href: "/dashboard/analytics" },
  { label: "Submissions", href: "/forms/12/submissions" },
];

const logout = () => {
  // Handle logout logic here
  isAuthenticated.value = false;
  userMenuOpen.value = false;
  console.log("Logging out...");
};

// Close mobile menu when clicking outside
const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

// Close user menu when clicking outside
const closeUserMenu = () => {
  userMenuOpen.value = false;
};
</script>
