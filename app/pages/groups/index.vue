<script setup lang="ts">
  import { Users, Plus, ArrowRight, Crown, Copy, ExternalLink } from "lucide-vue-next";
  import { toast } from "vue-sonner";

  import { authHeaders } from "~/lib/auth-client";

  const router = useRouter();

  const { data: groups, refresh } = await useFetch("/api/groups", {
    headers: {
      ...(await authHeaders()),
    },
  });

  const createdGroups = computed(() => groups.value?.data?.created || []);
  const joinedGroups = computed(() => groups.value?.data?.joined || []);

  const copyInviteLink = async (group: any) => {
    const link = `${window.location.origin}/forms/${group.form?.slug}/group/join?code=${group.inviteCode}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Invite link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const goToGroup = (groupId: string) => {
    router.push(`/groups/${groupId}`);
  };
</script>

<template>
  <div class="bg-background min-h-screen">
    <div class="container mx-auto max-w-6xl px-4 py-8">
      <div class="mb-8">
        <h1 class="text-foreground text-3xl font-bold">My Groups</h1>
        <p class="text-muted-foreground mt-1">Manage groups you've created or joined</p>
      </div>

      <!-- Created Groups -->
      <div class="mb-8">
        <h2 class="mb-4 flex items-center gap-2 text-xl font-semibold">
          <Crown class="h-5 w-5 text-yellow-500" />
          Groups You Created
        </h2>
        <div v-if="createdGroups.length" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card
            v-for="group in createdGroups"
            :key="group.id"
            class="hover:border-primary cursor-pointer transition-colors"
            @click="goToGroup(group.id)"
          >
            <CardHeader class="pb-2">
              <CardTitle class="text-lg">{{ group.groupName }}</CardTitle>
              <CardDescription>{{ group.form?.title }}</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-1">
                  <Users class="h-4 w-4" />
                  <span>{{ group.currentMemberCount || 0 }} members</span>
                </div>
                <Badge :variant="group.status === 'published' ? 'default' : 'secondary'">
                  {{ group.status }}
                </Badge>
              </div>
              <div class="mt-3 flex gap-2">
                <Button size="sm" variant="outline" @click.stop="copyInviteLink(group)">
                  <Copy class="mr-1 h-4 w-4" />
                  Copy Link
                </Button>
                <Button size="sm" @click.stop="goToGroup(group.id)">
                  <ExternalLink class="mr-1 h-4 w-4" />
                  Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card v-else>
          <CardContent class="py-12 text-center">
            <Users class="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p class="text-muted-foreground mb-4">You haven't created any groups yet</p>
          </CardContent>
        </Card>
      </div>

      <!-- Joined Groups -->
      <div>
        <h2 class="mb-4 flex items-center gap-2 text-xl font-semibold">
          <Users class="h-5 w-5" />
          Groups You Joined
        </h2>
        <div v-if="joinedGroups.length" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card
            v-for="group in joinedGroups"
            :key="group.id"
            class="hover:border-primary cursor-pointer transition-colors"
            @click="goToGroup(group.id)"
          >
            <CardHeader class="pb-2">
              <CardTitle class="text-lg">{{ group.groupName }}</CardTitle>
              <CardDescription>{{ group.form?.title }}</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-1">
                  <Users class="h-4 w-4" />
                  <span>{{ group.currentMemberCount || 0 }} members</span>
                </div>
                <Badge :variant="group.status === 'published' ? 'default' : 'secondary'">
                  {{ group.status }}
                </Badge>
              </div>
              <div class="mt-3">
                <Button size="sm" @click="goToGroup(group.id)">
                  <ExternalLink class="mr-1 h-4 w-4" />
                  View Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card v-else>
          <CardContent class="py-12 text-center">
            <Users class="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p class="text-muted-foreground">You haven't joined any groups yet</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

