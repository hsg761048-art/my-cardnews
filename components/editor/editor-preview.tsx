"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Smartphone, Square, Copy, Clipboard, X } from "lucide-react"
import type { Slide, ExtraText } from "./editor-types"
import { FONT_OPTIONS, FONT_SIZE_MAP, CONTENT_SIZE_MAP, ALIGN_MAP, PRODUCT_IMAGE_SIZE_MAP } from "./editor-types"

type AspectMode = "square" | "story"
type TextFieldKey = "subtitle" | "title" | "content" | "cta"
type SelectTarget = { kind: "field"; field: TextFieldKey } | { kind: "extra"; id: string }

interface ClipboardItem {
  content: string
  color: string
  bold: boolean
}

interface EditorPreviewProps {
  slides: Slide[]
  selectedIndex: number
  onSlideChange: (index: number) => void
  onSlideUpdate?: (updates: Partial<Slide>) => void
}

export function EditorPreview({
  slides, selectedIndex, onSlideChange, onSlideUpdate,
}: EditorPreviewProps) {
  const [aspectMode, setAspectMode] = useState<AspectMode>("square")

  // Selection / editing state
  const [selected, setSelected] = useState<SelectTarget | null>(null)
  const [editingField, setEditingField] = useState<TextFieldKey | null>(null)
  const [editingExtraId, setEditingExtraId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState("")

  // Live drag state (for smooth updates)
  const [liveOffset, setLiveOffset] = useState<{ id: string; x: number; y: number } | null>(null)
  const [liveWidth, setLiveWidth] = useState<{ id: string; width: number } | null>(null)

  // Copy/paste clipboard
  const [clipboard, setClipboard] = useState<ClipboardItem | null>(null)

  const cardRef = useRef<HTMLDivElement>(null)
  const slideRef = useRef(slides[selectedIndex])
  const onUpdateRef = useRef(onSlideUpdate)
  const selectedRef = useRef<SelectTarget | null>(null)
  const liveWidthRef = useRef<{ id: string; width: number } | null>(null)

  useEffect(() => {
    slideRef.current = slides[selectedIndex]
    onUpdateRef.current = onSlideUpdate
  })

  const setSelectedSync = (s: SelectTarget | null) => {
    selectedRef.current = s
    setSelected(s)
  }
  const setLiveWidthSync = (v: { id: string; width: number } | null) => {
    liveWidthRef.current = v
    setLiveWidth(v)
  }

  // Unified drag ref
  const dragRef = useRef<{
    type: "move" | "resize"
    targetId: string         // field name or extra text id
    targetKind: "field" | "extra"
    startMouseX: number; startMouseY: number
    startOffsetX: number; startOffsetY: number
    moved: boolean; lastX: number; lastY: number
    startWidth: number; cardWidth: number
  } | null>(null)

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      const dr = dragRef.current
      const dx = e.clientX - dr.startMouseX
      const dy = e.clientY - dr.startMouseY

      if (dr.type === "move") {
        if (!dr.moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) dr.moved = true
        if (dr.moved) {
          dr.lastX = dr.startOffsetX + dx
          dr.lastY = dr.startOffsetY + dy
          setLiveOffset({ id: dr.targetId, x: dr.lastX, y: dr.lastY })
        }
      } else {
        const newWidthPx = Math.max(dr.cardWidth * 0.15, dr.startWidth + dx)
        const newWidthPct = Math.min(100, (newWidthPx / dr.cardWidth) * 100)
        setLiveWidthSync({ id: dr.targetId, width: newWidthPct })
      }
    }

    const onMouseUp = () => {
      if (!dragRef.current) return
      const dr = dragRef.current
      const slide = slideRef.current

      if (dr.type === "move") {
        if (dr.moved) {
          if (dr.targetKind === "field") {
            onUpdateRef.current?.({
              textOffsets: { ...(slide.textOffsets ?? {}), [dr.targetId]: { x: dr.lastX, y: dr.lastY } }
            })
          } else {
            const updated = (slide.extraTexts ?? []).map(et =>
              et.id === dr.targetId ? { ...et, offset: { x: dr.lastX, y: dr.lastY } } : et
            )
            onUpdateRef.current?.({ extraTexts: updated })
          }
          setLiveOffset(null)
        } else {
          // click
          const cur = selectedRef.current
          const isSame = cur?.kind === dr.targetKind &&
            (cur.kind === "field" ? (cur as any).field === dr.targetId : (cur as any).id === dr.targetId)

          if (isSame) {
            // enter edit mode
            let val = ""
            if (dr.targetKind === "field") {
              const f = dr.targetId as TextFieldKey
              val = f === "title" ? slide.title
                : f === "subtitle" ? (slide.subtitle ?? "")
                : f === "content" ? slide.content
                : (slide.cta ?? "")
              setEditingField(f)
            } else {
              val = (slide.extraTexts ?? []).find(et => et.id === dr.targetId)?.content ?? ""
              setEditingExtraId(dr.targetId)
            }
            setEditingValue(val)
          } else {
            setSelectedSync(
              dr.targetKind === "field"
                ? { kind: "field", field: dr.targetId as TextFieldKey }
                : { kind: "extra", id: dr.targetId }
            )
            setEditingField(null)
            setEditingExtraId(null)
          }
        }
      } else {
        const lw = liveWidthRef.current
        if (lw) {
          if (dr.targetKind === "field") {
            onUpdateRef.current?.({
              textWidths: { ...(slide.textWidths ?? {}), [dr.targetId]: lw.width }
            })
          } else {
            const updated = (slide.extraTexts ?? []).map(et =>
              et.id === dr.targetId ? { ...et, width: lw.width } : et
            )
            onUpdateRef.current?.({ extraTexts: updated })
          }
          setLiveWidthSync(null)
        }
      }
      dragRef.current = null
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [])

  const slide = slides[selectedIndex]
  if (!slide) return null

  const fontCss = FONT_OPTIONS.find((f) => f.value === slide.fontFamily)?.css ?? "sans-serif"
  const titleClass = FONT_SIZE_MAP[slide.titleSize].title
  const contentClass = CONTENT_SIZE_MAP[slide.contentSize].content
  const alignClass = ALIGN_MAP[slide.textAlign]

  const getFieldOffset = (field: TextFieldKey) => {
    if (liveOffset?.id === field) return { x: liveOffset.x, y: liveOffset.y }
    return slide.textOffsets?.[field] ?? { x: 0, y: 0 }
  }
  const getExtraOffset = (id: string) => {
    if (liveOffset?.id === id) return { x: liveOffset.x, y: liveOffset.y }
    return slide.extraTexts?.find(et => et.id === id)?.offset ?? { x: 0, y: 0 }
  }
  const getWidthStr = (id: string, stored?: number) => {
    if (liveWidth?.id === id) return `${liveWidth.width}%`
    return stored ? `${stored}%` : "auto"
  }
  const isBold = (field: TextFieldKey) => slide.textBold?.[field] ?? false

  const toggleBold = (e: React.MouseEvent, field: TextFieldKey) => {
    e.stopPropagation()
    onUpdateRef.current?.({ textBold: { ...(slide.textBold ?? {}), [field]: !isBold(field) } })
  }
  const toggleExtraBold = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const updated = (slide.extraTexts ?? []).map(et =>
      et.id === id ? { ...et, bold: !et.bold } : et
    )
    onUpdateRef.current?.({ extraTexts: updated })
  }

  const commitFieldEdit = () => {
    if (!editingField) return
    onUpdateRef.current?.({ [editingField]: editingValue })
    setEditingField(null)
  }
  const commitExtraEdit = () => {
    if (!editingExtraId) return
    const updated = (slide.extraTexts ?? []).map(et =>
      et.id === editingExtraId ? { ...et, content: editingValue } : et
    )
    onUpdateRef.current?.({ extraTexts: updated })
    setEditingExtraId(null)
  }

  // Copy: save field content + style to clipboard
  const handleCopy = (e: React.MouseEvent, field: TextFieldKey) => {
    e.stopPropagation()
    const content = field === "title" ? slide.title
      : field === "subtitle" ? (slide.subtitle ?? "")
      : field === "content" ? slide.content
      : (slide.cta ?? "")
    const color = field === "content" ? slide.bgStyle.textColor : slide.bgStyle.titleColor
    setClipboard({ content, color, bold: isBold(field) })
  }
  const handleCopyExtra = (e: React.MouseEvent, et: ExtraText) => {
    e.stopPropagation()
    setClipboard({ content: et.content, color: et.color, bold: et.bold })
  }

  // Paste: add new ExtraText to slide
  const handlePaste = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!clipboard) return
    const newExtra: ExtraText = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      content: clipboard.content,
      color: clipboard.color,
      bold: clipboard.bold,
      offset: { x: 20, y: 20 },
    }
    onUpdateRef.current?.({ extraTexts: [...(slide.extraTexts ?? []), newExtra] })
    setSelectedSync({ kind: "extra", id: newExtra.id })
  }

  // Delete extra text
  const handleDeleteExtra = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    onUpdateRef.current?.({ extraTexts: (slide.extraTexts ?? []).filter(et => et.id !== id) })
    setSelectedSync(null)
  }

  const startDrag = (e: React.MouseEvent, targetId: string, targetKind: "field" | "extra", currentOffset: { x: number; y: number }) => {
    e.preventDefault()
    e.stopPropagation()
    dragRef.current = {
      type: "move", targetId, targetKind,
      startMouseX: e.clientX, startMouseY: e.clientY,
      startOffsetX: currentOffset.x, startOffsetY: currentOffset.y,
      moved: false, lastX: currentOffset.x, lastY: currentOffset.y,
      startWidth: 0, cardWidth: 0,
    }
  }
  const startResize = (e: React.MouseEvent, targetId: string, targetKind: "field" | "extra", storedWidth?: number) => {
    e.preventDefault()
    e.stopPropagation()
    const cardWidth = cardRef.current?.getBoundingClientRect().width ?? 384
    const curWidthPct = storedWidth ?? 100
    dragRef.current = {
      type: "resize", targetId, targetKind,
      startMouseX: e.clientX, startMouseY: e.clientY,
      startOffsetX: 0, startOffsetY: 0,
      moved: false, lastX: 0, lastY: 0,
      startWidth: (curWidthPct / 100) * cardWidth, cardWidth,
    }
  }

  // ── Toolbar component ──
  const renderToolbar = (
    isBoldActive: boolean,
    onBold: (e: React.MouseEvent) => void,
    onCopy: (e: React.MouseEvent) => void,
    isEditing: boolean,
    extraId?: string,
    onDelete?: (e: React.MouseEvent) => void
  ) => (
    <div
      className="absolute -top-11 left-0 flex items-center gap-1 bg-black/85 backdrop-blur-sm rounded-xl px-2 py-1.5 z-40 shadow-xl"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Bold */}
      <button
        onClick={onBold}
        className={cn(
          "w-7 h-7 flex items-center justify-center rounded text-sm font-black transition-all",
          isBoldActive ? "bg-blue-500 text-white" : "text-white/70 hover:bg-white/20 hover:text-white"
        )}
        title="굵게"
      >B</button>

      <div className="w-px h-4 bg-white/20 mx-0.5" />

      {/* Copy */}
      <button
        onClick={onCopy}
        className="w-7 h-7 flex items-center justify-center rounded text-white/70 hover:bg-white/20 hover:text-white transition-all"
        title="복사"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>

      {/* Delete (extra text only) */}
      {onDelete && (
        <>
          <div className="w-px h-4 bg-white/20 mx-0.5" />
          <button
            onClick={onDelete}
            className="w-7 h-7 flex items-center justify-center rounded text-red-400 hover:bg-red-500/20 transition-all"
            title="삭제"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </>
      )}

      <div className="w-px h-4 bg-white/20 mx-0.5" />
      <span className="text-white/40 text-[10px] whitespace-nowrap">
        {isEditing ? "Enter: 저장 · Esc: 취소" : "클릭: 편집"}
      </span>
    </div>
  )

  // ── Shared editable wrapper ──
  const renderEditableWrapper = (
    targetId: string,
    targetKind: "field" | "extra",
    isSelectedEl: boolean,
    isEditingEl: boolean,
    isDraggingEl: boolean,
    isResizingEl: boolean,
    offset: { x: number; y: number },
    width: string,
    toolbar: React.ReactNode,
    content: React.ReactNode,
    resizeStoredWidth?: number,
  ) => (
    <div
      className={cn("relative group", !isEditingEl && "cursor-move")}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: isDraggingEl ? "none" : "transform 0.1s ease",
        width,
        minWidth: "4ch",
        zIndex: isSelectedEl || isEditingEl ? 20 : undefined,
      }}
      onMouseDown={(e) => {
        if (!isEditingEl) startDrag(e, targetId, targetKind, offset)
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Border */}
      <div className={cn(
        "absolute -inset-1.5 rounded pointer-events-none border-2 transition-opacity duration-150",
        isSelectedEl || isEditingEl
          ? "opacity-100 border-blue-400"
          : "opacity-0 group-hover:opacity-60 border-white/60"
      )} />

      {/* Toolbar */}
      {(isSelectedEl || isEditingEl) && toolbar}

      {/* Hover hint */}
      {!isSelectedEl && !isEditingEl && (
        <div className="absolute -top-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
          <span className="text-[10px] bg-black/70 text-white px-2 py-0.5 rounded whitespace-nowrap">
            드래그: 이동 · 클릭: 선택
          </span>
        </div>
      )}

      {/* Resize handle */}
      {(isSelectedEl || isEditingEl) && (
        <div
          className="absolute -right-2 top-0 bottom-0 w-4 flex items-center justify-center cursor-ew-resize z-40"
          onMouseDown={(e) => startResize(e, targetId, targetKind, resizeStoredWidth)}
          onClick={(e) => e.stopPropagation()}
          title="좌우 드래그: 너비 조절"
        >
          <div className={cn(
            "w-1.5 h-10 max-h-full rounded-full transition-colors",
            isResizingEl ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-300"
          )} />
        </div>
      )}

      {content}
    </div>
  )

  // ── Render fixed field ──
  const renderField = (field: TextFieldKey, value: string, staticEl: React.ReactNode) => {
    if (!value && field !== "title" && field !== "content") return null

    const offset = getFieldOffset(field)
    const width = getWidthStr(field, slide.textWidths?.[field])
    const isSelectedEl = selected?.kind === "field" && (selected as any).field === field
    const isEditingEl = editingField === field
    const isDraggingEl = liveOffset?.id === field
    const isResizingEl = liveWidth?.id === field
    const bold = isBold(field)

    const toolbar = renderToolbar(
      bold,
      (e) => toggleBold(e, field),
      (e) => handleCopy(e, field),
      isEditingEl,
    )

    const editArea = isEditingEl ? (
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
        onChange={(e) => {
          setEditingValue(e.target.value)
          e.target.style.height = "auto"
          e.target.style.height = e.target.scrollHeight + "px"
        }}
        onBlur={commitFieldEdit}
        onKeyDown={(e) => {
          e.stopPropagation()
          if (e.key === "Escape") setEditingField(null)
          if (e.key === "Enter" && !e.shiftKey && field !== "content") {
            e.preventDefault(); commitFieldEdit()
          }
        }}
      />
    ) : staticEl

    return renderEditableWrapper(
      field, "field",
      isSelectedEl, isEditingEl, isDraggingEl, isResizingEl,
      offset, width, toolbar, editArea, slide.textWidths?.[field]
    )
  }

  // ── Render extra text ──
  const renderExtraText = (et: ExtraText) => {
    const offset = getExtraOffset(et.id)
    const width = getWidthStr(et.id, et.width)
    const isSelectedEl = selected?.kind === "extra" && (selected as any).id === et.id
    const isEditingEl = editingExtraId === et.id
    const isDraggingEl = liveOffset?.id === et.id
    const isResizingEl = liveWidth?.id === et.id

    const toolbar = renderToolbar(
      et.bold,
      (e) => toggleExtraBold(e, et.id),
      (e) => handleCopyExtra(e, et),
      isEditingEl,
      et.id,
      (e) => handleDeleteExtra(e, et.id),
    )

    const editArea = isEditingEl ? (
      <textarea
        autoFocus
        className="block w-full bg-transparent outline-none resize-none overflow-hidden cursor-text pr-3"
        style={{
          color: et.color, fontFamily: "inherit", fontSize: "inherit",
          fontWeight: et.bold ? 900 : undefined,
          lineHeight: "inherit",
          textAlign: "inherit" as React.CSSProperties["textAlign"],
          minWidth: "8ch", padding: 0, border: "none",
        }}
        value={editingValue}
        onChange={(e) => {
          setEditingValue(e.target.value)
          e.target.style.height = "auto"
          e.target.style.height = e.target.scrollHeight + "px"
        }}
        onBlur={commitExtraEdit}
        onKeyDown={(e) => {
          e.stopPropagation()
          if (e.key === "Escape") setEditingExtraId(null)
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitExtraEdit() }
        }}
      />
    ) : (
      <p
        className="text-base leading-relaxed whitespace-pre-line"
        style={{ color: et.color, fontWeight: et.bold ? 900 : undefined }}
      >
        {et.content || "텍스트 입력"}
      </p>
    )

    return renderEditableWrapper(
      et.id, "extra",
      isSelectedEl, isEditingEl, isDraggingEl, isResizingEl,
      offset, width, toolbar, editArea, et.width
    )
  }

  const goToPrev = () => { if (selectedIndex > 0) onSlideChange(selectedIndex - 1) }
  const goToNext = () => { if (selectedIndex < slides.length - 1) onSlideChange(selectedIndex + 1) }

  return (
    <div
      className="flex flex-col items-center h-full py-6 px-4 gap-4"
      onClick={() => {
        if (editingField) commitFieldEdit()
        if (editingExtraId) commitExtraEdit()
        setSelectedSync(null)
        setEditingField(null)
        setEditingExtraId(null)
      }}
    >
      {/* 상단 컨트롤 */}
      <div className="flex items-center gap-4 w-full max-w-sm">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
          <button onClick={() => setAspectMode("square")}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              aspectMode === "square" ? "bg-primary text-primary-foreground shadow" : "text-white/50 hover:text-white/80")}>
            <Square className="w-3 h-3" />1:1
          </button>
          <button onClick={() => setAspectMode("story")}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              aspectMode === "story" ? "bg-primary text-primary-foreground shadow" : "text-white/50 hover:text-white/80")}>
            <Smartphone className="w-3 h-3" />9:16
          </button>
        </div>

        {/* 붙여넣기 버튼 */}
        {clipboard && (
          <button
            onClick={handlePaste}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-400/40 text-blue-300 hover:bg-blue-500/30 text-xs font-medium transition-all"
            title="복사된 텍스트 붙여넣기"
          >
            <Clipboard className="w-3.5 h-3.5" />
            붙여넣기
          </button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <button onClick={goToPrev} disabled={selectedIndex === 0}
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/10 text-white/50 hover:text-white hover:border-white/30 disabled:opacity-30 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-white/40 tabular-nums w-10 text-center">
            {selectedIndex + 1} / {slides.length}
          </span>
          <button onClick={goToNext} disabled={selectedIndex === slides.length - 1}
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/10 text-white/50 hover:text-white hover:border-white/30 disabled:opacity-30 transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 카드 미리보기 */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div
          ref={cardRef}
          className={cn(
            "relative w-full max-w-sm shadow-2xl shadow-black/50 overflow-visible",
            aspectMode === "square" ? "aspect-square" : "aspect-[9/16]"
          )}
          style={{ borderRadius: 12 }}
        >
          {/* Background (clipped) */}
          <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 12 }}>
            {slide.bgImageUrl ? (
              <>
                <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${slide.bgImageUrl})` }} />
                <div className="absolute inset-0 bg-black/30" />
              </>
            ) : (
              <div className="absolute inset-0" style={{ background: slide.bgStyle.background }} />
            )}
          </div>

          {/* Logo */}
          {slide.logoUrl && (
            <div className="absolute top-4 left-4 z-10">
              <img src={slide.logoUrl} alt="brand logo" className="h-8 max-w-[120px] object-contain" />
            </div>
          )}

          {/* Product image */}
          {slide.productImageUrl && (
            <div className={cn(
              "absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none",
              (slide.productImagePosition ?? "top") === "top" && "top-6",
              (slide.productImagePosition ?? "top") === "center" && "top-1/2 -translate-y-1/2",
              (slide.productImagePosition ?? "top") === "bottom" && "bottom-6"
            )} style={{ width: `${PRODUCT_IMAGE_SIZE_MAP[slide.productImageSize ?? "md"]}%` }}>
              <img src={slide.productImageUrl} alt="product" className="w-full h-auto object-contain drop-shadow-lg" />
            </div>
          )}

          {/* Fixed text fields */}
          <div
            className="absolute inset-0 flex flex-col p-6 md:p-8"
            style={{
              fontFamily: fontCss,
              justifyContent:
                (slide.verticalAlign ?? "middle") === "top" ? "flex-start"
                : (slide.verticalAlign ?? "middle") === "bottom" ? "flex-end"
                : "center",
            }}
          >
            <div className={cn("flex flex-col gap-3", alignClass)}>
              {renderField("subtitle", slide.subtitle ?? "",
                <p className="text-sm font-medium opacity-80 whitespace-pre-line"
                  style={{ color: slide.bgStyle.titleColor }}>{slide.subtitle}</p>
              )}
              {renderField("title", slide.title,
                <h2 className={cn("font-bold leading-tight whitespace-pre-line", titleClass)}
                  style={{ color: slide.bgStyle.titleColor, fontWeight: isBold("title") ? 900 : undefined }}>
                  {slide.title || "제목을 입력하세요"}
                </h2>
              )}
              {renderField("content", slide.content,
                <p className={cn("leading-relaxed whitespace-pre-line", contentClass)}
                  style={{ color: slide.bgStyle.textColor }}>
                  {slide.content || "내용을 입력하세요"}
                </p>
              )}
              {slide.cta && renderField("cta", slide.cta,
                <div className={cn("flex",
                  slide.textAlign === "right" ? "justify-end"
                  : slide.textAlign === "center" ? "justify-center"
                  : "justify-start"
                )}>
                  <span className="inline-block px-5 py-2.5 text-sm font-bold rounded-full"
                    style={{ backgroundColor: slide.bgStyle.ctaBg, color: slide.bgStyle.ctaText }}>
                    {slide.cta}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Extra (copied) text layers */}
          <div className="absolute inset-0 p-6 pointer-events-none" style={{ fontFamily: fontCss }}>
            <div className="relative w-full h-full pointer-events-auto">
              {(slide.extraTexts ?? []).map(et => (
                <div key={et.id} className="absolute top-0 left-0">
                  {renderExtraText(et)}
                </div>
              ))}
            </div>
          </div>

          {/* Slide number */}
          <div className="absolute top-3 right-3 z-10">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "rgba(0,0,0,0.3)", color: "rgba(255,255,255,0.7)", backdropFilter: "blur(4px)" }}>
              {selectedIndex + 1}/{slides.length}
            </span>
          </div>
        </div>
      </div>

      {/* 하단 도트 인디케이터 */}
      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => onSlideChange(i)}
            className={cn("h-1.5 rounded-full transition-all",
              i === selectedIndex ? "w-6 bg-primary" : "w-1.5 bg-white/25 hover:bg-white/50"
            )} />
        ))}
      </div>
    </div>
  )
}
