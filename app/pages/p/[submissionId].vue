<script setup lang="ts">
  import { AlertTriangle, CheckCircle2, Footprints, Loader, QrCode } from "lucide-vue-next";
  import QRCode from "qrcode";
  import { ref, computed, watch, onMounted } from "vue";
  import { toast } from "vue-sonner";

  const route = useRoute();
  const submissionId = route.params.submissionId as string;
  const code = route.query.c as string | undefined;

  useSeoMeta({ title: "Your event pass", robots: "noindex, nofollow" });

  const { data, error, pending, refresh } = await useFetch<any>(
    `/api/participant/${submissionId}`,
    { query: { c: code } },
  );

  const participant = computed(() => data.value?.data);
  const qrDataUrl = ref("");
  const distance = ref<string | number>("");
  const saving = ref(false);

  watch(
    participant,
    (p) => {
      if (p?.distanceKm != null) distance.value = p.distanceKm;
    },
    { immediate: true },
  );

  onMounted(async () => {
    if (!participant.value || !code) return;
    const passUrl = `${window.location.origin}/p/${submissionId}?c=${encodeURIComponent(code)}`;
    qrDataUrl.value = await QRCode.toDataURL(passUrl, { width: 320, margin: 2 });
  });

  const saveDistance = async () => {
    if (distance.value === "" || distance.value === null) {
      toast.error("Please enter the distance you covered");
      return;
    }
    saving.value = true;
    try {
      await $fetch(`/api/participant/${submissionId}/distance`, {
        method: "POST",
        body: { code, distanceKm: distance.value },
      });
      toast.success("Distance saved. Thank you!");
      await refresh();
    } catch (e: any) {
      toast.error(e?.data?.statusMessage || e?.data?.message || "Could not save distance");
    } finally {
      saving.value = false;
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString([], {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
</script>

<template>
  <div class="bg-background flex min-h-screen items-start justify-center p-4 sm:items-center">
    <div v-if="pending" class="flex items-center gap-3 py-20">
      <Loader class="h-6 w-6 animate-spin" />
      <p>Loading your pass...</p>
    </div>

    <Card v-else-if="error || !participant" class="w-full max-w-md">
      <CardContent class="pt-6">
        <div class="flex flex-col items-center space-y-4 text-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle class="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h2 class="text-xl font-bold">Link not valid</h2>
            <p class="text-muted-foreground mt-2 text-sm">
              This link is invalid or incomplete. Please open the full link from your SMS.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <div v-else class="w-full max-w-md space-y-4">
      <div class="text-center">
        <p class="text-muted-foreground text-sm">{{ participant.eventTitle }}</p>
        <h1 class="text-2xl font-bold">{{ participant.name }}</h1>
      </div>

      <!-- Not paid -->
      <Card v-if="!participant.paid">
        <CardContent class="flex items-center gap-3 pt-6">
          <AlertTriangle class="h-6 w-6 shrink-0 text-amber-500" />
          <p class="text-sm">
            Your registration payment is not complete, so this pass can't be used for check-in yet.
          </p>
        </CardContent>
      </Card>

      <!-- Not checked in yet: show QR -->
      <Card v-else-if="!participant.checkedInAt">
        <CardHeader class="text-center">
          <CardTitle class="flex items-center justify-center gap-2">
            <QrCode class="h-5 w-5" /> Check-in pass
          </CardTitle>
          <CardDescription>Show this QR code at the venue to check in.</CardDescription>
        </CardHeader>
        <CardContent class="flex justify-center">
          <img
            v-if="qrDataUrl"
            :src="qrDataUrl"
            alt="Check-in QR code"
            class="h-64 w-64 rounded-md border bg-white p-2"
          />
          <div v-else class="flex h-64 w-64 items-center justify-center">
            <Loader class="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>

      <!-- Checked in: distance form -->
      <template v-else>
        <Card>
          <CardContent class="flex items-center gap-3 pt-6">
            <CheckCircle2 class="h-6 w-6 shrink-0 text-green-600" />
            <p class="text-sm">
              Checked in <strong>{{ formatTime(participant.checkedInAt) }}</strong>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Footprints class="h-5 w-5" /> Distance covered
            </CardTitle>
            <CardDescription>
              <template v-if="participant.distanceKm != null">
                You recorded <strong>{{ participant.distanceKm }} km</strong>. You can update it
                below.
              </template>
              <template v-else>Enter the total distance you covered.</template>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form class="space-y-3" @submit.prevent="saveDistance">
              <div class="space-y-2">
                <Label for="distance">Distance (km)</Label>
                <Input
                  id="distance"
                  v-model="distance"
                  type="number"
                  inputmode="decimal"
                  min="0"
                  max="1000"
                  step="0.01"
                  placeholder="e.g. 10.5"
                />
              </div>
              <Button type="submit" class="w-full" :disabled="saving">
                <Loader v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
                {{ participant.distanceKm != null ? "Update distance" : "Submit distance" }}
              </Button>
            </form>
          </CardContent>
        </Card>
      </template>
    </div>
  </div>
</template>
