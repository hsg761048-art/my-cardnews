"use client"

import { useState, Suspense, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { CreateHeader } from "@/components/create/create-header"
import { StyleSelector } from "@/components/results/style-selector"
import { CardPreview } from "@/components/results/card-preview"
import { DownloadPanel } from "@/components/results/download-panel"
import { ShareDialog } from "@/components/results/share-dialog"
import { BgSourceSelector } from "@/components/results/bg-source-selector"
import { WatercolorBackground } from "@/components/ui/watercolor-background"
import { Sparkles, RefreshCw } from "lucide-react"
import type { GeneratedSlide } from "@/lib/ai-providers"
import type { BgSource } from "@/components/results/bg-source-selector"
import { saveToLibrary, updateLibraryItem, getCurrentLibraryId, setCurrentLibraryId } from "@/lib/library"
import { aiSlidesToSlides } from "@/lib/slide-utils"
import { createShareUrl } from "@/lib/slide-share"

export type CardStyle = "minimal" | "bold" | "elegant"

export interface SlideWithDesign {
  title: string
  subtitle?: string
  content: string
  cta?: string
  textAlign?: string
  design?: GeneratedSlide["design"]
}

export interface GeneratedCard {
  id: string
  style: CardStyle
  slides: SlideWithDesign[]
}

// localStorage에서 스타일별 AI 슬라이드 불러오기
function loadAISlides(style: CardStyle): GeneratedSlide[] | null {
  try {
    const raw = localStorage.getItem("generated-card-slides")
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.generatedAt > 10 * 60 * 1000) return null
    // 새 포맷 (slidesByStyle) 우선, 구버전 (slides) 폴백
    return parsed.slidesByStyle?.[style] ?? parsed.slides ?? null
  } catch {
    return null
  }
}

function ResultsContent() {
  const searchParams = useSearchParams()
  const title = searchParams.get("title") || "AI 생성 카드뉴스"
  const mainCopy = searchParams.get("mainCopy") || "당신의 멋진 콘텐츠가 생성되었습니다."

  const [selectedStyle, setSelectedStyle] = useState<CardStyle>("minimal")
  const [selectedSlide, setSelectedSlide] = useState(0)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [aiSlides, setAiSlides] = useState<GeneratedSlide[] | null>(null)

  // 배경 이미지 소스 (Pexels | FLUX.1 Pro)
  const [bgSource, setBgSource] = useState<BgSource>("pexels")
  const [fluxApiKey, setFluxApiKey] = useState("")
  // 실제 fetch에 사용되는 확정된 FLUX 키 (저장 버튼 누를 때만 업데이트)
  const [committedFluxKey, setCommittedFluxKey] = useState("")
  // 유저 원본 주제 ("새로운 스카프 출시" 같은 입력) → 이미지 검색 앵커
  const [originalTopic, setOriginalTopic] = useState("")

  // 슬라이드별 배경 이미지 상태
  const [slideImages, setSlideImages] = useState<Record<number, string>>({})
  const [slideImagesLoading, setSlideImagesLoading] = useState<Record<number, boolean>>({})

  // 스타일 변경 시 해당 스타일의 슬라이드 로드 + 원본 주제 읽기
  useEffect(() => {
    const slides = loadAISlides(selectedStyle)
    if (slides && slides.length > 0) {
      setAiSlides(slides)
    }
    // 원본 주제 로드 (create 페이지에서 저장)
    try {
      const topic = localStorage.getItem("card-original-topic") || ""
      setOriginalTopic(topic)
    } catch {}
  }, [selectedStyle])

  // 단일 슬라이드 배경 이미지 fetch
  const fetchSlideImage = useCallback(async (
    slideIndex: number,
    prompt: string,        // AI bgImagePrompt (보조용 — 영어인 경우만 활용)
    slideTitle: string,    // 슬라이드 제목 (감성 카피라 이미지 검색엔 부적합)
    topic: string,         // 유저 원본 주제 ("새로운 스카프 출시") → 가장 신뢰도 높음
    style: CardStyle,
    source: BgSource = "pexels",
    fluxKey: string = ""
  ) => {
    setSlideImagesLoading(prev => ({ ...prev, [slideIndex]: true }))

    // FLUX는 최대 50초, Pexels는 10초 클라이언트 타임아웃
    const timeoutMs = source === "flux" ? 50000 : 10000
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await fetch("/api/generate-bg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style,
          theme: prompt,          // AI bgImagePrompt (영어인 경우 보조 활용)
          slideTitle,             // 슬라이드 제목 (참고용)
          originalTopic: topic,   // 유저 원본 주제 → 서버에서 1순위 검색어로 사용
          bgSource: source,
          fluxApiKey: fluxKey || undefined,
        }),
        signal: controller.signal,
      })
      const data = await res.json()
      if (data.imageUrl) {
        setSlideImages(prev => ({ ...prev, [slideIndex]: data.imageUrl }))
      }
    } catch (e) {
      console.warn(`[슬라이드 ${slideIndex}] 배경 이미지 로딩 실패`, e)
    } finally {
      clearTimeout(timer)
      // 항상 로딩 해제 — 타임아웃/에러 시에도 스피너 영구 잠금 방지
      setSlideImagesLoading(prev => ({ ...prev, [slideIndex]: false }))
    }
  }, [])

  // 스타일 · 배경소스 변경 or AI 슬라이드 로드 시 → 모든 슬라이드 배경 이미지 재fetch
  useEffect(() => {
    if (!aiSlides) return

    setSlideImages({})
    setSlideImagesLoading({})

    if (bgSource === "flux") {
      // FLUX: 순차 실행
      ;(async () => {
        for (let index = 0; index < aiSlides.length; index++) {
          const slide = aiSlides[index]
          await fetchSlideImage(
            index,
            slide.design?.bgImagePrompt || "",
            slide.title,
            originalTopic,
            selectedStyle, bgSource, committedFluxKey
          )
        }
      })()
    } else {
      // Pexels: 병렬 실행
      aiSlides.forEach((slide, index) => {
        fetchSlideImage(
          index,
          slide.design?.bgImagePrompt || "",
          slide.title,
          originalTopic,
          selectedStyle, bgSource, committedFluxKey
        )
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiSlides, selectedStyle, bgSource, committedFluxKey])

  // 라이브러리 저장
  const handleSaveToLibrary = useCallback(() => {
    if (!aiSlides) return
    const slides = aiSlidesToSlides(aiSlides, slideImages)
    const existingId = getCurrentLibraryId()
    const itemData = {
      title: slides[0]?.title || title,
      originalTopic,
      style: selectedStyle,
      slides,
      thumbnail: slideImages[0] || undefined,
    }
    if (existingId) {
      updateLibraryItem(existingId, itemData)
    } else {
      const saved = saveToLibrary(itemData)
      setCurrentLibraryId(saved.id)
    }
  }, [aiSlides, slideImages, originalTopic, selectedStyle, title])

  // 특정 슬라이드 배경 재생성
  const handleRegenerateBg = async (slideIndex: number) => {
    const slide = aiSlides?.[slideIndex]
    await fetchSlideImage(
      slideIndex,
      slide?.design?.bgImagePrompt || "",
      slide?.title || title,
      originalTopic,
      selectedStyle, bgSource, committedFluxKey
    )
  }

  // 폴백 슬라이드
  const fallbackSlides: SlideWithDesign[] = [
    { title, subtitle: "새로운 시작", content: mainCopy, cta: "자세히 보기" },
    { title: "핵심 포인트 1", content: "첫 번째 슬라이드를 위한 핵심 내용입니다." },
    { title: "핵심 포인트 2", content: "두 번째 슬라이드를 위한 핵심 내용입니다." },
    { title: "핵심 포인트 3", content: "세 번째 슬라이드를 위한 핵심 내용입니다." },
    { title: "시작하기", content: "더 알아볼 준비가 되셨나요?", cta: "지금 시작" },
  ]

  const baseSlides: SlideWithDesign[] = aiSlides
    ? aiSlides.map(s => ({
        title: s.title,
        subtitle: s.subtitle,
        content: s.content,
        cta: s.cta,
        design: s.design,
      }))
    : fallbackSlides

  const generatedCards: GeneratedCard[] = [
    { id: "minimal", style: "minimal", slides: baseSlides },
    { id: "bold",    style: "bold",    slides: baseSlides },
    { id: "elegant", style: "elegant", slides: baseSlides },
  ]

  const currentCard = generatedCards.find(c => c.style === selectedStyle) || generatedCards[0]
  const isAnyLoading = Object.values(slideImagesLoading).some(Boolean)

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <WatercolorBackground intensity="light" />

      <div className="relative z-10">
        <CreateHeader variant="results" />

        <main className="max-w-6xl mx-auto px-6 md:px-8 py-8 pt-28">
          {/* Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium text-primary mb-4">
              <Sparkles className="w-4 h-4" />
              {aiSlides ? "AI 생성 완료 · " : ""}{baseSlides.length}장 슬라이드
              {isAnyLoading && (
                <span className="flex items-center gap-1 text-xs text-violet-500">
                  <RefreshCw className="w-3 h-3 animate-spin" /> 배경 이미지 자동 로딩 중
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              아이디어, <span className="bg-gradient-to-r from-violet-400 via-pink-500 to-sky-400 bg-clip-text text-transparent">콘텐츠</span>가 되다
            </h1>
            <p className="mt-3 text-slate-600 font-medium">
              AI가 배경 이미지·색상·폰트를 자동으로 완성했습니다
            </p>
          </div>

          {/* Style Selector + 배경 소스 선택 */}
          <div className="space-y-3">
            <StyleSelector
              selectedStyle={selectedStyle}
              onStyleChange={(style) => {
                setSelectedStyle(style)
                setSelectedSlide(0)
              }}
            />
            <BgSourceSelector
              bgSource={bgSource}
              fluxApiKey={fluxApiKey}
              onBgSourceChange={(source) => {
                setBgSource(source)
                setSelectedSlide(0)
              }}
              onFluxApiKeyChange={(key) => {
                setFluxApiKey(key)
                setCommittedFluxKey(key)  // 저장 버튼 클릭 시에만 재fetch 트리거
              }}
            />
          </div>

          {/* 배경 이미지 재생성 버튼 */}
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <button
              onClick={() => handleRegenerateBg(selectedSlide)}
              disabled={slideImagesLoading[selectedSlide]}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-full text-sm font-medium border border-violet-300 text-violet-600 hover:bg-violet-50 disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${slideImagesLoading[selectedSlide] ? "animate-spin" : ""}`} />
              현재 슬라이드 배경 재생성
            </button>
            {aiSlides?.[selectedSlide]?.design?.bgImagePrompt && (
              <span className="text-xs text-foreground/40 italic truncate max-w-sm">
                "{aiSlides[selectedSlide].design!.bgImagePrompt}"
              </span>
            )}
          </div>

          {/* Main Content */}
          <div className="mt-6 grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CardPreview
                card={currentCard}
                selectedSlide={selectedSlide}
                onSlideChange={setSelectedSlide}
                slideImages={slideImages}
                slideImagesLoading={slideImagesLoading}
              />
            </div>
            <div className="lg:col-span-1">
              <DownloadPanel
                card={currentCard}
                onShare={() => {
                  if (aiSlides) {
                    const slides = aiSlidesToSlides(aiSlides, slideImages)
                    setShareUrl(createShareUrl(slides, slides[0]?.title || title))
                  }
                  setShowShareDialog(true)
                }}
                slideImages={slideImages}
                onSaveToLibrary={handleSaveToLibrary}
                canSave={!!aiSlides}
              />
            </div>
          </div>
        </main>
      </div>

      <ShareDialog open={showShareDialog} onOpenChange={setShowShareDialog} shareUrl={shareUrl} />
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="relative text-center">
          <div className="absolute -inset-8 bg-gradient-to-r from-primary/20 via-pink-400/20 to-sky-400/20 rounded-full blur-2xl animate-soft-pulse" />
          <div className="relative w-20 h-20 rounded-full glass-card flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-8 h-8 text-primary animate-soft-pulse" />
          </div>
          <p className="relative text-muted-foreground">걸작을 불러오는 중...</p>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}
