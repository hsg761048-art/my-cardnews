"use client"

import { Button } from "@/components/ui/button"
import { GlassPanel } from "@/components/glass-panel"
import { cn } from "@/lib/utils"

interface EditorCardProps {
  dark?: boolean
}

export function EditorCard({ dark = true }: EditorCardProps) {
  const textColor = dark ? "text-white" : "text-slate-800"
  const textMuted = dark ? "text-white/60" : "text-slate-500"
  const textSecondary = dark ? "text-white/80" : "text-slate-600"
  const borderColor = dark ? "border-white/10" : "border-slate-200/50"
  const inputBg = dark ? "bg-white/5" : "bg-white/60"
  const inputBorder = dark ? "border-white/10" : "border-slate-200"
  const inputText = dark ? "text-white placeholder:text-white/40" : "text-slate-800 placeholder:text-slate-400"
  const previewBg = dark 
    ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/20" 
    : "bg-gradient-to-br from-blue-100/50 to-purple-100/50"

  return (
    <GlassPanel 
      intensity="medium" 
      dark={dark}
      className="w-full max-w-4xl p-8 md:p-12"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={cn("text-2xl md:text-3xl font-bold mb-2", textColor)}>
            카드뉴스 에디터
          </h1>
          <p className={cn("text-sm md:text-base", textMuted)}>
            AI가 당신의 아이디어를 멋진 콘텐츠로 변환합니다
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            className={cn(
              dark 
                ? "text-white/70 hover:text-white hover:bg-white/10" 
                : "text-slate-600 hover:text-slate-800 hover:bg-slate-100/50"
            )}
          >
            저장
          </Button>
          <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0">
            내보내기
          </Button>
        </div>
      </div>

      {/* 에디터 컨텐츠 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 입력 영역 */}
        <div className="space-y-4">
          <label className={cn("block text-sm font-medium mb-2", textSecondary)}>
            콘텐츠 입력
          </label>
          <textarea
            className={cn(
              "w-full h-64 p-4 rounded-2xl resize-none",
              inputBg, inputBorder, inputText,
              "border",
              "focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50",
              "transition-all duration-300"
            )}
            placeholder="여기에 카드뉴스 내용을 입력하세요..."
          />
        </div>

        {/* 미리보기 영역 */}
        <div className="space-y-4">
          <label className={cn("block text-sm font-medium mb-2", textSecondary)}>
            미리보기
          </label>
          <div
            className={cn(
              "w-full h-64 rounded-2xl flex items-center justify-center",
              previewBg,
              "border", borderColor
            )}
          >
            <div className={cn("text-center", textMuted)}>
              <svg
                className="w-12 h-12 mx-auto mb-3 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm">미리보기가 여기에 표시됩니다</p>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 툴바 */}
      <div className={cn("mt-8 pt-6 border-t", borderColor)}>
        <div className="flex flex-wrap items-center gap-3">
          <ToolButton icon="palette" label="스타일" dark={dark} />
          <ToolButton icon="image" label="이미지" dark={dark} />
          <ToolButton icon="type" label="텍스트" dark={dark} />
          <ToolButton icon="layout" label="레이아웃" dark={dark} />
          <ToolButton icon="sparkles" label="AI 추천" active dark={dark} />
        </div>
      </div>
    </GlassPanel>
  )
}

function ToolButton({ 
  icon, 
  label, 
  active = false,
  dark = true
}: { 
  icon: string
  label: string
  active?: boolean
  dark?: boolean
}) {
  const icons: Record<string, React.ReactNode> = {
    palette: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    image: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    type: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
    ),
    layout: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
      </svg>
    ),
    sparkles: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  }

  const baseStyles = dark
    ? "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border-white/10"
    : "bg-slate-100/50 text-slate-600 hover:bg-slate-200/60 hover:text-slate-800 border-slate-200/50"

  return (
    <button
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border",
        active
          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/25 border-transparent"
          : baseStyles
      )}
    >
      {icons[icon]}
      {label}
    </button>
  )
}
