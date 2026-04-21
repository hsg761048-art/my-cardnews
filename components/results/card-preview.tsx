"use client"

import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { GeneratedCard } from "@/app/results/page"

interface CardPreviewProps {
  card: GeneratedCard
  selectedSlide: number
  onSlideChange: (index: number) => void
  slideImages?: Record<number, string>   // 슬라이드별 Pexels 이미지
  slideImagesLoading?: Record<number, boolean>  // 슬라이드별 로딩 상태
}

const FONT_CSS: Record<string, string> = {
  "pretendard": "'Pretendard Variable', Pretendard, sans-serif",
  "noto-sans": "'Noto Sans KR', sans-serif",
  "nanum-gothic": "'Nanum Gothic', sans-serif",
  "nanum-myeongjo": "'Nanum Myeongjo', serif",
}

// AI design 없을 때 중립 폴백
const FALLBACK = {
  background: "#1a1a2e",
  titleColor: "#ffffff",
  textColor: "rgba(255,255,255,0.85)",
  ctaBg: "#6366f1",
  ctaText: "#ffffff",
  fontFamily: "pretendard",
  textAlign: "center" as const,
}

export function CardPreview({
  card,
  selectedSlide,
  onSlideChange,
  slideImages = {},
  slideImagesLoading = {},
}: CardPreviewProps) {
  const currentSlide = card.slides[selectedSlide]
  const design = currentSlide.design
  const bgImage = slideImages[selectedSlide]
  const isLoading = slideImagesLoading[selectedSlide]

  // AI design 또는 폴백
  const bg = design?.background ?? FALLBACK.background
  const titleColor = design?.titleColor ?? FALLBACK.titleColor
  const textColor = design?.textColor ?? FALLBACK.textColor
  const ctaBg = design?.ctaBg ?? FALLBACK.ctaBg
  const ctaText = design?.ctaText ?? FALLBACK.ctaText
  const fontCSS = FONT_CSS[design?.fontFamily ?? FALLBACK.fontFamily] ?? FONT_CSS["pretendard"]

  // 텍스트 정렬 (AI가 결정)
  const textAlignStyle = (currentSlide as { textAlign?: string }).textAlign ?? "center"
  const alignClass = textAlignStyle === "left" ? "text-left items-start"
    : textAlignStyle === "right" ? "text-right items-end"
    : "text-center items-center"

  const goToPrevious = () => selectedSlide > 0 && onSlideChange(selectedSlide - 1)
  const goToNext = () => selectedSlide < card.slides.length - 1 && onSlideChange(selectedSlide + 1)

  return (
    <div className="bg-muted/50 border border-border p-6 md:p-8">
      {/* Preview Label */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-slate-600 font-medium flex items-center gap-2">
          미리보기 - 슬라이드 {selectedSlide + 1} / {card.slides.length}
          {design && (
            <span className="text-xs text-primary/70 font-semibold">✦ AI 디자인</span>
          )}
          {isLoading && (
            <span className="flex items-center gap-1 text-xs text-violet-500">
              <Loader2 className="w-3 h-3 animate-spin" /> 배경 로딩 중
            </span>
          )}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={goToPrevious} disabled={selectedSlide === 0}
            className="rounded-none hover:bg-foreground hover:text-background disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={goToNext} disabled={selectedSlide === card.slides.length - 1}
            className="rounded-none hover:bg-foreground hover:text-background disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Card Preview */}
      <div className="flex justify-center">
        <div
          className="aspect-square w-full max-w-md p-8 flex flex-col justify-between transition-all shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] animate-frame-mount relative overflow-hidden"
          style={bgImage
            ? { backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: bg }
          }
        >
          {/* 배경 이미지 어두운 오버레이 */}
          {bgImage && <div className="absolute inset-0 bg-black/40 z-0" />}

          {/* 로딩 스피너 오버레이 */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}

          {/* Header */}
          <div className={cn("relative z-10 flex flex-col", alignClass)}>
            {currentSlide.subtitle && (
              <p className="text-sm mb-2 opacity-80" style={{ color: bgImage ? "#fff" : textColor, fontFamily: fontCSS }}>
                {currentSlide.subtitle}
              </p>
            )}
            <h2 className="text-2xl md:text-3xl font-bold leading-tight"
              style={{ color: bgImage ? "#ffffff" : titleColor, fontFamily: fontCSS, textShadow: bgImage ? "0 2px 8px rgba(0,0,0,0.5)" : "none" }}>
              {currentSlide.title}
            </h2>
          </div>

          {/* Content */}
          <div className={cn("flex-1 flex items-center py-8 relative z-10", alignClass)}>
            <p className="leading-relaxed text-sm md:text-base"
              style={{ color: bgImage ? "rgba(255,255,255,0.92)" : textColor, fontFamily: fontCSS, textShadow: bgImage ? "0 1px 4px rgba(0,0,0,0.4)" : "none" }}>
              {currentSlide.content}
            </p>
          </div>

          {/* CTA */}
          {currentSlide.cta && (
            <div className={cn("relative z-10 flex", alignClass)}>
              <span className="px-6 py-2.5 text-sm font-bold rounded-full"
                style={bgImage
                  ? { backgroundColor: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", backdropFilter: "blur(4px)", fontFamily: fontCSS }
                  : { backgroundColor: ctaBg, color: ctaText, fontFamily: fontCSS }
                }>
                {currentSlide.cta}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center gap-2 mt-8">
        {card.slides.map((_, index) => (
          <button key={index} onClick={() => onSlideChange(index)}
            className={cn("h-1.5 transition-all rounded-full",
              index === selectedSlide ? "bg-foreground w-6" : "bg-border w-1.5 hover:bg-muted-foreground"
            )} />
        ))}
      </div>

      {/* Thumbnail Strip */}
      <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
        {card.slides.map((slide, index) => {
          const thumbDesign = slide.design
          const thumbImage = slideImages[index]
          const thumbLoading = slideImagesLoading[index]
          return (
            <button key={index} onClick={() => onSlideChange(index)}
              className={cn(
                "shrink-0 w-16 aspect-square p-2 flex flex-col justify-between transition-all relative overflow-hidden",
                index === selectedSlide
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-muted/50"
                  : "opacity-50 hover:opacity-80"
              )}
              style={thumbImage
                ? { backgroundImage: `url(${thumbImage})`, backgroundSize: "cover", backgroundPosition: "center" }
                : thumbDesign ? { background: thumbDesign.background } : { background: "#1a1a2e" }
              }
            >
              {thumbImage && <div className="absolute inset-0 bg-black/30" />}
              {thumbLoading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-3 h-3 text-white animate-spin" /></div>}
              <div className="w-3 h-0.5 relative z-10" style={{ backgroundColor: thumbDesign?.titleColor ?? "#fff", opacity: 0.6 }} />
              <p className="text-[6px] font-medium truncate relative z-10" style={{ color: thumbDesign?.titleColor ?? "#fff" }}>
                {slide.title}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
