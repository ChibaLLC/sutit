<script lang="ts" setup>
  import {
    ArrowLeft,
    Search,
    FileText,
    Users,
    Phone,
    Clock,
    Wallet,
    AlertCircle,
  } from "lucide-vue-next";
  definePageMeta({
    middleware: ["auth"],
  });

  const route = useRoute();
  const router = useRouter();
  const { id, groupId } = route.params;
  const { data: group } = await useFetch(`/api/forms/${id}/group/${groupId}`);

  const searchTerm = ref("");
  const statusFilter = ref("all");
  const currentTab = ref("members");

  const statusVariant = computed(() => {
    return group.value?.data.status === "published" ? "default" : "secondary";
  });

  const members = computed(() => group.value?.data?.members || []);
  const submissions = computed(() => group.value?.data?.submissions || []);
  const memberPayments = computed(() => group.value?.data?.memberPayments || []);
  const stats = computed(() => group.value?.data?.stats || {});
  const paymentSummary = computed(() => group.value?.data?.paymentSummary || {});

  const calculatedRevenue = computed(() => {
    return memberPayments.value
      .filter((p: any) => p.status === "completed")
      .reduce((sum: number, p: any) => sum + p.amount, 0);
  });

  const filteredMembers = computed(() => {
    const query = searchTerm.value.toLowerCase().trim();
    if (!query) return members.value;
    return members.value.filter(
      (m: any) => m.email?.toLowerCase().includes(query) || m.phone?.includes(query),
    );
  });

  const filteredSubmissions = computed(() => {
    const query = searchTerm.value.toLowerCase().trim();
    let items = submissions.value;
    if (query) {
      items = items.filter((s: any) => {
        const member = members.value.find((m: any) => m.submissionId === s.id);
        return member?.email?.toLowerCase().includes(query);
      });
    }
    return items.map((s: any) => {
      const member = members.value.find((m: any) => m.submissionId === s.id);
      return { ...s, memberEmail: member?.email || "Unknown", memberPhone: member?.phone || "" };
    });
  });

  const filteredPayments = computed(() => {
    const query = searchTerm.value.toLowerCase().trim();
    const filter = statusFilter.value;
    let items = memberPayments.value;
    if (filter !== "all") {
      items = items.filter((p: any) => p.status === filter);
    }
    if (query) {
      items = items.filter(
        (p: any) => p.memberEmail?.toLowerCase().includes(query) || p.memberPhone?.includes(query),
      );
    }
    return items;
  });

  const getEmailInitials = (email: string) => {
    if (!email) return "??";
    return email.split("@")[0].substring(0, 2).toUpperCase();
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDate = (date: string | Date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const goBack = () => router.back();
</script>

<template>
  <div class="bg-background min-h-screen p-6">
    <div v-if="!group?.data" class="flex items-center justify-center py-20">
      <div class="text-center">
        <AlertCircle class="text-destructive mx-auto mb-4 h-12 w-12" />
        <h2 class="text-foreground text-xl font-semibold">Group Not Found</h2>
        <Button variant="outline" class="mt-4" @click="goBack">Go Back</Button>
      </div>
    </div>

    <div v-else class="mx-auto max-w-7xl space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <Button variant="outline" size="icon" @click="goBack">
            <ArrowLeft class="h-4 w-4" />
          </Button>
          <div>
            <h1 class="text-foreground text-2xl font-bold sm:text-3xl">
              {{ group.data.groupName }}
            </h1>
            <p class="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
              <code class="bg-muted rounded px-2 py-0.5 text-xs">{{ group.data.inviteCode }}</code>
              <span>{{ group.data.form?.title }}</span>
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Badge :variant="statusVariant" class="capitalize">{{ group.data.status }}</Badge>
        </div>
      </div>

      <!-- Overview Cards -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-muted-foreground flex items-center gap-2 text-sm font-medium">
              <Users class="h-4 w-4" />
              Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-foreground text-2xl font-bold">{{ stats.totalMembers }}</div>
            <p class="text-muted-foreground text-xs">{{ stats.invitesAccepted }} accepted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-muted-foreground flex items-center gap-2 text-sm font-medium">
              <FileText class="h-4 w-4" />
              Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-foreground text-2xl font-bold">{{ stats.formsSubmitted }}</div>
            <p class="text-muted-foreground text-xs">of {{ stats.totalMembers }} members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-muted-foreground flex items-center gap-2 text-sm font-medium">
              <Wallet class="h-4 w-4" />
              Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-foreground text-2xl font-bold">{{ memberPayments.length }}</div>
            <p class="text-muted-foreground text-xs">{{ stats.paymentsCompleted }} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-muted-foreground flex items-center gap-2 text-sm font-medium">
              <Clock class="h-4 w-4" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-foreground text-2xl font-bold">
              Ksh {{ calculatedRevenue.toLocaleString() }}
            </div>
            <p class="text-muted-foreground text-xs">
              Ksh {{ paymentSummary.pendingAmount?.toLocaleString() || 0 }} pending
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Search + Filter -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="relative max-w-md flex-1">
          <Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input v-model="searchTerm" placeholder="Search by email or phone..." class="pl-10" />
        </div>
        <Select v-if="currentTab === 'member-payments'" v-model="statusFilter">
          <SelectTrigger class="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Tabs -->
      <Tabs v-model="currentTab" class="w-full">
        <TabsList class="w-full sm:w-auto">
          <TabsTrigger value="members" class="gap-2">
            <Users class="h-4 w-4" />
            <span class="hidden sm:inline">Members</span>
          </TabsTrigger>
          <TabsTrigger value="submissions" class="gap-2">
            <FileText class="h-4 w-4" />
            <span class="hidden sm:inline">Submissions</span>
          </TabsTrigger>
          <TabsTrigger value="member-payments" class="gap-2">
            <Wallet class="h-4 w-4" />
            <span class="hidden sm:inline">Payments</span>
          </TabsTrigger>
        </TabsList>

        <!-- ============ MEMBERS TAB ============ -->
        <TabsContent value="members" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Group Members ({{ filteredMembers.length }})</CardTitle>
              <CardDescription>All current members of this group</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                v-if="filteredMembers.length === 0"
                class="text-muted-foreground py-8 text-center"
              >
                <Users class="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No members match your search</p>
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="member in filteredMembers"
                  :key="member.id"
                  class="hover:bg-muted/50 flex flex-col gap-3 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
                >
                  <div class="flex items-center gap-4">
                    <Avatar class="h-10 w-10">
                      <AvatarFallback>{{ getEmailInitials(member.email) }}</AvatarFallback>
                    </Avatar>
                    <div class="min-w-0">
                      <p class="truncate font-medium">{{ member.email || "No email" }}</p>
                      <div class="mt-1 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" class="text-xs capitalize">{{
                          member.role
                        }}</Badge>
                        <Badge
                          :variant="member.inviteAccepted ? 'default' : 'secondary'"
                          class="text-xs"
                        >
                          {{ member.inviteAccepted ? "Accepted" : "Pending" }}
                        </Badge>
                        <span class="text-muted-foreground inline-flex items-center gap-1 text-xs">
                          <Phone class="h-3 w-3" />{{ member.phone || "—" }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-wrap items-center gap-2">
                    <Badge
                      :variant="member.paymentOption === 'leader_pays' ? 'secondary' : 'outline'"
                      class="text-xs capitalize"
                    >
                      {{ member.paymentOption === "leader_pays" ? "Leader Pays" : "Self Pay" }}
                    </Badge>
                    <Badge
                      :variant="getStatusVariant(member.paymentStatus)"
                      class="text-xs capitalize"
                    >
                      {{ member.paymentStatus }}
                    </Badge>
                    <Badge v-if="member.hasSubmitted" variant="default" class="text-xs">
                      Submitted
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- ============ SUBMISSIONS TAB ============ -->
        <TabsContent value="submissions" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Submissions ({{ filteredSubmissions.length }})</CardTitle>
              <CardDescription>All form submissions from group members</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                v-if="filteredSubmissions.length === 0"
                class="text-muted-foreground py-8 text-center"
              >
                <FileText class="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No submissions yet</p>
                <p class="text-sm">Submissions will appear here once members submit the form</p>
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="submission in filteredSubmissions"
                  :key="submission.id"
                  class="hover:bg-muted/50 flex flex-col gap-3 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
                >
                  <div class="flex items-center gap-4">
                    <Avatar class="h-10 w-10">
                      <AvatarFallback>{{
                        getEmailInitials(submission.memberEmail)
                      }}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p class="font-medium">{{ submission.memberEmail }}</p>
                      <p class="text-muted-foreground text-sm">
                        Submitted {{ formatDate(submission.submittedAt) }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <Badge
                      :variant="getStatusVariant(submission.status)"
                      class="text-xs capitalize"
                    >
                      {{ submission.status }}
                    </Badge>
                    <NuxtLink :to="`/forms/${id}/submissions/${submission.id}`">
                      <Button size="sm" variant="outline">View</Button>
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- ============ MEMBER PAYMENTS TAB ============ -->
        <TabsContent value="member-payments" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Records ({{ filteredPayments.length }})</CardTitle>
              <CardDescription>Individual member payment tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                v-if="filteredPayments.length === 0"
                class="text-muted-foreground py-8 text-center"
              >
                <Wallet class="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No payment records found</p>
                <p class="text-sm">Payments will appear here once members complete payment</p>
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="mp in filteredPayments"
                  :key="mp.id"
                  class="hover:bg-muted/50 flex flex-col gap-3 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
                >
                  <div class="flex items-center gap-4">
                    <Avatar class="h-10 w-10">
                      <AvatarFallback>{{ getEmailInitials(mp.memberEmail) }}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p class="font-medium">{{ mp.memberEmail || "Unknown Member" }}</p>
                      <p class="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
                        <span>Kes {{ mp.amount?.toLocaleString() }}</span>
                        <span>•</span>
                        <span class="capitalize">{{ mp.paymentType?.replace("_", " ") }}</span>
                      </p>
                      <p class="text-muted-foreground text-xs">{{ formatDate(mp.createdAt) }}</p>
                    </div>
                  </div>
                  <div class="flex flex-wrap items-center gap-2">
                    <Badge :variant="getStatusVariant(mp.status)" class="text-xs capitalize">
                      {{ mp.status }}
                    </Badge>
                    <span v-if="mp.payment?.receiptNumber" class="text-muted-foreground text-xs">
                      {{ mp.payment.receiptNumber }}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>
