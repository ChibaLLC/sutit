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
import { useAuthStore } from "@/stores/auth";

const mobileMenuOpen = ref(false);
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
  mobileMenuOpen.value = false;
  await authStore.logout();
};
</script>
<template>
  <nav
    class="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm"
  >
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <!-- Logo Section -->
        <div class="flex items-center gap-6">
          <NuxtLink to="/" class="flex items-center space-x-3">
            <div
              class="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg"
            >
              <NuxtImg
                src="/logo.jpeg"
                class="flex h-full w-full items-center justify-center rounded-md"
              />
            </div>
            <span class="text-xl font-bold text-foreground hidden sm:inline"
              >SUTIT</span
            >
          </NuxtLink>

          <!-- Desktop Navigation -->
          <nav class="hidden lg:flex items-center space-x-1">
            <NuxtLink
              to="/"
              class="px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
            >
              Home
            </NuxtLink>
            <NuxtLink
              v-for="item in navItems"
              :key="item.href"
              :to="item.href"
              class="px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
            >
              {{ item.label }}
            </NuxtLink>
            <NuxtLink
              v-for="item in navs"
              :key="item.href"
              :to="item.href"
              class="px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>
        </div>

        <!-- Right Section -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Theme Toggle -->
          <Button
            @click="toggleDark()"
            variant="outline"
            size="icon"
            class="rounded-lg"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <Sun v-if="!isDark" class="h-4 w-4 text-amber-500" />
            <Moon v-else class="h-4 w-4 text-blue-400" />
            <span class="sr-only">Toggle theme</span>
          </Button>

          <!-- Auth Section -->
          <div
            v-if="!authStore.isAuthenticated"
            class="flex items-center gap-2"
          >
            <NuxtLink to="/auth/login" class="hidden sm:block">
              <Button variant="outline" class="rounded-lg">Log in</Button>
            </NuxtLink>
            <NuxtLink to="/auth/register">
              <Button class="rounded-lg">
                <span class="hidden sm:inline">Sign up</span>
                <span class="sm:hidden">Join</span>
              </Button>
            </NuxtLink>
          </div>

          <!-- User Menu -->
          <div v-else class="hidden sm:block">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  variant="outline"
                  size="icon"
                  class="rounded-full h-10 w-10 bg-primary/10 text-foreground hover:bg-primary/90"
                >
                  <User class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-56">
                <div class="px-4 py-3 border-b">
                  <div class="flex items-center gap-3">
                    <div
                      class="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold"
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
                <DropdownMenuItem as-child>
                  <a href="#" class="cursor-pointer">
                    <UserCircle class="h-4 w-4 mr-2" />
                    Profile
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <NuxtLink to="/settings" class="cursor-pointer">
                    <Settings class="h-4 w-4 mr-2" />
                    Settings
                  </NuxtLink>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <a href="#" class="cursor-pointer">
                    <CreditCard class="h-4 w-4 mr-2" />
                    Billing
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <a href="#" class="cursor-pointer">
                    <HelpCircle class="h-4 w-4 mr-2" />
                    Support
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem as-child>
                  <button
                    @click="logout"
                    class="w-full text-left cursor-pointer text-destructive hover:text-destructive"
                  >
                    <LogOut class="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <!-- Mobile Menu -->
          <Sheet v-model:open="mobileMenuOpen">
            <SheetTrigger as-child>
              <Button
                variant="outline"
                size="icon"
                class="lg:hidden rounded-lg"
              >
                <Menu v-if="!mobileMenuOpen" class="h-4 w-4" />
                <X v-else class="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" class="w-full">
              <div class="space-y-4 mt-4">
                <!-- Mobile Public Navigation -->
                <div class="space-y-2">
                  <NuxtLink
                    to="/about"
                    @click="mobileMenuOpen = false"
                    class="block px-4 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    About
                  </NuxtLink>
                  <NuxtLink
                    to="/contact"
                    @click="mobileMenuOpen = false"
                    class="block px-4 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    Contact
                  </NuxtLink>
                </div>

                <!-- Mobile Auth Section -->
                <div
                  v-if="!authStore.isAuthenticated"
                  class="space-y-2 border-t pt-4"
                >
                  <NuxtLink
                    to="/auth/login"
                    @click="mobileMenuOpen = false"
                    class="block"
                  >
                    <Button variant="outline" class="w-full rounded-lg"
                      >Log in</Button
                    >
                  </NuxtLink>
                  <NuxtLink
                    to="/auth/register"
                    @click="mobileMenuOpen = false"
                    class="block"
                  >
                    <Button class="w-full rounded-lg">Sign up</Button>
                  </NuxtLink>
                </div>

                <!-- Mobile Authenticated Navigation -->
                <div
                  v-if="authStore.isAuthenticated"
                  class="space-y-2 border-t pt-4"
                >
                  <NuxtLink
                    v-for="item in navItems"
                    :key="item.href"
                    :to="item.href"
                    @click="mobileMenuOpen = false"
                    class="block px-4 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {{ item.label }}
                  </NuxtLink>
                </div>

                <!-- Mobile User Section -->
                <div
                  v-if="authStore.isAuthenticated"
                  class="space-y-2 border-t pt-4"
                >
                  <div class="px-4 py-3 rounded-lg bg-accent/50">
                    <div class="flex items-center gap-3">
                      <div
                        class="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold"
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
                    class="flex items-center px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <UserCircle class="h-4 w-4 mr-2" />
                    Profile
                  </a>
                  <a
                    href="#"
                    @click="mobileMenuOpen = false"
                    class="flex items-center px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <Settings class="h-4 w-4 mr-2" />
                    Settings
                  </a>
                  <a
                    href="#"
                    @click="mobileMenuOpen = false"
                    class="flex items-center px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <CreditCard class="h-4 w-4 mr-2" />
                    Billing
                  </a>
                  <a
                    href="#"
                    @click="mobileMenuOpen = false"
                    class="flex items-center px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <HelpCircle class="h-4 w-4 mr-2" />
                    Support
                  </a>
                  <button
                    @click="
                      logout;
                      mobileMenuOpen = false;
                    "
                    class="w-full flex items-center px-4 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-left"
                  >
                    <LogOut class="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  </nav>
</template>
