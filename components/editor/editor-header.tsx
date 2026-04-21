"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowLeft, Check, Undo2, Redo2, Library, Save, Eye } from "lucide-react"

interface EditorHeaderProps {
  onSave: () => void
  onExport: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  isSaved: boolean
  slideCount: number
}

export function EditorHeader({
  onSave,
  onExport,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isSaved,
  slideCount,
}: EditorHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 border-b border-white/10 bg-[#0f0f1e]/90 backdrop-blur-xl">
      {/* 왼쪽: 뒤로가기 + 로고 + 라이브러리 */}
      <div className="flex items-center gap-3 flex-1">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
        >
          <Link href="/results">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>

        <Link href="/" className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-white">내 머리속</span>
        </Link>

        <div className="hidden sm:flex items-center gap-1 ml-1 text-white/40 text-xs">
          <span>/</span>
          <span className="text-white/70">에디터</span>
          <span className="ml-2 px-2 py-0.5 rounded-full bg-white/10 text-white/50">
            {slideCount}장
          </span>
        </div>

        {/* 라이브러리 바로가기 */}
        <Link
          href="/library"
          className="hidden md:flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/10 text-xs transition-all"
        >
          <Library className="w-3.5 h-3.5" />
          라이브러리
        </Link>
      </div>

      {/* 가운데: Undo / Redo */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo}
          className="h-8 w-8 rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
          title="실행 취소 (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRedo}
          disabled={!canRedo}
          className="h-8 w-8 rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
          title="다시 실행 (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
      </div>

      {/* 오른쪽: 저장 + 결과 보기 */}
      <div className="flex items-center gap-2 flex-1 justify-end">
        {/* 저장 (라이브러리 저장) */}
        <Button
          onClick={onSave}
          variant="ghost"
          size="sm"
          className={`h-8 px-3 rounded-lg text-sm font-medium transition-all ${
            isSaved
              ? "text-emerald-400"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
          title="저장 (Ctrl+S)"
        >
          {isSaved ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1.5" />
              저장됨
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 mr-1.5" />
              저장
            </>
          )}
        </Button>

        {/* 결과 보기 (저장 + 결과 페이지) */}
        <Button
          onClick={onExport}
          size="sm"
          className="h-8 px-4 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
        >
          <Eye className="w-3.5 h-3.5 mr-1.5" />
          결과 보기
        </Button>
      </div>
    </header>
  )
}
