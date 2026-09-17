"use client";

import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState, useTransition, type ReactNode } from "react";
import type { RichTextDoc } from "@/lib/rich-text";
import { updateBiography } from "./actions";

export default function BiographyEditor({
  title: initialTitle,
  body,
}: {
  title: string;
  body: RichTextDoc;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const editor = useEditor({
    immediatelyRender: false, // rendered on the client only
    extensions: [
      StarterKit.configure({
        // structure only: no colour, font or size controls anywhere
        code: false,
        codeBlock: false,
        strike: false,
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: "noreferrer", target: "_blank" },
        },
      }),
    ],
    content: body,
    editorProps: {
      attributes: { class: "bio-content", "aria-label": "Biography text" },
    },
  });

  function save() {
    if (!editor || pending) return;
    setError("");
    setStatus("");
    startTransition(async () => {
      const result = await updateBiography({
        title,
        body: JSON.stringify(editor.getJSON()),
      });
      if (result?.ok) setStatus("Saved");
      else setError(result?.message ?? "Could not save.");
    });
  }

  return (
    <div className="admin-editor">
      <label className="admin-field">
        <span>Title</span>
        <input
          className="field admin-title-input"
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A life of service"
        />
      </label>

      <div className="admin-field">
        <span>Story</span>
        {editor && <Toolbar editor={editor} />}

        <div className="admin-editor-surface">
          <EditorContent editor={editor} />
        </div>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="admin-actions">
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={save}
          disabled={pending}
        >
          {pending ? "Saving…" : "Save biography"}
        </button>
        <span className="admin-saved" role="status">
          {status}
        </span>
      </div>
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      quote: e.isActive("blockquote"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  function toggleLink() {
    if (active.link) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const href = window.prompt("Link address (https://…)");
    if (href) editor.chain().focus().setLink({ href }).run();
  }

  return (
    <div className="admin-toolbar" role="toolbar" aria-label="Formatting">
      <Tool on={active.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
        <strong>B</strong>
      </Tool>
      <Tool on={active.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <em>I</em>
      </Tool>
      <Tool on={active.underline} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <u>U</u>
      </Tool>
      <span className="admin-toolbar-sep" />
      <Tool on={active.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        Heading
      </Tool>
      <Tool on={active.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        Subheading
      </Tool>
      <Tool on={active.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        Quote
      </Tool>
      <span className="admin-toolbar-sep" />
      <Tool on={active.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        List
      </Tool>
      <Tool on={active.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1. List
      </Tool>
      <Tool on={active.link} onClick={toggleLink}>
        Link
      </Tool>
      <span className="admin-toolbar-sep" />
      <Tool disabled={!active.canUndo} onClick={() => editor.chain().focus().undo().run()}>
        Undo
      </Tool>
      <Tool disabled={!active.canRedo} onClick={() => editor.chain().focus().redo().run()}>
        Redo
      </Tool>
    </div>
  );
}

function Tool({
  on,
  disabled,
  onClick,
  children,
}: {
  on?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="admin-tool"
      aria-pressed={on}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
