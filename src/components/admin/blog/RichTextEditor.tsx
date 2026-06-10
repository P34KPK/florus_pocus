"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold, Italic, Strikethrough, List, ListOrdered,
  Quote, Minus, Link2, AlignLeft, AlignCenter, AlignRight,
  Heading2, Heading3, Undo, Redo,
} from "lucide-react";

interface Props {
  name: string;
  defaultValue?: string;
}

function ToolbarButton({
  onClick, active = false, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="p-1.5 rounded-lg transition-colors"
      style={{
        backgroundColor: active ? "#2D5016" : "transparent",
        color: active ? "#fff" : "#444",
      }}
      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "#F0F5EC"; }}
      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 mx-1" style={{ backgroundColor: "#E0D5C8" }} />;
}

export default function RichTextEditor({ name, defaultValue = "" }: Props) {
  // TipTap v3 ne re-render plus React à chaque frappe : on garde le HTML dans
  // un state mis à jour via onUpdate pour que le champ caché soit toujours à jour.
  const [html, setHtml] = useState(defaultValue);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({
        placeholder: "Rédigez votre article ici…",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: defaultValue,
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "min-h-[320px] px-4 py-3 outline-none prose-editor",
      },
    },
  });

  if (!editor) return null;

  function addLink() {
    const url = window.prompt("URL du lien :");
    if (!url) return;
    editor!.chain().focus().setLink({ href: url }).run();
  }

  return (
    <div className="border border-[#E0D5C8] rounded-xl overflow-hidden">
      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-[#E0D5C8]"
        style={{ backgroundColor: "#FAFAF8" }}>

        {/* Historique */}
        <ToolbarButton title="Annuler" onClick={() => editor.chain().focus().undo().run()}>
          <Undo size={15} />
        </ToolbarButton>
        <ToolbarButton title="Rétablir" onClick={() => editor.chain().focus().redo().run()}>
          <Redo size={15} />
        </ToolbarButton>

        <Divider />

        {/* Titres */}
        <ToolbarButton
          title="Titre 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Titre 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 size={15} />
        </ToolbarButton>

        <Divider />

        {/* Formatage texte */}
        <ToolbarButton
          title="Gras"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Italique"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Barré"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={15} />
        </ToolbarButton>

        <Divider />

        {/* Alignement */}
        <ToolbarButton
          title="Aligner à gauche"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Centrer"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Aligner à droite"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight size={15} />
        </ToolbarButton>

        <Divider />

        {/* Listes */}
        <ToolbarButton
          title="Liste à puces"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Liste numérotée"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={15} />
        </ToolbarButton>

        <Divider />

        {/* Blocs spéciaux */}
        <ToolbarButton
          title="Citation"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Séparateur horizontal"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Lien"
          active={editor.isActive("link")}
          onClick={addLink}
        >
          <Link2 size={15} />
        </ToolbarButton>
      </div>

      {/* Zone de texte */}
      <div style={{ backgroundColor: "#fff", fontFamily: "Georgia, serif", fontSize: "15px", lineHeight: "1.8", color: "#1A1A1A" }}>
        <EditorContent editor={editor} />
      </div>

      {/* Champ caché qui passe le HTML au Server Action */}
      <input type="hidden" name={name} value={html} />

      <style>{`
        .prose-editor h2 { font-size: 1.6rem; font-weight: 700; margin: 1.2em 0 0.5em; color: #2D5016; }
        .prose-editor h3 { font-size: 1.25rem; font-weight: 700; margin: 1em 0 0.4em; color: #2D5016; }
        .prose-editor h4 { font-size: 1.05rem; font-weight: 700; margin: 0.8em 0 0.3em; }
        .prose-editor p  { margin: 0.6em 0; }
        .prose-editor ul { list-style: disc; padding-left: 1.6em; margin: 0.6em 0; }
        .prose-editor ol { list-style: decimal; padding-left: 1.6em; margin: 0.6em 0; }
        .prose-editor li { margin: 0.2em 0; }
        .prose-editor blockquote { border-left: 3px solid #D4A574; padding-left: 1em; margin: 1em 0; color: #666; font-style: italic; }
        .prose-editor hr { border: none; border-top: 1px solid #E0D5C8; margin: 1.5em 0; }
        .prose-editor a { color: #2D5016; text-decoration: underline; }
        .prose-editor strong { font-weight: 700; }
        .prose-editor em { font-style: italic; }
        .prose-editor s { text-decoration: line-through; }
        .prose-editor code { background: #F0F5EC; padding: 0.1em 0.4em; border-radius: 4px; font-size: 0.9em; }
        .tiptap p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #aaa; pointer-events: none; height: 0; }
      `}</style>
    </div>
  );
}
