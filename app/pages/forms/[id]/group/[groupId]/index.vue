<script lang="ts" setup>
  import { ArrowLeft, CreditCard, Search, FileText, Users, CheckCircle } from "lucide-vue-next";
  definePageMeta({
    middleware: ["auth"],
  });

  const route = useRoute();
  const { id, groupId } = route.params;
  const { data: group } = await useFetch(`/api/forms/${id}/group/${groupId}`);

  const searchTerm = ref("");
  const statusFilter = ref("all");
  const currentTab = ref("members");
  const isVerifyModalOpen = ref(false);
  const verificationCode = ref("");
  const selectedPaymentForVerification = ref(null);

  const submissionsList = ref([
    {
      id: "sub_1",
      userEmail: "kemboielvis22@gmail.com",
      status: "completed",
      createdAt: "2025-09-10T01:14:02.969Z",
    },
  ]);

  const paymentsList = ref([
    {
      id: "pay_1",
      amount: 1234,
      phoneNumber: "+254712345678",
      referenceCode: "REF123456",
      status: "completed",
      createdAt: "2025-09-10T01:14:02.969Z",
    },
    {
      id: "pay_2",
      amount: 21,
      phoneNumber: "+254787654321",
      referenceCode: "REF789012",
      status: "pending",
      createdAt: "2025-09-10T02:14:02.969Z",
    },
  ]);

  const statusVariant = computed(() => {
    return group.value?.data.status === "published" ? "default" : "secondary";
  });

  const calculatedRevenue = computed(() => {
    return paymentsList.value
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);
  });

  const displayedMembers = computed(() => {
    if (!searchTerm.value.trim()) return group.value?.data?.members;

    const query = searchTerm.value.toLowerCase();
    return group.value?.data?.members.filter((member) =>
      member.inviteEmail?.toLowerCase().includes(query),
    );
  });

  const displayedSubmissions = computed(() => {
    if (!searchTerm.value.trim()) return submissionsList.value;

    const query = searchTerm.value.toLowerCase();
    return submissionsList.value.filter((submission) =>
      submission.userEmail.toLowerCase().includes(query),
    );
  });

  const getEmailInitials = (email) => {
    return email.split("@")[0].substring(0, 2).toUpperCase();
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleGoBack = () => {
    navigateTo("/form-dashboard");
  };

  const handleVerifyPayment = (payment) => {
    selectedPaymentForVerification.value = payment;
    isVerifyModalOpen.value = true;
  };

  const handleVerifyMemberPayment = (memberPayment) => {
    selectedPaymentForVerification.value = memberPayment;
    isVerifyModalOpen.value = true;
  };

  const handleCloseModal = () => {
    isVerifyModalOpen.value = false;
    verificationCode.value = "";
    selectedPaymentForVerification.value = null;
  };

  const handleConfirmVerification = () => {
    console.log("Verifying payment with code:", verificationCode.value);
    if (selectedPaymentForVerification.value) {
      selectedPaymentForVerification.value.status = "completed";
    }
    handleCloseModal();
  };
</script>
<template>
  <div class="bg-background min-h-screen p-6">
    <div v-if="!group?.data">Not Found</div>

    <div v-else class="mx-auto max-w-7xl space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <Button variant="outline" size="sm" @click="handleGoBack" class="gap-2">
          <ArrowLeft class="h-4 w-4" />
          Back to Dashboard
        </Button>
        <br />
        <div class="flex-1">
          <h1 class="text-foreground text-3xl font-bold">
            {{ group.data?.groupName }}
          </h1>
          <p class="text-muted-foreground mt-1">
            Invite Code:
            <code class="bg-muted rounded px-2 py-1">{{ group.data.inviteCode }}</code>
          </p>
        </div>
        <Badge :variant="statusVariant">
          {{ group.data.status }}
        </Badge>
      </div>

      <!-- Overview Cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-muted-foreground text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-foreground text-2xl font-bold">
              {{ group.data.currentMemberCount }}
            </div>
            <p class="text-muted-foreground text-xs">of {{ group.data.maxMembers }} max</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-muted-foreground text-sm font-medium">Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-foreground text-2xl font-bold">
              {{ submissionsList.length }}
            </div>
            <p class="text-muted-foreground text-xs">form submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-muted-foreground text-sm font-medium">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-foreground text-2xl font-bold">
              {{ group?.data.memberPayments.length }}
            </div>
            <p class="text-muted-foreground text-xs">payment records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-muted-foreground text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-foreground text-2xl font-bold">Ksh {{ calculatedRevenue }}</div>
            <p class="text-muted-foreground text-xs">total collected</p>
          </CardContent>
        </Card>
      </div>

      <!-- Search -->
      <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div class="max-w-md flex-1">
          <div class="relative">
            <Search
              class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform"
            />
            <Input
              v-model="searchTerm"
              placeholder="Search members, payments, or submissions..."
              class="pl-10"
            />
          </div>
        </div>
        <div class="flex gap-2">
          <Select v-model="statusFilter">
            <SelectTrigger class="w-32">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Tabs -->
      <Tabs v-model="currentTab" class="w-full">
        <TabsList class="grid w-full grid-cols-4">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="member-payments">Member Payments</TabsTrigger>
        </TabsList>

        <!-- Members Tab -->
        <TabsContent value="members" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Group Members</CardTitle>
              <CardDescription>Manage group members and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div
                  v-for="member in displayedMembers"
                  :key="member.id"
                  class="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                >
                  <div class="flex items-center gap-4">
                    <Avatar class="h-10 w-10">
                      <AvatarFallback>{{ getEmailInitials(member.inviteEmail) }}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p class="font-medium">{{ member.inviteEmail }}</p>
                      <div class="mt-1 flex items-center gap-2">
                        <Badge variant="outline" class="text-xs">{{ member.role }}</Badge>
                        <Badge
                          :variant="member.isInviteAccepted ? 'default' : 'secondary'"
                          class="text-xs"
                        >
                          {{ member.isInviteAccepted ? "Accepted" : "Pending" }}
                        </Badge>
                        <span class="text-muted-foreground text-xs">
                          {{ member.metadata?.paymentOption || "N/A" }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <Badge :variant="member.paymentId ? 'default' : 'destructive'" class="text-xs">
                      {{ member.paymentId ? "Paid" : "Unpaid" }}
                    </Badge>
                    <Button size="sm" variant="outline"> View Details </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Submissions Tab -->
        <TabsContent value="submissions" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Submissions</CardTitle>
              <CardDescription>All form submissions from group members</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div
                  v-for="submission in displayedSubmissions"
                  :key="submission.id"
                  class="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                >
                  <div class="flex items-center gap-4">
                    <Avatar class="h-10 w-10">
                      <AvatarFallback>{{ getEmailInitials(submission.userEmail) }}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p class="font-medium">{{ submission.userEmail }}</p>
                      <p class="text-muted-foreground text-sm">
                        Submitted {{ formatDate(submission.createdAt) }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <Badge :variant="submission.status === 'completed' ? 'default' : 'secondary'">
                      {{ submission.status }}
                    </Badge>
                    <Button size="sm" variant="outline"> View Submission </Button>
                  </div>
                </div>
                <div
                  v-if="displayedSubmissions.length === 0"
                  class="text-muted-foreground py-8 text-center"
                >
                  <FileText class="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>No submissions found</p>
                  <p class="text-sm">Submissions will appear here once members submit the form</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Member Payments Tab -->
        <TabsContent value="member-payments" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Member Payment Records</CardTitle>
              <CardDescription>Individual member payment tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div
                  v-for="memberPayment in group?.data.memberPayments"
                  :key="memberPayment.id"
                  class="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                >
                  <div class="flex items-center gap-4">
                    <Avatar class="h-10 w-10">
                      <AvatarFallback>{{}}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p class="font-medium">{{ memberPayment.amount }}</p>
                      <p class="text-muted-foreground text-sm">
                        Amount: ${{ memberPayment.amount }} •
                        {{ memberPayment.paymentType }}
                      </p>
                      <p class="text-muted-foreground text-xs">
                        {{ formatDate(memberPayment.createdAt) }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <Badge :variant="getStatusVariant(memberPayment.status)" class="text-xs">
                      {{ memberPayment.status }}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      @click="handleVerifyMemberPayment(memberPayment)"
                      :disabled="memberPayment.status === 'completed'"
                    >
                      {{ memberPayment.status === "completed" ? "Verified" : "Verify" }}
                    </Button>
                  </div>
                </div>
                <div
                  v-if="group?.data.memberPayments.length === 0"
                  class="text-muted-foreground py-8 text-center"
                >
                  <Users class="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>No member payments found</p>
                  <p class="text-sm">Member payment records will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>

    <!-- Verification Modal -->
    <Dialog v-model:open="isVerifyModalOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Payment</DialogTitle>
          <DialogDescription> Enter the transaction code to verify this payment </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="bg-muted rounded-lg p-4">
            <p class="text-sm font-medium">Payment Details</p>
            <p class="text-muted-foreground text-sm">
              Amount: ${{ selectedPaymentForVerification?.amount }}
            </p>
            <p class="text-muted-foreground text-sm">
              Phone: {{ selectedPaymentForVerification?.phoneNumber }}
            </p>
          </div>
          <div class="space-y-2">
            <Label for="transaction-code">Transaction Code</Label>
            <Input
              id="transaction-code"
              v-model="verificationCode"
              placeholder="Enter transaction code"
              class="w-full"
            />
          </div>
          <div class="flex justify-end gap-2">
            <Button variant="outline" @click="handleCloseModal"> Cancel </Button>
            <Button @click="handleConfirmVerification" :disabled="!verificationCode.trim()">
              <CheckCircle class="mr-2 h-4 w-4" />
              Verify Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
