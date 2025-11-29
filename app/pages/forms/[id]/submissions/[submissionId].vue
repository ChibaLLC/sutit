<script setup lang="ts">
import { Button, buttonVariants } from "@/components/ui/button";
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
} from "lucide-vue-next";

const route = useRoute();
const formId = route.params.id as string;
const submissionId = route.params.submissionId as string; // Note: both params are 'id', adjust if needed

const {
  data: submissionData,
  error: fetchError,
  pending,
} = useFetch(`/api/forms/${formId}/submissions/${submissionId}`);

const submission = computed(() => submissionData.value?.data);
const loading = computed(() => pending.value);
const error = computed(() => fetchError.value?.message || null);

const countdown = ref<string>("00:00:00");

let countdownInterval: NodeJS.Timeout | null = null;

const updateCountdown = (): void => {
  if (!submission.value?.submittedAt) return;

  const startTime = new Date(submission.value.submittedAt);

  const updateTimer = (): void => {
    const current = new Date();
    const diff = current.getTime() - startTime.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    countdown.value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  updateTimer();
  countdownInterval = setInterval(updateTimer, 1000);
};

const stopCountdown = async () => {
  try {
    await $fetch(`/api/forms/${formId}/submissions/${submissionId}/stop-tat`, {
      method: "POST",
    });
    // Refresh data
    await refreshNuxtData();
  } catch (err: any) {
    console.error("Failed to stop TAT:", err);
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
    doc.text(
      `Submitted By: ${submission.value.submitter?.name || "N/A"}`,
      20,
      y + 12,
    );
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
      doc.text(`Turnaround Time: ${submission.value.tat} seconds`, 20, y + 36);
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
    doc.text(
      `Customer Name: ${submission.value.submitter?.name || "N/A"}`,
      20,
      y + 6,
    );
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
    doc.text(
      `Customer: ${submission.value.submitter?.name || "N/A"}`,
      20,
      y + 12,
    );
    doc.text(
      `Payment Method: ${submission.value.metadata?.paymentData?.method || "N/A"}`,
      20,
      y + 18,
    );
    if (submission.value.metadata?.paymentData?.account) {
      doc.text(
        `Account: ${submission.value.metadata.paymentData.account}`,
        20,
        y + 24,
      );
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
    doc.text(
      "Thank you for using Sutit Forms",
      pageWidth / 2,
      pageHeight - 15,
      { align: "center" },
    );
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

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval);
});
</script>
<template>
  <div
    v-if="loading"
    class="min-h-screen bg-background flex items-center justify-center"
  >
    <p>Loading submission...</p>
  </div>
  <div
    v-else-if="error"
    class="min-h-screen bg-background flex items-center justify-center"
  >
    <p class="text-red-500">{{ error }}</p>
  </div>
  <div v-else class="min-h-screen bg-background">
    <div class="p-6 lg:p-8 max-w-7xl mx-auto">
      <!-- Header Section -->
      <div class="mb-8">
        <NuxtLink
          :to="`/forms/${formId}/submissions`"
          class="mb-6 gap-2"
          :class="buttonVariants()"
        >
          <ArrowLeft class="w-5 h-5" />
          <span>Back to Submissions</span>
        </NuxtLink>

        <div>
          <h1 class="text-4xl font-bold text-foreground font-sans">
            Submission Details
          </h1>
          <p class="text-sm text-muted-foreground mt-2">
            ID: {{ submission?.id }}
          </p>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid lg:grid-cols-3 gap-6">
        <!-- Left Column - Form Response & Group Info -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Form Response Card -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-3">
                <Calendar class="w-6 h-6" />
                Form Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid sm:grid-cols-2 gap-6">
                <div
                  v-for="response in submission?.responses"
                  :key="response.fieldId"
                >
                  <p class="text-sm text-muted-foreground mb-1">
                    {{ response.field.label }}
                  </p>
                  <p class="text-base font-medium text-foreground">
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
                <Users class="w-6 h-6" />
                Group Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid sm:grid-cols-2 gap-6">
                <div>
                  <p class="text-sm text-muted-foreground mb-1">Group Name</p>
                  <p class="text-base font-medium text-foreground">
                    {{ submission.groupMembers[0].group.groupName }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground mb-1">Group Leader</p>
                  <p class="text-base font-medium text-foreground">
                    {{ submission.groupMembers[0].group.leader?.name || "N/A" }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground mb-1">Your Role</p>
                  <p class="text-base font-medium text-foreground">
                    {{ submission.groupMembers[0].role }}
                  </p>
                </div>
                <div class="sm:col-span-2">
                  <p class="text-sm text-muted-foreground mb-2">Group Size</p>
                  <div class="flex items-center gap-2">
                    <Users class="w-5 h-5 text-muted-foreground" />
                    <span class="text-base font-medium text-foreground"
                      >{{
                        submission.groupMembers[0].group.currentMemberCount
                      }}
                      members</span
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
                <ShoppingCart class="w-6 h-6" />
                Products Purchased
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div
                  v-for="item in submission?.storeResponses"
                  :key="item.storeItemId"
                  class="p-4 bg-secondary/20 border border-border rounded-lg"
                >
                  <div class="flex items-start justify-between mb-3">
                    <div>
                      <p class="text-sm text-muted-foreground">
                        {{ item.item.name }}
                      </p>
                      <p class="text-sm text-foreground mt-1">
                        Product ID: {{ item.item.id }}
                      </p>
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
                      <span class="font-semibold text-primary"
                        >Kes {{ item.total }}</span
                      >
                    </div>
                  </div>
                  <div
                    class="flex items-center gap-2 mt-3 text-xs text-muted-foreground"
                  >
                    <Clock class="w-4 h-4" />
                    <span>Delivery Instant</span>
                  </div>
                </div>

                <!-- Total Amount -->
                <div
                  class="pt-4 border-t border-border flex justify-between items-center"
                >
                  <span class="text-lg font-semibold text-muted-foreground"
                    >Total Amount:</span
                  >
                  <span class="text-xl font-bold text-primary"
                    >Kes {{ totalAmount }}</span
                  >
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Digital Receipt Card -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-3">
                <FileText class="w-6 h-6" />
                Digital Receipt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="bg-background border border-border rounded-lg p-6">
                <div class="mb-4">
                  <h3 class="text-lg font-semibold text-muted-foreground">
                    Sutit-Forms Receipt
                  </h3>
                  <p class="text-sm text-foreground">Transaction Receipt</p>
                </div>

                <div class="grid sm:grid-cols-2 gap-4 text-sm mb-4">
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
                    <span class="font-medium">{{
                      submission?.submitter?.name || "N/A"
                    }}</span>
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
                  <p class="text-sm text-muted-foreground mb-2">Items:</p>
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
                  <span class="text-base font-semibold text-muted-foreground"
                    >Total:</span
                  >
                  <span class="text-lg font-bold text-primary"
                    >Kes {{ totalAmount }}</span
                  >
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Digital Ticket Card -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-3">
                <Ticket class="w-6 h-6" />
                Digital Ticket
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div>
                  <h3 class="text-lg font-semibold text-muted-foreground">
                    Sutit Forms Ticket
                  </h3>
                  <p class="text-sm text-foreground">
                    Service & Product Access
                  </p>
                </div>

                <div class="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-foreground mb-1">Ticket #</p>
                    <p class="text-base font-semibold">{{ submission?.id }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-foreground mb-1">Customer</p>
                    <p class="text-base font-semibold">
                      {{ submission?.submitter?.name || "N/A" }}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-foreground mb-1">Group</p>
                    <p class="text-base font-semibold">
                      {{
                        submission?.groupMembers?.[0]?.group?.groupName || "N/A"
                      }}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-foreground mb-1">Issue Date</p>
                    <p class="text-base font-semibold">
                      {{ new Date(submission?.submittedAt).toLocaleString() }}
                    </p>
                  </div>
                </div>

                <div>
                  <p class="text-sm text-foreground mb-1">Status</p>
                  <Badge variant="outline">{{ submission?.status }}</Badge>
                </div>

                <div>
                  <p class="text-sm text-foreground mb-3">Services Included:</p>
                  <div class="space-y-2">
                    <div class="flex items-center gap-2">
                      <CreditCard class="w-5 h-5 text-muted-foreground" />
                      <span class="text-sm text-foreground">Form Payment</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <Package class="w-5 h-5 text-muted-foreground" />
                      <span class="text-sm text-foreground">Product Sales</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Right Column - Submission Info & Actions -->
        <div class="space-y-6">
          <!-- Submission Info Card -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-3">
                <FileCheck class="w-6 h-6" />
                Submission Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-foreground">Status</span>
                  <Badge class="bg-green-100 text-green-800">{{
                    submission?.status
                  }}</Badge>
                </div>
                <div>
                  <p class="text-sm text-foreground mb-1">Submitted</p>
                  <p class="text-base font-medium">
                    {{ new Date(submission?.submittedAt).toLocaleString() }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-foreground mb-1">IP Address</p>
                  <p class="text-base font-medium">N/A</p>
                  <!-- Assuming no IP data -->
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Payment Info Card -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-3">
                <CreditCard class="w-6 h-6" />
                Payment Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div>
                  <p class="text-sm text-foreground mb-1">Method</p>
                  <p class="text-base font-medium">
                    {{
                      submissionData?.data.payments.payment ? "MPESA" : "N/A"
                    }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-foreground mb-1">
                    Mobile/Bank Account
                  </p>
                  <p class="text-base font-medium">
                    {{
                      submissionData?.data.payments.payment.phoneNumber || "N/A"
                    }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-foreground mb-1">Amount</p>
                  <p class="text-lg font-bold text-primary">
                    Kes {{ submissionData?.data.payments.payment.amount }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-foreground mb-1">Reference Number</p>
                  <p class="text-lg font-bold text-primary">
                    {{ submissionData?.data.payments.payment.receiptNumber }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- TAT Countdown Card -->
          <Card v-if="submission?.form?.calculateTat">
            <CardHeader>
              <CardTitle class="flex items-center gap-3">
                <RotateCw class="w-6 h-6" />
                TAT Countdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div>
                  <p class="text-sm text-foreground mb-1">Start Time</p>
                  <p class="text-base font-medium">
                    {{ new Date(submission?.submittedAt).toLocaleString() }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-foreground mb-1">Elapsed Time</p>
                  <p class="text-base font-medium">{{ countdown }}</p>
                </div>
                <div>
                  <p class="text-sm text-foreground mb-1">TAT (seconds)</p>
                  <p class="text-base font-medium text-primary">
                    {{ submission?.tat || "N/A" }}
                  </p>
                </div>
                <Button
                  variant="outline"
                  class="w-full gap-2"
                  @click="stopCountdown"
                >
                  <Play class="w-5 h-5" />
                  <span>Stop TAT</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <!-- Actions Card -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-3">
                <Settings class="w-6 h-6" />
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-3">
                <!-- <Button variant="destructive" class="w-full gap-2" @click="confirmDelete"> -->
                <!--   <Trash2 class="w-5 h-5" /> -->
                <!--   <span>Delete Submission</span> -->
                <!-- </Button> -->

                <Button
                  variant="outline"
                  class="w-full gap-2"
                  @click="downloadReceipt"
                >
                  <Download class="w-5 h-5" />
                  <span>Download Receipt</span>
                </Button>

                <Button
                  variant="outline"
                  class="w-full gap-2"
                  @click="downloadTicket"
                >
                  <Ticket class="w-5 h-5" />
                  <span>Download Ticket</span>
                </Button>

                <Button
                  variant="outline"
                  class="w-full gap-2"
                  @click="exportData"
                >
                  <Share2 class="w-5 h-5" />
                  <span>Export Data</span>
                </Button>

                <Button class="w-full gap-2">
                  <Mail class="w-5 h-5" />
                  <span>Send Email</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- Bottom Action Buttons -->
      <div class="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink
          :to="`/forms/${formId}/submissions`"
          class="gap-2"
          :class="buttonVariants({ variant: 'outline', size: 'lg' })"
        >
          <ArrowLeft class="w-5 h-5" />
          Back to Submissions
        </NuxtLink>
        <NuxtLink
          to="/forms/new"
          class="gap-2"
          :class="buttonVariants({ size: 'lg' })"
          as-child
        >
          <Plus class="w-5 h-5" />
          Create Other Forms
        </NuxtLink>
      </div>

      <!-- Delete Confirmation Dialog -->
      <AlertDialog v-model:open="deleteDialogOpen">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete the submission. You can restore it later
              from the deleted submissions tab.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              @click="deleteSubmission"
              :disabled="deleteLoading"
              class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Loader v-if="deleteLoading" class="w-4 h-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>
</template>
