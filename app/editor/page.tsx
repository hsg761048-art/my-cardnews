"use client"

import { useState, useCallback, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { EditorHeader } from "@/components/editor/editor-header"
import { SlideList } from "@/components/editor/slide-list"
import { SlideEditorPanel } from "@/components/editor/slide-editor-panel"
import { EditorPreview } from "@/components/editor/editor-preview"
import { createDefaultSlide, BG_PRESETS } from "@/components/editor/editor-types"
import type { Slide, EditorCardData, BgStyle, FontFamily } from "@/components/editor/editor-types"
import type { GeneratedSlide } from "@/lib/ai-providers"

// ─── Undo/Redo 훅 ───────────────────────────────────────────────
function useHistory<T>(initial: T) {
  const [history, setHistory] = useState<T[]>([initial])
  const [pointer, setPointer] = useState(0)

  const current = history[pointer]

  const push = useCallback(
    (next: T) => {
      setHistory((prev) => [...prev.slice(0, pointer + 1), next])
      setPointer((p) => p + 1)
    },
    [pointer]
  )

  const undo = useCallback(() => {
    setPointer((p) => Math.max(0, p - 1))
  }, [])

  const redo = useCallback(() => {
    setHistory((prev) => {
      setPointer((p) => Math.min(prev.length - 1, p + 1))
      return prev
    })
  }, [])

  // 히스토리 전체를 새 초기값으로 리셋 (hydration 이후 localStorage 로드 시 사용)
  const reset = useCallback((next: T) => {
    setHistory([next])
    setPointer(0)
  }, [])

  return {
    current,
    push,
    undo,
    redo,
    reset,
    canUndo: pointer > 0,
    canRedo: pointer < history.length - 1,
  }
}

// ─── AI 생성 design → BgStyle 변환 ──────────────────────────────
function designToBgStyle(design: GeneratedSlide["design"]): BgStyle {
  if (!design) return BG_PRESETS[0].style
  return {
    type: design.background.includes("gradient") ? "gradient" : "solid",
    background: design.background,
    textColor: design.textColor,
    titleColor: design.titleColor,
    ctaBg: design.ctaBg,
    ctaText: design.ctaText,
  }
}

// fontFamily 문자열 → FontFamily 타입 변환
function toFontFamily(font: string | undefined): FontFamily {
  const valid: FontFamily[] = ["pretendard", "noto-sans", "nanum-gothic", "nanum-myeongjo"]
  return valid.includes(font as FontFamily) ? (font as FontFamily) : "pretendard"
}

// ─── localStorage에서 AI 생성 슬라이드 읽기 ──────────────────────
// results 페이지와 동일한 로직: slidesByStyle[style] 우선, 구포맷 slides 폴백
function loadAISlides(style: string = "minimal"): GeneratedSlide[] | null {
  try {
    const raw = localStorage.getItem("generated-card-slides")
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // 15분 이내 생성된 것만 사용 (results 10분보다 여유있게 — 결과 페이지에서
    // 디자인 검토하는 시간을 고려)
    if (Date.now() - parsed.generatedAt > 15 * 60 * 1000) return null
    // 새 포맷 (slidesByStyle) 우선, 구버전 (slides) 폴백
    const slides: GeneratedSlide[] | undefined =
      parsed.slidesByStyle?.[style] ?? parsed.slides
    return slides && slides.length > 0 ? slides : null
  } catch {
    return null
  }
}

// ─── 라이브러리에서 슬라이드 읽기 ────────────────────────────────
function loadLibrarySlides(): Slide[] | null {
  try {
    const raw = localStorage.getItem("library-editor-slides")
    if (!raw) return null
    return JSON.parse(raw) as Slide[]
  } catch {
    return null
  }
}

// ─── AI 생성 슬라이드 → EditorCardData 변환 ──────────────────────
function aiSlidesToEditorData(aiSlides: GeneratedSlide[]): EditorCardData {
  // 결과 페이지에서 저장한 배경 이미지 URL 로드
  let savedImages: Record<number, string> = {}
  try {
    const raw = localStorage.getItem("editor-slide-images")
    if (raw) savedImages = JSON.parse(raw)
  } catch {}

  const slides: Slide[] = aiSlides.map((s, i) => {
    const bgStyle = designToBgStyle(s.design)
    const fontFamily = toFontFamily(s.design?.fontFamily)
    return createDefaultSlide({
      title: s.title,
      subtitle: s.subtitle ?? "",
      content: s.content,
      cta: s.cta ?? "",
      bgStyle,
      fontFamily,
      textAlign: i === 0 ? "center" : "left",
      bgImagePrompt: s.design?.bgImagePrompt,
      bgImageUrl: savedImages[i] || undefined,
    })
  })

  // 대표 폰트는 첫 슬라이드 폰트 사용
  const globalFont = toFontFamily(aiSlides[0]?.design?.fontFamily)
  return { slides, globalFont }
}

// ─── URL params에서 초기 슬라이드 생성 (fallback) ────────────────
function buildFallbackData(
  title: string,
  mainCopy: string,
  style: string
): EditorCardData {
  const bgByStyle: BgStyle =
    style === "bold"
      ? BG_PRESETS[3].style  // 오션 블루
      : style === "elegant"
      ? BG_PRESETS[2].style  // 딥 퍼플
      : BG_PRESETS[0].style  // 나이트 블루

  const slideBgs = [
    bgByStyle,
    BG_PRESETS[3].style,
    BG_PRESETS[1].style,
    BG_PRESETS[2].style,
    BG_PRESETS[5].style,
  ]

  const slides: Slide[] = [
    createDefaultSlide({
      title,
      subtitle:
        style === "bold"
          ? "특별한 기회"
          : style === "elegant"
          ? "프리미엄 경험"
          : "새로운 시작",
      content: mainCopy,
      cta:
        style === "bold"
          ? "확인하기"
          : style === "elegant"
          ? "경험하기"
          : "자세히 보기",
      bgStyle: slideBgs[0],
      textAlign: "center",
    }),
    createDefaultSlide({
      title: style === "bold" ? "WHY?" : "핵심 포인트 1",
      content: "첫 번째 슬라이드를 위한 핵심 내용입니다.",
      bgStyle: slideBgs[1],
    }),
    createDefaultSlide({
      title: style === "bold" ? "HOW?" : "핵심 포인트 2",
      content: "두 번째 슬라이드를 위한 핵심 내용입니다.",
      bgStyle: slideBgs[2],
    }),
    createDefaultSlide({
      title: style === "bold" ? "WHAT?" : "핵심 포인트 3",
      content: "세 번째 슬라이드를 위한 핵심 내용입니다.",
      bgStyle: slideBgs[3],
    }),
    createDefaultSlide({
      title: style === "bold" ? "NOW!" : "지금 시작하기",
      content: "더 알아볼 준비가 되셨나요?",
      cta: style === "bold" ? "신청하기" : "지금 시작",
      bgStyle: slideBgs[4],
      textAlign: "center",
    }),
  ]

  return { slides, globalFont: "pretendard" }
}

// ─── 에디터 메인 콘텐츠 ───────────────────────────────────────
function EditorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const title = searchParams.get("title") || "AI 생성 카드뉴스"
  const mainCopy = searchParams.get("mainCopy") || "당신의 멋진 콘텐츠가 생성되었습니다."
  const style = searchParams.get("style") || "minimal"

  const fromLibrary = searchParams.get("fromLibrary")

  // SSR 안전: 항상 fallback으로 초기화, 마운트 후 localStorage에서 실제 데이터 로드
  const { current, push, undo, redo, reset, canUndo, canRedo } = useHistory<EditorCardData>(
    buildFallbackData(title, mainCopy, style)
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isSaved, setIsSaved] = useState(false)

  // 마운트 후 localStorage에서 실제 슬라이드 로드 (hydration mismatch 방지)
  useEffect(() => {
    const librarySlides = fromLibrary ? loadLibrarySlides() : null
    // URL의 style 파라미터를 존중 — 결과 페이지에서 "bold"를 보다가 편집으로 넘어오면
    // bold 슬라이드를 로드해야 함
    const aiSlides = !librarySlides ? loadAISlides(style) : null

    if (librarySlides && librarySlides.length > 0) {
      reset({ slides: librarySlides, globalFont: librarySlides[0]?.fontFamily ?? "pretendard" })
    } else if (aiSlides && aiSlides.length > 0) {
      reset(aiSlidesToEditorData(aiSlides))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const slides = current.slides

  // Ctrl+Z / Ctrl+Y / Ctrl+S 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        (e.target as HTMLElement)?.tagName === "INPUT" ||
        (e.target as HTMLElement)?.tagName === "TEXTAREA"

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey && !isInput) {
        e.preventDefault()
        undo()
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey)) &&
        !isInput
      ) {
        e.preventDefault()
        redo()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        handleSaveInner()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo])

  // 슬라이드 업데이트 (현재 선택된 슬라이드)
  const updateSlide = useCallback(
    (updates: Partial<Slide>) => {
      const next: EditorCardData = {
        ...current,
        slides: current.slides.map((s, i) =>
          i === selectedIndex ? { ...s, ...updates } : s
        ),
      }
      push(next)
      setIsSaved(false)
    },
    [current, selectedIndex, push]
  )

  // 슬라이드 추가
  const addSlide = useCallback(() => {
    const lastSlide = current.slides[current.slides.length - 1]
    const next: EditorCardData = {
      ...current,
      slides: [
        ...current.slides,
        createDefaultSlide({ bgStyle: lastSlide?.bgStyle }),
      ],
    }
    push(next)
    setSelectedIndex(next.slides.length - 1)
    setIsSaved(false)
  }, [current, push])

  // 슬라이드 삭제
  const deleteSlide = useCallback(
    (index: number) => {
      if (current.slides.length <= 1) return
      const next: EditorCardData = {
        ...current,
        slides: current.slides.filter((_, i) => i !== index),
      }
      push(next)
      setSelectedIndex((prev) => Math.min(prev, next.slides.length - 1))
      setIsSaved(false)
    },
    [current, push]
  )

  // 슬라이드 순서 변경
  const reorderSlides = useCallback(
    (fromIndex: number, toIndex: number) => {
      const newSlides = [...current.slides]
      const [moved] = newSlides.splice(fromIndex, 1)
      newSlides.splice(toIndex, 0, moved)
      push({ ...current, slides: newSlides })
      setSelectedIndex(toIndex)
      setIsSaved(false)
    },
    [current, push]
  )

  const handleSaveInner = () => {
    try {
      localStorage.setItem("card-editor-data", JSON.stringify(current))
      // library-editor-slides 초기화 (라이브러리에서 온 경우 중복 로드 방지)
      try { localStorage.removeItem("library-editor-slides") } catch {}
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    } catch {}
  }

  const handleExport = () => {
    // 임시저장 후 미리보기 페이지로 이동
    handleSaveInner()
    router.push(`/preview?style=${style}`)
  }

  return (
    <div className="h-screen bg-[#0f0f1e] text-white overflow-hidden flex flex-col">
      <EditorHeader
        onSave={handleSaveInner}
        onExport={handleExport}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        isSaved={isSaved}
        slideCount={slides.length}
      />

      {/* 메인 레이아웃 (헤더 아래) */}
      <div className="flex flex-1 overflow-hidden pt-14">

        {/* ── 왼쪽 패널: 슬라이드 목록 ── */}
        <aside className="w-52 shrink-0 flex flex-col border-r border-white/10 bg-[#0c0c1a] overflow-hidden">
          <SlideList
            slides={slides}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            onAdd={addSlide}
            onDelete={deleteSlide}
            onReorder={reorderSlides}
          />
        </aside>

        {/* ── 가운데: 편집 패널 ── */}
        <aside className="w-72 shrink-0 flex flex-col border-r border-white/10 bg-[#0e0e1c] overflow-hidden">
          <SlideEditorPanel
            slide={slides[selectedIndex]}
            onChange={updateSlide}
          />
        </aside>

        {/* ── 오른쪽: 실시간 미리보기 ── */}
        <main className="flex-1 bg-[#0a0a18] overflow-hidden">
          <EditorPreview
            slides={slides}
            selectedIndex={selectedIndex}
            onSlideChange={setSelectedIndex}
          />
        </main>
      </div>
    </div>
  )
}

// ─── 페이지 진입점 ─────────────────────────────────────────────
export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-[#0f0f1e] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-white/40 text-sm">에디터 불러오는 중...</p>
          </div>
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  )
}
