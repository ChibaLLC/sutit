<script setup lang="ts">
  import {
    AlertTriangle,
    Plus,
    StoreIcon,
    Trash2,
    X,
    AlertCircle,
    CheckCircle,
    Info,
    ChevronRight,
  } from "lucide-vue-next";
  import { ref, computed } from "vue";
  import { toast } from "vue-sonner";
  import type { FormField, FormSchema, PageSchema, Store, StoreItem } from "~~/shared/types";
  import { formSchemaSchema } from "~~/shared/utils/form.schema";
  const props = defineProps<{
    form?: FormSchema;
  }>();
  const previewMode = ref(false);
  const isDark = ref(false);

  const form = ref<FormSchema>(
    props.form
      ? props.form
      : <FormSchema>{
          title: "",
          description: "",
          pages: [
            {
              title: "Page 1",
              description: "",
              fields: [] as FormField[],
              orderIndex: 1,
            },
          ] as PageSchema[],
          stores: [] as Store[],
          tags: [] as string[],
          price: 0,
          status: "draft", // could be "draft" | "published" depending on your app
          requireMerch: false,
          allowGroups: false,
          calculateTat: false,
          groupAmountPayable: 0,
          groupMemberLimit: 0,
          infoPromptMessage: "",
          allowMultipleSubmissions: false,
          allowRegistrationReuse: false,
          submissionLimit: null,
          publishedAt: "",
          isPublic: false,
          requiresLogin: false,
          slug: "",
          afterSubmissionMessage: "",
        },
  );
  const emits = defineEmits<{
    preview: [form: FormSchema];
    "go-back": [];
    publish: [form: FormSchema];
  }>();
  const currentPage = ref(form.value.pages[0]);
  const currentStore = ref(null);
  const selectedElement = ref<FormField | null>(null);

  const togglePreviewMode = () => {
    previewMode.value = !previewMode.value;
  };
  const selectField = (field: FormField) => {
    selectedElement.value = field;
  };

  const addStore = (): void => {
    const newStore: Store = {
      id: Date.now(), // Use timestamp for unique ID
      name: `Store ${(form.value.stores?.length || 0) + 1}`,
      description: "",
      items: [] as StoreItem[],
    };
    form.value.stores?.push(newStore);
    currentStore.value = newStore;
  };

  const removeStore = (store: Store): void => {
    if (!form.value.stores) return;
    const index = form.value.stores.indexOf(store);
    if (index !== -1) {
      form.value.stores.splice(index, 1);
      // Reset current store if the removed store was selected
      if (currentStore.value === store) {
        currentStore.value = form.value.stores.length > 0 ? form.value.stores[0] : null;
      }
    }
  };

  const addPage = (): void => {
    const newPage: PageSchema = {
      id: Date.now(),
      title: `Page ${form.value.pages.length + 1}`,
      description: "",
      fields: [] as FormField[],
      orderIndex: form.value.pages.length + 1,
    };
    form.value.pages.push(newPage);
    currentPage.value = newPage;
  };

  const removePage = (index: number): void => {
    if (form.value.pages.length <= 1) {
      toast.error("Cannot remove the last page");
      return;
    }
    const removedPage = form.value.pages[index];
    form.value.pages.splice(index, 1);
    // Switch to another page if the current page was removed
    if (currentPage.value === removedPage) {
      currentPage.value = form.value.pages[Math.min(index, form.value.pages.length - 1)];
    }
  };
  const validationErrors = ref<{ field: string; message: string }[]>([]);
  const isSubmitting = ref(false);

  interface ValidationIssue {
    path: (string | number)[];
    message: string;
    code: string;
  }

  const formatValidationErrors = (
    issues: ValidationIssue[],
  ): { field: string; message: string }[] => {
    const errors: { field: string; message: string }[] = [];
    const seenFields = new Set<string>();

    for (const issue of issues) {
      const fieldPath = issue.path.join(".");
      let fieldName = fieldPath;
      let message = issue.message;

      // Map technical paths to user-friendly names
      if (fieldPath === "title") {
        fieldName = "Form Title";
      } else if (fieldPath === "slug") {
        fieldName = "URL Slug";
      } else if (fieldPath === "status") {
        fieldName = "Form Status";
      } else if (fieldPath.startsWith("pages")) {
        const pageMatch = fieldPath.match(/pages\.(\d+)/);
        if (pageMatch) {
          const pageIndex = parseInt(pageMatch[1]) + 1;
          fieldName = `Page ${pageIndex}`;
          if (fieldPath.includes("title")) {
            fieldName += " Title";
          } else if (fieldPath.includes("fields")) {
            fieldName += " Fields";
          }
        }
      } else if (fieldPath.startsWith("stores")) {
        const storeMatch = fieldPath.match(/stores\.(\d+)/);
        if (storeMatch) {
          const storeIndex = parseInt(storeMatch[1]) + 1;
          fieldName = `Store ${storeIndex}`;
          if (fieldPath.includes("items")) {
            fieldName += " Products";
          }
        }
      }

      // Create unique key for deduplication
      const uniqueKey = `${fieldName}:${message}`;
      if (!seenFields.has(uniqueKey)) {
        seenFields.add(uniqueKey);
        errors.push({
          field: fieldName,
          message: message,
        });
      }
    }

    return errors;
  };

  const validateForm = (): boolean => {
    validationErrors.value = [];

    const result = formSchemaSchema.safeParse(form.value);
    if (!result.success) {
      validationErrors.value = formatValidationErrors(result.error.issues as ValidationIssue[]);

      // Show grouped error toast
      const errorCount = validationErrors.value.length;
      toast.error(`Validation failed: ${errorCount} issue${errorCount > 1 ? "s" : ""} found`, {
        description: validationErrors.value
          .slice(0, 3)
          .map((e) => `• ${e.field}: ${e.message}`)
          .join("\n"),
        duration: 8000,
      });

      return false;
    }

    return true;
  };

  const submit = async () => {
    if (isSubmitting.value) return;

    // Clear previous errors
    validationErrors.value = [];

    // Run validation
    if (!validateForm()) {
      return;
    }

    isSubmitting.value = true;

    try {
      emits("publish", form.value);
      toast.success("Form submitted successfully!", {
        description: "Redirecting to your form...",
      });
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast.error("Failed to submit form", {
        description: error?.message || "An unexpected error occurred",
      });
    } finally {
      isSubmitting.value = false;
    }
  };

  const handleSettingsUpdate = (updatedForm: FormSchema) => {
    // Merge the updated settings into the current form
    Object.assign(form.value, updatedForm);
    toast.success("Form settings updated");
  };
</script>
<template>
  <div class="bg-background text-foreground min-h-screen p-3">
    <!-- Validation Errors Panel -->
    <div v-if="validationErrors.length > 0" class="fixed top-20 right-4 z-50 w-96 max-w-[90vw]">
      <Card class="border-destructive/50 shadow-lg">
        <CardHeader class="pb-3">
          <div class="flex items-center gap-2">
            <AlertCircle class="text-destructive h-5 w-5" />
            <CardTitle class="text-base">Validation Errors</CardTitle>
            <span
              class="bg-destructive/10 text-destructive ml-auto rounded-full px-2 py-0.5 text-xs"
            >
              {{ validationErrors.length }}
            </span>
          </div>
          <CardDescription> Please fix the following issues before publishing </CardDescription>
        </CardHeader>
        <CardContent class="max-h-60 space-y-2 overflow-y-auto">
          <div
            v-for="(error, index) in validationErrors"
            :key="index"
            class="bg-destructive/5 flex items-start gap-2 rounded-lg p-2 text-sm"
          >
            <ChevronRight class="text-destructive mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <span class="font-medium">{{ error.field }}</span>
              <p class="text-muted-foreground">{{ error.message }}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter class="border-t pt-3">
          <Button variant="outline" size="sm" class="w-full" @click="validationErrors = []">
            Dismiss
          </Button>
        </CardFooter>
      </Card>
    </div>

    <BuilderHeader
      :previewMode="previewMode"
      :isDark="isDark"
      :isSubmitting="isSubmitting"
      :validationErrors="validationErrors"
      @preview="togglePreviewMode()"
      @go-back="$emit('go-back')"
      @publish="submit"
    />
    <BuilderNavigator>
      <template #pages>
        <div class="flex h-[calc(100vh-120px)] space-x-2">
          <BuilderPagesFormElements />
          <div class="flex flex-1">
            <div class="flex flex-1 flex-col overflow-y-auto">
              <Card>
                <CardHeader>
                  <div
                    v-if="!previewMode"
                    class="from-background via-background to-muted/20 border-b bg-gradient-to-r backdrop-blur-xl"
                  >
                    <div class="flex items-center justify-between p-6">
                      <ScrollArea class="flex-1">
                        <div class="flex items-center gap-3">
                          <div
                            v-for="(page, index) in form.pages || []"
                            :key="page.id || index"
                            class="group relative flex items-center"
                          >
                            <Button
                              @click="currentPage = page"
                              :variant="currentPage === page ? 'default' : 'ghost'"
                              size="sm"
                              class="h-10 shrink-0 px-4 pr-10 transition-all duration-200 hover:scale-105"
                              :class="{
                                'from-primary to-primary/90 text-primary-foreground bg-gradient-to-r shadow-lg':
                                  currentPage === page,
                                'hover:bg-muted/80 hover:text-foreground border-border/30 border':
                                  currentPage !== page,
                              }"
                            >
                              <div class="flex items-center gap-2">
                                <div
                                  class="bg-primary-foreground/20 flex h-5 w-5 items-center justify-center rounded-full"
                                >
                                  <span class="text-xs font-bold">{{ index + 1 }}</span>
                                </div>
                                {{ page.title || "Untitled Page" }}
                              </div>
                            </Button>

                            <!-- Fixed remove button condition and click handler -->
                            <AlertDialog>
                              <AlertDialogTrigger as-child>
                                <Button
                                  v-if="form.pages.length > 1"
                                  variant="ghost"
                                  size="sm"
                                  class="hover:bg-destructive hover:text-destructive-foreground absolute top-1/2 right-1 h-5 w-5 -translate-y-1/2 rounded-full p-0 opacity-0 transition-all duration-200 group-hover:opacity-100"
                                  @click.stop
                                >
                                  <X class="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle class="flex items-center gap-2">
                                    <AlertTriangle class="text-destructive h-5 w-5" />
                                    Remove Page
                                  </AlertDialogTitle>
                                  <AlertDialogDescription class="text-base">
                                    Are you sure you want to remove "{{
                                      page.title || "Untitled Page"
                                    }}"? <br /><br />
                                    <span class="text-destructive font-medium"
                                      >This action cannot be undone</span
                                    >
                                    and all form fields on this page will be permanently deleted.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    @click="removePage(index)"
                                    class="bg-destructive hover:bg-destructive/90"
                                  >
                                    <Trash2 class="mr-2 h-4 w-4" />
                                    Remove Page
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            @click="addPage()"
                            class="hover:bg-primary/5 h-10 shrink-0 gap-2 border-dashed px-4 transition-all duration-200 hover:scale-105 hover:border-solid"
                          >
                            <Plus class="h-4 w-4" />
                            Add Page
                          </Button>
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </CardHeader>
                <CardContent class="overflow-y-auto">
                  <div class="flex-1 overflow-y-auto">
                    <BuilderPagesFormCanvas
                      :currentPage="currentPage"
                      :selectedElement="selectedElement"
                      @selectField="(f: FormField) => selectField(f)"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div class="bg-card w-80 overflow-y-auto border-l backdrop-blur-md">
            <BuilderPagesFormProperties
              v-if="selectedElement"
              :currentPage="currentPage"
              :selectedElement="selectedElement"
            />
          </div>
        </div>
      </template>
      <template #stores>
        <!-- Improved store section layout and styling -->
        <div class="flex h-[calc(100vh-120px)]">
          <div class="flex flex-1 flex-col">
            <div
              class="from-background via-background to-muted/20 border-b bg-gradient-to-r backdrop-blur-xl"
            >
              <div class="flex items-center justify-between p-6">
                <div class="flex-1">
                  <div class="mb-4 flex items-center gap-3">
                    <div
                      class="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg"
                    >
                      <StoreIcon class="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h2 class="text-lg font-bold tracking-tight">Store Management</h2>
                      <p class="text-muted-foreground text-sm">Manage your product stores</p>
                    </div>
                  </div>
                  <ScrollArea class="w-full">
                    <div class="flex items-center gap-3 pb-2">
                      <div
                        v-for="store in form.stores || []"
                        :key="store.id"
                        class="group relative flex items-center"
                      >
                        <Button
                          @click="currentStore = store"
                          :variant="currentStore === store ? 'default' : 'outline'"
                          size="sm"
                          class="relative h-10 px-4 pr-12 transition-all duration-200 hover:scale-105"
                          :class="{
                            'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg':
                              currentStore === store,
                            'hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700':
                              currentStore !== store,
                          }"
                        >
                          <StoreIcon class="mr-2 h-4 w-4" />
                          {{ store.name || "Untitled Store" }}
                        </Button>

                        <!-- Remove Button -->
                        <AlertDialog>
                          <AlertDialogTrigger as-child>
                            <Button
                              v-if="form.stores?.length > 1"
                              variant="ghost"
                              size="sm"
                              class="hover:bg-destructive hover:text-destructive-foreground absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 rounded-full p-0 opacity-0 transition-all duration-200 group-hover:opacity-100"
                              @click.stop
                            >
                              <X class="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle class="flex items-center gap-2">
                                <AlertTriangle class="text-destructive h-5 w-5" />
                                Remove Store
                              </AlertDialogTitle>
                              <AlertDialogDescription class="text-base">
                                Are you sure you want to remove "{{
                                  store.name || "Untitled Store"
                                }}"? <br /><br />
                                <span class="text-destructive font-medium"
                                  >This action cannot be undone</span
                                >
                                and all products and data associated with this store will be
                                permanently deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                @click="removeStore(store)"
                                class="bg-destructive hover:bg-destructive/90"
                              >
                                <Trash2 class="mr-2 h-4 w-4" />
                                Remove Store
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        @click="addStore()"
                        class="h-10 shrink-0 gap-2 border-dashed px-4 transition-all duration-200 hover:scale-105 hover:border-solid hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
                      >
                        <Plus class="h-4 w-4" />
                        Add Store
                      </Button>
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>

            <!-- Improved store content layout -->
            <div class="flex-1 overflow-auto p-6">
              <BuilderStoresStoreProducts v-if="currentStore" :store="currentStore" />
              <div v-else class="flex h-full items-center justify-center">
                <div class="max-w-md text-center">
                  <div
                    class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200"
                  >
                    <StoreIcon class="h-10 w-10 text-purple-600" />
                  </div>
                  <h3 class="text-foreground mb-3 text-xl font-bold">No Store Selected</h3>
                  <p class="text-muted-foreground leading-relaxed">
                    Select a store from the tabs above or create a new one to start managing your
                    products
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #settings>
        <div class="flex h-[calc(100vh-120px)]">
          <div class="flex-1 overflow-auto">
            <BuilderSettingsFormSettings
              :form="form"
              @update="(updatedForm) => handleSettingsUpdate(updatedForm)"
            />
          </div>
        </div>
      </template>
    </BuilderNavigator>
    <BuilderPreviewFormPreview :isOpen="previewMode" :form="form" @close="togglePreviewMode()" />
  </div>
</template>
