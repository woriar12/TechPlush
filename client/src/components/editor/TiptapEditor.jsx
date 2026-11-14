import React, { useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Table as TableIcon,
  Undo,
  Redo,
  Image as ImageIcon,
} from "lucide-react";
import { uploadEditorImage } from "../../services/blogService";
import { useToast } from "../../context/ToastContext";

const TiptapEditor = ({
  content,
  onChange,
  id = "article-content",
  ariaInvalid = false,
  ariaDescribedBy,
  placeholder = "Write your technical article here...",
}) => {
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
        link: false,
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#171717] underline font-medium cursor-pointer",
        },
      }),
      ImageExtension.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: "rounded max-w-full my-3 border border-[#E5E5E5]",
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content || { type: "doc", content: [] },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getJSON());
      }
    },
    editorProps: {
      attributes: {
        id,
        "aria-label": "Article content",
        "aria-invalid": ariaInvalid ? "true" : undefined,
        "aria-describedby": ariaDescribedBy,
        class: "prose max-w-none focus:outline-none article-content min-h-[300px] p-3 text-[#171717]",
      },
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file", "error");
      return;
    }

    try {
      showToast("Uploading image...", "info");
      const res = await uploadEditorImage(file);
      if (res.success && res.data?.url) {
        editor?.chain().focus().setImage({ src: res.data.url, alt: file.name }).run();
        showToast("Image inserted!");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to upload image", "error");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const setLink = () => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("Enter link URL:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  if (!editor) {
    return <div className="p-4 text-center text-xs text-[#666666]">Loading editor...</div>;
  }

  return (
    <div className="border border-[#E5E5E5] rounded bg-white overflow-hidden">
      {/* Editor Toolbar */}
      <div role="toolbar" aria-label="Article formatting" className="flex flex-wrap items-center gap-1 p-1.5 bg-[#FAFAFA] border-b border-[#E5E5E5] text-xs">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded border border-transparent hover:border-[#E5E5E5] ${
            editor.isActive("bold") ? "bg-[#171717] text-white font-bold" : "text-[#171717] hover:bg-neutral-100"
          }`}
          title="Bold"
          aria-label="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded border border-transparent hover:border-[#E5E5E5] ${
            editor.isActive("italic") ? "bg-[#171717] text-white" : "text-[#171717] hover:bg-neutral-100"
          }`}
          title="Italic"
          aria-label="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-[#E5E5E5] mx-0.5" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded border border-transparent hover:border-[#E5E5E5] ${
            editor.isActive("heading", { level: 2 }) ? "bg-[#171717] text-white font-bold" : "text-[#171717] hover:bg-neutral-100"
          }`}
          title="Heading 2"
          aria-label="Heading level 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded border border-transparent hover:border-[#E5E5E5] ${
            editor.isActive("heading", { level: 3 }) ? "bg-[#171717] text-white font-bold" : "text-[#171717] hover:bg-neutral-100"
          }`}
          title="Heading 3"
          aria-label="Heading level 3"
        >
          <Heading3 className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-[#E5E5E5] mx-0.5" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded border border-transparent hover:border-[#E5E5E5] ${
            editor.isActive("bulletList") ? "bg-[#171717] text-white font-bold" : "text-[#171717] hover:bg-neutral-100"
          }`}
          title="Bullet List"
          aria-label="Bullet list"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded border border-transparent hover:border-[#E5E5E5] ${
            editor.isActive("orderedList") ? "bg-[#171717] text-white font-bold" : "text-[#171717] hover:bg-neutral-100"
          }`}
          title="Numbered List"
          aria-label="Numbered list"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded border border-transparent hover:border-[#E5E5E5] ${
            editor.isActive("blockquote") ? "bg-[#171717] text-white" : "text-[#171717] hover:bg-neutral-100"
          }`}
          title="Blockquote"
          aria-label="Blockquote"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded border border-transparent hover:border-[#E5E5E5] ${
            editor.isActive("codeBlock") ? "bg-[#171717] text-white" : "text-[#171717] hover:bg-neutral-100"
          }`}
          title="Code Block"
          aria-label="Code block"
        >
          <Code className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-[#E5E5E5] mx-0.5" />

        <button
          type="button"
          onClick={setLink}
          className={`p-1.5 rounded border border-transparent hover:border-[#E5E5E5] ${
            editor.isActive("link") ? "bg-[#171717] text-white" : "text-[#171717] hover:bg-neutral-100"
          }`}
          title="Link"
          aria-label="Link"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={insertTable}
          className="p-1.5 rounded border border-transparent hover:border-[#E5E5E5] text-[#171717] hover:bg-neutral-100"
          title="Table"
          aria-label="Insert table"
        >
          <TableIcon className="w-3.5 h-3.5" />
        </button>

        {/* Cloudinary Inline Image Picker */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-2 py-1 rounded border border-[#E5E5E5] bg-white hover:bg-[#FAFAFA] text-[#171717] inline-flex items-center gap-1 text-[11px]"
          title="Upload inline image"
          aria-label="Insert image"
        >
          <ImageIcon className="w-3 h-3 text-[#171717]" />
          <span>Insert Image</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          aria-label="Choose image to insert"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 text-[#666666] hover:text-[#171717] disabled:opacity-30"
            title="Undo"
            aria-label="Undo"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 text-[#666666] hover:text-[#171717] disabled:opacity-30"
            title="Redo"
            aria-label="Redo"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="tiptap-editor-container bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TiptapEditor;
