"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Smartphone, Square, Copy, Clipboard, X } from "lucide-react"
import type { Slide, ExtraText } from "./editor-types"
import { FONT_OPTIONS, FONT_SIZE_MAP, CONTENT_SIZE_MAP, ALIGN_MAP, PRODUCT_IMAGE_SIZE_MAP } from "./editor-types"

type AspectMode = "square" | "story"
type TextFieldKey = "subtitle" | "title" | "content" | "cta"
type SelTarget = { kind: "field"; field: TextFieldKey } | { kind: "extra"; id: string }
interface ClipItem { content: string; color: string; bold: boolean }

interface EditorPreviewProps {
  slides: Slide[]
  selectedIndex: number
  onSlideChange: (index: number) => void
  onSlideUpdate?: (updates: Partial<Slide>) => void
}

export function EditorPreview({ slides, selectedIndex, onSlideChange, onSlideUpdate }: EditorPreviewProps) {
  const [aspectMode, setAspectMode] = useState<AspectMode>("square")
  const [sel, setSel] = useState<SelTarget | null>(null)
  const [editingField, setEditingField] = useState<TextFieldKey | null>(null)
  const [editingExtraId, setEditingExtraId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const [liveOffset, setLiveOffset] = useState<{ id: string; x: number; y: number } | null>(null)
  const [liveWidth, setLiveWidth] = useState<{ id: string; w: number } | null>(null)
  const [clip, setClip] = useState<ClipItem | null>(null)

  const cardRef = useRef<HTMLDivElement>(null)
  const slideRef = useRef(slides[selectedIndex])
  const onUpdateRef = useRef(onSlideUpdate)
  const selRef = useRef<SelTarget | null>(null)
  const liveWidthRef = useRef<{ id: string; w: number } | null>(null)

  // dragRef: tracks active move-drag state
  const dragRef = useRef<{
    targetId: string; targetKind: "field" | "extra"
    sx: number; sy: number; ox: number; oy: number; lx: number; ly: number
  } | null>(null)
  // resizeRef: tracks active resize state
  const resizeRef = useRef<{
    targetId: string; targetKind: "field" | "extra"
    sw: number; cw: number; sx: number
  } | null>(null)
  // wasMovedRef: becomes true if the mouse moved enough to be a drag (suppresses onClick)
  const wasMovedRef = useRef(false)

  useEffect(() => {
    slideRef.current = slides[selectedIndex]
    onUpdateRef.current = onSlideUpdate
  })

  const setSel2 = (s: SelTarget | null) => { selRef.current = s; setSel(s) }
  const setLW2 = (v: { id: string; w: number } | null) => { liveWidthRef.current = v; setLiveWidth(v) }

  // ── Global mouse handlers ─────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragRef.current) {
        const d = dragRef.current
        const dx = e.clientX - d.sx, dy = e.clientY - d.sy
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) wasMovedRef.current = true
        if (wasMovedRef.current) {
          d.lx = d.ox + dx; d.ly = d.oy + dy
          setLiveOffset({ id: d.targetId, x: d.lx, y: d.ly })
        }
      } else if (resizeRef.current) {
        const r = resizeRef.current
        const dx = e.clientX - r.sx
        const pw = Math.max(r.cw * 0.15, r.sw + dx)
        setLW2({ id: r.targetId, w: Math.min(100, (pw / r.cw) * 100) })
      }
    }
    const onUp = () => {
      const slide = slideRef.current
      if (dragRef.current && wasMovedRef.current) {
        const d = dragRef.current
        if (d.targetKind === "field") {
          onUpdateRef.current?.({ textOffsets: { ...(slide.textOffsets ?? {}), [d.targetId]: { x: d.lx, y: d.ly } } })
        } else {
          onUpdateRef.current?.({ extraTexts: (slide.extraTexts ?? []).map(ex => ex.id === d.targetId ? { ...ex, offset: { x: d.lx, y: d.ly } } : ex) })
        }
        setLiveOffset(null)
      }
      if (resizeRef.current) {
        const lw = liveWidthRef.current
        const r = resizeRef.current
        if (lw) {
          if (r.targetKind === "field") onUpdateRef.current?.({ textWidths: { ...(slide.textWidths ?? {}), [r.targetId]: lw.w } })
          else onUpdateRef.current?.({ extraTexts: (slide.extraTexts ?? []).map(ex => ex.id === r.targetId ? { ...ex, width: lw.w } : ex) })
          setLW2(null)
        }
      }
      dragRef.current = null
      resizeRef.current = null
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
  }, [])

  const slide = slides[selectedIndex]
  if (!slide) return null

  const fontCss = FONT_OPTIONS.find(f => f.value === slide.fontFamily)?.css ?? "sans-serif"
  const titleClass = FONT_SIZE_MAP[slide.titleSize].title
  const contentClass = CONTENT_SIZE_MAP[slide.contentSize].content
  const alignClass = ALIGN_MAP[slide.textAlign]

  const getFieldOff = (f: TextFieldKey) =>
    liveOffset?.id === f ? { x: liveOffset.x, y: liveOffset.y } : (slide.textOffsets?.[f] ?? { x: 0, y: 0 })
  const getExtraOff = (id: string) =>
    liveOffset?.id === id ? { x: liveOffset.x, y: liveOffset.y } : ((slide.extraTexts ?? []).find(e => e.id === id)?.offset ?? { x: 0, y: 0 })
  const getW = (id: string, stored?: number) =>
    liveWidth?.id === id ? `${liveWidth.w}%` : stored ? `${stored}%` : "auto"
  const fBold = (f: TextFieldKey) => slide.textBold?.[f] ?? false

  const commitField = () => {
    if (!editingField) return
    onUpdateRef.current?.({ [editingField]: editingValue })
    setEditingField(null)
  }
  const commitExtra = () => {
    if (!editingExtraId) return
    onUpdateRef.current?.({ extraTexts: (slide.extraTexts ?? []).map(e => e.id === editingExtraId ? { ...e, content: editingValue } : e) })
    setEditingExtraId(null)
  }

  // Start a MOVE drag
  const startMove = (e: React.MouseEvent, id: string, kind: "field" | "extra", off: { x: number; y: number }) => {
    e.preventDefault()
    e.stopPropagation()
    wasMovedRef.current = false
    dragRef.current = { targetId: id, targetKind: kind, sx: e.clientX, sy: e.clientY, ox: off.x, oy: off.y, lx: off.x, ly: off.y }
  }

  // Start a RESIZE drag
  const startResize = (e: React.MouseEvent, id: string, kind: "field" | "extra", storedW?: number) => {
    e.preventDefault()
    e.stopPropagation()
    wasMovedRef.current = true // treat resize start as a "move" so onClick is suppressed
    const cw = cardRef.current?.getBoundingClientRect().width ?? 384
    resizeRef.current = { targetId: id, targetKind: kind, sx: e.clientX, sw: ((storedW ?? 100) / 100) * cw, cw }
  }

  // Handle a CLICK on a text element (React onClick — fires after mouseup)
  const handleItemClick = (e: React.MouseEvent, id: string, kind: "field" | "extra") => {
    e.stopPropagation()
    if (wasMovedRef.current) return // was a drag, not a click
    const cur = selRef.current
    const curId = cur === null ? null : (cur.kind === "field" ? cur.field : cur.id)
    if (curId === id && cur?.kind === kind) {
      // Second click on same element → enter edit mode
      const s = slideRef.current
      const val = kind === "field"
        ? (id === "title" ? s.title : id === "subtitle" ? (s.subtitle ?? "") : id === "content" ? s.content : (s.cta ?? ""))
        : ((s.extraTexts ?? []).find(ex => ex.id === id)?.content ?? "")
      setEditingValue(val)
      if (kind === "field") setEditingField(id as TextFieldKey)
      else setEditingExtraId(id)
    } else {
      // First click → select
      setSel2(kind === "field" ? { kind: "field", field: id as TextFieldKey } : { kind: "extra", id })
      setEditingField(null)
      setEditingExtraId(null)
    }
  }

  const handlePaste = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!clip) return
    const neo: ExtraText = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      content: clip.content, color: clip.color, bold: clip.bold, offset: { x: 24, y: 24 }
    }
    onUpdateRef.current?.({ extraTexts: [...(slide.extraTexts ?? []), neo] })
    setSel2({ kind: "extra", id: neo.id })
  }

  // ── Toolbar (plain function) ──────────────────────────────────
  const renderToolbar = (
    bold: boolean,
    onBold: (e: React.MouseEvent) => void,
    onCopy: (e: React.MouseEvent) => void,
    editing: boolean,
    onDelete?: (e: React.MouseEvent) => void
  ) => (
    <div
      className="absolute -top-11 left-0 flex items-center gap-1 bg-black/85 backdrop-blur-sm rounded-xl px-2 py-1.5 z-50 shadow-xl"
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
    >
      <button onClick={onBold} title="굵게"
        className={cn("w-7 h-7 flex items-center justify-center rounded text-sm font-black transition-all",
          bold ? "bg-blue-500 text-white" : "text-white/70 hover:bg-white/20 hover:text-white")}>B</button>
      <div className="w-px h-4 bg-white/20 mx-0.5" />
      <button onClick={onCopy} title="복사"
        className="w-7 h-7 flex items-center justify-center rounded text-white/70 hover:bg-white/20 hover:text-white transition-all">
        <Copy className="w-3.5 h-3.5" />
      </button>
      {onDelete && (
        <>
          <div className="w-px h-4 bg-white/20 mx-0.5" />
          <button onClick={onDelete} title="삭제"
            className="w-7 h-7 flex items-center justify-center rounded text-red-400 hover:bg-red-500/20 transition-all">
            <X className="w-3.5 h-3.5" />
          </button>
        </>
      )}
      <div className="w-px h-4 bg-white/20 mx-0.5" />
      <span className="text-white/40 text-[10px] whitespace-nowrap">
        {editing ? "Enter·저장 Esc·취소" : "클릭: 편집"}
      </span>
    </div>
  )

  // ── Wrapper div for a text element (plain function) ───────────
  const wrap = (
    targetId: string,
    targetKind: "field" | "extra",
    isSelEl: boolean,
    isEditEl: boolean,
    offset: { x: number; y: number },
    width: string,
    bold: boolean,
    toolbar: React.ReactNode,
    children: React.ReactNode,
    storedW?: number
  ) => {
    const isDrag = liveOffset?.id === targetId
    const isRes = liveWidth?.id === targetId
    return (
      <div
        className={cn("relative group", !isEditEl && "cursor-move")}
        style={{
          transform: `translate(${offset.x}px,${offset.y}px)`,
          transition: isDrag ? "none" : "transform 0.1s ease",
          width, minWidth: "4ch",
          zIndex: isSelEl || isEditEl ? 20 : undefined,
          fontWeight: bold ? 900 : undefined,
        }}
        onMouseDown={e => { if (!isEditEl) startMove(e, targetId, targetKind, offset) }}
        onClick={e => handleItemClick(e, targetId, targetKind)}
      >
        {/* Hover / selection border */}
        <div className={cn(
          "absolute -inset-1.5 rounded pointer-events-none border-2 transition-opacity",
          isSelEl || isEditEl
            ? "opacity-100 border-blue-400"
            : "opacity-0 group-hover:opacity-60 border-white/60"
        )} />

        {/* Hover tooltip */}
        {!isSelEl && !isEditEl && (
          <div className="absolute -top-6 left-0 opacity-0 group-hover:opacity-100 pointer-events-none z-30">
            <span className="text-[10px] bg-black/70 text-white px-2 py-0.5 rounded whitespace-nowrap">
              드래그·이동 클릭·선택
            </span>
          </div>
        )}

        {/* Toolbar */}
        {(isSelEl || isEditEl) && toolbar}

        {/* Resize handle */}
        {(isSelEl || isEditEl) && (
          <div
            className="absolute -right-2 top-0 bottom-0 w-4 flex items-center justify-center cursor-ew-resize z-40"
            onMouseDown={e => startResize(e, targetId, targetKind, storedW)}
            onClick={e => e.stopPropagation()}
          >
            <div className={cn(
              "w-1.5 h-10 max-h-full rounded-full",
              isRes ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-300"
            )} />
          </div>
        )}

        {children}
      </div>
    )
  }

  // ── Inline textarea ───────────────────────────────────────────
  const renderTextarea = (onBlur: () => void, noNewline?: boolean) => (
    <textarea
      autoFocus
      className="block w-full bg-transparent outline-none resize-none overflow-hidden cursor-text pr-3"
      style={{
        color: "inherit", fontFamily: "inherit", fontSize: "inherit",
        fontWeight: "inherit", lineHeight: "inherit",
        textAlign: "inherit" as React.CSSProperties["textAlign"],
        minWidth: "8ch", padding: 0, border: "none",
      }}
      value={editingValue}
      onChange={e => {
        setEditingValue(e.target.value)
        e.target.style.height = "auto"
        e.target.style.height = e.target.scrollHeight + "px"
      }}
      onBlur={onBlur}
      onKeyDown={e => {
        e.stopPropagation()
        if (e.key === "Escape") { setEditingField(null); setEditingExtraId(null) }
        if (noNewline && e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onBlur() }
      }}
    />
  )

  // ── Fixed text field ──────────────────────────────────────────
  const renderField = (field: TextFieldKey, value: string, staticEl: React.ReactNode) => {
    if (!value && field !== "title" && field !== "content") return null
    const off = getFieldOff(field)
    const isSelEl = sel?.kind === "field" && sel.field === field
    const isEditEl = editingField === field
    const bold = fBold(field)
    const toolbar = renderToolbar(
      bold,
      e => { e.stopPropagation(); onUpdateRef.current?.({ textBold: { ...(slide.textBold ?? {}), [field]: !bold } }) },
      e => {
        e.stopPropagation()
        const c = field === "title" ? slide.title
          : field === "subtitle" ? (slide.subtitle ?? "")
          : field === "content" ? slide.content
          : (slide.cta ?? "")
        setClip({ content: c, color: field === "content" ? slide.bgStyle.textColor : slide.bgStyle.titleColor, bold })
      },
      isEditEl
    )
    return wrap(
      field, "field", isSelEl, isEditEl, off,
      getW(field, slide.textWidths?.[field]), bold, toolbar,
      isEditEl ? renderTextarea(commitField, field !== "content") : staticEl,
      slide.textWidths?.[field]
    )
  }

  // ── Extra (free-floating) text layer ─────────────────────────
  const renderExtra = (et: ExtraText) => {
    const off = getExtraOff(et.id)
    const isSelEl = sel?.kind === "extra" && sel.id === et.id
    const isEditEl = editingExtraId === et.id
    const toolbar = renderToolbar(
      et.bold,
      e => { e.stopPropagation(); onUpdateRef.current?.({ extraTexts: (slide.extraTexts ?? []).map(x => x.id === et.id ? { ...x, bold: !x.bold } : x) }) },
      e => { e.stopPropagation(); setClip({ content: et.content, color: et.color, bold: et.bold }) },
      isEditEl,
      e => { e.stopPropagation(); onUpdateRef.current?.({ extraTexts: (slide.extraTexts ?? []).filter(x => x.id !== et.id) }); setSel2(null) }
    )
    return wrap(
      et.id, "extra", isSelEl, isEditEl, off,
      getW(et.id, et.width), et.bold, toolbar,
      isEditEl
        ? renderTextarea(commitExtra, true)
        : <p className="text-base leading-relaxed whitespace-pre-line" style={{ color: et.color, fontWeight: et.bold ? 900 : undefined }}>{et.content || "텍스트 입력"}</p>,
      et.width
    )
  }

  const goToPrev = () => { if (selectedIndex > 0) onSlideChange(selectedIndex - 1) }
  const goToNext = () => { if (selectedIndex < slides.length - 1) onSlideChange(selectedIndex + 1) }

  return (
    <div
      className="flex flex-col items-center h-full py-6 px-4 gap-4"
      onClick={() => {
        if (editingField) commitField()
        if (editingExtraId) commitExtra()
        setSel2(null)
        setEditingField(null)
        setEditingExtraId(null)
      }}
    >
      {/* 상단 컨트롤 */}
      <div className="flex items-center gap-4 w-full max-w-sm">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
          <button onClick={e => { e.stopPropagation(); setAspectMode("square") }}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              aspectMode === "square" ? "bg-primary text-primary-foreground shadow" : "text-white/50 hover:text-white/80")}
          ><Square className="w-3 h-3" />1:1</button>
          <button onClick={e => { e.stopPropagation(); setAspectMode("story") }}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              aspectMode === "story" ? "bg-primary text-primary-foreground shadow" : "text-white/50 hover:text-white/80")}
          ><Smartphone className="w-3 h-3" />9:16</button>
        </div>
        {clip && (
          <button onClick={handlePaste}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-400/40 text-blue-300 hover:bg-blue-500/30 text-xs font-medium transition-all"
          ><Clipboard className="w-3.5 h-3.5" />붙여넣기</button>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={e => { e.stopPropagation(); goToPrev() }} disabled={selectedIndex === 0}
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/10 text-white/50 hover:text-white hover:border-white/30 disabled:opacity-30 transition-all"
          ><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-xs text-white/40 tabular-nums w-10 text-center">{selectedIndex + 1} / {slides.length}</span>
          <button onClick={e => { e.stopPropagation(); goToNext() }} disabled={selectedIndex === slides.length - 1}
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/10 text-white/50 hover:text-white hover:border-white/30 disabled:opacity-30 transition-all"
          ><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* 카드 미리보기 */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div ref={cardRef}
          className={cn("relative w-full max-w-sm shadow-2xl shadow-black/50 overflow-visible",
            aspectMode === "square" ? "aspect-square" : "aspect-[9/16]")}
          style={{ borderRadius: 12 }}
          onClick={e => e.stopPropagation()}
        >
          {/* 배경 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderRadius: 12 }}>
            {slide.bgImageUrl
              ? <><div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.bgImageUrl})` }} /><div className="absolute inset-0 bg-black/30" /></>
              : <div className="absolute inset-0" style={{ background: slide.bgStyle.background }} />}
          </div>

          {slide.logoUrl && (
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <img src={slide.logoUrl} alt="logo" className="h-8 max-w-[120px] object-contain" />
            </div>
          )}

          {slide.productImageUrl && (
            <div className={cn("absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none",
              (slide.productImagePosition ?? "top") === "top" ? "top-6"
                : (slide.productImagePosition ?? "top") === "center" ? "top-1/2 -translate-y-1/2"
                : "bottom-6")}
              style={{ width: `${PRODUCT_IMAGE_SIZE_MAP[slide.productImageSize ?? "md"]}%` }}>
              <img src={slide.productImageUrl} alt="product" className="w-full h-auto object-contain drop-shadow-lg" />
            </div>
          )}

          {/* 고정 텍스트 */}
          <div className="absolute inset-0 flex flex-col p-6 md:p-8"
            style={{ fontFamily: fontCss, justifyContent: (slide.verticalAlign ?? "middle") === "top" ? "flex-start" : (slide.verticalAlign ?? "middle") === "bottom" ? "flex-end" : "center" }}>
            <div className={cn("flex flex-col gap-3", alignClass)}>
              {renderField("subtitle", slide.subtitle ?? "",
                <p className="text-sm font-medium opacity-80 whitespace-pre-line" style={{ color: slide.bgStyle.titleColor }}>{slide.subtitle}</p>
              )}
              {renderField("title", slide.title,
                <h2 className={cn("font-bold leading-tight whitespace-pre-line", titleClass)} style={{ color: slide.bgStyle.titleColor }}>{slide.title || "제목을 입력하세요"}</h2>
              )}
              {renderField("content", slide.content,
                <p className={cn("leading-relaxed whitespace-pre-line", contentClass)} style={{ color: slide.bgStyle.textColor }}>{slide.content || "내용을 입력하세요"}</p>
              )}
              {slide.cta && renderField("cta", slide.cta,
                <div className={cn("flex", slide.textAlign === "right" ? "justify-end" : slide.textAlign === "center" ? "justify-center" : "justify-start")}>
                  <span className="inline-block px-5 py-2.5 text-sm font-bold rounded-full" style={{ backgroundColor: slide.bgStyle.ctaBg, color: slide.bgStyle.ctaText }}>{slide.cta}</span>
                </div>
              )}
            </div>
          </div>

          {/* 자유 텍스트 레이어 */}
          <div className="absolute inset-0 p-6" style={{ fontFamily: fontCss }}>
            <div className="relative w-full h-full">
              {(slide.extraTexts ?? []).map(et => (
                <div key={et.id} className="absolute top-0 left-0">{renderExtra(et)}</div>
              ))}
            </div>
          </div>

          <div className="absolute top-3 right-3 z-10 pointer-events-none">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "rgba(0,0,0,0.3)", color: "rgba(255,255,255,0.7)", backdropFilter: "blur(4px)" }}>
              {selectedIndex + 1}/{slides.length}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => onSlideChange(i)}
            className={cn("h-1.5 rounded-full transition-all", i === selectedIndex ? "w-6 bg-primary" : "w-1.5 bg-white/25 hover:bg-white/50")} />
        ))}
      </div>
    </div>
  )
}
