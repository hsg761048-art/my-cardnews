"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  Sparkles, ArrowLeft, Check, BookmarkPlus, Pencil,
  Share2, Square, Smartphone, Monitor, Download, Library,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Slide, EditorCardData } from "@/components/editor/editor-types"
import { FONT_OPTIONS, FONT_SIZE_MAP, CONTENT_SIZE_MAP, ALIGN_MAP, VERTICAL_ALIGN_MAP } from "@/components/editor/editor-types"
import { ShareDialog } from "@/components/results/share-dialog"
import { downloadSlides } from "@/lib/slide-download"
import { createShareUrl } from "@/lib/slide-share"
import {
  saveToLibrary,
  updateLibraryItem,
  getCurrentLibraryId,
  setCurrentLibraryId,
} from "@/lib/library"

// ─── 내보내기 형식 ────────────────────────────────────────────
const EXPORT_FORMATS = [
  { id: "square",  label: "인스타그램",   sub: "1:1",   icon: Square },
  { id: "story",   label: "스토리·릴스",  sub: "9:16",  icon: Smartphone },
  { id: "blog",    label: "블로그·유튜브", sub: "16:9",  icon: Monitor },
]

// ─── 슬라이드 카드 렌더러 ──────────────────────────────────────
function SlideCard({ slide, index, total }: { slide: Slide; index: number; total: number }) {
  const fontCss = FONT_OPTIONS.find((f) => f.value === slide.fontFamily)?.css ?? "sans-serif"
  const titleClass = (FONT_SIZE_MAP[slide.titleSize] ?? FONT_SIZE_MAP["md"]).title
  const contentClass = (CONTENT_SIZE_MAP[slide.contentSize] ?? CONTENT_SIZE_MAP["md"]).content
  const alignClass = ALIGN_MAP[slide.textAlign] ?? ALIGN_MAP["left"]
  const verticalClass = VERTICAL_ALIGN_MAP[slide.verticalAlign ?? "middle"]

  return (
    <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl shadow-black/40 group">
      {slide.bgImageUrl ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${slide.bgImageUrl})` }}
          />
          <div className="absolute inset-0 bg-black/35" />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: slide.bgStyle.background }} />
      )}

      {/* 브랜드 로고 */}
      {slide.logoUrl && (
        <div className="absolute top-4 left-4 z-10">
          <img
            src={slide.logoUrl}
            alt="brand logo"
            className="h-7 max-w-[100px] object-contain"
          />
        </div>
      )}

      <div
        className="absolute inset-0 flex flex-col p-6"
        style={{
          fontFamily: fontCss,
          justifyContent:
            (slide.verticalAlign ?? "middle") === "top" ? "flex-start"
            : (slide.verticalAlign ?? "middle") === "bottom" ? "flex-end"
            : "center",
        }}
      >
        <div className={cn("flex flex-col gap-3", alignClass)}>
          {slide.subtitle && (
            <p className="text-sm font-medium opacity-80 whitespace-pre-line"
              style={{ color: slide.bgStyle.titleColor }}>
              {slide.subtitle}
            </p>
          )}
          <h2 className={cn("font-bold leading-tight whitespace-pre-line", titleClass)}
            style={{ color: slide.bgStyle.titleColor }}>
            {slide.title}
          </h2>
          <p className={cn("leading-relaxed whitespace-pre-line", contentClass)}
            style={{ color: slide.bgStyle.textColor }}>
            {slide.content}
          </p>
          {slide.cta && (
            <div className={cn("flex",
              slide.textAlign === "right" ? "justify-end"
                : slide.textAlign === "center" ? "justify-center"
                : "justify-start")}>
              <span className="inline-block px-5 py-2.5 text-sm font-bold rounded-full"
                style={{ backgroundColor: slide.bgStyle.ctaBg, color: slide.bgStyle.ctaText }}>
                {slide.cta}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-3 right-3">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: "rgba(0,0,0,0.35)", color: "rgba(255,255,255,0.75)", backdropFilter: "blur(4px)" }}>
          {index + 1}/{total}
        </span>
      </div>
    </div>
  )
}

// ─── 오른쪽 액션 패널 ──────────────────────────────────────────
function ActionPanel({
  slides,
  cardTitle,
  isSaved,
  onSaveToLibrary,
  onShare,
}: {
  slides: Slide[]
  cardTitle: string
  isSaved: boolean
  onSaveToLibrary: () => void
  onShare: () => void
}) {
  const router = useRouter()
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["square"])
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadDone, setDownloadDone] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 })

  const toggleFormat = (id: string) => {
    setSelectedFormats(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  const handleDownload = async () => {
    if (selectedFormats.length === 0 || isDownloading) return
    setIsDownloading(true)
    setDownloadProgress({ current: 0, total: slides.length * selectedFormats.length })
    try {
      await downloadSlides(
        slides,
        selectedFormats,
        cardTitle,
        (current, total) => setDownloadProgress({ current, total })
      )
      setDownloadDone(true)
      setTimeout(() => setDownloadDone(false), 3000)
    } catch (err) {
      console.error("다운로드 오류", err)
      alert("다운로드 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsDownloading(false)
    }
  }

  const totalFiles = slides.length * selectedFormats.length

  return (
    <div className="w-72 shrink-0">
      <div className="sticky top-20 space-y-3">

        {/* ① 라이브러리에 저장 */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
          <p className="text-[11px] text-white/40 uppercase tracking-widest font-semibold">저장</p>
          <button
            onClick={onSaveToLibrary}
            disabled={isSaved}
            className={cn(
              "w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-all",
              isSaved
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
            )}
          >
            {isSaved ? (
              <><Check className="w-4 h-4" />라이브러리에 저장됨</>
            ) : (
              <><BookmarkPlus className="w-4 h-4" />라이브러리에 저장하기</>
            )}
          </button>
          {isSaved && (
            <Link href="/library"
              className="flex items-center justify-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
              <Library className="w-3 h-3" />
              라이브러리 바로가기
            </Link>
          )}
        </div>

        {/* ② 내보내기 형식 선택 */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
          <p className="text-[11px] text-white/40 uppercase tracking-widest font-semibold">내보내기 형식</p>
          <div className="space-y-2">
            {EXPORT_FORMATS.map(({ id, label, sub, icon: Icon }) => {
              const active = selectedFormats.includes(id)
              return (
                <button
                  key={id}
                  onClick={() => toggleFormat(id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all",
                    active
                      ? "border-primary/50 bg-primary/10 text-white"
                      : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/80"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                    active ? "border-primary bg-primary" : "border-white/25"
                  )}>
                    {active && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <Icon className="w-4 h-4 shrink-0 opacity-70" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{label}</p>
                  </div>
                  <span className="text-[10px] text-white/30 border border-white/10 px-1.5 py-0.5 rounded-md shrink-0">
                    {sub}
                  </span>
                </button>
              )
            })}
          </div>

          {/* 요약 */}
          <div className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/8 text-xs space-y-1.5">
            <div className="flex justify-between text-white/40">
              <span>슬라이드 수</span><span className="text-white/60">{slides.length}장</span>
            </div>
            <div className="flex justify-between text-white/40">
              <span>선택 형식</span><span className="text-white/60">{selectedFormats.length}개</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-white/8 text-white/60 font-semibold">
              <span>총 파일 수</span><span>{totalFiles}개</span>
            </div>
          </div>

          {/* 다운로드 버튼 */}
          <button
            onClick={handleDownload}
            disabled={selectedFormats.length === 0 || isDownloading}
            className={cn(
              "w-full flex flex-col items-center justify-center gap-1 h-12 rounded-xl text-sm font-bold transition-all",
              downloadDone
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-white text-slate-900 hover:bg-white/90 shadow-lg disabled:opacity-40"
            )}
          >
            {isDownloading ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-700 rounded-full animate-spin" />
                  <span>렌더링 중... ({downloadProgress.current}/{downloadProgress.total})</span>
                </div>
                {downloadProgress.total > 0 && (
                  <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-slate-700 h-1 rounded-full transition-all"
                      style={{ width: `${(downloadProgress.current / downloadProgress.total) * 100}%` }}
                    />
                  </div>
                )}
              </>
            ) : downloadDone ? (
              <><Check className="w-4 h-4" />다운로드 완료!</>
            ) : (
              <><Download className="w-4 h-4" />ZIP 다운로드</>
            )}
          </button>
        </div>

        {/* ③ 공유 */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
          <p className="text-[11px] text-white/40 uppercase tracking-widest font-semibold">공유</p>
          <button
            onClick={onShare}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-white/15 text-white/70 hover:text-white hover:border-white/30 hover:bg-white/5 text-sm font-medium transition-all"
          >
            <Share2 className="w-4 h-4" />
            공유 링크 생성
          </button>
          <p className="text-[11px] text-white/25 text-center">카카오톡·이메일로 공유하고 피드백 받기</p>
        </div>

        {/* ④ 에디터로 돌아가기 */}
        <button
          onClick={() => router.back()}
          className="w-full flex items-center justify-center gap-2 h-10 rounded-xl text-white/40 hover:text-white/70 text-sm transition-all hover:bg-white/5"
        >
          <Pencil className="w-3.5 h-3.5" />
          에디터로 돌아가 수정하기
        </button>

      </div>
    </div>
  )
}

// ─── 미리보기 메인 콘텐츠 ─────────────────────────────────────
function PreviewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const style = searchParams.get("style") || "minimal"

  const [data, setData] = useState<EditorCardData | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareUrl, setShareUrl] = useState("")

  useEffect(() => {
    try {
      const raw = localStorage.getItem("card-editor-data")
      if (raw) setData(JSON.parse(raw) as EditorCardData)
    } catch {}
  }, [])

  const handleSaveToLibrary = () => {
    if (!data || isSaved) return
    const slides = data.slides
    const originalTopic = (() => {
      try { return localStorage.getItem("card-original-topic") || "" } catch { return "" }
    })()
    const existingId = getCurrentLibraryId()
    const itemData = {
      title: slides[0]?.title?.replace(/\n/g, " ") || "카드뉴스",
      originalTopic,
      style,
      slides,
      thumbnail: slides[0]?.bgImageUrl || undefined,
    }
    if (existingId) {
      updateLibraryItem(existingId, itemData)
    } else {
      const saved = saveToLibrary(itemData)
      setCurrentLibraryId(saved.id)
    }
    setIsSaved(true)
    setTimeout(() => router.push("/library"), 1400)
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0f0f1e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-white/40 text-sm">슬라이드 불러오는 중...</p>
          <p className="text-white/20 text-xs">데이터가 없으면 에디터에서 다시 시도해주세요</p>
          <Link href="/editor" className="mt-2 px-4 py-2 rounded-full text-xs bg-white/10 text-white/60 hover:bg-white/20 transition-all">
            에디터로 가기
          </Link>
        </div>
      </div>
    )
  }

  const cardTitle = data.slides[0]?.title?.replace(/\n/g, " ") || "카드뉴스"

  return (
    <div className="min-h-screen bg-[#0a0a18] text-white">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6 gap-3 border-b border-white/10 bg-[#0f0f1e]/90 backdrop-blur-xl">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={() => router.back()}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Link href="/" className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-white">내 머리속</span>
          </Link>
          <span className="hidden sm:flex items-center gap-1 text-white/40 text-xs">
            <span>/</span>
            <span className="text-white/60">결과 보기</span>
          </span>
        </div>
        <span className="text-white/30 text-xs hidden md:block">{cardTitle}</span>
      </header>

      {/* 메인 — 슬라이드 그리드 + 액션 패널 */}
      <main className="pt-20 pb-16 px-6 max-w-6xl mx-auto">
        <div className="flex gap-8 items-start">

          {/* 왼쪽: 슬라이드 그리드 */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-1.5 font-semibold">완성된 카드뉴스</p>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{cardTitle}</h1>
              <p className="text-white/40 text-sm mt-1">{data.slides.length}장 슬라이드</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {data.slides.map((slide, i) => (
                <SlideCard key={slide.id} slide={slide} index={i} total={data.slides.length} />
              ))}
            </div>
          </div>

          {/* 오른쪽: 액션 패널 */}
          <ActionPanel
            slides={data.slides}
            cardTitle={cardTitle}
            isSaved={isSaved}
            onSaveToLibrary={handleSaveToLibrary}
            onShare={() => {
              const url = createShareUrl(data.slides, cardTitle)
              setShareUrl(url)
              setShowShareDialog(true)
            }}
          />
        </div>
      </main>

      <ShareDialog open={showShareDialog} onOpenChange={setShowShareDialog} shareUrl={shareUrl} />
    </div>
  )
}

// ─── 페이지 진입점 ─────────────────────────────────────────────
export default function PreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f0f1e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-white/40 text-sm">불러오는 중...</p>
        </div>
      </div>
    }>
      <PreviewContent />
    </Suspense>
  )
}
