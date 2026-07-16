<script setup lang="ts">
  import {
    Settings,
    FileText,
    Sliders,
    Users,
    DollarSign,
    Save,
    RotateCcw,
    Link,
    Tag,
    Shield,
    Send,
    Hash,
    Calendar,
    CheckCircle,
    Loader,
    Phone,
    Store,
    Building2,
    Wallet,
  } from "lucide-vue-next";
  import { ref, computed } from "vue";
  import { toast } from "vue-sonner";
  import type { FormPayoutMethod, FormSchema } from "~~/shared/types";
  import { slugify } from "~~/shared/utils/form.schema";
  interface Props {
    form: FormSchema;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    update: [form: FormSchema];
  }>();

  const isSaving = ref(false);
  const lastSaved = ref<Date | null>(null);

  const needsPayout = computed(() => Number(props.form.price) > 0 || !!props.form.requireMerch);

  const setPayoutMethod = (method: FormPayoutMethod) => {
    props.form.payoutMethod = method;
  };

  const updateTags = (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    const tagsString = target.value;
    props.form.tags = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  };

  const saveForm = async () => {
    isSaving.value = true;
    try {
      // Emit the update event with the current form data
      emit("update", { ...props.form });
      lastSaved.value = new Date();
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving form settings:", error);
      toast.error("Failed to save settings");
    } finally {
      isSaving.value = false;
    }
  };

  const resetForm = () => {
    if (confirm("Are you sure you want to reset all changes?")) {
      window.location.reload();
    }
  };
  const slugUrl = computed(() => {
    let host = window.location.host;
    return `${host}/forms/${props.form.slug}`;
  });
</script>
<template>
  <div class="bg-background min-h-screen p-6">
    <div class="mx-auto max-w-4xl space-y-8">
      <!-- Header Section -->
      <div class="bg-primary text-primary-foreground rounded-xl p-6">
        <div class="mb-2 flex items-center gap-3">
          <div class="bg-primary-foreground/20 flex h-8 w-8 items-center justify-center rounded-lg">
            <Settings class="h-4 w-4" />
          </div>
          <h1 class="text-2xl font-bold">Form Settings</h1>
        </div>
        <p class="text-primary-foreground/80">Configure your form properties and behavior</p>
        <div class="text-primary-foreground/60 mt-4 flex items-center gap-2 text-sm">
          <span>Form ID:</span>
          <code class="bg-primary-foreground/10 text-primary-foreground rounded px-2 py-1">{{
            form.id
          }}</code>
        </div>
      </div>

      <!-- Basic Information Card -->
      <Card class="overflow-hidden">
        <CardHeader class="bg-card border-b">
          <div class="flex items-center gap-3">
            <div class="bg-secondary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <FileText class="text-secondary h-5 w-5" />
            </div>
            <div>
              <CardTitle class="text-xl">Basic Information</CardTitle>
              <CardDescription>Set up your form's basic details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-6 p-6">
          <div class="space-y-2">
            <Label for="title" class="text-sm font-medium">Form Title</Label>
            <Input
              id="title"
              v-model="form.title"
              @input="(e) => (form.slug = slugify(e.target.value))"
              placeholder="Enter form title"
              class="focus:ring-ring/20 transition-all duration-200 focus:ring-2"
            />
          </div>

          <div class="space-y-2">
            <Label for="description" class="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              v-model="form.description"
              placeholder="Enter form description (optional)"
              rows="3"
              class="focus:ring-ring/20 resize-none transition-all duration-200 focus:ring-2"
            />
          </div>
          <div class="space-y-2">
            <Label>After Submission Message</Label>
            <Textarea
              v-model="form.afterSubmissionMessage"
              placeholder="Enter after form submission message "
              rows="3"
              class="focus:ring-ring/20 resize-none transition-all duration-200 focus:ring-2"
            />
          </div>

          <!-- Added slug field -->
          <div class="space-y-2">
            <Label for="slug" class="text-sm font-medium">URL Slug</Label>
            <div class="relative">
              <Link
                class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform"
              />
              <Input
                id="slug"
                v-model="form.slug"
                placeholder="form-url-slug"
                class="focus:ring-ring/20 pl-10 transition-all duration-200 focus:ring-2"
              />
            </div>
            <p class="text-sm font-semibold text-black dark:text-white">
              {{ slugUrl }}
            </p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-2">
              <Label for="price" class="text-sm font-medium">Price</Label>
              <div class="relative">
                <DollarSign
                  class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform"
                />
                <Input
                  id="price"
                  v-model.number="form.price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  class="focus:ring-ring/20 pl-10 transition-all duration-200 focus:ring-2"
                />
              </div>
            </div>

            <!-- Added status field -->
            <div class="space-y-2">
              <Label for="status" class="text-sm font-medium">Status</Label>
              <Select v-model="form.status">
                <SelectTrigger class="focus:ring-ring/20 transition-all duration-200 focus:ring-2">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Payout destination for paid / product forms -->
          <div v-if="needsPayout" class="space-y-4 rounded-xl border p-4 sm:p-5">
            <div class="flex items-center gap-3">
              <div class="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                <Wallet class="text-primary h-4 w-4" />
              </div>
              <div>
                <p class="text-sm font-semibold">Payout details</p>
                <p class="text-muted-foreground text-xs">
                  After each payment, funds are sent here via M-Pesa
                </p>
              </div>
            </div>

            <div class="flex flex-wrap gap-2 sm:grid sm:grid-cols-3 sm:gap-2">
              <button
                type="button"
                @click="setPayoutMethod('phone')"
                class="flex flex-1 items-center gap-2 rounded-lg border-2 px-3 py-2.5 text-xs transition-all sm:flex-col sm:px-3 sm:py-3 sm:text-center"
                :class="
                  form.payoutMethod === 'phone'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
                "
              >
                <Phone class="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                <span class="text-xs font-medium sm:text-sm">Phone</span>
              </button>
              <button
                type="button"
                @click="setPayoutMethod('till')"
                class="flex flex-1 items-center gap-2 rounded-lg border-2 px-3 py-2.5 text-xs transition-all sm:flex-col sm:px-3 sm:py-3 sm:text-center"
                :class="
                  form.payoutMethod === 'till'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
                "
              >
                <Store class="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                <span class="text-xs font-medium sm:text-sm">Till</span>
              </button>
              <button
                type="button"
                @click="setPayoutMethod('paybill')"
                class="flex flex-1 items-center gap-2 rounded-lg border-2 px-3 py-2.5 text-xs transition-all sm:flex-col sm:px-3 sm:py-3 sm:text-center"
                :class="
                  form.payoutMethod === 'paybill'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
                "
              >
                <Building2 class="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                <span class="text-xs font-medium sm:text-sm">Paybill</span>
              </button>
            </div>

            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-1"
            >
              <div v-if="form.payoutMethod" class="bg-muted/30 space-y-3 rounded-lg p-3 sm:p-4">
                <div v-if="form.payoutMethod === 'phone'" class="space-y-2">
                  <Label for="payoutPhone">M-Pesa phone number</Label>
                  <Input
                    id="payoutPhone"
                    v-model="form.payoutPhone"
                    placeholder="0712345678"
                    type="tel"
                    class="bg-background h-11"
                  />
                  <p class="text-muted-foreground text-xs">Payouts sent via B2C</p>
                </div>
                <div v-else-if="form.payoutMethod === 'till'" class="space-y-2">
                  <Label for="payoutTill">Till number</Label>
                  <Input
                    id="payoutTill"
                    v-model="form.payoutTill"
                    placeholder="e.g. 123456"
                    class="bg-background h-11"
                  />
                  <p class="text-muted-foreground text-xs">Buy Goods till — payouts via B2B</p>
                </div>
                <div v-else-if="form.payoutMethod === 'paybill'" class="space-y-3">
                  <div class="grid gap-3 sm:grid-cols-2">
                    <div class="space-y-2">
                      <Label for="payoutPaybill">Paybill number</Label>
                      <Input
                        id="payoutPaybill"
                        v-model="form.payoutPaybill"
                        placeholder="e.g. 400200"
                        class="bg-background h-11"
                      />
                    </div>
                    <div class="space-y-2">
                      <Label for="payoutAccount">Account number</Label>
                      <Input
                        id="payoutAccount"
                        v-model="form.payoutAccountNumber"
                        placeholder="e.g. INV-001"
                        class="bg-background h-11"
                      />
                    </div>
                  </div>
                  <p class="text-muted-foreground text-xs">Business paybill — payouts via B2B</p>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Added tags field -->
          <div class="space-y-2">
            <Label for="tags" class="text-sm font-medium">Tags</Label>
            <div class="relative">
              <div class="mb-2 flex gap-3">
                <Badge v-for="tag in form.tags" :key="tag">{{ tag }}</Badge>
              </div>
              <Textarea
                id="tags"
                @input="updateTags"
                placeholder="Enter tags separated by commas"
                rows="2"
                class="focus:ring-ring/20 resize-none pl-10 transition-all duration-200 focus:ring-2"
              />
            </div>
            <p class="text-muted-foreground text-xs">Separate multiple tags with commas</p>
          </div>
        </CardContent>
      </Card>

      <!-- Access & Permissions Card -->
      <!-- Added new card for access and permissions settings -->
      <Card class="overflow-hidden">
        <CardHeader class="bg-card border-b">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Shield class="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle class="text-xl">Access & Permissions</CardTitle>
              <CardDescription>Control who can access and submit your form</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-6 p-6">
          <div class="grid gap-6 md:grid-cols-2">
            <div
              class="bg-card/50 hover:bg-card flex items-center justify-between rounded-lg border p-4 transition-all duration-200"
            >
              <div class="space-y-1">
                <Label class="text-sm font-medium">Public Form</Label>
                <p class="text-muted-foreground text-xs">Make form publicly accessible</p>
              </div>
              <Switch
                :checked="form.isPublic"
                @update:checked="(checked) => (form.isPublic = checked)"
                class="transition-all duration-200"
              />
            </div>

            <div
              class="bg-card/50 hover:bg-card flex items-center justify-between rounded-lg border p-4 transition-all duration-200"
            >
              <div class="space-y-1">
                <Label class="text-sm font-medium">Require Login</Label>
                <p class="text-muted-foreground text-xs">Users must be logged in to submit</p>
              </div>
              <Switch
                :checked="form.requiresLogin"
                @update:checked="(checked) => (form.requiresLogin = checked)"
                class="transition-all duration-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Submission Settings Card -->
      <!-- Added new card for submission settings -->
      <Card class="overflow-hidden">
        <CardHeader class="bg-card border-b">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <Send class="h-5 w-5 text-green-500" />
            </div>
            <div>
              <CardTitle class="text-xl">Submission Settings</CardTitle>
              <CardDescription>Configure how users can submit responses</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-6 p-6">
          <div class="grid gap-6 md:grid-cols-2">
            <div
              class="bg-card/50 hover:bg-card flex items-center justify-between rounded-lg border p-4 transition-all duration-200"
            >
              <div class="space-y-1">
                <Label class="text-sm font-medium">Multiple Submissions</Label>
                <p class="text-muted-foreground text-xs">Allow users to submit multiple times</p>
              </div>
              <Switch
                :checked="form.allowMultipleSubmissions"
                @update:checked="(checked) => (form.allowMultipleSubmissions = checked)"
                class="transition-all duration-200"
              />
            </div>

            <div
              class="bg-card/50 hover:bg-card flex items-center justify-between rounded-lg border p-4 transition-all duration-200"
            >
              <div class="space-y-1">
                <Label class="text-sm font-medium">Registration Reuse</Label>
                <p class="text-muted-foreground text-xs">Allow reusing registration data</p>
              </div>
              <Switch
                :checked="form.allowRegistrationReuse"
                @update:checked="(checked) => (form.allowRegistrationReuse = checked)"
                class="transition-all duration-200"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="submissionLimit" class="text-sm font-medium">Submission Limit</Label>
            <div class="relative">
              <Hash
                class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform"
              />
              <Input
                id="submissionLimit"
                v-model.number="form.submissionLimit"
                type="number"
                min="1"
                placeholder="No limit"
                class="focus:ring-ring/20 pl-10 transition-all duration-200 focus:ring-2"
              />
            </div>
            <p class="text-muted-foreground text-xs">Leave empty for unlimited submissions</p>
          </div>
        </CardContent>
      </Card>

      <!-- Configuration Options Card -->
      <Card class="overflow-hidden">
        <CardHeader class="bg-card border-b">
          <div class="flex items-center gap-3">
            <div class="bg-accent/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Sliders class="text-accent h-5 w-5" />
            </div>
            <div>
              <CardTitle class="text-xl">Configuration Options</CardTitle>
              <CardDescription>Customize form behavior and features</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-8 p-6">
          <!-- Toggle Options -->
          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-4">
              <div
                class="bg-card/50 hover:bg-card flex items-center justify-between rounded-lg border p-4 transition-all duration-200"
              >
                <div class="space-y-1">
                  <Label class="text-sm font-medium">Require Merchandise</Label>
                  <p class="text-muted-foreground text-xs">Require users to purchase merchandise</p>
                </div>
                <Switch
                  :checked="form.requireMerch"
                  @update:checked="(checked) => (form.requireMerch = checked)"
                  class="transition-all duration-200"
                />
              </div>

              <div
                class="bg-card/50 hover:bg-card flex items-center justify-between rounded-lg border p-4 transition-all duration-200"
              >
                <div class="space-y-1">
                  <Label class="text-sm font-medium">Calculate TAT</Label>
                  <p class="text-muted-foreground text-xs">Enable turnaround time calculation</p>
                </div>
                <Switch
                  :checked="form.calculateTat"
                  @update:checked="(checked) => (form.calculateTat = checked)"
                  class="transition-all duration-200"
                />
              </div>
            </div>

            <div class="space-y-4">
              <div
                class="bg-card/50 hover:bg-card flex items-center justify-between rounded-lg border p-4 transition-all duration-200"
              >
                <div class="space-y-1">
                  <Label class="text-sm font-medium">Allow Groups</Label>
                  <p class="text-muted-foreground text-xs">Enable group submissions</p>
                </div>
                <Switch
                  :checked="form.allowGroups"
                  @update:checked="(checked) => (form.allowGroups = checked)"
                  class="transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <!-- Group Settings (Conditional) -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 transform -translate-y-4"
            enter-to-class="opacity-100 transform translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 transform translate-y-0"
            leave-to-class="opacity-0 transform -translate-y-4"
          >
            <div v-if="form.allowGroups" class="space-y-6">
              <div class="flex items-center gap-3 border-t pt-4">
                <div class="bg-accent/10 flex h-8 w-8 items-center justify-center rounded-lg">
                  <Users class="text-accent h-4 w-4" />
                </div>
                <h3 class="text-lg font-semibold">Group Settings</h3>
              </div>

              <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-2">
                  <Label for="groupAmount" class="text-sm font-medium">Group Amount Payable</Label>
                  <div class="relative">
                    <DollarSign
                      class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform"
                    />
                    <Input
                      id="groupAmount"
                      v-model.number="form.groupAmountPayable"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      class="focus:ring-ring/20 pl-10 transition-all duration-200 focus:ring-2"
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <Label for="memberLimit" class="text-sm font-medium">Member Limit</Label>
                  <div class="relative">
                    <Users
                      class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform"
                    />
                    <Input
                      id="memberLimit"
                      v-model.number="form.groupMemberLimit"
                      type="number"
                      min="1"
                      placeholder="10"
                      class="focus:ring-ring/20 pl-10 transition-all duration-200 focus:ring-2"
                    />
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <Label for="infoPrompt" class="text-sm font-medium">Info Prompt Message</Label>
                <Textarea
                  id="infoPrompt"
                  v-model="form.infoPromptMessage"
                  placeholder="Enter message to display to group members"
                  rows="3"
                  class="focus:ring-ring/20 resize-none transition-all duration-200 focus:ring-2"
                />
              </div>
            </div>
          </Transition>
        </CardContent>
      </Card>

      <!-- Publishing Settings Card -->
      <!-- Added new card for publishing settings -->
      <Card class="overflow-hidden">
        <CardHeader class="bg-card border-b">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <Calendar class="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <CardTitle class="text-xl">Publishing Settings</CardTitle>
              <CardDescription>Control when and how your form is published</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-6 p-6">
          <div class="space-y-2">
            <Label for="publishedAt" class="text-sm font-medium">Published Date</Label>
            <div class="relative">
              <Calendar
                class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform"
              />
              <Input
                id="publishedAt"
                v-model="form.publishedAt"
                type="datetime-local"
                class="focus:ring-ring/20 pl-10 transition-all duration-200 focus:ring-2"
              />
            </div>
            <p class="text-muted-foreground text-xs">Set when the form should be published</p>
          </div>
        </CardContent>
      </Card>

      <!-- Action Buttons -->
      <div class="bg-card flex items-center justify-between rounded-xl border p-6">
        <div class="text-muted-foreground text-sm">
          <span v-if="lastSaved" class="flex items-center gap-2">
            <CheckCircle class="h-4 w-4 text-green-500" />
            Last saved {{ lastSaved.toLocaleTimeString() }}
          </span>
          <span v-else>Unsaved changes</span>
        </div>
        <div class="flex gap-3">
          <Button
            variant="outline"
            @click="resetForm"
            :disabled="isSaving"
            class="transition-all duration-200 hover:scale-105"
          >
            <RotateCcw class="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button
            @click="saveForm"
            :disabled="isSaving"
            class="bg-secondary hover:bg-secondary/90 transition-all duration-200 hover:scale-105"
          >
            <Loader v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
            <Save v-else class="mr-2 h-4 w-4" />
            {{ isSaving ? "Saving..." : "Save Changes" }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
