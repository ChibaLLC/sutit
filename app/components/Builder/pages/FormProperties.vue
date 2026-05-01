<script setup lang="ts">
  import { X, Plus, Copy, Trash2 } from "lucide-vue-next";
  import type { FormField, PageSchema } from "~~/shared/types";

  const props = defineProps<{
    selectedElement: FormField;
    currentPage: PageSchema;
  }>();

  const deleteElement = (index) => {
    if (props.currentPage) {
      const removed = props.currentPage.fields.splice(index, 1)[0];
      if (removed && props.selectedElement?.id === removed.id) {
        //props.selectedElement.value = null;
      }
    }
  };

  const deleteSelectedElement = () => {
    if (props.selectedElement && props.currentPage) {
      const index = props.currentPage.fields.findIndex((el) => el.id === props.selectedElement.id);
      if (index !== -1) {
        deleteElement(index);
      }
    }
  };

  const duplicateElement = (element) => {
    const newElement = {
      ...element,
      id: Date.now().toString(),
      label: element.label + " (Copy)",
    };

    if (props.currentPage) {
      props.currentPage.fields.push(newElement);
    }
  };

  const addOption = () => {
    props.selectedElement.options?.push("");
  };

  const removeOption = (index) => {
    props.selectedElement.options?.splice(index, 1);
  };
</script>
<template>
  <Card v-if="selectedElement">
    <CardHeader>
      <CardTitle>Properties</CardTitle>
      <CardDescription>Configure element settings</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="flex-1 overflow-y-auto">
        <div class="space-y-6">
          <!-- Basic Properties -->
          <div>
            <div class="mb-3 flex items-center gap-2">
              <div class="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
              <h3 class="text-foreground text-sm font-semibold">Basic Properties</h3>
              <div class="h-px flex-1 bg-gradient-to-r from-blue-500/20 to-transparent"></div>
            </div>
            <div class="space-y-3">
              <Card class="border-border/50 border p-3 transition-all duration-200 hover:shadow-md">
                <div class="space-y-2">
                  <Label class="text-foreground flex items-center gap-2 text-sm font-medium">
                    <div class="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100">
                      <svg
                        class="h-3 w-3 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                    </div>
                    Label
                  </Label>
                  <Input
                    v-model="selectedElement.label"
                    placeholder="Enter element label"
                    class="bg-muted/50 focus:bg-muted h-9 border-0 transition-all duration-200"
                  />
                </div>
              </Card>

              <Card class="border-border/50 border p-3 transition-all duration-200 hover:shadow-md">
                <div class="space-y-2">
                  <Label class="text-foreground flex items-center gap-2 text-sm font-medium">
                    <div class="flex h-6 w-6 items-center justify-center rounded-lg bg-green-100">
                      <svg
                        class="h-3 w-3 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    Placeholder
                  </Label>
                  <Input
                    v-model="selectedElement.placeholder"
                    placeholder="Enter placeholder text"
                    class="bg-muted/50 focus:bg-muted h-9 border-0 transition-all duration-200"
                  />
                </div>
              </Card>

              <Card class="border-border/50 border p-3 transition-all duration-200 hover:shadow-md">
                <div class="space-y-2">
                  <Label class="text-foreground flex items-center gap-2 text-sm font-medium">
                    <div class="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100">
                      <svg
                        class="h-3 w-3 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    Description
                  </Label>
                  <Textarea
                    v-model="selectedElement.description"
                    placeholder="Enter description text"
                    class="bg-muted/50 focus:bg-muted resize-none border-0 transition-all duration-200"
                    rows="3"
                  />
                </div>
              </Card>
            </div>
          </div>

          <!-- Advanced Options -->
          <div>
            <div class="mb-3 flex items-center gap-2">
              <div class="h-2 w-2 animate-pulse rounded-full bg-purple-500"></div>
              <h3 class="text-foreground text-sm font-semibold">Advanced Options</h3>
              <div class="h-px flex-1 bg-gradient-to-r from-purple-500/20 to-transparent"></div>
            </div>
            <div class="space-y-3">
              <Card class="border-border/50 border p-3 transition-all duration-200 hover:shadow-md">
                <div class="flex items-center gap-3">
                  <Checkbox v-model="selectedElement.required" class="h-4 w-4" />
                  <div class="flex-1">
                    <div class="text-foreground text-sm font-medium">Required Field</div>
                    <div class="text-muted-foreground text-xs">Users must fill this field</div>
                  </div>
                  <div
                    v-if="selectedElement.required"
                    class="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600"
                  >
                    <svg class="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    Active
                  </div>
                </div>
              </Card>

              <Card class="border-border/50 border p-3 transition-all duration-200 hover:shadow-md">
                <div class="flex items-center gap-3">
                  <Checkbox v-model="selectedElement.validation" class="h-4 w-4" />
                  <div class="flex-1">
                    <div class="text-foreground text-sm font-medium">Custom Validation</div>
                    <div class="text-muted-foreground text-xs">Add validation rules</div>
                  </div>
                  <div
                    v-if="selectedElement.validation"
                    class="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-600"
                  >
                    <svg class="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    Enabled
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <!-- Options for select/radio/multiselect elements -->
          <div
            v-if="
              ['select', 'radio', 'checkbox-group', 'multiselect'].includes(selectedElement.type)
            "
          >
            <div class="mb-3 flex items-center gap-2">
              <div class="h-2 w-2 animate-pulse rounded-full bg-orange-500"></div>
              <h3 class="text-foreground text-sm font-semibold">Options</h3>
              <div class="h-px flex-1 bg-gradient-to-r from-orange-500/20 to-transparent"></div>
            </div>
            <div class="space-y-3">
              <div v-for="(option, index) in selectedElement.options" :key="index" class="group">
                <Card
                  class="border-border/50 border p-3 transition-all duration-200 hover:shadow-md"
                >
                  <div class="flex items-center gap-2">
                    <div class="flex-1">
                      <Input
                        v-model="selectedElement.options[index]"
                        placeholder="Option text"
                        class="bg-muted/50 focus:bg-muted h-9 border-0 transition-all duration-200"
                      />
                    </div>
                    <Button
                      @click="removeOption(index)"
                      variant="ghost"
                      size="sm"
                      class="text-destructive/70 hover:text-destructive hover:bg-destructive/10 px-2 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:scale-110"
                    >
                      <X class="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              </div>
              <Button
                @click="addOption()"
                variant="outline"
                class="h-9 w-full border-dashed transition-all duration-200 hover:scale-[1.02] hover:border-solid"
              >
                <Plus class="mr-2 h-3.5 w-3.5" />
                Add Option
              </Button>
            </div>
          </div>

          <!-- Actions -->
          <div>
            <div class="mb-3 flex items-center gap-2">
              <div class="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
              <h3 class="text-foreground text-sm font-semibold">Actions</h3>
              <div class="h-px flex-1 bg-gradient-to-r from-red-500/20 to-transparent"></div>
            </div>
            <div class="space-y-3">
              <Card
                class="border-border/50 group cursor-pointer border p-3 transition-all duration-200 hover:shadow-md"
                @click="duplicateElement"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 transition-transform duration-200 group-hover:scale-110"
                  >
                    <Copy class="h-4 w-4 text-blue-600" />
                  </div>
                  <div class="flex-1">
                    <div class="text-foreground text-sm font-medium">Duplicate Element</div>
                    <div class="text-muted-foreground text-xs">Create a copy of this element</div>
                  </div>
                </div>
              </Card>

              <Card
                class="border-border/50 group cursor-pointer border p-3 transition-all duration-200 hover:shadow-md"
                @click="deleteSelectedElement"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 transition-transform duration-200 group-hover:scale-110"
                  >
                    <Trash2 class="h-4 w-4 text-red-600" />
                  </div>
                  <div class="flex-1">
                    <div class="text-foreground text-sm font-medium">Delete Element</div>
                    <div class="text-muted-foreground text-xs">Remove this element permanently</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
