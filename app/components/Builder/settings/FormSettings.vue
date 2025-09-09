<template>
  <div class="min-h-screen bg-background p-6">
    <div class="mx-auto max-w-4xl space-y-8">
      <!-- Header Section -->
      <div class="bg-primary rounded-xl p-6 text-primary-foreground">
        <div class="flex items-center gap-3 mb-2">
          <div
            class="h-8 w-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center"
          >
            <Settings class="h-4 w-4" />
          </div>
          <h1 class="text-2xl font-bold">Form Settings</h1>
        </div>
        <p class="text-primary-foreground/80">
          Configure your form properties and behavior
        </p>
        <div
          class="mt-4 flex items-center gap-2 text-sm text-primary-foreground/60"
        >
          <span>Form ID:</span>
          <code
            class="bg-primary-foreground/10 px-2 py-1 rounded text-primary-foreground"
            >{{ form.id }}</code
          >
        </div>
      </div>

      <!-- Basic Information Card -->
      <Card class="overflow-hidden">
        <CardHeader class="bg-card border-b">
          <div class="flex items-center gap-3">
            <div
              class="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center"
            >
              <FileText class="h-5 w-5 text-secondary" />
            </div>
            <div>
              <CardTitle class="text-xl">Basic Information</CardTitle>
              <CardDescription
                >Set up your form's basic details</CardDescription
              >
            </div>
          </div>
        </CardHeader>
        <CardContent class="p-6 space-y-6">
          <div class="space-y-2">
            <Label for="title" class="text-sm font-medium">Form Title</Label>
            <Input
              id="title"
              v-model="form.title"
              placeholder="Enter form title"
              class="transition-all duration-200 focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <div class="space-y-2">
            <Label for="description" class="text-sm font-medium"
              >Description</Label
            >
            <Textarea
              id="description"
              v-model="form.description"
              placeholder="Enter form description (optional)"
              rows="3"
              class="transition-all duration-200 focus:ring-2 focus:ring-ring/20 resize-none"
            />
          </div>

          <!-- Added slug field -->
          <div class="space-y-2">
            <Label for="slug" class="text-sm font-medium">URL Slug</Label>
            <div class="relative">
              <Link
                class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <Input
                id="slug"
                v-model="form.slug"
                placeholder="form-url-slug"
                class="pl-10 transition-all duration-200 focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-2">
              <Label for="price" class="text-sm font-medium">Price</Label>
              <div class="relative">
                <DollarSign
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
                <Input
                  id="price"
                  v-model.number="form.price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  class="pl-10 transition-all duration-200 focus:ring-2 focus:ring-ring/20"
                />
              </div>
            </div>

            <!-- Added status field -->
            <div class="space-y-2">
              <Label for="status" class="text-sm font-medium">Status</Label>
              <Select v-model="form.status">
                <SelectTrigger
                  class="transition-all duration-200 focus:ring-2 focus:ring-ring/20"
                >
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

          <!-- Added tags field -->
          <div class="space-y-2">
            <Label for="tags" class="text-sm font-medium">Tags</Label>
            <div class="relative">
              <Tag
                class="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
              />
              <Textarea
                id="tags"
                :value="form.tags.join(', ')"
                @input="updateTags"
                placeholder="Enter tags separated by commas"
                rows="2"
                class="pl-10 transition-all duration-200 focus:ring-2 focus:ring-ring/20 resize-none"
              />
            </div>
            <p class="text-xs text-muted-foreground">
              Separate multiple tags with commas
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Access & Permissions Card -->
      <!-- Added new card for access and permissions settings -->
      <Card class="overflow-hidden">
        <CardHeader class="bg-card border-b">
          <div class="flex items-center gap-3">
            <div
              class="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center"
            >
              <Shield class="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle class="text-xl">Access & Permissions</CardTitle>
              <CardDescription
                >Control who can access and submit your form</CardDescription
              >
            </div>
          </div>
        </CardHeader>
        <CardContent class="p-6 space-y-6">
          <div class="grid gap-6 md:grid-cols-2">
            <div
              class="flex items-center justify-between p-4 rounded-lg border bg-card/50 transition-all duration-200 hover:bg-card"
            >
              <div class="space-y-1">
                <Label class="text-sm font-medium">Public Form</Label>
                <p class="text-xs text-muted-foreground">
                  Make form publicly accessible
                </p>
              </div>
              <Switch
                v-model="form.isPublic"
                class="transition-all duration-200"
              />
            </div>

            <div
              class="flex items-center justify-between p-4 rounded-lg border bg-card/50 transition-all duration-200 hover:bg-card"
            >
              <div class="space-y-1">
                <Label class="text-sm font-medium">Require Login</Label>
                <p class="text-xs text-muted-foreground">
                  Users must be logged in to submit
                </p>
              </div>
              <Switch
                v-model="form.requiresLogin"
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
            <div
              class="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center"
            >
              <Send class="h-5 w-5 text-green-500" />
            </div>
            <div>
              <CardTitle class="text-xl">Submission Settings</CardTitle>
              <CardDescription
                >Configure how users can submit responses</CardDescription
              >
            </div>
          </div>
        </CardHeader>
        <CardContent class="p-6 space-y-6">
          <div class="grid gap-6 md:grid-cols-2">
            <div
              class="flex items-center justify-between p-4 rounded-lg border bg-card/50 transition-all duration-200 hover:bg-card"
            >
              <div class="space-y-1">
                <Label class="text-sm font-medium">Multiple Submissions</Label>
                <p class="text-xs text-muted-foreground">
                  Allow users to submit multiple times
                </p>
              </div>
              <Switch
                v-model="form.allowMultipleSubmissions"
                class="transition-all duration-200"
              />
            </div>

            <div
              class="flex items-center justify-between p-4 rounded-lg border bg-card/50 transition-all duration-200 hover:bg-card"
            >
              <div class="space-y-1">
                <Label class="text-sm font-medium">Registration Reuse</Label>
                <p class="text-xs text-muted-foreground">
                  Allow reusing registration data
                </p>
              </div>
              <Switch
                v-model="form.allowRegistrationReuse"
                class="transition-all duration-200"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="submissionLimit" class="text-sm font-medium"
              >Submission Limit</Label
            >
            <div class="relative">
              <Hash
                class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <Input
                id="submissionLimit"
                v-model.number="form.submissionLimit"
                type="number"
                min="1"
                placeholder="No limit"
                class="pl-10 transition-all duration-200 focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <p class="text-xs text-muted-foreground">
              Leave empty for unlimited submissions
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Configuration Options Card -->
      <Card class="overflow-hidden">
        <CardHeader class="bg-card border-b">
          <div class="flex items-center gap-3">
            <div
              class="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center"
            >
              <Sliders class="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle class="text-xl">Configuration Options</CardTitle>
              <CardDescription
                >Customize form behavior and features</CardDescription
              >
            </div>
          </div>
        </CardHeader>
        <CardContent class="p-6 space-y-8">
          <!-- Toggle Options -->
          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-4">
              <div
                class="flex items-center justify-between p-4 rounded-lg border bg-card/50 transition-all duration-200 hover:bg-card"
              >
                <div class="space-y-1">
                  <Label class="text-sm font-medium">Require Merchandise</Label>
                  <p class="text-xs text-muted-foreground">
                    Require users to purchase merchandise
                  </p>
                </div>
                <Switch
                  v-model="form.requireMerch"
                  class="transition-all duration-200"
                />
              </div>

              <div
                class="flex items-center justify-between p-4 rounded-lg border bg-card/50 transition-all duration-200 hover:bg-card"
              >
                <div class="space-y-1">
                  <Label class="text-sm font-medium">Calculate TAT</Label>
                  <p class="text-xs text-muted-foreground">
                    Enable turnaround time calculation
                  </p>
                </div>
                <Switch
                  v-model="form.calculateTat"
                  class="transition-all duration-200"
                />
              </div>
            </div>

            <div class="space-y-4">
              <div
                class="flex items-center justify-between p-4 rounded-lg border bg-card/50 transition-all duration-200 hover:bg-card"
              >
                <div class="space-y-1">
                  <Label class="text-sm font-medium">Allow Groups</Label>
                  <p class="text-xs text-muted-foreground">
                    Enable group submissions
                  </p>
                </div>
                <Switch
                  v-model="form.allowGroups"
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
              <div class="flex items-center gap-3 pt-4 border-t">
                <div
                  class="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center"
                >
                  <Users class="h-4 w-4 text-accent" />
                </div>
                <h3 class="text-lg font-semibold">Group Settings</h3>
              </div>

              <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-2">
                  <Label for="groupAmount" class="text-sm font-medium"
                    >Group Amount Payable</Label
                  >
                  <div class="relative">
                    <DollarSign
                      class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                    />
                    <Input
                      id="groupAmount"
                      v-model.number="form.groupAmountPayable"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      class="pl-10 transition-all duration-200 focus:ring-2 focus:ring-ring/20"
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <Label for="memberLimit" class="text-sm font-medium"
                    >Member Limit</Label
                  >
                  <div class="relative">
                    <Users
                      class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                    />
                    <Input
                      id="memberLimit"
                      v-model.number="form.groupMemberLimit"
                      type="number"
                      min="1"
                      placeholder="10"
                      class="pl-10 transition-all duration-200 focus:ring-2 focus:ring-ring/20"
                    />
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <Label for="infoPrompt" class="text-sm font-medium"
                  >Info Prompt Message</Label
                >
                <Textarea
                  id="infoPrompt"
                  v-model="form.infoPromptMessage"
                  placeholder="Enter message to display to group members"
                  rows="3"
                  class="transition-all duration-200 focus:ring-2 focus:ring-ring/20 resize-none"
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
            <div
              class="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center"
            >
              <Calendar class="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <CardTitle class="text-xl">Publishing Settings</CardTitle>
              <CardDescription
                >Control when and how your form is published</CardDescription
              >
            </div>
          </div>
        </CardHeader>
        <CardContent class="p-6 space-y-6">
          <div class="space-y-2">
            <Label for="publishedAt" class="text-sm font-medium"
              >Published Date</Label
            >
            <div class="relative">
              <Calendar
                class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <Input
                id="publishedAt"
                v-model="form.publishedAt"
                type="datetime-local"
                class="pl-10 transition-all duration-200 focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <p class="text-xs text-muted-foreground">
              Set when the form should be published
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Action Buttons -->
      <div
        class="flex items-center justify-between p-6 bg-card rounded-xl border"
      >
        <div class="text-sm text-muted-foreground">
          Changes are automatically saved
        </div>
        <div class="flex gap-3">
          <Button
            variant="outline"
            @click="resetForm"
            class="transition-all duration-200 hover:scale-105"
          >
            <RotateCcw class="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            @click="saveForm"
            class="transition-all duration-200 hover:scale-105 bg-secondary hover:bg-secondary/90"
          >
            <Save class="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

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
} from "lucide-vue-next";
import type { FormSchema } from "~~/shared/types";
interface Props {
  form: FormSchema;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  update: [form: FormSchema];
}>();

const updateTags = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  const tagsString = target.value;
  props.form.tags = tagsString
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
};

const saveForm = () => {
  emit("update", props.form);
  // Here you would typically call an API to save the form
};
</script>
