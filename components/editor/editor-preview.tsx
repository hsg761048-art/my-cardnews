"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Smartphone, Square, Copy, Clipboard, X, Bold, Move } from "lucide-react"
import type { Slide, ExtraText } from "./editor-types"
import { FONT_OPTIONS, FONT_SIZE_MAP, CONTENT_SIZE_MAP, ALIGN_MAP, PRODUCT_IMAGE_SIZE_MAP } from "./editor-types"

type AspectMode = "square" | "story"
type FieldKey = "subtitle" | "title" | "content" | "cta"
interface ClipItem { content: string; color: string; bold: boolean }

interface EditorPreviewProps {
  slides: Slide[]
  selectedIndex: number
  onSlideChange: (index: number) => void
  onSlideUpdate?: (updates: Partial<Slide>) => void
}

// ─── Module-level TextBlock component (NOT inside EditorPreview) ───────────
interface TextBlockProps {
  targetId: string
  targetKind: "field" | "extra"
  offset: { x: number; y: number }
  widthStyle: string
  bold: boolean
  isSelected: boolean
  isEditing: boolean
  editingValue: string
  isDragging: boolean
  isResizing: boolean
  storedW?: number
  onPointerDownMove: (e: React.PointerEvent) => void
  onPointerDownResize: (e: React.PointerEvent) => void
  onClickItem: (e: React.MouseEvent) => void
  onBold: (e: React.MouseEvent) => void
  onCopy: (e: React.MouseEvent) => void
  onDelete?: (e: React.MouseEvent) => void
  onEditChange: (val: string, el: HTMLTextAreaElement) => void
  onEditBlur: () => void
  onEditKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  children: React.ReactNode
}

function TextBlock({
  targetId, targetKind, offset, widthStyle, bold,
  isSelected, isEditing, editingValue,
  isDragging, isResizing, storedW,
  onPointerDownMove, onPointerDownResize, onClickItem,
  onBold, onCopy, onDelete,
  onEditChange, onEditBlur, onEditKeyDown,
  children,
}: TextBlockProps) {
  return (
    <div
      className={cn("relative group", !isEditing && "cursor-pointer")}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: isDragging ? "none" : "transform 0.1s ease",
        width: widthStyle,
        minWidth: "4ch",
        zIndex: isSelected || isEditing ? 20 : undefined,
      }}
      onClick={onClickItem}
    >
      {/* Selection / hover border */}
      <div className={cn(
        "absolute -inset-1.5 rounded pointer-events-none border-2 transition-all",
        isSelected || isEditing
          ? "opacity-100 border-blue-400 bg-blue-400/5"
          : "opacity-0 group-hover:opacity-70 border-white/50"
      )} />

      {/* Hover hint */}
      {!isSelected && !isEditing && (
        <div className="absolute -top-6 left-0 opacity-0 group-hover:opacity-100 pointer-events-none z-30 transition-opacity">
          <span className="text-[10px] bg-black/70 text-white px-2 py-0.5 rounded whitespace-nowrap">클릭: 선택</span>
        </div>
      )}

      {/* Toolbar */}
      {(isSelected || isEditing) && (
        <div
          className="absolute -top-11 left-0 flex items-center gap-1 bg-black/85 backdrop-blur-sm rounded-xl px-2 py-1.5 z-50 shadow-xl"
          onClick={e => e.stopPropagation()}
          onPointerDown={e => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div
            className="w-7 h-7 flex items-center justify-center rounded text-white/50 hover:bg-white/20 hover:text-white cursor-move transition-all"
            onPointerDown={onPointerDownMove}
            title="드래그하여 이동"
          >
            <Move className="w-3.5 h-3.5" />
          </div>
          <div className="w-px h-4 bg-white/20 mx-0.5" />
          <button
            onClick={onBold}
            title="굵게"
            className={cn("w-7 h-7 flex items-center justify-center rounded text-sm font-black transition-all",
              bold ? "bg-blue-500 text-white" : "text-white/70 hover:bg-white/20 hover:text-white")}
          >B</button>
          <div className="w-px h-4 bg-white/20 mx-0.5" />
          <button
            onClick={onCopy}
            title="복사"
            className="w-7 h-7 flex items-center justify-center rounded text-white/70 hover:bg-white/20 hover:text-white transition-all"
          ><Copy className="w-3.5 h-3.5" /></button>
          {onDelete && (
            <>
              <div className="w-px h-4 bg-white/20 mx-0.5" />
              <button
                onClick={onDelete}
                title="삭제"
                className="w-7 h-7 flex items-center justify-center rounded text-red-400 hover:bg-red-500/20 transition-all"
              ><X className="w-3.5 h-3.5" /></button>
            </>
          )}
          <div className="w-px h-4 bg-white/20 mx-0.5" />
          <span className="text-white/40 text-[10px] whitespace-nowrap">
            {isEditing ? "Enter·저장 Esc·취소" : "클릭: 편집"}
          </span>
        </div>
      )}

      {/* Resize handle */}
      {(isSelected || isEditing) && (
        <div
          className="absolute -right-3 top-0 bottom-0 w-5 flex items-center justify-center cursor-ew-resize z-40"
          onPointerDown={onPointerDownResize}
          onClick={e => e.stopPropagation()}
          title="드래그하여 너비 조절"
        >
          <div className={cn("w-1.5 h-8 rounded-full", isResizing ? "bg-blue-300" : "bg-blue-500/70 hover:bg-blue-400")} />
        </div>
      )}

      {/* Content: textarea if editing, else static */}
      {isEditing ? (
        <textarea
          autoFocus
          className="block w-full bg-transparent outline-none resize-none overflow-hidden cursor-text"
          style={{
            color: "inherit", fontFamily: "inherit", fontSize: "inherit",
            fontWeight: "inherit", lineHeight: "inherit",
            textAlign: "inherit" as React.CSSProperties["textAlign"],
            padding: 0, border: "none", margin: 0,
          }}
          value={editingValue}
          onChange={e => onEditChange(e.target.value, e.target)}
          onBlur={onEditBlur}
          onKeyDown={onEditKeyDown}
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <div style={{ fontWeight: bold ? 700 : undefined }}>{children}</div>
      )}
    </div>
  )
}

// ─── Main EditorPreview ────────────────────────────────────────────────────
export function EditorPreview({ slides, selectedIndex, onSlideChange, onSlideUpdate }: EditorPreviewProps) {
  const [aspectMode, setAspectMode] = useState<AspectMode>("square")
  // sel: which element is selected (targetId) and its kind
  const [sel, setSel] = useState<{ id: string; kind: "field" | "extra" } | null>(null)
  // editing: which element is being edited inline
  const [editing, setEditing] = useState<{ id: string; kind: "field" | "extra" } | null>(null)
  const [editValue, setEditValue] = useState("")
  const [liveOffset, setLiveOffset] = useState<{ id: string; x: number; y: number } | null>(null)
  const [liveWidth, setLiveWidth] = useState<{ id: string; w: number } | null>(null)
  const [clip, setClip] = useState<ClipItem | null>(null)

  const cardRef = useRef<HTMLDivElement>(null)
  const slideRef = useRef(slides[selectedIndex])
  const onUpdateRef = useRef(onSlideUpdate)

  // Drag tracking refs
  const moveDrag = useRef<{
    pointerId: number; el: Element
    targetId: string; targetKind: "field" | "extra"
    sx: number; sy: number; ox: number; oy: number; lx: number; ly: number; moved: boolean
  } | null>(null)
  const resizeDrag = useRef<{
    pointerId: number; el: Element
    targetId: string; targetKind: "field" | "extra"
    sx: number; sw: number; cw: number
  } | null>(null)

  useEffect(() => {
    slideRef.current = slides[selectedIndex]
    onUpdateRef.current = onSlideUpdate
  })

  // ── Pointer-capture drag handlers ─────────────────────────────
  const handlePointerMoveGlobal = useCallback((e: PointerEvent) => {
    if (moveDrag.current && e.pointerId === moveDrag.current.pointerId) {
      const d = moveDrag.current
      const dx = e.clientX - d.sx, dy = e.clientY - d.sy
      if (!d.moved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) d.moved = true
      if (d.moved) {
        d.lx = d.ox + dx; d.ly = d.oy + dy
        setLiveOffset({ id: d.targetId, x: d.lx, y: d.ly })
      }
    }
    if (resizeDrag.current && e.pointerId === resizeDrag.current.pointerId) {
      const r = resizeDrag.current
      const dx = e.clientX - r.sx
      const pw = Math.max(r.cw * 0.15, r.sw + dx)
      const pct = Math.min(100, (pw / r.cw) * 100)
      setLiveWidth({ id: r.targetId, w: pct })
    }
  }, [])

  const handlePointerUpGlobal = useCallback((e: PointerEvent) => {
    const slide = slideRef.current
    if (moveDrag.current && e.pointerId === moveDrag.current.pointerId) {
      const d = moveDrag.current
      try { d.el.releasePointerCapture(d.pointerId) } catch {}
      if (d.moved) {
        if (d.targetKind === "field") {
          onUpdateRef.current?.({ textOffsets: { ...(slide.textOffsets ?? {}), [d.targetId]: { x: d.lx, y: d.ly } } })
        } else {
          onUpdateRef.current?.({ extraTexts: (slide.extraTexts ?? []).map(ex => ex.id === d.targetId ? { ...ex, offset: { x: d.lx, y: d.ly } } : ex) })
        }
        setLiveOffset(null)
      }
      moveDrag.current = null
    }
    if (resizeDrag.current && e.pointerId === resizeDrag.current.pointerId) {
      const r = resizeDrag.current
      try { r.el.releasePointerCapture(r.pointerId) } catch {}
      setLiveWidth(prev => {
        if (prev && prev.id === r.targetId) {
          if (r.targetKind === "field") onUpdateRef.current?.({ textWidths: { ...(slide.textWidths ?? {}), [r.targetId]: prev.w } })
          else onUpdateRef.current?.({ extraTexts: (slide.extraTexts ?? []).map(ex => ex.id === r.targetId ? { ...ex, width: prev.w } : ex) })
          return null
        }
        return prev
      })
      resizeDrag.current = null
    }
  }, [])

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMoveGlobal)
    window.addEventListener("pointerup", handlePointerUpGlobal)
    return () => {
      window.removeEventListener("pointermove", handlePointerMoveGlobal)
      window.removeEventListener("pointerup", handlePointerUpGlobal)
    }
  }, [handlePointerMoveGlobal, handlePointerUpGlobal])

  const slide = slides[selectedIndex]
  if (!slide) return null

  const fontCss = FONT_OPTIONS.find(f => f.value === slide.fontFamily)?.css ?? "sans-serif"
  const titleClass = FONT_SIZE_MAP[slide.titleSize].title
  const contentClass = CONTENT_SIZE_MAP[slide.contentSize].content
  const alignClass = ALIGN_MAP[slide.textAlign]

  const getFieldOff = (f: FieldKey) =>
    liveOffset?.id === f ? { x: liveOffset.x, y: liveOffset.y } : (slide.textOffsets?.[f] ?? { x: 0, y: 0 })
  const getExtraOff = (id: string) =>
    liveOffset?.id === id ? { x: liveOffset.x, y: liveOffset.y } : ((slide.extraTexts ?? []).find(e => e.id === id)?.offset ?? { x: 0, y: 0 })
  const getW = (id: string, stored?: number) =>
    liveWidth?.id === id ? `${liveWidth.w}%` : stored ? `${stored}%` : "auto"
  const fBold = (f: FieldKey) => slide.textBold?.[f] ?? false

  // Commit edits
  const commitEdit = () => {
    if (!editing) return
    const { id, kind } = editing
    const s = slideRef.current
    if (kind === "field") {
      onUpdateRef.current?.({ [id]: editValue })
    } else {
      onUpdateRef.current?.({ extraTexts: (s.extraTexts ?? []).map(e => e.id === id ? { ...e, content: editValue } : e) })
    }
    setEditing(null)
  }

  // Click on a text element: first click = select, second = edit
  const handleItemClick = (e: React.MouseEvent, id: string, kind: "field" | "extra") => {
    e.stopPropagation()
    if (moveDrag.current?.moved) return // was a drag
    if (sel?.id === id && sel.kind === kind && !editing) {
      // Second click → enter edit mode
      const s = slideRef.current
      const val = kind === "field"
        ? (id === "title" ? s.title : id === "subtitle" ? (s.subtitle ?? "") : id === "content" ? s.content : (s.cta ?? ""))
        : ((s.extraTexts ?? []).find(ex => ex.id === id)?.content ?? "")
      setEditValue(val)
      setEditing({ id, kind })
    } else if (editing?.id === id && editing.kind === kind) {
      // Already editing, do nothing
    } else {
      // First click → select
      setSel({ id, kind })
      setEditing(null)
    }
  }

  // Start a MOVE drag from toolbar drag handle
  const startMoveDrag = (e: React.PointerEvent, id: string, kind: "field" | "extra", off: { x: number; y: number }) => {
    e.stopPropagation()
    const el = e.currentTarget
    try { el.setPointerCapture(e.pointerId) } catch {}
    moveDrag.current = {
      pointerId: e.pointerId, el,
      targetId: id, targetKind: kind,
      sx: e.clientX, sy: e.clientY,
      ox: off.x, oy: off.y, lx: off.x, ly: off.y, moved: false,
    }
  }

  // Start a RESIZE drag
  const startResizeDrag = (e: React.PointerEvent, id: string, kind: "field" | "extra", storedW?: number) => {
    e.stopPropagation()
    const el = e.currentTarget
    try { el.setPointerCapture(e.pointerId) } catch {}
    const cw = cardRef.current?.getBoundingClientRect().width ?? 384
    resizeDrag.current = {
      pointerId: e.pointerId, el,
      targetId: id, targetKind: kind,
      sx: e.clientX, sw: ((storedW ?? 100) / 100) * cw, cw,
    }
  }

  const handlePaste = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!clip) return
    const neo: ExtraText = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      content: clip.content, color: clip.color, bold: clip.bold, offset: { x: 24, y: 24 },
    }
    onUpdateRef.current?.({ extraTexts: [...(slide.extraTexts ?? []), neo] })
    setSel({ id: neo.id, kind: "extra" })
  }

  // Render a fixed text field
  const renderField = (field: FieldKey, value: string, staticEl: React.ReactNode) => {
    if (!value && field !== "title" && field !== "content") return null
    const off = getFieldOff(field)
    const isSelected = sel?.id === field && sel.kind === "field"
    const isEditing = editing?.id === field && editing.kind === "field"
    const bold = fBold(field)
    const isDragging = liveOffset?.id === field && (moveDrag.current?.targetId === field)
    const isResizing = liveWidth?.id === field

    return (
      <TextBlock
        key={field}
        targetId={field} targetKind="field"
        offset={off} widthStyle={getW(field, slide.textWidths?.[field])}
        bold={bold} isSelected={isSelected} isEditing={isEditing}
        editingValue={editValue} isDragging={!!isDragging} isResizing={!!isResizing}
        storedW={slide.textWidths?.[field]}
        onClickItem={e => handleItemClick(e, field, "field")}
        onPointerDownMove={e => startMoveDrag(e, field, "field", off)}
        onPointerDownResize={e => startResizeDrag(e, field, "field", slide.textWidths?.[field])}
        onBold={e => { e.stopPropagation(); onUpdateRef.current?.({ textBold: { ...(slide.textBold ?? {}), [field]: !bold } }) }}
        onCopy={e => {
          e.stopPropagation()
          const c = field === "title" ? slide.title : field === "subtitle" ? (slide.subtitle ?? "") : field === "content" ? slide.content : (slide.cta ?? "")
          setClip({ content: c, color: field === "content" ? slide.bgStyle.textColor : slide.bgStyle.titleColor, bold })
        }}
        onEditChange={(val, el) => { setEditValue(val); el.style.height = "auto"; el.style.height = el.scrollHeight + "px" }}
        onEditBlur={commitEdit}
        onEditKeyDown={e => {
          e.stopPropagation()
          if (e.key === "Escape") { setEditing(null) }
          if (field !== "content" && e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitEdit() }
        }}
      >
        {staticEl}
      </TextBlock>
    )
  }

  // Render an extra (free-floating) text layer
  const renderExtra = (et: ExtraText) => {
    const off = getExtraOff(et.id)
    const isSelected = sel?.id === et.id && sel.kind === "extra"
    const isEditing = editing?.id === et.id && editing.kind === "extra"
    const isDragging = liveOffset?.id === et.id
    const isResizing = liveWidth?.id === et.id

    return (
      <TextBlock
        key={et.id}
        targetId={et.id} targetKind="extra"
        offset={off} widthStyle={getW(et.id, et.width)}
        bold={et.bold} isSelected={isSelected} isEditing={isEditing}
        editingValue={editValue} isDragging={!!isDragging} isResizing={!!isResizing}
        storedW={et.width}
        onClickItem={e => handleItemClick(e, et.id, "extra")}
        onPointerDownMove={e => startMoveDrag(e, et.id, "extra", off)}
        onPointerDownResize={e => startResizeDrag(e, et.id, "extra", et.width)}
        onBold={e => { e.stopPropagation(); onUpdateRef.current?.({ extraTexts: (slide.extraTexts ?? []).map(x => x.id === et.id ? { ...x, bold: !x.bold } : x) }) }}
        onCopy={e => { e.stopPropagation(); setClip({ content: et.content, color: et.color, bold: et.bold }) }}
        onDelete={e => { e.stopPropagation(); onUpdateRef.current?.({ extraTexts: (slide.extraTexts ?? []).filter(x => x.id !== et.id) }); setSel(null) }}
        onEditChange={(val, el) => { setEditValue(val); el.style.height = "auto"; el.style.height = el.scrollHeight + "px" }}
        onEditBlur={commitEdit}
        onEditKeyDown={e => {
          e.stopPropagation()
          if (e.key === "Escape") { setEditing(null) }
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitEdit() }
        }}
      >
        <p className="text-base leading-relaxed whitespace-pre-line" style={{ color: et.color }}>{et.content || "텍스트 입력"}</p>
      </TextBlock>
    )
  }

  const goToPrev = () => { if (selectedIndex > 0) onSlideChange(selectedIndex - 1) }
  const goToNext = () => { if (selectedIndex < slides.length - 1) onSlideChange(selectedIndex + 1) }

  const clearSelection = () => {
    if (editing) commitEdit()
    else { setSel(null); setEditing(null) }
  }

  return (
    <div className="flex flex-col items-center h-full py-6 px-4 gap-4" onClick={clearSelection}>
      {/* 상단 컨트롤 */}
      <div className="flex items-center gap-4 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
          <button onClick={() => setAspectMode("square")}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              aspectMode === "square" ? "bg-primary text-primary-foreground shadow" : "text-white/50 hover:text-white/80")}
          ><Square className="w-3 h-3" />1:1</button>
          <button onClick={() => setAspectMode("story")}
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
          <button onClick={goToPrev} disabled={selectedIndex === 0}
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/10 text-white/50 hover:text-white hover:border-white/30 disabled:opacity-30 transition-all"
          ><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-xs text-white/40 tabular-nums w-10 text-center">{selectedIndex + 1} / {slides.length}</span>
          <button onClick={goToNext} disabled={selectedIndex === slides.length - 1}
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
                : (slide.productImagePosition ?? "top") === "center" ? "top-1/2 -translate-y-1/2" : "bottom-6")}
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
