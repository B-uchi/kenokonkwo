/**
 * The biography body is stored as Tiptap/ProseMirror JSON and rendered with
 * React elements below — never as raw HTML. Anything outside this allowlist
 * (colours, fonts, inline styles, scripts, pasted markup) is dropped on save,
 * so the page always uses the site's own typography.
 */

export type RichTextMark = { type: string; attrs?: Record<string, unknown> };

export type RichTextNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: RichTextNode[];
  marks?: RichTextMark[];
  text?: string;
};

export type RichTextDoc = { type: "doc"; content: RichTextNode[] };

export const EMPTY_DOC: RichTextDoc = { type: "doc", content: [] };

const BLOCKS = new Set([
  "paragraph",
  "heading",
  "blockquote",
  "bulletList",
  "orderedList",
  "listItem",
  "horizontalRule",
]);
const MARKS = new Set(["bold", "italic", "underline", "link"]);
const MAX_DEPTH = 5;
const MAX_TEXT = 60_000;

function safeHref(value: unknown) {
  if (typeof value !== "string") return null;
  const href = value.trim();
  return /^(https?:\/\/|mailto:|tel:)/i.test(href) && href.length <= 2000
    ? href
    : null;
}

function cleanMarks(marks: unknown): RichTextMark[] | undefined {
  if (!Array.isArray(marks)) return undefined;
  const kept: RichTextMark[] = [];
  for (const mark of marks) {
    const type = (mark as RichTextMark)?.type;
    if (!MARKS.has(type)) continue;
    if (type === "link") {
      const href = safeHref((mark as RichTextMark).attrs?.href);
      if (href) kept.push({ type, attrs: { href } });
    } else {
      kept.push({ type });
    }
  }
  return kept.length > 0 ? kept : undefined;
}

function cleanNodes(nodes: unknown, depth: number, budget: { text: number }) {
  if (!Array.isArray(nodes) || depth > MAX_DEPTH) return [];
  const kept: RichTextNode[] = [];

  for (const raw of nodes) {
    const node = raw as RichTextNode;
    const type = node?.type;

    if (type === "text") {
      const text = typeof node.text === "string" ? node.text : "";
      if (!text || budget.text <= 0) continue;
      const clipped = text.slice(0, budget.text);
      budget.text -= clipped.length;
      kept.push({ type: "text", text: clipped, marks: cleanMarks(node.marks) });
      continue;
    }

    if (type === "hardBreak") {
      kept.push({ type });
      continue;
    }

    if (!BLOCKS.has(type)) continue;

    const cleaned: RichTextNode = { type };
    if (type === "heading") {
      const level = Number(node.attrs?.level);
      cleaned.attrs = { level: level === 3 ? 3 : 2 };
    }
    if (type !== "horizontalRule") {
      cleaned.content = cleanNodes(node.content, depth + 1, budget);
      // drop empty containers, but keep blank paragraphs as spacing
      if (cleaned.content.length === 0 && type !== "paragraph") continue;
    }
    kept.push(cleaned);
  }

  return kept;
}

/** Validate untrusted editor output into a safe document. */
export function sanitizeDoc(input: unknown): RichTextDoc {
  const doc = input as RichTextDoc;
  if (!doc || doc.type !== "doc") return EMPTY_DOC;
  return { type: "doc", content: cleanNodes(doc.content, 0, { text: MAX_TEXT }) };
}

export function isEmptyDoc(doc: RichTextDoc) {
  const hasText = (nodes: RichTextNode[]): boolean =>
    nodes.some((n) =>
      n.type === "text" ? Boolean(n.text?.trim()) : hasText(n.content ?? []),
    );
  return !hasText(doc.content ?? []);
}
