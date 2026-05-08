<script setup lang="ts">
  import {
    Users,
    User,
    Crown,
    Loader2,
    CheckCircle,
    ArrowRight,
    AlertCircle,
  } from "lucide-vue-next";
  import { toast } from "vue-sonner";

  import { useAuthStore } from "~/stores/auth";

  const route = useRoute();
  const router = useRouter();

  const authStore = useAuthStore();
  const code = route.query.code as string;
  const token = route.query.token as string;

  if (!code) {
    throw createError({ statusCode: 400, message: "Invite code is required" });
  }

  const { data: groupData, pending: loading } = useFetch(`/api/groups/lookup?code=${code}`);

  const group = computed(() => groupData.value?.data);
  const form = computed(() => group.value?.form);
  const member = computed(() => {
    if (!token || !group.value?.members) return null;
    return group.value.members.find((m: any) => m.inviteToken === token);
  });

  const isLoggedIn = computed(() => !!authStore.user);
  const alreadyAccepted = computed(() => member.value?.isInviteAccepted);

  const joinEmail = ref(member.value?.inviteEmail || authStore.user?.email || "");
  const joinPhone = ref(member.value?.invitePhone || "");
  const accepting = ref(false);
  const accepted = ref(false);
  const formLink = ref("");

  const handleAccept = async () => {
    if (!token && !code) {
      toast.error("Invalid invite link");
      return;
    }

    if (!isLoggedIn.value || !token) {
      if (!joinEmail.value || !joinPhone.value) {
        toast.error("Please provide your email and phone number");
        return;
      }
    }

    accepting.value = true;
    try {
      const res = await $fetch("/api/groups/accept", {
        method: "POST",
        body: {
          code,
          token,
          email: joinEmail.value || undefined,
          phone: joinPhone.value || undefined,
        },
      });
      accepted.value = true;
      formLink.value = res.data.formLink;
      toast.success("Joined successfully!");
      if (token) {
        setTimeout(() => {
          router.push(`/forms/${form.value?.slug}?token=${token}`);
        }, 2000);
      }
    } catch (e: any) {
      toast.error(e.data?.message || "Failed to join group");
    } finally {
      accepting.value = false;
    }
  };

  const goToForm = () => {
    if (token) {
      router.push(`/forms/${form.value?.slug}?token=${token}`);
    } else {
      router.push(`/forms/${form.value?.slug}`);
    }
  };
</script>

<template>
  <div class="bg-background min-h-screen">
    <div class="container mx-auto max-w-3xl px-4 py-12">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <Loader2 class="text-primary h-8 w-8 animate-spin" />
      </div>

      <!-- Group Invite Card -->
      <template v-else-if="group">
        <div class="space-y-8">
          <!-- Header -->
          <div class="text-center">
            <div
              class="bg-primary/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
            >
              <Users class="text-primary h-10 w-10" />
            </div>
            <h1 class="text-foreground mb-2 text-4xl font-bold">Group Invitation</h1>
            <p class="text-muted-foreground text-lg">You've been invited to join a group</p>
          </div>

          <!-- Group Details Card -->
          <div class="border-border/50 bg-card/50 rounded-xl border backdrop-blur-sm">
            <div class="space-y-6 p-8">
              <!-- Group Name -->
              <div class="text-center">
                <h2 class="text-foreground text-3xl font-bold">{{ group.groupName }}</h2>
                <p class="text-muted-foreground mt-1 text-lg">{{ form?.title }}</p>
              </div>

              <Separator />

              <!-- Group Info -->
              <div class="grid grid-cols-2 gap-6">
                <div class="space-y-2">
                  <p class="text-muted-foreground text-sm">Group Leader</p>
                  <div class="flex items-center gap-2">
                    <Crown class="h-5 w-5 text-yellow-500" />
                    <span class="text-foreground font-medium">{{
                      group.leader?.name || "N/A"
                    }}</span>
                  </div>
                </div>
                <div class="space-y-2">
                  <p class="text-muted-foreground text-sm">Members</p>
                  <div class="flex items-center gap-2">
                    <Users class="text-primary h-5 w-5" />
                    <span class="text-foreground font-medium">
                      {{ group.currentMemberCount || 0 }}
                    </span>
                  </div>
                </div>
                <div class="space-y-2">
                  <p class="text-muted-foreground text-sm">Status</p>
                  <Badge :variant="group.status === 'published' ? 'default' : 'secondary'">
                    {{ group.status }}
                  </Badge>
                </div>
                <div v-if="form?.price" class="space-y-2">
                  <p class="text-muted-foreground text-sm">Price</p>
                  <p class="text-foreground font-medium">
                    Kes {{ parseInt(form.price).toLocaleString() }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Card -->
          <div class="border-border/50 bg-card/50 rounded-xl border backdrop-blur-sm" v-if="member">
            <div class="p-8 text-center">
              <!-- Success state after acceptance -->
              <template v-if="accepted">
                <div class="space-y-4">
                  <div
                    class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20"
                  >
                    <CheckCircle class="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 class="text-foreground text-xl font-semibold">
                      {{ token ? "Invite Accepted!" : "Joined Successfully!" }}
                    </h3>
                    <p class="text-muted-foreground mt-1">
                      {{
                        token
                          ? "Redirecting you to the form..."
                          : "Check your email for the form link."
                      }}
                    </p>
                    <p v-if="formLink" class="text-muted-foreground mt-3 text-sm break-all">
                      Or
                      <NuxtLink
                        :to="formLink"
                        class="text-primary font-medium underline underline-offset-2"
                      >
                        go to form now
                      </NuxtLink>
                    </p>
                  </div>
                </div>
              </template>

              <!-- Already accepted -->
              <template v-else-if="alreadyAccepted">
                <div class="space-y-4">
                  <div
                    class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20"
                  >
                    <CheckCircle class="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 class="text-foreground text-xl font-semibold">Already Accepted</h3>
                    <p class="text-muted-foreground mt-1">
                      You have already accepted this invitation.
                    </p>
                  </div>
                  <Button @click="goToForm" size="lg" class="mt-4">
                    Go to Form
                    <ArrowRight class="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </template>

              <!-- Accept button for logged-in users -->
              <template v-else-if="isLoggedIn">
                <div class="space-y-4">
                  <div
                    class="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full"
                  >
                    <User class="text-primary h-8 w-8" />
                  </div>
                  <div>
                    <h3 class="text-foreground text-xl font-semibold">Accept Invitation</h3>
                    <p class="text-muted-foreground mt-1">
                      You're logged in as <strong>{{ authStore.user?.email }}</strong>
                    </p>
                  </div>
                  <Button
                    @click="handleAccept"
                    size="lg"
                    class="mt-4 min-w-[200px]"
                    :disabled="accepting"
                  >
                    <Loader2 v-if="accepting" class="mr-2 h-4 w-4 animate-spin" />
                    <CheckCircle v-else class="mr-2 h-4 w-4" />
                    {{ accepting ? "Accepting..." : "Accept & Continue" }}
                  </Button>
                </div>
              </template>

              <!-- Email/phone form for non-logged-in token users -->
              <template v-else>
                <div class="space-y-4">
                  <div
                    class="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full"
                  >
                    <User class="text-primary h-8 w-8" />
                  </div>
                  <div>
                    <h3 class="text-foreground text-xl font-semibold">Accept Invitation</h3>
                    <p class="text-muted-foreground mt-1">Enter your contact details to accept.</p>
                  </div>
                  <div class="mx-auto max-w-sm space-y-3">
                    <Input v-model="joinEmail" placeholder="Email address" type="email" />
                    <Input
                      v-model="joinPhone"
                      placeholder="Phone number (e.g. 712345678)"
                      type="tel"
                    />
                  </div>
                  <Button
                    @click="handleAccept"
                    size="lg"
                    class="mt-4 min-w-[200px]"
                    :disabled="accepting"
                  >
                    <Loader2 v-if="accepting" class="mr-2 h-4 w-4 animate-spin" />
                    <CheckCircle v-else class="mr-2 h-4 w-4" />
                    {{ accepting ? "Accepting..." : "Accept & Continue" }}
                  </Button>
                </div>
              </template>
            </div>
          </div>

          <!-- No token - self-join form -->
          <div v-else class="border-border/50 bg-card/50 rounded-xl border backdrop-blur-sm">
            <div class="p-8 text-center">
              <div class="space-y-4">
                <div
                  class="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full"
                >
                  <Users class="text-primary h-8 w-8" />
                </div>
                <div>
                  <h3 class="text-foreground text-xl font-semibold">Join This Group</h3>
                  <p class="text-muted-foreground mt-1">Enter your details to join this group.</p>
                </div>
                <div class="mx-auto max-w-sm space-y-3">
                  <Input v-model="joinEmail" placeholder="Email address" type="email" />
                  <Input
                    v-model="joinPhone"
                    placeholder="Phone number (e.g. 712345678)"
                    type="tel"
                  />
                </div>
                <Button
                  @click="handleAccept"
                  size="lg"
                  class="mt-4 min-w-[200px]"
                  :disabled="accepting"
                >
                  <Loader2 v-if="accepting" class="mr-2 h-4 w-4 animate-spin" />
                  <CheckCircle v-else class="mr-2 h-4 w-4" />
                  {{ accepting ? "Joining..." : "Join Group" }}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Error State -->
      <div v-else class="flex items-center justify-center py-20">
        <div class="text-center">
          <AlertCircle class="text-destructive mx-auto mb-4 h-16 w-16" />
          <h2 class="text-foreground mb-2 text-2xl font-bold">Group Not Found</h2>
          <p class="text-muted-foreground mb-6">
            This invite link is invalid or the group no longer exists.
          </p>
          <Button @click="router.push('/')" variant="outline"> Go Home </Button>
        </div>
      </div>
    </div>
  </div>
</template>
