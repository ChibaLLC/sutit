<script setup>
  import { CreditCard, Search } from "lucide-vue-next";

  import { buttonVariants } from "~/components/ui/button";

  definePageMeta({
    middleware: ["auth"],
  });

  const searchQuery = ref("");
  const statusFilter = ref("all");
  const paymentFilter = ref("all");
  const route = useRoute();
  const { id } = route.params;
  const { data: form } = await useFetch(`/api/forms/${id}/group`);

  const activeTab = ref("groups");
  const showVerifyModal = ref(false);
  const transactionCode = ref("");

  // Computed property for filtered groups
  const filteredGroups = computed(() => {
    let groups = form.value.data.groups;

    // Filter by search query
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase();
      groups = groups.filter(
        (group) =>
          group.groupName.toLowerCase().includes(query) ||
          group.inviteCode.toLowerCase().includes(query) ||
          group.members.some((member) => member.inviteEmail.toLowerCase().includes(query)),
      );
    }

    // Filter by status
    if (statusFilter.value !== "all") {
      groups = groups.filter((group) => group.status === statusFilter.value);
    }

    // Filter by payment status
    if (paymentFilter.value !== "all") {
      groups = groups.filter((group) => {
        const hasPaidMembers = group.members.some((member) => member.paymentId);
        return paymentFilter.value === "paid" ? hasPaidMembers : !hasPaidMembers;
      });
    }

    return groups;
  });

  const getInitials = (email) => {
    return email.split("@")[0].substring(0, 2).toUpperCase();
  };

  const verifyPayment = () => {
    // Implement payment verification logic here
    console.log("Verifying payment with code:", transactionCode.value);
    // You would typically make an API call here to verify the payment
    showVerifyModal.value = false;
    transactionCode.value = "";
  };
</script>
<template>
  <div class="bg-background min-h-screen p-6">
    <div class="mx-auto max-w-7xl space-y-6">
      <!-- Header -->
      <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 class="text-foreground text-3xl font-bold">
            {{ form.data.title }}
          </h1>
          <p class="text-muted-foreground mt-1">{{ form.data.description }}</p>
        </div>
        <div class="flex items-center gap-3">
          <Badge :variant="form.data.status === 'published' ? 'default' : 'secondary'">
            {{ form.data.status }}
          </Badge>
          <Button @click="showVerifyModal = true" class="gap-2">
            <CreditCard class="h-4 w-4" />
            Verify Payment
          </Button>
        </div>
      </div>

      <!-- form.data.Overview Cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-muted-foreground text-sm font-medium">form.data.Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-foreground text-2xl font-bold">${{ form.data.price }}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-muted-foreground text-sm font-medium">Total Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-foreground text-2xl font-bold">
              {{ form.data.groups?.length }}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-muted-foreground text-sm font-medium">Group Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-foreground text-2xl font-bold">
              ${{ form.data.groupAmountPayable }}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-muted-foreground text-sm font-medium">Member Limit</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-foreground text-2xl font-bold">
              {{ form.data.groupMemberLimit }}
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Search and Filter Controls -->
      <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div class="max-w-md flex-1">
          <div class="relative">
            <Search
              class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform"
            />
            <Input
              v-model="searchQuery"
              placeholder="Search groups, members, or emails..."
              class="pl-10"
            />
          </div>
        </div>
        <div class="flex gap-2">
          <Select v-model="statusFilter">
            <SelectTrigger class="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="paymentFilter">
            <SelectTrigger class="w-32">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Tabs for different views -->
      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="grid w-full grid-cols-3">
          <TabsTrigger value="groups">Groups & Members</TabsTrigger>
          <TabsTrigger value="payments">Member Payments</TabsTrigger>
          <TabsTrigger value="all-payments">All Payments</TabsTrigger>
        </TabsList>

        <!-- Groups Tab -->
        <TabsContent value="groups" class="space-y-4">
          <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <Card
              v-for="group in filteredGroups"
              :key="group.id"
              class="transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div class="flex items-start justify-between">
                  <div class="min-w-0 flex-1">
                    <CardTitle class="truncate text-lg">{{ group.groupName }}</CardTitle>
                    <p class="text-muted-foreground mt-1 text-sm">
                      Invite Code:
                      <code class="bg-muted rounded px-2 py-1 text-xs">{{ group.inviteCode }}</code>
                    </p>
                  </div>
                  <div class="ml-2 flex flex-col items-end gap-2">
                    <Badge
                      :variant="group.status === 'published' ? 'default' : 'secondary'"
                      class="text-xs"
                    >
                      {{ group.status }}
                    </Badge>
                    <div class="text-muted-foreground text-xs whitespace-nowrap">
                      {{ group.currentMemberCount }}/{{ group.maxMembers }}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted-foreground">Created:</span>
                  <span class="text-xs">{{ formatDate(group.createdAt) }}</span>
                </div>

                <!-- Members List -->
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <h4 class="text-sm font-medium">Members</h4>
                    <NuxtLink
                      :to="`/forms/${form.data.id}/group/${group.id}`"
                      :class="
                        buttonVariants({
                          size: 'sm',
                          variant: 'outline',
                          class: 'h-7 text-xs',
                        })
                      "
                    >
                      View Details
                    </NuxtLink>
                  </div>
                  <div class="max-h-32 space-y-2 overflow-y-auto">
                    <div
                      v-for="member in group.members.slice(0, 3)"
                      :key="member.id"
                      class="bg-muted/50 flex items-center justify-between rounded-lg p-2"
                    >
                      <div class="flex min-w-0 flex-1 items-center gap-2">
                        <Avatar class="h-6 w-6 flex-shrink-0">
                          <AvatarFallback class="text-xs">{{
                            getInitials(member.inviteEmail)
                          }}</AvatarFallback>
                        </Avatar>
                        <div class="min-w-0 flex-1">
                          <p class="truncate text-xs font-medium">
                            {{ member.inviteEmail }}
                          </p>
                          <p class="text-muted-foreground text-xs">
                            {{ member.role }}
                          </p>
                        </div>
                      </div>
                      <div class="ml-2 flex flex-col items-end gap-1">
                        <Badge
                          :variant="member.isInviteAccepted ? 'default' : 'outline'"
                          class="h-5 text-xs"
                        >
                          {{ member.isInviteAccepted ? "Accepted" : "Pending" }}
                        </Badge>
                        <Badge variant="secondary" class="h-5 text-xs">
                          {{ member.metadata?.paymentOption || "N/A" }}
                        </Badge>
                      </div>
                    </div>
                    <div
                      v-if="group.members.length > 3"
                      class="text-muted-foreground py-1 text-center text-xs"
                    >
                      +{{ group.members.length - 3 }} more members
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <!-- Member Payments Tab -->
        <TabsContent value="payments" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Member Payments</CardTitle>
              <CardDescription>Track individual member payment status</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div v-for="group in form.data.groups" :key="group.id">
                  <h3 class="mb-2 font-medium">{{ group.groupName }}</h3>
                  <div class="space-y-2">
                    <div
                      v-for="member in group.members"
                      :key="member.id"
                      class="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div class="flex items-center gap-3">
                        <Avatar class="h-8 w-8">
                          <AvatarFallback>{{ getInitials(member.inviteEmail) }}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p class="text-sm font-medium">
                            {{ member.inviteEmail }}
                          </p>
                          <p class="text-muted-foreground text-xs">
                            Payment Option:
                            {{ member.metadata?.paymentOption || "N/A" }}
                          </p>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <Badge
                          :variant="member.paymentId ? 'default' : 'destructive'"
                          class="text-xs"
                        >
                          {{ member.paymentId ? "Paid" : "Unpaid" }}
                        </Badge>
                        <Button size="sm" variant="outline"> View Details </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- All Payments Tab -->
        <TabsContent value="all-payments" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Transactions</CardTitle>
              <CardDescription>All payment transactions and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="text-muted-foreground py-8 text-center">
                <CreditCard class="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No payment transactions found</p>
                <p class="text-sm">Payments will appear here once members start paying</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>

    <!-- Payment Verification Modal -->
    <Dialog v-model:open="showVerifyModal">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Payment</DialogTitle>
          <DialogDescription> Enter the transaction code to verify a payment </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="transaction-code">Transaction Code</Label>
            <Input
              id="transaction-code"
              v-model="transactionCode"
              placeholder="Enter transaction code"
              class="w-full"
            />
          </div>
          <div class="flex justify-end gap-2">
            <Button variant="outline" @click="showVerifyModal = false"> Cancel </Button>
            <Button @click="verifyPayment" :disabled="!transactionCode.trim()">
              <Search class="mr-2 h-4 w-4" />
              Verify Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
