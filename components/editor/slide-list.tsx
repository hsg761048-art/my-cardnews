"use client"

import { useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Plus, Trash2, GripVertical } from "lucide-react"
import type { Slide } from "./editor-types"
import { FONT_OPTIONS } from "./editor-types"

interface SlideListProps {
  slides: Slide[]
  selectedIndex: number
  onSelect: (index: number) => void
  onAdd: () => void
  onDelete: (index: number) => void
  onReorder: (fromIndex: number, toIndex: number) => void
}

export function SlideList({
  slides,
  selectedIndex,
  onSelect,
  onAdd,
  onDelete,
  onReorder,
}: SlideListProps) {
  const dragIndexRef = useRef<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragIndexRef.current = index
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOver(index)
  }

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    const fromIndex = dragIndexRef.current
    if (fromIndex !== null && fromIndex !== toIndex) {
      onReorder(fromIndex, toIndex)
    }
    setDragOver(null)
    dragIndexRef.current = null
  }

  const handleDragEnd = () => {
    setDragOver(null)
    dragIndexRef.current = null
  }

  const getFontCss = (slide: Slide) => {
    return FONT_OPTIONS.find((f) => f.value === slide.fontFamily)?.css ?? "sans-serif"
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
          슬라이드
        </span>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          추가
        </button>
      </div>

      {/* 슬라이드 목록 */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1.5">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            onClick={() => onSelect(index)}
            className={cn(
              "group relative flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-all",
              "border",
              selectedIndex === index
                ? "border-primary/60 bg-primary/10"
                : "border-transparent hover:border-white/15 hover:bg-white/5",
              dragOver === index && dragIndexRef.current !== index
                ? "border-primary/80 bg-primary/20 scale-[1.02]"
                : ""
            )}
          >
            {/* 번호 + 드래그 핸들 */}
            <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
              <span className="text-[10px] font-bold text-white/30 w-4 text-center">
                {index + 1}
              </span>
              <GripVertical className="w-3 h-3 text-white/20 group-hover:text-white/40 transition-colors" />
            </div>

            {/* 미니 카드 썸네일 */}
            <div
              className="w-full aspect-square rounded-md overflow-hidden shrink-0 relative"
              style={{ background: slide.bgStyle.background, maxWidth: 56 }}
            >
              <div className="absolute inset-0 flex flex-col justify-between p-1.5">
                {slide.subtitle && (
                  <p
                    className="text-[5px] leading-tight truncate opacity-70"
                    style={{
                      color: slide.bgStyle.titleColor,
                      fontFamily: getFontCss(slide),
                    }}
                  >
                    {slide.subtitle}
                  </p>
                )}
                <p
                  className="text-[6px] font-bold leading-tight line-clamp-2"
                  style={{
                    color: slide.bgStyle.titleColor,
                    fontFamily: getFontCss(slide),
                  }}
                >
                  {slide.title || "제목 없음"}
                </p>
                <p
                  className="text-[5px] leading-tight line-clamp-2 opacity-80"
                  style={{
                    color: slide.bgStyle.textColor,
                    fontFamily: getFontCss(slide),
                  }}
                >
                  {slide.content}
                </p>
                {slide.cta && (
                  <div
                    className="rounded-sm text-[4px] px-1 py-0.5 text-center font-bold mt-0.5"
                    style={{
                      backgroundColor: slide.bgStyle.ctaBg,
                      color: slide.bgStyle.ctaText,
                    }}
                  >
                    {slide.cta}
                  </div>
                )}
              </div>
            </div>

            {/* 슬라이드 제목 텍스트 */}
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-xs font-medium text-white/80 truncate leading-tight">
                {slide.title || "제목 없음"}
              </p>
              <p className="text-[11px] text-white/40 truncate mt-0.5 leading-tight">
                {slide.content || "내용 없음"}
              </p>
            </div>

            {/* 삭제 버튼 */}
            {slides.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(index)
                }}
                className="absolute top-1.5 right-1.5 w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 text-red-400"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 슬라이드 추가 버튼 (하단) */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-white/20 text-white/40 hover:border-primary/40 hover:text-primary/70 transition-all text-xs font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          슬라이드 추가
        </button>
      </div>
    </div>
  )
}
