<script lang="ts" setup>
import {
  ArrowLeft,
  CreditCard,
  Search,
  FileText,
  Users,
  CheckCircle,
} from "lucide-vue-next";

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
  <div class="min-h-screen bg-background p-6">
    <div v-if="!group?.data">Not Found</div>

    <div v-else class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <Button variant="outline" size="sm" @click="handleGoBack" class="gap-2">
          <ArrowLeft class="w-4 h-4" />
          Back to Dashboard
        </Button>
        <br>
        <div class="flex-1">
          <h1 class="text-3xl font-bold text-foreground">
            {{ group.data?.groupName }}
          </h1>
          <p class="text-muted-foreground mt-1">
            Invite Code:
            <code class="bg-muted px-2 py-1 rounded">{{
              group.data.inviteCode
            }}</code>
          </p>
        </div>
        <Badge :variant="statusVariant">
          {{ group.data.status }}
        </Badge>
      </div>

      <!-- Overview Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground"
              >Total Members</CardTitle
            >
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-foreground">
              {{ group.data.currentMemberCount }}
            </div>
            <p class="text-xs text-muted-foreground">
              of {{ group.data.maxMembers }} max
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground"
              >Submissions</CardTitle
            >
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-foreground">
              {{ submissionsList.length }}
            </div>
            <p class="text-xs text-muted-foreground">form submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground"
              >Total Payments</CardTitle
            >
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-foreground">
              {{ group?.data.memberPayments.length }}
            </div>
            <p class="text-xs text-muted-foreground">payment records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground"
              >Revenue</CardTitle
            >
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-foreground">
              Ksh {{ calculatedRevenue }}
            </div>
            <p class="text-xs text-muted-foreground">total collected</p>
          </CardContent>
        </Card>
      </div>

      <!-- Search -->
      <div
        class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        <div class="flex-1 max-w-md">
          <div class="relative">
            <Search
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4"
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
              <CardDescription
                >Manage group members and their status</CardDescription
              >
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div
                  v-for="member in displayedMembers"
                  :key="member.id"
                  class="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div class="flex items-center gap-4">
                    <Avatar class="w-10 h-10">
                      <AvatarFallback>{{
                        getEmailInitials(member.inviteEmail)
                      }}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p class="font-medium">{{ member.inviteEmail }}</p>
                      <div class="flex items-center gap-2 mt-1">
                        <Badge variant="outline" class="text-xs">{{
                          member.role
                        }}</Badge>
                        <Badge
                          :variant="
                            member.isInviteAccepted ? 'default' : 'secondary'
                          "
                          class="text-xs"
                        >
                          {{ member.isInviteAccepted ? "Accepted" : "Pending" }}
                        </Badge>
                        <span class="text-xs text-muted-foreground">
                          {{ member.metadata?.paymentOption || "N/A" }}
                        </span>
                      </div>
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
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Submissions Tab -->
        <TabsContent value="submissions" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Submissions</CardTitle>
              <CardDescription
                >All form submissions from group members</CardDescription
              >
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div
                  v-for="submission in displayedSubmissions"
                  :key="submission.id"
                  class="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div class="flex items-center gap-4">
                    <Avatar class="w-10 h-10">
                      <AvatarFallback>{{
                        getEmailInitials(submission.userEmail)
                      }}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p class="font-medium">{{ submission.userEmail }}</p>
                      <p class="text-sm text-muted-foreground">
                        Submitted {{ formatDate(submission.createdAt) }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <Badge
                      :variant="
                        submission.status === 'completed'
                          ? 'default'
                          : 'secondary'
                      "
                    >
                      {{ submission.status }}
                    </Badge>
                    <Button size="sm" variant="outline">
                      View Submission
                    </Button>
                  </div>
                </div>
                <div
                  v-if="displayedSubmissions.length === 0"
                  class="text-center py-8 text-muted-foreground"
                >
                  <FileText class="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No submissions found</p>
                  <p class="text-sm">
                    Submissions will appear here once members submit the form
                  </p>
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
              <CardDescription
                >Individual member payment tracking</CardDescription
              >
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div
                  v-for="memberPayment in group?.data.memberPayments"
                  :key="memberPayment.id"
                  class="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div class="flex items-center gap-4">
                    <Avatar class="w-10 h-10">
                      <AvatarFallback>{{}}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p class="font-medium">{{ memberPayment.amount }}</p>
                      <p class="text-sm text-muted-foreground">
                        Amount: ${{ memberPayment.amount }} •
                        {{ memberPayment.paymentType }}
                      </p>
                      <p class="text-xs text-muted-foreground">
                        {{ formatDate(memberPayment.createdAt) }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <Badge
                      :variant="getStatusVariant(memberPayment.status)"
                      class="text-xs"
                    >
                      {{ memberPayment.status }}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      @click="handleVerifyMemberPayment(memberPayment)"
                      :disabled="memberPayment.status === 'completed'"
                    >
                      {{
                        memberPayment.status === "completed"
                          ? "Verified"
                          : "Verify"
                      }}
                    </Button>
                  </div>
                </div>
                <div
                  v-if="group?.data.memberPayments.length === 0"
                  class="text-center py-8 text-muted-foreground"
                >
                  <Users class="w-12 h-12 mx-auto mb-4 opacity-50" />
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
          <DialogDescription>
            Enter the transaction code to verify this payment
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="p-4 bg-muted rounded-lg">
            <p class="text-sm font-medium">Payment Details</p>
            <p class="text-sm text-muted-foreground">
              Amount: ${{ selectedPaymentForVerification?.amount }}
            </p>
            <p class="text-sm text-muted-foreground">
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
            <Button variant="outline" @click="handleCloseModal">
              Cancel
            </Button>
            <Button
              @click="handleConfirmVerification"
              :disabled="!verificationCode.trim()"
            >
              <CheckCircle class="w-4 h-4 mr-2" />
              Verify Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
