<script setup lang="ts">
import {
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
} from "lucide-vue-next";

const basicElements = [
  {
    type: "text",
    label: "Text Input",
    icon: Type,
    description: "Single line text input",
  },
  {
    type: "email",
    label: "Email",
    icon: Mail,
    description: "Email address input",
  },
  {
    type: "phone",
    label: "Phone",
    icon: Phone,
    description: "Phone number input",
  },
  { type: "url", label: "URL", icon: Link, description: "Website URL input" },
  {
    type: "textarea",
    label: "Textarea",
    icon: AlignLeft,
    description: "Multi-line text input",
  },
  {
    type: "number",
    label: "Number",
    icon: Hash,
    description: "Numeric input field",
  },
];

const selectionElements = [
  {
    type: "select",
    label: "Dropdown",
    icon: List,
    description: "Single selection dropdown",
  },
  {
    type: "multiselect",
    label: "Multi-Select",
    icon: CheckSquare,
    description: "Multiple selections from options",
  },
  {
    type: "radio",
    label: "Radio Group",
    icon: Circle,
    description: "Single choice from options",
  },
  {
    type: "checkbox",
    label: "Checkbox",
    icon: CheckSquare,
    description: "Yes/No choice",
  },
  {
    type: "toggle",
    label: "Toggle",
    icon: ToggleLeft,
    description: "On/off switch",
  },
];

const advancedElements = [
  {
    type: "date",
    label: "Date Picker",
    icon: CalendarDays,
    description: "Date selection input",
  },
  {
    type: "file",
    label: "File Upload",
    icon: Upload,
    description: "File attachment input",
  },
];
const handleDragStart = (event: DragEvent, element: any) => {
  event.dataTransfer?.setData("application/json", JSON.stringify(element));
};
</script>
<template>
  <Card>
    <CardHeader>
      <CardTitle>Form Elements</CardTitle>
      <CardDescription>Drag to build your Form</CardDescription>
    </CardHeader>
    <CardContent class="overflow-y-auto">
      <div class="space-y-6">
        <!-- Basic Inputs -->
        <div>
          <div class="flex items-center gap-2 mb-3">
            <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <h3 class="text-sm font-semibold text-foreground">Basic Inputs</h3>
            <div
              class="h-px bg-gradient-to-r from-blue-500/20 to-transparent flex-1"
            ></div>
          </div>
          <div class="grid gap-2">
            <div
              v-for="element in basicElements"
              :key="element.type"
              :draggable="true"
              @dragstart="handleDragStart($event, element)"
              class="group cursor-move transform transition-all duration-200 hover:scale-[1.02]"
            >
              <Card
                class="p-3 hover:shadow-md transition-all duration-200 border border-border/50 hover:border-blue-200 hover:bg-blue-50/30"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                  >
                    <component
                      :is="element.icon"
                      class="h-4 w-4 text-blue-600"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-sm text-foreground">
                      {{ element.label }}
                    </p>
                    <p class="text-xs text-muted-foreground truncate">
                      {{ element.description }}
                    </p>
                  </div>
                  <div
                    class="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <svg
                      class="w-4 h-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0m1 0V11m0-5.5a1.5 1.5 0 013 0"
                      />
                    </svg>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <!-- Selection Elements -->
        <div>
          <div class="flex items-center gap-2 mb-3">
            <div class="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <h3 class="text-sm font-semibold text-foreground">Selection</h3>
            <div
              class="h-px bg-gradient-to-r from-purple-500/20 to-transparent flex-1"
            ></div>
          </div>
          <div class="grid gap-2">
            <div
              v-for="element in selectionElements"
              :key="element.type"
              :draggable="true"
              @dragstart="handleDragStart($event, element)"
              class="group cursor-move transform transition-all duration-200 hover:scale-[1.02]"
            >
              <Card
                class="p-3 hover:shadow-md transition-all duration-200 border border-border/50 hover:border-purple-200 hover:bg-purple-50/30"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                  >
                    <component
                      :is="element.icon"
                      class="h-4 w-4 text-purple-600"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-sm text-foreground">
                      {{ element.label }}
                    </p>
                    <p class="text-xs text-muted-foreground truncate">
                      {{ element.description }}
                    </p>
                  </div>
                  <div
                    class="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <svg
                      class="w-4 h-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <!-- Advanced Elements -->
        <div>
          <div class="flex items-center gap-2 mb-3">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h3 class="text-sm font-semibold text-foreground">Advanced</h3>
            <div
              class="h-px bg-gradient-to-r from-green-500/20 to-transparent flex-1"
            ></div>
          </div>
          <div class="grid gap-2">
            <div
              v-for="element in advancedElements"
              :key="element.type"
              :draggable="true"
              @dragstart="handleDragStart($event, element)"
              class="group cursor-move transform transition-all duration-200 hover:scale-[1.02]"
            >
              <Card
                class="p-3 hover:shadow-md transition-all duration-200 border border-border/50 hover:border-green-200 hover:bg-green-50/30"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                  >
                    <component
                      :is="element.icon"
                      class="h-4 w-4 text-green-600"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-sm text-foreground">
                      {{ element.label }}
                    </p>
                    <p class="text-xs text-muted-foreground truncate">
                      {{ element.description }}
                    </p>
                  </div>
                  <div
                    class="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <svg
                      class="w-4 h-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                    </svg>
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
