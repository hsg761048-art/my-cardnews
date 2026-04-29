"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Smartphone, Square } from "lucide-react"
import type { Slide } from "./editor-types"
import { FONT_OPTIONS, FONT_SIZE_MAP, CONTENT_SIZE_MAP, ALIGN_MAP, PRODUCT_IMAGE_SIZE_MAP } from "./editor-types"

type AspectMode = "square" | "story"
type TextFieldKey = "subtitle" | "title" | "content" | "cta"

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
  const [selectedField, setSelectedField] = useState<TextFieldKey | null>(null)
  const [editingField, setEditingField] = useState<TextFieldKey | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const [liveOffset, setLiveOffset] = useState<{ field: TextFieldKey; x: number; y: number } | null>(null)
  const [liveWidth, setLiveWidth] = useState<{ field: TextFieldKey; width: number } | null>(null)

  const cardRef = useRef<HTMLDivElement>(null)
  const slideRef = useRef(slides[selectedIndex])
  const onUpdateRef = useRef(onSlideUpdate)
  const selectedFieldRef = useRef<TextFieldKey | null>(null)
  const liveWidthRef = useRef<{ field: TextFieldKey; width: number } | null>(null)

  useEffect(() => {
    slideRef.current = slides[selectedIndex]
    onUpdateRef.current = onSlideUpdate
  })

  const setSelectedFieldSync = (f: TextFieldKey | null) => {
    selectedFieldRef.current = f
    setSelectedField(f)
  }
  const setLiveWidthSync = (v: { field: TextFieldKey; width: number } | null) => {
    liveWidthRef.current = v
    setLiveWidth(v)
  }

  // Unified drag ref
  const dragRef = useRef<{
    type: "move" | "resize"
    field: TextFieldKey
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
          setLiveOffset({ field: dr.field, x: dr.lastX, y: dr.lastY })
        }
      } else {
        // resize
        const newWidthPx = Math.max(dr.cardWidth * 0.2, dr.startWidth + dx)
        const newWidthPct = Math.min(100, (newWidthPx / dr.cardWidth) * 100)
        setLiveWidthSync({ field: dr.field, width: newWidthPct })
      }
    }

    const onMouseUp = () => {
      if (!dragRef.current) return
      const dr = dragRef.current

      if (dr.type === "move") {
        if (dr.moved) {
          const slide = slideRef.current
          onUpdateRef.current?.({
            textOffsets: { ...(slide.textOffsets ?? {}), [dr.field]: { x: dr.lastX, y: dr.lastY } }
          })
          setLiveOffset(null)
        } else {
          // click: select or enter edit
          if (selectedFieldRef.current === dr.field) {
            const slide = slideRef.current
            const val = dr.field === "title" ? slide.title
              : dr.field === "subtitle" ? (slide.subtitle ?? "")
              : dr.field === "content" ? slide.content
              : (slide.cta ?? "")
            setEditingField(dr.field)
            setEditingValue(val)
          } else {
            setSelectedFieldSync(dr.field)
            setEditingField(null)
          }
        }
      } else {
        const lw = liveWidthRef.current
        if (lw) {
          const slide = slideRef.current
          onUpdateRef.current?.({
            textWidths: { ...(slide.textWidths ?? {}), [dr.field]: lw.width }
          })
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

  const getOffset = (field: TextFieldKey) => {
    if (liveOffset?.field === field) return { x: liveOffset.x, y: liveOffset.y }
    return slide.textOffsets?.[field] ?? { x: 0, y: 0 }
  }
  const getWidth = (field: TextFieldKey): string => {
    if (liveWidth?.field === field) return `${liveWidth.width}%`
    const w = slide.textWidths?.[field]
    return w ? `${w}%` : "auto"
  }
  const getIsBold = (field: TextFieldKey) => slide.textBold?.[field] ?? false

  const toggleBold = (e: React.MouseEvent, field: TextFieldKey) => {
    e.stopPropagation()
    e.preventDefault()
    onUpdateRef.current?.({
      textBold: { ...(slide.textBold ?? {}), [field]: !getIsBold(field) }
    })
  }

  const commitEdit = () => {
    if (!editingField) return
    onUpdateRef.current?.({ [editingField]: editingValue })
    setEditingField(null)
  }

  const handleMoveMouseDown = (e: React.MouseEvent, field: TextFieldKey) => {
    if (editingField === field) return
    e.preventDefault()
    e.stopPropagation()
    const cur = slide.textOffsets?.[field] ?? { x: 0, y: 0 }
    dragRef.current = {
      type: "move", field,
      startMouseX: e.clientX, startMouseY: e.clientY,
      startOffsetX: cur.x, startOffsetY: cur.y,
      moved: false, lastX: cur.x, lastY: cur.y,
      startWidth: 0, cardWidth: 0,
    }
  }

  const handleResizeMouseDown = (e: React.MouseEvent, field: TextFieldKey) => {
    e.preventDefault()
    e.stopPropagation()
    const cardWidth = cardRef.current?.getBoundingClientRect().width ?? 384
    const curWidthPct = slide.textWidths?.[field] ?? 100
    dragRef.current = {
      type: "resize", field,
      startMouseX: e.clientX, startMouseY: e.clientY,
      startOffsetX: 0, startOffsetY: 0,
      moved: false, lastX: 0, lastY: 0,
      startWidth: (curWidthPct / 100) * cardWidth,
      cardWidth,
    }
  }

  const renderField = (field: TextFieldKey, value: string, staticEl: React.ReactNode) => {
    if (!value && field !== "title" && field !== "content") return null

    const offset = getOffset(field)
    const width = getWidth(field)
    const isSelected = selectedField === field
    const isEditing = editingField === field
    const isDragging = liveOffset?.field === field
    const isResizing = liveWidth?.field === field
    const bold = getIsBold(field)

    return (
      <div
        key={field}
        className={cn("relative group", !isEditing && "cursor-move")}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          transition: isDragging ? "none" : "transform 0.1s ease",
          width,
          minWidth: "4ch",
          zIndex: isSelected || isEditing ? 20 : undefined,
          fontWeight: bold ? 900 : undefined,
        }}
        onMouseDown={(e) => handleMoveMouseDown(e, field)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Selection / hover border */}
        <div className={cn(
          "absolute -inset-1.5 rounded pointer-events-none border-2 transition-opacity duration-150",
          isSelected || isEditing
            ? "opacity-100 border-blue-400"
            : "opacity-0 group-hover:opacity-60 border-white/60"
        )} />

        {/* Floating mini toolbar */}
        {(isSelected || isEditing) && (
          <div
            className="absolute -top-10 left-0 flex items-center gap-1 bg-black/85 backdrop-blur-sm rounded-lg px-2 py-1.5 z-40 shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Bold button */}
            <button
              onClick={(e) => toggleBold(e, field)}
              className={cn(
                "w-7 h-7 flex items-center justify-center rounded text-sm font-black transition-all",
                bold
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-white/70 hover:bg-white/20 hover:text-white"
              )}
              title="굵게 (진하게)"
            >
              B
            </button>
            <div className="w-px h-4 bg-white/20 mx-0.5" />
            <span className="text-white/40 text-[10px] whitespace-nowrap">
              {isEditing ? "Enter: 저장 / Esc: 취소" : "클릭: 텍스트 편집"}
            </span>
          </div>
        )}

        {/* Hover hint (not selected) */}
        {!isSelected && !isEditing && (
          <div className="absolute -top-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
            <span className="text-[10px] bg-black/70 text-white px-2 py-0.5 rounded whitespace-nowrap">
              드래그: 이동 · 클릭: 선택
            </span>
          </div>
        )}

        {/* Right-edge resize handle */}
        {(isSelected || isEditing) && (
          <div
            className="absolute -right-2 top-0 bottom-0 w-4 flex items-center justify-center cursor-ew-resize z-40"
            onMouseDown={(e) => handleResizeMouseDown(e, field)}
            onClick={(e) => e.stopPropagation()}
            title="좌우로 드래그해 너비 조절"
          >
            <div className={cn(
              "w-1.5 h-10 max-h-full rounded-full transition-colors",
              isResizing ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-300"
            )} />
          </div>
        )}

        {/* Content: editable textarea OR static element */}
        {isEditing ? (
          <textarea
            autoFocus
            className="block w-full bg-transparent outline-none resize-none overflow-hidden cursor-text pr-3"
            style={{
              color: "inherit",
              fontFamily: "inherit",
              fontSize: "inherit",
              fontWeight: "inherit",
              lineHeight: "inherit",
              textAlign: "inherit" as React.CSSProperties["textAlign"],
              minWidth: "8ch",
              padding: 0,
              border: "none",
            }}
            value={editingValue}
            onChange={(e) => {
              setEditingValue(e.target.value)
              e.target.style.height = "auto"
              e.target.style.height = e.target.scrollHeight + "px"
            }}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === "Escape") setEditingField(null)
              if (e.key === "Enter" && !e.shiftKey && field !== "content") {
                e.preventDefault()
                commitEdit()
              }
            }}
          />
        ) : (
          staticEl
        )}
      </div>
    )
  }

  const goToPrev = () => { if (selectedIndex > 0) onSlideChange(selectedIndex - 1) }
  const goToNext = () => { if (selectedIndex < slides.length - 1) onSlideChange(selectedIndex + 1) }

  return (
    <div
      className="flex flex-col items-center h-full py-6 px-4 gap-4"
      onClick={() => {
        if (editingField) commitEdit()
        setSelectedFieldSync(null)
        setEditingField(null)
      }}
    >
      {/* 상단 컨트롤 */}
      <div className="flex items-center gap-4 w-full max-w-sm">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
          <button
            onClick={() => setAspectMode("square")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              aspectMode === "square" ? "bg-primary text-primary-foreground shadow" : "text-white/50 hover:text-white/80"
            )}
          >
            <Square className="w-3 h-3" />1:1
          </button>
          <button
            onClick={() => setAspectMode("story")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              aspectMode === "story" ? "bg-primary text-primary-foreground shadow" : "text-white/50 hover:text-white/80"
            )}
          >
            <Smartphone className="w-3 h-3" />9:16
          </button>
        </div>
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
          {/* clip inner content but allow overflow for handles/toolbars */}
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
            <div
              className={cn(
                "absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none",
                (slide.productImagePosition ?? "top") === "top" && "top-6",
                (slide.productImagePosition ?? "top") === "center" && "top-1/2 -translate-y-1/2",
                (slide.productImagePosition ?? "top") === "bottom" && "bottom-6"
              )}
              style={{ width: `${PRODUCT_IMAGE_SIZE_MAP[slide.productImageSize ?? "md"]}%` }}
            >
              <img src={slide.productImageUrl} alt="product" className="w-full h-auto object-contain drop-shadow-lg" />
            </div>
          )}

          {/* Text content */}
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
                  style={{ color: slide.bgStyle.titleColor }}>
                  {slide.subtitle}
                </p>
              )}
              {renderField("title", slide.title,
                <h2 className={cn("font-bold leading-tight whitespace-pre-line", titleClass)}
                  style={{ color: slide.bgStyle.titleColor }}>
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

          {/* 슬라이드 번호 */}
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
            )}
          />
        ))}
      </div>
    </div>
  )
}
