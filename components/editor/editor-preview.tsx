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
  slides,
  selectedIndex,
  onSlideChange,
  onSlideUpdate,
}: EditorPreviewProps) {
  const [aspectMode, setAspectMode] = useState<AspectMode>("square")
  const [editingField, setEditingField] = useState<TextFieldKey | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const [liveOffset, setLiveOffset] = useState<{ field: TextFieldKey; x: number; y: number } | null>(null)

  // Refs to avoid stale closures in global event listeners
  const slideRef = useRef(slides[selectedIndex])
  const onUpdateRef = useRef(onSlideUpdate)
  useEffect(() => {
    slideRef.current = slides[selectedIndex]
    onUpdateRef.current = onSlideUpdate
  })

  const dragRef = useRef<{
    field: TextFieldKey
    startMouseX: number
    startMouseY: number
    startOffsetX: number
    startOffsetY: number
    moved: boolean
    lastX: number
    lastY: number
  } | null>(null)

  // Global mouse move / up for drag
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      const dx = e.clientX - dragRef.current.startMouseX
      const dy = e.clientY - dragRef.current.startMouseY
      if (!dragRef.current.moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        dragRef.current.moved = true
      }
      if (dragRef.current.moved) {
        dragRef.current.lastX = dragRef.current.startOffsetX + dx
        dragRef.current.lastY = dragRef.current.startOffsetY + dy
        setLiveOffset({
          field: dragRef.current.field,
          x: dragRef.current.lastX,
          y: dragRef.current.lastY,
        })
      }
    }

    const onMouseUp = () => {
      if (!dragRef.current) return
      const { field, moved, lastX, lastY } = dragRef.current

      if (moved) {
        // Commit drag offset to slide
        const slide = slideRef.current
        onUpdateRef.current?.({
          textOffsets: {
            ...(slide.textOffsets ?? {}),
            [field]: { x: lastX, y: lastY },
          },
        })
        setLiveOffset(null)
      } else {
        // It was a click → enter inline edit mode
        const slide = slideRef.current
        const val =
          field === "title" ? slide.title
          : field === "subtitle" ? (slide.subtitle ?? "")
          : field === "content" ? slide.content
          : (slide.cta ?? "")
        setEditingField(field)
        setEditingValue(val)
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

  const handleMouseDown = (e: React.MouseEvent, field: TextFieldKey) => {
    if (editingField === field) return
    e.preventDefault()
    e.stopPropagation()
    const currentOffset = slide.textOffsets?.[field] ?? { x: 0, y: 0 }
    dragRef.current = {
      field,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startOffsetX: currentOffset.x,
      startOffsetY: currentOffset.y,
      moved: false,
      lastX: currentOffset.x,
      lastY: currentOffset.y,
    }
  }

  const commitEdit = () => {
    if (!editingField) return
    onUpdateRef.current?.({ [editingField]: editingValue })
    setEditingField(null)
  }

  // Render a draggable + editable text field
  const renderField = (
    field: TextFieldKey,
    value: string,
    staticEl: React.ReactNode,
    editStyle?: React.CSSProperties
  ) => {
    if (!value && field !== "title" && field !== "content") return null

    const offset = getOffset(field)
    const isEditing = editingField === field
    const isDragging = liveOffset?.field === field

    return (
      <div
        className={cn("relative group", !isEditing && "cursor-move")}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          transition: isDragging ? "none" : "transform 0.1s ease",
          zIndex: isEditing || isDragging ? 20 : undefined,
        }}
        onMouseDown={(e) => handleMouseDown(e, field)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hover / active border */}
        <div
          className={cn(
            "absolute -inset-1.5 rounded pointer-events-none border-2 transition-opacity duration-150",
            isEditing
              ? "opacity-100 border-blue-400"
              : "opacity-0 group-hover:opacity-70 border-white/70"
          )}
        />

        {/* Drag hint tooltip */}
        {!isEditing && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
            <span className="text-[10px] bg-black/70 text-white px-2 py-0.5 rounded whitespace-nowrap">
              드래그: 이동 · 클릭: 텍스트 편집
            </span>
          </div>
        )}

        {isEditing ? (
          <textarea
            autoFocus
            className="block w-full bg-transparent outline-none resize-none overflow-hidden cursor-text"
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
              ...editStyle,
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
      onClick={() => { if (editingField) commitEdit() }}
    >
      {/* 상단 컨트롤 */}
      <div className="flex items-center gap-4 w-full max-w-sm">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
          <button
            onClick={() => setAspectMode("square")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              aspectMode === "square"
                ? "bg-primary text-primary-foreground shadow"
                : "text-white/50 hover:text-white/80"
            )}
          >
            <Square className="w-3 h-3" />
            1:1
          </button>
          <button
            onClick={() => setAspectMode("story")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              aspectMode === "story"
                ? "bg-primary text-primary-foreground shadow"
                : "text-white/50 hover:text-white/80"
            )}
          >
            <Smartphone className="w-3 h-3" />
            9:16
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={goToPrev}
            disabled={selectedIndex === 0}
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/10 text-white/50 hover:text-white hover:border-white/30 disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-white/40 tabular-nums w-10 text-center">
            {selectedIndex + 1} / {slides.length}
          </span>
          <button
            onClick={goToNext}
            disabled={selectedIndex === slides.length - 1}
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/10 text-white/50 hover:text-white hover:border-white/30 disabled:opacity-30 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 카드 미리보기 */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div
          className={cn(
            "relative w-full max-w-sm shadow-2xl shadow-black/50 overflow-hidden",
            aspectMode === "square" ? "aspect-square" : "aspect-[9/16]"
          )}
          style={{ borderRadius: 12 }}
        >
          {/* 배경 */}
          {slide.bgImageUrl ? (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${slide.bgImageUrl})` }}
              />
              <div className="absolute inset-0 bg-black/30" />
            </>
          ) : (
            <div className="absolute inset-0" style={{ background: slide.bgStyle.background }} />
          )}

          {/* 브랜드 로고 */}
          {slide.logoUrl && (
            <div className="absolute top-4 left-4 z-10">
              <img src={slide.logoUrl} alt="brand logo" className="h-8 max-w-[120px] object-contain" />
            </div>
          )}

          {/* 제품 이미지 */}
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

          {/* 텍스트 콘텐츠 */}
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
              {/* 서브타이틀 */}
              {renderField(
                "subtitle",
                slide.subtitle ?? "",
                <p
                  className="text-sm font-medium opacity-80 whitespace-pre-line"
                  style={{ color: slide.bgStyle.titleColor }}
                >
                  {slide.subtitle}
                </p>
              )}

              {/* 메인 타이틀 */}
              {renderField(
                "title",
                slide.title,
                <h2
                  className={cn("font-bold leading-tight whitespace-pre-line", titleClass)}
                  style={{ color: slide.bgStyle.titleColor }}
                >
                  {slide.title || "제목을 입력하세요"}
                </h2>
              )}

              {/* 본문 */}
              {renderField(
                "content",
                slide.content,
                <p
                  className={cn("leading-relaxed whitespace-pre-line", contentClass)}
                  style={{ color: slide.bgStyle.textColor }}
                >
                  {slide.content || "내용을 입력하세요"}
                </p>
              )}

              {/* CTA */}
              {slide.cta && renderField(
                "cta",
                slide.cta,
                <div
                  className={cn(
                    "flex",
                    slide.textAlign === "right" ? "justify-end"
                    : slide.textAlign === "center" ? "justify-center"
                    : "justify-start"
                  )}
                >
                  <span
                    className="inline-block px-5 py-2.5 text-sm font-bold rounded-full"
                    style={{
                      backgroundColor: slide.bgStyle.ctaBg,
                      color: slide.bgStyle.ctaText,
                    }}
                  >
                    {slide.cta}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 슬라이드 번호 */}
          <div className="absolute top-3 right-3">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: "rgba(0,0,0,0.3)",
                color: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(4px)",
              }}
            >
              {selectedIndex + 1}/{slides.length}
            </span>
          </div>
        </div>
      </div>

      {/* 하단 도트 인디케이터 */}
      <div className="flex items-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => onSlideChange(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === selectedIndex ? "w-6 bg-primary" : "w-1.5 bg-white/25 hover:bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  )
}
