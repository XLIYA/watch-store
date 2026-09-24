"use client";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "./button";
import { Bold, Italic, List, ListOrdered, Undo, Redo } from "lucide-react";

/** ویرایشگر بصری مودال HTML تولید می‌کند؛ sanitize سمت سرور همچنان مرز امنیتی ذخیره و نمایش است. */
export function RichTextEditor({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    editable: !disabled,
    editorProps: {
      attributes: {
        class: "min-h-44 p-4 outline-none prose-content text-right",
        dir: "rtl",
        "aria-label": "توضیحات محصول",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive("bold"),
      italic: editor?.isActive("italic"),
    }),
  });
  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <div
        className="flex flex-wrap gap-1 border-b p-2"
        role="toolbar"
        aria-label="قالب‌بندی توضیحات"
      >
        <Button
          type="button"
          variant={state?.bold ? "secondary" : "ghost"}
          size="icon"
          aria-label="متن برجسته"
          disabled={disabled || !editor}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold />
        </Button>
        <Button
          type="button"
          variant={state?.italic ? "secondary" : "ghost"}
          size="icon"
          aria-label="متن مورب"
          disabled={disabled || !editor}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="فهرست"
          disabled={disabled || !editor}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="فهرست شماره‌دار"
          disabled={disabled || !editor}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="واگرد"
          disabled={disabled || !editor}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          <Undo />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="انجام دوباره"
          disabled={disabled || !editor}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          <Redo />
        </Button>
      </div>
      <div className={disabled ? "pointer-events-none opacity-60" : ""}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
