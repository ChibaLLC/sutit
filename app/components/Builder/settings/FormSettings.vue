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
} from "lucide-vue-next";
import type { FormSchema } from "~~/shared/types";

interface Props {
  form: FormSchema;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  update: [form: FormSchema];
}>();

// Reset form to original values
const resetForm = () => {};

// Save form (placeholder for actual save logic)
const saveForm = () => {
  // Here you would typically call an API to save the form
};
</script>
