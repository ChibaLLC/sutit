<script setup lang="ts">
  import { CheckCircle2, AlertTriangle, XCircle, Loader, Camera } from "lucide-vue-next";
  import { ref, watch, nextTick, onBeforeUnmount } from "vue";

  type ScanResult = {
    result:
      | "checked_in"
      | "already_checked_in"
      | "unpaid"
      | "wrong_event"
      | "invalid"
      | "error";
    message: string;
    submissionId?: string;
    name?: string;
    checkin?: Record<string, any>;
  };

  const props = defineProps<{ formId: string }>();
  const emit = defineEmits<{ checkedIn: [result: ScanResult] }>();
  const open = defineModel<boolean>("open", { default: false });

  const videoEl = ref<HTMLVideoElement | null>(null);
  const cameraError = ref<string | null>(null);
  const starting = ref(false);
  const busy = ref(false);
  const current = ref<ScanResult | null>(null);
  const recent = ref<(ScanResult & { at: Date })[]>([]);
  const sessionCount = ref(0);

  let scanner: any = null;
  let lastValue = "";
  let lastAt = 0;
  let clearTimer: ReturnType<typeof setTimeout> | null = null;

  const style = (r?: ScanResult["result"]) => {
    if (r === "checked_in") return "bg-green-600 text-white";
    if (r === "already_checked_in") return "bg-amber-500 text-white";
    return "bg-red-600 text-white";
  };

  const showResult = (res: ScanResult) => {
    current.value = res;
    recent.value = [{ ...res, at: new Date() }, ...recent.value].slice(0, 8);
    if (navigator.vibrate) navigator.vibrate(res.result === "checked_in" ? 80 : [80, 60, 80]);
    if (clearTimer) clearTimeout(clearTimer);
    clearTimer = setTimeout(() => (current.value = null), 3500);
  };

  const onDecode = async (data: string) => {
    const now = Date.now();
    // Ignore the same code being seen repeatedly while it's still in front of the camera.
    if (busy.value || (data === lastValue && now - lastAt < 5000)) return;
    lastValue = data;
    lastAt = now;
    busy.value = true;
    try {
      const res = await $fetch<ScanResult>(`/api/forms/${props.formId}/checkin/scan`, {
        method: "POST",
        body: { data },
      });
      showResult(res);
      if (res.result === "checked_in") sessionCount.value++;
      if (res.result === "checked_in" || res.result === "already_checked_in") emit("checkedIn", res);
    } catch (e: any) {
      showResult({
        result: "error",
        message: e?.data?.statusMessage || e?.data?.message || "Network error, scan again",
      });
      lastValue = ""; // allow an immediate retry of the same code
    } finally {
      busy.value = false;
    }
  };

  const start = async () => {
    cameraError.value = null;
    starting.value = true;
    await nextTick();
    try {
      if (!videoEl.value) return;
      const { default: QrScanner } = await import("qr-scanner");
      if (!(await QrScanner.hasCamera())) {
        cameraError.value = "No camera found on this device.";
        return;
      }
      scanner = new QrScanner(videoEl.value, (r: { data: string }) => onDecode(r.data), {
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 8,
        returnDetailedScanResult: true,
      });
      await scanner.start();
    } catch (e: any) {
      cameraError.value =
        typeof e === "string"
          ? e
          : e?.name === "NotAllowedError"
            ? "Camera permission was denied. Allow camera access in your browser settings and try again."
            : !window.isSecureContext
              ? "The camera only works over HTTPS."
              : e?.message || "Could not start the camera.";
    } finally {
      starting.value = false;
    }
  };

  const stop = () => {
    scanner?.stop();
    scanner?.destroy();
    scanner = null;
  };

  watch(open, (isOpen) => {
    if (isOpen) {
      sessionCount.value = 0;
      start();
    } else {
      stop();
      current.value = null;
    }
  });

  onBeforeUnmount(() => {
    stop();
    if (clearTimer) clearTimeout(clearTimer);
  });
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-h-[95vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Camera class="h-5 w-5" />
          Scan to check in
        </DialogTitle>
        <DialogDescription>
          Point the camera at a participant's pass. Checked in this session: {{ sessionCount }}
        </DialogDescription>
      </DialogHeader>

      <div class="relative aspect-square w-full overflow-hidden rounded-lg bg-black">
        <video ref="videoEl" class="h-full w-full object-cover" muted playsinline />

        <div
          v-if="starting"
          class="absolute inset-0 flex items-center justify-center gap-2 text-white"
        >
          <Loader class="h-5 w-5 animate-spin" /> Starting camera...
        </div>

        <div
          v-if="cameraError"
          class="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white"
        >
          <AlertTriangle class="h-8 w-8 text-amber-400" />
          <p class="text-sm">{{ cameraError }}</p>
          <Button size="sm" variant="secondary" @click="start">Try again</Button>
        </div>

        <div
          v-if="busy"
          class="absolute top-3 right-3 rounded-full bg-black/60 p-2 text-white"
        >
          <Loader class="h-4 w-4 animate-spin" />
        </div>

        <!-- Big result banner -->
        <div
          v-if="current"
          class="absolute inset-x-0 bottom-0 flex items-center gap-3 p-4"
          :class="style(current.result)"
        >
          <CheckCircle2 v-if="current.result === 'checked_in'" class="h-8 w-8 shrink-0" />
          <AlertTriangle
            v-else-if="current.result === 'already_checked_in'"
            class="h-8 w-8 shrink-0"
          />
          <XCircle v-else class="h-8 w-8 shrink-0" />
          <p class="text-base leading-tight font-semibold">{{ current.message }}</p>
        </div>
      </div>

      <div v-if="recent.length" class="space-y-1">
        <p class="text-muted-foreground text-xs font-medium uppercase">Recent scans</p>
        <ul class="divide-y rounded-md border text-sm">
          <li v-for="(r, i) in recent" :key="i" class="flex items-center gap-2 px-3 py-2">
            <span class="h-2 w-2 shrink-0 rounded-full" :class="style(r.result)" />
            <span class="flex-1 truncate">{{ r.message }}</span>
            <span class="text-muted-foreground text-xs">
              {{ r.at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }}
            </span>
          </li>
        </ul>
      </div>
    </DialogContent>
  </Dialog>
</template>
