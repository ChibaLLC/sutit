<script setup lang="ts">
  import {
    User,
    ArrowLeft,
    Calendar,
    Users,
    ShoppingCart,
    Clock,
    FileText,
    Ticket,
    CreditCard,
    Package,
    FileCheck,
    RotateCw,
    Play,
    Settings,
    Trash2,
    Download,
    Share2,
    Mail,
    Plus,
    Loader,
    AlertTriangle,
    Eye,
    CheckCircle,
    Truck,
    PackageCheck,
  } from "lucide-vue-next";
  import { toast } from "vue-sonner";

  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog";
  import { Button, buttonVariants } from "@/components/ui/button";
  import { formatSecondsToDetailedTime, formatCountdown } from "~/lib/utils";

  const route = useRoute();
  const formId = route.params.id as string;
  const submissionId = route.params.submissionId as string;

  const {
    data: submissionData,
    error: fetchError,
    pending,
  } = useFetch(`/api/forms/${formId}/submissions/${submissionId}`);

  const submission = computed(() => submissionData.value?.data);
  const loading = computed(() => pending.value);
  const error = computed(() => fetchError.value?.message || null);

  const countdown = ref<string>("");

  let countdownInterval: NodeJS.Timeout | null = null;

  const updateCountdown = (): void => {
    if (!submission.value?.submittedAt) return;

    const updateTimer = (): void => {
      countdown.value = formatCountdown(submission.value.submittedAt);
    };

    updateTimer();
    countdownInterval = setInterval(updateTimer, 1000);
  };

  const formattedTat = computed(() => {
    if (!submission.value?.tat) return "N/A";
    return formatSecondsToDetailedTime(submission.value.tat).formatted;
  });

  const totalAmount = computed(() => {
    if (!submission.value?.storeResponses?.length) return 0;
    return submission.value.storeResponses.reduce(
      (sum: number, item: any) => sum + (item.total || 0),
      0,
    );
  });

  const authStore = useAuthStore();
  const isFormOwner = computed(() => {
    return authStore.user?.id === submission.value?.form?.createdBy;
  });

  const stopLoading = ref(false);

  const stopCountdown = async () => {
    stopLoading.value = true;
    try {
      await $fetch(`/api/forms/${formId}/submissions/${submissionId}/stop-tat`, {
        method: "POST",
        headers: {
          ...(await (await import("~/lib/auth-client")).authHeaders()),
        },
      });
      await refreshNuxtData();
    } catch (err: any) {
      console.error("Failed to stop TAT:", err);
      const errorData = err.data;
      const errorMessage = errorData?.statusMessage || err.message || "Failed to stop TAT";

      if (err.status === 403) {
        alert(errorMessage);
      } else if (err.status === 401) {
        alert("You need to be logged in to stop TAT");
      } else {
        alert(errorMessage);
      }
    } finally {
      stopLoading.value = false;
    }
  };

  watch(submission, (newSubmission) => {
    if (newSubmission) {
      updateCountdown();
    }
  });

  const exportData = () => {
    if (!submission.value) return;

    import("jspdf").then(({ jsPDF }) => {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // White background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Header
      doc.setFillColor(241, 245, 249); // Light gray
      doc.rect(0, 0, pageWidth, 30, "F");
      doc.setTextColor(33, 37, 41); // Dark
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Sutit Forms - Submission Export", pageWidth / 2, 20, {
        align: "center",
      });

      let y = 45;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(52, 58, 64);
      doc.text("Submission Information:", 20, y);
      y += 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(33, 37, 41);
      doc.text(`Submission ID: ${submission.value.id}`, 20, y);
      doc.text(`Form Title: ${submission.value.form?.title || "N/A"}`, 20, y + 6);
      doc.text(`Submitted By: ${submission.value.submitter?.name || "N/A"}`, 20, y + 12);
      doc.text(`Status: ${submission.value.status}`, 20, y + 18);
      doc.text(
        `Submission Date: ${new Date(submission.value.submittedAt).toLocaleString()}`,
        20,
        y + 24,
      );
      if (submission.value.completedAt) {
        doc.text(
          `Completion Date: ${new Date(submission.value.completedAt).toLocaleString()}`,
          20,
          y + 30,
        );
      }
      if (submission.value.tat) {
        const tatInfo = formatSecondsToDetailedTime(submission.value.tat);
        doc.text(`Turnaround Time: ${tatInfo.label} (${submission.value.tat} seconds)`, 20, y + 36);
      }
      y += 50;

      if (submission.value.responses?.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Form Responses:", 20, y);
        y += 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        submission.value.responses.forEach((response: any) => {
          doc.text(`${response.field.label}: ${response.value}`, 20, y);
          y += 6;
          if (y > pageHeight - 40) {
            doc.addPage();
            y = 20;
          }
        });
        y += 10;
      }

      if (submission.value.storeResponses?.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Purchased Products:", 20, y);
        y += 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        submission.value.storeResponses.forEach((item: any) => {
          doc.text(
            `${item.item.name} (Quantity: ${item.quantity}) - Total: Kes ${item.total}`,
            20,
            y,
          );
          y += 6;
          if (y > pageHeight - 40) {
            doc.addPage();
            y = 20;
          }
        });
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.text(`Grand Total: Kes ${totalAmount.value}`, 20, y);
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(108, 117, 125);
      doc.text("Generated by Sutit Forms", pageWidth / 2, pageHeight - 10, {
        align: "center",
      });
      if (submission.value.storeResponses?.length > 0) {
        y += 15;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(51, 65, 85);
        doc.text("Products Purchased", 20, y);
        y += 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        submission.value.storeResponses.forEach((item: any) => {
          doc.text(`${item.item.name} (x${item.quantity})`, 20, y);
          doc.text(`Kes ${item.total}`, 150, y);
          y += 7;
          if (y > pageHeight - 30) {
            doc.addPage();
            y = 20;
          }
        });
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(51, 65, 85);
        doc.text(`Total: Kes ${totalAmount.value}`, 20, y);
      }

      // Footer
      doc.setFillColor(248, 250, 252); // Slate-50
      doc.rect(0, pageHeight - 15, pageWidth, 15, "F");
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.2);
      doc.line(0, pageHeight - 15, pageWidth, pageHeight - 15);
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139); // Slate-500
      doc.text("Generated by Sutit Forms", pageWidth / 2, pageHeight - 8, {
        align: "center",
      });

      doc.save(`submission-${submission.value.id}.pdf`);
    });
  };

  const downloadTicket = () => {
    if (!submission.value) return;

    import("jspdf").then(({ jsPDF }) => {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // White background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Header
      doc.setFillColor(241, 245, 249); // Light gray
      doc.rect(0, 0, pageWidth, 30, "F");
      doc.setTextColor(33, 37, 41); // Dark
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Sutit Forms - Digital Ticket", pageWidth / 2, 20, {
        align: "center",
      });

      let y = 45;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(52, 58, 64);
      doc.text("Ticket Information:", 20, y);
      y += 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(33, 37, 41);
      doc.text(`Ticket ID: ${submission.value.id}`, 20, y);
      doc.text(`Customer Name: ${submission.value.submitter?.name || "N/A"}`, 20, y + 6);
      doc.text(
        `Group: ${submission.value.groupMembers?.[0]?.group?.groupName || "N/A"}`,
        20,
        y + 12,
      );
      doc.text(`Status: ${submission.value.status}`, 20, y + 18);
      doc.text(
        `Issue Date: ${new Date(submission.value.submittedAt).toLocaleString()}`,
        20,
        y + 24,
      );
      y += 35;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Services Included:", 20, y);
      y += 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("• Form Submission and Payment Processing", 30, y);
      y += 6;
      doc.text("• Product Sales and Delivery", 30, y);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(108, 117, 125);
      doc.text("Generated by Sutit Forms", pageWidth / 2, pageHeight - 10, {
        align: "center",
      });

      doc.save(`ticket-${submission.value.id}.pdf`);
    });
  };

  const downloadReceipt = () => {
    if (!submission.value) return;

    import("jspdf").then(({ jsPDF }) => {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // White background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Header
      doc.setFillColor(241, 245, 249); // Light gray
      doc.rect(0, 0, pageWidth, 30, "F");
      doc.setTextColor(33, 37, 41); // Dark
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Sutit Forms - Digital Receipt", pageWidth / 2, 20, {
        align: "center",
      });

      let y = 45;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(52, 58, 64);
      doc.text("Receipt Information:", 20, y);
      y += 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(33, 37, 41);
      doc.text(`Receipt ID: ${submission.value.id}`, 20, y);
      doc.text(
        `Transaction Date: ${new Date(submission.value.submittedAt).toLocaleString()}`,
        20,
        y + 6,
      );
      doc.text(`Customer: ${submission.value.submitter?.name || "N/A"}`, 20, y + 12);
      doc.text(
        `Payment Method: ${submission.value.metadata?.paymentData?.method || "N/A"}`,
        20,
        y + 18,
      );
      if (submission.value.metadata?.paymentData?.account) {
        doc.text(`Account: ${submission.value.metadata.paymentData.account}`, 20, y + 24);
      }
      y += 35;

      if (submission.value.storeResponses?.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Purchased Items:", 20, y);
        y += 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        submission.value.storeResponses.forEach((item: any) => {
          doc.text(`${item.item.name} (Qty: ${item.quantity})`, 20, y);
          doc.text(`Kes ${item.total}`, 150, y);
          y += 6;
          if (y > pageHeight - 40) {
            doc.addPage();
            y = 20;
          }
        });
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(`Total Paid: Kes ${totalAmount.value}`, 20, y);
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(108, 117, 125);
      doc.text("Thank you for using Sutit Forms", pageWidth / 2, pageHeight - 15, {
        align: "center",
      });
      doc.text("Generated by Sutit Forms", pageWidth / 2, pageHeight - 10, {
        align: "center",
      });

      doc.save(`receipt-${submission.value.id}.pdf`);
    });
  };

  const deleteDialogOpen = ref(false);
  const deleteLoading = ref(false);

  const confirmDelete = () => {
    deleteDialogOpen.value = true;
  };

  const deleteSubmission = async () => {
    deleteLoading.value = true;
    try {
      await $fetch(`/api/forms/${formId}/submissions/${submissionId}/delete`, {
        method: "DELETE",
      });
      await navigateTo(`/forms/${formId}/submissions`);
    } catch (error: any) {
      console.error("Failed to delete submission:", error);
    } finally {
      deleteLoading.value = false;
    }
  };

  // Dispatch actions
  const dispatchLoading = ref(false);
  const deliverLoading = ref(false);
  const dispatchDialogOpen = ref(false);
  const deliverDialogOpen = ref(false);
  const dispatchForm = ref({
    dispatchedBy: "",
    dispatchDate: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const deliverDate = ref(new Date().toISOString().split("T")[0]);

  const openDispatchDialog = () => {
    dispatchForm.value = {
      dispatchedBy: "",
      dispatchDate: new Date().toISOString().split("T")[0],
      notes: "",
    };
    dispatchDialogOpen.value = true;
  };

  const submitDispatch = async () => {
    if (!dispatchForm.value.dispatchedBy || !dispatchForm.value.dispatchDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    dispatchLoading.value = true;
    try {
      await $fetch(`/api/forms/${formId}/submissions/${submissionId}/dispatch`, {
        method: "POST",
        body: dispatchForm.value,
      });
      toast.success("Dispatched successfully");
      dispatchDialogOpen.value = false;
      await refreshNuxtData();
    } catch (e: any) {
      toast.error(e.data?.message || "Failed to dispatch");
    } finally {
      dispatchLoading.value = false;
    }
  };

  const openDeliverDialog = () => {
    deliverDate.value = new Date().toISOString().split("T")[0];
    deliverDialogOpen.value = true;
  };

  const submitDeliver = async () => {
    if (!deliverDate.value) {
      toast.error("Please set a delivery date");
      return;
    }
    deliverLoading.value = true;
    try {
      await $fetch(`/api/forms/${formId}/submissions/${submissionId}/dispatch/deliver`, {
        method: "POST",
        body: { deliveryDate: deliverDate.value },
      });
      toast.success("Marked as delivered");
      deliverDialogOpen.value = false;
      await refreshNuxtData();
    } catch (e: any) {
      toast.error(e.data?.message || "Failed to mark as delivered");
    } finally {
      deliverLoading.value = false;
    }
  };

  const dispatchStatus = computed(() => {
    return submission.value?.dispatch?.status || null;
  });

  onUnmounted(() => {
    if (countdownInterval) clearInterval(countdownInterval);
  });
</script>
<template>
  <div v-if="loading" class="bg-background flex min-h-screen items-center justify-center">
    <p>Loading submission...</p>
  </div>
  <div v-else-if="error" class="bg-background flex min-h-screen items-center justify-center">
    <p class="text-red-500">{{ error }}</p>
  </div>
  <div v-else class="bg-background min-h-screen">
    <div class="mx-auto max-w-7xl p-6 lg:p-8">
      <!-- Header Section -->
      <div class="mb-8">
        <NuxtLink :to="`/forms/${formId}/submissions`" class="mb-6 gap-2" :class="buttonVariants()">
          <ArrowLeft class="h-5 w-5" />
          <span>Back to Submissions</span>
        </NuxtLink>

        <div>
          <h1 class="text-foreground font-sans text-4xl font-bold">Submission Details</h1>
          <p class="text-muted-foreground mt-2 text-sm">ID: {{ submission?.id }}</p>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Left Column - Form Response & Group Info -->
        <div class="space-y-6 lg:col-span-2">
          <!-- Form Response Card -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-3">
                <Calendar class="h-6 w-6" />
                Form Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid gap-6 sm:grid-cols-2">
                <div v-for="response in submission?.responses" :key="response.fieldId">
                  <p class="text-muted-foreground mb-1 text-sm">
                    {{ response.field.label }}
                  </p>
                  <p class="text-foreground text-base font-medium">
                    {{ response.value }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Group Information Card -->
          <Card v-if="submission?.groupMembers?.[0]?.group">
            <CardHeader>
              <CardTitle class="flex items-center gap-3">
                <Users class="h-6 w-6" />
                Group Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid gap-6 sm:grid-cols-2">
                <div>
                  <p class="text-muted-foreground mb-1 text-sm">Group Name</p>
                  <p class="text-foreground text-base font-medium">
                    {{ submission.groupMembers[0].group.groupName }}
                  </p>
                </div>
                <div>
                  <p class="text-muted-foreground mb-1 text-sm">Group Leader</p>
                  <p class="text-foreground text-base font-medium">
                    {{ submission.groupMembers[0].group.leader?.name || "N/A" }}
                  </p>
                </div>
                <div>
                  <p class="text-muted-foreground mb-1 text-sm">Your Role</p>
                  <p class="text-foreground text-base font-medium">
                    {{ submission.groupMembers[0].role }}
                  </p>
                </div>
                <div class="sm:col-span-2">
                  <p class="text-muted-foreground mb-2 text-sm">Group Size</p>
                  <div class="flex items-center gap-2">
                    <Users class="text-muted-foreground h-5 w-5" />
                    <span class="text-foreground text-base font-medium"
                      >{{ submission.groupMembers[0].group.currentMemberCount }} members</span
                    >
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Products Purchased Card -->
          <Card v-if="submission?.storeResponses?.length > 0">
            <CardHeader>
              <CardTitle class="flex items-center gap-3">
                <ShoppingCart class="h-6 w-6" />
                Products Purchased
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div
                  v-for="item in submission?.storeResponses"
                  :key="item.storeItemId"
                  class="bg-secondary/20 border-border rounded-lg border p-4"
                >
                  <div class="mb-3 flex items-start justify-between">
                    <div>
                      <p class="text-muted-foreground text-sm">
                        {{ item.item.name }}
                      </p>
                      <p class="text-foreground mt-1 text-sm">Product ID: {{ item.item.id }}</p>
                    </div>
                    <Badge class="bg-green-100 text-green-800">Delivered</Badge>
                  </div>
                  <div class="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span class="text-foreground">Quantity: </span>
                      <span class="font-semibold">{{ item.quantity }}</span>
                    </div>
                    <div>
                      <span class="text-foreground">Price: </span>
                      <span class="font-semibold">Kes {{ item.price }}</span>
                    </div>
                    <div>
                      <span class="text-foreground">Total: </span>
                      <span class="text-primary font-semibold">Kes {{ item.total }}</span>
                    </div>
                  </div>
                  <div class="text-muted-foreground mt-3 flex items-center gap-2 text-xs">
                    <Clock class="h-4 w-4" />
                    <span>Delivery Instant</span>
                  </div>
                </div>

                <!-- Total Amount -->
                <div class="border-border flex items-center justify-between border-t pt-4">
                  <span class="text-muted-foreground text-lg font-semibold">Total Amount:</span>
                  <span class="text-primary text-xl font-bold">Kes {{ totalAmount }}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Dispatch Card -->
          <Card v-if="submission?.storeResponses?.length > 0">
            <CardHeader>
              <CardTitle class="flex items-center gap-3">
                <Truck class="h-6 w-6" />
                Dispatch & Delivery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div v-if="submission?.dispatch" class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-muted-foreground text-sm">Status</span>
                  <Badge
                    :variant="dispatchStatus === 'delivered' ? 'default' : 'outline'"
                    :class="{
                      'border-blue-300 bg-blue-100 text-blue-800': dispatchStatus === 'dispatched',
                      'bg-green-100 text-green-800': dispatchStatus === 'delivered',
                    }"
                  >
                    {{ dispatchStatus === "dispatched" ? "Dispatched" : "Delivered" }}
                  </Badge>
                </div>
                <div>
                  <p class="text-muted-foreground mb-1 text-sm">Dispatched By</p>
                  <p class="text-base font-medium">{{ submission.dispatch.dispatchedBy }}</p>
                </div>
                <div>
                  <p class="text-muted-foreground mb-1 text-sm">Dispatch Date</p>
                  <p class="text-base font-medium">
                    {{ new Date(submission.dispatch.dispatchedAt).toLocaleDateString() }}
                  </p>
                </div>
                <div v-if="submission.dispatch.deliveryDate">
                  <p class="text-muted-foreground mb-1 text-sm">Delivery Date</p>
                  <p class="text-base font-medium">
                    {{ new Date(submission.dispatch.deliveryDate).toLocaleDateString() }}
                  </p>
                </div>
                <div v-if="submission.dispatch.notes">
                  <p class="text-muted-foreground mb-1 text-sm">Notes</p>
                  <p class="text-base font-medium">{{ submission.dispatch.notes }}</p>
                </div>
                <div v-if="submission.dispatch.deliveryConfirmedAt">
                  <p class="text-muted-foreground mb-1 text-sm">Receipt Confirmed</p>
                  <div class="flex items-center gap-2">
                    <CheckCircle class="h-4 w-4 text-green-600" />
                    <p class="text-base font-medium text-green-600">
                      Confirmed on
                      {{ new Date(submission.dispatch.deliveryConfirmedAt).toLocaleDateString() }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-else class="py-4 text-center">
                <Package class="text-muted-foreground mx-auto mb-2 h-10 w-10" />
                <p class="text-muted-foreground text-sm">Not yet dispatched</p>
              </div>
            </CardContent>
          </Card>

          <!-- Digital Receipt Card -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-3">
                <FileText class="h-6 w-6" />
                Digital Receipt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="bg-background border-border rounded-lg border p-6">
                <div class="mb-4">
                  <h3 class="text-muted-foreground text-lg font-semibold">Sutit-Forms Receipt</h3>
                  <p class="text-foreground text-sm">Transaction Receipt</p>
                </div>

                <div class="mb-4 grid gap-4 text-sm sm:grid-cols-2">
                  <div class="flex justify-between">
                    <span class="text-foreground">Receipt ID:</span>
                    <span class="font-medium">{{ submission?.id }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-foreground">Date:</span>
                    <span class="font-medium">{{
                      new Date(submission?.submittedAt).toLocaleString()
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-foreground">Customer:</span>
                    <span class="font-medium">{{ submission?.submitter?.name || "N/A" }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-foreground">Payment Method:</span>
                    <span class="font-medium">{{
                      submission?.metadata?.paymentData?.method || "N/A"
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-foreground">M-pesa/Bank Account:</span>
                    <span class="font-medium">{{
                      submission?.metadata?.paymentData?.account || "N/A"
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-foreground">Transaction ID:</span>
                    <span class="font-medium">{{
                      submission?.metadata?.paymentData?.transactionId || "N/A"
                    }}</span>
                  </div>
                </div>

                <Separator class="my-4" />

                <div class="mb-4" v-if="submission?.storeResponses?.length > 0">
                  <p class="text-muted-foreground mb-2 text-sm">Items:</p>
                  <div class="space-y-1">
                    <div
                      v-for="item in submission?.storeResponses"
                      :key="item.storeItemId"
                      class="flex justify-between text-sm"
                    >
                      <span class="text-foreground"
                        >{{ item.item.name }} (x{{ item.quantity }})</span
                      >
                      <span class="font-medium">Kes {{ item.total }}</span>
                    </div>
                  </div>
                </div>

                <Separator class="my-4" />

                <div class="flex justify-between">
                  <span class="text-muted-foreground text-base font-semibold">Total:</span>
                  <span class="text-primary text-lg font-bold">Kes {{ totalAmount }}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Digital Ticket Card -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-3">
                <Ticket class="h-6 w-6" />
                Digital Ticket
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div>
                  <h3 class="text-muted-foreground text-lg font-semibold">Sutit Forms Ticket</h3>
                  <p class="text-foreground text-sm">Service & Product Access</p>
                </div>

                <div class="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p class="text-foreground mb-1 text-sm">Ticket #</p>
                    <p class="text-base font-semibold">{{ submission?.id }}</p>
                  </div>
                  <div>
                    <p class="text-foreground mb-1 text-sm">Customer</p>
                    <p class="text-base font-semibold">
                      {{ submission?.submitter?.name || "N/A" }}
                    </p>
                  </div>
                  <div>
                    <p class="text-foreground mb-1 text-sm">Group</p>
                    <p class="text-base font-semibold">
                      {{ submission?.groupMembers?.[0]?.group?.groupName || "N/A" }}
                    </p>
                  </div>
                  <div>
                    <p class="text-foreground mb-1 text-sm">Issue Date</p>
                    <p class="text-base font-semibold">
                      {{ new Date(submission?.submittedAt).toLocaleString() }}
                    </p>
                  </div>
                </div>

                <div>
                  <p class="text-foreground mb-1 text-sm">Status</p>
                  <Badge variant="outline">{{ submission?.status }}</Badge>
                </div>

                <div>
                  <p class="text-foreground mb-3 text-sm">Services Included:</p>
                  <div class="space-y-2">
                    <div class="flex items-center gap-2">
                      <CreditCard class="text-muted-foreground h-5 w-5" />
                      <span class="text-foreground text-sm">Form Payment</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <Package class="text-muted-foreground h-5 w-5" />
                      <span class="text-foreground text-sm">Product Sales</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Right Column - Submission Info & Actions -->
        <div class="space-y-6">
          <!-- Submission & Payment Info Card -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-3">
                <FileCheck class="h-6 w-6" />
                Submission & Payment Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-foreground text-sm">Status</span>
                  <Badge class="bg-green-100 text-green-800">{{ submission?.status }}</Badge>
                </div>
                <div>
                  <p class="text-foreground mb-1 text-sm">Submitted</p>
                  <p class="text-base font-medium">
                    {{ new Date(submission?.submittedAt).toLocaleString() }}
                  </p>
                </div>

                <Separator />

                <div>
                  <p class="text-foreground mb-1 text-sm">Payment Method</p>
                  <p class="text-base font-medium">
                    {{ submissionData?.data?.payments?.payment ? "MPESA" : "N/A" }}
                  </p>
                </div>
                <div>
                  <p class="text-foreground mb-1 text-sm">Mobile/Bank Account</p>
                  <p class="text-base font-medium">
                    {{ submissionData?.data?.payments?.payment?.phoneNumber || "N/A" }}
                  </p>
                </div>
                <div>
                  <p class="text-foreground mb-1 text-sm">Amount</p>
                  <p class="text-primary text-lg font-bold">
                    Kes
                    {{ submissionData?.data?.payments?.payment?.amount || "N/A" }}
                  </p>
                </div>
                <div>
                  <p class="text-foreground mb-1 text-sm">Reference Number</p>
                  <p class="text-primary text-lg font-bold">
                    {{ submissionData?.data?.payments?.payment?.receiptNumber || "N/A" }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- TAT Countdown Card -->
          <Card v-if="submission?.form?.calculateTat">
            <CardHeader>
              <CardTitle class="flex items-center gap-3">
                <RotateCw class="h-6 w-6" />
                TAT Countdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div>
                  <p class="text-foreground mb-1 text-sm">Start Time</p>
                  <p class="text-base font-medium">
                    {{ new Date(submission?.submittedAt).toLocaleString() }}
                  </p>
                </div>
                <div v-if="!submission.completedAt">
                  <p class="text-foreground mb-1 text-sm">Elapsed Time</p>
                  <p class="text-base font-medium">{{ countdown || "0s" }}</p>
                </div>
                <div>
                  <p class="text-foreground mb-1 text-sm">Final TAT</p>
                  <p class="text-primary text-base font-medium">
                    {{ submission?.tat ? formattedTat : "Not stopped yet" }}
                  </p>
                </div>
                <Button
                  v-if="isFormOwner && !submission?.completedAt"
                  variant="outline"
                  class="w-full gap-2"
                  :disabled="stopLoading"
                  @click="stopCountdown"
                >
                  <Loader v-if="stopLoading" class="h-5 w-5 animate-spin" />
                  <Play v-else class="h-5 w-5" />
                  <span>Stop TAT</span>
                </Button>
                <div
                  v-else-if="submission?.completedAt"
                  class="text-muted-foreground flex items-center gap-2 text-sm"
                >
                  <CheckCircle class="h-5 w-5 text-green-600" />
                  <span>TAT completed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Actions Card -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-3">
                <Settings class="h-6 w-6" />
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-3">
                <Button
                  v-if="submission?.storeResponses?.length > 0 && !dispatchStatus"
                  variant="outline"
                  class="w-full gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                  @click="openDispatchDialog"
                >
                  <Truck class="h-5 w-5" />
                  <span>Dispatch</span>
                </Button>

                <Button
                  v-if="dispatchStatus === 'dispatched'"
                  variant="outline"
                  class="w-full gap-2 border-green-200 text-green-600 hover:bg-green-50"
                  @click="openDeliverDialog"
                >
                  <PackageCheck class="h-5 w-5" />
                  <span>Mark Delivered</span>
                </Button>

                <Button variant="outline" class="w-full gap-2" @click="downloadReceipt">
                  <Download class="h-5 w-5" />
                  <span>Download Receipt</span>
                </Button>

                <Button variant="outline" class="w-full gap-2" @click="downloadTicket">
                  <Ticket class="h-5 w-5" />
                  <span>Download Ticket</span>
                </Button>

                <Button variant="outline" class="w-full gap-2" @click="exportData">
                  <Share2 class="h-5 w-5" />
                  <span>Export Data</span>
                </Button>

                <Button class="w-full gap-2">
                  <Mail class="h-5 w-5" />
                  <span>Send Email</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- Bottom Action Buttons -->
      <div class="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
        <NuxtLink
          :to="`/forms/${formId}/submissions`"
          class="gap-2"
          :class="buttonVariants({ variant: 'outline', size: 'lg' })"
        >
          <ArrowLeft class="h-5 w-5" />
          Back to Submissions
        </NuxtLink>
        <NuxtLink to="/forms/new" class="gap-2" :class="buttonVariants({ size: 'lg' })" as-child>
          <Plus class="h-5 w-5" />
          Create Other Forms
        </NuxtLink>
      </div>

      <!-- Delete Confirmation Dialog -->
      <AlertDialog v-model:open="deleteDialogOpen">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete the submission. You can restore it later from the deleted
              submissions tab.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              @click="deleteSubmission"
              :disabled="deleteLoading"
              class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Loader v-if="deleteLoading" class="mr-2 h-4 w-4" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <!-- Dispatch Dialog -->
      <AlertDialog v-model:open="dispatchDialogOpen">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle class="flex items-center gap-2">
              <Truck class="h-5 w-5" />
              Dispatch Submission
            </AlertDialogTitle>
            <AlertDialogDescription>
              Set the dispatch details. The user will be notified by email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div class="space-y-4 py-4">
            <div class="space-y-2">
              <Label>Dispatched By</Label>
              <Input v-model="dispatchForm.dispatchedBy" placeholder="Name of person dispatching" />
            </div>
            <div class="space-y-2">
              <Label>Dispatch Date</Label>
              <Input v-model="dispatchForm.dispatchDate" type="date" />
            </div>
            <div class="space-y-2">
              <Label>Notes (optional)</Label>
              <Input v-model="dispatchForm.notes" placeholder="Any notes" />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction @click="submitDispatch" :disabled="dispatchLoading">
              <Loader v-if="dispatchLoading" class="mr-2 h-4 w-4 animate-spin" />
              Dispatch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <!-- Deliver Dialog -->
      <AlertDialog v-model:open="deliverDialogOpen">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle class="flex items-center gap-2">
              <PackageCheck class="h-5 w-5" />
              Mark as Delivered
            </AlertDialogTitle>
            <AlertDialogDescription>
              Set the delivery date. The user will be notified by email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div class="space-y-4 py-4">
            <div class="space-y-2">
              <Label>Delivery Date</Label>
              <Input v-model="deliverDate" type="date" />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction @click="submitDeliver" :disabled="deliverLoading">
              <Loader v-if="deliverLoading" class="mr-2 h-4 w-4 animate-spin" />
              Mark Delivered
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>
</template>
