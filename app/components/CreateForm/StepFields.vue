<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import {
  Plus,
  Trash2,
  GripVertical,
  Type,
  Mail,
  Phone,
  Link,
  AlignLeft,
  List,
  CheckSquare,
  Circle,
  CalendarDays,
  Upload,
  Hash,
  ToggleLeft,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-vue-next";
import type { FormField, PageSchema } from "~~/shared/types";

const props = defineProps<{
  pages: PageSchema[];
}>();

const emit = defineEmits<{
  "update:pages": [pages: PageSchema[]];
}>();

const currentPageIndex = ref(0);
const editingFieldId = ref<string | null>(null);

// local editable refs for the field being edited
const editLabel = ref("");
const editPlaceholder = ref("");

// drag state
const dragOverIndex = ref<number | null>(null);

const currentPage = computed(() => props.pages[currentPageIndex.value]);

const fieldTypes = [
  { category: "Basic", color: "blue", items: [
    { type: "text", label: "Text", icon: Type },
    { type: "email", label: "Email", icon: Mail },
    { type: "phone", label: "Phone", icon: Phone },
    { type: "url", label: "URL", icon: Link },
    { type: "textarea", label: "Textarea", icon: AlignLeft },
    { type: "number", label: "Number", icon: Hash },
  ]},
  { category: "Choice", color: "purple", items: [
    { type: "select", label: "Dropdown", icon: List },
    { type: "multiselect", label: "Multi-Select", icon: CheckSquare },
    { type: "radio", label: "Radio", icon: Circle },
    { type: "checkbox", label: "Checkbox", icon: CheckSquare },
    { type: "toggle", label: "Toggle", icon: ToggleLeft },
  ]},
  { category: "Advanced", color: "green", items: [
    { type: "date", label: "Date", icon: CalendarDays },
    { type: "file", label: "File Upload", icon: Upload },
  ]},
];

// --- helpers ---

const emitPages = (pages: PageSchema[]) => emit("update:pages", pages);

const updateCurrentPage = (updates: Partial<PageSchema>) => {
  const pages = [...props.pages];
  pages[currentPageIndex.value] = { ...pages[currentPageIndex.value], ...updates } as PageSchema;
  emitPages(pages);
};

const makeField = (type: string, label: string, order: number): FormField => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
  type,
  label,
  name: `${type}_${Date.now()}`,
  placeholder: `Enter ${label.toLowerCase()}`,
  required: false,
  orderIndex: order,
  options: ["select", "multiselect", "radio"].includes(type) ? ["Option 1", "Option 2"] : undefined,
});

// --- field CRUD ---

const addField = (type: string, label: string, atIndex?: number) => {
  const page = currentPage.value;
  if (!page) return;
  const fields = [...page.fields];
  const field = makeField(type, label, fields.length + 1);
  if (atIndex != null) {
    fields.splice(atIndex, 0, field);
  } else {
    fields.push(field);
  }
  // re-index
  fields.forEach((f, i) => (f.orderIndex = i + 1));
  updateCurrentPage({ fields });
  editingFieldId.value = field.id;
  syncEditFields(field);
};

const removeField = (fieldId: string) => {
  const page = currentPage.value;
  if (!page) return;
  const fields = page.fields.filter((f) => f.id !== fieldId);
  fields.forEach((f, i) => (f.orderIndex = i + 1));
  updateCurrentPage({ fields });
  if (editingFieldId.value === fieldId) editingFieldId.value = null;
};

const updateField = (fieldId: string, updates: Partial<FormField>) => {
  const page = currentPage.value;
  if (!page) return;
  const fields = page.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f));
  updateCurrentPage({ fields });
};

// --- local editing ---

const syncEditFields = (field: FormField) => {
  editLabel.value = field.label;
  editPlaceholder.value = field.placeholder || "";
};

const startEditing = (field: FormField) => {
  if (editingFieldId.value && editingFieldId.value !== field.id) {
    flushFieldEdit(editingFieldId.value);
  }
  editingFieldId.value = editingFieldId.value === field.id ? null : field.id;
  if (editingFieldId.value) syncEditFields(field);
};

const flushFieldEdit = (fieldId: string) => {
  const page = currentPage.value;
  const field = page?.fields.find((f) => f.id === fieldId);
  if (!field) return;
  const updates: Partial<FormField> = {};
  if (editLabel.value !== field.label) updates.label = editLabel.value;
  if (editPlaceholder.value !== (field.placeholder || "")) updates.placeholder = editPlaceholder.value;
  if (Object.keys(updates).length) updateField(fieldId, updates);
};

// --- options ---

const addOption = (fieldId: string) => {
  const page = currentPage.value;
  const field = page?.fields.find((f) => f.id === fieldId);
  if (!field) return;
  const options = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
  updateField(fieldId, { options });
};

const removeOption = (fieldId: string, optIdx: number) => {
  const page = currentPage.value;
  const field = page?.fields.find((f) => f.id === fieldId);
  if (!field?.options) return;
  updateField(fieldId, { options: field.options.filter((_, i) => i !== optIdx) });
};

const updateOption = (fieldId: string, optIdx: number, value: string) => {
  const page = currentPage.value;
  const field = page?.fields.find((f) => f.id === fieldId);
  if (!field?.options) return;
  const options = [...field.options];
  options[optIdx] = value;
  updateField(fieldId, { options });
};

const hasOptions = (type: string) => ["select", "multiselect", "radio"].includes(type);

// --- pages ---

const addPage = () => {
  const newPage: PageSchema = {
    id: Date.now(),
    title: `Page ${props.pages.length + 1}`,
    description: "",
    fields: [],
    orderIndex: props.pages.length + 1,
  };
  emitPages([...props.pages, newPage]);
  currentPageIndex.value = props.pages.length;
};

const removePage = (index: number) => {
  if (props.pages.length <= 1) return;
  const pages = props.pages.filter((_, i) => i !== index);
  emitPages(pages);
  if (currentPageIndex.value >= pages.length) currentPageIndex.value = pages.length - 1;
};

const updatePageTitle = (index: number, title: string) => {
  const pages = [...props.pages];
  pages[index] = { ...pages[index], title } as PageSchema;
  emitPages(pages);
};

// --- drag from palette (add new field) ---

const handlePaletteDragStart = (event: DragEvent, item: { type: string; label: string }) => {
  event.dataTransfer?.setData("application/json", JSON.stringify({ action: "new", ...item }));
  if (event.dataTransfer) event.dataTransfer.effectAllowed = "copy";
};

// --- drag from canvas (reorder) ---

const handleCanvasDragStart = (event: DragEvent, index: number) => {
  event.dataTransfer?.setData("text/plain", String(index));
  if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
};

const handleDrop = (event: DragEvent, targetIndex: number) => {
  event.preventDefault();
  dragOverIndex.value = null;

  // try palette drop (new field)
  const jsonData = event.dataTransfer?.getData("application/json");
  if (jsonData) {
    try {
      const data = JSON.parse(jsonData);
      if (data.action === "new") {
        addField(data.type, data.label, targetIndex);
        return;
      }
    } catch {}
  }

  // reorder existing field
  const fromIndexStr = event.dataTransfer?.getData("text/plain");
  if (fromIndexStr == null) return;
  const fromIndex = parseInt(fromIndexStr);
  if (isNaN(fromIndex) || fromIndex === targetIndex) return;

  const page = currentPage.value;
  if (!page) return;
  const fields = [...page.fields];
  const [moved] = fields.splice(fromIndex, 1);
  fields.splice(targetIndex, 0, moved);
  fields.forEach((f, i) => (f.orderIndex = i + 1));
  updateCurrentPage({ fields });
};

const handleDragOver = (event: DragEvent, index: number) => {
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
  dragOverIndex.value = index;
};

const handleDragLeave = () => {
  dragOverIndex.value = null;
};

// drop at end of list
const handleDropAtEnd = (event: DragEvent) => {
  event.preventDefault();
  dragOverIndex.value = null;

  const jsonData = event.dataTransfer?.getData("application/json");
  if (jsonData) {
    try {
      const data = JSON.parse(jsonData);
      if (data.action === "new") {
        addField(data.type, data.label);
        return;
      }
    } catch {}
  }

  const fromIndexStr = event.dataTransfer?.getData("text/plain");
  if (fromIndexStr == null) return;
  const fromIndex = parseInt(fromIndexStr);
  const page = currentPage.value;
  if (!page || isNaN(fromIndex)) return;
  const fields = [...page.fields];
  const [moved] = fields.splice(fromIndex, 1);
  fields.push(moved);
  fields.forEach((f, i) => (f.orderIndex = i + 1));
  updateCurrentPage({ fields });
};

const colorClasses: Record<string, string> = {
  blue: "bg-blue-100 text-blue-600",
  purple: "bg-purple-100 text-purple-600",
  green: "bg-green-100 text-green-600",
};
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <div class="text-center space-y-2 mb-8">
      <h2 class="text-2xl font-bold tracking-tight">Build your form</h2>
      <p class="text-muted-foreground">Drag or click field types to add them</p>
    </div>

    <div class="flex gap-6">
      <!-- Field Type Palette -->
      <div class="w-56 shrink-0 space-y-4">
        <div v-for="category in fieldTypes" :key="category.category">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-2 h-2 rounded-full animate-pulse" :class="`bg-${category.color}-500`" />
            <h3 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {{ category.category }}
            </h3>
          </div>
          <div class="grid gap-1.5">
            <div
              v-for="item in category.items"
              :key="item.type"
              draggable="true"
              @dragstart="handlePaletteDragStart($event, item)"
              @click="addField(item.type, item.label)"
              class="flex items-center gap-2.5 p-2 rounded-lg border border-border/50 bg-card hover:bg-muted/50 hover:border-border transition-all text-left text-sm group cursor-grab active:cursor-grabbing"
            >
              <div
                class="w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                :class="colorClasses[category.color]"
              >
                <component :is="item.icon" class="w-3.5 h-3.5" />
              </div>
              <span class="font-medium">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Canvas -->
      <div class="flex-1 min-w-0">
        <!-- Page Tabs -->
        <div class="flex items-center gap-2 mb-4">
          <div class="flex items-center gap-1 overflow-x-auto flex-1">
            <div
              v-for="(page, index) in pages"
              :key="page.id || index"
              class="group relative flex items-center"
            >
              <button
                @click="currentPageIndex = index"
                class="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all"
                :class="[
                  currentPageIndex === index
                    ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                ]"
              >
                <input
                  v-if="currentPageIndex === index"
                  :value="page.title"
                  @input="updatePageTitle(index, ($event.target as HTMLInputElement).value)"
                  @click.stop
                  class="bg-transparent outline-none w-20 text-inherit font-medium"
                />
                <span v-else>{{ page.title }}</span>
              </button>
              <button
                v-if="pages.length > 1"
                @click.stop="removePage(index)"
                class="absolute -right-1.5 -top-1.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X class="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
          <Button variant="outline" size="sm" @click="addPage" class="shrink-0 border-dashed">
            <Plus class="w-3.5 h-3.5 mr-1" />
            Page
          </Button>
        </div>

        <!-- Fields List -->
        <div class="space-y-2 min-h-[300px]">
          <template v-if="currentPage?.fields.length">
            <div
              v-for="(field, index) in currentPage.fields"
              :key="field.id"
              draggable="true"
              @dragstart="handleCanvasDragStart($event, index)"
              @dragover="handleDragOver($event, index)"
              @dragleave="handleDragLeave"
              @drop="handleDrop($event, index)"
              class="transition-all"
            >
              <!-- drop indicator line -->
              <div
                v-if="dragOverIndex === index"
                class="h-1 bg-primary rounded-full mb-1 transition-all"
              />

              <Card
                class="group transition-all"
                :class="[
                  editingFieldId === field.id
                    ? 'border-primary ring-1 ring-primary/20 shadow-md'
                    : 'hover:border-primary/30 hover:shadow-sm'
                ]"
              >
                <CardContent class="p-4">
                  <!-- Field Header -->
                  <div
                    class="flex items-center gap-3 cursor-pointer"
                    @click="startEditing(field)"
                  >
                    <GripVertical class="w-4 h-4 text-muted-foreground/30 shrink-0 cursor-grab active:cursor-grabbing" />
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="font-medium text-sm">{{ field.label }}</span>
                        <Badge variant="secondary" class="text-[10px] px-1.5 py-0">
                          {{ field.type }}
                        </Badge>
                        <Badge v-if="field.required" variant="destructive" class="text-[10px] px-1.5 py-0">
                          Required
                        </Badge>
                      </div>
                      <p v-if="field.placeholder" class="text-xs text-muted-foreground truncate mt-0.5">
                        {{ field.placeholder }}
                      </p>
                    </div>
                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        class="h-7 w-7 p-0"
                        @click.stop="startEditing(field)"
                      >
                        <ChevronDown v-if="editingFieldId !== field.id" class="w-3.5 h-3.5" />
                        <ChevronUp v-else class="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        class="h-7 w-7 p-0 hover:text-destructive"
                        @click.stop="removeField(field.id)"
                      >
                        <Trash2 class="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <!-- Field Editor (expanded) -->
                  <Transition
                    enter-active-class="transition-all duration-200"
                    enter-from-class="opacity-0 max-h-0"
                    enter-to-class="opacity-100 max-h-[600px]"
                    leave-active-class="transition-all duration-150"
                    leave-from-class="opacity-100 max-h-[600px]"
                    leave-to-class="opacity-0 max-h-0"
                  >
                    <div v-if="editingFieldId === field.id" class="mt-4 pt-4 border-t space-y-4 overflow-hidden">
                      <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1.5">
                          <Label class="text-xs">Label</Label>
                          <Input v-model="editLabel" class="h-9 text-sm" />
                        </div>
                        <div class="space-y-1.5">
                          <Label class="text-xs">Placeholder</Label>
                          <Input v-model="editPlaceholder" class="h-9 text-sm" />
                        </div>
                      </div>

                      <div class="flex items-center gap-2">
                        <Switch
                          :checked="field.required"
                          @update:checked="(val: boolean) => updateField(field.id, { required: val })"
                        />
                        <Label class="text-xs">Required</Label>
                      </div>

                      <!-- Options for select/radio/multiselect -->
                      <div v-if="hasOptions(field.type)" class="space-y-2">
                        <Label class="text-xs">Options</Label>
                        <div class="space-y-1.5">
                          <div
                            v-for="(option, optIndex) in field.options || []"
                            :key="optIndex"
                            class="flex items-center gap-2"
                          >
                            <Input
                              :value="option"
                              @input="updateOption(field.id, optIndex, ($event.target as HTMLInputElement).value)"
                              class="h-8 text-sm"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              class="h-8 w-8 p-0 shrink-0 hover:text-destructive"
                              @click="removeOption(field.id, optIndex)"
                            >
                              <X class="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" class="text-xs h-7" @click="addOption(field.id)">
                          <Plus class="w-3 h-3 mr-1" />
                          Add option
                        </Button>
                      </div>
                    </div>
                  </Transition>
                </CardContent>
              </Card>
            </div>
          </template>

          <!-- Empty State / Drop zone at end -->
          <div
            @dragover.prevent="dragOverIndex = (currentPage?.fields.length ?? 0)"
            @dragleave="dragOverIndex = null"
            @drop="handleDropAtEnd"
            class="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl transition-colors"
            :class="dragOverIndex === (currentPage?.fields.length ?? 0) ? 'border-primary bg-primary/5' : ''"
          >
            <template v-if="!currentPage?.fields.length">
              <div class="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-4">
                <Plus class="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 class="font-semibold mb-1">No fields yet</h3>
              <p class="text-sm text-muted-foreground">
                Drag or click a field type to add it
              </p>
            </template>
            <template v-else>
              <p class="text-sm text-muted-foreground">Drop here to add at end</p>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
