"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import CodeBlock from "@tiptap/extension-code-block";
import Placeholder from "@tiptap/extension-placeholder";

// ─── types ───────────────────────────────────────────────────────────────────

interface RichEditorProps {
  value: string;        // HTML content
  onChange: (html: string) => void;
  secret: string;       // backdrop_secret for image uploads
  placeholder?: string;
}

// ─── toolbar button ──────────────────────────────────────────────────────────

function Btn({
  active, onClick, title, children, danger,
}: {
  active?: boolean; onClick: () => void; title?: string; children: React.ReactNode; danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className="p-1.5 rounded text-xs font-medium transition-all shrink-0"
      style={{
        background: active ? "rgba(59,130,246,0.2)" : "transparent",
        color: active ? "#60a5fa" : danger ? "#f87171" : "#94a3b8",
        border: active ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
      }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 shrink-0 self-center" style={{ background: "rgba(255,255,255,0.08)" }} />;
}

// ─── colour picker ───────────────────────────────────────────────────────────

const TEXT_COLORS = [
  "#ffffff", "#94a3b8", "#f87171", "#fb923c", "#fbbf24",
  "#4ade80", "#34d399", "#38bdf8", "#818cf8", "#e879f9",
];
const HIGHLIGHT_COLORS = [
  "rgba(251,191,36,0.3)", "rgba(74,222,128,0.25)", "rgba(56,189,248,0.25)",
  "rgba(232,121,249,0.25)", "rgba(248,113,113,0.25)",
];

function ColorPicker({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <Btn onClick={() => setOpen((p) => !p)} title="Text color" active={open}>
        <span className="flex items-center gap-1">
          <span style={{ fontFamily: "Georgia, serif" }}>A</span>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: editor.getAttributes("textStyle").color || "#fff" }} />
        </span>
      </Btn>
      {open && (
        <div
          className="absolute top-8 left-0 z-50 p-2 rounded-xl space-y-2"
          style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", minWidth: 160 }}
        >
          <p className="text-xs text-slate-500 font-medium px-1">Text Color</p>
          <div className="flex flex-wrap gap-1.5 px-1">
            {TEXT_COLORS.map((c) => (
              <button key={c} type="button"
                className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                style={{ background: c, borderColor: editor.getAttributes("textStyle").color === c ? "#60a5fa" : "transparent" }}
                onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(c).run(); setOpen(false); }}
              />
            ))}
            <button type="button"
              className="w-5 h-5 rounded-full text-xs text-slate-400 border"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}
              onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetColor().run(); setOpen(false); }}
              title="Remove color"
            >✕</button>
          </div>
          <p className="text-xs text-slate-500 font-medium px-1 pt-1">Highlight</p>
          <div className="flex flex-wrap gap-1.5 px-1">
            {HIGHLIGHT_COLORS.map((c) => (
              <button key={c} type="button"
                className="w-5 h-5 rounded border-2 transition-transform hover:scale-110"
                style={{ background: c, borderColor: "transparent" }}
                onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setHighlight({ color: c }).run(); setOpen(false); }}
              />
            ))}
            <button type="button"
              className="w-5 h-5 rounded text-xs text-slate-400 border"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}
              onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetHighlight().run(); setOpen(false); }}
              title="Remove highlight"
            >✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── image / media insert modal ──────────────────────────────────────────────

function MediaModal({
  editor, secret, onClose,
}: { editor: Editor; secret: string; onClose: () => void }) {
  const [tab, setTab] = useState<"upload" | "url" | "gif">("upload");
  const [url, setUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ url: string; optimizedSizeKb: number; savedPercent: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await fetch("/api/blog/upload-image", {
        method: "POST",
        headers: { "x-backdrop-secret": secret },
        body: fd,
      });
      const data = await res.json() as typeof uploadResult & { error?: string };
      if (!res.ok) throw new Error(data?.error);
      setUploadResult(data);
      setUrl(data?.url || "");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function insert() {
    const src = url.trim();
    if (!src) return;
    editor.chain().focus().setImage({ src, alt: altText || undefined }).run();
    onClose();
  }

  const iStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="w-full max-w-sm rounded-2xl p-5 space-y-4" style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm">Insert Image / Media</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-lg">✕</button>
        </div>

        <div className="flex gap-1">
          {(["upload", "url", "gif"] as const).map((t) => (
            <button key={t} type="button"
              onClick={() => setTab(t)}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: tab === t ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)",
                color: tab === t ? "#60a5fa" : "#64748b",
                border: tab === t ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {t === "upload" ? "Upload" : t === "url" ? "Image URL" : "GIF / Embed"}
            </button>
          ))}
        </div>

        {tab === "upload" && (
          <div
            className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {uploading ? <p className="text-xs text-slate-400">Optimizing…</p>
              : uploadResult ? (
                <div className="space-y-1">
                  <img src={uploadResult.url} alt="preview" className="w-full h-24 object-cover rounded-lg mb-2" />
                  <p className="text-xs text-green-400">Saved {uploadResult.savedPercent}% · {uploadResult.optimizedSizeKb}KB WebP</p>
                  <p className="text-xs text-slate-400">Click to replace</p>
                </div>
              ) : (
                <>
                  <p className="text-slate-400 text-sm">Click or drop to upload</p>
                  <p className="text-xs text-slate-600 mt-1">Auto WebP · compressed · max 1200px</p>
                </>
              )}
          </div>
        )}

        {tab === "url" && (
          <input className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none" style={iStyle}
            placeholder="https://example.com/image.jpg"
            value={url} onChange={(e) => setUrl(e.target.value)} />
        )}

        {tab === "gif" && (
          <div className="space-y-2">
            <input className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none" style={iStyle}
              placeholder="Paste GIF / image / embed URL"
              value={url} onChange={(e) => setUrl(e.target.value)} />
            <p className="text-xs text-slate-500">Supports: Giphy, Tenor, direct image URLs, CDN links</p>
          </div>
        )}

        <input className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none" style={iStyle}
          placeholder="Alt text (accessibility + SEO)"
          value={altText} onChange={(e) => setAltText(e.target.value)} />

        <button
          type="button" onClick={insert}
          disabled={!url.trim()}
          className="w-full py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
        >
          Insert
        </button>
      </div>
    </div>
  );
}

// ─── table modal ─────────────────────────────────────────────────────────────

function TableModal({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  function insert() {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    onClose();
  }
  const iStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="w-64 rounded-2xl p-5 space-y-4" style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm">Insert Table</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-lg">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Rows</label>
            <input type="number" min={1} max={20} value={rows} onChange={(e) => setRows(+e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none" style={iStyle} />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Columns</label>
            <input type="number" min={1} max={10} value={cols} onChange={(e) => setCols(+e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none" style={iStyle} />
          </div>
        </div>
        <button type="button" onClick={insert}
          className="w-full py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
        >
          Insert Table
        </button>
      </div>
    </div>
  );
}

// ─── link prompt ─────────────────────────────────────────────────────────────

function setLink(editor: Editor) {
  const prev = editor.getAttributes("link").href as string;
  const url = window.prompt("URL", prev || "https://");
  if (url === null) return;
  if (url === "") { editor.chain().focus().unsetLink().run(); return; }
  editor.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run();
}

// ─── main toolbar ────────────────────────────────────────────────────────────

function Toolbar({ editor, onImageClick, onTableClick, secret }: {
  editor: Editor; onImageClick: () => void; onTableClick: () => void; secret: string;
}) {
  const e = editor;
  return (
    <div
      className="flex flex-wrap items-center gap-0.5 p-2 border-b"
      style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
    >
      {/* History */}
      <Btn onClick={() => e.chain().focus().undo().run()} title="Undo" active={false}>↩</Btn>
      <Btn onClick={() => e.chain().focus().redo().run()} title="Redo" active={false}>↪</Btn>
      <Divider />

      {/* Headings */}
      {([1, 2, 3] as const).map((l) => (
        <Btn key={l} onClick={() => e.chain().focus().toggleHeading({ level: l }).run()}
          active={e.isActive("heading", { level: l })} title={`Heading ${l}`}>
          H{l}
        </Btn>
      ))}
      <Divider />

      {/* Inline formatting */}
      <Btn onClick={() => e.chain().focus().toggleBold().run()} active={e.isActive("bold")} title="Bold">
        <strong>B</strong>
      </Btn>
      <Btn onClick={() => e.chain().focus().toggleItalic().run()} active={e.isActive("italic")} title="Italic">
        <em>I</em>
      </Btn>
      <Btn onClick={() => e.chain().focus().toggleUnderline().run()} active={e.isActive("underline")} title="Underline">
        <span style={{ textDecoration: "underline" }}>U</span>
      </Btn>
      <Btn onClick={() => e.chain().focus().toggleStrike().run()} active={e.isActive("strike")} title="Strikethrough">
        <span style={{ textDecoration: "line-through" }}>S</span>
      </Btn>
      <ColorPicker editor={e} />
      <Divider />

      {/* Lists */}
      <Btn onClick={() => e.chain().focus().toggleBulletList().run()} active={e.isActive("bulletList")} title="Bullet list">≡</Btn>
      <Btn onClick={() => e.chain().focus().toggleOrderedList().run()} active={e.isActive("orderedList")} title="Numbered list">#≡</Btn>
      <Btn onClick={() => e.chain().focus().toggleBlockquote().run()} active={e.isActive("blockquote")} title="Quote">"</Btn>
      <Divider />

      {/* Code */}
      <Btn onClick={() => e.chain().focus().toggleCode().run()} active={e.isActive("code")} title="Inline code">{"`"}</Btn>
      <Btn onClick={() => e.chain().focus().toggleCodeBlock().run()} active={e.isActive("codeBlock")} title="Code block">{"</>"}</Btn>
      <Divider />

      {/* Link */}
      <Btn onClick={() => setLink(e)} active={e.isActive("link")} title="Add/edit link">🔗</Btn>

      {/* Image / media */}
      <Btn onClick={onImageClick} title="Insert image / GIF / media">🖼</Btn>

      {/* Table */}
      <Btn onClick={onTableClick} title="Insert table">⊞</Btn>

      {/* Table controls (only when cursor is in table) */}
      {e.isActive("table") && (
        <>
          <Divider />
          <Btn onClick={() => e.chain().focus().addColumnAfter().run()} title="Add column">+col</Btn>
          <Btn onClick={() => e.chain().focus().addRowAfter().run()} title="Add row">+row</Btn>
          <Btn onClick={() => e.chain().focus().deleteColumn().run()} title="Del column" danger>−col</Btn>
          <Btn onClick={() => e.chain().focus().deleteRow().run()} title="Del row" danger>−row</Btn>
          <Btn onClick={() => e.chain().focus().deleteTable().run()} title="Delete table" danger>✕tbl</Btn>
        </>
      )}

      <Divider />
      <Btn onClick={() => e.chain().focus().setHorizontalRule().run()} title="Horizontal rule">─</Btn>
      <Btn onClick={() => e.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear formatting">✕fmt</Btn>
    </div>
  );
}

// ─── editor ──────────────────────────────────────────────────────────────────

export function RichEditor({ value, onChange, secret, placeholder }: RichEditorProps) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const isInitialized = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" } }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlock.configure({ HTMLAttributes: { class: "not-prose bg-slate-900 text-green-300 p-4 rounded-xl text-sm font-mono overflow-x-auto" } }),
      Placeholder.configure({ placeholder: placeholder || "Write your post here…" }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-sm max-w-none min-h-[400px] px-5 py-4 focus:outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  // Sync external value changes (e.g. when loading existing post)
  useEffect(() => {
    if (!editor) return;
    if (!isInitialized.current) {
      isInitialized.current = true;
      return; // skip first render - content already set via useEditor
    }
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <>
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}
      >
        <Toolbar
          editor={editor}
          onImageClick={() => setShowImageModal(true)}
          onTableClick={() => setShowTableModal(true)}
          secret={secret}
        />
        <EditorContent editor={editor} />
      </div>

      {showImageModal && (
        <MediaModal editor={editor} secret={secret} onClose={() => setShowImageModal(false)} />
      )}
      {showTableModal && (
        <TableModal editor={editor} onClose={() => setShowTableModal(false)} />
      )}
    </>
  );
}
