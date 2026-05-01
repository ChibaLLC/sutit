<script setup lang="ts">
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
    Clock,
    AlertCircle,
    CheckCircle,
  } from "lucide-vue-next";
  import { ref, computed } from "vue";
  import { toast } from "vue-sonner";

  import { buttonVariants } from "~/components/ui/button";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "~/components/ui/dialog";
  import { authHeaders } from "~/lib/auth-client";

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
  const members = ref([{ email: "", phone: "" }]);
  const isSubmitting = ref(false);

  // For storing created group info for retry
  const createdGroup = ref<any>(null);

  // Payment state
  const currentCheckoutId = ref<string | null>(null);
  const paymentStatus = ref<string | null>(null);
  const showRetryDialog = ref(false);
  const retryingPayment = ref(false);
  const retryPhoneNumber = ref("");

  // Payment computed
  const isCompleted = computed(() => paymentStatus.value === "completed");
  const isPending = computed(() => paymentStatus.value === "pending");
  const isFailed = computed(() => paymentStatus.value === "failed");

  // Check payment status from API
  const checkPaymentStatus = async (checkoutId: string) => {
    try {
      const res = await $fetch(`/api/payments/${checkoutId}`);
      return res;
    } catch (err) {
      console.error("Check payment error:", err);
      return null;
    }
  };

  // Refresh payment status
  const refreshPaymentStatus = async () => {
    if (!currentCheckoutId.value) return;
    const res = await checkPaymentStatus(currentCheckoutId.value);
    if (res?.success && res?.data) {
      paymentStatus.value = res.data.status;
    }
  };

  // Computed values
  const totalMembers = computed(() => members.value.length);
  const totalLeaderAmount = computed(() => {
    const basePrice = form.value?.price || 0;
    const groupPrice = form.value?.groupAmountPayable || basePrice;
    return totalMembers.value * parseInt(groupPrice.toString());
  });

  // Validation
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[A-Z]{2,}$/i.test(email);
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
    if (form.value?.groupMemberLimit && totalMembers.value >= form.value.groupMemberLimit) {
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
            navigateTo(`/auth/login?redirect=/forms/${formId}/group/invite`);
          }
        },
      });

      if (response.success && response.data) {
        createdGroup.value = response.data;

        if (totalLeaderAmount.value > 0) {
          if (response.data.payment?.checkoutId) {
            currentCheckoutId.value = response.data.payment.checkoutId;

            // Start polling for payment status
            try {
              const paymentResult = await checkPayment(response.data.payment.checkoutId, 15);
              if (paymentResult?.data?.status === "completed") {
                paymentStatus.value = "completed";
                toast.success("Payment completed!");
                await navigateTo(`/forms/${formId}/group/${response.data.group?.id}/dashboard`);
              } else {
                paymentStatus.value = paymentResult?.data?.status || "pending";
                toast.info("Payment initiated. Please complete on your phone.");
              }
            } catch (paymentError: any) {
              paymentStatus.value = "pending";
              toast.info("Payment initiated. Check your phone to complete.");
            }
          }
        } else {
          await navigateTo(`/forms/${formId}/group/${response.data.group?.id}/dashboard`);
        }
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

  const checkPayment = async (checkoutId: string, maxRetries = 10, interval = 3000) => {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        const res = await $fetch(`/api/payments/${checkoutId}`);
        if (res.success && res.data && res.data.status === "completed") {
          return res;
        }
        if (res.data?.status === "failed") {
          toast.error("Payment failed please retry again");
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

  const handleRetryPayment = async () => {
    if (!createdGroup.value?.group?.id) {
      toast.error("No group found to retry payment");
      return;
    }

    retryingPayment.value = true;

    try {
      const response = await $fetch(
        `/api/forms/${formId}/group/${createdGroup.value.group.id}/retry-payment`,
        {
          method: "POST",
          body: {
            phoneNumber: retryPhoneNumber.value || undefined,
          },
          headers: {
            ...(await authHeaders()),
          },
        },
      );

      if (response.success && response.data?.payment?.checkoutId) {
        currentCheckoutId.value = response.data.payment.checkoutId;
        showRetryDialog.value = false;

        try {
          const paymentResult = await checkPayment(response.data.payment.checkoutId, 15);
          if (paymentResult?.data?.status === "completed") {
            paymentStatus.value = "completed";
            toast.success("Payment completed!");
            await navigateTo(`/forms/${formId}/group/${createdGroup.value.group.id}/dashboard`);
          } else {
            paymentStatus.value = "pending";
            toast.success("Payment initiated. Please complete on your phone.");
          }
        } catch (paymentError: any) {
          paymentStatus.value = "pending";
          toast.info("Payment initiated. Check your phone to complete.");
        }
      }
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to retry payment");
    } finally {
      retryingPayment.value = false;
    }
  };

  const openRetryDialog = () => {
    retryPhoneNumber.value = group.value.phoneNumber;
    showRetryDialog.value = true;
  };
</script>

<template>
  <div class="bg-background min-h-screen">
    <!-- Header -->

    <div class="container mx-auto max-w-7xl px-4 py-8">
      <Card class="mb-4">
        <CardContent class="space-y-2">
          <h1 class="text-foreground text-3xl font-bold">Create Group</h1>
          <p class="text-muted-foreground mt-1">{{ form?.title }}</p>
          <div class="mb-2 flex items-center gap-4">
            <NuxtLink :class="buttonVariants({ variant: 'destructive', size: 'sm' })" to="/forms">
              <ArrowLeft class="mr-2 h-4 w-4" />
              Back
            </NuxtLink>
            <div class="bg-border h-6 w-px" />
            <div class="flex items-center gap-2">
              <Users class="text-primary h-5 w-5" />
              <span class="text-muted-foreground text-sm">Group Registration</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <div class="grid gap-8 lg:grid-cols-3">
        <!-- Main Form -->
        <div class="space-y-6 lg:col-span-2">
          <!-- Group Name -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Users class="h-5 w-5" />
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
                <p class="text-muted-foreground text-sm">
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
                <p class="text-muted-foreground text-sm">Enter the paying phone number</p>
              </div>
            </CardContent>
          </Card>

          <!-- Members -->
          <Card>
            <CardHeader>
              <div class="flex items-center justify-between">
                <CardTitle class="flex items-center gap-2">
                  <User class="h-5 w-5" />
                  Group Members ({{ totalMembers }})
                </CardTitle>
                <Button
                  @click="addMember"
                  size="sm"
                  :disabled="form?.groupMemberLimit && totalMembers >= form.groupMemberLimit"
                >
                  <Plus class="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </div>
              <p class="text-muted-foreground text-sm">
                Add the email addresses and phone numbers of people you want to invite
              </p>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div
                  v-for="(member, index) in members"
                  :key="index"
                  class="space-y-4 rounded-lg border p-4"
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
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>

                  <div class="grid gap-4 md:grid-cols-2">
                    <!-- Email -->
                    <div class="space-y-2">
                      <Label>Email Address</Label>
                      <div class="relative">
                        <Mail
                          class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                        />
                        <Input
                          v-model="member.email"
                          type="email"
                          placeholder="member@example.com"
                          class="pl-10"
                          :class="{
                            'border-red-500': member.email && !isValidEmail(member.email),
                          }"
                        />
                      </div>
                    </div>

                    <!-- Phone -->
                    <div class="space-y-2">
                      <Label>Phone Number</Label>
                      <div class="relative">
                        <Phone
                          class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                        />
                        <Input
                          v-model="member.phone"
                          type="tel"
                          placeholder="0712345678"
                          class="pl-10"
                          :class="{
                            'border-red-500': member.phone && !isValidPhone(member.phone),
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
                  :disabled="form?.groupMemberLimit && totalMembers >= form.groupMemberLimit"
                >
                  <Plus class="mr-2 h-4 w-4" />
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
                <span class="text-muted-foreground text-sm">Total Members</span>
                <span class="font-medium">{{ totalMembers }}</span>
              </div>

              <Separator />

              <div class="flex items-center justify-between text-lg font-semibold">
                <span>Total Payment</span>
                <span>Kes {{ totalLeaderAmount.toLocaleString() }}</span>
              </div>

              <div v-if="form?.groupMemberLimit" class="text-muted-foreground text-sm">
                Maximum {{ form.groupMemberLimit }} members allowed
              </div>
            </CardContent>
          </Card>

          <!-- Payment Info -->
          <Alert>
            <Info class="h-4 w-4" />
            <AlertTitle>Payment Information</AlertTitle>
            <AlertDescription class="space-y-2">
              <p>
                You will pay for all {{ totalMembers }} member{{ totalMembers > 1 ? "s" : "" }}
                upfront.
              </p>
              <p>Invites will be sent after successful payment.</p>
            </AlertDescription>
          </Alert>

          <!-- Payment Status Card -->
          <Card v-if="currentCheckoutId && !isCompleted">
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Clock class="h-5 w-5" />
                Payment Status
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="bg-muted flex items-center justify-between rounded-lg p-4">
                <div class="flex items-center gap-3">
                  <div
                    v-if="isPending"
                    class="h-3 w-3 animate-pulse rounded-full bg-yellow-500"
                  ></div>
                  <div v-else-if="isFailed" class="h-3 w-3 rounded-full bg-red-500"></div>
                  <div v-else class="h-3 w-3 rounded-full bg-gray-500"></div>
                  <span class="font-medium capitalize">{{ paymentStatus || "checking..." }}</span>
                </div>
                <Button variant="outline" size="sm" @click="refreshPaymentStatus">
                  <RefreshCw class="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>

              <p v-if="isPending" class="text-muted-foreground text-sm">
                Check your phone for the STK push message and enter your PIN to complete payment.
              </p>

              <!-- Retry Button for Failed Payments -->
              <div v-if="isFailed" class="pt-2">
                <Dialog v-model:open="showRetryDialog">
                  <DialogTrigger as-child>
                    <Button class="w-full" @click="openRetryDialog">
                      <RefreshCw class="mr-2 h-4 w-4" />
                      Retry Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Retry Payment</DialogTitle>
                      <DialogDescription>
                        Enter your phone number to receive the STK push. A new payment request will
                        be sent to your phone.
                      </DialogDescription>
                    </DialogHeader>
                    <div class="space-y-4 py-4">
                      <div class="space-y-2">
                        <Label for="retryPhone">Phone Number</Label>
                        <Input
                          id="retryPhone"
                          v-model="retryPhoneNumber"
                          placeholder="e.g. 712345678"
                          type="tel"
                        />
                        <p class="text-muted-foreground text-xs">
                          Previous: {{ group.phoneNumber }}
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" @click="showRetryDialog = false">Cancel</Button>
                      <Button :disabled="retryingPayment" @click="handleRetryPayment">
                        <RefreshCw v-if="retryingPayment" class="mr-2 h-4 w-4 animate-spin" />
                        {{ retryingPayment ? "Sending..." : "Send STK Push" }}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <!-- Submit Button -->
          <Button
            @click="handleSubmit"
            class="w-full"
            size="lg"
            :disabled="!isFormValid || isSubmitting"
            v-if="!isFailed"
          >
            <CreditCard v-if="totalLeaderAmount > 0" class="mr-2 h-4 w-4" />
            <UserCheck v-else class="mr-2 h-4 w-4" />
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
