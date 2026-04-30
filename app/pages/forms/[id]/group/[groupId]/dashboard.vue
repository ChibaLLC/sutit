<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Users,
  Mail,
  Phone,
  Check,
  Clock,
  CreditCard,
  UserCheck,
  Copy,
  Send,
  Trash2,
  MoreVertical,
  ExternalLink,
  AlertCircle,
} from "lucide-vue-next";
import { toast } from "vue-sonner";
import { authHeaders } from "~/lib/auth-client";

const route = useRoute();

// Fetch group dashboard data
const { data: dashboard, refresh } = await useFetch(
  `/api/forms/${route.params.id}/group/${route.params.groupId}`,
  {
    method: "get",
    headers: {
      ...(await authHeaders()),
    },
  },
);

// Computed properties
const isLeader = computed(() => dashboard.value?.data?.userRole === "leader");
const group = computed(() => dashboard.value?.data?.group);
const form = computed(() => dashboard.value?.data?.form);
const members = computed(() => dashboard.value?.data?.members || []);
const stats = computed(() => dashboard.value?.data?.stats);
const paymentSummary = computed(() => dashboard.value?.data?.paymentSummary);

// Progress calculations
const progressPercentage = computed(() => {
  if (!stats.value?.totalMembers) return 0;
  return Math.round((stats.value.formsSubmitted / stats.value.totalMembers) * 100);
});

const paymentProgress = computed(() => {
  if (!paymentSummary.value?.totalAmount) return 0;
  const paidAmount = paymentSummary.value.leaderPaidAmount + paymentSummary.value.membersPaidAmount;
  return Math.round((paidAmount / paymentSummary.value.totalAmount) * 100);
});

// Actions
const copyInviteLink = async () => {
  try {
    await navigator.clipboard.writeText(dashboard.value?.data?.inviteLink || "");
    toast.success("Invite link copied to clipboard");
  } catch {
    toast.error("Failed to copy link");
  }
};

const resendInvite = async (memberId: string) => {
  try {
    await $fetch(`/api/forms/${route.params.id}/group/${route.params.groupId}/resend-invite`, {
      method: "POST",
      body: { memberId },
      headers: {
        ...(await authHeaders()),
      },
    });
    toast.success("Invitation resent successfully");
  } catch (error) {
    toast.error("Failed to resend invitation");
  }
};

const removeMember = async (memberId: string) => {
  try {
    await $fetch(`/api/forms/${route.params.id}/group/${route.params.groupId}/remove-member`, {
      method: "POST",
      body: { memberId },
      headers: {
        ...(await authHeaders()),
      },
    });
    toast.success("Member removed successfully");
    refresh();
  } catch (error) {
    toast.error("Failed to remove member");
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "text-green-600 bg-green-50 border-green-200";
    case "pending":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "failed":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

const formatCurrency = (amount: number) => `Kes ${amount.toLocaleString()}`;
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>{{ form?.title }}</span>
          <span>/</span>
          <span>Group Dashboard</span>
        </div>
        <h1 class="text-3xl font-bold text-foreground">
          {{ group?.groupName }}
        </h1>
        <p class="text-muted-foreground mt-1">
          {{ isLeader ? "Manage your group registration" : "View group progress" }}
        </p>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent class="p-6">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                <Users class="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">Total Members</p>
                <p class="text-2xl font-bold">{{ stats?.totalMembers || 0 }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-green-50 dark:bg-green-950/50 rounded-lg">
                <UserCheck class="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">Forms Submitted</p>
                <p class="text-2xl font-bold">
                  {{ stats?.formsSubmitted || 0 }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-purple-50 dark:bg-purple-950/50 rounded-lg">
                <CreditCard class="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">Payments Complete</p>
                <p class="text-2xl font-bold">
                  {{ stats?.paymentsCompleted || 0 }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-orange-50 dark:bg-orange-950/50 rounded-lg">
                <Mail class="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">Invites Accepted</p>
                <p class="text-2xl font-bold">
                  {{ stats?.invitesAccepted || 0 }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Progress Bars -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle class="text-lg">Form Completion Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span
                  >{{ stats?.formsSubmitted || 0 }} of
                  {{ stats?.totalMembers || 0 }} completed</span
                >
                <span>{{ progressPercentage }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-green-500 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${progressPercentage}%` }"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-lg">Payment Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span
                  >{{
                    formatCurrency(
                      (paymentSummary?.leaderPaidAmount || 0) +
                        (paymentSummary?.membersPaidAmount || 0),
                    )
                  }}
                  of
                  {{ formatCurrency(paymentSummary?.totalAmount || 0) }}</span
                >
                <span>{{ paymentProgress }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${paymentProgress}%` }"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Invite Link (Leader Only) -->
      <Card v-if="isLeader" class="mb-8">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Send class="w-5 h-5" />
            Group Invite Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex items-center gap-2">
            <Input :modelValue="dashboard?.data?.inviteLink" readonly class="font-mono text-sm" />
            <Button @click="copyInviteLink" size="sm">
              <Copy class="w-4 h-4" />
            </Button>
          </div>
          <p class="text-sm text-muted-foreground mt-2">
            Share this link with people to invite them to your group
          </p>
        </CardContent>
      </Card>

      <!-- Members List -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Users class="w-5 h-5" />
            Group Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="member in members"
              :key="member.id"
              class="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <Users class="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p class="font-medium">
                    {{ member.user?.name || member.email }}
                  </p>
                  <div class="flex items-center gap-4 text-sm text-muted-foreground">
                    <div class="flex items-center gap-1">
                      <Mail class="w-3 h-3" />
                      {{ member.email }}
                    </div>
                    <div class="flex items-center gap-1">
                      <Phone class="w-3 h-3" />
                      {{ member.phone }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <!-- Status Badges -->
                <div class="flex flex-col gap-1">
                  <Badge
                    :class="
                      member.inviteAccepted
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    "
                    variant="secondary"
                  >
                    {{ member.inviteAccepted ? "Joined" : "Invited" }}
                  </Badge>
                  <Badge :class="getStatusColor(member.paymentStatus)" variant="secondary">
                    {{ member.paymentStatus === "completed" ? "Paid" : "Pending Payment" }}
                  </Badge>
                </div>

                <!-- Payment Option -->
                <div class="text-sm text-muted-foreground">
                  {{ member.paymentOption === "leader_pays" ? "Leader paying" : "Self paying" }}
                </div>

                <!-- Form Status -->
                <div class="flex items-center gap-1">
                  <Check v-if="member.hasSubmitted" class="w-4 h-4 text-green-600" />
                  <Clock v-else class="w-4 h-4 text-yellow-600" />
                  <span class="text-sm">
                    {{ member.hasSubmitted ? "Submitted" : "Pending" }}
                  </span>
                </div>

                <!-- Actions (Leader Only) -->
                <DropdownMenu v-if="isLeader">
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical class="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      @click="resendInvite(member.id)"
                      :disabled="member.inviteAccepted"
                    >
                      <Send class="w-4 h-4 mr-2" />
                      Resend Invite
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      @click="removeMember(member.id)"
                      class="text-red-600 hover:text-red-700"
                    >
                      <Trash2 class="w-4 h-4 mr-2" />
                      Remove Member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="!members.length" class="text-center py-12">
              <Users class="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p class="text-muted-foreground">No members in this group yet</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Payment Summary -->
      <Card class="mt-8" v-if="paymentSummary">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <CreditCard class="w-5 h-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">Total Amount</p>
              <p class="text-lg font-bold">
                {{ formatCurrency(paymentSummary.totalAmount) }}
              </p>
            </div>
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">Amount Paid</p>
              <p class="text-lg font-bold text-green-600">
                {{
                  formatCurrency(paymentSummary.leaderPaidAmount + paymentSummary.membersPaidAmount)
                }}
              </p>
            </div>
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">Pending Amount</p>
              <p class="text-lg font-bold text-yellow-600">
                {{ formatCurrency(paymentSummary.pendingAmount) }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
