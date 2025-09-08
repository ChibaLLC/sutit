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
    type: "radio",
    label: "Radio Group",
    icon: Circle,
    description: "Single choice from options",
  },
  {
    type: "checkbox",
    label: "Checkbox",
    icon: CheckSquare,
    description: "Multiple selections",
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
const handleDragStart = (event, element) => {
  event.dataTransfer.setData("application/json", JSON.stringify(element));
};
</script>
<template>
  <div class="w-80 border-l bg-card/30 backdrop-blur">
    <div class="p-4 border-b">
      <h3 class="font-semibold text-sm">Form Elements</h3>
      <p class="text-xs text-muted-foreground mt-1">
        Drag elements to the form canvas
      </p>
    </div>

    <ScrollArea class="h-full p-4">
      <!-- Enhanced form elements library with better categorization -->
      <div class="space-y-6">
        <div>
          <h4
            class="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-3"
          >
            Basic Inputs
          </h4>
          <div class="grid gap-2">
            <div
              v-for="element in basicElements"
              :key="element.type"
              :draggable="true"
              @dragstart="handleDragStart($event, element)"
              class="group cursor-move"
            >
              <Card
                class="p-3 hover:bg-accent transition-colors border-dashed hover:border-solid"
              >
                <div class="flex items-center gap-3">
                  <div class="rounded-md bg-primary/10 p-2">
                    <component
                      :is="element.icon"
                      class="h-4 w-4 text-primary"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-sm">{{ element.label }}</p>
                    <p class="text-xs text-muted-foreground truncate">
                      {{ element.description }}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div>
          <h4
            class="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-3"
          >
            Selection
          </h4>
          <div class="grid gap-2">
            <div
              v-for="element in selectionElements"
              :key="element.type"
              :draggable="true"
              @dragstart="handleDragStart($event, element)"
              class="group cursor-move"
            >
              <Card
                class="p-3 hover:bg-accent transition-colors border-dashed hover:border-solid"
              >
                <div class="flex items-center gap-3">
                  <div class="rounded-md bg-primary/10 p-2">
                    <component
                      :is="element.icon"
                      class="h-4 w-4 text-primary"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-sm">{{ element.label }}</p>
                    <p class="text-xs text-muted-foreground truncate">
                      {{ element.description }}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div>
          <h4
            class="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-3"
          >
            Advanced
          </h4>
          <div class="grid gap-2">
            <div
              v-for="element in advancedElements"
              :key="element.type"
              :draggable="true"
              @dragstart="handleDragStart($event, element)"
              class="group cursor-move"
            >
              <Card
                class="p-3 hover:bg-accent transition-colors border-dashed hover:border-solid"
              >
                <div class="flex items-center gap-3">
                  <div class="rounded-md bg-primary/10 p-2">
                    <component
                      :is="element.icon"
                      class="h-4 w-4 text-primary"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-sm">{{ element.label }}</p>
                    <p class="text-xs text-muted-foreground truncate">
                      {{ element.description }}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  </div>
</template>
