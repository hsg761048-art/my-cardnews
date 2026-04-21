"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Share2,
  Check,
  Square,
  Image,
  FileArchive,
  Pencil,
  Library,
  BookmarkPlus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { GeneratedCard } from "@/app/results/page"

interface DownloadPanelProps {
  card: GeneratedCard
  onShare: () => void
  slideImages?: Record<number, string>
  onSaveToLibrary?: () => void
  canSave?: boolean
}

const exportFormats = [
  { id: "square", label: "인스타그램 (1:1)", ratio: "1:1", icon: Square },
  { id: "story",  label: "스토리/릴스 (9:16)", ratio: "9:16", icon: Image },
  { id: "blog",   label: "블로그 (16:9)", ratio: "16:9", icon: Image },
]

export function DownloadPanel({
  card,
  onShare,
  slideImages,
  onSaveToLibrary,
  canSave = false,
}: DownloadPanelProps) {
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["square"])
  const [isDownloading, setIsDownloading] = useState(false)
  const [savedToLibrary, setSavedToLibrary] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // 콘텐츠 수정하기 → 에디터로 이동
  const handleEditContent = () => {
    const t = searchParams.get("title") || ""
    const m = searchParams.get("mainCopy") || ""
    try {
      localStorage.setItem("editor-slide-images", JSON.stringify(slideImages ?? {}))
    } catch {}
    router.push(
      `/editor?title=${encodeURIComponent(t)}&mainCopy=${encodeURIComponent(m)}&style=${card.style}`
    )
  }

  // 라이브러리에 저장
  const handleSaveToLibrary = () => {
    onSaveToLibrary?.()
    setSavedToLibrary(true)
    setTimeout(() => setSavedToLibrary(false), 2500)
  }

  const toggleFormat = (formatId: string) => {
    setSelectedFormats(prev =>
      prev.includes(formatId) ? prev.filter(f => f !== formatId) : [...prev, formatId]
    )
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsDownloading(false)
    alert("다운로드 완료! (데모)")
  }

  return (
    <div className="bg-card border border-border p-6 space-y-5 sticky top-24">

      {/* ① 라이브러리 저장 — 가장 위 */}
      <div className="space-y-2">
        <Button
          onClick={handleSaveToLibrary}
          disabled={!canSave || savedToLibrary}
          className={cn(
            "w-full h-12 rounded-none font-bold text-sm transition-all",
            savedToLibrary
              ? "bg-emerald-500 text-white hover:bg-emerald-500"
              : "bg-violet-500 text-white hover:bg-violet-600"
          )}
        >
          {savedToLibrary ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              라이브러리에 저장됨
            </>
          ) : (
            <>
              <BookmarkPlus className="w-4 h-4 mr-2" />
              라이브러리에 저장
            </>
          )}
        </Button>

        {savedToLibrary && (
          <Link
            href="/library"
            className="flex items-center justify-center gap-1.5 text-xs text-violet-500 hover:text-violet-700 font-medium transition-colors"
          >
            <Library className="w-3 h-3" />
            라이브러리 보러 가기
          </Link>
        )}
      </div>

      <div className="border-t border-border" />

      {/* ② 콘텐츠 수정하기 */}
      <button
        onClick={handleEditContent}
        className="w-full flex items-center gap-3 p-3.5 border border-border hover:border-foreground/50 hover:bg-muted/50 transition-all text-left group"
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
          <Pencil className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">콘텐츠 수정하기</p>
          <p className="text-xs text-muted-foreground mt-0.5">텍스트·배경·폰트 직접 편집</p>
        </div>
      </button>

      <div className="border-t border-border" />

      {/* ③ 내보내기 형식 선택 */}
      <div>
        <h3 className="font-medium text-foreground mb-3 text-sm">내보내기 형식</h3>
        <div className="space-y-2">
          {exportFormats.map((format) => (
            <button
              key={format.id}
              onClick={() => toggleFormat(format.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 border transition-all text-left",
                selectedFormats.includes(format.id)
                  ? "border-foreground bg-muted"
                  : "border-border hover:border-foreground/50 hover:bg-muted/50"
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 border-2 flex items-center justify-center shrink-0 transition-all",
                  selectedFormats.includes(format.id)
                    ? "border-foreground bg-foreground"
                    : "border-muted-foreground/50"
                )}
              >
                {selectedFormats.includes(format.id) && (
                  <Check className="w-2.5 h-2.5 text-background" />
                )}
              </div>
              <format.icon className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground flex-1">{format.label}</p>
              <span className="text-xs text-muted-foreground border border-border px-2 py-0.5">
                {format.ratio}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 요약 */}
      <div className="p-3 bg-muted/50 border border-border text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">총 슬라이드</span>
          <span className="font-medium text-foreground">{card.slides.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">선택된 형식</span>
          <span className="font-medium text-foreground">{selectedFormats.length}</span>
        </div>
        <div className="flex items-center justify-between pt-1.5 border-t border-border">
          <span className="text-muted-foreground">총 파일 수</span>
          <span className="font-medium text-foreground">
            {card.slides.length * selectedFormats.length}
          </span>
        </div>
      </div>

      {/* ④ 다운로드 */}
      <Button
        onClick={handleDownload}
        disabled={selectedFormats.length === 0 || isDownloading}
        className="w-full h-11 rounded-none bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
      >
        {isDownloading ? (
          <>
            <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin mr-2" />
            다운로드 준비 중...
          </>
        ) : (
          <>
            <FileArchive className="w-4 h-4 mr-2" />
            ZIP 다운로드
          </>
        )}
      </Button>

      {/* ⑤ 공유 */}
      <Button
        variant="outline"
        onClick={onShare}
        className="w-full h-10 rounded-none border-border hover:bg-muted hover:text-foreground"
      >
        <Share2 className="w-4 h-4 mr-2" />
        공유 링크 생성
      </Button>

      {/* 라이브러리 바로가기 */}
      <div className="pt-2 border-t border-border">
        <Link
          href="/library"
          className="w-full flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Library className="w-3.5 h-3.5" />
          내 라이브러리 보기
        </Link>
      </div>
    </div>
  )
}
