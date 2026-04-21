"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Sparkles, Plus, Trash2, Pencil, BookOpen,
  Clock, Layers, ChevronRight, Library,
  Download, Share2, Check, X, Square, Smartphone, Monitor,
} from "lucide-react"
import { WatercolorBackground } from "@/components/ui/watercolor-background"
import {
  getLibraryItems,
  deleteLibraryItem,
  setCurrentLibraryId,
  type LibraryItem,
} from "@/lib/library"
import { ShareDialog } from "@/components/results/share-dialog"
import { downloadSlides } from "@/lib/slide-download"
import { createShareUrl } from "@/lib/slide-share"
import { cn } from "@/lib/utils"

const STYLE_LABELS: Record<string, { label: string; color: string }> = {
  minimal: { label: "미니멀", color: "bg-slate-100 text-slate-600 border-slate-200" },
  bold:    { label: "볼드",   color: "bg-blue-50 text-blue-600 border-blue-200" },
  elegant: { label: "엘레강스", color: "bg-purple-50 text-purple-600 border-purple-200" },
}

const EXPORT_FORMATS = [
  { id: "square", label: "인스타그램", sub: "1:1",   icon: Square },
  { id: "story",  label: "스토리·릴스", sub: "9:16", icon: Smartphone },
  { id: "blog",   label: "블로그",      sub: "16:9", icon: Monitor },
]

function formatDate(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const diffMs = now.getTime() - ts
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return "방금 전"
  if (diffMin < 60) return `${diffMin}분 전`
  if (diffHr < 24) return `${diffHr}시간 전`
  if (diffDay < 7) return `${diffDay}일 전`
  return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
}

// ─── 다운로드 모달 ─────────────────────────────────────────────
function DownloadModal({
  item,
  onClose,
  onShare,
}: {
  item: LibraryItem
  onClose: () => void
  onShare: (url: string) => void
}) {
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["square"])
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadDone, setDownloadDone] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  const toggleFormat = (id: string) => {
    setSelectedFormats(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  const handleDownload = async () => {
    if (selectedFormats.length === 0 || isDownloading) return
    setIsDownloading(true)
    setProgress({ current: 0, total: item.slides.length * selectedFormats.length })
    try {
      await downloadSlides(
        item.slides,
        selectedFormats,
        item.title,
        (current, total) => setProgress({ current, total })
      )
      setDownloadDone(true)
      setTimeout(() => setDownloadDone(false), 3000)
    } catch (err) {
      console.error("다운로드 오류", err)
      alert("다운로드 중 오류가 발생했습니다.")
    } finally {
      setIsDownloading(false)
    }
  }

  const totalFiles = item.slides.length * selectedFormats.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 백드롭 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <p className="font-bold text-slate-800 text-sm truncate max-w-[200px]">
              {item.title}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{item.slides.length}장 슬라이드</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* 형식 선택 */}
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2.5">내보내기 형식</p>
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
                        ? "border-violet-400 bg-violet-50 text-violet-700"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                      active ? "border-violet-500 bg-violet-500" : "border-slate-300"
                    )}>
                      {active && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <Icon className="w-4 h-4 shrink-0 opacity-60" />
                    <span className="flex-1 text-sm font-medium">{label}</span>
                    <span className="text-[10px] border border-current/20 px-1.5 py-0.5 rounded-md opacity-60">{sub}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 요약 */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
            <span>총 파일 수</span>
            <span className="font-bold text-slate-700">{totalFiles}개</span>
          </div>

          {/* 다운로드 버튼 */}
          <button
            onClick={handleDownload}
            disabled={selectedFormats.length === 0 || isDownloading}
            className={cn(
              "w-full flex flex-col items-center justify-center gap-1 h-12 rounded-xl text-sm font-bold transition-all",
              downloadDone
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : "bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40"
            )}
          >
            {isDownloading ? (
              <>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  렌더링 중... ({progress.current}/{progress.total})
                </div>
                {progress.total > 0 && (
                  <div className="w-full bg-white/20 rounded-full h-1 overflow-hidden">
                    <div className="bg-white h-1 rounded-full transition-all"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }} />
                  </div>
                )}
              </>
            ) : downloadDone ? (
              <><Check className="w-4 h-4" />다운로드 완료!</>
            ) : (
              <><Download className="w-4 h-4" />ZIP 다운로드</>
            )}
          </button>

          {/* 공유 링크 */}
          <button
            onClick={() => {
              const url = createShareUrl(item.slides, item.title)
              onClose()
              setTimeout(() => onShare(url), 150)
            }}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-all"
          >
            <Share2 className="w-4 h-4" />
            공유 링크 생성
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── 메인 페이지 ───────────────────────────────────────────────
export default function LibraryPage() {
  const router = useRouter()
  const [items, setItems] = useState<LibraryItem[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [downloadItem, setDownloadItem] = useState<LibraryItem | null>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareUrl, setShareUrl] = useState("")

  useEffect(() => {
    setItems(getLibraryItems())
  }, [])

  const handleEdit = (item: LibraryItem) => {
    try {
      setCurrentLibraryId(item.id)
      const slideImages: Record<number, string> = {}
      item.slides.forEach((slide, i) => {
        if (slide.bgImageUrl) slideImages[i] = slide.bgImageUrl
      })
      localStorage.setItem("editor-slide-images", JSON.stringify(slideImages))
      localStorage.setItem("library-editor-slides", JSON.stringify(item.slides))
    } catch {}
    router.push(`/editor?title=${encodeURIComponent(item.title)}&style=${item.style}&fromLibrary=${item.id}`)
  }

  const handleDelete = (id: string) => {
    setDeletingId(id)
    setTimeout(() => {
      deleteLibraryItem(id)
      setItems(prev => prev.filter(item => item.id !== id))
      setDeletingId(null)
    }, 300)
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <WatercolorBackground intensity="light" />

      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold text-violet-500">내 머리속 카드뉴스</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/create"
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full text-base font-bold bg-violet-500 text-white border border-violet-500 shadow-sm transition-all hover:bg-violet-600"
            >
              <Plus className="w-4 h-4" />
              새 카드뉴스
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 py-8 pt-28">
        {/* 페이지 타이틀 */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium text-primary mb-4">
            <Library className="w-4 h-4" />
            내 라이브러리
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            저장된 <span className="bg-gradient-to-r from-violet-400 via-pink-500 to-sky-400 bg-clip-text text-transparent">카드뉴스</span>
          </h1>
          <p className="mt-2 text-slate-500">
            {items.length > 0
              ? `총 ${items.length}개의 카드뉴스가 저장되어 있습니다`
              : "아직 저장된 카드뉴스가 없습니다"}
          </p>
        </div>

        {/* 빈 상태 */}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-violet-400" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-slate-700 mb-2">아직 저장된 카드뉴스가 없어요</p>
              <p className="text-slate-400 text-sm">카드뉴스를 만들고 라이브러리에 저장해보세요</p>
            </div>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              첫 카드뉴스 만들기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* 카드 그리드 */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => {
              const styleInfo = STYLE_LABELS[item.style] ?? STYLE_LABELS.minimal
              const isDel = deletingId === item.id
              return (
                <div
                  key={item.id}
                  className={cn(
                    "group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg shadow-slate-100/80 overflow-hidden transition-all duration-300",
                    isDel ? "opacity-0 scale-95" : "hover:shadow-xl hover:-translate-y-1"
                  )}
                >
                  {/* 썸네일 */}
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                    {item.thumbnail ? (
                      <>
                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20" />
                      </>
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: item.slides[0]?.bgStyle?.background || "#1a1a2e" }}
                      >
                        <Layers className="w-12 h-12 text-white/30" />
                      </div>
                    )}

                    {/* 슬라이드 수 배지 */}
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-bold"
                      style={{ backgroundColor: "rgba(0,0,0,0.4)", color: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)" }}>
                      {item.slides.length}장
                    </div>

                    {/* 첫 슬라이드 텍스트 미리보기 */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                      {item.slides[0]?.subtitle && (
                        <p className="text-[10px] text-white/70 mb-1">{item.slides[0].subtitle}</p>
                      )}
                      <p className="text-sm font-bold text-white leading-tight line-clamp-2 whitespace-pre-line">
                        {item.slides[0]?.title || item.title}
                      </p>
                    </div>

                    {/* 호버 시 다운로드 오버레이 버튼 */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => setDownloadItem(item)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 text-slate-800 text-sm font-bold shadow-lg hover:bg-white transition-all hover:scale-105"
                      >
                        <Download className="w-4 h-4" />
                        다운로드 · 공유
                      </button>
                    </div>
                  </div>

                  {/* 카드 정보 */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">{item.title}</p>
                        {item.originalTopic && item.originalTopic !== item.title && (
                          <p className="text-xs text-slate-400 truncate mt-0.5">{item.originalTopic}</p>
                        )}
                      </div>
                      <span className={cn("shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border", styleInfo.color)}>
                        {styleInfo.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
                      <Clock className="w-3 h-3" />
                      {formatDate(item.updatedAt)}
                      {item.updatedAt !== item.createdAt && (
                        <span className="text-slate-300 ml-1">(수정됨)</span>
                      )}
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl bg-violet-50 text-violet-600 border border-violet-200 text-xs font-semibold hover:bg-violet-100 transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        수정하기
                      </button>
                      <button
                        onClick={() => setDownloadItem(item)}
                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 transition-all shrink-0"
                        title="다운로드 · 공유"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-red-50 text-red-400 border border-red-100 hover:bg-red-100 transition-all shrink-0"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* 새 카드뉴스 추가 카드 */}
            <Link
              href="/create"
              className="group flex flex-col items-center justify-center aspect-[1/1.15] rounded-2xl border-2 border-dashed border-slate-200 hover:border-violet-300 hover:bg-violet-50/50 transition-all text-slate-400 hover:text-violet-500"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-100 group-hover:bg-violet-100 flex items-center justify-center mb-3 transition-all">
                <Plus className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold">새 카드뉴스</p>
              <p className="text-xs mt-1 opacity-70">만들기</p>
            </Link>
          </div>
        )}
      </main>

      {/* 다운로드 모달 */}
      {downloadItem && (
        <DownloadModal
          item={downloadItem}
          onClose={() => setDownloadItem(null)}
          onShare={(url) => {
            setShareUrl(url)
            setShowShareDialog(true)
          }}
        />
      )}

      {/* 공유 다이얼로그 */}
      <ShareDialog open={showShareDialog} onOpenChange={setShowShareDialog} shareUrl={shareUrl} />
    </div>
  )
}
