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
import type { BiographyAccount } from "@/lib/server/biography";
import { updateBiography } from "./actions";

/** structure only: no colour, font or size controls anywhere */
const extensions = [
  StarterKit.configure({
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
];

function useStoryEditor(content: RichTextDoc, label: string) {
  return useEditor({
    immediatelyRender: false, // rendered on the client only
    extensions,
    content,
    editorProps: { attributes: { class: "bio-content", "aria-label": label } },
  });
}

export default function BiographyEditor({
  main,
  second,
}: {
  main: BiographyAccount;
  second: BiographyAccount & { visible: boolean };
}) {
  const [title, setTitle] = useState(main.title);
  const [author, setAuthor] = useState(main.author);
  const [secondTitle, setSecondTitle] = useState(second.title);
  const [secondAuthor, setSecondAuthor] = useState(second.author);
  const [secondVisible, setSecondVisible] = useState(second.visible);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const mainEditor = useStoryEditor(main.body, "Biography text");
  const secondEditor = useStoryEditor(second.body, "Second account text");

  function save() {
    if (!mainEditor || !secondEditor || pending) return;
    setError("");
    setStatus("");
    startTransition(async () => {
      const result = await updateBiography({
        title,
        author,
        body: JSON.stringify(mainEditor.getJSON()),
        second: {
          title: secondTitle,
          author: secondAuthor,
          body: JSON.stringify(secondEditor.getJSON()),
          visible: secondVisible,
        },
      });
      if (result?.ok) setStatus("Saved");
      else setError(result?.message ?? "Could not save.");
    });
  }

  return (
    <div className="admin-editor">
      <section className="admin-account">
        <h2 className="admin-account-head">The family&rsquo;s account</h2>

        <label className="admin-field">
          <span>Title</span>
          <input
            className="field admin-title-input"
            value={title}
            maxLength={160}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A life of service"
          />
        </label>

        <label className="admin-field">
          <span>
            Author <em>— optional, shown as &ldquo;As remembered by …&rdquo;</em>
          </span>
          <input
            className="field"
            value={author}
            maxLength={120}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Leave empty for no byline"
          />
        </label>

        <Story editor={mainEditor} />
      </section>

      <section className="admin-account">
        <div className="admin-account-head">
          <h2>His sister&rsquo;s account</h2>
          <label className="admin-switch">
            <input
              type="checkbox"
              checked={secondVisible}
              onChange={(e) => setSecondVisible(e.target.checked)}
            />
            <span>{secondVisible ? "Shown on the site" : "Hidden"}</span>
          </label>
        </div>

        <label className="admin-field">
          <span>Her title for the piece</span>
          <input
            className="field admin-title-input"
            value={secondTitle}
            maxLength={160}
            onChange={(e) => setSecondTitle(e.target.value)}
            placeholder="The title on her document"
          />
        </label>

        <label className="admin-field">
          <span>
            Author <em>— shown as &ldquo;As remembered by …&rdquo;</em>
          </span>
          <input
            className="field"
            value={secondAuthor}
            maxLength={120}
            onChange={(e) => setSecondAuthor(e.target.value)}
            placeholder="e.g. his elder sister, Mrs …"
          />
        </label>

        <Story editor={secondEditor} />
      </section>

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

function Story({ editor }: { editor: Editor | null }) {
  return (
    <div className="admin-field">
      <span>Story</span>
      {editor && <Toolbar editor={editor} />}
      <div className="admin-editor-surface">
        <EditorContent editor={editor} />
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
