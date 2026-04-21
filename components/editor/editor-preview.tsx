"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Smartphone, Square } from "lucide-react"
import type { Slide } from "./editor-types"
import { FONT_OPTIONS, FONT_SIZE_MAP, CONTENT_SIZE_MAP, ALIGN_MAP, VERTICAL_ALIGN_MAP } from "./editor-types"

type AspectMode = "square" | "story"

interface EditorPreviewProps {
  slides: Slide[]
  selectedIndex: number
  onSlideChange: (index: number) => void
}

export function EditorPreview({ slides, selectedIndex, onSlideChange }: EditorPreviewProps) {
  const [aspectMode, setAspectMode] = useState<AspectMode>("square")
  const slide = slides[selectedIndex]

  if (!slide) return null

  const fontCss = FONT_OPTIONS.find((f) => f.value === slide.fontFamily)?.css ?? "sans-serif"
  const titleClass = FONT_SIZE_MAP[slide.titleSize].title
  const contentClass = CONTENT_SIZE_MAP[slide.contentSize].content
  const alignClass = ALIGN_MAP[slide.textAlign]
  const verticalClass = VERTICAL_ALIGN_MAP[slide.verticalAlign ?? "middle"]

  const goToPrev = () => {
    if (selectedIndex > 0) onSlideChange(selectedIndex - 1)
  }
  const goToNext = () => {
    if (selectedIndex < slides.length - 1) onSlideChange(selectedIndex + 1)
  }

  return (
    <div className="flex flex-col items-center h-full py-6 px-4 gap-4">
      {/* 상단 컨트롤 */}
      <div className="flex items-center gap-4 w-full max-w-sm">
        {/* 비율 토글 */}
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

        {/* 슬라이드 네비게이션 */}
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
          {/* 배경: 사진 URL 있으면 이미지, 없으면 CSS 컬러/그라디언트 */}
          {slide.bgImageUrl ? (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${slide.bgImageUrl})` }}
              />
              {/* 가독성을 위한 오버레이 */}
              <div className="absolute inset-0 bg-black/30" />
            </>
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: slide.bgStyle.background }}
            />
          )}

          {/* 콘텐츠 */}
          <div
            className={cn(
              "absolute inset-0 flex flex-col p-6 md:p-8 gap-4",
              alignClass,
              verticalClass
            )}
            style={{ fontFamily: fontCss }}
          >
            {/* 서브타이틀 */}
            <div>
              {slide.subtitle && (
                <p
                  className="text-sm font-medium mb-2 opacity-80 whitespace-pre-line"
                  style={{ color: slide.bgStyle.titleColor }}
                >
                  {slide.subtitle}
                </p>
              )}
            </div>

            {/* 메인 타이틀 */}
            <div className="flex-1 flex flex-col justify-center gap-4">
              <h2
                className={cn("font-bold leading-tight whitespace-pre-line", titleClass)}
                style={{ color: slide.bgStyle.titleColor }}
              >
                {slide.title || "제목을 입력하세요"}
              </h2>

              <p
                className={cn("leading-relaxed whitespace-pre-line", contentClass)}
                style={{ color: slide.bgStyle.textColor }}
              >
                {slide.content || "내용을 입력하세요"}
              </p>
            </div>

            {/* CTA */}
            <div className={cn("flex", slide.textAlign === "right" ? "justify-end" : slide.textAlign === "center" ? "justify-center" : "justify-start")}>
              {slide.cta && (
                <span
                  className="inline-block px-5 py-2.5 text-sm font-bold rounded-full"
                  style={{
                    backgroundColor: slide.bgStyle.ctaBg,
                    color: slide.bgStyle.ctaText,
                  }}
                >
                  {slide.cta}
                </span>
              )}
            </div>
          </div>

          {/* 슬라이드 번호 표시 */}
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

      {/* 하단 슬라이드 도트 인디케이터 */}
      <div className="flex items-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => onSlideChange(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === selectedIndex
                ? "w-6 bg-primary"
                : "w-1.5 bg-white/25 hover:bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  )
}
