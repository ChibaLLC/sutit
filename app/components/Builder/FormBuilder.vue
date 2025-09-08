<script setup lang="ts">
import { ref } from "vue";
import { AlertTriangle, Plus, StoreIcon, Trash2, X } from "lucide-vue-next";
import type {
  FormField,
  FormSchema,
  PageSchema,
  Store,
  StoreItem,
} from "~~/shared/types";

const previewMode = ref(false);
const isDark = ref(false);
const form = ref<FormSchema>(<FormSchema>{
  title: "",
  description: "",
  pages: [
    {
      title: "Page 1",
      description: "",
      fields: [] as FormField[],
    },
  ] as PageSchema[],
  stores: [] as Store[],
});
const emits = defineEmits<{
  preview: [form: FormSchema];
  "go-back": [];
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

const addStore = () => {
  form.value.stores?.push({
    id: form.value.stores.length + 1,
    name: "Store 1",
    description: "",
    items: [] as StoreItem[],
  });
  currentStore.value = form.value.stores[form.value.stores?.length];
};
const removeStore = (store: Store) => {
  const index = form.value.stores?.indexOf(store);
  if (index !== -1) {
    form.value.stores?.splice(index, 1);
  }
};
const addPage = () => {
  form.value.pages.push({
    id: form.value.pages.length + 1,
    title: "New Page",
    description: "",
    fields: [] as FormField[],
  });
};
const removePage = (index: number) => {
  if (form.value.pages.length === 0) {
    return;
  }
  form.value.pages.splice(index, 1);
};
</script>
<template>
  <div class="min-h-screen bg-background text-foreground p-3">
    <BuilderHeader
      :previewMode="previewMode"
      :isDark="isDark"
      @preview="togglePreviewMode()"
      @go-back="$emit('go-back')"
    />
    <BuilderNavigator>
      <template #pages>
        <div class="flex h-[calc(100vh-120px)]">
          <BuilderPagesFormElements />
          <div class="flex-1 flex">
            <div class="flex-1 flex flex-col">
              <div
                v-if="!previewMode"
                class="border-b bg-card/30 backdrop-blur"
              >
                <div class="flex items-center justify-between p-4">
                  <ScrollArea class="flex-1">
                    <div class="flex items-center gap-2">
                      <div
                        v-for="(page, index) in form.pages || []"
                        :key="page.id || index"
                        class="group relative flex items-center"
                      >
                        <Button
                          @click="currentPage = page"
                          :variant="currentPage === page ? 'default' : 'ghost'"
                          size="sm"
                          class="shrink-0 pr-8"
                          :class="{
                            'bg-primary text-primary-foreground':
                              currentPage === page,
                            'hover:bg-muted': currentPage !== page,
                          }"
                        >
                          {{ page.title || "Untitled Page" }}
                        </Button>

                        <!-- Fixed remove button condition and click handler -->
                        <AlertDialog>
                          <AlertDialogTrigger as-child>
                            <Button
                              v-if="form.pages.length > 1"
                              variant="ghost"
                              size="sm"
                              class="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 rounded-full"
                              @click.stop
                            >
                              <X class="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle class="flex items-center gap-2">
                                <AlertTriangle
                                  class="h-5 w-5 text-destructive"
                                />
                                Remove Page
                              </AlertDialogTitle>
                              <AlertDialogDescription class="text-base">
                                Are you sure you want to remove "{{
                                  page.title || "Untitled Page"
                                }}"? <br /><br />
                                <span class="font-medium text-destructive"
                                  >This action cannot be undone</span
                                >
                                and all form fields on this page will be
                                permanently deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                @click="removePage(index)"
                                class="bg-destructive hover:bg-destructive/90"
                              >
                                <Trash2 class="h-4 w-4 mr-2" />
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
                        class="gap-2 shrink-0 border-dashed hover:border-solid transition-all duration-200 hover:scale-105"
                      >
                        <Plus class="h-3 w-3" />
                        Add Page
                      </Button>
                    </div>
                  </ScrollArea>
                </div>
              </div>

              <div class="flex-1 overflow-auto">
                <BuilderPagesFormCanvas
                  :currentPage="currentPage"
                  :selectedElement="selectedElement"
                  @selectField="(f: FormField) => selectField(f)"
                />
              </div>
            </div>
          </div>
          <div class="w-80 border-l bg-card backdrop-blur-md">
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
          <div class="flex-1 flex flex-col">
            <div class="border-b bg-card/30 backdrop-blur">
              <div class="flex items-center justify-between p-4">
                <div class="flex-1">
                  <h2 class="text-lg font-semibold tracking-tight mb-3">
                    Store Management
                  </h2>
                  <ScrollArea class="w-full">
                    <div class="flex items-center gap-3 pb-2">
                      <div
                        v-for="store in form.stores || []"
                        :key="store.id"
                        class="group relative flex items-center"
                      >
                        <Button
                          @click="currentStore = store"
                          :variant="
                            currentStore === store ? 'default' : 'outline'
                          "
                          size="sm"
                          class="relative pr-10 transition-all duration-200 hover:scale-105"
                          :class="{
                            'bg-primary text-primary-foreground shadow-md':
                              currentStore === store,
                            'hover:bg-accent hover:text-accent-foreground':
                              currentStore !== store,
                          }"
                        >
                          <StoreIcon class="h-4 w-4 mr-2" />
                          {{ store.name || "Untitled Store" }}
                        </Button>

                        <!-- Remove Button -->
                        <AlertDialog>
                          <AlertDialogTrigger as-child>
                            <Button
                              v-if="form.stores?.length > 1"
                              variant="ghost"
                              size="sm"
                              class="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 rounded-full"
                              @click.stop
                            >
                              <X class="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle class="flex items-center gap-2">
                                <AlertTriangle
                                  class="h-5 w-5 text-destructive"
                                />
                                Remove Store
                              </AlertDialogTitle>
                              <AlertDialogDescription class="text-base">
                                Are you sure you want to remove "{{
                                  store.name || "Untitled Store"
                                }}"? <br /><br />
                                <span class="font-medium text-destructive"
                                  >This action cannot be undone</span
                                >
                                and all products and data associated with this
                                store will be permanently deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                @click="removeStore(store)"
                                class="bg-destructive hover:bg-destructive/90"
                              >
                                <Trash2 class="h-4 w-4 mr-2" />
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
                        class="gap-2 shrink-0 border-dashed hover:border-solid transition-all duration-200 hover:scale-105"
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
              <BuilderStoresStoreProducts
                v-if="currentStore"
                :store="currentStore"
              />
              <div
                v-else
                class="flex items-center justify-center h-full text-muted-foreground"
              >
                <div class="text-center">
                  <StoreIcon class="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p class="text-lg font-medium mb-2">No Store Selected</p>
                  <p class="text-sm">
                    Select a store from the tabs above or create a new one
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
            <BuilderSettingsFormSettings :form="form" />
          </div>
        </div>
      </template>
    </BuilderNavigator>
    <BuilderPreviewFormPreview
      :isOpen="previewMode"
      :form="form"
      @close="togglePreviewMode()"
    />
  </div>
</template>
