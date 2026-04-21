"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Sparkles, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Slide } from "@/components/editor/editor-types"
import { FONT_OPTIONS, FONT_SIZE_MAP, CONTENT_SIZE_MAP, ALIGN_MAP } from "@/components/editor/editor-types"
import { decodeShareData } from "@/lib/slide-share"

// ─── 슬라이드 카드 렌더러 ─────────────────────────────────────
function SlideCard({ slide }: { slide: Slide }) {
  const fontCss = FONT_OPTIONS.find((f) => f.value === slide.fontFamily)?.css ?? "sans-serif"
  const titleClass = FONT_SIZE_MAP[slide.titleSize].title
  const contentClass = CONTENT_SIZE_MAP[slide.contentSize].content
  const alignClass = ALIGN_MAP[slide.textAlign]

  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
      {slide.bgImageUrl ? (
        <>
          <div className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.bgImageUrl})` }} />
          <div className="absolute inset-0 bg-black/32" />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: slide.bgStyle.background }} />
      )}
      <div
        className={cn("absolute inset-0 flex flex-col justify-between p-8 md:p-10", alignClass)}
        style={{ fontFamily: fontCss }}
      >
        <div>
          {slide.subtitle && (
            <p className="text-base font-medium opacity-80 whitespace-pre-line"
              style={{ color: slide.bgStyle.titleColor }}>
              {slide.subtitle}
            </p>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-center gap-4">
          <h2 className={cn("font-bold leading-tight whitespace-pre-line", titleClass)}
            style={{ color: slide.bgStyle.titleColor }}>
            {slide.title}
          </h2>
          <p className={cn("leading-relaxed whitespace-pre-line", contentClass)}
            style={{ color: slide.bgStyle.textColor }}>
            {slide.content}
          </p>
        </div>
        <div className={cn("flex",
          slide.textAlign === "right" ? "justify-end"
            : slide.textAlign === "center" ? "justify-center"
            : "justify-start")}>
          {slide.cta && (
            <span className="inline-block px-6 py-3 text-base font-bold rounded-full"
              style={{ backgroundColor: slide.bgStyle.ctaBg, color: slide.bgStyle.ctaText }}>
              {slide.cta}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── 공유 뷰어 콘텐츠 ─────────────────────────────────────────
function ShareContent() {
  const searchParams = useSearchParams()
  const [slides, setSlides] = useState<Slide[]>([])
  const [title, setTitle] = useState("")
  const [current, setCurrent] = useState(0)
  const [error, setError] = useState(false)
  const [viewMode, setViewMode] = useState<"single" | "grid">("single")

  useEffect(() => {
    const d = searchParams.get("d")
    if (!d) { setError(true); return }
    const payload = decodeShareData(d)
    if (!payload || !payload.slides?.length) { setError(true); return }
    setSlides(payload.slides)
    setTitle(payload.title || "공유된 카드뉴스")
  }, [searchParams])

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a18] flex flex-col items-center justify-center gap-4 text-white">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-lg font-bold">공유 링크가 올바르지 않습니다</p>
        <p className="text-white/40 text-sm">링크가 만료되었거나 잘못된 형식입니다</p>
        <Link href="/" className="mt-4 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold">
          홈으로 가기
        </Link>
      </div>
    )
  }

  if (!slides.length) {
    return (
      <div className="min-h-screen bg-[#0a0a18] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a18] text-white">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6 border-b border-white/10 bg-[#0f0f1e]/90 backdrop-blur-xl">
        <div className="flex items-center gap-2 flex-1">
          <Link href="/" className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold">내 머리속 카드뉴스</span>
          </Link>
          <span className="text-white/20 text-xs mx-1">/</span>
          <span className="text-white/50 text-xs truncate max-w-[160px]">{title}</span>
        </div>
        {/* 보기 모드 토글 */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10 text-xs">
          <button onClick={() => setViewMode("single")}
            className={cn("px-3 py-1 rounded-md font-medium transition-all",
              viewMode === "single" ? "bg-primary text-primary-foreground" : "text-white/40 hover:text-white/70")}>
            슬라이드
          </button>
          <button onClick={() => setViewMode("grid")}
            className={cn("px-3 py-1 rounded-md font-medium transition-all",
              viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-white/40 hover:text-white/70")}>
            전체 보기
          </button>
        </div>
        <Link href="/create"
          className="ml-3 hidden sm:flex items-center gap-1.5 h-8 px-4 rounded-full bg-primary text-primary-foreground text-xs font-bold">
          <Sparkles className="w-3 h-3" />
          나도 만들기
        </Link>
      </header>

      <main className="pt-14 min-h-screen">
        {viewMode === "single" ? (
          /* ── 단일 슬라이드 뷰 ── */
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-4 py-8 gap-6">
            <div className="w-full max-w-lg">
              <SlideCard slide={slides[current]} />
            </div>
            {/* 네비게이션 */}
            <div className="flex items-center gap-4">
              <button onClick={() => setCurrent(p => Math.max(0, p - 1))}
                disabled={current === 0}
                className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 disabled:opacity-25 transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1.5">
                {slides.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)}
                    className={cn("h-1.5 rounded-full transition-all",
                      i === current ? "w-6 bg-primary" : "w-1.5 bg-white/25 hover:bg-white/50")} />
                ))}
              </div>
              <button onClick={() => setCurrent(p => Math.min(slides.length - 1, p + 1))}
                disabled={current === slides.length - 1}
                className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 disabled:opacity-25 transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <p className="text-white/30 text-sm">{current + 1} / {slides.length}</p>
          </div>
        ) : (
          /* ── 전체 그리드 뷰 ── */
          <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">{title}</h1>
              <p className="text-white/40 text-sm mt-1">{slides.length}장 슬라이드</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {slides.map((slide, i) => (
                <button key={i} onClick={() => { setCurrent(i); setViewMode("single") }}
                  className="group relative">
                  <SlideCard slide={slide} />
                  <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-primary/60 transition-all" />
                  <div className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "rgba(0,0,0,0.4)", color: "rgba(255,255,255,0.8)" }}>
                    {i + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 하단 CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0a18] to-transparent flex justify-center">
        <Link href="/create"
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-xl shadow-primary/30 hover:scale-105 transition-transform">
          <Sparkles className="w-4 h-4" />
          나도 카드뉴스 만들기
        </Link>
      </div>
    </div>
  )
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a18] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <ShareContent />
    </Suspense>
  )
}
