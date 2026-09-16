<script setup lang="ts">
  import { ImagePlus, X, Loader2 } from "lucide-vue-next";
  import { toast } from "vue-sonner";
  const props = defineProps<{ images: string[]; name?: string }>();
  const emit = defineEmits<{ "update:images": [images: string[]]; busy: [busy: boolean] }>();
  const uploading = shallowRef(false);
  const inputId = useId();
  async function upload(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    uploading.value = true;
    emit("busy", true);
    try {
      for (const file of files) {
        if (
          !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type) ||
          file.size > 10 * 1024 * 1024
        ) {
          toast.error(`${file.name}: choose a JPG, PNG, WebP, or GIF under 10 MB`);
          continue;
        }
        const body = new FormData();
        body.append("file", file);
        const result = await $fetch("/api/uploads", { method: "POST", body });
        if (!result.data?.path) throw new Error("Upload did not return an image");
        emit("update:images", [...props.images, result.data.path]);
        await nextTick();
      }
    } catch (error: any) {
      toast.error("Image upload failed", {
        description: error?.data?.message || "Please try again.",
      });
    } finally {
      uploading.value = false;
      emit("busy", false);
      input.value = "";
    }
  }
</script>

<template>
  <div class="flex flex-col gap-3">
    <Label :for="inputId">Product images</Label>
    <div v-if="images.length" class="flex flex-wrap gap-3">
      <div v-for="(image, index) in images" :key="image" class="relative">
        <img
          :src="image"
          :alt="`${name || 'Product'} image ${index + 1}`"
          class="size-20 rounded-lg border object-cover"
        />
        <Button
          type="button"
          variant="secondary"
          size="icon"
          class="absolute -top-2 -right-2 size-7"
          :aria-label="`Remove image ${index + 1}`"
          :disabled="uploading"
          @click="
            emit(
              'update:images',
              images.filter((_, i) => i !== index),
            )
          "
          ><X
        /></Button>
      </div>
    </div>
    <div class="bg-muted/30 flex flex-col gap-2 rounded-lg border border-dashed p-4">
      <div class="flex items-center gap-2 text-sm">
        <Loader2 v-if="uploading" class="size-4 animate-spin" /><ImagePlus
          v-else
          class="size-4"
        /><span>{{ uploading ? "Uploading images…" : "Choose product photos" }}</span>
      </div>
      <input
        :id="inputId"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        :disabled="uploading"
        class="file:bg-secondary file:text-secondary-foreground w-full min-w-0 text-sm file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-2"
        @change="upload"
      />
      <p class="text-muted-foreground text-xs">
        JPG, PNG, WebP or GIF. Up to 10 MB each. The first image is your product cover.
      </p>
    </div>
  </div>
</template>
