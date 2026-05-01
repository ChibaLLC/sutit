<script setup lang="ts">
  import {
    CheckCircle,
    PackageCheck,
    Loader,
    AlertTriangle,
    ShoppingCart,
    Truck,
  } from "lucide-vue-next";
  import { ref, computed } from "vue";
  import { toast } from "vue-sonner";

  const route = useRoute();
  const submissionId = route.params.submissionId as string;
  const token = route.query.token as string;

  const { data, error, pending, refresh } = await useFetch(`/api/delivery/verify`, {
    query: { token },
  });

  const dispatch = computed(() => data.value?.data);
  const loading = computed(() => pending.value);
  const errorMessage = computed(() => error.value?.data?.message || error.value?.message || null);

  const confirmLoading = ref(false);
  const confirmed = ref(false);

  const confirmReceipt = async () => {
    confirmLoading.value = true;
    try {
      await $fetch("/api/delivery/confirm", {
        method: "POST",
        body: { token },
      });
      confirmed.value = true;
      toast.success("Delivery confirmed! Thank you.");
      await refresh();
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to confirm delivery");
    } finally {
      confirmLoading.value = false;
    }
  };

  const isConfirmed = computed(() => confirmed.value || !!dispatch.value?.deliveryConfirmedAt);

  const totalAmount = computed(() => {
    if (!dispatch.value?.submission?.storeResponses?.length) return 0;
    return dispatch.value.submission.storeResponses.reduce(
      (sum: number, item: any) => sum + (item.total || 0),
      0,
    );
  });
</script>

<template>
  <div v-if="loading" class="bg-background flex min-h-screen items-center justify-center">
    <div class="flex items-center gap-3">
      <Loader class="h-6 w-6 animate-spin" />
      <p>Verifying...</p>
    </div>
  </div>

  <div
    v-else-if="errorMessage && !isConfirmed"
    class="bg-background flex min-h-screen items-center justify-center p-4"
  >
    <Card class="w-full max-w-md">
      <CardContent class="pt-6">
        <div class="flex flex-col items-center space-y-4 text-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle class="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h2 class="text-xl font-bold">Error</h2>
            <p class="text-muted-foreground mt-2 text-sm">{{ errorMessage }}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <div v-else class="bg-background flex min-h-screen items-center justify-center p-4">
    <div class="w-full max-w-lg space-y-6">
      <!-- Header -->
      <div class="space-y-4 text-center">
        <div
          v-if="isConfirmed"
          class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
        >
          <CheckCircle class="h-8 w-8 text-green-600" />
        </div>
        <div
          v-else
          class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100"
        >
          <PackageCheck class="h-8 w-8 text-blue-600" />
        </div>

        <div class="space-y-2">
          <h1 class="text-2xl font-bold">
            {{ isConfirmed ? "Delivery Confirmed" : "Confirm Delivery" }}
          </h1>
          <p class="text-muted-foreground">
            {{ dispatch?.submission?.form?.title || "Order" }}
          </p>
        </div>
      </div>

      <!-- Order Info -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <ShoppingCart class="h-5 w-5" />
            Order Details
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground text-sm">Order Status</span>
            <Badge
              :class="isConfirmed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'"
            >
              {{ isConfirmed ? "Confirmed" : "Delivered" }}
            </Badge>
          </div>

          <div v-if="dispatch?.submission?.submitter?.name">
            <p class="text-muted-foreground mb-1 text-sm">Customer</p>
            <p class="font-medium">{{ dispatch.submission.submitter.name }}</p>
          </div>

          <div v-if="dispatch?.dispatchedBy">
            <p class="text-muted-foreground mb-1 text-sm">Dispatched By</p>
            <p class="font-medium">{{ dispatch.dispatchedBy }}</p>
          </div>

          <div v-if="dispatch?.dispatchedAt">
            <p class="text-muted-foreground mb-1 text-sm">Dispatch Date</p>
            <p class="font-medium">
              {{ new Date(dispatch.dispatchedAt).toLocaleDateString() }}
            </p>
          </div>

          <div v-if="dispatch?.deliveryDate">
            <p class="text-muted-foreground mb-1 text-sm">Delivery Date</p>
            <p class="font-medium">
              {{ new Date(dispatch.deliveryDate).toLocaleDateString() }}
            </p>
          </div>

          <Separator />

          <!-- Products -->
          <div v-if="dispatch?.submission?.storeResponses?.length">
            <p class="text-muted-foreground mb-2 text-sm">Items</p>
            <div class="space-y-2">
              <div
                v-for="item in dispatch.submission.storeResponses"
                :key="item.id"
                class="flex justify-between text-sm"
              >
                <span>{{ item.item?.name }} (x{{ item.quantity }})</span>
                <span class="font-medium">Kes {{ item.total }}</span>
              </div>
            </div>

            <Separator class="my-3" />

            <div class="flex justify-between">
              <span class="font-semibold">Total</span>
              <span class="text-primary font-bold">Kes {{ totalAmount }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Confirm Action -->
      <Card v-if="!isConfirmed">
        <CardContent class="pt-6">
          <div class="space-y-4">
            <p class="text-muted-foreground text-center text-sm">
              Please confirm that you have received your order
            </p>
            <Button
              class="w-full gap-2"
              size="lg"
              :disabled="confirmLoading"
              @click="confirmReceipt"
            >
              <Loader v-if="confirmLoading" class="h-5 w-5 animate-spin" />
              <CheckCircle v-else class="h-5 w-5" />
              <span>Confirm Receipt</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Confirmed Card -->
      <Card v-else>
        <CardContent class="pt-6">
          <div class="space-y-3 text-center">
            <div class="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle class="h-5 w-5" />
              <span class="font-medium">You confirmed receipt of this order</span>
            </div>
            <p v-if="dispatch?.deliveryConfirmedAt" class="text-muted-foreground text-sm">
              Confirmed on {{ new Date(dispatch.deliveryConfirmedAt).toLocaleString() }}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
