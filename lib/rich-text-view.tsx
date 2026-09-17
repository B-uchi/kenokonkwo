import type { ReactNode } from "react";
import type { RichTextDoc, RichTextNode } from "./rich-text";

/** Renders sanitized biography JSON as React elements (never raw HTML). */
function renderInline(nodes: RichTextNode[] | undefined): ReactNode {
  return (nodes ?? []).map((node, i) => {
    if (node.type === "hardBreak") return <br key={i} />;
    if (node.type !== "text") return null;

    let element: ReactNode = node.text;
    for (const mark of node.marks ?? []) {
      if (mark.type === "bold") element = <strong>{element}</strong>;
      else if (mark.type === "italic") element = <em>{element}</em>;
      else if (mark.type === "underline") element = <u>{element}</u>;
      else if (mark.type === "link")
        element = (
          <a href={String(mark.attrs?.href)} target="_blank" rel="noreferrer">
            {element}
          </a>
        );
    }
    return <span key={i}>{element}</span>;
  });
}

function renderBlocks(nodes: RichTextNode[] | undefined): ReactNode {
  return (nodes ?? []).map((node, i) => {
    switch (node.type) {
      case "paragraph":
        return <p key={i}>{renderInline(node.content)}</p>;
      case "heading":
        return node.attrs?.level === 3 ? (
          <h3 key={i}>{renderInline(node.content)}</h3>
        ) : (
          <h2 key={i}>{renderInline(node.content)}</h2>
        );
      case "blockquote":
        return <blockquote key={i}>{renderBlocks(node.content)}</blockquote>;
      case "bulletList":
        return <ul key={i}>{renderBlocks(node.content)}</ul>;
      case "orderedList":
        return <ol key={i}>{renderBlocks(node.content)}</ol>;
      case "listItem":
        return <li key={i}>{renderBlocks(node.content)}</li>;
      case "horizontalRule":
        return <hr key={i} />;
      default:
        return null;
    }
  });
}

export function RichText({ doc }: { doc: RichTextDoc }) {
  return <>{renderBlocks(doc.content)}</>;
}
