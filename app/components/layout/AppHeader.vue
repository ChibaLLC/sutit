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
  Sparkles,
  ArrowRight,
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
  { label: "Settings", href: "/settings" },
];

const navs = [
  { label: "Marketplace", href: "/marketplace" },
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
    class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
  >
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex h-20 items-center justify-between">
        <!-- Logo Section -->
        <div class="flex items-center gap-8">
          <NuxtLink to="/" class="group flex items-center space-x-3">
            <div class="relative">
              <div
                class="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity"
              ></div>
              <div
                class="relative h-12 w-12 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
              >
                <NuxtImg
                  src="/logo.jpeg"
                  class="h-8 w-8 rounded-lg object-cover"
                />
              </div>
            </div>
            <div class="flex flex-col">
              <span
                class="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent"
                >SUTIT</span
              >
            </div>
          </NuxtLink>

          <!-- Desktop Navigation -->
          <nav class="hidden lg:flex items-center space-x-1">
            <NuxtLink
              to="/"
              class="group relative px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-accent/50 transition-all duration-200"
              :class="
                $route.path === '/'
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-foreground hover:text-primary'
              "
            >
              <span class="relative z-10">Home</span>
              <div
                class="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
              ></div>
            </NuxtLink>

            <template v-if="authStore.isAuthenticated">
              <NuxtLink
                v-for="item in navItems"
                :key="item.href"
                :to="item.href"
                class="group relative px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-accent/50 transition-all duration-200"
                :class="
                  $route.path === item.href
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-foreground hover:text-primary'
                "
              >
                <span class="relative z-10">{{ item.label }}</span>
                <div
                  class="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                ></div>
              </NuxtLink>
            </template>

            <NuxtLink
              v-for="item in navs"
              :key="item.href"
              :to="item.href"
              class="group relative px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-accent/50 transition-all duration-200"
              :class="
                $route.path === item.href
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-foreground hover:text-primary'
              "
            >
              <span class="relative z-10">{{ item.label }}</span>
              <div
                class="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
              ></div>
            </NuxtLink>
          </nav>
        </div>

        <!-- Right Section -->
        <div class="flex items-center gap-3">
          <!-- CTA Button for non-authenticated users -->
          <div
            v-if="!authStore.isAuthenticated"
            class="hidden md:flex items-center gap-3"
          >
            <NuxtLink to="/auth/login">
              <Button variant="ghost" class="rounded-xl hover:bg-accent/50">
                Log in
              </Button>
            </NuxtLink>
            <NuxtLink to="/auth/register">
              <Button
                class="rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <Sparkles
                  class="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform"
                />
                Get Started
                <ArrowRight
                  class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                />
              </Button>
            </NuxtLink>
          </div>

          <!-- Theme Toggle -->
          <Button
            @click="toggleDark()"
            variant="outline"
            size="icon"
            class="rounded-xl border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <Sun v-if="!isDark" class="h-4 w-4 text-amber-500" />
            <Moon v-else class="h-4 w-4 text-blue-400" />
            <span class="sr-only">Toggle theme</span>
          </Button>

          <!-- User Menu -->
          <div v-if="authStore.isAuthenticated" class="hidden sm:block">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  variant="outline"
                  size="icon"
                  class="rounded-xl h-11 w-11 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                >
                  <div
                    class="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center"
                  >
                    <span class="text-xs font-bold text-primary-foreground">
                      {{ authStore.user?.name?.charAt(0) || "U" }}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                class="w-64 rounded-xl border-border/50 shadow-xl"
              >
                <div class="px-4 py-3 border-b border-border/50">
                  <div class="flex items-center gap-3">
                    <div
                      class="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 text-primary-foreground flex items-center justify-center font-semibold"
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
                <DropdownMenuItem as-child class="rounded-lg">
                  <a href="#" class="cursor-pointer">
                    <UserCircle class="h-4 w-4 mr-3" />
                    Profile
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem as-child class="rounded-lg">
                  <NuxtLink to="/settings" class="cursor-pointer">
                    <Settings class="h-4 w-4 mr-3" />
                    Settings
                  </NuxtLink>
                </DropdownMenuItem>

                <DropdownMenuItem as-child class="rounded-lg">
                  <a href="#" class="cursor-pointer">
                    <HelpCircle class="h-4 w-4 mr-3" />
                    Support
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem as-child class="rounded-lg">
                  <button
                    @click="logout"
                    class="w-full text-left cursor-pointer text-destructive hover:text-destructive"
                  >
                    <LogOut class="h-4 w-4 mr-3" />
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
                class="lg:hidden rounded-xl border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
              >
                <Menu v-if="!mobileMenuOpen" class="h-4 w-4" />
                <X v-else class="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="top"
              class="w-full rounded-b-2xl border-border/50"
            >
              <div class="space-y-6 mt-6">
                <!-- Mobile Auth Section -->
                <div v-if="!authStore.isAuthenticated" class="space-y-3">
                  <NuxtLink
                    to="/auth/login"
                    @click="mobileMenuOpen = false"
                    class="block"
                  >
                    <Button variant="outline" class="w-full rounded-xl"
                      >Log in</Button
                    >
                  </NuxtLink>
                  <NuxtLink
                    to="/auth/register"
                    @click="mobileMenuOpen = false"
                    class="block"
                  >
                    <Button
                      class="w-full rounded-xl bg-gradient-to-r from-primary to-purple-600"
                    >
                      <Sparkles class="w-4 h-4 mr-2" />
                      Get Started
                    </Button>
                  </NuxtLink>
                </div>

                <!-- Mobile Navigation -->
                <div class="grid grid-cols-2 gap-2">
                  <NuxtLink
                    to="/"
                    @click="mobileMenuOpen = false"
                    class="px-3 py-2 text-center text-sm font-medium rounded-lg hover:bg-accent/50 transition-all duration-200"
                    :class="
                      $route.path === '/'
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-foreground hover:text-primary'
                    "
                  >
                    Home
                  </NuxtLink>
                  <template v-if="authStore.isAuthenticated">
                    <NuxtLink
                      v-for="item in navItems"
                      :key="item.href"
                      :to="item.href"
                      @click="mobileMenuOpen = false"
                      class="px-3 py-2 text-center text-sm font-medium rounded-lg hover:bg-accent/50 transition-all duration-200"
                      :class="
                        $route.path === item.href
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-foreground hover:text-primary'
                      "
                    >
                      {{ item.label }}
                    </NuxtLink>
                  </template>
                  <NuxtLink
                    v-for="item in navs"
                    :key="item.href"
                    :to="item.href"
                    @click="mobileMenuOpen = false"
                    class="px-3 py-2 text-center text-sm font-medium rounded-lg hover:bg-accent/50 transition-all duration-200"
                    :class="
                      $route.path === item.href
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-foreground hover:text-primary'
                    "
                  >
                    {{ item.label }}
                  </NuxtLink>
                </div>

                <!-- Mobile User Section -->
                <div
                  v-if="authStore.isAuthenticated"
                  class="space-y-4 border-t border-border/50 pt-4"
                >
                  <div class="px-4 py-3 rounded-xl bg-accent/50">
                    <div class="flex items-center gap-3">
                      <div
                        class="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 text-primary-foreground flex items-center justify-center font-semibold"
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
                  <div class="space-y-2">
                    <!-- <a -->
                    <!--   href="#" -->
                    <!--   @click="mobileMenuOpen = false" -->
                    <!--   class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/50 transition-all duration-200" -->
                    <!-- > -->
                    <!--   <UserCircle class="h-4 w-4" /> -->
                    <!--   <span class="font-medium">Profile</span> -->
                    <!-- </a> -->
                    <!-- <a -->
                    <!--   href="#" -->
                    <!--   @click="mobileMenuOpen = false" -->
                    <!--   class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/50 transition-all duration-200" -->
                    <!-- > -->
                    <!--   <Settings class="h-4 w-4" /> -->
                    <!--   <span class="font-medium">Settings</span> -->
                    <!-- </a> -->
                    <!-- <a -->
                    <!--   href="#" -->
                    <!--   @click="mobileMenuOpen = false" -->
                    <!--   class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/50 transition-all duration-200" -->
                    <!-- > -->
                    <!--   <HelpCircle class="h-4 w-4" /> -->
                    <!--   <span class="font-medium">Support</span> -->
                    <!-- </a> -->
                    <button
                      @click="
                        logout;
                        mobileMenuOpen = false;
                      "
                      class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 text-destructive transition-all duration-200"
                    >
                      <LogOut class="h-4 w-4" />
                      <span class="font-medium">Sign out</span>
                    </button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  </nav>
</template>
