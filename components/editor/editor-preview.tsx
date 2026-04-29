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

  // refs to avoid stale closures
  const cardRef = useRef<HTMLDivElement>(null)
  const slideRef = useRef(slides[selectedIndex])
  const onUpdateRef = useRef(onSlideUpdate)
  const selRef = useRef<SelTarget | null>(null)
  const liveWidthRef = useRef<{ id: string; w: number } | null>(null)

  useEffect(() => { slideRef.current = slides[selectedIndex]; onUpdateRef.current = onSlideUpdate })

  const setSel2 = (s: SelTarget | null) => { selRef.current = s; setSel(s) }
  const setLiveWidth2 = (v: { id: string; w: number } | null) => { liveWidthRef.current = v; setLiveWidth(v) }

  // drag ref
  const dr = useRef<{
    type: "move" | "resize"
    targetId: string; targetKind: "field" | "extra"
    sx: number; sy: number; ox: number; oy: number
    moved: boolean; lx: number; ly: number
    sw: number; cw: number
  } | null>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dr.current) return
      const dx = e.clientX - dr.current.sx, dy = e.clientY - dr.current.sy
      if (dr.current.type === "move") {
        if (!dr.current.moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) dr.current.moved = true
        if (dr.current.moved) {
          dr.current.lx = dr.current.ox + dx; dr.current.ly = dr.current.oy + dy
          setLiveOffset({ id: dr.current.targetId, x: dr.current.lx, y: dr.current.ly })
        }
      } else {
        const pw = Math.max(dr.current.cw * 0.15, dr.current.sw + dx)
        setLiveWidth2({ id: dr.current.targetId, w: Math.min(100, (pw / dr.current.cw) * 100) })
      }
    }
    const onUp = () => {
      if (!dr.current) return
      const d = dr.current, slide = slideRef.current
      if (d.type === "move") {
        if (d.moved) {
          if (d.targetKind === "field") {
            onUpdateRef.current?.({ textOffsets: { ...(slide.textOffsets ?? {}), [d.targetId]: { x: d.lx, y: d.ly } } })
          } else {
            onUpdateRef.current?.({ extraTexts: (slide.extraTexts ?? []).map(e => e.id === d.targetId ? { ...e, offset: { x: d.lx, y: d.ly } } : e) })
          }
          setLiveOffset(null)
        } else {
          const cur = selRef.current
          const same = cur?.kind === d.targetKind && ((cur as any).field === d.targetId || (cur as any).id === d.targetId)
          if (same) {
            const val = d.targetKind === "field"
              ? (d.targetId === "title" ? slide.title : d.targetId === "subtitle" ? (slide.subtitle ?? "") : d.targetId === "content" ? slide.content : (slide.cta ?? ""))
              : ((slide.extraTexts ?? []).find(e => e.id === d.targetId)?.content ?? "")
            setEditingValue(val)
            if (d.targetKind === "field") setEditingField(d.targetId as TextFieldKey)
            else setEditingExtraId(d.targetId)
          } else {
            setSel2(d.targetKind === "field" ? { kind: "field", field: d.targetId as TextFieldKey } : { kind: "extra", id: d.targetId })
            setEditingField(null); setEditingExtraId(null)
          }
        }
      } else {
        const lw = liveWidthRef.current
        if (lw) {
          if (d.targetKind === "field") {
            onUpdateRef.current?.({ textWidths: { ...(slide.textWidths ?? {}), [d.targetId]: lw.w } })
          } else {
            onUpdateRef.current?.({ extraTexts: (slide.extraTexts ?? []).map(e => e.id === d.targetId ? { ...e, width: lw.w } : e) })
          }
          setLiveWidth2(null)
        }
      }
      dr.current = null
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

  const getFieldOffset = (f: TextFieldKey) => liveOffset?.id === f ? { x: liveOffset.x, y: liveOffset.y } : (slide.textOffsets?.[f] ?? { x: 0, y: 0 })
  const getExtraOffset = (id: string) => liveOffset?.id === id ? { x: liveOffset.x, y: liveOffset.y } : ((slide.extraTexts ?? []).find(e => e.id === id)?.offset ?? { x: 0, y: 0 })
  const getW = (id: string, stored?: number) => liveWidth?.id === id ? `${liveWidth.w}%` : stored ? `${stored}%` : "auto"
  const fieldBold = (f: TextFieldKey) => slide.textBold?.[f] ?? false

  const commitField = () => { if (!editingField) return; onUpdateRef.current?.({ [editingField]: editingValue }); setEditingField(null) }
  const commitExtra = () => {
    if (!editingExtraId) return
    onUpdateRef.current?.({ extraTexts: (slide.extraTexts ?? []).map(e => e.id === editingExtraId ? { ...e, content: editingValue } : e) })
    setEditingExtraId(null)
  }

  const startMove = (e: React.MouseEvent, targetId: string, targetKind: "field" | "extra", offset: { x: number; y: number }) => {
    e.preventDefault(); e.stopPropagation()
    dr.current = { type: "move", targetId, targetKind, sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y, moved: false, lx: offset.x, ly: offset.y, sw: 0, cw: 0 }
  }
  const startResize = (e: React.MouseEvent, targetId: string, targetKind: "field" | "extra", storedW?: number) => {
    e.preventDefault(); e.stopPropagation()
    const cw = cardRef.current?.getBoundingClientRect().width ?? 384
    dr.current = { type: "resize", targetId, targetKind, sx: e.clientX, sy: e.clientY, ox: 0, oy: 0, moved: false, lx: 0, ly: 0, sw: ((storedW ?? 100) / 100) * cw, cw }
  }

  const handleCopyField = (e: React.MouseEvent, field: TextFieldKey) => {
    e.stopPropagation()
    const content = field === "title" ? slide.title : field === "subtitle" ? (slide.subtitle ?? "") : field === "content" ? slide.content : (slide.cta ?? "")
    const color = field === "content" ? slide.bgStyle.textColor : slide.bgStyle.titleColor
    setClip({ content, color, bold: fieldBold(field) })
  }
  const handleCopyExtra = (e: React.MouseEvent, et: ExtraText) => { e.stopPropagation(); setClip({ content: et.content, color: et.color, bold: et.bold }) }
  const handlePaste = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!clip) return
    const neo: ExtraText = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), content: clip.content, color: clip.color, bold: clip.bold, offset: { x: 24, y: 24 } }
    onUpdateRef.current?.({ extraTexts: [...(slide.extraTexts ?? []), neo] })
    setSel2({ kind: "extra", id: neo.id })
  }
  const handleDeleteExtra = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    onUpdateRef.current?.({ extraTexts: (slide.extraTexts ?? []).filter(e => e.id !== id) })
    setSel2(null)
  }

  // Shared toolbar
  const Toolbar = ({ bold, onBold, onCopy, editing, onDelete }: { bold: boolean; onBold: (e: React.MouseEvent) => void; onCopy: (e: React.MouseEvent) => void; editing: boolean; onDelete?: (e: React.MouseEvent) => void }) => (
    <div className="absolute -top-11 left-0 flex items-center gap-1 bg-black/85 backdrop-blur-sm rounded-xl px-2 py-1.5 z-50 shadow-xl whitespace-nowrap"
      onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
      <button onClick={onBold} title="굵게"
        className={cn("w-7 h-7 flex items-center justify-center rounded text-sm font-black transition-all", bold ? "bg-blue-500 text-white" : "text-white/70 hover:bg-white/20 hover:text-white")}>B</button>
      <div className="w-px h-4 bg-white/20 mx-0.5" />
      <button onClick={onCopy} title="복사" className="w-7 h-7 flex items-center justify-center rounded text-white/70 hover:bg-white/20 hover:text-white transition-all">
        <Copy className="w-3.5 h-3.5" />
      </button>
      {onDelete && <><div className="w-px h-4 bg-white/20 mx-0.5" /><button onClick={onDelete} title="삭제" className="w-7 h-7 flex items-center justify-center rounded text-red-400 hover:bg-red-500/20 transition-all"><X className="w-3.5 h-3.5" /></button></>}
      <div className="w-px h-4 bg-white/20 mx-0.5" />
      <span className="text-white/40 text-[10px]">{editing ? "Enter: 저장 · Esc: 취소" : "클릭: 편집"}</span>
    </div>
  )

  // Shared editable block
  const EditBlock = ({
    targetId, targetKind, isSelEl, isEditEl, offset, width, bold,
    toolbar, staticEl, storedW,
  }: {
    targetId: string; targetKind: "field" | "extra"
    isSelEl: boolean; isEditEl: boolean
    offset: { x: number; y: number }; width: string; bold: boolean
    toolbar: React.ReactNode; staticEl: React.ReactNode; storedW?: number
  }) => {
    const isDrag = liveOffset?.id === targetId
    const isRes = liveWidth?.id === targetId
    return (
      <div
        className={cn("relative group", !isEditEl && "cursor-move")}
        style={{ transform: `translate(${offset.x}px,${offset.y}px)`, transition: isDrag ? "none" : "transform 0.1s ease", width, minWidth: "4ch", zIndex: isSelEl || isEditEl ? 20 : undefined, fontWeight: bold ? 900 : undefined }}
        onMouseDown={e => { if (!isEditEl) startMove(e, targetId, targetKind, offset) }}
        onClick={e => e.stopPropagation()}
      >
        <div className={cn("absolute -inset-1.5 rounded pointer-events-none border-2 transition-opacity duration-150",
          isSelEl || isEditEl ? "opacity-100 border-blue-400" : "opacity-0 group-hover:opacity-60 border-white/60")} />
        {!isSelEl && !isEditEl && (
          <div className="absolute -top-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
            <span className="text-[10px] bg-black/70 text-white px-2 py-0.5 rounded whitespace-nowrap">드래그: 이동 · 클릭: 선택</span>
          </div>
        )}
        {(isSelEl || isEditEl) && toolbar}
        {(isSelEl || isEditEl) && (
          <div className="absolute -right-2 top-0 bottom-0 w-4 flex items-center justify-center cursor-ew-resize z-40"
            onMouseDown={e => startResize(e, targetId, targetKind, storedW)} onClick={e => e.stopPropagation()} title="너비 조절">
            <div className={cn("w-1.5 h-10 max-h-full rounded-full transition-colors", isRes ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-300")} />
          </div>
        )}
        {staticEl}
      </div>
    )
  }

  // Inline textarea
  const InlineTextarea = ({ onBlur, onKeyDownExtra }: { onBlur: () => void; onKeyDownExtra?: (e: React.KeyboardEvent) => void }) => (
    <textarea autoFocus
      className="block w-full bg-transparent outline-none resize-none overflow-hidden cursor-text pr-3"
      style={{ color: "inherit", fontFamily: "inherit", fontSize: "inherit", fontWeight: "inherit", lineHeight: "inherit", textAlign: "inherit" as any, minWidth: "8ch", padding: 0, border: "none" }}
      value={editingValue}
      onChange={e => { setEditingValue(e.target.value); e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px" }}
      onBlur={onBlur}
      onKeyDown={e => { e.stopPropagation(); if (e.key === "Escape") { setEditingField(null); setEditingExtraId(null) }; onKeyDownExtra?.(e) }}
    />
  )

  const renderField = (field: TextFieldKey, value: string, staticEl: React.ReactNode) => {
    if (!value && field !== "title" && field !== "content") return null
    const offset = getFieldOffset(field)
    const isSelEl = sel?.kind === "field" && (sel as any).field === field
    const isEditEl = editingField === field
    const bold = fieldBold(field)
    const toolbar = <Toolbar bold={bold}
      onBold={e => { e.stopPropagation(); onUpdateRef.current?.({ textBold: { ...(slide.textBold ?? {}), [field]: !bold } }) }}
      onCopy={e => handleCopyField(e, field)} editing={isEditEl} />
    const content = isEditEl
      ? <InlineTextarea onBlur={commitField} onKeyDownExtra={e => { if (e.key === "Enter" && !e.shiftKey && field !== "content") { e.preventDefault(); commitField() } }} />
      : staticEl
    return <EditBlock key={field} targetId={field} targetKind="field" isSelEl={isSelEl} isEditEl={isEditEl}
      offset={offset} width={getW(field, slide.textWidths?.[field])} bold={bold}
      toolbar={toolbar} staticEl={content} storedW={slide.textWidths?.[field]} />
  }

  const renderExtra = (et: ExtraText) => {
    const offset = getExtraOffset(et.id)
    const isSelEl = sel?.kind === "extra" && (sel as any).id === et.id
    const isEditEl = editingExtraId === et.id
    const toolbar = <Toolbar bold={et.bold}
      onBold={e => { e.stopPropagation(); onUpdateRef.current?.({ extraTexts: (slide.extraTexts ?? []).map(x => x.id === et.id ? { ...x, bold: !x.bold } : x) }) }}
      onCopy={e => handleCopyExtra(e, et)} editing={isEditEl} onDelete={e => handleDeleteExtra(e, et.id)} />
    const content = isEditEl
      ? <InlineTextarea onBlur={commitExtra} onKeyDownExtra={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitExtra() } }} />
      : <p className="text-base leading-relaxed whitespace-pre-line" style={{ color: et.color, fontWeight: et.bold ? 900 : undefined }}>{et.content || "텍스트 입력"}</p>
    return <EditBlock key={et.id} targetId={et.id} targetKind="extra" isSelEl={isSelEl} isEditEl={isEditEl}
      offset={offset} width={getW(et.id, et.width)} bold={et.bold}
      toolbar={toolbar} staticEl={content} storedW={et.width} />
  }

  const goToPrev = () => { if (selectedIndex > 0) onSlideChange(selectedIndex - 1) }
  const goToNext = () => { if (selectedIndex < slides.length - 1) onSlideChange(selectedIndex + 1) }

  return (
    <div className="flex flex-col items-center h-full py-6 px-4 gap-4"
      onClick={() => { if (editingField) commitField(); if (editingExtraId) commitExtra(); setSel2(null); setEditingField(null); setEditingExtraId(null) }}>

      {/* 상단 컨트롤 */}
      <div className="flex items-center gap-4 w-full max-w-sm">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
          <button onClick={() => setAspectMode("square")}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all", aspectMode === "square" ? "bg-primary text-primary-foreground shadow" : "text-white/50 hover:text-white/80")}>
            <Square className="w-3 h-3" />1:1</button>
          <button onClick={() => setAspectMode("story")}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all", aspectMode === "story" ? "bg-primary text-primary-foreground shadow" : "text-white/50 hover:text-white/80")}>
            <Smartphone className="w-3 h-3" />9:16</button>
        </div>

        {clip && (
          <button onClick={handlePaste}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-400/40 text-blue-300 hover:bg-blue-500/30 text-xs font-medium transition-all">
            <Clipboard className="w-3.5 h-3.5" />붙여넣기</button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <button onClick={goToPrev} disabled={selectedIndex === 0}
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/10 text-white/50 hover:text-white hover:border-white/30 disabled:opacity-30 transition-all">
            <ChevronLeft className="w-4 h-4" /></button>
          <span className="text-xs text-white/40 tabular-nums w-10 text-center">{selectedIndex + 1} / {slides.length}</span>
          <button onClick={goToNext} disabled={selectedIndex === slides.length - 1}
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/10 text-white/50 hover:text-white hover:border-white/30 disabled:opacity-30 transition-all">
            <ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* 카드 미리보기 */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div ref={cardRef}
          className={cn("relative w-full max-w-sm shadow-2xl shadow-black/50 overflow-visible", aspectMode === "square" ? "aspect-square" : "aspect-[9/16]")}
          style={{ borderRadius: 12 }}>

          {/* 배경 (pointer-events-none → 클릭 차단 안 함) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderRadius: 12 }}>
            {slide.bgImageUrl ? (
              <><div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${slide.bgImageUrl})` }} />
                <div className="absolute inset-0 bg-black/30" /></>
            ) : <div className="absolute inset-0" style={{ background: slide.bgStyle.background }} />}
          </div>

          {slide.logoUrl && <div className="absolute top-4 left-4 z-10"><img src={slide.logoUrl} alt="logo" className="h-8 max-w-[120px] object-contain" /></div>}
          {slide.productImageUrl && (
            <div className={cn("absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none",
              (slide.productImagePosition ?? "top") === "top" && "top-6",
              (slide.productImagePosition ?? "top") === "center" && "top-1/2 -translate-y-1/2",
              (slide.productImagePosition ?? "top") === "bottom" && "bottom-6")}
              style={{ width: `${PRODUCT_IMAGE_SIZE_MAP[slide.productImageSize ?? "md"]}%` }}>
              <img src={slide.productImageUrl} alt="product" className="w-full h-auto object-contain drop-shadow-lg" />
            </div>
          )}

          {/* 고정 텍스트 필드 */}
          <div className="absolute inset-0 flex flex-col p-6 md:p-8"
            style={{ fontFamily: fontCss, justifyContent: (slide.verticalAlign ?? "middle") === "top" ? "flex-start" : (slide.verticalAlign ?? "middle") === "bottom" ? "flex-end" : "center" }}>
            <div className={cn("flex flex-col gap-3", alignClass)}>
              {renderField("subtitle", slide.subtitle ?? "",
                <p className="text-sm font-medium opacity-80 whitespace-pre-line" style={{ color: slide.bgStyle.titleColor }}>{slide.subtitle}</p>)}
              {renderField("title", slide.title,
                <h2 className={cn("font-bold leading-tight whitespace-pre-line", titleClass)} style={{ color: slide.bgStyle.titleColor }}>{slide.title || "제목을 입력하세요"}</h2>)}
              {renderField("content", slide.content,
                <p className={cn("leading-relaxed whitespace-pre-line", contentClass)} style={{ color: slide.bgStyle.textColor }}>{slide.content || "내용을 입력하세요"}</p>)}
              {slide.cta && renderField("cta", slide.cta,
                <div className={cn("flex", slide.textAlign === "right" ? "justify-end" : slide.textAlign === "center" ? "justify-center" : "justify-start")}>
                  <span className="inline-block px-5 py-2.5 text-sm font-bold rounded-full" style={{ backgroundColor: slide.bgStyle.ctaBg, color: slide.bgStyle.ctaText }}>{slide.cta}</span>
                </div>)}
            </div>
          </div>

          {/* 붙여넣기로 추가된 자유 텍스트 레이어 */}
          <div className="absolute inset-0 p-6" style={{ fontFamily: fontCss }}>
            <div className="relative w-full h-full">
              {(slide.extraTexts ?? []).map(et => (
                <div key={et.id} className="absolute top-0 left-0">{renderExtra(et)}</div>
              ))}
            </div>
          </div>

          <div className="absolute top-3 right-3 z-10">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.3)", color: "rgba(255,255,255,0.7)", backdropFilter: "blur(4px)" }}>
              {selectedIndex + 1}/{slides.length}</span>
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
