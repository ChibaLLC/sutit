<script setup lang="ts">
  import Link from "@tiptap/extension-link";
  import Placeholder from "@tiptap/extension-placeholder";
  import StarterKit from "@tiptap/starter-kit";
  import { EditorContent, useEditor } from "@tiptap/vue-3";
  import {
    Bold,
    Italic,
    Strikethrough,
    List,
    ListOrdered,
    Heading2,
    Heading3,
    TextQuote,
    Link2,
    RemoveFormatting,
    Undo2,
    Redo2,
  } from "lucide-vue-next";
  import { onBeforeUnmount, watch } from "vue";
  import { descriptionHtml } from "~~/shared/utils/description";

  const model = defineModel<string>({ default: "" });
  const props = defineProps<{
    id?: string;
    placeholder?: string;
    disabled?: boolean;
    autofocus?: boolean;
    compact?: boolean;
    hint?: string;
    hideHint?: boolean;
  }>();

  const editor = useEditor({
    immediatelyRender: false,
    autofocus: props.autofocus ?? false,
    editable: !props.disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      Placeholder.configure({
        placeholder:
          props.placeholder ?? "Describe your form… Add instructions, schedules, or what to bring.",
      }),
    ],
    content: descriptionHtml(model.value),
    editorProps: {
      attributes: {
        id: props.id || "form-description",
        role: "textbox",
        "aria-label": "Form description",
        "aria-multiline": "true",
        class: props.compact
          ? "form-rich-text form-editor-content min-h-20 px-3 py-2 text-sm outline-none"
          : "form-rich-text form-editor-content min-h-40 px-4 py-3 text-sm outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      model.value = editor.isEmpty ? "" : editor.getHTML();
    },
  });

  watch(model, (value) => {
    if (editor.value && value !== editor.value.getHTML())
      editor.value.commands.setContent(descriptionHtml(value), { emitUpdate: false });
  });

  watch(
    () => props.disabled,
    (disabled) => editor.value?.setEditable(!disabled),
  );

  onBeforeUnmount(() => {
    editor.value?.destroy();
  });

  const setLink = () => {
    const ed = editor.value;
    if (!ed) return;
    if (ed.isActive("link")) {
      ed.chain().focus().unsetLink().run();
      return;
    }
    const previous = ed.getAttributes("link").href ?? "";
    const url = window.prompt("Link URL (https://…)", previous);
    if (url === null) return; // cancelled
    if (url.trim() === "") {
      ed.chain().focus().unsetLink().run();
      return;
    }
    ed.chain().focus().setLink({ href: url.trim() }).run();
  };

  const isActive = (name: string, attrs?: Record<string, unknown>) =>
    editor.value?.isActive(name, attrs) ?? false;
</script>

<template>
  <div
    class="border-input bg-background focus-within:ring-ring overflow-hidden rounded-xl border transition-shadow focus-within:ring-2"
  >
    <div
      class="bg-muted/40 flex flex-wrap items-center gap-0.5 border-b p-1.5"
      role="toolbar"
      aria-label="Description formatting"
    >
      <Button
        type="button"
        size="icon"
        class="h-8 w-8"
        :variant="isActive('bold') ? 'secondary' : 'ghost'"
        :aria-label="'Bold'"
        title="Bold (Ctrl+B)"
        :aria-pressed="isActive('bold')"
        @click="editor?.chain().focus().toggleBold().run()"
      >
        <Bold class="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        class="h-8 w-8"
        :variant="isActive('italic') ? 'secondary' : 'ghost'"
        aria-label="Italic"
        title="Italic (Ctrl+I)"
        :aria-pressed="isActive('italic')"
        @click="editor?.chain().focus().toggleItalic().run()"
      >
        <Italic class="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        class="h-8 w-8"
        :variant="isActive('strike') ? 'secondary' : 'ghost'"
        aria-label="Strikethrough"
        title="Strikethrough"
        :aria-pressed="isActive('strike')"
        @click="editor?.chain().focus().toggleStrike().run()"
      >
        <Strikethrough class="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" class="mx-1 h-6" />

      <Button
        type="button"
        size="icon"
        class="h-8 w-8"
        :variant="isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'"
        aria-label="Heading"
        title="Heading"
        :aria-pressed="isActive('heading', { level: 2 })"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        <Heading2 class="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        class="h-8 w-8"
        :variant="isActive('heading', { level: 3 }) ? 'secondary' : 'ghost'"
        aria-label="Subheading"
        title="Subheading"
        :aria-pressed="isActive('heading', { level: 3 })"
        @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        <Heading3 class="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        class="h-8 w-8"
        :variant="isActive('blockquote') ? 'secondary' : 'ghost'"
        aria-label="Quote"
        title="Quote"
        :aria-pressed="isActive('blockquote')"
        @click="editor?.chain().focus().toggleBlockquote().run()"
      >
        <TextQuote class="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" class="mx-1 h-6" />

      <Button
        type="button"
        size="icon"
        class="h-8 w-8"
        :variant="isActive('bulletList') ? 'secondary' : 'ghost'"
        aria-label="Bullet list"
        title="Bullet list"
        :aria-pressed="isActive('bulletList')"
        @click="editor?.chain().focus().toggleBulletList().run()"
      >
        <List class="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        class="h-8 w-8"
        :variant="isActive('orderedList') ? 'secondary' : 'ghost'"
        aria-label="Numbered list"
        title="Numbered list"
        :aria-pressed="isActive('orderedList')"
        @click="editor?.chain().focus().toggleOrderedList().run()"
      >
        <ListOrdered class="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        class="h-8 w-8"
        :variant="isActive('link') ? 'secondary' : 'ghost'"
        aria-label="Add link"
        title="Add link"
        :aria-pressed="isActive('link')"
        @click="setLink"
      >
        <Link2 class="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        class="h-8 w-8"
        variant="ghost"
        aria-label="Clear formatting"
        title="Clear formatting"
        @click="editor?.chain().focus().clearNodes().unsetAllMarks().run()"
      >
        <RemoveFormatting class="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" class="mx-1 h-6" />

      <Button
        type="button"
        size="icon"
        class="h-8 w-8"
        variant="ghost"
        aria-label="Undo"
        title="Undo"
        :disabled="!editor?.can().undo()"
        @click="editor?.chain().focus().undo().run()"
      >
        <Undo2 class="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        class="h-8 w-8"
        variant="ghost"
        aria-label="Redo"
        title="Redo"
        :disabled="!editor?.can().redo()"
        @click="editor?.chain().focus().redo().run()"
      >
        <Redo2 class="h-4 w-4" />
      </Button>
    </div>

    <EditorContent :editor="editor" />

    <p v-if="!hideHint" class="text-muted-foreground border-t px-4 py-2 text-xs">
      {{
        hint ??
        "Add an introduction, instructions, or a list of what to bring. Links open in a new tab."
      }}
    </p>
  </div>
</template>
