<script setup lang="ts">
import { ref, computed } from "vue";
import { toast } from "vue-sonner";
import {
  Users,
  Plus,
  Trash2,
  Mail,
  Phone,
  User,
  CreditCard,
  UserCheck,
  ArrowLeft,
  Info,
  RefreshCw,
} from "lucide-vue-next";
import { authHeaders } from "~/lib/auth-client";
import { buttonVariants } from "~/components/ui/button";

const route = useRoute();
const router = useRouter();
definePageMeta({
  middleware: ["auth"],
});

const formId = route.params.id as string;

// Fetch form data
const { data: form } = await useFetch(`/api/forms/${formId}`);

// Form state
const group = ref({
  name: "",
  phoneNumber: "",
});
const members = ref([
  { email: "", phone: "" },
]);
const isSubmitting = ref(false);
const isRetryingPayment = ref(false);

// For storing created group info for retry
const createdGroup = ref<any>(null);

// Computed values
const totalMembers = computed(() => members.value.length);
const totalLeaderAmount = computed(() => {
  const basePrice = form.value?.price || 0;
  const groupPrice = form.value?.groupAmountPayable || basePrice;
  return totalMembers.value * parseInt(groupPrice.toString());
});

// Validation
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[A-Z]{2,}$/i.test(email);
const isValidPhone = (phone: string) => /^(\+254|0)[17]\d{8}$/.test(phone);

const isFormValid = computed(() => {
  if (!group.value.name.trim()) return false;
  if (!group.value.phoneNumber.trim()) return false;

  return members.value.every((member) => {
    const hasEmail = member.email.trim() && isValidEmail(member.email);
    const hasPhone = member.phone.trim() && isValidPhone(member.phone);
    return hasEmail || hasPhone;
  });
});

// Methods
const addMember = () => {
  if (
    form.value?.groupMemberLimit &&
    totalMembers.value >= form.value.groupMemberLimit
  ) {
    toast.error(`Maximum ${form.value.groupMemberLimit} members allowed`);
    return;
  }

  members.value.push({
    email: "",
    phone: "",
  });
};

const removeMember = (index: number) => {
  if (members.value.length > 1) {
    members.value.splice(index, 1);
  }
};

const handleSubmit = async () => {
  if (!isFormValid.value) {
    toast.error("Please fill in all required fields correctly");
    return;
  }

  isSubmitting.value = true;

  try {
    const payload = {
      groupName: group.value.name.trim(),
      members: members.value.map((m) => ({
        email: m.email.trim(),
        phone: m.phone.trim(),
        paymentOption: "leader_pays",
      })),
      phoneNumber: group.value.phoneNumber,
    };

    const response = await $fetch(`/api/forms/${formId}/group`, {
      method: "POST",
      body: payload,
      headers: {
        ...(await authHeaders()),
      },
      onResponse({ response }) {
        if (response.status == 401) {
          navigateTo(
            `/auth/login?redirect=/forms/${formId}/group/invite`,
          );
        }
      },
    });

    if (response.success && response.data) {
      createdGroup.value = response.data;
      toast.success("Group created successfully!");

      if (totalLeaderAmount.value > 0) {
        if (response.data.payment?.checkoutId) {
          try {
            const paymentResult = await checkPayment(
              response.data.payment?.checkoutId,
            );
            toast.success("Payment completed!");
          } catch (paymentError) {
            toast.error(paymentError.message || "Payment failed");
          }
        }
      }
      
      await navigateTo(
        `/forms/${formId}/group/${response.data.group?.id}/dashboard`,
      );
    }
  } catch (error: any) {
    if (error.data?.message?.includes("Group Already Exists")) {
      toast.error("A group with this name already exists. Please choose a different name.");
    } else {
      toast.error(error.data?.message || "Failed to create group");
    }
  } finally {
    isSubmitting.value = false;
  }
};

const retryPayment = async () => {
  if (!createdGroup.value?.group?.id) {
    toast.error("No group found to retry payment");
    return;
  }

  isRetryingPayment.value = true;

  try {
    const response = await $fetch(`/api/forms/${formId}/group/${createdGroup.value.group.id}/retry-payment`, {
      method: "POST",
      headers: {
        ...(await authHeaders()),
      },
    });

    if (response.success && response.data?.payment?.checkoutId) {
      try {
        const paymentResult = await checkPayment(response.data.payment.checkoutId);
        toast.success("Payment completed!");
      } catch (paymentError) {
        toast.error(paymentError.message || "Payment failed. You can try again.");
      }
    }
  } catch (error: any) {
    toast.error(error.data?.message || "Failed to retry payment");
  } finally {
    isRetryingPayment.value = false;
  }
};

const checkPayment = async (
  checkoutId: string,
  maxRetries = 10,
  interval = 3000,
) => {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      const res = await $fetch(`/api/payments/${checkoutId}`);
      if (res.success && res.data && res.data.status === "completed") {
        return res;
      }
    } catch (err) {
      console.error("Check payment error:", err);
    }
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error("Payment not completed in time. Please try again later.");
};
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->

    <div class="container mx-auto px-4 py-8 max-w-7xl">
      <Card class="mb-4">
        <CardContent class="space-y-2">
          <h1 class="text-3xl font-bold text-foreground">Create Group</h1>
          <p class="text-muted-foreground mt-1">{{ form?.title }}</p>
          <div class="flex items-center gap-4 mb-2">
            <NuxtLink
              :class="buttonVariants({ variant: 'destructive', size: 'sm' })"
              to="/forms"
            >
              <ArrowLeft class="w-4 h-4 mr-2" />
              Back
            </NuxtLink>
            <div class="h-6 w-px bg-border" />
            <div class="flex items-center gap-2">
              <Users class="w-5 h-5 text-primary" />
              <span class="text-sm text-muted-foreground"
                >Group Registration</span
              >
            </div>
          </div>
        </CardContent>
      </Card>
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Main Form -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Group Name -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Users class="w-5 h-5" />
                Group Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-2">
                <Label for="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  v-model="group.name"
                  placeholder="Enter a name for your group"
                  class="text-lg"
                />
                <p class="text-sm text-muted-foreground">
                  Choose a memorable name that your group members will recognize
                </p>
              </div>
              <div class="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  id="phoneNumber"
                  v-model="group.phoneNumber"
                  placeholder="Enter phone number"
                />
                <p class="text-sm text-muted-foreground">
                  Enter the paying phone number
                </p>
              </div>
            </CardContent>
          </Card>

          <!-- Members -->
          <Card>
            <CardHeader>
              <div class="flex items-center justify-between">
                <CardTitle class="flex items-center gap-2">
                  <User class="w-5 h-5" />
                  Group Members ({{ totalMembers }})
                </CardTitle>
                <Button
                  @click="addMember"
                  size="sm"
                  :disabled="
                    form?.groupMemberLimit &&
                    totalMembers >= form.groupMemberLimit
                  "
                >
                  <Plus class="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </div>
              <p class="text-sm text-muted-foreground">
                Add the email addresses and phone numbers of people you want to
                invite
              </p>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div
                  v-for="(member, index) in members"
                  :key="index"
                  class="p-4 border rounded-lg space-y-4"
                >
                  <div class="flex items-center justify-between">
                    <h4 class="font-medium">Member {{ index + 1 }}</h4>
                    <Button
                      v-if="members.length > 1"
                      @click="removeMember(index)"
                      variant="ghost"
                      size="sm"
                      class="text-destructive hover:text-destructive"
                    >
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  </div>

                  <div class="grid md:grid-cols-2 gap-4">
                    <!-- Email -->
                    <div class="space-y-2">
                      <Label>Email Address</Label>
                      <div class="relative">
                        <Mail
                          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                        />
                        <Input
                          v-model="member.email"
                          type="email"
                          placeholder="member@example.com"
                          class="pl-10"
                          :class="{
                            'border-red-500':
                              member.email && !isValidEmail(member.email),
                          }"
                        />
                      </div>
                    </div>

                    <!-- Phone -->
                    <div class="space-y-2">
                      <Label>Phone Number</Label>
                      <div class="relative">
                        <Phone
                          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                        />
                        <Input
                          v-model="member.phone"
                          type="tel"
                          placeholder="0712345678"
                          class="pl-10"
                          :class="{
                            'border-red-500':
                              member.phone && !isValidPhone(member.phone),
                          }"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Add Member Button -->
                <Button
                  @click="addMember"
                  variant="outline"
                  class="w-full"
                  :disabled="
                    form?.groupMemberLimit &&
                    totalMembers >= form.groupMemberLimit
                  "
                >
                  <Plus class="w-4 h-4 mr-2" />
                  Add Another Member
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Summary Sidebar -->
        <div class="space-y-6">
          <!-- Group Summary -->
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Group Summary</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Total Members</span>
                <span class="font-medium">{{ totalMembers }}</span>
              </div>

              <Separator />

              <div
                class="flex items-center justify-between text-lg font-semibold"
              >
                <span>Total Payment</span>
                <span>Kes {{ totalLeaderAmount.toLocaleString() }}</span>
              </div>

              <div
                v-if="form?.groupMemberLimit"
                class="text-sm text-muted-foreground"
              >
                Maximum {{ form.groupMemberLimit }} members allowed
              </div>
            </CardContent>
          </Card>

          <!-- Payment Info -->
          <Alert>
            <Info class="w-4 h-4" />
            <AlertTitle>Payment Information</AlertTitle>
            <AlertDescription class="space-y-2">
              <p>You will pay for all {{ totalMembers }} member{{ totalMembers > 1 ? 's' : '' }} upfront.</p>
              <p>Invites will be sent after successful payment.</p>
            </AlertDescription>
          </Alert>

          <!-- Submit Button -->
          <Button
            @click="handleSubmit"
            class="w-full"
            size="lg"
            :disabled="!isFormValid || isSubmitting"
          >
            <CreditCard v-if="totalLeaderAmount > 0" class="w-4 h-4 mr-2" />
            <UserCheck v-else class="w-4 h-4 mr-2" />
            <span v-if="isSubmitting">Creating Group...</span>
            <span v-else-if="totalLeaderAmount > 0">
              Create Group & Pay Kes {{ totalLeaderAmount.toLocaleString() }}
            </span>
            <span v-else>Create Group</span>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
