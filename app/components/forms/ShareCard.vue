<script setup lang="ts">
import {
  Copy,
  Facebook,
  Mail,
  MessageCircle,
  Twitter,
  Share2,
} from "lucide-vue-next";
import { toast } from "vue-sonner";
import type { FormSchema } from "~~/shared/types";
interface ShareSettings {
  isPublic: boolean;
  requirePassword: boolean;
  password: string;
  hasExpiration: boolean;
  expirationDate: string;
}

interface EmbedOptions {
  width: string;
  height: string;
}
const props = defineProps<{
  form: FormSchema;
  isOpen: boolean;
}>();
const emits = defineEmits<{
  close: [];
}>();
const shareSettings = ref<ShareSettings>({
  isPublic: true,
  requirePassword: false,
  password: "",
  hasExpiration: false,
  expirationDate: "",
});
const embedOptions = ref<EmbedOptions>({
  width: "100%",
  height: "600px",
});
const sharePlatforms = [
  {
    name: "Email",
    icon: Mail,
    url: "mailto:?subject=Check out this form&body=",
  },
  { name: "WhatsApp", icon: MessageCircle, url: "https://wa.me/?text=" },
  {
    name: "Facebook",
    icon: Facebook,
    url: "https://www.facebook.com/sharer/sharer.php?u=",
  },
  {
    name: "Twitter",
    icon: Twitter,
    url: "https://twitter.com/intent/tweet?url=",
  },
];
const shareUrl = ref(
  props.form ? `${window.location.origin}/forms/${props.form.slug}` : "",
);

const embedCode = computed(() => {
  if (!props.form) return "";
  return `<iframe src="${shareUrl.value}" width="${embedOptions.value.width}" height="${embedOptions.value.height}" frameborder="0"></iframe>`;
});

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Link copied successfully");
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};

const shareOnPlatform = (platform: any) => {
  const url = platform.url + encodeURIComponent(shareUrl.value);
  window.open(url, "_blank");
};

const saveShareSettings = () => {
  toast.success("Not Yet implimented");
  // Save settings logic here
  console.log("Saving share settings:", shareSettings.value);
  emits("close");
};
</script>
<template>
  <Dialog :open="isOpen" @update:open="$emit('close')">
    <DialogContent class="max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Share2 class="h-5 w-5" />
          Share Form: {{ form?.title }}
        </DialogTitle>
        <DialogDescription>
          Share your form with others using the options below
        </DialogDescription>
      </DialogHeader>

      <Tabs default-value="link" class="w-full">
        <TabsList class="grid w-full grid-cols-3">
          <TabsTrigger value="link">Share Link</TabsTrigger>
          <TabsTrigger value="embed">Embed</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <!-- Share Link Tab -->
        <TabsContent value="link" class="space-y-4">
          <div class="space-y-3">
            <Label>Form Link</Label>
            <div class="flex gap-2">
              <Input v-model="shareUrl" class="flex-1" />
              <Button @click="copyToClipboard(shareUrl)" size="sm">
                <Copy class="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          <div class="space-y-3">
            <Label>Quick Share</Label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button
                v-for="platform in sharePlatforms"
                :key="platform.name"
                variant="outline"
                size="sm"
                @click="shareOnPlatform(platform)"
                class="flex items-center gap-2"
              >
                <component :is="platform.icon" class="h-4 w-4" />
                {{ platform.name }}
              </Button>
            </div>
          </div>
        </TabsContent>

        <!-- Embed Tab -->
        <TabsContent value="embed" class="space-y-4">
          <div class="space-y-3">
            <Label>Embed Code</Label>
            <Textarea v-model="embedCode" rows="4" class="font-mono text-sm" />
            <Button
              @click="copyToClipboard(embedCode)"
              size="sm"
              class="w-full"
            >
              <Copy class="h-4 w-4 mr-2" />
              Copy Embed Code
            </Button>
          </div>

          <Separator />

          <div class="space-y-3">
            <Label>Embed Options</Label>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="embed-width">Width</Label>
                <Input
                  id="embed-width"
                  v-model="embedOptions.width"
                  placeholder="100%"
                />
              </div>
              <div class="space-y-2">
                <Label for="embed-height">Height</Label>
                <Input
                  id="embed-height"
                  v-model="embedOptions.height"
                  placeholder="600px"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <!-- Settings Tab -->
        <TabsContent value="settings" class="space-y-4">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <Label>Public Access</Label>
                <p class="text-sm text-muted-foreground">
                  Allow anyone with the link to access
                </p>
              </div>
              <Switch v-model:checked="shareSettings.isPublic" />
            </div>

            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <Label>Password Protection</Label>
                <p class="text-sm text-muted-foreground">
                  Require password to access
                </p>
              </div>
              <Switch v-model:checked="shareSettings.requirePassword" />
            </div>

            <div v-if="shareSettings.requirePassword" class="space-y-2">
              <Label for="password">Password</Label>
              <Input
                id="password"
                v-model="shareSettings.password"
                type="password"
                placeholder="Enter password"
              />
            </div>

            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <Label>Link Expiration</Label>
                <p class="text-sm text-muted-foreground">
                  Set expiration date for the link
                  {{ shareUrl }}
                </p>
              </div>
              <Switch v-model:checked="shareSettings.hasExpiration" />
            </div>

            <div v-if="shareSettings.hasExpiration" class="space-y-2">
              <Label for="expiration">Expiration Date</Label>
              <Input
                id="expiration"
                v-model="shareSettings.expirationDate"
                type="datetime-local"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter class="flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          @click="$emit('close')"
          class="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button @click="saveShareSettings" class="w-full sm:w-auto">
          Save Settings
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
