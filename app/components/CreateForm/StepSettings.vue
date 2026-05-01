<script setup lang="ts">
  import { Shield, Send, Users } from "lucide-vue-next";
  import { ref, watch } from "vue";

  const props = defineProps<{
    isPublic: boolean;
    requiresLogin: boolean;
    allowMultipleSubmissions: boolean;
    submissionLimit: number | null;
    allowGroups: boolean;
    afterSubmissionMessage: string;
    formType: "regular" | "product";
  }>();

  const emit = defineEmits<{
    "update:isPublic": [value: boolean];
    "update:requiresLogin": [value: boolean];
    "update:allowMultipleSubmissions": [value: boolean];
    "update:submissionLimit": [value: number | null];
    "update:allowGroups": [value: boolean];
    "update:afterSubmissionMessage": [value: string];
  }>();

  const localLimit = ref(props.submissionLimit ?? "");
  const localMessage = ref(props.afterSubmissionMessage);

  watch(
    () => props.submissionLimit,
    (v) => {
      localLimit.value = v ?? "";
    },
  );
  watch(
    () => props.afterSubmissionMessage,
    (v) => {
      localMessage.value = v;
    },
  );

  const flushLimit = () => {
    const val = parseInt(String(localLimit.value));
    const parsed = isNaN(val) || val <= 0 ? null : val;
    if (parsed !== props.submissionLimit) emit("update:submissionLimit", parsed);
  };

  const flushMessage = () => {
    if (localMessage.value !== props.afterSubmissionMessage) {
      emit("update:afterSubmissionMessage", localMessage.value);
    }
  };
</script>

<template>
  <div class="mx-auto max-w-xl">
    <div class="mb-8 space-y-2 text-center">
      <h2 class="text-2xl font-bold tracking-tight">Form settings</h2>
      <p class="text-muted-foreground">Configure access and submission behavior</p>
    </div>

    <div class="space-y-6">
      <!-- Access -->
      <Card>
        <CardHeader class="pb-3">
          <div class="flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <Shield class="h-4 w-4 text-blue-500" />
            </div>
            <CardTitle class="text-base">Access</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="bg-card/50 flex items-center justify-between rounded-lg border p-3">
            <div>
              <p class="text-sm font-medium">Public form</p>
              <p class="text-muted-foreground text-xs">Anyone with the link can access</p>
            </div>
            <Switch :modelValue="isPublic" @update:modelValue="emit('update:isPublic', $event)" />
          </div>
          <div class="bg-card/50 flex items-center justify-between rounded-lg border p-3">
            <div>
              <p class="text-sm font-medium">Require login</p>
              <p class="text-muted-foreground text-xs">Users must sign in to submit</p>
            </div>
            <Switch
              :modelValue="requiresLogin"
              @update:modelValue="emit('update:requiresLogin', $event)"
            />
          </div>
        </CardContent>
      </Card>

      <!-- Submissions -->
      <Card>
        <CardHeader class="pb-3">
          <div class="flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
              <Send class="h-4 w-4 text-green-500" />
            </div>
            <CardTitle class="text-base">Submissions</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="bg-card/50 flex items-center justify-between rounded-lg border p-3">
            <div>
              <p class="text-sm font-medium">Multiple submissions</p>
              <p class="text-muted-foreground text-xs">Allow users to submit more than once</p>
            </div>
            <Switch
              :modelValue="allowMultipleSubmissions"
              @update:modelValue="emit('update:allowMultipleSubmissions', $event)"
            />
          </div>

          <div class="space-y-1.5">
            <Label class="text-sm">Submission limit</Label>
            <Input
              type="number"
              v-model="localLimit"
              @blur="flushLimit"
              placeholder="No limit"
              min="1"
              class="h-9 text-sm"
            />
            <p class="text-muted-foreground text-xs">Leave empty for unlimited</p>
          </div>

          <div class="space-y-1.5">
            <Label class="text-sm">After submission message</Label>
            <Textarea
              v-model="localMessage"
              @blur="flushMessage"
              placeholder="Thank you for your submission!"
              rows="3"
              class="resize-none text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <!-- Groups -->
      <Card>
        <CardHeader class="pb-3">
          <div class="flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
              <Users class="h-4 w-4 text-purple-500" />
            </div>
            <CardTitle class="text-base">Groups</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div class="bg-card/50 flex items-center justify-between rounded-lg border p-3">
            <div>
              <p class="text-sm font-medium">Allow group submissions</p>
              <p class="text-muted-foreground text-xs">Users can register as a group</p>
            </div>
            <Switch
              :modelValue="allowGroups"
              @update:modelValue="emit('update:allowGroups', $event)"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
